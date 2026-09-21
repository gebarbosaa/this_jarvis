'use client';

import { useRef } from 'react';
import { createHabit } from './actions';

export function NewHabitForm() {
  const formRef = useRef<HTMLFormElement>(null);
  return (
    <form ref={formRef} action={async (formData) => { formRef.current?.reset(); await createHabit(formData); }} className="form-shell">
      <div className="flex min-w-0 flex-col gap-3 sm:flex-row">
        <input type="text" name="name" placeholder="Novo hábito, ex: Beber água" required className="min-w-0 flex-1 rounded-xl border border-border bg-paper px-3 py-2.5 text-sm text-ink outline-none placeholder:text-ink-faint" />
        <button type="submit" className="primary-button w-full sm:w-auto">Adicionar</button>
      </div>
    </form>
  );
}