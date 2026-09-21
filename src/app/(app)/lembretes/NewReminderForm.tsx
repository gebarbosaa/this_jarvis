'use client';

import { useRef } from 'react';
import { createReminder } from './actions';

export function NewReminderForm() {
  const formRef = useRef<HTMLFormElement>(null);
  return (
    <form ref={formRef} action={async (formData) => { formRef.current?.reset(); await createReminder(formData); }} className="form-shell">
      <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center">
        <input type="text" name="title" placeholder="Lembrar de..." required className="min-w-0 rounded-xl border border-border bg-paper px-3 py-2.5 text-sm text-ink outline-none placeholder:text-ink-faint" />
        <div className="flex min-w-0 flex-col gap-2 sm:flex-row">
          <input type="datetime-local" name="remind_at" required className="field min-w-0 flex-1 sm:flex-none" />
          <button type="submit" className="primary-button w-full sm:w-auto">Criar</button>
        </div>
      </div>
    </form>
  );
}