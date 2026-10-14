'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';

type Entry = { id: string; text: string; done?: boolean; extra?: string; createdAt: string };
type Store = Record<string, Entry[]>;
type ModuleKey = 'desenvolvimento-pessoal' | 'casa' | 'leitura' | 'alimentacao' | 'habitos-rotina';
const CONFIG: Record<ModuleKey, { title: string; emoji: string; description: string; tabs: string[] }> = {
  'desenvolvimento-pessoal': { title: 'Desenvolvimento Pessoal', emoji: '🌱', description: 'Um espaço para se conhecer, cuidar de si e acompanhar seu crescimento.', tabs: ['Sobre mim','Metas','Diário','Humor & Score','Respiração','Gratidão','Carta','30 Dias'] },
  casa: { title: 'Casa', emoji: '🏠', description: 'Organize compras, cômodos, tarefas e cuidados da casa.', tabs: ['Cômodos','Mercado','Rotina','Despensa','Cardápio','Manutenção','Co-op','Segurança','Utilidades'] },
  leitura: { title: 'Leitura', emoji: '📖', description: 'Acompanhe suas leituras, sua estante e seu ritmo.', tabs: ['Lendo agora','Estante','Insights','Emprestados','Desafio'] },
  alimentacao: { title: 'Alimentação', emoji: '🍽️', description: 'Planeje refeições e acompanhe seus registros alimentares.', tabs: ['Cardápio','Jejum','Receitas','Lista','Diário'] },
  'habitos-rotina': { title: 'Hábitos / Rotina', emoji: '✅', description: 'Construa consistência, organize sua semana e reserve tempo para focar.', tabs: ['Minha semana','Meu mês','Diário','Revisão','Foco'] },
};
const MARKET_CATEGORIES = ['Hortifrúti','Açougue','Laticínios','Mercearia','Padaria','Congelados','Limpeza','Higiene','Bebidas'];
const DAYS = ['Segunda','Terça','Quarta','Quinta','Sexta','Sábado','Domingo'];
const MEALS = ['Café da manhã','Almoço','Lanche','Janta','Ceia','Pós-treino'];
const MOODS = ['😞','😕','😐','🙂','😄'];
const QUOTES = ['Pequenos passos também levam longe.','Você não precisa fazer tudo hoje.','Consistência é construída um dia de cada vez.','Cuide de você como cuidaria de alguém que ama.'];

function keyFor(module: ModuleKey, tab: string) { return 'jarvis-module-v1:' + module + ':' + tab; }
function useEntries(module: ModuleKey, tab: string) {
  const [entries,setEntries] = useState<Entry[]>([]);
  const [ready,setReady] = useState(false);
  useEffect(() => {
    try { const raw = localStorage.getItem(keyFor(module,tab)); if (raw) setEntries(JSON.parse(raw)); } catch {}
    setReady(true);
  },[module,tab]);
  useEffect(() => { if (ready) { try { localStorage.setItem(keyFor(module,tab),JSON.stringify(entries)); } catch {} } },[entries,ready,module,tab]);
  const add = (text: string, extra = '') => { const clean=text.trim(); if (!clean) return; setEntries(old => [{id:crypto.randomUUID(),text:clean,extra,createdAt:new Date().toISOString()},...old]); };
  const remove = (id: string) => setEntries(old => old.filter(e=>e.id!==id));
  const toggle = (id: string) => setEntries(old=>old.map(e=>e.id===id?{...e,done:!e.done}:e));
  const update = (id: string, patch: Partial<Entry>) => setEntries(old=>old.map(e=>e.id===id?{...e,...patch}:e));
  return {entries,add,remove,toggle,update,ready};
}

