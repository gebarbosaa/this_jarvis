'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { IconHome, IconWeek, IconTasks, IconHabit, IconNote, IconGoal, IconBell, IconSettings, IconSparkle, IconMore } from './icons';

const NAV = [
  { href:'/inicio', label:'INÍCIO', Icon:IconHome },
  { href:'/semana', label:'SEMANA', Icon:IconWeek },
  { href:'/rotina', label:'ROTINA', Icon:IconWeek },
  { href:'/tarefas', label:'TAREFAS', Icon:IconTasks },
  { href:'/habitos', label:'HÁBITOS', Icon:IconHabit },
  { href:'/notas', label:'NOTAS', Icon:IconNote },
  { href:'/objetivos', label:'OBJETIVOS', Icon:IconGoal },
  { href:'/lembretes', label:'LEMBRETES', Icon:IconBell },
  { href:'/secretaria-ia', label:'SECRETÁRIA IA', Icon:IconSparkle },
  { href:'/ajustes', label:'AJUSTES', Icon:IconSettings },
  { href:'/mais', label:'PAINEL', Icon:IconMore },
] as const;

export function Sidebar() {
  const pathname=usePathname(); const [open,setOpen]=useState(false);
  const menu=(
    <>
      <div className="flex h-[76px] shrink-0 items-center gap-2.5 border-b border-sidebarBorder/70 px-4">
        <Link href="/inicio" onClick={()=>setOpen(false)} aria-label="Ir para início" className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-primary text-sm font-black text-primary-foreground shadow-lg transition-all duration-200 hover:scale-105 hover:shadow-xl">J</Link>
        <div className="min-w-0">
          <p className="label-caps block truncate text-base font-bold tracking-[0.18em] text-ink">SECRETÁRIA</p>
          <p className="truncate text-[9px] text-ink-soft">ORGANIZAÇÃO PESSOAL</p>
        </div>
        <button type="button" onClick={()=>setOpen(false)} aria-label="Fechar menu" className="ml-auto flex h-9 w-9 items-center justify-center rounded-xl text-xl text-ink-soft hover:bg-secondary hover:text-ink lg:hidden">×</button>
      </div>
      <nav className="flex-1 space-y-0.5 overflow-y-auto px-3 py-4 pb-6">
        {NAV.map(({href,label,Icon})=>{
          const active=pathname===href||pathname.startsWith(href+'/');
          return <Link key={href} href={href} onClick={()=>setOpen(false)} className={['group label-caps flex items-center gap-2 rounded-lg border px-3 py-2 text-[9px] transition-all duration-200',active?'gradient-soft border-primary/30 font-bold text-primary':'border-transparent text-ink-soft hover:border-sidebarBorder hover:bg-secondary hover:text-ink'].join(' ')}>
            <span className={['flex h-7 w-7 items-center justify-center rounded-lg transition-transform group-hover:scale-105',active?'bg-primary/10':'bg-secondary/40'].join(' ')}><Icon className="h-4 w-4"/></span>{label}
          </Link>;
        })}
      </nav>
      <div className="border-t border-sidebarBorder/70 p-4">
        <div className="rounded-2xl border border-primary/10 bg-primary/5 p-4">
          <p className="label-caps text-[9px] font-bold text-primary">ACESSO PRIVADO</p>
          <p className="mt-1 text-[10px] leading-relaxed text-ink-soft">Sessão protegida por PIN.</p>
        </div>
      </div>
    </>
  );
  return <>
    <aside className="fixed inset-y-0 left-0 z-30 hidden w-[290px] flex-col border-r border-sidebarBorder bg-sidebar shadow-2xl lg:flex">{menu}</aside>
    <aside className={['fixed inset-y-0 left-0 z-50 flex w-[290px] flex-col border-r border-sidebarBorder bg-sidebar shadow-2xl transition-transform duration-300 lg:hidden',open?'translate-x-0':'-translate-x-full'].join(' ')}>{menu}</aside>
    {open&&<button type="button" aria-label="Fechar menu" onClick={()=>setOpen(false)} className="fixed inset-0 z-40 bg-black/50 lg:hidden"/>}
    <button type="button" onClick={()=>setOpen(true)} aria-label="Abrir menu" className="fixed left-3 top-3 z-30 flex h-11 w-11 items-center justify-center rounded-2xl bg-primary text-sm font-black text-primary-foreground shadow-lg lg:hidden">J</button>
  </>;
}
