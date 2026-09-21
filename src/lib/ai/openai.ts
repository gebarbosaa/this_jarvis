const OPENAI_URL = 'https://api.openai.com/v1/responses';
const MODEL = 'gpt-5.6-luna';

export type IAInputMessage = { role?: 'user' | 'assistant' | 'system'; content?: unknown; [key: string]: unknown };
export type IATool = { name: string; description: string; input_schema: Record<string, unknown> };

export async function chamarIA(params: { system: string; messages: IAInputMessage[]; tools?: IATool[]; maxTokens?: number }) {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) throw new Error('OPENAI_API_KEY não configurada no servidor.');
  const body: Record<string, unknown> = { model: MODEL, instructions: params.system, input: params.messages, max_output_tokens: params.maxTokens ?? 1000 };
  if (params.tools?.length) body.tools = params.tools.map((tool) => ({ type: 'function', name: tool.name, description: tool.description, parameters: tool.input_schema }));
  const res = await fetch(OPENAI_URL, { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + apiKey }, body: JSON.stringify(body) });
  if (!res.ok) { const errorText = await res.text(); throw new Error(`Erro da API da OpenAI (${res.status}): ${errorText}`); }
  return res.json() as Promise<{ output?: Array<Record<string, unknown>>; output_text?: string }>;
}

export function extrairTexto(data: { output?: Array<Record<string, unknown>>; output_text?: string }): string {
  if (data.output_text) return data.output_text;
  return (data.output ?? []).filter((item) => item.type === 'message').flatMap((item) => Array.isArray(item.content) ? item.content : []).filter((part) => part && typeof part === 'object' && (part as Record<string, unknown>).type === 'output_text').map((part) => String((part as Record<string, unknown>).text ?? '')).join('\n');
}

export function extrairChamadasDeFerramenta(data: { output?: Array<Record<string, unknown>> }) {
  return (data.output ?? []).filter((item) => item.type === 'function_call').map((item) => ({ callId: String(item.call_id ?? item.id ?? ''), name: String(item.name ?? ''), input: JSON.parse(String(item.arguments ?? '{}')) as Record<string, string>, outputItem: item }));
}