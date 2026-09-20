'use client';

import { useRef } from 'react';
import { createNote } from './actions';

export function NewNoteForm() {
  const formRef = useRef<HTMLFormElement>(null);

  return (
    <form
      ref={formRef}
      action={async (formData) => {
        formRef.current?.reset();
        await createNote(formData);
      }}
      className="mb-6 flex flex-col gap-2 rounded-card border border-border bg-white p-3"
    >
      <input type="text" name="title" placeholder="Título (opcional)" className="bg-transparent px-1 py-1 text-sm text-ink outline-none placeholder:text-ink-faint" />
      <textarea name="content" placeholder="Escreva sua nota..." required rows={3} className="resize-none bg-transparent px-1 py-1 text-ink outline-none placeholder:text-ink-faint" />
      <button type="submit" className="self-end rounded-md bg-pine px-3 py-1.5 text-xs font-medium text-white">Salvar</button>
    </form>
  );
}