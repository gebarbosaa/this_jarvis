import { createClient } from '@/lib/supabase/server';
import { PageHeader } from '@/components/ui/PageHeader';
import { EmptyState } from '@/components/ui/EmptyState';
import { NewNoteForm } from './NewNoteForm';
import { togglePin, deleteNote } from './actions';

export default async function NotasPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: notes } = await supabase
    .from('notes')
    .select('*')
    .eq('user_id', user!.id)
    .order('pinned', { ascending: false })
    .order('updated_at', { ascending: false });

  return (
    <>
      <PageHeader title="Notas" />

      <NewNoteForm />

      {(!notes || notes.length === 0) && <EmptyState text="Nenhuma nota ainda." />}

      <ul className="flex flex-col gap-2">
        {notes?.map((note) => (
          <li key={note.id} className="rounded-card border border-border bg-white p-3">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                {note.title && <p className="truncate font-medium text-ink">{note.title}</p>}
                <p className="whitespace-pre-wrap text-sm text-ink-soft">{note.content}</p>
              </div>
              <div className="flex shrink-0 gap-1">
                <form action={togglePin}>
                  <input type="hidden" name="id" value={note.id} />
                  <input type="hidden" name="pinned" value={String(note.pinned)} />
                  <button
                    type="submit"
                    aria-label="Fixar nota"
                    className={`p-1 ${note.pinned ? 'text-amber' : 'text-ink-faint'}`}
                  >
                    <svg viewBox="0 0 24 24" className="h-4 w-4" fill={note.pinned ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth={1.8}>
                      <path d="M12 3v6l3 3-1 2H10l-1-2 3-3V3Z" strokeLinejoin="round" />
                      <path d="M12 14v7" strokeLinecap="round" />
                    </svg>
                  </button>
                </form>
                <form action={deleteNote}>
                  <input type="hidden" name="id" value={note.id} />
                  <button type="submit" aria-label="Excluir nota" className="p-1 text-ink-faint">
                    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={1.8}>
                      <path d="M5 7h14M9 7V5a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2m-8 0 .7 12a1 1 0 0 0 1 1h6.6a1 1 0 0 0 1-1L17 7" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </button>
                </form>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </>
  );
}