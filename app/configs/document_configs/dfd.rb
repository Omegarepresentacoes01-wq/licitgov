# app/configs/document_configs/dfd.rb
# DFD — Documento de Formalização de Demanda
# Base legal: art. 12 §1° Lei 14.133/2021 + IN SEGES/ME 40/2020
module DocumentConfigs
  class Dfd < Base
    REQUIRED_FIELDS = %w[
      secretaria_demandante
      responsavel_nome
      responsavel_cargo
      objeto_resumido
      justificativa_necessidade
      quantidade_estimada
      unidade_medida
      previsao_pca
      dotacao_sugerida
      prazo_necessidade
    ].freeze

    EXTRACTION_SCHEMA = {
      secretaria_demandante:   "Nome da secretaria ou unidade que está demandando",
      responsavel_nome:        "Nome do servidor responsável pela demanda",
      responsavel_cargo:       "Cargo/função do responsável",
      objeto_resumido:         "Descrição sucinta do bem ou serviço demandado",
      justificativa_necessidade: "Por que a secretaria precisa disso",
      quantidade_estimada:     "Quantidade numérica estimada",
      unidade_medida:          "Unidade (litros, unidades, meses, etc.)",
      previsao_pca:            "Se está previsto no PCA e qual o código",
      dotacao_sugerida:        "Classificação orçamentária sugerida",
      prazo_necessidade:       "Quando precisa estar contratado"
    }.freeze

    ENRICHMENT_SOURCES = [:legal_dfd, :pca_verification].freeze

    CHECKLIST = [
      { field: 'responsavel_nome',  rule: :not_blank,                       weight: 25 },
      { field: 'objeto_resumido',   rule: :not_blank,                       weight: 20 },
      { field: 'justificativa_necessidade', rule: ChecklistRules.min_words(50), weight: 20 },
      { field: 'dotacao_sugerida',  rule: :format_dotacao,                  weight: 20 },
      { field: 'previsao_pca',      rule: :not_blank,                       weight: 15 }
    ].freeze

    def self.required_fields    = REQUIRED_FIELDS
    def self.extraction_schema  = EXTRACTION_SCHEMA
    def self.enrichment_sources = ENRICHMENT_SOURCES
    def self.checklist          = CHECKLIST

    def self.master_prompt
      ->(extracted_data, enriched_context) do
        missing = extracted_data[:campos_ausentes] || []
        warning = missing.any? \
          ? "⚠️ CAMPOS AUSENTES — use 'A INFORMAR': #{missing.join(', ')}" \
          : ""

        <<~PROMPT
          #{warning}

          ## DADOS DO PROCESSO:
          #{extracted_data[:dados_extraidos].to_json}

          ## REFERÊNCIAS LEGAIS VERIFICADAS:
          #{enriched_context[:legal]}

          ## MISSÃO:
          Gere um DFD — Documento de Formalização de Demanda — formal e completo.

          ## REGRAS:
          1. "A INFORMAR" onde dado ausente — NUNCA invente
          2. Cite apenas: art. 12 §1° Lei 14.133/2021 e IN SEGES/ME 40/2020
          3. Justificativa mínima de 3 parágrafos
          4. Informar código PCA exato fornecido

          ## ESTRUTURA OBRIGATÓRIA:
          ### CABEÇALHO INSTITUCIONAL
          ### 1. IDENTIFICAÇÃO DA UNIDADE DEMANDANTE
          ### 2. DESCRIÇÃO DO OBJETO DEMANDADO
          ### 3. JUSTIFICATIVA DA NECESSIDADE
          ### 4. QUANTIDADE ESTIMADA E MEMÓRIA DE CÁLCULO
          ### 5. PREVISÃO NO PLANO DE CONTRATAÇÕES ANUAL (PCA)
          ### 6. CLASSIFICAÇÃO ORÇAMENTÁRIA SUGERIDA
          ### 7. PRAZO ESTIMADO PARA CONTRATAÇÃO
          ### 8. SERVIDOR RESPONSÁVEL E ASSINATURA
        PROMPT
      end
    end
  end
end
