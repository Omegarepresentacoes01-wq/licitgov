# app/services/pipeline_error.rb
#
# Raised pelo DocumentPipeline quando uma etapa retorna failure?.
# Carrega o nome do step e os erros para facilitar logging e resposta HTTP.
#
class PipelineError < StandardError
  attr_reader :step, :errors

  def initialize(step, errors)
    @step   = step
    @errors = Array(errors)
    super("Falha na etapa '#{step}': #{@errors.join('; ')}")
  end
end