export function PersonalModules({ module }: { module: ModuleKey }) {
  const config=CONFIG[module]; const [tab,setTab]=useState(config.tabs[0]); const [input,setInput]=useState(''); const [extra,setExtra]=useState('');
  const {entries,add,remove,toggle,update,ready}=useEntries(module,tab);
  const [month,setMonth]=useState('');
  const [mood,setMood]=useState('🙂'); const [score,setScore]=useState(7);
  const [page,setPage]=useState(''); const [totalPages,setTotalPages]=useState('240');
  const [seconds,setSeconds]=useState(60); const [timerRunning,setTimerRunning]=useState(false);
  const [theme,setTheme]=useState<'dark'|'light'>('dark');
  const [mealDay,setMealDay]=useState('Segunda');
  const [mealType,setMealType]=useState('Almoço');
  const [marketCategory,setMarketCategory]=useState('Hortifrúti');
  const [newCategory,setNewCategory]=useState('');
  const [categories,setCategories]=useState(MARKET_CATEGORIES);
  const [showMeals,setShowMeals]=useState(MEALS);
  useEffect(()=>{const now=new Date();setMonth(now.toLocaleDateString('pt-BR',{month:'long',year:'numeric'})); try{setTheme((localStorage.getItem('jarvis-module-theme') as 'dark'|'light')||'dark')}catch{}},[]);
  useEffect(()=>{if(!timerRunning)return;const id=window.setInterval(()=>setSeconds(s=>{if(s<=1){setTimerRunning(false);return 0;}return s-1;}),1000);return()=>window.clearInterval(id)},[timerRunning]);
  const marketDone=entries.filter(e=>e.done).length;
  const quote=QUOTES[new Date().getDate()%QUOTES.length];
  const addEntry=(text=input,more=extra)=>{add(text,more);setInput('');setExtra('');};
  const card='rounded-2xl border border-white/10 bg-white/[0.045] p-4 sm:p-5';
  const field='w-full min-w-0 rounded-xl border border-white/10 bg-black/20 px-3 py-2.5 text-sm text-ink placeholder:text-ink-faint';
  const pill=(active:boolean)=>'shrink-0 rounded-full border px-4 py-2 text-xs font-bold transition '+(active?'border-white bg-white text-slate-950':'border-white/10 bg-white/[0.04] text-ink-soft hover:bg-white/10');
  const addForm=(placeholder:string, button='Adicionar')=><form className="flex flex-col gap-2 sm:flex-row" onSubmit={e=>{e.preventDefault();addEntry();}}><input className={field} value={input} onChange={e=>setInput(e.target.value)} placeholder={placeholder} aria-label={placeholder}/><button className="primary-button shrink-0" type="submit">+ {button}</button></form>;
  const entryList=(empty:string, checks=false)=><div className="mt-4 space-y-2">{entries.length===0?<p className="rounded-xl border border-dashed border-white/10 px-4 py-6 text-center text-sm text-ink-faint">{ready?empty:'Carregando seus registros…'}</p>:entries.map(e=><div key={e.id} className="flex items-start gap-3 rounded-xl border border-white/10 bg-black/10 p-3"><input aria-label={'Concluir '+e.text} type="checkbox" checked={!!e.done} onChange={()=>toggle(e.id)} className="mt-1 h-4 w-4 accent-white"/><div className="min-w-0 flex-1"><p className={'break-words text-sm '+(e.done?'text-ink-faint line-through':'text-ink')}>{e.text}</p>{e.extra&&<p className="mt-1 text-xs text-ink-soft">{e.extra}</p>}</div><button type="button" onClick={()=>remove(e.id)} aria-label={'Excluir '+e.text} className="rounded-lg px-2 text-lg text-ink-faint hover:bg-white/10 hover:text-red-300">×</button></div>)}</div>;
  const titleByTab:Record<string,string>={ 'Sobre mim':'Conheça sua história','Metas':'Metas pessoais','Diário':'Seu espaço de escrita','Humor & Score':'Como você está hoje?','Respiração':'Pausa para respirar','Gratidão':'Três coisas boas do dia','Carta':'Carta para o eu do futuro','30 Dias':'Desafio de 30 dias','Cômodos':'Organize seus espaços','Mercado':'Lista do mercado','Rotina':'Rotina da casa','Despensa':'Estoque da despensa','Cardápio':'Cardápio da casa','Manutenção':'Manutenção e reparos','Co-op':'Organização compartilhada','Segurança':'Segurança da casa','Utilidades':'Contas e utilidades','Lendo agora':'Leitura atual','Estante':'Minha estante','Insights':'Seu ritmo de leitura','Emprestados':'Livros emprestados','Desafio':'Desafio de leitura','Jejum':'Timer de jejum','Receitas':'Minhas receitas','Lista':'Lista de compras','Minha semana':'Hábitos da semana','Meu mês':'Consistência mensal','Revisão':'Revisão semanal','Foco':'Sessão de foco','Cardápio semanal':'Cardápio semanal'};
  const marketItems=categories.map(c=>({name:c,items:entries.filter(e=>e.extra===c)}));
  return <div className={theme==='light'?'min-h-[70vh] rounded-3xl bg-stone-50 p-3 text-slate-900 sm:p-6':'min-h-[70vh] p-0 text-ink'}>
    <div className="mb-5 flex items-center justify-between gap-3"><Link href="/mais" className="secondary-button">← Voltar</Link><button type="button" onClick={()=>setTheme(t=>{const n=t==='dark'?'light':'dark';try{localStorage.setItem('jarvis-module-theme',n)}catch{};return n})} className="secondary-button" aria-label="Alternar tema">{theme==='dark'?'☀️ Tema claro':'🌙 Tema escuro'}</button></div>
    <header className="mb-5 rounded-3xl border border-primary/20 bg-gradient-to-br from-primary/15 via-white/[0.025] to-transparent p-5 sm:p-7">
      <div className="flex items-start gap-3"><span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-primary/15 text-2xl">{config.emoji}</span><div className="min-w-0 flex-1"><p className="label-caps text-[10px] tracking-[.18em] text-primary">J.A.R.V.I.S. · ORGANIZAÇÃO PESSOAL</p><h1 className="mt-2 text-2xl font-extrabold tracking-tight sm:text-3xl">{config.title}</h1><p className="mt-2 max-w-2xl text-sm text-ink-soft">{config.description}</p></div></div>
      <div className="mt-5 flex flex-wrap items-center justify-between gap-3"><p className="text-sm font-semibold capitalize text-ink-soft">{month||'Este mês'}</p>{module==='desenvolvimento-pessoal'&&<p className="rounded-xl border border-primary/20 bg-primary/10 px-3 py-2 text-sm">✨ {quote}</p>}</div>
    </header>
    <div className="mb-5 flex gap-2 overflow-x-auto pb-2" role="tablist" aria-label={'Abas de '+config.title}>{config.tabs.map(t=><button key={t} role="tab" aria-selected={tab===t} className={pill(tab===t)} onClick={()=>{setTab(t);setInput('');setExtra('')}}>{t}</button>)}</div>
    <section className="space-y-4">
      <div className={card}><div className="mb-4"><p className="label-caps text-[10px] text-primary">{config.title}</p><h2 className="mt-1 text-xl font-bold">{titleByTab[tab]||tab}</h2></div>
      {module==='casa'&&tab==='Mercado'?<>
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3"><p className="text-sm font-semibold">Lista do mercado <span className="ml-2 rounded-full bg-primary/15 px-2 py-1 text-primary">{marketDone}/{entries.length} comprados</span></p><div className="flex gap-2"><button className="secondary-button" onClick={()=>entries.forEach(e=>update(e.id,{done:false}))}>Limpar checks</button><button className="secondary-button" onClick={()=>{const n=prompt('Nome da nova categoria');if(n?.trim())setCategories(c=>[...c,n.trim()])}}>+ Categoria</button></div></div>
        <div className="mb-4 flex flex-wrap gap-2">{categories.map(c=><button key={c} className={pill(marketCategory===c)} onClick={()=>setMarketCategory(c)}>{c} ({entries.filter(e=>e.extra===c&&e.done).length}/{entries.filter(e=>e.extra===c).length})</button>)}</div>
        <form className="flex flex-col gap-2 sm:flex-row" onSubmit={e=>{e.preventDefault();if(input.trim()){add(input,marketCategory);setInput('')}}}><input className={field} value={input} onChange={e=>setInput(e.target.value)} placeholder={'Adicionar item em '+marketCategory}/><button className="primary-button" type="submit">+ Adicionar item</button></form>
        {entryList('Sua lista está vazia. Adicione os itens que precisa comprar.',true)}
      </>:module==='desenvolvimento-pessoal'&&tab==='Humor & Score'?<>
        <div className="grid gap-4 sm:grid-cols-2"><div><label className="mb-2 block text-sm font-semibold">Como está seu humor?</label><div className="flex gap-2">{MOODS.map(m=><button type="button" key={m} onClick={()=>setMood(m)} className={'rounded-xl border p-3 text-2xl '+(mood===m?'border-primary bg-primary/15':'border-white/10')}>{m}</button>)}</div></div><div><label className="mb-2 block text-sm font-semibold">Nota do dia: {score}/10</label><input className="w-full accent-white" type="range" min="0" max="10" value={score} onChange={e=>setScore(Number(e.target.value))}/><button className="primary-button mt-3" onClick={()=>add('Humor '+mood+' · '+score+'/10',new Date().toLocaleDateString('pt-BR'))}>Salvar registro de hoje</button></div></div>{entryList('Seu histórico de humor aparecerá aqui.')}
      </>:module==='desenvolvimento-pessoal'&&tab==='Respiração'?<>
        <div className="mx-auto max-w-sm text-center"><div className="mx-auto mb-4 flex h-40 w-40 items-center justify-center rounded-full border-4 border-primary/30 bg-primary/10 text-3xl font-bold">{seconds}s</div><p className="text-sm text-ink-soft">{seconds>40?'Inspire devagar':seconds>20?'Segure o ar':'Expire lentamente'}</p><div className="mt-4 flex justify-center gap-2"><button className="primary-button" onClick={()=>setTimerRunning(v=>!v)}>{timerRunning?'Pausar':'Iniciar'}</button><button className="secondary-button" onClick={()=>{setTimerRunning(false);setSeconds(60)}}>Reiniciar</button></div></div>
      </>:module==='alimentacao'&&tab==='Cardápio'?<>
        <div className="mb-3 flex flex-wrap gap-2">{DAYS.map(d=><button key={d} className={pill(mealDay===d)} onClick={()=>setMealDay(d)}>{d}</button>)}</div><div className="mb-3 flex flex-wrap gap-2">{MEALS.map(m=><button key={m} className={pill(mealType===m)} onClick={()=>setMealType(m)}>{m}</button>)}</div>{addForm('O que vai comer em '+mealDay+' · '+mealType)}{entryList('Nenhuma refeição registrada para este planejamento.') }<div className="mt-3 flex flex-wrap gap-2"><button className="secondary-button" onClick={()=>{const value=prompt('Copiar refeições para qual dia?');if(value)add('Copiar plano de '+mealDay+' para '+value)}}>Copiar dia</button><button className="secondary-button" onClick={()=>entries.forEach(e=>remove(e.id))}>Limpar dia</button><button className="secondary-button" onClick={()=>{setShowMeals(showMeals.length===MEALS.length?['Almoço','Janta']:MEALS);}}>Refeições ({showMeals.length})</button></div>
      </>:module==='leitura'&&tab==='Lendo agora'?<>
        <div className="grid gap-4 sm:grid-cols-2"><label className="text-sm">Página atual<input className={field+' mt-2'} type="number" min="0" value={page} onChange={e=>setPage(e.target.value)} placeholder="160"/></label><label className="text-sm">Total de páginas<input className={field+' mt-2'} type="number" min="1" value={totalPages} onChange={e=>setTotalPages(e.target.value)}/></label></div><div className="mt-4"><div className="mb-2 flex justify-between text-sm"><span>Progresso</span><span>{page||0}/{totalPages||0} páginas</span></div><div className="h-3 overflow-hidden rounded-full bg-white/10"><div className="h-full rounded-full bg-primary transition-all" style={{width:Math.min(100,Math.max(0,(Number(page||0)/Math.max(1,Number(totalPages||1)))*100))+'%'}}/></div></div>{addForm('Título do livro atual','Salvar livro')}{entryList('Cadastre seu livro atual para acompanhar sua leitura.')}
      </>:module==='habitos-rotina'&&(tab==='Minha semana'||tab==='Meu mês')?<>
        {addForm('Ex.: Beber 2L de água, treinar, ler 30 min…','Hábito')}{entryList('Adicione seus hábitos e marque cada conclusão.',true)}<p className="mt-3 text-xs text-ink-faint">Consistência vence intensidade. Seus registros ficam salvos neste navegador.</p>
      </>:module==='habitos-rotina'&&tab==='Foco'?<>
        <div className="mx-auto max-w-sm text-center"><div className="mb-4 text-5xl font-extrabold tabular-nums">{String(Math.floor(seconds/60)).padStart(2,'0')}:{String(seconds%60).padStart(2,'0')}</div><p className="text-sm text-ink-soft">Sessão de foco · Pomodoro</p><div className="mt-4 flex justify-center gap-2"><button className="primary-button" onClick={()=>{if(seconds===60)setSeconds(25*60);setTimerRunning(v=>!v)}}>{timerRunning?'Pausar':'Iniciar foco'}</button><button className="secondary-button" onClick={()=>{setTimerRunning(false);setSeconds(25*60)}}>Reiniciar 25 min</button></div></div>{addForm('Qual tarefa você vai focar?')}{entryList('Defina uma tarefa para a sessão de foco.')}
      </>:module==='alimentacao'&&tab==='Jejum'?<>
        <div className="text-center"><p className="mb-2 text-sm text-ink-soft">Timer informativo de jejum</p><div className="text-4xl font-extrabold tabular-nums">{String(Math.floor(seconds/60)).padStart(2,'0')}:{String(seconds%60).padStart(2,'0')}</div><div className="mt-4 flex justify-center gap-2"><button className="primary-button" onClick={()=>setTimerRunning(v=>!v)}>{timerRunning?'Pausar':'Iniciar'}</button><button className="secondary-button" onClick={()=>{setTimerRunning(false);setSeconds(60)}}>Zerar</button></div><p className="mt-3 text-xs text-ink-faint">Este cronômetro não substitui orientação profissional; interrompa se sentir mal.</p></div>
      </>:module==='desenvolvimento-pessoal'&&tab==='Gratidão'?<>
        <p className="mb-3 text-sm text-ink-soft">Registre até três coisas pelas quais você é grata hoje.</p>{addForm('Hoje sou grata por…')}{entryList('Sua lista de gratidão de hoje está vazia.')}
      </>:module==='desenvolvimento-pessoal'&&tab==='30 Dias'?<>
        <p className="mb-3 text-sm text-ink-soft">Crie seu desafio e marque os dias concluídos.</p>{addForm('Nome do desafio de 30 dias')}{entryList('Adicione seu desafio para começar.',true)}
      </>:module==='casa'&&tab==='Utilidades'?<>
        <div className="grid gap-3 sm:grid-cols-2"><input className={field} value={input} onChange={e=>setInput(e.target.value)} placeholder="Conta (água, luz, internet…)"/><input className={field} value={extra} onChange={e=>setExtra(e.target.value)} placeholder="Vencimento / valor"/></div><button className="primary-button mt-3" onClick={()=>addEntry(input,extra)}>+ Adicionar conta</button>{entryList('Nenhuma conta registrada.')}
      </>:module==='casa'&&tab==='Despensa'?<>
        <div className="grid gap-3 sm:grid-cols-2"><input className={field} value={input} onChange={e=>setInput(e.target.value)} placeholder="Item da despensa"/><input className={field} value={extra} onChange={e=>setExtra(e.target.value)} placeholder="Quantidade / validade"/></div><button className="primary-button mt-3" onClick={()=>addEntry(input,extra)}>+ Adicionar ao estoque</button>{entryList('Sua despensa ainda não tem itens.')}
      </>:module==='leitura'&&tab==='Insights'?<>
        <div className="grid gap-3 sm:grid-cols-3"><div className={card}><p className="text-xs text-ink-soft">Livros registrados</p><p className="mt-2 text-2xl font-bold">{entries.length}</p></div><div className={card}><p className="text-xs text-ink-soft">Concluídos</p><p className="mt-2 text-2xl font-bold">{entries.filter(e=>e.done).length}</p></div><div className={card}><p className="text-xs text-ink-soft">Progresso atual</p><p className="mt-2 text-2xl font-bold">{Math.min(100,Math.round(Number(page||0)/Math.max(1,Number(totalPages||1))*100))}%</p></div></div>{addForm('Adicionar livro à estante')}{entryList('Cadastre livros para visualizar seus insights.')}
      </>:<>{module==='alimentacao'&&tab==='Lista'&&<p className="mb-3 text-sm text-ink-soft">Adicione itens e use o botão para encaminhar ao Mercado da Casa.</p>}{addForm('Adicionar '+tab.toLowerCase())}{entryList('Ainda não há registros nesta aba.',true)}{module==='alimentacao'&&tab==='Lista'&&<Link className="secondary-button mt-3" href="/casa">Abrir Mercado da Casa →</Link>}</>}
      </div>
      <p className="px-1 text-xs text-ink-faint">Seus registros são salvos automaticamente neste navegador e permanecem após fechar e reabrir o app neste dispositivo. Para sincronização entre dispositivos, será necessária a persistência autenticada no banco de dados.</p>
    </section>
  </div>;
}
