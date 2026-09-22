export function PageHeader({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <header className="mb-6 rounded-2xl border border-border bg-surface/70 px-4 py-4 shadow-sm sm:px-5 sm:py-5 lg:px-6">
      <div className="flex min-w-0 items-start gap-3">
        <span className="mt-0.5 h-9 w-1 shrink-0 rounded-full bg-primary shadow-[0_0_18px_rgba(217,126,43,.2)]" />
        <div className="min-w-0">
          <p className="mb-1 text-[9px] font-bold tracking-[0.16em] text-primary">SECRETÁRIA</p>
          <h1 className="break-words text-2xl font-extrabold tracking-tight text-ink sm:text-3xl lg:text-[30px]">{title}</h1>
          {subtitle && <p className="mt-1.5 max-w-3xl text-sm leading-6 text-ink-soft sm:text-[15px]">{subtitle}</p>}
        </div>
      </div>
    </header>
  );
}
