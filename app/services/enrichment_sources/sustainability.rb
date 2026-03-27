# app/services/enrichment_sources/sustainability.rb
#
# Fonte de enriquecimento: normas de sustentabilidade aplicáveis.
# Devolve bloco textual com critérios A3P/PLS relevantes para o objeto.
# Lógica baseada em palavras-chave — sem LLM, custo zero.
#
module EnrichmentSources
  class Sustainability < Base

    CRITERIA = [
      {
        keywords: %w[veículo carro ônibus caminhão frota combustível],
        text: <<~TXT
          Sustentabilidade — Veículos e Combustíveis:
          • Preferência a veículos com menor emissão de CO₂ (Resolução CONAMA 18/1986 e Programa PROCONVE)
          • Combustíveis com menor impacto ambiental (etanol, GNV, elétrico) quando tecnicamente viável
          • Logística reversa de óleo lubrificante e pneus usados (Lei 12.305/2010 — PNRS)
          • Decreto nº 7.746/2012 — critérios de sustentabilidade nas contratações públicas
        TXT
      },
      {
        keywords: %w[papel impressão gráfica],
        text: <<~TXT
          Sustentabilidade — Papel e Impressão:
          • Papel com certificação FSC ou CERFLOR (manejo florestal sustentável)
          • Impressão frente-e-verso como padrão; uso de papel reciclado quando disponível
          • IN SLTI/MPOG nº 1/2010 — critérios de sustentabilidade para bens e serviços
        TXT
      },
      {
        keywords: %w[limpeza conservação higiene produto químico],
        text: <<~TXT
          Sustentabilidade — Limpeza e Conservação:
          • Produtos com menor teor de substâncias tóxicas e biodegradáveis (ANVISA RDC 222/2006)
          • Refil/recarga sempre que disponível para redução de embalagem
          • Destinação correta de resíduos perigosos (embalagens de produtos químicos)
          • IN SLTI/MPOG nº 1/2010
        TXT
      },
      {
        keywords: %w[ti tecnologia computador servidor software sistema],
        text: <<~TXT
          Sustentabilidade — TI Verde:
          • Equipamentos com certificação Energy Star ou similar (eficiência energética)
          • Logística reversa de equipamentos eletrônicos (Lei 12.305/2010 — PNRS)
          • Virtualização e computação em nuvem para redução de consumo de energia
          • IN SGD/ME nº 94/2022 — contratações de soluções de TIC
        TXT
      },
      {
        keywords: %w[obra construção reforma infraestrutura],
        text: <<~TXT
          Sustentabilidade — Obras e Construção:
          • Utilização de materiais locais e regionais (redução de frete e emissões)
          • Eficiência energética e hídrica no projeto (NBR 15575 — ABNT)
          • Destinação correta de resíduos da construção civil (Resolução CONAMA 307/2002)
          • Gestão de áreas de bota-fora e borrow areas (DNIT/IBAMA)
          • Decreto nº 7.746/2012
        TXT
      },
      {
        keywords: %w[alimentação merenda refeição gênero alimentício],
        text: <<~TXT
          Sustentabilidade — Alimentação:
          • Priorização de alimentos orgânicos ou agroecológicos da agricultura familiar (Lei 11.947/2009)
          • Embalagens biodegradáveis ou retornáveis
          • Redução de desperdício alimentar — critérios de aproveitamento integral
        TXT
      }
    ].freeze

    DEFAULT_TEXT = <<~TXT.freeze
      Sustentabilidade — Critérios Gerais (IN SLTI/MPOG nº 1/2010 + Decreto nº 7.746/2012):
      • Preferência, nos critérios de seleção, a bens e serviços que apresentem menor impacto ambiental
      • Uso racional de recursos naturais e redução de resíduos na execução contratual
      • Destinação ambientalmente adequada dos resíduos gerados
      • Conformidade com a Política Nacional de Resíduos Sólidos (Lei 12.305/2010 — PNRS)
    TXT

    def self.call(extracted_data)
      dados  = extracted_data[:dados_extraidos] || {}
      texto  = [
        dados[:objeto_detalhado],
        dados[:objeto],
        dados[:objeto_resumido]
      ].compact.join(" ").downcase

      matched = CRITERIA.select do |criterion|
        criterion[:keywords].any? { |kw| texto.include?(kw) }
      end

      sustainability_text = matched.any? \
        ? matched.map { |c| c[:text] }.join("\n") \
        : DEFAULT_TEXT

      { sustainability: sustainability_text }
    end
  end
end
