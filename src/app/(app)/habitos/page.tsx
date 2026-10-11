import { createClient } from '@/lib/supabase/server';
import { PageHeader } from '@/components/ui/PageHeader';
import { EmptyState } from '@/components/ui/EmptyState';
import { todayISODate } from '@/lib/date';
import { NewHabitForm } from './NewHabitForm';
import { toggleHabitToday } from './actions';

function isoDaysAgo(days: number) {
  const date = new Date();
  date.setHours(12, 0, 0, 0);
  date.setDate(date.getDate() - days);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

function calculateStreak(dates: Set<string>, today: string) {
  let streak = 0;
  const start = dates.has(today) ? 0 : 1;
  for (let offset = start; offset < 366; offset++) {
    if (dates.has(isoDaysAgo(offset))) streak++;
    else break;
  }
  return streak;
}

export default async function HabitosPage() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const today = todayISODate();
  const weekStart = isoDaysAgo(6);

  const [{ data: habits }, { data: logsHoje }, { data: weekLogs }, { data: historyLogs }] = await Promise.all([
    supabase.from('habits').select('*').eq('user_id', user.id).eq('archived', false).order('created_at', { ascending: true }),
    supabase.from('habit_logs').select('habit_id, done').eq('user_id', user.id).eq('logged_date', today),
    supabase.from('habit_logs').select('habit_id, logged_date, done').eq('user_id', user.id).gte('logged_date', weekStart).lte('logged_date', today),
    supabase.from('habit_logs').select('habit_id, logged_date, done').eq('user_id', user.id).gte('logged_date', isoDaysAgo(365)).lte('logged_date', today).order('logged_date', { ascending: false }),
  ]);

  const activeHabits = habits ?? [];
  const todayDone = new Set((logsHoje ?? []).filter((l) => l.done).map((l) => l.habit_id));
  const completedWeekLogs = (weekLogs ?? []).filter((l) => l.done);
  const expectedCompletions = Math.max(activeHabits.length * 7, 1);
  const weeklyPercent = Math.round(Math.min(100, completedWeekLogs.length / expectedCompletions * 100));
  const overallTodayPercent = activeHabits.length ? Math.round(todayDone.size / activeHabits.length * 100) : 0;
  const historyByHabit = new Map<string, Set<string>>();
  for (const log of (historyLogs ?? []).filter((l) => l.done)) {
    if (!historyByHabit.has(log.habit_id)) historyByHabit.set(log.habit_id, new Set());
    historyByHabit.get(log.habit_id)!.add(log.logged_date);
  }

  return (
    <>
      <PageHeader title="Hábitos" subtitle="Construa consistência um dia de cada vez. Acompanhe seu progresso e suas sequências." />

      <section className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <div className="app-card p-4">
          <p className="section-label">Hoje</p>
          <p className="mt-2 text-3xl font-black text-primary">{overallTodayPercent}%</p>
          <p className="mt-1 text-xs text-ink-soft">{todayDone.size} de {activeHabits.length} hábitos concluídos</p>
          <div className="mt-3 h-2 overflow-hidden rounded-full bg-surface"><div className="h-full rounded-full bg-primary transition-all" style={{ width: `${overallTodayPercent}%` }} /></div>
        </div>
        <div className="app-card p-4">
          <p className="section-label">Últimos 7 dias</p>
          <p className="mt-2 text-3xl font-black text-primary">{weeklyPercent}%</p>
          <p className="mt-1 text-xs text-ink-soft">{completedWeekLogs.length} conclusões registradas nesta semana</p>
          <div className="mt-3 h-2 overflow-hidden rounded-full bg-surface"><div className="h-full rounded-full bg-primary transition-all" style={{ width: `${weeklyPercent}%` }} /></div>
        </div>
        <div className="app-card p-4">
          <p className="section-label">Hábitos ativos</p>
          <p className="mt-2 text-3xl font-black text-primary">{activeHabits.length}</p>
          <p className="mt-1 text-xs text-ink-soft">Pequenas ações, grandes resultados.</p>
        </div>
      </section>

      <NewHabitForm />

      {activeHabits.length === 0 && <EmptyState text="Nenhum hábito ainda. Adicione seu primeiro hábito no formulário acima." />}

      <section className="space-y-3">
        <div className="flex items-center justify-between gap-3">
          <div><p className="section-label">Seu acompanhamento</p><p className="mt-1 text-sm text-ink-soft">Marque cada hábito quando concluir e acompanhe sua sequência.</p></div>
          <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-bold text-primary">{todayDone.size}/{activeHabits.length}</span>
        </div>
        <ul className="flex flex-col gap-2">
          {activeHabits.map((habit) => {
            const done = todayDone.has(habit.id);
            const streak = calculateStreak(historyByHabit.get(habit.id) ?? new Set<string>(), today);
            const weekCount = completedWeekLogs.filter((log) => log.habit_id === habit.id).length;
            return (
              <li key={habit.id} className="app-card flex items-center gap-3 p-3 sm:p-4">
                <span className="h-3 w-3 shrink-0 rounded-full" style={{ backgroundColor: habit.color }} />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-bold text-ink">{habit.name}</p>
                  <p className="mt-1 text-[11px] text-ink-soft">{weekCount}/7 dias nesta semana · 🔥 {streak} {streak === 1 ? 'dia seguido' : 'dias seguidos'}</p>
                  <div className="mt-2 h-1.5 max-w-48 overflow-hidden rounded-full bg-surface"><div className="h-full rounded-full bg-primary" style={{ width: `${Math.round(weekCount / 7 * 100)}%` }} /></div>
                </div>
                <form action={toggleHabitToday}>
                  <input type="hidden" name="habit_id" value={habit.id} />
                  <input type="hidden" name="already_done" value={String(done)} />
                  <button type="submit" className={`min-h-10 rounded-xl px-3 py-2 text-xs font-bold transition-colors ${done ? 'bg-primary text-primary-foreground' : 'border border-primary/30 bg-primary/5 text-primary hover:bg-primary/10'}`}>
                    {done ? '✓ Feito' : 'Marcar feito'}
                  </button>
                </form>
              </li>
            );
          })}
        </ul>
      </section>
      <p className="text-center text-[11px] text-ink-faint">Seu histórico é calculado a partir dos registros salvos na sua conta.</p>
    </>
  );
}
