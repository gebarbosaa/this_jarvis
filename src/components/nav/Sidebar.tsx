'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { IconHome, IconWeek, IconTasks, IconHabit, IconNote, IconGoal, IconBell, IconSettings, IconSparkle, IconMore } from './icons';

const NAV = [
  { href:'/inicio', label:'CENTRAL DE COMANDO', Icon:IconHome },
  { href:'/semana', label:'PLANEJAMENTO SEMANAL', Icon:IconWeek },
  { href:'/rotina', label:'ROTINA E HORÁRIOS', Icon:IconWeek },
  { href:'/tarefas', label:'TAREFAS', Icon:IconTasks },
  { href:'/habitos', label:'HÁBITOS E PROGRESSO', Icon:IconHabit },
  { href:'/notas', label:'NOTAS', Icon:IconNote },
  { href:'/objetivos', label:'OBJETIVOS', Icon:IconGoal },
  { href:'/lembretes', label:'LEMBRETES', Icon:IconBell },
  { href:'/secretaria-ia', label:'JARVIS IA', Icon:IconSparkle },
  { href:'/ajustes', label:'CONFIGURAÇÕES', Icon:IconSettings },
  { href:'/mais', label:'TODOS OS PAINÉIS', Icon:IconMore },
] as const;

export function Sidebar() {
  const pathname=usePathname(); const [open,setOpen]=useState(false);
  const menu=(
    <>
      <div className="flex h-[82px] shrink-0 items-center gap-3 border-b border-sidebarBorder/70 px-4">
        <Link href="/inicio" onClick={()=>setOpen(false)} aria-label="Ir para central de comando" className="gradient-primary flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl text-base font-black text-black shadow-[0_0_24px_rgba(60,190,255,.22)] transition-all duration-200 hover:scale-105">J</Link>
        <div className="min-w-0">
          <p className="label-caps block truncate text-base font-extrabold tracking-[0.22em] text-ink">J.A.R.V.I.S.</p>
          <p className="mt-1 truncate text-[9px] tracking-[0.12em] text-primary">SISTEMA PESSOAL · ONLINE</p>
        </div>
        <button type="button" onClick={()=>setOpen(false)} aria-label="Fechar menu" className="ml-auto flex h-9 w-9 items-center justify-center rounded-xl text-xl text-ink-soft hover:bg-secondary hover:text-ink lg:hidden">×</button>
      </div>
      <div className="mx-3 mt-4 rounded-xl border border-primary/20 bg-primary/5 px-3 py-3">
        <div className="flex items-center gap-2">
          <span className="h-2 w-2 animate-pulse rounded-full bg-primary shadow-[0_0_10px_rgba(70,205,255,.8)]" />
          <p className="label-caps text-[9px] font-bold tracking-[.16em] text-primary">SISTEMAS OPERACIONAIS</p>
        </div>
        <p className="mt-1 text-[10px] text-ink-soft">Rotina · hábitos · tarefas · objetivos</p>
      </div>
      <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4 pb-6">
        {NAV.map(({href,label,Icon})=>{
          const active=pathname===href||pathname.startsWith(href+'/');
          return <Link key={href} href={href} onClick={()=>setOpen(false)} className={['group label-caps flex items-center gap-2.5 rounded-xl border px-3 py-2.5 text-[9px] tracking-[.07em] transition-all duration-200',active?'gradient-soft border-primary/30 font-bold text-primary shadow-[inset_0_0_18px_rgba(60,190,255,.035)]':'border-transparent text-ink-soft hover:border-sidebarBorder hover:bg-secondary hover:text-ink'].join(' ')}>
            <span className={['flex h-8 w-8 items-center justify-center rounded-lg transition-transform group-hover:scale-105',active?'bg-primary/10 text-primary':'bg-secondary/40'].join(' ')}><Icon className="h-4 w-4"/></span>
            <span className="min-w-0">{label}</span>
            {active&&<span className="ml-auto h-1.5 w-1.5 shrink-0 rounded-full bg-primary shadow-[0_0_8px_rgba(70,205,255,.8)]" />}
          </Link>;
        })}
      </nav>
      <div className="border-t border-sidebarBorder/70 p-4">
        <div className="rounded-2xl border border-primary/15 bg-gradient-to-br from-primary/10 to-transparent p-4">
          <p className="label-caps text-[9px] font-bold tracking-[.15em] text-primary">PAINEL DE CONTROLE</p>
          <p className="mt-1 text-[10px] leading-relaxed text-ink-soft">Acompanhe sua rotina, registre hábitos e mantenha seus objetivos em andamento.</p>
        </div>
      </div>
    </>
  );
  return <>
    <aside className="fixed inset-y-0 left-0 z-30 hidden w-[290px] flex-col border-r border-sidebarBorder bg-sidebar shadow-2xl lg:flex">{menu}</aside>
    <aside className={['fixed inset-y-0 left-0 z-50 flex w-[290px] flex-col border-r border-sidebarBorder bg-sidebar shadow-2xl transition-transform duration-300 lg:hidden',open?'translate-x-0':'-translate-x-full'].join(' ')}>{menu}</aside>
    {open&&<button type="button" aria-label="Fechar menu" onClick={()=>setOpen(false)} className="fixed inset-0 z-40 bg-black/50 lg:hidden"/>}
    <button type="button" onClick={()=>setOpen(true)} aria-label="Abrir menu" className="fixed left-3 top-3 z-30 flex h-11 w-11 items-center justify-center rounded-2xl gradient-primary text-sm font-black text-black shadow-[0_0_20px_rgba(60,190,255,.2)] lg:hidden">J</button>
  </>;
}
