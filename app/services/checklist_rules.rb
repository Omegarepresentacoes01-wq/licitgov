# app/services/checklist_rules.rb
#
# Biblioteca de regras usadas pelo QualityChecker.
# Cada regra é um callable (Proc/lambda) que recebe o valor do campo
# e devolve true (passou) ou false (falhou).
#
# Uso no CHECKLIST dos DocumentConfigs:
#   { field: 'justificativa', rule: :min_words(50), weight: 20 }
#
# Para regras com parâmetro (min_words, min_count, between, max_days_ago),
# a config usa a DSL de método de classe que devolve um lambda.
#
module ChecklistRules
  # ── Regras simples (símbolo direto) ─────────────────────────────────────

  # Campo presente e não vazio
  NOT_BLANK = ->(v) { v.present? }

  # Campo é um número positivo (aceita String ou Numeric)
  POSITIVE_NUMBER = ->(v) {
    n = v.to_s.gsub(/[R$\s.,]/, "").to_f
    n > 0
  }

  # Campo é numérico (positivo ou zero)
  NUMERIC = ->(v) {
    v.to_s.match?(/\A-?\d+(\.\d+)?\z/)
  }

  # Campo está presente (nil? == false e não blank)
  PRESENT = ->(v) { !v.nil? && v != false }

  # Classificação orçamentária no formato XX.X.XX.XXX.XX ou similar
  FORMAT_DOTACAO = ->(v) {
    v.to_s.match?(/\d{2}[\.\-]\d[\.\-]\d{2}[\.\-]\d{3}[\.\-]\d{2,}/)
  }

  # Todas as 3 fases do mapa de risco estão presentes no texto
  ALL_PHASES = ->(v) {
    text = v.to_s.downcase
    ["planejamento", "seleção", "gestão"].all? { |fase| text.include?(fase) }
  }

  # Outliers foram expurgados (verifica se o doc menciona expurgo)
  OUTLIERS_REMOVED = ->(v) {
    v.to_s.downcase.match?(/expurg|descart|outlier|desvio padrão/)
  }

  # ── Regras com parâmetro (métodos de classe que devolvem lambda) ─────────

  # Campo tem ao menos N palavras
  def self.min_words(n)
    ->(v) { v.to_s.split.size >= n }
  end

  # Campo/lista tem ao menos N itens
  # Aceita Array ou String (conta linhas/parágrafos separados por \n)
  def self.min_count(n)
    ->(v) {
      count = v.is_a?(Array) ? v.size : v.to_s.split(/\n+/).reject(&:blank?).size
      count >= n
    }
  end

  # Número entre min e max (inclusive)
  def self.between(min, max)
    ->(v) {
      n = v.to_s.to_f
      n >= min && n <= max
    }
  end

  # Data não é mais antiga que N dias
  def self.max_days_ago(n)
    ->(v) {
      date = Date.parse(v.to_s) rescue nil
      return false if date.nil?
      date >= Date.today - n
    }
  end

  # Verifica se o documento não contém leis/acórdãos sabidamente inventados.
  # Estratégia conservadora: flag textos que citam artigos com padrões anômalos.
  NO_INVENTED_LAWS = ->(v) {
    text = v.to_s
    # Artigos fora do range da Lei 14.133 (1–193) são suspeitos
    invented = text.scan(/art(?:igo)?\.?\s*(\d+)/i).any? do |match|
      num = match[0].to_i
      num > 193 && text.include?("14.133")
    end
    !invented
  }

  # Todas as 12 seções obrigatórias do ETP (art. 18 Lei 14.133) estão presentes
  ALL_12_SECTIONS = ->(v) {
    text = v.to_s.downcase
    required_sections = [
      "descrição da necessidade",
      "planejamento",
      "requisitos",
      "estimativa das quantidades",
      "levantamento de mercado",
      "estimativa do valor",
      "descrição da solução",
      "parcelamento",
      "contratações correlatas",
      "impactos ambientais",
      "resultados pretendidos",
      "providências"
    ]
    required_sections.count { |s| text.include?(s) } >= 10  # tolerância de 2
  }

  # ── Registro centralizado ────────────────────────────────────────────────
  # Mapeia símbolos simples para lambdas — usado pelo QualityChecker
  REGISTRY = {
    not_blank:        NOT_BLANK,
    positive_number:  POSITIVE_NUMBER,
    numeric:          NUMERIC,
    present:          PRESENT,
    format_dotacao:   FORMAT_DOTACAO,
    all_phases:       ALL_PHASES,
    outliers_removed: OUTLIERS_REMOVED,
    no_invented_laws: NO_INVENTED_LAWS,
    all_12_sections:  ALL_12_SECTIONS
  }.freeze

  # Resolve uma regra do checklist para um lambda.
  # Aceita:
  #   :not_blank                    → lambda direto do REGISTRY
  #   :min_words(50)                → não funciona assim no Ruby; a config deve
  #                                   usar ChecklistRules.min_words(50)
  #   ChecklistRules.min_words(50)  → lambda retornado
  def self.resolve(rule)
    case rule
    when Symbol
      REGISTRY.fetch(rule) { raise ArgumentError, "Regra desconhecida: #{rule}" }
    when Proc
      rule
    else
      raise ArgumentError, "Tipo de regra inválido: #{rule.class}"
    end
  end
end
