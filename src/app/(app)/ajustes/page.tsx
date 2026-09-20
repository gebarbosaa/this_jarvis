import { createClient } from '@/lib/supabase/server';
import { PageHeader } from '@/components/ui/PageHeader';
import { signOut } from '../../(auth)/actions';
import { updateProfile } from './actions';

export default async function AjustesPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: profile } = await supabase
    .from('profiles')
    .select('display_name, timezone')
    .eq('id', user!.id)
    .single();

  return (
    <>
      <PageHeader title="Ajustes" />

      <form action={updateProfile} className="flex flex-col gap-4 rounded-card border border-border bg-white p-4">
        <label className="flex flex-col gap-1.5">
          <span className="text-sm text-ink-soft">Nome</span>
          <input
            type="text"
            name="display_name"
            defaultValue={profile?.display_name ?? ''}
            className="rounded-md border border-border bg-paper px-3 py-2 text-ink outline-none focus:border-pine"
          />
        </label>

        <label className="flex flex-col gap-1.5">
          <span className="text-sm text-ink-soft">E-mail</span>
          <input
            type="email"
            value={user?.email ?? ''}
            disabled
            className="rounded-md border border-border bg-surface px-3 py-2 text-ink-faint outline-none"
          />
        </label>

        <button type="submit" className="self-start rounded-md bg-pine px-4 py-2 text-sm font-medium text-white">
          Salvar
        </button>
      </form>

      <div className="mt-6 rounded-card border border-dashed border-border p-4 text-sm text-ink-faint">
        A integração com o Harmony Hub vai aparecer aqui quando estiver pronta.
      </div>

      <form action={signOut} className="mt-6">
        <button type="submit" className="text-sm font-medium text-clay">
          Sair da conta
        </button>
      </form>
    </>
  );
}