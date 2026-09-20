const ANTHROPIC_URL = 'https://api.anthropic.com/v1/messages';
const MODEL = 'claude-sonnet-4-6';

export type AnthropicMessage = { role: 'user' | 'assistant'; content: unknown };

export async function chamarClaude(params: {
  system: string;
  messages: AnthropicMessage[];
  tools?: unknown[];
  maxTokens?: number;
}) {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    throw new Error('ANTHROPIC_API_KEY não configurada no servidor.');
  }

  const res = await fetch(ANTHROPIC_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: MODEL,
      max_tokens: params.maxTokens ?? 1000,
      system: params.system,
      tools: params.tools,
      messages: params.messages,
    }),
  });

  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`Erro da API da Anthropic (${res.status}): ${errorText}`);
  }

  return res.json();
}

export function extrairTexto(data: { content?: Array<{ type: string; text?: string }> }): string {
  return (data.content ?? [])
    .filter((b) => b.type === 'text')
    .map((b) => b.text ?? '')
    .join('\n');
}