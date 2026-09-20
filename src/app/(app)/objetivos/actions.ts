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

export async function createGoal(formData: FormData) {
  const { supabase, user } = await getUserOrThrow();
  const title = String(formData.get('title') ?? '').trim();
  if (!title) return;

  const target_date = String(formData.get('target_date') ?? '') || null;

  await supabase.from('goals').insert({ user_id: user.id, title, target_date });

  revalidatePath('/objetivos');
}

export async function addStep(formData: FormData) {
  const { supabase, user } = await getUserOrThrow();
  const goal_id = String(formData.get('goal_id'));
  const title = String(formData.get('title') ?? '').trim();
  if (!title) return;

  const { count } = await supabase
    .from('goal_steps')
    .select('id', { count: 'exact', head: true })
    .eq('goal_id', goal_id);

  await supabase.from('goal_steps').insert({
    goal_id,
    user_id: user.id,
    title,
    order_index: count ?? 0,
  });

  revalidatePath('/objetivos');
}

export async function toggleStep(formData: FormData) {
  const { supabase, user } = await getUserOrThrow();
  const id = String(formData.get('id'));
  const done = String(formData.get('done')) === 'true';

  await supabase.from('goal_steps').update({ done: !done }).eq('id', id).eq('user_id', user.id);

  revalidatePath('/objetivos');
}