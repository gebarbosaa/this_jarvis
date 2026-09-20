'use client';

import { useSearchParams } from 'next/navigation';
import { useRef } from 'react';
import { createReminder } from './actions';

export function NewReminderForm() {
  const searchParams = useSearchParams();
  const shouldFocus = searchParams.get('novo') === '1';
  const formRef = useRef<HTMLFormElement>(null);
  return (
    <form ref={formRef} action={async (formData) => { formRef.current?.reset(); await createReminder(formData); }} className="mb-6 flex flex-col gap-2 rounded-card border border-border bg-white p-3">
      <input type="text" name="title" placeholder="Lembrar de..." required autoFocus={shouldFocus} className="bg-transparent px-1 py-1 text-ink outline-none placeholder:text-ink-faint" />
      <div className="flex items-center gap-2">
        <input type="datetime-local" name="remind_at" required className="flex-1 rounded-md border border-border bg-paper px-2 py-1.5 text-sm text-ink-soft outline-none" />
        <button type="submit" className="rounded-md bg-pine px-3 py-1.5 text-xs font-medium text-white">Criar</button>
      </div>
    </form>
  );
}