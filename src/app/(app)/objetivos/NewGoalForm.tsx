'use client';

import { useRef } from 'react';
import { createGoal } from './actions';

export function NewGoalForm() {
  const formRef = useRef<HTMLFormElement>(null);
  return (
    <form ref={formRef} action={async (formData) => { formRef.current?.reset(); await createGoal(formData); }} className="form-shell">
      <div className="grid min-w-0 gap-3 lg:grid-cols-[minmax(0,1fr)_auto_auto] lg:items-center">
        <input type="text" name="title" placeholder="Novo objetivo, ex: Aprender inglês" required className="min-w-0 rounded-xl border border-border bg-paper px-3 py-2.5 text-sm text-ink outline-none placeholder:text-ink-faint" />
        <input type="date" name="target_date" className="field min-w-0" />
        <button type="submit" className="primary-button w-full lg:w-auto">Criar</button>
      </div>
    </form>
  );
}