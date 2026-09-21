import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { gerarPlanoSemanal } from '@/lib/ai/weeklyPlan';

export async function POST() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Não autenticado.' }, { status: 401 });
  }

  if (!process.env.GEMINI_API_KEY) {
    return NextResponse.json({ error: 'GEMINI_API_KEY não configurada no servidor.' }, { status: 500 });
  }

  try {
    const plano = await gerarPlanoSemanal(supabase, user.id);
    return NextResponse.json(plano);
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Erro ao gerar o plano.' }, { status: 502 });
  }
}
