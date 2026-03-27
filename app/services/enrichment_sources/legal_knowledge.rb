# app/services/enrichment_sources/legal_knowledge.rb
#
# Fonte de enriquecimento: base normativa verificada.
# Devolve os artigos, incisos, acórdãos TCU e instruções normativas
# relevantes para cada tipo de documento, sem depender de LLM
# (conhecimento embutido no código — rastreável e auditável).
#
# Regra de ouro: APENAS normas verificadas e vigentes em 2025.
# Nunca inventar número de artigo ou acórdão.
#
module EnrichmentSources
  class LegalKnowledge < Base

    # Blocos reutilizáveis por tema
    BLOCKS = {
      lei_14133_principios: <<~TXT,
        Lei nº 14.133/2021 — Princípios:
        Art. 5º — princípios da legalidade, impessoalidade, moralidade, publicidade,
        eficiência, interesse público, probidade administrativa, igualdade, planejamento,
        transparência, eficácia, segregação de funções, motivação, vinculação ao edital,
        julgamento objetivo, segurança jurídica, razoabilidade, competitividade,
        proporcionalidade, celeridade, economicidade e duração razoável do processo.
      TXT

      lei_14133_art18: <<~TXT,
        Lei nº 14.133/2021 — Art. 18 (ETP):
        O ETP deve conter: I-descrição da necessidade; II-alinhamento ao planejamento;
        III-requisitos da contratação; IV-estimativa das quantidades; V-levantamento de
        mercado e análise de alternativas; VI-estimativa do valor; VII-descrição da solução;
        VIII-justificativa do parcelamento ou não; IX-contratações correlatas;
        X-impactos ambientais; XI-resultados pretendidos; XII-providências prévias.
        §1º — declaração de viabilidade ou inviabilidade da contratação.
        §2º — se inviável, o processo é encerrado ou suspenso.
      TXT

      lei_14133_art23: <<~TXT,
        Lei nº 14.133/2021 — Art. 23 (Pesquisa de Preços):
        §1º — o valor estimado será calculado pela média ou mediana das cotações obtidas.
        §2º — a pesquisa deve consultar: I-painel de preços federal; II-preços de contratos
        vigentes de outros entes; III-pesquisa publicada em mídia especializada; IV-cotação
        com fornecedores; V-pesquisa na internet, vedado uso de fonte única.
      TXT

      lei_14133_art40: <<~TXT,
        Lei nº 14.133/2021 — Art. 40 (Parcelamento):
        §1º — o objeto deve ser dividido em tantas parcelas quantas se comprovem técnica e
        economicamente viáveis, com vistas a ampliar a competição e reduzir os riscos.
        §2º — a não divisão em parcelas deverá ser justificada no processo.
      TXT

      lei_14133_art6_xxiii: <<~TXT,
        Lei nº 14.133/2021 — Art. 6º, XXIII (Termo de Referência):
        Documento elaborado a partir dos estudos técnicos preliminares que contenha os
        parâmetros e elementos descritores necessários à caracterização do objeto e das
        condições de contratação.
      TXT

      lei_14133_art12_pca: <<~TXT,
        Lei nº 14.133/2021 — Art. 12, §1º (Plano de Contratações Anual):
        §1º — A Administração deverá elaborar plano anual de contratações, com o objetivo
        de racionalizar as contratações dos órgãos e entidades sob sua competência.
        IN SEGES/ME nº 40/2020 — regulamenta a elaboração do PCA.
      TXT

      lei_14133_art18_riscos: <<~TXT,
        Lei nº 14.133/2021 — Art. 18, §1º (Gestão de Riscos):
        O ETP pode incluir mapa de riscos com a identificação e análise de riscos
        que possam comprometer o sucesso da licitação e a boa execução contratual.
        Guia de Gestão de Riscos TCU (2018) — metodologia de identificação, análise
        qualitativa (probabilidade × impacto) e plano de tratamento.
      TXT

      acordaos_tcu_gerais: <<~TXT,
        Acórdãos TCU verificados:
        • Acórdão 1.521/2013-Plenário — precisão na definição do objeto licitado
        • Acórdão 2.170/2007-Plenário — vedação à restrição indevida à competição
        • Acórdão 1.214/2013-Plenário — metodologia de pesquisa de preços; cesta de preços
        • Acórdão 1.599/2021-Plenário — superdimensionamento de quantidades ("jogo de planilha")
        • Acórdão 2.637/2015-Plenário — proporcionalidade nos requisitos de habilitação
        • Acórdão 1.827/2008-Plenário — necessidade de memória de cálculo nas estimativas
      TXT

      in_seges_58_etp: <<~TXT,
        IN SEGES/ME nº 58/2022 — regulamenta o ETP no âmbito da Lei 14.133/2021.
        Art. 7º — conteúdo mínimo do ETP (12 seções obrigatórias).
        Art. 8º — aprovação do ETP pela autoridade competente antes de iniciar o processo.
      TXT

      in_seges_65_pesquisa: <<~TXT,
        IN SEGES/ME nº 65/2021 — Pesquisa de Preços:
        Art. 5º — fontes prioritárias: Painel de Preços, PNCP, atas de registro de preço,
        contratos vigentes de outros entes, pesquisa em fornecedores e mídia especializada.
        Art. 6º — metodologia: média ou mediana; expurgo de outliers acima de 1,5× desvio padrão.
        Art. 7º — validade da pesquisa: 180 dias.
      TXT

      lei_8987_concessoes: <<~TXT,
        Lei nº 8.987/1995 — Regime de Concessão e Permissão:
        Art. 1º — regula concessões de serviços e obras públicas.
        Art. 18 — exigências do edital de concessão.
        Lei nº 11.079/2004 — Parcerias Público-Privadas (PPP).
      TXT
    }.freeze

    # Mapeamento: nome do enrichment_source → blocos legais relevantes
    SOURCE_MAP = {
      legal_dfd:           %i[lei_14133_principios lei_14133_art12_pca],
      legal_etp:           %i[lei_14133_principios lei_14133_art18 lei_14133_art23
                               lei_14133_art40 in_seges_58_etp acordaos_tcu_gerais],
      legal_riscos:        %i[lei_14133_principios lei_14133_art18_riscos acordaos_tcu_gerais],
      legal_tr:            %i[lei_14133_principios lei_14133_art6_xxiii lei_14133_art40
                               acordaos_tcu_gerais],
      legal_concessoes:    %i[lei_14133_principios lei_8987_concessoes],
      pca_verification:    %i[lei_14133_art12_pca],
      sustainability_norms: [],  # tratado pelo EnrichmentSources::Sustainability
      acordaos_riscos:     %i[lei_14133_art18_riscos acordaos_tcu_gerais]
    }.freeze

    def self.call(extracted_data, source_key:)
      block_keys = SOURCE_MAP.fetch(source_key, [])
      legal_text = block_keys.map { |k| BLOCKS[k] }.compact.join("\n\n")

      { legal: legal_text }
    end
  end
end
