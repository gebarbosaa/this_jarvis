import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import { todayISODate } from '@/lib/date';
import {
  chamarIA,
  extrairTexto,
  extrairChamadasDeFerramenta,
  extrairConteudoDoModelo,
} from '@/lib/ai/gemini';

const SYSTEM_PROMPT = `Você é a Secretária, uma assistente pessoal organizada, direta e gentil.
Você tem ferramentas reais para criar tarefas, hábitos, notas, lembretes e objetivos
diretamente no app do usuário — use-as sempre que ele pedir algo que se encaixe
("me lembra de...", "cria uma tarefa para...", "quero criar o hábito de...").
Não pergunte confirmação antes de usar uma ferramenta quando o pedido já é claro.
Depois de usar uma ferramenta, confirme em uma frase curta o que foi criado.
Hoje é ${todayISODate()}. Responda sempre em português, de forma curta e direta.`;

const TOOLS = [
  {
    name: 'criar_tarefa',
    description: 'Cria uma tarefa para o usuário.',
    input_schema: {
      type: 'object',
      properties: {
        title: { type: 'string', description: 'Título da tarefa' },
        due_date: { type: 'string', description: 'Data no formato YYYY-MM-DD, se houver' },
        priority: { type: 'string', enum: ['low', 'medium', 'high'] },
      },
      required: ['title'],
    },
  },
  {
    name: 'criar_habito',
    description: 'Cria um novo hábito recorrente para o usuário.',
    input_schema: {
      type: 'object',
      properties: { name: { type: 'string', description: 'Nome do hábito' } },
      required: ['name'],
    },
  },
  {
    name: 'criar_nota',
    description: 'Salva uma nota de texto para o usuário.',
    input_schema: {
      type: 'object',
      properties: {
        title: { type: 'string' },
        content: { type: 'string' },
      },
      required: ['content'],
    },
  },
  {
    name: 'criar_lembrete',
    description: 'Cria um lembrete com data e hora específicas.',
    input_schema: {
      type: 'object',
      properties: {
        title: { type: 'string' },
        remind_at: { type: 'string', description: 'Data e hora em ISO 8601, ex: 2026-09-20T09:00:00' },
      },
      required: ['title', 'remind_at'],
    },
  },
  {
    name: 'criar_objetivo',
    description: 'Cria um novo objetivo/meta de longo prazo para o usuário.',
    input_schema: {
      type: 'object',
      properties: {
        title: { type: 'string' },
        target_date: { type: 'string', description: 'Data alvo YYYY-MM-DD, se houver' },
      },
      required: ['title'],
    },
  },
];

async function executarFerramenta(
  supabase: ReturnType<typeof createClient>,
  userId: string,
  name: string,
  input: Record<string, string>
): Promise<string> {
  switch (name) {
    case 'criar_tarefa': {
      await supabase.from('tasks').insert({
        user_id: userId,
        title: input.title,
        due_date: input.due_date || null,
        priority: (input.priority as 'low' | 'medium' | 'high') || 'medium',
      });
      return `Tarefa "${input.title}" criada.`;
    }
    case 'criar_habito': {
      await supabase.from('habits').insert({ user_id: userId, name: input.name });
      return `Hábito "${input.name}" criado.`;
    }
    case 'criar_nota': {
      await supabase.from('notes').insert({
        user_id: userId,
        title: input.title || '',
        content: input.content,
      });
      return 'Nota salva.';
    }
    case 'criar_lembrete': {
      await supabase.from('reminders').insert({
        user_id: userId,
        title: input.title,
        remind_at: new Date(input.remind_at).toISOString(),
      });
      return `Lembrete "${input.title}" criado.`;
    }
    case 'criar_objetivo': {
      await supabase.from('goals').insert({
        user_id: userId,
        title: input.title,
        target_date: input.target_date || null,
      });
      return `Objetivo "${input.title}" criado.`;
    }
    default:
      return `Ferramenta desconhecida: ${name}`;
  }
}

export async function POST(request: Request) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Não autenticado.' }, { status: 401 });
  }

  const { conversationId, message } = await request.json();

  if (!conversationId || !message?.trim()) {
    return NextResponse.json({ error: 'Mensagem vazia.' }, { status: 400 });
  }

  const { data: conversation } = await supabase
    .from('ai_conversations')
    .select('id')
    .eq('id', conversationId)
    .eq('user_id', user.id)
    .single();

  if (!conversation) {
    return NextResponse.json({ error: 'Conversa inválida.' }, { status: 404 });
  }

  await supabase.from('ai_messages').insert({
    conversation_id: conversationId,
    user_id: user.id,
    role: 'user',
    content: message,
  });

  const { data: historico } = await supabase
    .from('ai_messages')
    .select('role, content')
    .eq('conversation_id', conversationId)
    .order('created_at', { ascending: true })
    .limit(30);

  const mensagensParaApi: Array<{ role?: 'user' | 'assistant'; content?: unknown }> = (historico ?? []).map((m) => ({
    role: m.role === 'assistant' ? 'assistant' as const : 'user' as const,
    content: m.content,
  }));

  const acoesRealizadas: string[] = [];
  let textoResposta = '';

  for (let iteracao = 0; iteracao < 4; iteracao++) {
    let data;
    try {
      data = await chamarIA({
        system: SYSTEM_PROMPT,
        tools: TOOLS,
        messages: mensagensParaApi,
      });
    } catch (err) {
      console.error('[api/ai/chat] Gemini failed', err);
      return NextResponse.json({ error: 'Erro ao falar com a IA.' }, { status: 502 });
    }

    const blocosFerramenta = extrairChamadasDeFerramenta(data);
    textoResposta = extrairTexto(data);

    if (blocosFerramenta.length === 0) {
      break;
    }

    const conteudoModelo = extrairConteudoDoModelo(data);
    mensagensParaApi.push(
      ...conteudoModelo.map((content) => ({
        role: 'assistant' as const,
        content: content.parts,
      }))
    );

    const resultados = await Promise.all(
      blocosFerramenta.map(async (bloco) => {
        const resultado = await executarFerramenta(supabase, user.id, bloco.name, bloco.input);
        acoesRealizadas.push(resultado);
        return {
          role: 'user' as const,
          content: [
            {
              functionResponse: {
                name: bloco.name,
                id: bloco.callId || undefined,
                response: { result: resultado },
              },
            },
          ],
        };
      })
    );

    mensagensParaApi.push(...resultados);
  }

  if (!textoResposta && acoesRealizadas.length > 0) {
    textoResposta = acoesRealizadas.join(' ');
  }

  if (acoesRealizadas.length > 0) {
    ['/inicio', '/tarefas', '/habitos', '/notas', '/lembretes', '/objetivos', '/semana'].forEach((p) =>
      revalidatePath(p)
    );
  }

  await supabase.from('ai_messages').insert({
    conversation_id: conversationId,
    user_id: user.id,
    role: 'assistant',
    content: textoResposta,
  });

  return NextResponse.json({ reply: textoResposta, acoes: acoesRealizadas });
}
