'use client';

import { useSearchParams } from 'next/navigation';
import { useRef } from 'react';
import { createGoal } from './actions';

export function NewGoalForm() {
  const searchParams = useSearchParams();
  const shouldFocus = searchParams.get('novo') === '1';
  const formRef = useRef<HTMLFormElement>(null);

  return (
    <form
      ref={formRef}
      action={async (formData) => {
        formRef.current?.reset();
        await createGoal(formData);
      }}
      className="mb-6 flex items-center gap-2 rounded-card border border-border bg-white p-3"
    >
      <input type="text" name="title" placeholder="Novo objetivo, ex: Aprender inglês" required autoFocus={shouldFocus} className="flex-1 bg-transparent px-1 py-1 text-ink outline-none placeholder:text-ink-faint" />
      <input type="date" name="target_date" className="rounded-md border border-border bg-paper px-2 py-1.5 text-xs text-ink-soft outline-none" />
      <button type="submit" className="rounded-md bg-pine px-3 py-1.5 text-xs font-medium text-white">Criar</button>
    </form>
  );
}