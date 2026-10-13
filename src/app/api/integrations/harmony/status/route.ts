import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';

export const dynamic = 'force-dynamic';

export async function GET() {
  const supabase = createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) return NextResponse.json({ error: 'Não autenticado.' }, { status: 401 });

  const admin = createAdminClient() as any;
  const { data, error } = await admin.from('integrations')
    .select('status, connected_at, updated_at')
    .eq('user_id', user.id).eq('provider', 'harmony_hub').maybeSingle();

  if (error) {
    console.error('[harmony-finance-status]', error.message);
    return NextResponse.json({ error: 'Não foi possível consultar a conexão com o Harmony Hub.' }, { status: 500 });
  }

  return NextResponse.json({
    connected: data?.status === 'connected',
    status: data?.status ?? 'not_connected',
    connected_at: data?.connected_at ?? null,
    updated_at: data?.updated_at ?? null,
    data_available: false
  });
}
