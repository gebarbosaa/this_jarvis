import { BottomNav } from '@/components/nav/BottomNav';

const NAV = [
  { href: '/inicio', label: 'INÍCIO' },
  { href: '/semana', label: 'SEMANA' },
  { href: '/tarefas', label: 'TAREFAS' },
  { href: '/habitos', label: 'HÁBITOS' },
  { href: '/notas', label: 'NOTAS' },
  { href: '/objetivos', label: 'OBJETIVOS' },
  { href: '/lembretes', label: 'LEMBRETES' },
  { href: '/secretaria-ia', label: 'SECRETÁRIA IA' },
  { href: '/ajustes', label: 'AJUSTES' },
  { href: '/mais', label: 'PAINEL' },
];

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-dvh bg-paper">
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-[252px] border-r border-sidebarBorder bg-sidebar lg:flex lg:flex-col">
        <div className="flex h-[88px] shrink-0 items-center gap-3 border-b border-sidebarBorder px-5">
          <span className="gradient-primary flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-lg font-black text-black shadow-elegant">J</span>
          <div className="min-w-0">
            <p className="label-caps truncate text-sm text-ink">SECRETÁRIA</p>
            <p className="mt-0.5 truncate text-[9px] font-medium tracking-[0.14em] text-ink-faint">ORGANIZAÇÃO PESSOAL</p>
          </div>
        </div>
        <nav className="min-h-0 flex-1 space-y-1 overflow-y-auto px-3 py-5">
          <p className="mb-3 px-3 text-[9px] font-bold tracking-[0.16em] text-ink-faint">MENU</p>
          {NAV.map((item) => (
            <a key={item.href} href={item.href} className="group flex min-w-0 items-center gap-3 rounded-xl border border-transparent px-3 py-2.5 text-[10px] font-bold tracking-[0.07em] text-ink-soft transition-all hover:border-sidebarBorder hover:bg-secondary hover:text-primary">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-secondary/60 text-[9px] text-ink-faint group-hover:bg-primary/10 group-hover:text-primary">•</span>
              <span className="truncate">{item.label}</span>
            </a>
          ))}
        </nav>
        <div className="shrink-0 border-t border-sidebarBorder p-4">
          <div className="rounded-xl border border-sidebarBorder bg-secondary/30 px-3 py-3">
            <p className="text-[9px] font-bold tracking-[0.12em] text-ink-faint">ACESSO PRIVADO</p>
            <p className="mt-1 text-[10px] text-ink-soft">Sessão protegida por PIN</p>
          </div>
        </div>
      </aside>

      <div className="lg:pl-[252px]">
        <main className="mx-auto min-h-dvh w-full max-w-[1480px] px-4 pb-28 pt-5 sm:px-6 lg:px-10 lg:pb-10 lg:pt-8">
          {children}
        </main>
      </div>
      <BottomNav />
    </div>
  );
}
