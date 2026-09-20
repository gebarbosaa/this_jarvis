import { createClient } from '@/lib/supabase/server';
import { PageHeader } from '@/components/ui/PageHeader';
import { EmptyState } from '@/components/ui/EmptyState';
import { NewTaskForm } from './NewTaskForm';
import { toggleTask, deleteTask } from './actions';

const PRIORITY_LABEL: Record<string, string> = { low: 'baixa', medium: 'média', high: 'alta' };
const PRIORITY_COLOR: Record<string, string> = {
  low: 'text-ink-faint',
  medium: 'text-amber-dark',
  high: 'text-clay',
};

export default async function TarefasPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: tasks } = await supabase
    .from('tasks')
    .select('*')
    .eq('user_id', user!.id)
    .neq('status', 'archived')
    .order('status', { ascending: true })
    .order('due_date', { ascending: true, nullsFirst: false })
    .order('created_at', { ascending: false });

  const pendentes = (tasks ?? []).filter((t) => t.status === 'pending');
  const concluidas = (tasks ?? []).filter((t) => t.status === 'done');

  return (
    <>
      <PageHeader title="Tarefas" subtitle={`${pendentes.length} pendente${pendentes.length === 1 ? '' : 's'}`} />

      <NewTaskForm />

      {pendentes.length === 0 && concluidas.length === 0 && (
        <EmptyState text="Nenhuma tarefa ainda. Adicione a primeira acima." />
      )}

      {pendentes.length > 0 && (
        <ul className="flex flex-col gap-2">
          {pendentes.map((task) => (
            <TaskRow key={task.id} task={task} />
          ))}
        </ul>
      )}

      {concluidas.length > 0 && (
        <details className="mt-6">
          <summary className="cursor-pointer text-sm text-ink-faint">
            {concluidas.length} concluída{concluidas.length === 1 ? '' : 's'}
          </summary>
          <ul className="mt-2 flex flex-col gap-2">
            {concluidas.map((task) => (
              <TaskRow key={task.id} task={task} />
            ))}
          </ul>
        </details>
      )}
    </>
  );
}

function TaskRow({
  task,
}: {
  task: {
    id: string;
    title: string;
    status: string;
    priority: string;
    due_date: string | null;
  };
}) {
  const done = task.status === 'done';

  return (
    <li className="flex items-center gap-3 rounded-card border border-border bg-white px-3 py-3">
      <form action={toggleTask}>
        <input type="hidden" name="id" value={task.id} />
        <input type="hidden" name="current_status" value={task.status} />
        <button
          type="submit"
          aria-label={done ? 'Reabrir tarefa' : 'Concluir tarefa'}
          className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 ${
            done ? 'border-pine bg-pine' : 'border-border'
          }`}
        >
          {done && (
            <svg viewBox="0 0 24 24" className="h-3 w-3 text-white" fill="none" stroke="currentColor" strokeWidth={3}>
              <path d="m5 12.5 4 4 10-10" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          )}
        </button>
      </form>

      <div className="min-w-0 flex-1">
        <p className={`truncate ${done ? 'text-ink-faint line-through' : 'text-ink'}`}>{task.title}</p>
        <p className="text-xs text-ink-faint">
          {task.due_date ? new Date(`${task.due_date}T00:00:00`).toLocaleDateString('pt-BR') : 'sem data'}
          {' · '}
          <span className={PRIORITY_COLOR[task.priority]}>{PRIORITY_LABEL[task.priority]}</span>
        </p>
      </div>

      <form action={deleteTask}>
        <input type="hidden" name="id" value={task.id} />
        <button type="submit" aria-label="Excluir tarefa" className="p-1 text-ink-faint">
          <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={1.8}>
            <path d="M5 7h14M9 7V5a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2m-8 0 .7 12a1 1 0 0 0 1 1h6.6a1 1 0 0 0 1-1L17 7" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
      </form>
    </li>
  );
}