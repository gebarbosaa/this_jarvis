import { createClient } from '@/lib/supabase/server';
import { PageHeader } from '@/components/ui/PageHeader';
import { signOut } from '../../(auth)/actions';
import { updateProfile } from './actions';

export default async function AjustesPage() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const { data: profile } = await supabase.from('profiles').select('display_name, timezone').eq('id', user!.id).single();

  return (
    <div className="page-stack">
      <PageHeader title="Ajustes" subtitle="Personalize seus dados e o acesso à sua Secretária." />
      <form action={updateProfile} className="app-card grid gap-5 p-4 sm:p-5 lg:max-w-3xl">
        <label className="grid gap-2"><span className="section-label">Nome</span><input type="text" name="display_name" defaultValue={profile?.display_name ?? ''} className="field w-full" /></label>
        <label className="grid gap-2"><span className="section-label">E-mail</span><input type="email" value={user?.email ?? ''} disabled className="field w-full opacity-60" /></label>
        <button type="submit" className="primary-button w-full sm:w-fit">Salvar alterações</button>
      </form>
      <div className="app-card max-w-3xl p-4 sm:p-5">
        <p className="section-label">Harmony Hub</p>
        <p className="mt-2 text-sm leading-6 text-ink-soft">A integração com o Harmony Hub vai aparecer aqui quando estiver pronta.</p>
      </div>
      <form action={signOut} className="max-w-3xl">
        <button type="submit" className="secondary-button text-clay">Sair da conta</button>
      </form>
    </div>
  );
}