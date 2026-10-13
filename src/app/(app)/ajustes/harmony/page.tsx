'use client';

import { useState } from 'react';
import { PageHeader } from '@/components/ui/PageHeader';

export default function HarmonyIntegrationPage() {
  const [code, setCode] = useState('');
  const [expires, setExpires] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function generate() {
    setLoading(true); setError('');
    try {
      const response = await fetch('/api/integrations/harmony/pairing', { method: 'POST' });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error ?? 'Não foi possível gerar o código.');
      setCode(data.code); setExpires(data.expires_at);
    } catch (e) { setError(e instanceof Error ? e.message : 'Erro ao gerar código.'); }
    finally { setLoading(false); }
  }

  return <div className="page-stack">
    <PageHeader title="Harmony Hub" subtitle="Vincule sua Secretária ao seu ambiente financeiro do Harmony Hub." />
    <div className="app-card max-w-2xl p-5">
      <p className="section-label">CÓDIGO DE VINCULAÇÃO</p>
      <p className="mt-2 text-sm leading-6 text-ink-soft">Gere um código temporário e informe-o no Harmony Hub em Painel → Integrações. O código expira em 10 minutos.</p>
      {code ? <div className="mt-5 rounded-2xl border border-primary/30 bg-primary/5 p-5 text-center">
        <p className="break-all text-2xl font-black tracking-[0.18em] text-primary sm:text-3xl sm:tracking-[0.3em]">{code}</p>
        <p className="mt-2 text-xs text-ink-soft">Expira em {new Date(expires).toLocaleTimeString('pt-BR',{hour:'2-digit',minute:'2-digit'})}</p>
      </div> : null}
      {error ? <p className="mt-4 text-sm text-clay">{error}</p> : null}
      <button onClick={() => void generate()} disabled={loading} className="primary-button mt-5 w-full sm:w-fit">{loading ? 'GERANDO...' : code ? 'GERAR NOVO CÓDIGO' : 'GERAR CÓDIGO'}</button>
    </div>
  </div>;
}