import { createClient } from '@/lib/supabase/server';
import { PageHeader } from '@/components/ui/PageHeader';
import { ChatClient } from './ChatClient';
import { redirect } from 'next/navigation';

async function getOrCreateConversation(supabase: ReturnType<typeof createClient>, userId: string) {
  const { data: existente, error: buscaError } = await supabase
    .from('ai_conversations')
    .select('id')
    .eq('user_id', userId)
    .order('updated_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (buscaError) {
    console.error('[secretaria-ia] erro ao buscar conversa:', buscaError);
    throw new Error('Não foi possível carregar a conversa da Secretária.');
  }

  if (existente?.id) return existente.id;

  const { data: nova, error: criacaoError } = await supabase
    .from('ai_conversations')
    .insert({ user_id: userId, title: 'Conversa com a Secretária' })
    .select('id')
    .single();

  if (criacaoError || !nova?.id) {
    console.error('[secretaria-ia] erro ao criar conversa:', criacaoError);
    throw new Error('Não foi possível criar a conversa da Secretária.');
  }

  return nova.id;
}

export default async function SecretariaIaPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect('/login');

  const conversationId = await getOrCreateConversation(supabase, user.id);
  const { data: mensagens, error: mensagensError } = await supabase
    .from('ai_messages')
    .select('id, role, content')
    .eq('conversation_id', conversationId)
    .order('created_at', { ascending: true });

  if (mensagensError) {
    console.error('[secretaria-ia] erro ao carregar mensagens:', mensagensError);
  }

  return (
    <>
      <PageHeader title="Secretária IA" />
      <ChatClient
        conversationId={conversationId}
        initialMessages={(mensagens ?? []).filter((m) => m.role !== 'system') as any}
      />
    </>
  );
}
