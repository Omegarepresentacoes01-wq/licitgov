# app/configs/document_configs/etp.rb
# ETP — Estudo Técnico Preliminar
# Base legal: art. 18 Lei 14.133/2021 + IN SEGES/ME 58/2022
module DocumentConfigs
  class Etp < Base
    REQUIRED_FIELDS = %w[
      processo_numero
      elaborado_por_nome
      elaborado_por_cargo
      elaborado_por_matricula
      secretaria_demandante
      objeto_detalhado
      modalidade_prevista
      criterio_julgamento
      valor_estimado
      quantidade_estimada
      unidade_medida
      codigo_pca
      dotacao_orcamentaria
      natureza_despesa
      fonte_recurso
      prazo_vigencia_meses
      justificativa_nao_parcelamento
      data_elaboracao
    ].freeze

    EXTRACTION_SCHEMA = {
      processo_numero:               "Número do processo administrativo (ex: 01.00.00/2025)",
      objeto_detalhado:              "Descrição completa e precisa do objeto",
      modalidade_prevista:           "Pregão eletrônico, dispensa, inexigibilidade, etc.",
      criterio_julgamento:           "Menor preço, melhor técnica, etc.",
      valor_estimado:                "Valor total estimado em reais",
      quantidade_estimada:           "Quantidade total estimada",
      unidade_medida:                "Unidade de medida",
      secretaria_demandante:         "Secretaria ou órgão demandante",
      elaborado_por_nome:            "Nome completo do servidor elaborador",
      elaborado_por_cargo:           "Cargo/função do elaborador",
      elaborado_por_matricula:       "Matrícula do elaborador",
      dotacao_orcamentaria:          "Classificação orçamentária completa",
      natureza_despesa:              "Código da natureza da despesa (ex: 3.3.90.30.01)",
      fonte_recurso:                 "Fonte de recurso (ex: 0100 - Tesouro Municipal)",
      prazo_vigencia_meses:          "Prazo de vigência do contrato em meses",
      codigo_pca:                    "Código do item no Plano de Contratações Anual",
      historico_consumo:             "Dados históricos de consumo se disponíveis",
      solucoes_avaliadas:            "Soluções de mercado comparadas",
      justificativa_nao_parcelamento:"Justificativa para parcelar ou não parcelar",
      data_elaboracao:               "Data de elaboração do ETP"
    }.freeze

    ENRICHMENT_SOURCES = [
      :legal_etp,
      :market_prices,
      :sustainability_norms
    ].freeze

    CHECKLIST = [
      { field: 'elaborado_por_nome',      rule: :not_blank,        weight: 15 },
      { field: 'elaborado_por_matricula', rule: :not_blank,        weight: 10 },
      { field: 'codigo_pca',              rule: :not_blank,        weight: 15 },
      { field: 'dotacao_orcamentaria',    rule: :format_dotacao,   weight: 10 },
      { field: 'valor_estimado',          rule: :positive_number,  weight: 15 },
      { field: 'secoes_12',               rule: :all_12_sections,  weight: 20 },
      { field: 'leis_verificadas',        rule: :no_invented_laws, weight: 15 }
    ].freeze

    def self.required_fields    = REQUIRED_FIELDS
    def self.extraction_schema  = EXTRACTION_SCHEMA
    def self.enrichment_sources = ENRICHMENT_SOURCES
    def self.checklist          = CHECKLIST

    def self.master_prompt
      ->(extracted_data, enriched_context) do
        missing  = extracted_data[:campos_ausentes] || []
        warning  = missing.any? \
          ? "⚠️ CAMPOS NÃO ENCONTRADOS — escreva 'A INFORMAR': #{missing.join(', ')}" \
          : ""

        <<~PROMPT
          #{warning}

          ## DADOS EXTRAÍDOS DO EDITAL (USE APENAS ESTES):
          #{extracted_data[:dados_extraidos].to_json}

          ## REFERÊNCIAS LEGAIS VERIFICADAS (não cite outras):
          #{enriched_context[:legal]}

          ## DADOS DE MERCADO:
          #{enriched_context[:market]}

          ## SUSTENTABILIDADE:
          #{enriched_context[:sustainability]}

          ## MISSÃO:
          Gere um ETP completo com as 12 seções do art. 18 da Lei 14.133/2021.
          Formato: Markdown com cabeçalhos (##). Mínimo 3 parágrafos por seção.

          ## ESTRUTURA OBRIGATÓRIA:
          ### CABEÇALHO (processo, data, elaborador, matrícula)
          ### 1. DESCRIÇÃO DA NECESSIDADE (art. 18, I)
          ### 2. REFERÊNCIA AOS INSTRUMENTOS DE PLANEJAMENTO (art. 18, II)
          ### 3. REQUISITOS DA CONTRATAÇÃO (art. 18, III)
          ### 4. ESTIMATIVA DAS QUANTIDADES (art. 18, IV)
          ### 5. LEVANTAMENTO DE MERCADO (art. 18, V)
          ### 6. ESTIMATIVA DO VALOR (art. 18, VI)
          ### 7. DESCRIÇÃO DA SOLUÇÃO (art. 18, VII)
          ### 8. PARCELAMENTO OU NÃO DO OBJETO (art. 18, VIII)
          ### 9. CONTRATAÇÕES CORRELATAS (art. 18, IX)
          ### 10. IMPACTOS AMBIENTAIS (art. 18, X)
          ### 11. RESULTADOS PRETENDIDOS (art. 18, XI)
          ### 12. PROVIDÊNCIAS PRÉVIAS (art. 18, XII)
          ### CONCLUSÃO DE VIABILIDADE E ASSINATURAS
        PROMPT
      end
    end
  end
end
