# app/services/enrichment_sources/base.rb
#
# Interface que todas as fontes de enriquecimento devem implementar.
# Cada fonte recebe os dados extraídos e devolve um hash de contexto
# que será mesclado no enriched_context passado ao Generator.
#
module EnrichmentSources
  class Base
    # @param extracted_data [Hash] saída do Extractor (dados_extraidos, campos_ausentes, ...)
    # @return [Hash] contexto de enriquecimento { legal: "...", market: "...", ... }
    def self.call(extracted_data)
      raise NotImplementedError, "#{name} deve implementar .call(extracted_data)"
    end
  end
end
