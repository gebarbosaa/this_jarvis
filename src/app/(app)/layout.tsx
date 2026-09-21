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
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-60 border-r border-sidebarBorder bg-sidebar lg:flex lg:flex-col">
        <div className="flex h-20 items-center gap-3 border-b border-sidebarBorder px-5">
          <span className="gradient-primary flex h-10 w-10 items-center justify-center rounded-xl text-lg font-black text-black shadow-elegant">J</span>
          <div>
            <p className="label-caps text-sm text-ink">SECRETÁRIA</p>
            <p className="text-[9px] text-ink-faint">ORGANIZAÇÃO PESSOAL</p>
          </div>
        </div>
        <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
          {NAV.map((item) => (
            <a
              key={item.href}
              href={item.href}
              className="group flex items-center gap-2 rounded-lg border border-transparent px-3 py-2 text-[10px] font-bold tracking-[0.08em] text-ink-soft transition-all hover:border-sidebarBorder hover:bg-secondary hover:text-primary"
            >
              <span className="h-1.5 w-1.5 rounded-full bg-ink-faint transition-colors group-hover:bg-primary" />
              {item.label}
            </a>
          ))}
        </nav>
        <div className="border-t border-sidebarBorder p-4">
          <p className="text-[9px] font-bold tracking-[0.12em] text-ink-faint">ACESSO PROTEGIDO POR PIN</p>
        </div>
      </aside>

      <div className="lg:pl-60">
        <main className="mx-auto min-h-dvh max-w-6xl px-4 pb-28 pt-7 sm:px-6 lg:px-8 lg:pb-10">{children}</main>
      </div>

      <BottomNav />
    </div>
  );
}