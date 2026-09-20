'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';

async function getUserOrThrow() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error('Não autenticado.');
  return { supabase, user };
}

export async function createNote(formData: FormData) {
  const { supabase, user } = await getUserOrThrow();
  const content = String(formData.get('content') ?? '').trim();
  if (!content) return;

  const title = String(formData.get('title') ?? '').trim();

  await supabase.from('notes').insert({ user_id: user.id, title, content });

  revalidatePath('/notas');
}

export async function togglePin(formData: FormData) {
  const { supabase, user } = await getUserOrThrow();
  const id = String(formData.get('id'));
  const pinned = String(formData.get('pinned')) === 'true';

  await supabase.from('notes').update({ pinned: !pinned }).eq('id', id).eq('user_id', user.id);

  revalidatePath('/notas');
}

export async function deleteNote(formData: FormData) {
  const { supabase, user } = await getUserOrThrow();
  const id = String(formData.get('id'));

  await supabase.from('notes').delete().eq('id', id).eq('user_id', user.id);

  revalidatePath('/notas');
}