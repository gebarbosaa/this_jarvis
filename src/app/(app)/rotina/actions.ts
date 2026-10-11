'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';

async function getUserOrThrow() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Não autenticado.');
  return { supabase, user };
}

export async function createRoutine(formData: FormData) {
  const { supabase, user } = await getUserOrThrow();
  const name = String(formData.get('name') ?? '').trim().slice(0, 120);
  if (!name) throw new Error('Informe o nome da rotina.');

  const { error } = await supabase.from('routines').insert({
    user_id: user.id,
    name,
  });

  if (error) {
    console.error('[rotina] Falha ao criar rotina', error);
    throw new Error('Não foi possível criar a rotina.');
  }

  revalidatePath('/rotina');
  revalidatePath('/rotinas');
}

export async function saveRoutineSettings(formData: FormData) {
  const { supabase, user } = await getUserOrThrow();
  const dayStart = String(formData.get('day_start') || '08:00');
  const dayEnd = String(formData.get('day_end') || '22:00');
  if (!/^([01]\d|2[0-3]):[0-5]\d$/.test(dayStart) || !/^([01]\d|2[0-3]):[0-5]\d$/.test(dayEnd)) {
    throw new Error('Informe horários válidos para o início e o fim do dia.');
  }
  if (dayEnd <= dayStart) throw new Error('O fim do dia precisa ser depois do início.');
  const { error } = await supabase.from('routine_settings').upsert({
    user_id: user.id, day_start: dayStart, day_end: dayEnd, updated_at: new Date().toISOString(),
  });
  if (error) {
    console.error('[rotina] Falha ao salvar horários', error);
    throw new Error('Não foi possível salvar os horários da rotina.');
  }
  revalidatePath('/rotina');
}

export async function addRoutineActivity(formData: FormData) {
  const { supabase, user } = await getUserOrThrow();
  const title = String(formData.get('title') || '').trim().slice(0, 120);
  if (!title) throw new Error('Informe o nome da atividade.');
  const rawDuration = Number(formData.get('duration_minutes') || 30);
  if (!Number.isFinite(rawDuration)) throw new Error('Informe uma duração válida.');
  const duration = Math.min(1440, Math.max(1, Math.round(rawDuration)));
  const rawFixedStart = String(formData.get('fixed_start') || '').trim();
  if (rawFixedStart && !/^([01]\d|2[0-3]):[0-5]\d$/.test(rawFixedStart)) {
    throw new Error('Informe um horário fixo válido.');
  }
  const days = [...new Set(formData.getAll('days_of_week').map(Number).filter((day) => Number.isInteger(day) && day >= 0 && day <= 6))];
  const { error } = await supabase.from('routine_activities').insert({
    user_id: user.id,
    title,
    duration_minutes: duration,
    fixed_start: rawFixedStart || null,
    kind: String(formData.get('kind') || 'daily') === 'task' ? 'task' : 'daily',
    days_of_week: days.length ? days : [1, 2, 3, 4, 5],
  });
  if (error) {
    console.error('[rotina] Falha ao adicionar atividade', error);
    throw new Error('Não foi possível adicionar a atividade à rotina.');
  }
  revalidatePath('/rotina');
}

export async function deleteRoutineActivity(formData: FormData) {
  const { supabase, user } = await getUserOrThrow();
  const id = String(formData.get('id') || '');
  if (!id) return;
  const { error } = await supabase.from('routine_activities').delete().eq('id', id).eq('user_id', user.id);
  if (error) {
    console.error('[rotina] Falha ao remover atividade', error);
    throw new Error('Não foi possível remover a atividade.');
  }
  revalidatePath('/rotina');
}
