'use client';

import { useSearchParams } from 'next/navigation';
import { useRef } from 'react';
import { createHabit } from './actions';

export function NewHabitForm() {
  const searchParams = useSearchParams();
  const shouldFocus = searchParams.get('novo') === '1';
  const formRef = useRef<HTMLFormElement>(null);

  return (
    <form
      ref={formRef}
      action={async (formData) => {
        formRef.current?.reset();
        await createHabit(formData);
      }}
      className="mb-6 flex items-center gap-2 rounded-card border border-border bg-white p-3"
    >
      <input
        type="text"
        name="name"
        placeholder="Novo hábito, ex: Beber água"
        required
        autoFocus={shouldFocus}
        className="flex-1 bg-transparent px-1 py-1 text-ink outline-none placeholder:text-ink-faint"
      />
      <button type="submit" className="rounded-md bg-pine px-3 py-1.5 text-xs font-medium text-white">
        Adicionar
      </button>
    </form>
  );
}