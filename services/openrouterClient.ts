/**
 * openrouterClient.ts
 *
 * Cliente para a API OpenRouter.
 * Suporta chamadas síncronas (JSON completo) e streaming (SSE chunk a chunk).
 */

const ENDPOINT = 'https://openrouter.ai/api/v1/chat/completions';

const API_KEY = import.meta.env.VITE_OPENROUTER_API_KEY as string;

export type OpenRouterModel =
  | 'google/gemini-2.0-flash-001'
  | 'google/gemini-2.5-pro'
  | 'anthropic/claude-sonnet-4-5'
  | 'openai/gpt-4o';

export interface CallOptions {
  prompt: string;
  system?: string;
  model?: OpenRouterModel | string;
  temperature?: number;
  maxTokens?: number;
}

export interface StreamOptions extends CallOptions {
  onChunk: (chunk: string) => void;
}

export interface OpenRouterResponse {
  text: string;
  model: string;
  tokensUsed: number;
}

export class OpenRouterError extends Error {
  constructor(
    message: string,
    public statusCode?: number,
    public body?: string
  ) {
    super(message);
    this.name = 'OpenRouterError';
  }
}

function buildMessages(prompt: string, system?: string) {
  const messages: { role: string; content: string }[] = [];
  if (system) messages.push({ role: 'system', content: system });
  messages.push({ role: 'user', content: prompt });
  return messages;
}

function checkApiKey() {
  if (!API_KEY) {
    throw new OpenRouterError(
      'VITE_OPENROUTER_API_KEY não configurada. Adicione ao arquivo .env'
    );
  }
}

/**
 * Chamada síncrona — retorna o texto completo quando pronto.
 * Use para: extração de dados (JSON curto), enriquecimento de preços.
 */
export async function call(options: CallOptions): Promise<OpenRouterResponse> {
  checkApiKey();

  const {
    prompt,
    system,
    model = 'google/gemini-2.0-flash-001',
    temperature = 0.2,
    maxTokens = 4096,
  } = options;

  const response = await fetch(ENDPOINT, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${API_KEY}`,
      'Content-Type': 'application/json',
      'HTTP-Referer': 'https://licitgov.com.br',
      'X-Title': 'LicitGov',
    },
    body: JSON.stringify({
      model,
      messages: buildMessages(prompt, system),
      temperature,
      max_tokens: maxTokens,
      stream: false,
    }),
  });

  if (!response.ok) {
    const body = await response.text();
    throw new OpenRouterError(`OpenRouter HTTP ${response.status}`, response.status, body);
  }

  const data = await response.json();
  const choice = data?.choices?.[0];
  if (!choice) throw new OpenRouterError(`Resposta inesperada da API: ${JSON.stringify(data)}`);

  return {
    text: (choice.message?.content ?? '').trim(),
    model: data.model ?? model,
    tokensUsed: data.usage?.total_tokens ?? 0,
  };
}

/**
 * Chamada com streaming — chama onChunk para cada fragmento recebido.
 * Use para: geração do documento final (experiência de digitação ao vivo).
 */
export async function stream(options: StreamOptions): Promise<string> {
  checkApiKey();

  const {
    prompt,
    system,
    model = 'google/gemini-2.5-pro',
    temperature = 0.4,
    maxTokens = 16384,
    onChunk,
  } = options;

  const response = await fetch(ENDPOINT, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${API_KEY}`,
      'Content-Type': 'application/json',
      'HTTP-Referer': 'https://licitgov.com.br',
      'X-Title': 'LicitGov',
    },
    body: JSON.stringify({
      model,
      messages: buildMessages(prompt, system),
      temperature,
      max_tokens: maxTokens,
      stream: true,
    }),
  });

  if (!response.ok) {
    const body = await response.text();
    throw new OpenRouterError(`OpenRouter HTTP ${response.status}`, response.status, body);
  }

  const reader = response.body?.getReader();
  if (!reader) throw new OpenRouterError('Stream não disponível');

  const decoder = new TextDecoder();
  let accumulated = '';

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    const lines = decoder.decode(value, { stream: true }).split('\n');

    for (const line of lines) {
      if (!line.startsWith('data: ')) continue;
      const data = line.slice(6).trim();
      if (data === '[DONE]') continue;

      try {
        const parsed = JSON.parse(data);
        const chunk = parsed?.choices?.[0]?.delta?.content ?? '';
        if (chunk) {
          accumulated += chunk;
          onChunk(chunk);
        }
      } catch {
        // linha inválida — ignora
      }
    }
  }

  return accumulated;
}
