export function PageHeader({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <header className="mb-6 border-b border-border/70 pb-5">
      <div className="flex min-w-0 items-start gap-3">
        <span className="mt-1 h-8 w-1 shrink-0 rounded-full bg-primary shadow-[0_0_18px_rgba(217,126,43,.2)]" />
        <div className="min-w-0">
          <h1 className="label-caps break-words text-xl font-extrabold tracking-tight text-ink sm:text-2xl lg:text-[28px]">{title}</h1>
          {subtitle && <p className="mt-2 max-w-2xl text-sm leading-6 text-ink-soft sm:text-[15px]">{subtitle}</p>}
        </div>
      </div>
    </header>
  );
}