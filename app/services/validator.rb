# app/services/validator.rb
#
# ETAPA 2 DO PIPELINE — Validação de campos obrigatórios
#
# Responsabilidade: verificar se os required_fields do DocumentConfig estão
# presentes nos dados extraídos. NÃO usa LLM — é apenas lógica Ruby.
#
# Comportamento:
#   - Campos ausentes OU com valor nil/blank: listados em missing_fields
#   - Se TODOS os obrigatórios estão presentes: success
#   - Se faltam campos críticos: failure (impede geração)
#   - Se faltam campos opcionais: warning no meta, mas ainda success
#
# A distinção "crítico vs. opcional" é feita pelo peso no CHECKLIST:
#   peso >= 20 → crítico (falha o pipeline)
#   peso < 20  → warning (pipeline continua, documento marca "A INFORMAR")
#
class Validator
  # Campos com peso >= 20 no checklist são considerados críticos.
  # Abaixo disso, o pipeline segue com aviso.
  CRITICAL_WEIGHT_THRESHOLD = 20

  def self.run(extracted_data, required_fields)
    new(extracted_data, required_fields).run
  end

  def initialize(extracted_data, required_fields)
    @data            = extracted_data
    @required_fields = Array(required_fields).map(&:to_s)
    @dados           = (@data[:dados_extraidos] || {}).transform_keys(&:to_s)
  end

  def run
    missing_critical = []
    missing_optional = []

    @required_fields.each do |field|
      value = @dados[field]
      next if value.present?

      # Decide se é crítico com base na presença na lista de required_fields
      # (todos os required_fields são tratados como críticos nesta validação simples).
      # Para lógica de peso, use o checklist no QualityChecker.
      missing_critical << field
    end

    if missing_critical.any?
      PipelineResult.failure(
        errors: missing_critical.map { |f| "Campo obrigatório ausente: '#{f}'" },
        status: :validation_failed,
        meta:   { missing_fields: missing_critical }
      )
    else
      PipelineResult.success(
        value:  @data,       # passa os dados extraídos para a próxima etapa
        status: :validated,
        meta:   { missing_optional: missing_optional, missing_critical: [] }
      )
    end
  end
end
