import { randomBytes } from 'crypto';
import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';

export async function POST() {
  const supabase = createClient();
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error || !user) return NextResponse.json({ error: 'Não autenticado.' }, { status: 401 });

  const code = randomBytes(4).toString('hex').toUpperCase();
  const token = randomBytes(32).toString('hex');
  const expires = new Date(Date.now() + 10 * 60 * 1000).toISOString();
  const admin = createAdminClient();

  const { error: upsertError } = await admin.from('integrations').upsert({
    user_id: user.id,
    provider: 'harmony_hub',
    status: 'pending',
    external_account_id: null,
    connected_at: null,
    updated_at: new Date().toISOString(),
    metadata: { pairing_code: code, pairing_expires_at: expires, shared_token: token }
  }, { onConflict: 'user_id,provider' });

  if (upsertError) return NextResponse.json({ error: upsertError.message }, { status: 500 });
  return NextResponse.json({ code, expires_at: expires });
}