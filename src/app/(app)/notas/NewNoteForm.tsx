'use client';

import { useRef } from 'react';
import { createNote } from './actions';

export function NewNoteForm() {
  const formRef = useRef<HTMLFormElement>(null);
  return (
    <form ref={formRef} action={async (formData) => { formRef.current?.reset(); await createNote(formData); }} className="form-shell">
      <div className="grid gap-3">
        <input type="text" name="title" placeholder="Título (opcional)" className="rounded-xl border border-border bg-paper px-3 py-2.5 text-sm text-ink outline-none placeholder:text-ink-faint" />
        <textarea name="content" placeholder="Escreva sua nota..." required rows={4} className="min-h-28 resize-y rounded-xl border border-border bg-paper px-3 py-2.5 text-sm text-ink outline-none placeholder:text-ink-faint" />
        <button type="submit" className="primary-button w-full sm:w-auto sm:self-end">Salvar</button>
      </div>
    </form>
  );
}