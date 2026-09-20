'use server';

import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';

export async function signIn(formData: FormData) {
  const email = String(formData.get('email') ?? '');
  const password = String(formData.get('password') ?? '');

  const supabase = createClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    redirect(`/login?erro=${encodeURIComponent(traduzErro(error.message))}`);
  }

  redirect('/inicio');
}

export async function signUp(formData: FormData) {
  const email = String(formData.get('email') ?? '');
  const password = String(formData.get('password') ?? '');
  const displayName = String(formData.get('display_name') ?? '');

  const supabase = createClient();
  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: { data: { display_name: displayName } },
  });

  if (error) {
    redirect(`/cadastro?erro=${encodeURIComponent(traduzErro(error.message))}`);
  }

  redirect('/inicio');
}

export async function signOut() {
  const supabase = createClient();
  await supabase.auth.signOut();
  redirect('/login');
}

function traduzErro(mensagem: string): string {
  if (mensagem.includes('Invalid login credentials')) return 'E-mail ou senha incorretos.';
  if (mensagem.includes('User already registered')) return 'Este e-mail já tem uma conta.';
  if (mensagem.includes('Password should be at least')) return 'A senha precisa de pelo menos 6 caracteres.';
  return 'Algo deu errado. Tente novamente.';
}
