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

  // Supabase JS 2.45's generic schema typing infers `never` for this generated
  // table Update shape. Keep the payload narrowly scoped to this one known column.
  const { error } = await supabase.from('profiles').update({ display_name } as never).eq('id', user.id);
  if (error) {
    console.error('[ajustes] Falha ao atualizar perfil', error);
    throw new Error('Não foi possível salvar as alterações do perfil.');
  }

  revalidatePath('/ajustes');
  revalidatePath('/inicio');
}