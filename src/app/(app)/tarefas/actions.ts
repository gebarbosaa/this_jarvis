'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';

async function getUserOrThrow() {
  const supabase = createClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();
  if (error || !user) throw new Error('Sua sessão não foi identificada. Atualize a página e entre novamente.');
  return { supabase, user };
}

export async function createTask(formData: FormData): Promise<{ success: boolean; message: string }> {
  try {
    const { supabase, user } = await getUserOrThrow();
    const title = String(formData.get('title') ?? '').trim();
    if (!title) return { success: false, message: 'Digite o nome da tarefa.' };

    const due_date = String(formData.get('due_date') ?? '') || null;
    const rawPriority = String(formData.get('priority') ?? 'medium');
    const priority = (['low', 'medium', 'high'].includes(rawPriority) ? rawPriority : 'medium') as 'low' | 'medium' | 'high';

    const { error } = await supabase.from('tasks').insert({
      user_id: user.id,
      title,
      due_date,
      priority,
    });

    if (error) {
      console.error('Erro ao salvar tarefa no Supabase:', error.message);
      return { success: false, message: 'Não foi possível salvar a tarefa. Verifique a conexão com o banco de dados e tente novamente.' };
    }

    revalidatePath('/tarefas');
    revalidatePath('/inicio');
    return { success: true, message: 'Tarefa salva com sucesso.' };
  } catch (error) {
    console.error('Erro ao criar tarefa:', error);
    return { success: false, message: error instanceof Error ? error.message : 'Ocorreu um erro ao salvar a tarefa.' };
  }
}

export async function toggleTask(formData: FormData) {
  const { supabase, user } = await getUserOrThrow();
  const id = String(formData.get('id'));
  const currentStatus = String(formData.get('current_status'));
  const nextStatus = currentStatus === 'done' ? 'pending' : 'done';

  const { error } = await supabase
    .from('tasks')
    .update({
      status: nextStatus,
      completed_at: nextStatus === 'done' ? new Date().toISOString() : null,
    })
    .eq('id', id)
    .eq('user_id', user.id);

  if (error) throw new Error('Não foi possível atualizar a tarefa.');
  revalidatePath('/tarefas');
  revalidatePath('/inicio');
}

export async function deleteTask(formData: FormData) {
  const { supabase, user } = await getUserOrThrow();
  const id = String(formData.get('id'));

  const { error } = await supabase.from('tasks').delete().eq('id', id).eq('user_id', user.id);

  if (error) throw new Error('Não foi possível excluir a tarefa.');
  revalidatePath('/tarefas');
  revalidatePath('/inicio');
}
