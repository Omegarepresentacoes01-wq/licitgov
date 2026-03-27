# app/services/llm_client.rb
#
# Cliente HTTP para a API OpenRouter.
# Suporta chamadas síncronas (JSON) e streaming (SSE).
#
# Uso:
#   result = LlmClient.call(prompt: "...", model: "google/gemini-2.5-pro")
#   result[:text]   # => String com o conteúdo gerado
#   result[:tokens] # => Hash com usage
#
require "net/http"
require "json"
require "uri"

class LlmClient
  ENDPOINT        = "https://openrouter.ai/api/v1/chat/completions".freeze
  DEFAULT_MODEL   = "google/gemini-2.5-pro".freeze
  DEFAULT_TIMEOUT = 120  # segundos

  class ApiError < StandardError
    attr_reader :status_code, :body

    def initialize(msg, status_code: nil, body: nil)
      super(msg)
      @status_code = status_code
      @body        = body
    end
  end

  # Chamada síncrona — devolve o texto completo quando pronto.
  # Ideal para Extractor, Validator e QualityChecker (respostas curtas/JSON).
  #
  # @param prompt      [String]  Prompt do usuário (role: user)
  # @param system      [String]  Instrução de sistema (role: system)
  # @param model       [String]  ID do modelo OpenRouter
  # @param temperature [Float]   0.0 = determinístico, 1.0 = criativo
  # @param max_tokens  [Integer] Limite de tokens na resposta
  # @return [Hash]  { text: String, model: String, tokens: Hash }
  def self.call(prompt:, system: nil, model: DEFAULT_MODEL, temperature: 0.3, max_tokens: 8192)
    messages = []
    messages << { role: "system", content: system } if system.present?
    messages << { role: "user",   content: prompt }

    body = {
      model:       model,
      messages:    messages,
      temperature: temperature,
      max_tokens:  max_tokens,
      stream:      false
    }

    response = post_json(body)
    parse_response(response)
  end

  # Chamada com streaming — yield chunks de texto conforme chegam.
  # Ideal para o Generator (documentos longos, experiência de digitação ao vivo).
  #
  # @param prompt [String]
  # @param system [String]
  # @param model  [String]
  # @yield [chunk] String com cada fragmento recebido
  # @return [String] texto completo acumulado
  def self.stream(prompt:, system: nil, model: DEFAULT_MODEL, temperature: 0.7, max_tokens: 16_384, &block)
    messages = []
    messages << { role: "system", content: system } if system.present?
    messages << { role: "user",   content: prompt }

    body = {
      model:       model,
      messages:    messages,
      temperature: temperature,
      max_tokens:  max_tokens,
      stream:      true
    }

    accumulated = +""
    post_stream(body) do |chunk|
      accumulated << chunk
      block.call(chunk) if block
    end
    accumulated
  end

  private

  def self.api_key
    key = ENV.fetch("OPENROUTER_API_KEY", nil)
    raise ApiError, "OPENROUTER_API_KEY não configurada" if key.blank?
    key
  end

  def self.post_json(body)
    uri  = URI(ENDPOINT)
    http = Net::HTTP.new(uri.host, uri.port)
    http.use_ssl     = true
    http.read_timeout = DEFAULT_TIMEOUT

    req = Net::HTTP::Post.new(uri.path)
    req["Authorization"]  = "Bearer #{api_key}"
    req["Content-Type"]   = "application/json"
    req["HTTP-Referer"]   = "https://licitgov.com.br"
    req["X-Title"]        = "LicitGov"
    req.body = body.to_json

    res = http.request(req)
    raise ApiError.new("HTTP #{res.code}", status_code: res.code.to_i, body: res.body) unless res.is_a?(Net::HTTPSuccess)
    JSON.parse(res.body)
  end

  def self.parse_response(raw)
    choice = raw.dig("choices", 0)
    raise ApiError, "Resposta inesperada da API: #{raw}" if choice.nil?

    {
      text:   choice.dig("message", "content").to_s.strip,
      model:  raw["model"],
      tokens: raw["usage"] || {}
    }
  end

  def self.post_stream(body, &block)
    uri  = URI(ENDPOINT)
    http = Net::HTTP.new(uri.host, uri.port)
    http.use_ssl      = true
    http.read_timeout = DEFAULT_TIMEOUT

    req = Net::HTTP::Post.new(uri.path)
    req["Authorization"] = "Bearer #{api_key}"
    req["Content-Type"]  = "application/json"
    req["HTTP-Referer"]  = "https://licitgov.com.br"
    req["X-Title"]       = "LicitGov"
    req.body = body.to_json

    http.request(req) do |res|
      raise ApiError.new("HTTP #{res.code}", status_code: res.code.to_i) unless res.is_a?(Net::HTTPSuccess)

      res.read_body do |line|
        next if line.strip.empty?
        next unless line.start_with?("data: ")

        data = line.sub(/^data: /, "").strip
        next if data == "[DONE]"

        parsed = JSON.parse(data) rescue next
        chunk  = parsed.dig("choices", 0, "delta", "content").to_s
        block.call(chunk) unless chunk.empty?
      end
    end
  end
end
