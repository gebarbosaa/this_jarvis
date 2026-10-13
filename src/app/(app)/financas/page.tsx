'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowUpRight, CircleDollarSign, CreditCard, RefreshCw, ShieldCheck, WalletCards } from 'lucide-react';
import { PageHeader } from '@/components/ui/PageHeader';

type IntegrationStatus = {
  connected: boolean;
  status: string;
  connected_at: string | null;
  updated_at: string | null;
  data_available: boolean;
};

function MetricCard({
  icon: Icon,
  label,
  value,
  description,
  tone = 'cyan',
}: {
  icon: typeof CircleDollarSign;
  label: string;
  value: string;
  description: string;
  tone?: 'cyan' | 'green' | 'violet' | 'amber';
}) {
  const tones = {
    cyan: 'bg-cyan-400/10 text-cyan-300 ring-cyan-300/20',
    green: 'bg-emerald-400/10 text-emerald-300 ring-emerald-300/20',
    violet: 'bg-violet-400/10 text-violet-300 ring-violet-300/20',
    amber: 'bg-amber-400/10 text-amber-300 ring-amber-300/20',
  };
  return (
    <article className="app-card app-card-hover min-w-0 p-4 sm:p-5">
      <div className="flex items-start justify-between gap-3">
        <p className="section-label">{label}</p>
        <span className={`inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ring-1 ${tones[tone]}`}>
          <Icon className="h-5 w-5" aria-hidden="true" />
        </span>
      </div>
      <p className="mt-5 break-words text-xl font-bold tracking-tight text-ink sm:text-2xl">{value}</p>
      <p className="mt-2 text-xs leading-5 text-ink-soft">{description}</p>
    </article>
  );
}

export default function FinancasPage() {
  const [status, setStatus] = useState<IntegrationStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadStatus = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const response = await fetch('/api/integrations/harmony/status', { cache: 'no-store' });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error ?? 'Não foi possível consultar a integração.');
      setStatus(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao consultar a integração.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { void loadStatus(); }, [loadStatus]);

  const connected = Boolean(status?.connected);
  const lastUpdated = status?.updated_at
    ? new Date(status.updated_at).toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' })
    : null;

  return (
    <div className="page-stack">
      <PageHeader title="Finanças" subtitle="Acompanhe suas finanças no Jarvis, com o Harmony Hub como fonte oficial dos dados." />

      <section className="relative overflow-hidden rounded-2xl border p-5 sm:p-7" style={{ borderColor: 'rgba(75, 190, 220, .28)', background: 'linear-gradient(125deg, rgba(21, 57, 78, .72), rgba(18, 28, 51, .92) 62%, rgba(33, 31, 69, .7))' }}>
        <div className="pointer-events-none absolute -right-12 -top-16 h-52 w-52 rounded-full bg-cyan-400/10 blur-3xl" />
        <div className="relative flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
          <div className="min-w-0">
            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-cyan-300/20 bg-cyan-300/10 px-3 py-1.5 text-xs font-semibold text-cyan-200">
              <ShieldCheck className="h-4 w-4" />
              FONTE FINANCEIRA OFICIAL
            </div>
            <h2 className="text-xl font-bold tracking-tight text-ink sm:text-2xl">Harmony Hub</h2>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-ink-soft">
              O Jarvis consulta os dados financeiros do Harmony Hub. Assim, seus lançamentos não ficam duplicados nem divergentes entre os aplicativos.
            </p>
          </div>
          <Link href="/ajustes/harmony" className="primary-button inline-flex shrink-0 items-center justify-center gap-2">
            {connected ? 'Gerenciar conexão' : 'Conectar Harmony Hub'}
            <ArrowUpRight className="h-4 w-4" />
          </Link>
        </div>
      </section>

      {loading && (
        <div className="app-card flex items-center gap-3 p-5 text-sm text-ink-soft" role="status">
          <RefreshCw className="h-4 w-4 animate-spin text-cyan-300" /> Verificando conexão segura…
        </div>
      )}

      {error && (
        <div role="alert" className="app-card border border-rose-400/30 p-5">
          <p className="font-semibold text-rose-300">Não foi possível verificar a conexão</p>
          <p className="mt-2 text-sm leading-6 text-ink-soft">{error}</p>
          <button type="button" onClick={() => void loadStatus()} className="secondary-button mt-4">Tentar novamente</button>
        </div>
      )}

      {!loading && !error && status && (
        <>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <MetricCard icon={ShieldCheck} label="CONEXÃO" value={connected ? 'Conectado' : 'Desconectado'} description={connected ? 'Vínculo identificado para sua conta.' : 'Conecte sua conta para iniciar.'} tone={connected ? 'green' : 'amber'} />
            <MetricCard icon={WalletCards} label="SALDO DO MÊS" value="—" description="Será exibido após ativar a leitura financeira autenticada." />
            <MetricCard icon={CircleDollarSign} label="DESPESAS DO MÊS" value="—" description="Sem valores simulados: os dados virão do Harmony Hub." tone="amber" />
            <MetricCard icon={CreditCard} label="FATURAS E PARCELAS" value="—" description="Faturas, cartões e parcelas serão carregados pela integração." tone="violet" />
          </div>

          <section className="app-card p-5 sm:p-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <p className="section-label">STATUS DA INTEGRAÇÃO</p>
                <h2 className="mt-2 text-lg font-bold text-ink">{connected ? 'Conta vinculada' : 'Vamos conectar suas finanças'}</h2>
                <p className="mt-2 max-w-2xl text-sm leading-6 text-ink-soft">
                  {connected
                    ? 'O vínculo foi localizado. A leitura de saldos, lançamentos, cartões e faturas ainda precisa estar disponível por uma API segura do Harmony Hub antes de mostrar valores aqui.'
                    : 'Gere um código temporário nesta página de configuração e conclua a vinculação no Harmony Hub em Painel → Integrações.'}
                </p>
              </div>
              <span className={`inline-flex w-fit items-center gap-2 rounded-full px-3 py-1.5 text-xs font-bold ${connected ? 'bg-emerald-400/10 text-emerald-300' : 'bg-amber-400/10 text-amber-200'}`}>
                <span className={`h-1.5 w-1.5 rounded-full ${connected ? 'bg-emerald-300' : 'bg-amber-300'}`} />
                {connected ? 'VÍNCULO ATIVO' : 'AÇÃO NECESSÁRIA'}
              </span>
            </div>
            <div className="mt-5 flex flex-col gap-3 border-t pt-4 sm:flex-row sm:items-center sm:justify-between" style={{ borderColor: 'var(--border)' }}>
              <p className="text-xs text-ink-soft">{lastUpdated ? `Última atualização do vínculo: ${lastUpdated}` : 'Última atualização: ainda não disponível'}</p>
              <div className="flex flex-wrap gap-2">
                <button type="button" onClick={() => void loadStatus()} className="secondary-button inline-flex items-center gap-2"><RefreshCw className="h-4 w-4" /> Atualizar status</button>
                <Link href="/ajustes/harmony" className="primary-button inline-flex items-center justify-center">Configurar integração</Link>
              </div>
            </div>
          </section>

          <p className="px-1 text-xs leading-5 text-ink-soft">
            Privacidade: os números financeiros só serão exibidos depois de validar a autenticação, as permissões e o escopo da sua conta. Nenhum dado financeiro fictício é usado neste painel.
          </p>
        </>
      )}
    </div>
  );
}
