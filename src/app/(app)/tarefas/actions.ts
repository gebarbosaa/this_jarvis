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

export async function createTask(formData: FormData) {
  const { supabase, user } = await getUserOrThrow();

  const title = String(formData.get('title') ?? '').trim();
  if (!title) return;

  const due_date = String(formData.get('due_date') ?? '') || null;
  const priority = String(formData.get('priority') ?? 'medium');

  await supabase.from('tasks').insert({
    user_id: user.id,
    title,
    due_date,
    priority: priority as 'low' | 'medium' | 'high',
  });

  revalidatePath('/tarefas');
  revalidatePath('/inicio');
}

export async function toggleTask(formData: FormData) {
  const { supabase, user } = await getUserOrThrow();

  const id = String(formData.get('id'));
  const currentStatus = String(formData.get('current_status'));
  const nextStatus = currentStatus === 'done' ? 'pending' : 'done';

  await supabase
    .from('tasks')
    .update({
      status: nextStatus,
      completed_at: nextStatus === 'done' ? new Date().toISOString() : null,
    })
    .eq('id', id)
    .eq('user_id', user.id);

  revalidatePath('/tarefas');
  revalidatePath('/inicio');
}

export async function deleteTask(formData: FormData) {
  const { supabase, user } = await getUserOrThrow();
  const id = String(formData.get('id'));

  await supabase.from('tasks').delete().eq('id', id).eq('user_id', user.id);

  revalidatePath('/tarefas');
  revalidatePath('/inicio');
}