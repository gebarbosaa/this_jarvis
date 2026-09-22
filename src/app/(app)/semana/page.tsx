import { createClient } from '@/lib/supabase/server';
import { PageHeader } from '@/components/ui/PageHeader';
import { diasDaSemana, toISODate, formatDiaCurto, todayISODate } from '@/lib/date';

const TIME_ZONE = 'America/Sao_Paulo';
import { WeeklyPlanCard } from './WeeklyPlanCard';

export default async function SemanaPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const dias = diasDaSemana();
  const inicio = toISODate(dias[0]);
  const fim = toISODate(dias[6]);
  const hoje = todayISODate();

  const [{ data: tasks }, { data: events }, { data: reminders }, { data: plano }] = await Promise.all([
    supabase
      .from('tasks')
      .select('*')
      .eq('user_id', user!.id)
      .neq('status', 'archived')
      .gte('due_date', inicio)
      .lte('due_date', fim),
    supabase
      .from('calendar_events')
      .select('*')
      .eq('user_id', user!.id)
      .gte('start_at', `${inicio}T00:00:00-03:00`)
      .lte('start_at', `${fim}T23:59:59-03:00`),
    supabase
      .from('reminders')
      .select('*')
      .eq('user_id', user!.id)
      .is('dismissed_at', null)
      .gte('remind_at', `${inicio}T00:00:00-03:00`)
      .lte('remind_at', `${fim}T23:59:59-03:00`),
    supabase
      .from('weekly_plans')
      .select('summary, focus')
      .eq('user_id', user!.id)
      .eq('week_start_date', inicio)
      .maybeSingle(),
  ]);

  return (
    <>
      <PageHeader title="Semana" />

      <WeeklyPlanCard initialSummary={plano?.summary ?? null} initialFocus={plano?.focus ?? null} />

      <div className="flex flex-col gap-3">
        {dias.map((dia) => {
          const dataISO = toISODate(dia);
          const tarefasDoDia = (tasks ?? []).filter((t) => t.due_date === dataISO);
          const eventosDoDia = (events ?? []).filter((e) =>
            new Date(e.start_at).toLocaleDateString('en-CA', { timeZone: 'America/Sao_Paulo' }) === dataISO
          );
          const lembretesDoDia = (reminders ?? []).filter((r) => new Date(r.remind_at).toLocaleDateString('en-CA', { timeZone: 'America/Sao_Paulo' }) === dataISO);
          const isHoje = dataISO === hoje;
          const temItens = tarefasDoDia.length > 0 || eventosDoDia.length > 0 || lembretesDoDia.length > 0;

          return (
            <div
              key={dataISO}
              className={`rounded-card border p-3 ${isHoje ? 'border-pine bg-pine-light' : 'border-border bg-white'}`}
            >
              <div className="flex items-baseline gap-2">
                <span className={`text-xs font-medium uppercase ${isHoje ? 'text-pine' : 'text-ink-faint'}`}>
                  {formatDiaCurto(dia)}
                </span>
                <span className={`text-sm ${isHoje ? 'font-semibold text-pine' : 'text-ink-soft'}`}>
                  {dia.getDate()}
                </span>
              </div>

              {!temItens && <p className="mt-1 text-sm text-ink-faint">Nada planejado</p>}

              <ul className="mt-1 flex flex-col gap-1">
                {eventosDoDia.map((e) => (
                  <li key={e.id} className="text-sm text-ink">
                    <span className="text-ink-faint">
                      {e.all_day
                        ? 'Dia todo'
                        : new Date(e.start_at).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', timeZone: TIME_ZONE })}
                    </span>{' '}
                    · {e.title}
                  </li>
                ))}
                {lembretesDoDia.map((r) => (
                  <li key={`reminder-${r.id}`} className="text-sm text-ink">
                    <span className="text-ink-faint">
                      {new Date(r.remind_at).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', timeZone: TIME_ZONE })}
                    </span>{' '}
                    · 🔔 {r.title}
                  </li>
                ))}
                {tarefasDoDia.map((t) => (
                  <li key={t.id} className={`text-sm ${t.status === 'done' ? 'text-ink-faint line-through' : 'text-ink'}`}>
                    ✓ {t.title}
                  </li>
                ))}
              </ul>
            </div>
          );
        })}
      </div>
    </>
  );
}