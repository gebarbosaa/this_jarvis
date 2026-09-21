import { PageHeader } from '@/components/ui/PageHeader';

export default function RotinaPage() {
  return (
    <div className="page-stack">
      <PageHeader title="Rotina" subtitle="Organize sua rotina diária sem perder o foco." />
      <section className="app-card p-5 sm:p-6">
        <p className="text-sm text-ink-soft">Sua rotina será organizada aqui.</p>
      </section>
    </div>
  );
}
