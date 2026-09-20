'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  IconPlus,
  IconTasks,
  IconHabit,
  IconNote,
  IconGoal,
  IconBell,
} from './icons';

const OPTIONS = [
  { href: '/tarefas?novo=1', label: 'Tarefa', Icon: IconTasks },
  { href: '/habitos?novo=1', label: 'Hábito', Icon: IconHabit },
  { href: '/notas?novo=1', label: 'Nota', Icon: IconNote },
  { href: '/objetivos?novo=1', label: 'Objetivo', Icon: IconGoal },
  { href: '/lembretes?novo=1', label: 'Lembrete', Icon: IconBell },
] as const;

export function QuickAddButton() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Adicionar rapidamente"
        className="-mt-6 flex h-14 w-14 items-center justify-center rounded-full bg-pine text-white shadow-lg shadow-pine/30 transition-transform active:scale-95"
      >
        <IconPlus className="h-6 w-6" />
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-end justify-center">
          <button
            aria-label="Fechar"
            onClick={() => setOpen(false)}
            className="absolute inset-0 bg-ink/30"
          />
          <div className="relative mb-[calc(env(safe-area-inset-bottom)+5rem)] w-[calc(100%-2rem)] max-w-sm rounded-card border border-border bg-white p-2 shadow-xl">
            <p className="px-3 pt-2 pb-1 text-xs font-medium uppercase tracking-wide text-ink-faint">
              Adicionar
            </p>
            {OPTIONS.map(({ href, label, Icon }) => (
              <Link
                key={href}
                href={href}
                onClick={() => setOpen(false)}
                className="flex items-center gap-3 rounded-card px-3 py-3 text-ink transition-colors active:bg-surface"
              >
                <Icon className="h-5 w-5 text-pine" />
                <span>{label}</span>
              </Link>
            ))}
          </div>
        </div>
      )}
    </>
  );
}