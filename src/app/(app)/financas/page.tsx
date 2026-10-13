'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { PageHeader } from '@/components/ui/PageHeader';

type IntegrationStatus = { connected: boolean; status: string; connected_at: string | null; updated_at: string | null; data_available: boolean };

function StatusCard({ title, value, detail }: { title: string; value: string; detail: string }) {
  return <div className="app-card p-5"><p className="section-label">{title}</p><p className="mt-3 text-xl font-bold text-ink">{value}</p><p className="mt-2 text-sm leading-6 text-ink-soft">{detail}</p></div>;
}

export default function FinancasPage() {
  const [status, setStatus] = useState<IntegrationStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const loadStatus = useCallback(async () => {
    setLoading(true); setError('');
    try {
      const response = await fetch('/api/integrations/harmony/status', { cache: 'no-store' });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error ?? 'Não foi possível consultar a integração.');
      setStatus(data);
    } catch (err) { setError(err instanceof Error ? err.message : 'Erro ao consultar a integração.'); }
    finally { setLoading(false); }
  }, []);
  useEffect(() => { void loadStatus(); }, [loadStatus]);

  return <div className="page-stack">
    <PageHeader title="Finanças" subtitle="Seu painel financeiro conectado ao Harmony Hub." />
    <div className="app-card flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between">
      <div><p className="section-label">FONTE DOS DADOS FINANCEIROS</p><h2 className="mt-2 text-lg font-bold text-ink">Harmony Hub</h2><p className="mt-1 max-w-2xl text-sm leading-6 text-ink-soft">O Harmony Hub continuará sendo a fonte oficial dos lançamentos. O Jarvis não cria uma cópia independente das suas finanças.</p></div>
      <Link href="/ajustes/harmony" className="primary-button inline-flex shrink-0 justify-center">Configurar conexão</Link>
    </div>
    {loading && <div className="app-card p-5 text-sm text-ink-soft">Verificando conexão segura…</div>}
    {error && <div role="alert" className="app-card border border-clay/30 p-5"><p className="font-semibold text-clay">Não foi possível verificar a conexão</p><p className="mt-2 text-sm text-ink-soft">{error}</p><button type="button" onClick={() => void loadStatus()} className="secondary-button mt-4">Tentar novamente</button></div>}
    {!loading && !error && status && <>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <StatusCard title="CONEXÃO" value={status.connected ? 'Conectado' : 'Não conectado'} detail={status.connected ? 'A vinculação está registrada para sua conta.' : 'Vincule sua conta para começar a integração financeira.'} />
        <StatusCard title="DADOS FINANCEIROS" value={status.data_available ? 'Disponíveis' : 'Aguardando integração'} detail={status.data_available ? 'Os dados foram disponibilizados pelo Harmony Hub.' : 'Os valores só aparecerão depois de validar a consulta autenticada ao Harmony Hub.'} />
        <StatusCard title="ÚLTIMA ATUALIZAÇÃO" value={status.updated_at ? new Date(status.updated_at).toLocaleString('pt-BR') : 'Ainda não disponível'} detail="Horário do último registro da integração." />
      </div>
      {!status.connected ? <div className="app-card p-5"><h2 className="font-bold text-ink">Conecte sua conta</h2><p className="mt-2 text-sm leading-6 text-ink-soft">No Jarvis, gere um código temporário. Depois, no Harmony Hub, acesse Painel → Integrações e informe o código para concluir a vinculação.</p><Link href="/ajustes/harmony" className="primary-button mt-4 inline-flex">Abrir vinculação</Link></div> : <div className="app-card p-5"><h2 className="font-bold text-ink">Próxima etapa: dados reais</h2><p className="mt-2 text-sm leading-6 text-ink-soft">A conta está vinculada, mas este painel ainda não consulta saldos, transações ou faturas. Para evitar números incorretos, esses dados não serão simulados. A próxima implementação é a API autenticada de leitura do Harmony Hub, usando o token da integração e o escopo da sua casa/grupo.</p><Link href="/ajustes/harmony" className="secondary-button mt-4 inline-flex">Gerenciar conexão</Link></div>}
    </>}
  </div>;
}
