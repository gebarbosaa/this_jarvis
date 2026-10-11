import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { gerarResumoDiario } from '@/lib/ai/dailyBrief';
import { gerarPlanoSemanal } from '@/lib/ai/weeklyPlan';

export const dynamic = 'force-dynamic';

// Executado pelo Vercel Cron (ver vercel.json). Protegido por CRON_SECRET
// para que ninguém de fora consiga disparar isso manualmente.
export async function GET(request: Request) {
  const cronSecret = process.env.CRON_SECRET;
  if (!cronSecret) {
    console.error('[daily-brief] CRON_SECRET não configurado.');
    return NextResponse.json({ error: 'Cron não configurado no servidor.' }, { status: 500 });
  }

  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'Não autorizado.' }, { status: 401 });
  }

  if (!process.env.GEMINI_API_KEY) {
    return NextResponse.json({ error: 'GEMINI_API_KEY não configurada no servidor.' }, { status: 500 });
  }
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    console.error('[daily-brief] Credenciais administrativas do Supabase não configuradas.');
    return NextResponse.json({ error: 'Banco de dados não configurado no servidor.' }, { status: 500 });
  }

  const supabase = createAdminClient();
  const diaDaSemanaEmSaoPaulo = new Intl.DateTimeFormat('en-US', { timeZone: 'America/Sao_Paulo', weekday: 'short' }).format(new Date());
  const ehSegunda = diaDaSemanaEmSaoPaulo === 'Mon';

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
