import type { SupabaseClient } from '@supabase/supabase-js';
import { chamarIA, extrairTexto } from './openai';
import { todayISODate } from '@/lib/date';

/**
 * Analisa o dia do usuário e, se houver algo relevante (atrasos, dia cheio,
 * hábito esquecido), gera uma mensagem curta e proativa da Secretária e
 * salva na conversa mais recente dele. Retorna null quando não há nada
 * relevante a dizer (evita mandar mensagem vazia todo dia).
 */
export async function gerarResumoDiario(
  supabase: SupabaseClient,
  userId: string
): Promise<string | null> {
  const today = todayISODate();

  const [{ data: atrasadas }, { data: tasksHoje }, { data: habits }, { data: logsHoje }, { data: remindersHoje }] =
    await Promise.all([
      supabase
        .from('tasks')
        .select('title')
        .eq('user_id', userId)
        .eq('status', 'pending')
        .lt('due_date', today),
      supabase
        .from('tasks')
        .select('title')
        .eq('user_id', userId)
        .eq('status', 'pending')
        .eq('due_date', today),
      supabase.from('habits').select('id, name').eq('user_id', userId).eq('archived', false),
      supabase.from('habit_logs').select('habit_id').eq('user_id', userId).eq('logged_date', today),
      supabase
        .from('reminders')
        .select('title, remind_at')
        .eq('user_id', userId)
        .is('dismissed_at', null)
        .gte('remind_at', `${today}T00:00:00`)
        .lte('remind_at', `${today}T23:59:59`),
    ]);

  const feitosHojeIds = new Set((logsHoje ?? []).map((l) => l.habit_id));
  const habitosPendentes = (habits ?? []).filter((h) => !feitosHojeIds.has(h.id));

  const temAlgoRelevante =
    (atrasadas?.length ?? 0) > 0 ||
    (tasksHoje?.length ?? 0) >= 3 ||
    (remindersHoje?.length ?? 0) > 0;

  if (!temAlgoRelevante) return null;

  const contexto = JSON.stringify({
    tarefas_atrasadas: atrasadas,
    tarefas_de_hoje: tasksHoje,
    habitos_pendentes_hoje: habitosPendentes.map((h) => h.name),
    lembretes_hoje: remindersHoje,
  });

  const data = await chamarIA({
    maxTokens: 300,
    system:
      'Você é a Secretária, uma assistente pessoal. Escreva UMA mensagem curta (2 a 4 frases), ' +
      'em português, para abrir o dia do usuário com um resumo prático e, se fizer sentido, ' +
      'uma sugestão objetiva de por onde começar. Tom direto e gentil, sem exagero motivacional. ' +
      'Não use markdown.',
    messages: [{ role: 'user', content: `Dados de hoje (${today}):\n${contexto}` }],
  });

  const texto = extrairTexto(data).trim();
  if (!texto) return null;

  const { data: conversaExistente } = await supabase
    .from('ai_conversations')
    .select('id')
    .eq('user_id', userId)
    .order('updated_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  const conversationId =
    conversaExistente?.id ??
    (
      await supabase
        .from('ai_conversations')
        .insert({ user_id: userId, title: 'Conversa com a Secretária' })
        .select('id')
        .single()
    ).data?.id;

  if (!conversationId) return null;

  await supabase.from('ai_messages').insert({
    conversation_id: conversationId,
    user_id: userId,
    role: 'assistant',
    content: texto,
  });

  return texto;
}