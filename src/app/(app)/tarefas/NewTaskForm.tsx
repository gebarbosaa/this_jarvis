'use client';

import { useSearchParams } from 'next/navigation';
import { useRef, useState } from 'react';
import { createTask } from './actions';

export function NewTaskForm() {
  const searchParams = useSearchParams();
  const shouldFocus = searchParams.get('novo') === '1';
  const formRef = useRef<HTMLFormElement>(null);
  const [priority, setPriority] = useState<'low' | 'medium' | 'high'>('medium');

  return (
    <form
      ref={formRef}
      action={async (formData) => {
        formRef.current?.reset();
        setPriority('medium');
        await createTask(formData);
      }}
      className="mb-6 flex flex-col gap-2 rounded-card border border-border bg-white p-3"
    >
      <input
        type="text"
        name="title"
        placeholder="Nova tarefa..."
        required
        autoFocus={shouldFocus}
        className="bg-transparent px-1 py-1 text-ink outline-none placeholder:text-ink-faint"
      />
      <div className="flex items-center gap-2">
        <input
          type="date"
          name="due_date"
          className="rounded-md border border-border bg-paper px-2 py-1.5 text-xs text-ink-soft outline-none"
        />
        <input type="hidden" name="priority" value={priority} />
        <div className="flex gap-1">
          {(['low', 'medium', 'high'] as const).map((p) => (
            <button
              key={p}
              type="button"
              onClick={() => setPriority(p)}
              className={`rounded-md px-2 py-1.5 text-xs capitalize transition-colors ${
                priority === p ? 'bg-pine text-white' : 'bg-paper text-ink-faint'
              }`}
            >
              {p === 'low' ? 'baixa' : p === 'medium' ? 'média' : 'alta'}
            </button>
          ))}
        </div>
        <button
          type="submit"
          className="ml-auto rounded-md bg-pine px-3 py-1.5 text-xs font-medium text-white"
        >
          Adicionar
        </button>
      </div>
    </form>
  );
}