# app/services/enricher.rb
#
# ETAPA 3 DO PIPELINE — Enriquecimento de contexto
#
# Responsabilidade: iterar sobre enrichment_sources do DocumentConfig e
# chamar cada fonte, agregando os resultados em um único enriched_context.
#
# O enriched_context tem estrutura:
#   {
#     legal:          "artigos e acórdãos verificados...",
#     market:         "referências de preço...",
#     sustainability: "critérios ambientais..."
#   }
#
# Fontes disponíveis (mapeadas em SOURCE_REGISTRY):
#   :legal_dfd, :legal_etp, :legal_riscos, :legal_tr, :legal_concessoes,
#   :pca_verification, :market_prices, :painel_precos_search, :pncp_search,
#   :sustainability_norms, :acordaos_riscos, :technical_specs,
#   :anp_prices, :market_benchmarks, :legal_ppp
#
class Enricher
  # Mapeia nome da fonte para a classe responsável e parâmetros adicionais.
  SOURCE_REGISTRY = {
    # Fontes legais — mesma classe, chave diferente
    legal_dfd:           { klass: EnrichmentSources::LegalKnowledge, key: :legal_dfd },
    legal_etp:           { klass: EnrichmentSources::LegalKnowledge, key: :legal_etp },
    legal_riscos:        { klass: EnrichmentSources::LegalKnowledge, key: :legal_riscos },
    legal_tr:            { klass: EnrichmentSources::LegalKnowledge, key: :legal_tr },
    legal_concessoes:    { klass: EnrichmentSources::LegalKnowledge, key: :legal_concessoes },
    legal_ppp:           { klass: EnrichmentSources::LegalKnowledge, key: :legal_concessoes },
    pca_verification:    { klass: EnrichmentSources::LegalKnowledge, key: :pca_verification },
    acordaos_riscos:     { klass: EnrichmentSources::LegalKnowledge, key: :acordaos_riscos },

    # Fontes de mercado
    market_prices:       { klass: EnrichmentSources::MarketPrices,   key: nil },
    painel_precos_search:{ klass: EnrichmentSources::MarketPrices,   key: nil },
    pncp_search:         { klass: EnrichmentSources::MarketPrices,   key: nil },
    anp_prices:          { klass: EnrichmentSources::MarketPrices,   key: nil },
    market_benchmarks:   { klass: EnrichmentSources::MarketPrices,   key: nil },

    # Fontes de sustentabilidade
    sustainability_norms: { klass: EnrichmentSources::Sustainability, key: nil },
    technical_specs:      { klass: EnrichmentSources::Sustainability, key: nil }
  }.freeze

  def self.run(extracted_data, enrichment_sources)
    new(extracted_data, enrichment_sources).run
  end

  def initialize(extracted_data, enrichment_sources)
    @data    = extracted_data
    @sources = Array(enrichment_sources)
  end

  def run
    context = { legal: "", market: "", sustainability: "" }
    errors  = []

    @sources.each do |source_name|
      registration = SOURCE_REGISTRY[source_name]

      unless registration
        Rails.logger.warn("[Enricher] Fonte desconhecida ignorada: #{source_name}")
        next
      end

      begin
        result = call_source(registration, @data)
        merge_context(context, result)
      rescue => e
        msg = "Enriquecimento '#{source_name}' falhou: #{e.message}"
        Rails.logger.error("[Enricher] #{msg}")
        errors << msg
        # Continua — enriquecimento parcial é melhor que falha total
      end
    end

    PipelineResult.success(
      value:  @data.merge(enriched_context: context),
      status: :enriched,
      meta:   { enrichment_warnings: errors }
    )
  end

  private

  def call_source(registration, data)
    klass = registration[:klass]
    key   = registration[:key]

    if key
      klass.call(data, source_key: key)
    else
      klass.call(data)
    end
  end

  # Acumula strings (legal, market, sustainability) sem sobrescrever
  def merge_context(context, new_data)
    new_data.each do |k, v|
      next unless v.present?
      context[k] = [context[k], v].reject(&:blank?).join("\n\n")
    end
  end
end
