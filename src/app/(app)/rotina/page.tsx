import { createClient } from '@/lib/supabase/server';
import { PageHeader } from '@/components/ui/PageHeader';
import { EmptyState } from '@/components/ui/EmptyState';
import { NewRoutineForm } from './NewRoutineForm';
import { addRoutineItem } from './actions';

export default async function RotinaPage() {
  const supabase=createClient();
  const {data:{user}}=await supabase.auth.getUser();
  const {data:routines}=await supabase.from('routines').select('id,name,routine_items(id,title,order_index)').eq('user_id',user!.id).order('created_at',{ascending:true});
  return <>
    <PageHeader title="Rotina" subtitle="Crie rotinas simples e execute-as sem perder o foco." />
    <NewRoutineForm />
    {(!routines || routines.length===0) && <EmptyState text="Nenhuma rotina criada. Comece pela manhã, noite ou pré-trabalho." />}
    <div className="grid gap-3 lg:grid-cols-2">
      {routines?.map((routine:any)=>(
        <section key={routine.id} className="app-card p-4 sm:p-5">
          <h2 className="font-bold text-ink">{routine.name}</h2>
          <ul className="mt-3 space-y-2">
            {(routine.routine_items??[]).sort((a:any,b:any)=>a.order_index-b.order_index).map((item:any)=>(
              <li key={item.id} className="rounded-xl border border-border bg-surface px-3 py-2 text-sm text-ink-soft">○ {item.title}</li>
            ))}
          </ul>
          <form action={addRoutineItem} className="mt-3 flex gap-2">
            <input type="hidden" name="routine_id" value={routine.id}/>
            <input name="title" required placeholder="Adicionar etapa..." className="field min-w-0 flex-1"/>
            <button className="rounded-xl bg-paper px-3 py-2 text-xs font-bold text-primary" type="submit">+</button>
          </form>
        </section>
      ))}
    </div>
  </>;
}