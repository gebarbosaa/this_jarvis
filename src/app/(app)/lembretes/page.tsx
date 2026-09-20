import { createClient } from '@/lib/supabase/server';
import { PageHeader } from '@/components/ui/PageHeader';
import { EmptyState } from '@/components/ui/EmptyState';
import { NewReminderForm } from './NewReminderForm';
import { dismissReminder } from './actions';

export default async function LembretesPage() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const { data: reminders } = await supabase.from('reminders').select('*').eq('user_id', user!.id).is('dismissed_at', null).order('remind_at', { ascending: true });
  return (
    <>
      <PageHeader title="Lembretes" />
      <NewReminderForm />
      {(!reminders || reminders.length === 0) && <EmptyState text="Nenhum lembrete pendente." />}
      <ul className="flex flex-col gap-2">
        {reminders?.map((reminder) => (
          <li key={reminder.id} className="flex items-center gap-3 rounded-card border border-border bg-white px-3 py-3">
            <div className="min-w-0 flex-1"><p className="truncate text-ink">{reminder.title}</p><p className="text-xs text-ink-faint">{new Date(reminder.remind_at).toLocaleString('pt-BR', {day:'numeric',month:'short',hour:'2-digit',minute:'2-digit'})}</p></div>
            <form action={dismissReminder}><input type="hidden" name="id" value={reminder.id} /><button type="submit" className="rounded-full bg-surface px-3 py-1.5 text-xs font-medium text-ink-soft">Concluir</button></form>
          </li>
        ))}
      </ul>
    </>
  );
}