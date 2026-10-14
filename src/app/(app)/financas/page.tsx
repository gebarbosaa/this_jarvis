'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { PageHeader } from '@/components/ui/PageHeader';

type FinanceTransaction = {
  id: string;
  date: string;
  description: string;
  amount: number | string;
  type: string;
  category: string | null;
  paid: boolean;
  card_name: string | null;
  responsible: string | null;
  installment_current: number | null;
  installment_total: number | null;
};
type FinanceCard = {
  id: string;
  name: string;
  brand: string | null;
  last4: string | null;
  credit_limit: number | string | null;
  close_day: number | null;
  due_day: number | null;
};
type FinanceInvoice = {
  id: string;
  card_id: string;
  period: string;
  total: number | string;
  status: string;
};
type FinanceInstallment = {
  id: string;
  name: string;
  purchase_date: string;
  total_amount: number | string;
  installments_count: number;
  paid_count: number;
  category: string | null;
  responsible: string | null;
  card_id: string | null;
  card_name: string | null;
};
type FinanceFixedCost = {
  id: string;
  name: string;
  amount: number | string;
  due_day: number | null;
  category: string | null;
  responsible: string | null;
};
type FinancePayload = {
  period: string;
  summary: {
    income: number;
    expenses: number;
    investments: number;
    balance: number;
    invoice_total: number;
    cards_count: number;
    installments_count: number;
    fixed_costs_count: number;
  };
  transactions: FinanceTransaction[];
  cards: FinanceCard[];
  invoices: FinanceInvoice[];
  installments: FinanceInstallment[];
  fixed_costs: FinanceFixedCost[];
  synced_at: string;
};
type IntegrationStatus = {
  connected: boolean;
  status: string;
  connected_at: string | null;
  updated_at: string | null;
  data_available: boolean;
  finance: FinancePayload | null;
  data_error: string | null;
};

function MetricCard({ symbol, label, value, description, tone = 'cyan' }: {
  symbol: string; label: string; value: string; description: string;
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
        <span className={`inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-lg font-bold ring-1 ${tones[tone]}`} aria-hidden="true">{symbol}</span>
      </div>
      <p className="mt-5 break-words text-xl font-bold tracking-tight text-ink sm:text-2xl">{value}</p>
      <p className="mt-2 text-xs leading-5 text-ink-soft">{description}</p>
    </article>
  );
}

