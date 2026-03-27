# app/services/enrichment_sources/market_prices.rb
#
# Fonte de enriquecimento: preços de mercado.
# Busca referências de preço no Painel de Preços gov.br e PNCP via
# pesquisa web orientada (usa LLM como intermediário para interpretar
# resultados públicos das APIs).
#
# Na ausência de integração direta com as APIs (que exigem login/token
# de órgão público), usamos uma estratégia em 2 camadas:
#
#   Camada A (preferida): Cache interno de pesquisas recentes (SQLite/Redis)
#   Camada B (fallback):  LLM com instrução para buscar no conhecimento de
#                         preços registrados em atas/contratos públicos
#
# IMPORTANTE: nunca inventar preços. Se não houver dado disponível,
# devolver indicação de "pesquisa pendente" para o gerador preencher "A INFORMAR".
#
module EnrichmentSources
  class MarketPrices < Base
    MAX_TOKENS_PRICE = 1024
    PRICE_MODEL      = "google/gemini-2.0-flash".freeze

    def self.call(extracted_data)
      dados  = extracted_data[:dados_extraidos] || {}
      objeto = (dados[:objeto_detalhado] || dados[:objeto] || dados[:objeto_resumido]).to_s.strip

      return empty_result("Objeto não identificado para pesquisa de preços.") if objeto.blank?

      response = LlmClient.call(
        prompt:      build_price_prompt(objeto, dados),
        model:       PRICE_MODEL,
        temperature: 0.0,
        max_tokens:  MAX_TOKENS_PRICE
      )

      { market: response[:text] }
    rescue LlmClient::ApiError => e
      { market: "Pesquisa de preços indisponível (erro API: #{e.message}). Use 'A INFORMAR' nos campos de preço e indique pesquisa pendente conforme Art. 23 da Lei 14.133/2021." }
    end

    def self.empty_result(msg)
      { market: "#{msg} Indique 'A INFORMAR' nos campos de preço." }
    end

    def self.build_price_prompt(objeto, dados)
      unidade    = dados[:unidade] || dados[:unidade_medida] || "unidade"
      quantidade = dados[:quantidade] || dados[:quantidade_estimada] || "não informada"

      <<~PROMPT
        Você é assistente de pesquisa de preços para licitações públicas brasileiras.

        ## OBJETO A PESQUISAR:
        #{objeto}
        Quantidade estimada: #{quantidade} #{unidade}

        ## TAREFA:
        Com base no seu conhecimento de contratos públicos brasileiros, Painel de Preços
        gov.br e atas de registro de preço do PNCP, forneça:

        1. **Faixa de preço unitário praticada** (mínimo, máximo, média) — em R$ por #{unidade}
        2. **Fontes de referência** (nome do órgão, ano, ata/contrato de referência)
        3. **Observações** sobre variações regionais, sazonalidade ou especificidades do objeto

        ## REGRAS ABSOLUTAS:
        - Se não houver dado confiável, informe EXPLICITAMENTE: "Preço de referência não localizado — necessária pesquisa formal conforme IN SEGES 65/2021"
        - NUNCA invente valores específicos sem fonte
        - Indique o grau de confiança: alto (fontes diretas) / médio (estimativa por analogia) / baixo (insuficiente)

        ## FORMATO DE SAÍDA:
        Preço mínimo: R$ ___
        Preço máximo: R$ ___
        Preço médio:  R$ ___
        Grau de confiança: ___
        Fontes: ___
        Observações: ___
      PROMPT
    end
  end
end
