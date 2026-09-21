'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';

async function getUserOrThrow() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Não autenticado.');
  return { supabase, user };
}

export async function saveRoutineSettings(formData: FormData) {
  const { supabase, user } = await getUserOrThrow();
  const day_start = String(formData.get('day_start') ?? '08:00');
  const day_end = String(formData.get('day_end') ?? '22:00');

  await supabase.from('routine_settings').upsert({
    user_id: user.id,
    day_start,
    day_end,
    updated_at: new Date().toISOString(),
  });
  revalidatePath('/rotina');
}

export async function addRoutineActivity(formData: FormData) {
  const { supabase, user } = await getUserOrThrow();
  const title = String(formData.get('title') ?? '').trim();
  const duration_minutes = Math.max(1, Number(formData.get('duration_minutes') ?? 30));
  const fixed_start = String(formData.get('fixed_start') ?? '').trim() || null;
  const kind = String(formData.get('kind') ?? 'daily') === 'task' ? 'task' : 'daily';

  if (!title) return;

  await supabase.from('routine_activities').insert({
    user_id: user.id,
    title,
    duration_minutes,
    fixed_start,
    kind,
    days_of_week: [0, 1, 2, 3, 4, 5, 6],
  });

  revalidatePath('/rotina');
}

export async function deleteRoutineActivity(formData: FormData) {
  const { supabase, user } = await getUserOrThrow();
  const id = String(formData.get('id') ?? '');
  if (!id) return;

  await supabase.from('routine_activities').delete().eq('id', id).eq('user_id', user.id);
  revalidatePath('/rotina');
}
