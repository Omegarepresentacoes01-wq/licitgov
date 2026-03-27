# app/services/quality_checker.rb
#
# ETAPA 5 DO PIPELINE — Verificação de qualidade
#
# Responsabilidade: executar o CHECKLIST do DocumentConfig contra o documento
# gerado e calcular um score de 0–100.
#
# Cada item do checklist tem:
#   field:  campo a verificar (String — seção do doc ou campo extraído)
#   rule:   símbolo ou lambda (resolvido pelo ChecklistRules.resolve)
#   weight: peso em pontos (soma de todos os pesos = 100)
#
# Resultado:
#   score >= 70  → success (documento aprovado)
#   score < 70   → failure com lista de itens que falharam
#
# O campo verificado pode ser:
#   a) Uma seção do documento gerado (extraída por regex do texto)
#   b) Um campo dos dados extraídos (dados_extraidos hash)
#   c) O documento inteiro (para regras como :all_12_sections)
#
class QualityChecker
  APPROVAL_THRESHOLD = 70  # score mínimo para aprovar o documento

  def self.run(document, checklist)
    new(document, checklist).run
  end

  # @param document  [String] texto do documento gerado pelo Generator
  # @param checklist [Array<Hash>] lista de itens { field:, rule:, weight: }
  def initialize(document, checklist)
    @document  = document.to_s
    @checklist = Array(checklist)
  end

  def run
    results = evaluate_checklist
    score   = calculate_score(results)
    failed  = results.select { |r| !r[:passed] }

    if score >= APPROVAL_THRESHOLD
      PipelineResult.success(
        value:  @document,
        status: :approved,
        meta:   {
          quality_score: score,
          checklist:     results,
          failed_items:  failed
        }
      )
    else
      PipelineResult.failure(
        errors: failed.map { |f| "#{f[:field]}: #{f[:rule_name]} falhou (peso #{f[:weight]})" },
        status: :quality_failed,
        meta:   {
          quality_score: score,
          checklist:     results,
          failed_items:  failed
        }
      )
    end
  end

  private

  def evaluate_checklist
    @checklist.map do |item|
      field     = item[:field].to_s
      rule      = ChecklistRules.resolve(item[:rule])
      weight    = item[:weight].to_i
      value     = extract_field_value(field)
      passed    = safe_evaluate(rule, value)

      {
        field:     field,
        rule_name: item[:rule].is_a?(Symbol) ? item[:rule].to_s : "custom_rule",
        weight:    weight,
        passed:    passed,
        value_preview: value.to_s.truncate(80)
      }
    end
  end

  # Resolve o valor a ser testado:
  # 1. Tenta extrair a seção do documento por heading markdown
  # 2. Fallback: usa o documento completo (para regras globais)
  def extract_field_value(field)
    normalized = field.downcase.tr("_", " ")

    # Regex para capturar seções markdown: ## X. NOME DA SEÇÃO ... (até próxima seção)
    section_match = @document.match(
      /^#+\s+\d*\.?\s*#{Regexp.escape(normalized)}.*?(?=^#+|\z)/im
    )
    return section_match[0].strip if section_match

    # Campos que precisam do documento inteiro (regras globais)
    global_fields = %w[
      secoes_12 leis_verificadas todas_fases_cobertas min_5_riscos
      mitigacao_preenchida responsavel_definido all_12_sections no_invented_laws
    ]
    return @document if global_fields.include?(field)

    # Para campos de dados extraídos (outliers_expurgados, valor_medio_calculado, etc.)
    @document
  end

  def safe_evaluate(rule, value)
    rule.call(value)
  rescue => e
    Rails.logger.warn("[QualityChecker] Regra lançou exceção: #{e.message}")
    false
  end

  def calculate_score(results)
    total_weight = results.sum { |r| r[:weight] }
    return 0 if total_weight.zero?

    earned = results.select { |r| r[:passed] }.sum { |r| r[:weight] }
    ((earned.to_f / total_weight) * 100).round
  end
end
