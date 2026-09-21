const OPENAI_URL = 'https://api.openai.com/v1/responses';
const DEFAULT_MODEL = 'gpt-5.6-luna';

export type IAInputMessage = {
  role?: 'user' | 'assistant' | 'system';
  content?: unknown;
  [key: string]: unknown;
};

export type IATool = {
  name: string;
  description: string;
  input_schema: Record<string, unknown>;
};

type OpenAIResponse = {
  output?: Array<Record<string, unknown>>;
  output_text?: string;
};

function getModel() {
  return process.env.OPENAI_MODEL || DEFAULT_MODEL;
}

export async function chamarIA(params: {
  system: string;
  messages: IAInputMessage[];
  tools?: IATool[];
  maxTokens?: number;
}) {
  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey) {
    throw new Error('OPENAI_API_KEY não configurada no servidor.');
  }

  const body: Record<string, unknown> = {
    model: getModel(),
    instructions: params.system,
    input: params.messages,
    max_output_tokens: params.maxTokens ?? 1000,
  };

  if (params.tools?.length) {
    body.tools = params.tools.map((tool) => ({
      type: 'function',
      name: tool.name,
      description: tool.description,
      parameters: tool.input_schema,
    }));
  }

  const response = await fetch(OPENAI_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify(body),
    cache: 'no-store',
  });

  const raw = await response.text();

  if (!response.ok) {
    let detail = raw;
    try {
      const parsed = JSON.parse(raw);
      detail = parsed?.error?.message || raw;
    } catch {
      // mantém a resposta original quando não for JSON
    }

    throw new Error(`Erro da API da OpenAI (${response.status}): ${detail}`);
  }

  return JSON.parse(raw) as OpenAIResponse;
}

export function extrairTexto(data: OpenAIResponse): string {
  if (typeof data.output_text === 'string' && data.output_text.trim()) {
    return data.output_text;
  }

  return (data.output ?? [])
    .filter((item) => item.type === 'message')
    .flatMap((item) => (Array.isArray(item.content) ? item.content : []))
    .filter(
      (part) =>
        part &&
        typeof part === 'object' &&
        (part as Record<string, unknown>).type === 'output_text'
    )
    .map((part) => String((part as Record<string, unknown>).text ?? ''))
    .filter(Boolean)
    .join('\n');
}

export function extrairChamadasDeFerramenta(data: OpenAIResponse) {
  return (data.output ?? [])
    .filter((item) => item.type === 'function_call')
    .map((item) => {
      let input: Record<string, string> = {};

      try {
        const parsed = JSON.parse(String(item.arguments ?? '{}'));
        if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
          input = Object.fromEntries(
            Object.entries(parsed).map(([key, value]) => [key, String(value ?? '')])
          );
        }
      } catch {
        // Uma chamada inválida não deve derrubar a conversa inteira.
      }

      return {
        callId: String(item.call_id ?? item.id ?? ''),
        name: String(item.name ?? ''),
        input,
        outputItem: item,
      };
    })
    .filter((call) => call.callId && call.name);
}
