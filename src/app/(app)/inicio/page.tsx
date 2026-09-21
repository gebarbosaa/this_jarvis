import Link from 'next/link';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { EmptyState } from '@/components/ui/EmptyState';
import { todayISODate, formatDiaCompleto } from '@/lib/date';
import { toggleTask } from '../tarefas/actions';
import { toggleHabitToday } from '../habitos/actions';
import { InboxForm } from './InboxForm';

export default async function InicioPage() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect('/login');

  const today = todayISODate();

  const [{ data: profile }, { data: tasksHoje }, { data: atrasadas }, { data: habits }, { data: logsHoje }, { data: reminders }] =
    await Promise.all([
      supabase.from('profiles').select('display_name').eq('id', user.id).single(),
      supabase.from('tasks').select('*').eq('user_id', user.id).eq('status', 'pending').or(`due_date.eq.${today},due_date.is.null`).order('due_date', { ascending: true, nullsFirst: false }).limit(6),
      supabase.from('tasks').select('id, title, due_date').eq('user_id', user.id).eq('status', 'pending').lt('due_date', today),
      supabase.from('habits').select('*').eq('user_id', user.id).eq('archived', false),
      supabase.from('habit_logs').select('habit_id').eq('user_id', user.id).eq('logged_date', today),
      supabase.from('reminders').select('*').eq('user_id', user.id).is('dismissed_at', null).order('remind_at', { ascending: true }).limit(3),
    ]);

  const feitosHoje = new Set((logsHoje ?? []).map((l) => l.habit_id));
  const nome = profile?.display_name?.split(' ')[0] ?? '';

  return (
    <div className="space-y-7">
      <header className="rounded-2xl border border-border bg-gradient-soft px-5 py-5 shadow-elegant sm:px-6 sm:py-6">
        <p className="text-xs font-bold tracking-[0.12em] text-primary">{formatDiaCompleto(today)}</p>
        <div className="mt-2 flex flex-wrap items-end justify-between gap-3">
          <div>
            <h1 className="text-balance text-2xl font-extrabold tracking-tight text-ink sm:text-3xl lg:text-4xl">
              {nome ? `Olá, ${nome}` : 'Olá'}
            </h1>
            <p className="mt-1 text-sm text-ink-soft sm:text-base">Sua visão rápida do que precisa de atenção hoje.</p>
          </div>
          <Link href="/tarefas" className="rounded-xl border border-primary/40 bg-primary/10 px-4 py-2.5 text-xs font-bold tracking-[0.06em] text-primary transition hover:bg-primary/15">
            VER TAREFAS
          </Link>
        </div>
      </header>

      {atrasadas && atrasadas.length > 0 && (
        <Link href="/tarefas" className="flex items-center justify-between gap-4 rounded-xl border border-clay/40 bg-clay-light px-4 py-3 text-sm text-clay">
          <span>{atrasadas.length === 1 ? `1 tarefa atrasada: "${atrasadas[0].title}"` : `${atrasadas.length} tarefas atrasadas — vale revisar.`}</span>
          <span className="shrink-0 text-xs font-bold">ABRIR →</span>
        </Link>
      )}

      <section className="app-card p-4 sm:p-5">
        <div className="mb-3">
          <p className="section-label">Caixa de entrada</p>
          <p className="mt-1 text-sm text-ink-soft">Jogue aqui qualquer ideia, tarefa ou coisa que não quer esquecer.</p>
        </div>
        <InboxForm />
        <div className="mt-3 flex flex-wrap gap-2 text-[10px] font-bold tracking-[0.06em] text-ink-faint">
          <span className="rounded-full bg-paper px-2.5 py-1">TAREFA</span>
          <span className="rounded-full bg-paper px-2.5 py-1">LEMBRETE</span>
          <span className="rounded-full bg-paper px-2.5 py-1">IDEIA</span>
        </div>
      </section>

      <div className="grid gap-5 xl:grid-cols-2">
        <Section title="Para hoje" href="/tarefas">
          {(!tasksHoje || tasksHoje.length === 0) && <EmptyState text="Nenhuma tarefa para hoje. 🎉" />}
          <ul className="space-y-2">
            {tasksHoje?.map((task) => (
              <li key={task.id} className="group flex items-center gap-3 rounded-xl border border-border bg-surface px-4 py-3 transition hover:border-primary/35">
                <form action={toggleTask}>
                  <input type="hidden" name="id" value={task.id} />
                  <input type="hidden" name="current_status" value={task.status} />
                  <button type="submit" aria-label="Concluir tarefa" className="h-5 w-5 shrink-0 rounded-full border-2 border-border bg-paper transition hover:border-primary hover:bg-primary/10" />
                </form>
                <span className="min-w-0 flex-1 truncate text-sm text-ink">{task.title}</span>
              </li>
            ))}
          </ul>
        </Section>

        <Section title="Hábitos de hoje" href="/habitos">
          {(!habits || habits.length === 0) && <EmptyState text="Você ainda não tem hábitos." />}
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
            {habits?.map((habit) => {
              const done = feitosHoje.has(habit.id);
              return (
                <form key={habit.id} action={toggleHabitToday}>
                  <input type="hidden" name="habit_id" value={habit.id} />
                  <input type="hidden" name="already_done" value={String(done)} />
                  <button type="submit" className={`flex min-h-20 w-full flex-col items-start justify-between rounded-xl border px-3 py-3 text-left text-xs font-bold transition ${done ? 'border-primary/50 bg-primary/12 text-primary' : 'border-border bg-surface text-ink-soft hover:border-primary/35 hover:text-ink'}`}>
                    <span className="h-2 w-2 rounded-full bg-current opacity-70" />
                    <span className="line-clamp-2">{habit.name}</span>
                  </button>
                </form>
              );
            })}
          </div>
        </Section>

        <Section title="Próximos lembretes" href="/lembretes">
          {(!reminders || reminders.length === 0) && <EmptyState text="Nada por vir." />}
          <ul className="space-y-2">
            {reminders?.map((r) => (
              <li key={r.id} className="rounded-xl border border-border bg-surface px-4 py-3 text-sm text-ink-soft">
                <span className="font-semibold text-primary">
                  {new Date(r.remind_at).toLocaleString('pt-BR', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                </span>
                <span className="mx-2 text-ink-faint">•</span>
                {r.title}
              </li>
            ))}
          </ul>
        </Section>

        <section className="rounded-2xl border border-border bg-surface p-5 shadow-sm sm:p-6">
          <p className="section-label">Visão rápida</p>
          <div className="mt-4 grid grid-cols-2 gap-3">
            <Metric label="Tarefas" value={tasksHoje?.length ?? 0} />
            <Metric label="Hábitos" value={habits?.length ?? 0} />
            <Metric label="Lembretes" value={reminders?.length ?? 0} />
            <Metric label="Atrasadas" value={atrasadas?.length ?? 0} alert={Boolean(atrasadas?.length)} />
          </div>
        </section>
      </div>
    </div>
  );
}

function Section({ title, href, children }: { title: string; href: string; children: React.ReactNode }) {
  return (
    <section className="app-card p-4 sm:p-5">
      <div className="mb-4 flex items-center justify-between gap-3">
        <h2 className="section-label">{title}</h2>
        <Link href={href} className="text-[10px] font-bold tracking-[0.08em] text-primary hover:underline">VER TUDO</Link>
      </div>
      {children}
    </section>
  );
}

function Metric({ label, value, alert = false }: { label: string; value: number; alert?: boolean }) {
  return (
    <div className={`rounded-xl border px-3 py-3 ${alert ? 'border-clay/40 bg-clay-light/40' : 'border-border bg-paper/50'}`}>
      <p className="text-[10px] font-bold tracking-[0.08em] text-ink-faint">{label}</p>
      <p className={`mt-1 text-2xl font-extrabold ${alert ? 'text-clay' : 'text-ink'}`}>{value}</p>
    </div>
  );
}