const money = (value: number | string | undefined) =>
  typeof value === 'number' || typeof value === 'string'
    ? Number(value).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
    : '—';

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
              <span aria-hidden="true">◆</span> FONTE FINANCEIRA OFICIAL
            </div>
            <h2 className="text-xl font-bold tracking-tight text-ink sm:text-2xl">Harmony Hub</h2>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-ink-soft">
              O Jarvis consulta os dados financeiros do Harmony Hub. Assim, seus lançamentos não ficam duplicados nem divergentes entre os aplicativos.
            </p>
          </div>
          <Link href="/ajustes/harmony" className="primary-button inline-flex shrink-0 items-center justify-center gap-2">
            {connected ? 'Gerenciar conexão' : 'Conectar Harmony Hub'} <span aria-hidden="true">↗</span>
          </Link>
        </div>
      </section>

      {loading && <div className="app-card flex items-center gap-3 p-5 text-sm text-ink-soft" role="status"><span className="animate-spin text-cyan-300" aria-hidden="true">◌</span> Verificando conexão segura…</div>}

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
            <MetricCard symbol="↗" label="SALDO DO MÊS" value={status.finance ? money(status.finance.summary.balance) : '—'} description={status.finance ? `Saldo calculado em ${status.finance.period}.` : 'Aguardando leitura segura dos dados financeiros.'} />
            <MetricCard symbol="＋" label="RECEITAS DO MÊS" value={status.finance ? money(status.finance.summary.income) : '—'} description={status.finance ? 'Entradas registradas no Harmony Hub.' : 'Nenhum valor fictício será exibido.'} tone="green" />
            <MetricCard symbol="◉" label="DESPESAS DO MÊS" value={status.finance ? money(status.finance.summary.expenses) : '—'} description={status.finance ? `${status.finance.summary.cards_count} cartão(ões) vinculados.` : 'Nenhum valor fictício será exibido.'} tone="amber" />
            <MetricCard symbol="▤" label="FATURAS DO MÊS" value={status.finance ? money(status.finance.summary.invoice_total) : '—'} description={status.finance ? `${status.finance.summary.installments_count} parcelado(s) cadastrados.` : 'Faturas serão exibidas após validar a conexão.'} tone="violet" />
          </div>

          <section className="app-card p-5 sm:p-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <p className="section-label">STATUS DA INTEGRAÇÃO</p>
                <h2 className="mt-2 text-lg font-bold text-ink">{connected ? 'Conta vinculada' : 'Vamos conectar suas finanças'}</h2>
                <p className="mt-2 max-w-2xl text-sm leading-6 text-ink-soft">
                  {connected
                    ? status.data_available
                      ? 'Conexão ativa e dados financeiros recebidos diretamente do Harmony Hub. Os registros permanecem no Harmony Hub, que é a fonte oficial.'
                      : status.data_error || 'A conexão está ativa, mas os dados financeiros ainda não estão disponíveis.'
                    : 'Gere um código temporário nesta página de configuração e conclua a vinculação no Harmony Hub em Painel → Integrações.'}
                </p>
              </div>
              <span className={`inline-flex w-fit items-center gap-2 rounded-full px-3 py-1.5 text-xs font-bold ${connected ? 'bg-emerald-400/10 text-emerald-300' : 'bg-amber-400/10 text-amber-200'}`}>
                <span className={`h-1.5 w-1.5 rounded-full ${connected ? 'bg-emerald-300' : 'bg-amber-300'}`} />
                {connected ? 'VÍNCULO ATIVO' : 'AÇÃO NECESSÁRIA'}
              </span>
            </div>
            <div className="mt-5 flex flex-col gap-3 border-t pt-4 sm:flex-row sm:items-center sm:justify-between" style={{ borderColor: 'var(--border)' }}>
              <p className="text-xs text-ink-soft">{status.finance?.synced_at ? `Dados sincronizados: ${new Date(status.finance.synced_at).toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' })}` : lastUpdated ? `Última atualização do vínculo: ${lastUpdated}` : 'Última atualização: ainda não disponível'}</p>
              <div className="flex flex-wrap gap-2">
                <button type="button" onClick={() => void loadStatus()} className="secondary-button inline-flex items-center gap-2"><span aria-hidden="true">↻</span> Atualizar status</button>
                <Link href="/ajustes/harmony" className="primary-button inline-flex items-center justify-center">Configurar integração</Link>
              </div>
            </div>
          </section>


          {status.finance && (
            <section className="app-card p-5 sm:p-6">
              <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
                <div>
                  <p className="section-label">MOVIMENTAÇÕES RECENTES</p>
                  <h2 className="mt-2 text-lg font-bold text-ink">Fluxo financeiro · {status.finance.period}</h2>
                </div>
                <span className="text-xs text-ink-soft">Somente leitura · Harmony Hub</span>
              </div>
              {status.finance.transactions.length === 0 ? (
                <p className="py-8 text-center text-sm text-ink-soft">Nenhuma movimentação neste mês.</p>
              ) : (
                <div className="divide-y" style={{ borderColor: 'var(--border)' }}>
                  {status.finance.transactions.slice(0, 10).map((item) => (
                    <div key={item.id} className="flex flex-wrap items-center justify-between gap-3 py-3">
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-semibold text-ink">{item.description}</p>
                        <p className="mt-1 text-xs text-ink-soft">
                          {new Date(`${item.date}T12:00:00`).toLocaleDateString('pt-BR')}
                          {item.category ? ` · ${item.category}` : ''}
                          {item.card_name ? ` · ${item.card_name}` : ''}
                          {item.installment_current && item.installment_total ? ` · Parcela ${item.installment_current}/${item.installment_total}` : ''}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className={`text-sm font-bold ${item.type === 'RECEITA' ? 'text-emerald-300' : 'text-ink'}`}>
                          {item.type === 'RECEITA' ? '+' : item.type === 'DESPESA' || item.type === 'INVESTIMENTO' ? '−' : ''}
                          {money(item.amount)}
                        </p>
                        <p className="mt-1 text-[10px] text-ink-soft">{item.paid ? 'PAGO' : 'PENDENTE'}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>
          )}


          <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
            <section className="app-card p-5 sm:p-6">
              <div className="mb-4">
                <p className="section-label">CARTÕES</p>
                <h2 className="mt-2 text-lg font-bold text-ink">Cartões vinculados</h2>
              </div>
              {!status.finance.cards.length ? (
                <p className="py-5 text-sm text-ink-soft">Nenhum cartão cadastrado no Harmony Hub.</p>
              ) : (
                <div className="space-y-3">
                  {status.finance.cards.map((card) => (
                    <div key={card.id} className="rounded-xl border p-4" style={{ borderColor: 'var(--border)' }}>
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <p className="truncate text-sm font-semibold text-ink">{card.name}</p>
                          <p className="mt-1 text-xs text-ink-soft">{[card.brand, card.last4 ? `final ${card.last4}` : null].filter(Boolean).join(' · ') || 'Cartão de crédito'}</p>
                        </div>
                        <p className="shrink-0 text-sm font-bold text-ink">{money(card.credit_limit)}</p>
                      </div>
                      <p className="mt-3 text-xs text-ink-soft">Fechamento: {card.close_day ?? '—'} · Vencimento: {card.due_day ?? '—'}</p>
                    </div>
                  ))}
                </div>
              )}
              <p className="mt-3 text-[11px] text-ink-soft">Limites e datas são somente leitura e vêm do Harmony Hub.</p>
            </section>

            <section className="app-card p-5 sm:p-6">
              <div className="mb-4">
                <p className="section-label">FATURAS</p>
                <h2 className="mt-2 text-lg font-bold text-ink">Faturas de {status.finance.period}</h2>
              </div>
              {!status.finance.invoices.length ? (
                <p className="py-5 text-sm text-ink-soft">Nenhuma fatura encontrada para este mês.</p>
              ) : (
                <div className="space-y-3">
                  {status.finance.invoices.map((invoice) => {
                    const card = status.finance!.cards.find((item) => item.id === invoice.card_id);
                    return (
                      <div key={invoice.id} className="flex items-center justify-between gap-3 rounded-xl border p-4" style={{ borderColor: 'var(--border)' }}>
                        <div className="min-w-0">
                          <p className="truncate text-sm font-semibold text-ink">{card?.name ?? 'Cartão'}</p>
                          <p className="mt-1 text-xs text-ink-soft">{invoice.period} · {invoice.status}</p>
                        </div>
                        <p className="shrink-0 text-sm font-bold text-ink">{money(invoice.total)}</p>
                      </div>
                    );
                  })}
                </div>
              )}
            </section>

            <section className="app-card p-5 sm:p-6">
              <div className="mb-4">
                <p className="section-label">PARCELADOS</p>
                <h2 className="mt-2 text-lg font-bold text-ink">Compras parceladas</h2>
              </div>
              {!status.finance.installments.length ? (
                <p className="py-5 text-sm text-ink-soft">Nenhuma compra parcelada cadastrada.</p>
              ) : (
                <div className="divide-y" style={{ borderColor: 'var(--border)' }}>
                  {status.finance.installments.slice(0, 12).map((item) => (
                    <div key={item.id} className="flex items-center justify-between gap-3 py-3">
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold text-ink">{item.name}</p>
                        <p className="mt-1 text-xs text-ink-soft">{item.card_name || item.category || 'Parcelado'} · {item.paid_count}/{item.installments_count} pagas</p>
                      </div>
                      <p className="shrink-0 text-sm font-bold text-ink">{money(item.total_amount)}</p>
                    </div>
                  ))}
                </div>
              )}
            </section>

            <section className="app-card p-5 sm:p-6">
              <div className="mb-4">
                <p className="section-label">CUSTOS FIXOS</p>
                <h2 className="mt-2 text-lg font-bold text-ink">Compromissos recorrentes</h2>
              </div>
              {!status.finance.fixed_costs.length ? (
                <p className="py-5 text-sm text-ink-soft">Nenhum custo fixo cadastrado.</p>
              ) : (
                <div className="divide-y" style={{ borderColor: 'var(--border)' }}>
                  {status.finance.fixed_costs.slice(0, 12).map((item) => (
                    <div key={item.id} className="flex items-center justify-between gap-3 py-3">
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold text-ink">{item.name}</p>
                        <p className="mt-1 text-xs text-ink-soft">Vencimento dia {item.due_day ?? '—'}{item.category ? ` · ${item.category}` : ''}</p>
                      </div>
                      <p className="shrink-0 text-sm font-bold text-ink">{money(item.amount)}</p>
                    </div>
                  ))}
                </div>
              )}
            </section>
          </div>

          <p className="px-1 text-xs leading-5 text-ink-soft">
            Privacidade: os números financeiros só serão exibidos depois de validar a autenticação, as permissões e o escopo da sua conta. Nenhum dado financeiro fictício é usado neste painel.
          </p>
        </>
      )}
    </div>
  );
}
