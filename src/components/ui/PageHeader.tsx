export function PageHeader({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <header className="mb-7 flex flex-wrap items-end justify-between gap-4 border-b border-border/70 pb-5">
      <div className="min-w-0">
        <div className="flex items-center gap-3">
          <span className="h-8 w-1 rounded-full bg-primary shadow-[0_0_18px_rgba(217,126,43,.2)]" />
          <h1 className="label-caps text-xl font-extrabold tracking-tight text-ink sm:text-2xl lg:text-[28px]">
            {title}
          </h1>
        </div>
        {subtitle && (
          <p className="ml-4 mt-2 max-w-2xl text-sm leading-6 text-ink-soft sm:text-[15px]">
            {subtitle}
          </p>
        )}
      </div>
    </header>
  );
}