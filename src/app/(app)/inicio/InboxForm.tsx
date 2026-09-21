'use client';

import { useRef } from 'react';
import { createTask } from '../tarefas/actions';

export function InboxForm() {
  const ref = useRef<HTMLFormElement>(null);

  return (
    <form
      ref={ref}
      action={async (formData) => {
        ref.current?.reset();
        await createTask(formData);
      }}
      className="flex flex-col gap-3 sm:flex-row"
    >
      <input type="text" name="title" required placeholder="Digite qualquer coisa..." className="field min-w-0 flex-1" />
      <input type="hidden" name="priority" value="medium" />
      <button type="submit" className="primary-button shrink-0">ADICIONAR</button>
    </form>
  );
}