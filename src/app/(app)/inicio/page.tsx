import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { EmptyState } from '@/components/ui/EmptyState';
import { todayISODate, formatDiaCompleto } from '@/lib/date';
import { toggleTask } from '../tarefas/actions';
import { toggleHabitToday } from '../habitos/actions';

export default async function InicioPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const today = todayISODate();

  const [{ data: profile }, { data: tasksHoje }, { data: atrasadas }, { data: habits }, { data: logsHoje }, { data: reminders }] =
    await Promise.all([
      supabase.from('profiles').select('display_name').eq('id', user!.id).single(),
      supabase.from('tasks').select('*').eq('user_id', user!.id).eq('status', 'pending').or(`due_date.eq.${today},due_date.is.null`).order('due_date', { ascending: true, nullsFirst: false }).limit(6),
      supabase.from('tasks').select('id, title, due_date').eq('user_id', user!.id).eq('status', 'pending').lt('due_date', today),
      supabase.from('habits').select('*').eq('user_id', user!.id).eq('archived', false),
      supabase.from('habit_logs').select('habit_id').eq('user_id', user!.id).eq('logged_date', today),
      supabase.from('reminders').select('*').eq('user_id', user!.id).is('dismissed_at', null).order('remind_at', { ascending: true }).limit(3),
    ]);

  const feitosHoje = new Set((logsHoje ?? []).map((l) => l.habit_id));
  const nome = profile?.display_name?.split(' ')[0] ?? '';

  return (
    <>
      <header className="mb-6">
        <p className="text-sm capitalize text-ink-faint">{formatDiaCompleto(today)}</p>
        <h1 className="font-display text-2xl text-ink">{nome ? `Olá, ${nome}` : 'Olá'}</h1>
      </header>

      {atrasadas && atrasadas.length > 0 && (
        <Link href="/tarefas" className="mb-6 block rounded-card border border-clay/40 bg-clay-light px-3 py-2.5 text-sm text-clay">
          {atrasadas.length === 1 ? `1 tarefa atrasada: "${atrasadas[0].title}"` : `${atrasadas.length} tarefas atrasadas — vale revisar.`}
        </Link>
      )}

      <Section title="Para hoje" href="/tarefas">
        {(!tasksHoje || tasksHoje.length === 0) && <EmptyState text="Nenhuma tarefa para hoje. 🎉" />}
        <ul className="flex flex-col gap-2">
          {tasksHoje?.map((task) => (
            <li key={task.id} className="flex items-center gap-3 rounded-card border border-border bg-white px-3 py-2.5">
              <form action={toggleTask}><input type="hidden" name="id" value={task.id} /><input type="hidden" name="current_status" value={task.status} /><button type="submit" aria-label="Concluir tarefa" className="h-4 w-4 shrink-0 rounded-full border-2 border-border" /></form>
              <span className="truncate text-sm text-ink">{task.title}</span>
            </li>
          ))}
        </ul>
      </Section>

      <Section title="Hábitos de hoje" href="/habitos">
        {(!habits || habits.length === 0) && <EmptyState text="Você ainda não tem hábitos." />}
        <div className="flex flex-wrap gap-2">
          {habits?.map((habit) => {
            const done = feitosHoje.has(habit.id);
            return <form key={habit.id} action={toggleHabitToday}><input type="hidden" name="habit_id" value={habit.id} /><input type="hidden" name="already_done" value={String(done)} /><button type="submit" className={`rounded-full px-3 py-1.5 text-xs font-medium ${done ? 'bg-pine text-white' : 'border border-border bg-white text-ink-soft'}`}>{habit.name}</button></form>;
          })}
        </div>
      </Section>

      <Section title="Próximos lembretes" href="/lembretes">
        {(!reminders || reminders.length === 0) && <EmptyState text="Nada por vir." />}
        <ul className="flex flex-col gap-1.5">{reminders?.map((r) => <li key={r.id} className="text-sm text-ink-soft"><span className="text-ink-faint">{new Date(r.remind_at).toLocaleString('pt-BR', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}</span>{' '}· {r.title}</li>)}</ul>
      </Section>
    </>
  );
}

function Section({ title, href, children }: { title: string; href: string; children: React.ReactNode }) {
  return <section className="mb-6"><div className="mb-2 flex items-center justify-between"><h2 className="text-sm font-medium text-ink-soft">{title}</h2><Link href={href} className="text-xs text-pine">ver tudo</Link></div>{children}</section>;
}