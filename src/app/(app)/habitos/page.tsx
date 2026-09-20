import { createClient } from '@/lib/supabase/server';
import { PageHeader } from '@/components/ui/PageHeader';
import { EmptyState } from '@/components/ui/EmptyState';
import { todayISODate } from '@/lib/date';
import { NewHabitForm } from './NewHabitForm';
import { toggleHabitToday } from './actions';

export default async function HabitosPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const today = todayISODate();

  const [{ data: habits }, { data: logsHoje }] = await Promise.all([
    supabase
      .from('habits')
      .select('*')
      .eq('user_id', user!.id)
      .eq('archived', false)
      .order('created_at', { ascending: true }),
    supabase
      .from('habit_logs')
      .select('habit_id')
      .eq('user_id', user!.id)
      .eq('logged_date', today),
  ]);

  const feitosHoje = new Set((logsHoje ?? []).map((l) => l.habit_id));

  return (
    <>
      <PageHeader title="Hábitos" subtitle="O que você repete constrói quem você é." />

      <NewHabitForm />

      {(!habits || habits.length === 0) && <EmptyState text="Nenhum hábito ainda. Comece pelo formulário acima." />}

      <ul className="flex flex-col gap-2">
        {habits?.map((habit) => {
          const done = feitosHoje.has(habit.id);
          return (
            <li
              key={habit.id}
              className="flex items-center gap-3 rounded-card border border-border bg-white px-3 py-3"
            >
              <span
                className="h-2.5 w-2.5 shrink-0 rounded-full"
                style={{ backgroundColor: habit.color }}
              />
              <span className="min-w-0 flex-1 truncate text-ink">{habit.name}</span>

              <form action={toggleHabitToday}>
                <input type="hidden" name="habit_id" value={habit.id} />
                <input type="hidden" name="already_done" value={String(done)} />
                <button
                  type="submit"
                  className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
                    done ? 'bg-pine text-white' : 'bg-surface text-ink-soft'
                  }`}
                >
                  {done ? 'Feito hoje' : 'Marcar hoje'}
                </button>
              </form>
            </li>
          );
        })}
      </ul>
    </>
  );
}