'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import { todayISODate } from '@/lib/date';

async function getUserOrThrow() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error('Não autenticado.');
  return { supabase, user };
}

export async function createHabit(formData: FormData) {
  const { supabase, user } = await getUserOrThrow();
  const name = String(formData.get('name') ?? '').trim();
  if (!name) return;

  await supabase.from('habits').insert({ user_id: user.id, name });

  revalidatePath('/habitos');
  revalidatePath('/inicio');
}

export async function toggleHabitToday(formData: FormData) {
  const { supabase, user } = await getUserOrThrow();
  const habitId = String(formData.get('habit_id'));
  const alreadyDone = String(formData.get('already_done')) === 'true';
  const today = todayISODate();

  if (alreadyDone) {
    await supabase
      .from('habit_logs')
      .delete()
      .eq('habit_id', habitId)
      .eq('user_id', user.id)
      .eq('logged_date', today);
  } else {
    await supabase.from('habit_logs').insert({
      habit_id: habitId,
      user_id: user.id,
      logged_date: today,
      done: true,
    });
  }

  revalidatePath('/habitos');
  revalidatePath('/inicio');
}

export async function archiveHabit(formData: FormData) {
  const { supabase, user } = await getUserOrThrow();
  const id = String(formData.get('id'));

  await supabase.from('habits').update({ archived: true }).eq('id', id).eq('user_id', user.id);

  revalidatePath('/habitos');
}