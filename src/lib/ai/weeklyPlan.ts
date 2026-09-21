import type { SupabaseClient } from '@supabase/supabase-js';
import { chamarIA, extrairTexto } from './openai';
import { diasDaSemana, toISODate } from '@/lib/date';

export async function gerarPlanoSemanal(
  supabase: SupabaseClient,
  userId: string
): Promise<{ summary: string; focus: string }> {
  const dias = diasDaSemana();
  const inicio = toISODate(dias[0]);
  const fim = toISODate(dias[6]);

  const [{ data: tasks }, { data: habits }, { data: goals }, { data: events }] = await Promise.all([
    supabase
      .from('tasks')
      .select('title, due_date, priority, status')
      .eq('user_id', userId)
      .neq('status', 'archived')
      .gte('due_date', inicio)
      .lte('due_date', fim),
    supabase.from('habits').select('name').eq('user_id', userId).eq('archived', false),
    supabase.from('goals').select('title, target_date').eq('user_id', userId).eq('status', 'active'),
    supabase
      .from('calendar_events')
      .select('title, start_at')
      .eq('user_id', userId)
      .gte('start_at', `${inicio}T00:00:00`)
      .lte('start_at', `${fim}T23:59:59`),
  ]);

  const contexto = JSON.stringify({ tarefas: tasks, habitos: habits, objetivos: goals, eventos: events });

  const data = await chamarIA({
    maxTokens: 500,
    system:
      'Você organiza a semana de um usuário a partir dos dados reais dele. ' +
      'Responda SOMENTE com um JSON válido, sem markdown e sem texto fora do JSON, ' +
      'no formato exato: {"summary": "...", "focus": "..."}. ' +
      '"summary" é um resumo de 2 a 3 frases sobre a carga da semana. ' +
      '"focus" é uma frase curta e prática dizendo em que o usuário deveria focar primeiro. ' +
      'Escreva em português.',
    messages: [{ role: 'user', content: `Dados da semana (${inicio} a ${fim}):\n${contexto}` }],
  });

  const textoBruto = extrairTexto(data) || '{}';

  let plano: { summary?: string; focus?: string };
  try {
    plano = JSON.parse(textoBruto.trim());
  } catch {
    plano = { summary: textoBruto.trim(), focus: '' };
  }

  const summary = plano.summary ?? '';
  const focus = plano.focus ?? '';

  await supabase.from('weekly_plans').upsert(
    {
      user_id: userId,
      week_start_date: inicio,
      summary,
      focus,
      generated_by_ai: true,
    },
    { onConflict: 'user_id,week_start_date' }
  );

  return { summary, focus };
}