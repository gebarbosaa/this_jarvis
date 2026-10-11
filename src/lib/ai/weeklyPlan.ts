import type { SupabaseClient } from '@supabase/supabase-js';
import { chamarIA, extrairTexto } from './gemini';
import { diasDaSemana, toISODate } from '@/lib/date';

export async function gerarPlanoSemanal(
  supabase: SupabaseClient,
  userId: string
): Promise<{ summary: string; focus: string }> {
  const dias = diasDaSemana();
  const inicio = toISODate(dias[0]);
  const fim = toISODate(dias[6]);

  const [tasksResult, habitsResult, goalsResult, eventsResult] = await Promise.all([
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
      .gte('start_at', `${inicio}T00:00:00-03:00`)
      .lte('start_at', `${fim}T23:59:59.999-03:00`),
  ]);

  const erroConsulta = [tasksResult.error, habitsResult.error, goalsResult.error, eventsResult.error].find(Boolean);
  if (erroConsulta) {
    console.error('[weekly-plan] Falha ao consultar dados da semana', erroConsulta);
    throw new Error('Não foi possível carregar todos os dados para o plano semanal.');
  }

  const contexto = JSON.stringify({
    tarefas: tasksResult.data ?? [],
    habitos: habitsResult.data ?? [],
    objetivos: goalsResult.data ?? [],
    eventos: eventsResult.data ?? [],
  });

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

  const { error: erroSalvamento } = await supabase.from('weekly_plans').upsert(
    {
      user_id: userId,
      week_start_date: inicio,
      summary,
      focus,
      generated_by_ai: true,
    },
    { onConflict: 'user_id,week_start_date' }
  );

  if (erroSalvamento) {
    console.error('[weekly-plan] Falha ao salvar o plano semanal', erroSalvamento);
    throw new Error('Não foi possível salvar o plano semanal.');
  }

  return { summary, focus };
}