'use server';

import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';

export async function signIn() {
  const supabase = createClient();

  // A ausência de sessão é normal antes do primeiro acesso. getUser() pode
  // retornar "Auth session missing" nesse cenário, impedindo o login anônimo.
  // getSession() permite distinguir uma sessão existente de uma sessão ausente.
  const { data: { session }, error: sessionError } = await supabase.auth.getSession();

  if (sessionError) {
    redirect('/login?erro=Não%20foi%20possível%20verificar%20a%20sessão.%20Tente%20novamente.');
  }

  if (!session) {
    const { error } = await supabase.auth.signInAnonymously();

    if (error) {
      redirect('/login?erro=Não%20foi%20possível%20iniciar%20a%20sessão.%20Verifique%20se%20o%20acesso%20anônimo%20está%20ativado%20no%20Supabase.');
    }
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
