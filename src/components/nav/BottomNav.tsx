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
    <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-sidebar/95 backdrop-blur pb-[env(safe-area-inset-bottom)] lg:hidden">
      <div className="relative mx-auto flex max-w-2xl items-stretch justify-between px-2">
        {ITEMS.slice(0, 2).map((item) => (
          <NavLink key={item.href} {...item} active={pathname.startsWith(item.href)} />
        ))}

        <div className="flex w-16 items-center justify-center">
          <QuickAddButton />
        </div>

        {ITEMS.slice(2).map((item) => (
          <NavLink key={item.href} {...item} active={pathname.startsWith(item.href)} />
        ))}
      </div>
    </nav>
  );
}

function NavLink({
  href,
  label,
  Icon,
  active,
}: {
  href: string;
  label: string;
  Icon: (props: React.SVGProps<SVGSVGElement>) => JSX.Element;
  active: boolean;
}) {
  return (
    <Link
      href={href}
      className="flex flex-1 flex-col items-center gap-1 py-2.5 text-[9px] font-bold tracking-[0.06em]"
    >
      <span className={`flex h-7 w-7 items-center justify-center rounded-lg ${active ? 'bg-primary/10 text-primary' : 'bg-secondary/40 text-ink-faint'}`}>
        <Icon className="h-4 w-4" />
      </span>
      <span className={active ? 'text-primary' : 'text-ink-faint'}>{label}</span>
    </Link>
  );
}