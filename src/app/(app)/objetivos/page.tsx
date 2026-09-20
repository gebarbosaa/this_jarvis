import { createClient } from '@/lib/supabase/server';
import { PageHeader } from '@/components/ui/PageHeader';
import { EmptyState } from '@/components/ui/EmptyState';
import { NewGoalForm } from './NewGoalForm';
import { addStep, toggleStep } from './actions';

export default async function ObjetivosPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: goals } = await supabase
    .from('goals')
    .select('*, goal_steps(*)')
    .eq('user_id', user!.id)
    .eq('status', 'active')
    .order('created_at', { ascending: false });

  return (
    <>
      <PageHeader title="Objetivos" subtitle="Metas grandes, um passo de cada vez." />

      <NewGoalForm />

      {(!goals || goals.length === 0) && <EmptyState text="Nenhum objetivo ativo. Crie o primeiro acima." />}

      <ul className="flex flex-col gap-3">
        {goals?.map((goal: any) => {
          const steps = (goal.goal_steps ?? []).sort((a: any, b: any) => a.order_index - b.order_index);
          const total = steps.length;
          const done = steps.filter((s: any) => s.done).length;
          const pct = total > 0 ? Math.round((done / total) * 100) : 0;

          return (
            <li key={goal.id} className="rounded-card border border-border bg-white p-3">
              <div className="flex items-baseline justify-between gap-2">
                <p className="font-medium text-ink">{goal.title}</p>
                {goal.target_date && (
                  <span className="shrink-0 text-xs text-ink-faint">
                    até {new Date(`${goal.target_date}T00:00:00`).toLocaleDateString('pt-BR')}
                  </span>
                )}
              </div>

              {total > 0 && (
                <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-surface">
                  <div className="h-full rounded-full bg-pine" style={{ width: `${pct}%` }} />
                </div>
              )}

              <ul className="mt-3 flex flex-col gap-1.5">
                {steps.map((step: any) => (
                  <li key={step.id} className="flex items-center gap-2">
                    <form action={toggleStep}>
                      <input type="hidden" name="id" value={step.id} />
                      <input type="hidden" name="done" value={String(step.done)} />
                      <button
                        type="submit"
                        className={`flex h-4 w-4 items-center justify-center rounded border ${
                          step.done ? 'border-pine bg-pine' : 'border-border'
                        }`}
                      >
                        {step.done && (
                          <svg viewBox="0 0 24 24" className="h-2.5 w-2.5 text-white" fill="none" stroke="currentColor" strokeWidth={3}>
                            <path d="m5 12.5 4 4 10-10" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                        )}
                      </button>
                    </form>
                    <span className={`text-sm ${step.done ? 'text-ink-faint line-through' : 'text-ink-soft'}`}>
                      {step.title}
                    </span>
                  </li>
                ))}
              </ul>

              <form action={addStep} className="mt-2 flex items-center gap-2">
                <input type="hidden" name="goal_id" value={goal.id} />
                <input type="text" name="title" placeholder="Adicionar passo..." className="flex-1 bg-transparent px-1 py-1 text-sm text-ink outline-none placeholder:text-ink-faint" />
                <button type="submit" className="text-xs font-medium text-pine">Adicionar</button>
              </form>
            </li>
          );
        })}
      </ul>
    </>
  );
}