export function PageHeader({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <header className="flex flex-wrap items-center justify-between gap-4">
      <div className="min-w-0">
        <div className="flex items-center gap-2">
          <span className="h-7 w-1 shrink-0 rounded-full bg-primary" />
          <h1 className="label-caps break-words text-2xl font-bold tracking-tight text-ink sm:text-3xl">{title}</h1>
        </div>
        {subtitle && <p className="ml-3 mt-1 max-w-3xl text-sm text-ink-soft">{subtitle}</p>}
      </div>
    </header>
  );
}
