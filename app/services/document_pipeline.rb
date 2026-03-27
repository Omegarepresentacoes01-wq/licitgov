# app/services/document_pipeline.rb
class DocumentPipeline
  def initialize(config:)
    @config  = config
    @steps   = []
  end

  def step(name, fn)
    @steps << { name: name, fn: fn }
    self
  end

  # Executa cada step em sequência.
  # O primeiro step não recebe argumento (fn.call).
  # Os demais recebem o .value do step anterior (fn.call(value)).
  # Se qualquer step devolver failure?, levanta PipelineError e encerra.
  #
  # @return [PipelineResult] resultado do último step (aprovado pelo QualityChecker)
  def run
    @steps.reduce(nil) do |prev_result, step|
      result = prev_result.nil? \
        ? step[:fn].call \
        : step[:fn].call(prev_result.value)

      raise PipelineError.new(step[:name], result.errors) if result.failure?

      log_step(step[:name], result)
      result
    end
  end

  private

  def log_step(name, result)
    Rails.logger.info("[DocumentPipeline] step=#{name} status=#{result.status}")
  end
end
