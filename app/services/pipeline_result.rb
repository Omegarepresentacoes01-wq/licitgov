# app/services/pipeline_result.rb
#
# Objeto de valor retornado por cada etapa do DocumentPipeline.
# Toda etapa deve devolver um PipelineResult (success ou failure).
#
# Uso:
#   PipelineResult.success(value: doc, status: :generated)
#   PipelineResult.failure(errors: ["campo X ausente"], status: :validation_failed)
#
class PipelineResult
  attr_reader :value, :errors, :status, :meta

  def initialize(success:, value: nil, errors: [], status:, meta: {})
    @success = success
    @value   = value
    @errors  = Array(errors)
    @status  = status
    @meta    = meta
  end

  def self.success(value:, status:, meta: {})
    new(success: true, value: value, status: status, meta: meta)
  end

  def self.failure(errors:, status:, meta: {})
    new(success: false, errors: Array(errors), status: status, meta: meta)
  end

  def success? = @success
  def failure? = !@success

  def quality_score
    meta[:quality_score]
  end

  def missing
    meta[:missing_fields] || []
  end

  def to_h
    { success: success?, value: value, errors: errors, status: status, meta: meta }
  end
end
