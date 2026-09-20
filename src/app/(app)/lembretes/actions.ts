'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';

async function getUserOrThrow() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Não autenticado.');
  return { supabase, user };
}

export async function createReminder(formData: FormData) {
  const { supabase, user } = await getUserOrThrow();
  const title = String(formData.get('title') ?? '').trim();
  const remind_at = String(formData.get('remind_at') ?? '');
  if (!title || !remind_at) return;
  await supabase.from('reminders').insert({ user_id: user.id, title, remind_at: new Date(remind_at).toISOString() });
  revalidatePath('/lembretes'); revalidatePath('/inicio');
}

export async function dismissReminder(formData: FormData) {
  const { supabase, user } = await getUserOrThrow();
  const id = String(formData.get('id'));
  await supabase.from('reminders').update({ dismissed_at: new Date().toISOString() }).eq('id', id).eq('user_id', user.id);
  revalidatePath('/lembretes'); revalidatePath('/inicio');
}