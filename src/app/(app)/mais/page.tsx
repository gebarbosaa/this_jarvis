import Link from 'next/link';
import { PageHeader } from '@/components/ui/PageHeader';
import { IconHabit, IconNote, IconGoal, IconBell, IconSettings, IconHome, IconSparkle, IconWeek } from '@/components/nav/icons';

const ITEMS = [
  { href:'/desenvolvimento-pessoal', label:'Desenvolvimento Pessoal', description:'Diário, humor, gratidão e desafios', Icon:IconSparkle },
  { href:'/casa', label:'Casa', description:'Mercado, despensa e manutenção', Icon:IconHome },
  { href:'/leitura', label:'Leitura', description:'Estante, progresso e desafio de leitura', Icon:IconNote },
  { href:'/alimentacao', label:'Alimentação', description:'Cardápio, receitas e lista de compras', Icon:IconGoal },
  { href:'/habitos-rotina', label:'Hábitos / Rotina', description:'Consistência, revisão e foco', Icon:IconHabit },
  { href:'/financas', label:'Finanças · Harmony Hub', description:'Dados financeiros sincronizados do Harmony Hub', Icon:IconGoal },
  { href:'/semana', label:'Planejamento semanal', description:'Organize os próximos dias', Icon:IconWeek },
  { href:'/habitos', label:'Hábitos e progresso', description:'Acompanhe seus hábitos atuais', Icon:IconHabit },
  { href:'/notas', label:'Notas', description:'Anotações e ideias', Icon:IconNote },
  { href:'/objetivos', label:'Objetivos', description:'Metas e próximos passos', Icon:IconGoal },
  { href:'/lembretes', label:'Lembretes', description:'Itens que precisam da sua atenção', Icon:IconBell },
  { href:'/ajustes', label:'Ajustes', description:'Preferências e integrações', Icon:IconSettings },
] as const;

export default function MaisPage() {
  return (
    <div className="page-stack">
      <PageHeader title="Painel" subtitle="Acesse rapidamente os módulos do J.A.R.V.I.S. e organize suas áreas pessoais." />
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {ITEMS.map(({href,label,description,Icon}) => (
          <Link key={href} href={href} className="app-card app-card-hover flex min-h-[150px] flex-col justify-between gap-4 p-5">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary"><Icon className="h-5 w-5" /></span>
            <div><span className="text-sm font-bold text-ink">{label}</span><p className="mt-1 text-xs leading-5 text-ink-soft">{description}</p></div>
          </Link>
        ))}
      </div>
    </div>
  );
}