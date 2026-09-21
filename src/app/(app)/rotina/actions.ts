'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';

export async function createRoutine(formData: FormData) {
  const supabase=createClient();
  const {data:{user}}=await supabase.auth.getUser();
  if(!user) throw new Error('Não autenticado.');
  const name=String(formData.get('name')??'').trim();
  if(!name)return;
  await supabase.from('routines').insert({user_id:user.id,name});
  revalidatePath('/rotina');
}

export async function addRoutineItem(formData: FormData) {
  const supabase=createClient();
  const {data:{user}}=await supabase.auth.getUser();
  if(!user) throw new Error('Não autenticado.');
  const routine_id=String(formData.get('routine_id'));
  const title=String(formData.get('title')??'').trim();
  if(!title)return;
  const {count}=await supabase.from('routine_items').select('id',{count:'exact',head:true}).eq('routine_id',routine_id).eq('user_id',user.id);
  await supabase.from('routine_items').insert({routine_id,user_id:user.id,title,order_index:count??0});
  revalidatePath('/rotina');
}