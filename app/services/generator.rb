# app/services/generator.rb
#
# ETAPA 4 DO PIPELINE — Geração do documento final
#
# Responsabilidade: invocar o master_prompt do DocumentConfig com os dados
# enriquecidos e chamar o LLM para produzir o documento completo.
#
# O master_prompt é um callable (Proc/lambda) definido em cada DocumentConfig.
# Assinatura esperada: ->(extracted_data, enriched_context) { "..." }
#
# Usa streaming quando disponível (websockets/ActionCable) ou modo síncrono
# para requisições HTTP padrão.
#
class Generator
  GENERATION_MODEL = "google/gemini-2.5-pro".freeze
  MAX_TOKENS_DOC   = 16_384  # documentos chegam a 30-40 páginas

  SYSTEM_INSTRUCTION = <<~SYS.freeze
    Você é o "LicitGov AI", especialista em elaboração de documentos oficiais de
    contratação pública conforme a Lei nº 14.133/2021.

    REGRAS ABSOLUTAS:
    1. O documento começa DIRETO no cabeçalho oficial. ZERO apresentações da IA.
    2. Use "A INFORMAR" onde o dado não foi fornecido — NUNCA invente.
    3. Cite APENAS leis, artigos e acórdãos presentes no bloco de referências verificadas.
    4. Cada seção: mínimo 3 parágrafos com fundamentação legal, análise e conclusão.
    5. Não use colchetes [] no documento final — substitua pelos dados reais ou "A INFORMAR".
    6. Linguagem técnica, impessoal, terceira pessoa. Vocabulário jurídico-administrativo.
    7. Valores monetários: use exatamente os dados extraídos.
  SYS

  def self.run(enriched_data, master_prompt_callable)
    new(enriched_data, master_prompt_callable).run
  end

  def initialize(enriched_data, master_prompt_callable)
    @data             = enriched_data
    @prompt_callable  = master_prompt_callable
  end

  def run
    extracted = @data[:dados_extraidos]   || {}
    context   = @data[:enriched_context]  || {}

    user_prompt = @prompt_callable.call(
      { dados_extraidos: extracted, campos_ausentes: @data[:campos_ausentes] || [] },
      context
    )

    response = LlmClient.call(
      prompt:      user_prompt,
      system:      SYSTEM_INSTRUCTION,
      model:       GENERATION_MODEL,
      temperature: 0.4,
      max_tokens:  MAX_TOKENS_DOC
    )

    doc = response[:text]

    if doc.blank?
      return PipelineResult.failure(
        errors: ["Generator devolveu documento vazio."],
        status: :generation_empty
      )
    end

    PipelineResult.success(
      value:  doc,
      status: :generated,
      meta:   {
        tokens:        response[:tokens],
        model:         response[:model],
        missing_count: (@data[:campos_ausentes] || []).size
      }
    )
  rescue LlmClient::ApiError => e
    PipelineResult.failure(
      errors: ["Falha na API durante geração: #{e.message}"],
      status: :generation_api_error
    )
  rescue => e
    PipelineResult.failure(
      errors: ["Erro inesperado no Generator: #{e.message}"],
      status: :generation_error
    )
  end
end
