import { createClient } from '@/lib/supabase/server';
import { PageHeader } from '@/components/ui/PageHeader';
import { ChatClient } from './ChatClient';

async function getOrCreateConversation(supabase: ReturnType<typeof createClient>, userId: string) {
  const { data: existente } = await supabase.from('ai_conversations').select('id').eq('user_id', userId).order('updated_at', { ascending: false }).limit(1).maybeSingle();
  if (existente) return existente.id;
  const { data: nova } = await supabase.from('ai_conversations').insert({ user_id: userId, title: 'Conversa com a Secretária' }).select('id').single();
  return nova!.id;
}

export default async function SecretariaIaPage() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const conversationId = await getOrCreateConversation(supabase, user!.id);
  const { data: mensagens } = await supabase.from('ai_messages').select('id, role, content').eq('conversation_id', conversationId).order('created_at', { ascending: true });
  return <><PageHeader title="Secretária IA" /><ChatClient conversationId={conversationId} initialMessages={(mensagens ?? []).filter((m) => m.role !== 'system') as any} /></>;
}