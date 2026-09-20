'use client';

import { useRouter } from 'next/navigation';
import { useState, useTransition } from 'react';

export function WeeklyPlanCard({
  initialSummary,
  initialFocus,
}: {
  initialSummary: string | null;
  initialFocus: string | null;
}) {
  const [summary, setSummary] = useState(initialSummary);
  const [focus, setFocus] = useState(initialFocus);
  const [erro, setErro] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  function gerar() {
    setErro(null);
    startTransition(async () => {
      try {
        const res = await fetch('/api/ai/weekly-plan', { method: 'POST' });
        const data = await res.json();
        if (!res.ok) {
          setErro(data.error ?? 'Não foi possível gerar o plano.');
          return;
        }
        setSummary(data.summary);
        setFocus(data.focus);
        router.refresh();
      } catch {
        setErro('Não foi possível gerar o plano agora.');
      }
    });
  }

  return (
    <div className="mb-4 rounded-card border border-pine/30 bg-pine-light p-3">
      <div className="flex items-center justify-between gap-2">
        <p className="text-xs font-medium uppercase tracking-wide text-pine">Plano da semana</p>
        <button
          type="button"
          onClick={gerar}
          disabled={isPending}
          className="text-xs font-medium text-pine underline underline-offset-2 disabled:opacity-50"
        >
          {isPending ? 'Gerando...' : summary ? 'Atualizar' : 'Gerar com IA'}
        </button>
      </div>

      {erro && <p className="mt-2 text-xs text-clay">{erro}</p>}

      {summary ? (
        <>
          <p className="mt-2 text-sm text-ink">{summary}</p>
          {focus && <p className="mt-1 text-sm font-medium text-pine-dark">Foco: {focus}</p>}
        </>
      ) : (
        !isPending && <p className="mt-2 text-sm text-ink-soft">Ainda sem plano gerado para esta semana.</p>
      )}
    </div>
  );
}