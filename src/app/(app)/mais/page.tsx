import Link from 'next/link';
import { PageHeader } from '@/components/ui/PageHeader';
import { IconHabit, IconNote, IconGoal, IconBell, IconSettings } from '@/components/nav/icons';

const ITEMS = [
  { href: '/habitos', label: 'Hábitos', Icon: IconHabit },
  { href: '/notas', label: 'Notas', Icon: IconNote },
  { href: '/objetivos', label: 'Objetivos', Icon: IconGoal },
  { href: '/lembretes', label: 'Lembretes', Icon: IconBell },
  { href: '/ajustes', label: 'Ajustes', Icon: IconSettings },
] as const;

export default function MaisPage() {
  return (
    <>
      <PageHeader title="Mais" />
      <div className="grid grid-cols-2 gap-3">
        {ITEMS.map(({ href, label, Icon }) => (
          <Link
            key={href}
            href={href}
            className="flex flex-col items-start gap-3 rounded-card border border-border bg-white p-4"
          >
            <Icon className="h-6 w-6 text-pine" />
            <span className="text-sm font-medium text-ink">{label}</span>
          </Link>
        ))}
      </div>
    </>
  );
}