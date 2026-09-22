import { Sidebar } from '@/components/nav/Sidebar';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-paper">
      <Sidebar />
      <div className="lg:pl-[290px]">
        <div className="sticky top-0 z-20 flex min-h-[64px] items-center justify-between gap-2 border-b border-border/60 bg-paper/90 px-3 py-2.5 backdrop-blur-xl sm:px-5 sm:py-3 lg:min-h-[88px] lg:px-10">
          <div className="flex min-w-0 items-center gap-3 lg:hidden">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-primary text-sm font-black text-primary-foreground shadow-lg">J</div>
            <div className="min-w-0">
              <p className="label-caps truncate text-[13px] font-bold tracking-[0.16em]">SECRETÁRIA</p>
              <p className="truncate text-[9px] text-ink-soft">ORGANIZAÇÃO PESSOAL</p>
            </div>
          </div>
          <div className="hidden lg:block">
            <p className="label-caps text-[10px] font-semibold text-ink-soft">SECRETÁRIA</p>
            <p className="text-xl font-bold tracking-tight">ORGANIZAÇÃO PESSOAL</p>
          </div>
          <div className="ml-auto flex items-center gap-2">
            <div className="hidden items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-3 py-1.5 text-[10px] text-primary sm:flex">
              <span className="h-1.5 w-1.5 rounded-full bg-primary" />
              <span className="label-caps">ATIVO</span>
            </div>
          </div>
        </div>
        <main className="mx-auto w-full max-w-[1480px] space-y-5 px-3 pb-8 pt-4 sm:space-y-7 sm:px-5 sm:pb-8 sm:pt-6 lg:space-y-7 lg:px-10 lg:pb-12 lg:pt-7">
          {children}
        </main>
      </div>
    </div>
  );
}
