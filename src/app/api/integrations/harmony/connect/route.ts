import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';

export async function POST(request: Request) {
  const origin = request.headers.get('origin') ?? '*';
  const cors = { 'Access-Control-Allow-Origin': origin === 'null' ? '*' : origin, 'Access-Control-Allow-Headers': 'content-type', 'Access-Control-Allow-Methods': 'POST, OPTIONS' };
  if (request.method === 'OPTIONS') return new NextResponse(null, { status: 204, headers: cors });

  try {
    const body = await request.json();
    const code = String(body.code ?? '').trim().toUpperCase();
    const householdId = String(body.household_id ?? '').trim();
    const harmonyUserId = String(body.harmony_user_id ?? '').trim();
    if (!/^[A-F0-9]{8}$/.test(code) || !householdId) return NextResponse.json({ error: 'Código inválido.' }, { status: 400, headers: cors });

    const admin = createAdminClient() as any;
    const { data: rows, error } = await admin.from('integrations').select('id,user_id,metadata').eq('provider','harmony_hub').eq('status','pending');
    if (error) return NextResponse.json({ error: error.message }, { status: 500, headers: cors });

    const match = (rows ?? []).find((row: { id: string; user_id: string; metadata: Record<string, unknown> | null }) => {
      const m = (row.metadata ?? {}) as Record<string, unknown>;
      return m.pairing_code === code && typeof m.pairing_expires_at === 'string' && new Date(m.pairing_expires_at).getTime() > Date.now();
    });
    if (!match) return NextResponse.json({ error: 'Código expirado ou não encontrado.' }, { status: 404, headers: cors });

    const metadata = (match.metadata ?? {}) as Record<string, unknown>;
    const token = String(metadata.shared_token ?? '');
    if (!token) return NextResponse.json({ error: 'Código de integração inválido.' }, { status: 500, headers: cors });

    const { error: updateError } = await admin.from('integrations').update({
      status: 'connected',
      external_account_id: householdId,
      connected_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      metadata: { ...metadata, pairing_code: null, pairing_expires_at: null, harmony_household_id: householdId, harmony_user_id: harmonyUserId }
    }).eq('id', match.id);
    if (updateError) return NextResponse.json({ error: updateError.message }, { status: 500, headers: cors });

    return NextResponse.json({ ok: true, token }, { headers: cors });
  } catch {
    return NextResponse.json({ error: 'Requisição inválida.' }, { status: 400, headers: cors });
  }
}

export async function OPTIONS() { return new NextResponse(null, { status: 204, headers: { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Headers': 'content-type', 'Access-Control-Allow-Methods': 'POST, OPTIONS' } }); }