import Link from 'next/link';
import { PageHeader } from '@/components/ui/PageHeader';
import { IconHabit, IconNote, IconGoal, IconBell, IconSettings } from '@/components/nav/icons';

const ITEMS = [
  { href:'/habitos', label:'Hábitos', Icon:IconHabit },
  { href:'/notas', label:'Notas', Icon:IconNote },
  { href:'/objetivos', label:'Objetivos', Icon:IconGoal },
  { href:'/lembretes', label:'Lembretes', Icon:IconBell },
  { href:'/ajustes', label:'Ajustes', Icon:IconSettings },
] as const;

export default function MaisPage() {
  return (
    <div className="page-stack">
      <PageHeader title="Painel" subtitle="Acesse rapidamente todas as áreas da sua Secretária." />
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {ITEMS.map(({href,label,Icon}) => (
          <Link key={href} href={href} className="app-card app-card-hover flex min-h-[132px] flex-col justify-between p-5">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary"><Icon className="h-5 w-5" /></span>
            <span className="text-sm font-bold text-ink">{label}</span>
          </Link>
        ))}
      </div>
    </div>
  );
}