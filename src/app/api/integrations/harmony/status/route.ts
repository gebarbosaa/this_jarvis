import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';

export const dynamic = 'force-dynamic';

export async function GET() {
  const supabase = createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return NextResponse.json({ error: 'Não autenticado.' }, { status: 401, headers: { 'Cache-Control': 'no-store' } });
  }

  const admin = createAdminClient() as any;
  const { data, error } = await admin.from('integrations')
    .select('status, connected_at, updated_at, metadata')
    .eq('user_id', user.id)
    .eq('provider', 'harmony_hub')
    .maybeSingle();

  if (error) {
    console.error('[harmony-finance-status]', error.message);
    return NextResponse.json({ error: 'Não foi possível consultar a conexão com o Harmony Hub.' }, { status: 500, headers: { 'Cache-Control': 'no-store' } });
  }

  const connected = data?.status === 'connected';
  const metadata = (data?.metadata ?? {}) as Record<string, unknown>;
  const token = typeof metadata.shared_token === 'string' ? metadata.shared_token : '';
  let finance: Record<string, unknown> | null = null;
  let dataError: string | null = null;

  if (connected && token) {
    const baseUrl = (process.env.HARMONY_HUB_API_URL || 'https://harmony-hub-git-feat-jarvis-finance-api-gedograuuu.vercel.app').replace(/\/$/, '');
    try {
      const response = await fetch(`${baseUrl}/api/jarvis/finance`, {
        method: 'GET',
        headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' },
        cache: 'no-store',
        signal: AbortSignal.timeout(8000),
      });
      const payload = await response.json().catch(() => ({}));
      if (response.ok && payload && payload.ok === true) {
        finance = payload as Record<string, unknown>;
      } else {
        dataError = response.status === 401
          ? 'A autorização entre os aplicativos precisa ser renovada.'
          : 'O Harmony Hub ainda não disponibilizou os dados financeiros.';
        console.error('[harmony-finance-status] upstream finance request failed', response.status);
      }
    } catch (upstreamError) {
      dataError = 'Não foi possível alcançar o Harmony Hub agora.';
      console.error('[harmony-finance-status] upstream request failed', upstreamError);
    }
  } else if (connected) {
    dataError = 'A conexão não possui uma credencial de leitura válida.';
  }

  return NextResponse.json({
    connected,
    status: data?.status ?? 'not_connected',
    connected_at: data?.connected_at ?? null,
    updated_at: data?.updated_at ?? null,
    data_available: Boolean(finance),
    finance,
    data_error: dataError,
  }, { headers: { 'Cache-Control': 'no-store, private' } });
}
