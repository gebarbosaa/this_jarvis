export function PageHeader({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <header className="mb-6 flex flex-wrap items-center justify-between gap-4">
      <div>
        <div className="flex items-center gap-2">
          <span className="h-7 w-1 rounded-full bg-primary" />
          <h1 className="label-caps text-2xl font-bold tracking-tight text-ink md:text-3xl">{title}</h1>
        </div>
        {subtitle && <p className="ml-3 mt-1 text-sm text-ink-soft">{subtitle}</p>}
      </div>
    </header>
  );
}