'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { IconHome, IconWeek, IconTasks, IconSparkle, IconMore } from './icons';
import { QuickAddButton } from './QuickAddButton';

const ITEMS = [
  { href: '/inicio', label: 'Início', Icon: IconHome },
  { href: '/semana', label: 'Semana', Icon: IconWeek },
  { href: '/tarefas', label: 'Tarefas', Icon: IconTasks },
  { href: '/secretaria-ia', label: 'IA', Icon: IconSparkle },
  { href: '/mais', label: 'Painel', Icon: IconMore },
] as const;

export function BottomNav() {
  const pathname = usePathname();
  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-border/80 bg-sidebar/95 shadow-[0_-12px_30px_-24px_rgba(0,0,0,.9)] backdrop-blur-xl pb-[env(safe-area-inset-bottom)] lg:hidden">
      <div className="relative mx-auto flex min-h-[68px] max-w-2xl items-stretch px-1">
        {ITEMS.slice(0, 2).map((item) => <NavLink key={item.href} {...item} active={pathname.startsWith(item.href)} />)}
        <div className="flex w-16 shrink-0 items-center justify-center"><QuickAddButton /></div>
        {ITEMS.slice(2).map((item) => <NavLink key={item.href} {...item} active={pathname.startsWith(item.href)} />)}
      </div>
    </nav>
  );
}

function NavLink({ href, label, Icon, active }: { href:string; label:string; Icon:(props:React.SVGProps<SVGSVGElement>)=>JSX.Element; active:boolean }) {
  return (
    <Link href={href} className="flex min-w-0 flex-1 flex-col items-center justify-center gap-1 py-2 text-[9px] font-bold tracking-[.04em]">
      <span className={`flex h-8 w-8 items-center justify-center rounded-xl transition ${active ? 'bg-primary/12 text-primary shadow-[inset_0_0_0_1px_rgba(217,126,43,.22)]' : 'text-ink-faint'}`}>
        <Icon className="h-[17px] w-[17px]" />
      </span>
      <span className={active ? 'text-primary' : 'text-ink-faint'}>{label}</span>
    </Link>
  );
}