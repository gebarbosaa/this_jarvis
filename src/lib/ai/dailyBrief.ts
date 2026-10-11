import type { SupabaseClient } from '@supabase/supabase-js';
import { chamarIA, extrairTexto } from './gemini';
import { todayISODate } from '@/lib/date';

/**
 * Analisa o dia do usuário e, se houver algo relevante (atrasos, dia cheio,
 * hábito ainda não registrado ou lembretes), gera uma mensagem curta e proativa
 * e salva na conversa mais recente dele.
 */
export async function gerarResumoDiario(
  supabase: SupabaseClient,
  userId: string
): Promise<string | null> {
  const today = todayISODate();
  // Os lembretes são timestamptz: delimitar explicitamente o dia em São Paulo
  // evita deslocar eventos para ontem/amanhã quando o servidor roda em UTC.
  const inicioHoje = `${today}T00:00:00-03:00`;
  const fimHoje = `${today}T23:59:59.999-03:00`;

  const [atrasadasResult, tasksHojeResult, habitsResult, logsHojeResult, remindersHojeResult] =
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
        .gte('remind_at', inicioHoje)
        .lte('remind_at', fimHoje),
    ]);

  const erroConsulta = [
    atrasadasResult.error,
    tasksHojeResult.error,
    habitsResult.error,
    logsHojeResult.error,
    remindersHojeResult.error,
  ].find(Boolean);
  if (erroConsulta) {
    console.error('[daily-brief] Falha ao consultar dados do usuário', erroConsulta);
    throw new Error('Não foi possível carregar todos os dados para o resumo diário.');
  }

  const atrasadas = atrasadasResult.data ?? [];
  const tasksHoje = tasksHojeResult.data ?? [];
  const habits = habitsResult.data ?? [];
  const logsHoje = logsHojeResult.data ?? [];
  const remindersHoje = remindersHojeResult.data ?? [];
  const feitosHojeIds = new Set(logsHoje.map((l) => l.habit_id));
  const habitosPendentes = habits.filter((h) => !feitosHojeIds.has(h.id));

  const temAlgoRelevante =
    (atrasadas?.length ?? 0) > 0 ||
    (tasksHoje?.length ?? 0) >= 3 ||
    (remindersHoje?.length ?? 0) > 0 ||
    habitosPendentes.length > 0;

  if (!temAlgoRelevante) return null;

  const contexto = JSON.stringify({
    tarefas_atrasadas: atrasadas ?? [],
    tarefas_de_hoje: tasksHoje ?? [],
    habitos_pendentes_hoje: habitosPendentes.map((h) => h.name),
    lembretes_hoje: remindersHoje ?? [],
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

  const { data: conversaExistente, error: erroBuscaConversa } = await supabase
    .from('ai_conversations')
    .select('id')
    .eq('user_id', userId)
    .order('updated_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (erroBuscaConversa) {
    console.error('[daily-brief] Não foi possível buscar conversa existente', erroBuscaConversa);
    return null;
  }

  let conversationId = conversaExistente?.id;
  if (!conversationId) {
    const { data: novaConversa, error: erroConversa } = await supabase
      .from('ai_conversations')
      .insert({ user_id: userId, title: 'Conversa com a Secretária' })
      .select('id')
      .single();

    if (erroConversa) {
      console.error('[daily-brief] Não foi possível criar conversa', erroConversa);
      return null;
    }
    conversationId = novaConversa?.id;
  }

  if (!conversationId) return null;

  const { error: erroMensagem } = await supabase.from('ai_messages').insert({
    conversation_id: conversationId,
    user_id: userId,
    role: 'assistant',
    content: texto,
  });

  if (erroMensagem) {
    console.error('[daily-brief] Não foi possível salvar a mensagem', erroMensagem);
    return null;
  }

  return texto;
}
