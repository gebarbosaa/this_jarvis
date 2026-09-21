'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  IconHome, IconWeek, IconTasks, IconHabit, IconNote,
  IconGoal, IconBell, IconSettings, IconSparkle, IconMore,
} from './icons';

const NAV = [
  { href: '/inicio', label: 'INÍCIO', Icon: IconHome },
  { href: '/semana', label: 'SEMANA', Icon: IconWeek },
  { href: '/rotina', label: 'ROTINA', Icon: IconWeek },
  { href: '/tarefas', label: 'TAREFAS', Icon: IconTasks },
  { href: '/habitos', label: 'HÁBITOS', Icon: IconHabit },
  { href: '/notas', label: 'NOTAS', Icon: IconNote },
  { href: '/objetivos', label: 'OBJETIVOS', Icon: IconGoal },
  { href: '/lembretes', label: 'LEMBRETES', Icon: IconBell },
  { href: '/secretaria-ia', label: 'SECRETÁRIA IA', Icon: IconSparkle },
  { href: '/ajustes', label: 'AJUSTES', Icon: IconSettings },
  { href: '/mais', label: 'PAINEL', Icon: IconMore },
] as const;

export function Sidebar() {
  const pathname = usePathname();
  return (
    <aside className="fixed inset-y-0 left-0 z-30 hidden w-[270px] flex-col border-r border-sidebarBorder bg-sidebar lg:flex">
      <div className="flex h-[88px] shrink-0 items-center gap-3 border-b border-sidebarBorder px-5">
        <Link href="/inicio" aria-label="Ir para início" className="gradient-primary flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-lg font-black text-black shadow-elegant">J</Link>
        <div className="min-w-0">
          <p className="label-caps truncate text-sm text-ink">SECRETÁRIA</p>
          <p className="mt-0.5 truncate text-[9px] font-medium tracking-[0.14em] text-ink-faint">ORGANIZAÇÃO PESSOAL</p>
        </div>
      </div>
      <nav className="min-h-0 flex-1 space-y-1 overflow-y-auto px-3 py-5">
        <p className="mb-3 px-3 text-[9px] font-bold tracking-[0.16em] text-ink-faint">MENU</p>
        {NAV.map(({ href, label, Icon }) => {
          const active = pathname === href || pathname.startsWith(href + '/');
          return (
            <Link key={href} href={href} className={[
              'group flex min-w-0 items-center gap-3 rounded-xl border px-3 py-2.5 text-[10px] font-bold tracking-[0.07em] transition-all',
              active ? 'gradient-soft border-primary/30 text-primary' : 'border-transparent text-ink-soft hover:border-sidebarBorder hover:bg-secondary hover:text-ink',
            ].join(' ')}>
              <span className={['flex h-7 w-7 shrink-0 items-center justify-center rounded-lg', active ? 'bg-primary/10 text-primary' : 'bg-secondary/60 text-ink-faint'].join(' ')}>
                <Icon className="h-4 w-4" />
              </span>
              <span className="truncate">{label}</span>
            </Link>
          );
        })}
      </nav>
      <div className="shrink-0 border-t border-sidebarBorder p-4">
        <div className="rounded-xl border border-primary/10 bg-primary/5 px-3 py-3">
          <p className="text-[9px] font-bold tracking-[0.12em] text-primary">ACESSO PRIVADO</p>
          <p className="mt-1 text-[10px] text-ink-soft">Sessão protegida por PIN</p>
        </div>
      </div>
    </aside>
  );
}
