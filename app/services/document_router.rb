# app/services/document_router.rb
class DocumentRouter
  DOCUMENT_CONFIGS = {
    'DFD'                   => DocumentConfigs::Dfd,
    'ETP'                   => DocumentConfigs::Etp,
    'MAPA_DE_RISCO'         => DocumentConfigs::MapaDeRisco,
    'TERMO_DE_REFERENCIA'   => DocumentConfigs::TermoDeReferencia,
    'PESQUISA_DE_PRECO'     => DocumentConfigs::PesquisaDePreco,
    'ESTUDO_DE_VIABILIDADE' => DocumentConfigs::EstudoDeViabilidade
  }.freeze

  def self.generate(document_type:, raw_input:, user_context: {})
    config = DOCUMENT_CONFIGS[document_type] \
      || raise(ArgumentError, "Tipo de documento desconhecido: #{document_type}")

    pipeline = DocumentPipeline.new(config: config)

    pipeline
      .step(:extract,  -> { Extractor.run(raw_input, config.extraction_schema) })
      .step(:validate, ->(data) { Validator.run(data, config.required_fields) })
      .step(:enrich,   ->(data) { Enricher.run(data, config.enrichment_sources) })
      .step(:generate, ->(data) { Generator.run(data, config.master_prompt) })
      .step(:check,    ->(doc)  { QualityChecker.run(doc, config.checklist) })
      .run
  rescue PipelineError => e
    # Devolve PipelineResult de falha em vez de deixar a exceção subir
    PipelineResult.failure(
      errors: e.errors,
      status: :"#{e.step}_failed"
    )
  rescue ArgumentError => e
    PipelineResult.failure(
      errors: [e.message],
      status: :invalid_document_type
    )
  end
end
