'use server';

import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';

export async function signIn() {
  const supabase = createClient();
  const { error } = await supabase.auth.signInAnonymously();

  if (error) {
    redirect('/login?erro=Não%20foi%20possível%20iniciar%20a%20sessão.%20Ative%20o%20acesso%20anônimo%20no%20Supabase.');
  }

  redirect('/inicio');
}

export async function signUp() {
  redirect('/login');
}

export async function signOut() {
  const supabase = createClient();
  await supabase.auth.signOut();
  redirect('/login');
}
