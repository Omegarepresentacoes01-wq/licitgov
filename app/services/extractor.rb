# app/services/extractor.rb
#
# ETAPA 1 DO PIPELINE — Extração estruturada
#
# Responsabilidade: chamar o LLM com o extraction_prompt para transformar
# o texto bruto colado pelo usuário em um hash estruturado de campos.
#
# Regra de ouro: o extrator NUNCA inventa dados. Se um campo não está
# no texto do usuário, devolve nil e registra em :campos_ausentes.
# A invenção acontece ZERO — deixar o campo ausente é sempre correto.
#
# Retorna PipelineResult com value =
#   {
#     dados_extraidos:  { campo: valor, ... },
#     campos_ausentes:  ["campo_x", ...],
#     confianca:        "alta" | "media" | "baixa",
#     observacoes:      "..."
#   }
#
class Extractor
  EXTRACTION_MODEL   = "google/gemini-2.0-flash".freeze  # rápido para JSON curto
  MAX_TOKENS_EXTRACT = 2048

  def self.run(raw_input, schema)
    new(raw_input, schema).run
  end

  def initialize(raw_input, schema)
    @raw_input = raw_input.to_s.strip
    @schema    = schema
  end

  def run
    return empty_result if @raw_input.empty?

    prompt   = build_prompt
    response = LlmClient.call(
      prompt:      prompt,
      model:       EXTRACTION_MODEL,
      temperature: 0.0,     # extração é determinística
      max_tokens:  MAX_TOKENS_EXTRACT
    )

    parsed = parse_json(response[:text])
    return parse_error(response[:text]) if parsed.nil?

    PipelineResult.success(
      value:  normalize(parsed),
      status: :extracted,
      meta:   { tokens: response[:tokens], model: response[:model] }
    )
  rescue LlmClient::ApiError => e
    PipelineResult.failure(
      errors: ["LlmClient falhou na extração: #{e.message}"],
      status: :extraction_api_error
    )
  rescue => e
    PipelineResult.failure(
      errors: ["Erro inesperado na extração: #{e.message}"],
      status: :extraction_error
    )
  end

  private

  def build_prompt
    fields_list = @schema.map { |k, desc| "- #{k}: #{desc}" }.join("\n")

    <<~PROMPT
      Você é um extrator de dados para documentos de licitação brasileira.

      Leia o texto abaixo e extraia APENAS as informações EXPLICITAMENTE presentes.

      ## CAMPOS A EXTRAIR:
      #{fields_list}

      ## REGRAS ABSOLUTAS:
      - Se uma informação NÃO estiver no texto: retorne null para aquele campo
      - NUNCA infira, estime ou complete com conhecimento próprio
      - NUNCA invente valores, nomes, números ou datas
      - Retorne APENAS JSON válido, sem texto adicional antes ou depois

      ## TEXTO DO USUÁRIO:
      #{@raw_input}

      ## FORMATO DE SAÍDA (JSON puro, sem markdown):
      {
        "dados_extraidos": {},
        "campos_ausentes": [],
        "confianca": "alta | media | baixa",
        "observacoes": ""
      }
    PROMPT
  end

  # Remove blocos ```json ... ``` que alguns modelos insistem em adicionar
  def parse_json(text)
    clean = text.strip.gsub(/\A```(?:json)?\s*/i, "").gsub(/```\z/, "").strip
    JSON.parse(clean)
  rescue JSON::ParserError
    nil
  end

  def parse_error(raw_text)
    PipelineResult.failure(
      errors: ["Extrator não devolveu JSON válido. Resposta: #{raw_text.truncate(300)}"],
      status: :extraction_parse_error
    )
  end

  def empty_result
    PipelineResult.failure(
      errors: ["Texto de entrada vazio — não há o que extrair."],
      status: :extraction_empty_input
    )
  end

  # Garante que dados_extraidos e campos_ausentes sempre existam no hash
  def normalize(parsed)
    {
      dados_extraidos: (parsed["dados_extraidos"] || {}).transform_keys(&:to_sym),
      campos_ausentes: Array(parsed["campos_ausentes"]),
      confianca:       parsed["confianca"] || "baixa",
      observacoes:     parsed["observacoes"].to_s
    }
  end
end
