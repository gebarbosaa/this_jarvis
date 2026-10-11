'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';

export async function updateProfile(formData: FormData) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;

  const display_name = String(formData.get('display_name') ?? '').trim();

  await supabase.from('profiles').update({ display_name }).eq('id', user.id);

  revalidatePath('/ajustes');
  revalidatePath('/inicio');
}