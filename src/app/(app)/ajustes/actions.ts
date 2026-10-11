'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';

export async function updateProfile(formData: FormData) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error('Não autenticado.');

  const display_name = String(formData.get('display_name') ?? '').trim();

  // @ts-expect-error Supabase's installed generic currently mis-infers the generated profile update payload.
  const { error } = await supabase.from('profiles').update({ display_name }).eq('id', user.id);
  if (error) {
    console.error('[ajustes] Falha ao atualizar perfil', error);
    throw new Error('Não foi possível salvar as alterações do perfil.');
  }

  revalidatePath('/ajustes');
  revalidatePath('/inicio');
}