# app/configs/document_configs/base.rb
#
# Classe base para todas as configurações de documento.
# Cada subclasse define as constantes e o master_prompt para seu tipo.
#
# master_prompt deve ser um lambda com assinatura:
#   ->(extracted_data, enriched_context) { "string do prompt" }
#
module DocumentConfigs
  class Base
    def self.required_fields    = raise(NotImplementedError)
    def self.extraction_schema  = raise(NotImplementedError)
    def self.enrichment_sources = raise(NotImplementedError)
    def self.checklist          = raise(NotImplementedError)

    # Deve retornar um Proc/lambda: ->(extracted_data, enriched_context) { prompt }
    def self.master_prompt      = raise(NotImplementedError)
  end
end
