import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { gerarResumoDiario } from '@/lib/ai/dailyBrief';
import { gerarPlanoSemanal } from '@/lib/ai/weeklyPlan';

// Executado pelo Vercel Cron (ver vercel.json). Protegido por CRON_SECRET
// para que ninguém de fora consiga disparar isso manualmente.
export async function GET(request: Request) {
  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Não autorizado.' }, { status: 401 });
  }

  if (!process.env.ANTHROPIC_API_KEY) {
    return NextResponse.json({ error: 'ANTHROPIC_API_KEY não configurada.' }, { status: 500 });
  }

  const supabase = createAdminClient();
  const ehSegunda = new Date().getDay() === 1;

  const { data: perfis, error } = await supabase.from('profiles').select('id');
  if (error) {
    console.error(error);
    return NextResponse.json({ error: 'Erro ao listar usuários.' }, { status: 500 });
  }

  const resultados = await Promise.allSettled(
    (perfis ?? []).map(async (perfil) => {
      if (ehSegunda) {
        await gerarPlanoSemanal(supabase, perfil.id);
      }
      const mensagem = await gerarResumoDiario(supabase, perfil.id);
      return { userId: perfil.id, enviado: Boolean(mensagem) };
    })
  );

  const falhas = resultados.filter((r) => r.status === 'rejected');
  if (falhas.length > 0) {
    console.error('Falhas no daily-brief:', falhas);
  }

  return NextResponse.json({
    total: perfis?.length ?? 0,
    falhas: falhas.length,
    plano_semanal_gerado: ehSegunda,
  });
}
