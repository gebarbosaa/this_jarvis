'use client';

import { useRef, useState } from 'react';
import { createTask } from './actions';

export function NewTaskForm() {
  const formRef = useRef<HTMLFormElement>(null);
  const [priority, setPriority] = useState<'low' | 'medium' | 'high'>('medium');

  return (
    <form ref={formRef} action={async (formData) => { formRef.current?.reset(); setPriority('medium'); await createTask(formData); }} className="form-shell">
      <div className="flex min-w-0 flex-col gap-3 lg:flex-row lg:items-center">
        <input type="text" name="title" placeholder="Nova tarefa..." required className="min-w-0 flex-1 bg-transparent px-1 py-2 text-sm text-ink outline-none placeholder:text-ink-faint" />
        <div className="flex min-w-0 flex-wrap items-center gap-2">
          <input type="date" name="due_date" className="field w-full sm:w-auto sm:flex-none" />
          <input type="hidden" name="priority" value={priority} />
          <div className="flex flex-wrap gap-1.5">
            {(['low','medium','high'] as const).map((p) => (
              <button key={p} type="button" onClick={() => setPriority(p)} className={`rounded-xl px-3 py-2 text-xs font-bold capitalize ${priority === p ? 'bg-pine text-black' : 'bg-paper text-ink-faint'}`}>
                {p === 'low' ? 'baixa' : p === 'medium' ? 'média' : 'alta'}
              </button>
            ))}
          </div>
          <button type="submit" className="primary-button w-full sm:w-auto">Adicionar</button>
        </div>
      </div>
    </form>
  );
}