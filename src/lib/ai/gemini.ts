const GEMINI_URL = 'https://generativelanguage.googleapis.com/v1beta/models';
const DEFAULT_MODEL = 'gemini-2.5-flash-lite';

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

type GeminiPart = Record<string, unknown>;
type GeminiContent = { role: 'user' | 'model'; parts: GeminiPart[] };

type GeminiResponse = {
  candidates?: Array<{
    content?: GeminiContent;
    finishReason?: string;
  }>;
};

function getModel() {
  return process.env.GEMINI_MODEL || DEFAULT_MODEL;
}

function normalizarConteudo(content: unknown): GeminiPart[] {
  if (typeof content === 'string') return [{ text: content }];
  if (Array.isArray(content)) return content.filter((item) => item && typeof item === 'object') as GeminiPart[];
  if (content && typeof content === 'object' && 'text' in content) return [content as GeminiPart];
  return [{ text: String(content ?? '') }];
}

function prepararHistorico(messages: IAInputMessage[]): GeminiContent[] {
  return messages
    .filter((message) => message.role !== 'system')
    .map((message) => ({
      role: message.role === 'assistant' ? 'model' : 'user',
      parts: normalizarConteudo(message.content),
    }))
    .filter((message) => message.parts.length > 0);
}

export async function chamarIA(params: {
  system: string;
  messages: IAInputMessage[];
  tools?: IATool[];
  maxTokens?: number;
}) {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    throw new Error('GEMINI_API_KEY não configurada no servidor.');
  }

  const body: Record<string, unknown> = {
    contents: prepararHistorico(params.messages),
    systemInstruction: {
      parts: [{ text: params.system }],
    },
    generationConfig: {
      maxOutputTokens: params.maxTokens ?? 1000,
    },
  };

  if (params.tools?.length) {
    body.tools = [
      {
        functionDeclarations: params.tools.map((tool) => ({
          name: tool.name,
          description: tool.description,
          parameters: tool.input_schema,
        })),
      },
    ];
  }

  const response = await fetch(`${GEMINI_URL}/${getModel()}:generateContent`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-goog-api-key': apiKey,
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

    throw new Error(`Erro da API do Gemini (${response.status}): ${detail}`);
  }

  return JSON.parse(raw) as GeminiResponse;
}

export function extrairTexto(data: GeminiResponse): string {
  return (data.candidates ?? [])
    .flatMap((candidate) => candidate.content?.parts ?? [])
    .filter((part) => typeof part.text === 'string')
    .map((part) => String(part.text ?? ''))
    .filter(Boolean)
    .join('\n');
}

export function extrairChamadasDeFerramenta(data: GeminiResponse) {
  return (data.candidates ?? [])
    .flatMap((candidate) => candidate.content?.parts ?? [])
    .filter((part) => part.functionCall && typeof part.functionCall === 'object')
    .map((part) => {
      const functionCall = part.functionCall as Record<string, unknown>;
      const args = functionCall.args && typeof functionCall.args === 'object' && !Array.isArray(functionCall.args)
        ? functionCall.args as Record<string, unknown>
        : {};

      const input = Object.fromEntries(
        Object.entries(args).map(([key, value]) => [key, String(value ?? '')])
      );

      return {
        callId: String(functionCall.id ?? ''),
        name: String(functionCall.name ?? ''),
        input,
      };
    })
    .filter((call) => call.name);
}

export function extrairConteudoDoModelo(data: GeminiResponse): GeminiContent[] {
  return (data.candidates ?? [])
    .map((candidate) => candidate.content)
    .filter((content): content is GeminiContent => Boolean(content?.parts?.length));
}

export function criarRespostasDeFerramenta(
  resultados: Array<{ name: string; callId?: string; output: string }>
): IAInputMessage {
  return {
    role: 'user',
    content: resultados.map((resultado) => ({
      functionResponse: {
        name: resultado.name,
        ...(resultado.callId ? { id: resultado.callId } : {}),
        response: { result: resultado.output },
      },
    })),
  };
}
