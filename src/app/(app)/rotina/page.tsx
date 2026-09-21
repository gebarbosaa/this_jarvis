import { createClient } from '@/lib/supabase/server';
import { PageHeader } from '@/components/ui/PageHeader';
import { EmptyState } from '@/components/ui/EmptyState';
import { RoutinePlannerForm } from './RoutinePlannerForm';
import { deleteRoutineActivity } from './actions';

function toMinutes(value: string) {
  const [h, m] = value.slice(0, 5).split(':').map(Number);
  return h * 60 + m;
}

function formatTime(minutes: number) {
  const h = Math.floor(minutes / 60) % 24;
  const m = minutes % 60;
  return [h, m].map(v => String(v).padStart(2, '0')).join(':');
}

function buildSchedule(activities: any[], start: string, end: string) {
  const startMin = toMinutes(start);
  const endMin = toMinutes(end);
  const fixed = activities.filter(a => a.fixed_start).map(a => ({ ...a, startMin: toMinutes(a.fixed_start) })).sort((a,b) => a.startMin-b.startMin);
  const flexible = activities.filter(a => !a.fixed_start).sort((a,b) => (a.kind==='daily'?0:1)-(b.kind==='daily'?0:1));
  const result:any[] = [];
  let cursor=startMin;
  for (const item of fixed) {
    if (item.startMin < startMin || item.startMin >= endMin) continue;
    for (const flex of [...flexible]) {
      if (cursor < item.startMin && cursor + flex.duration_minutes <= item.startMin) {
        result.push({...flex,start:cursor,end:cursor+flex.duration_minutes});
        cursor += flex.duration_minutes;
        flexible.splice(flexible.indexOf(flex),1);
      }
    }
    result.push({...item,start:item.startMin,end:Math.min(item.startMin+item.duration_minutes,endMin)});
    cursor=Math.max(cursor,item.startMin+item.duration_minutes);
  }
  for (const flex of flexible) {
    if (cursor>=endMin) break;
    const duration=Math.min(flex.duration_minutes,endMin-cursor);
    result.push({...flex,start:cursor,end:cursor+duration});
    cursor+=duration;
  }
  return result;
}

export default async function RotinaPage() {
  const supabase=createClient();
  const {data:{user}}=await supabase.auth.getUser();
  if(!user)return null;
  const [{data:settings},{data:activities}]=await Promise.all([
    supabase.from('routine_settings').select('day_start,day_end').eq('user_id',user.id).maybeSingle(),
    supabase.from('routine_activities').select('id,title,duration_minutes,fixed_start,kind').eq('user_id',user.id).eq('active',true).order('created_at',{ascending:true}),
  ]);
  const dayStart=settings?.day_start??'08:00';
  const dayEnd=settings?.day_end??'22:00';
  const schedule=buildSchedule(activities??[],dayStart,dayEnd);
  return <>
    <PageHeader title="Rotina" subtitle="Você coloca o que precisa fazer. A Secretária organiza o seu dia automaticamente." />
    <RoutinePlannerForm dayStart={dayStart} dayEnd={dayEnd} />
    <section className="app-card mt-4 p-4 sm:p-5">
      <div className="mb-4 flex items-end justify-between gap-3">
        <div><p className="section-label">Seu dia organizado</p><p className="mt-1 text-sm text-ink-soft">Horários fixos são preservados. Os demais afazeres ocupam os espaços disponíveis.</p></div>
        <span className="rounded-full bg-primary/10 px-3 py-1 text-[10px] font-bold text-primary">{schedule.length} itens</span>
      </div>
      {schedule.length===0 ? <EmptyState text="Adicione acordar, banho, trabalho e seus afazeres. Depois a Secretária monta o dia." /> :
        <div className="space-y-2">{schedule.map((item:any)=>(
          <div key={item.id} className="flex items-center gap-3 rounded-xl border border-border bg-surface p-3">
            <div className="w-24 shrink-0 text-xs font-black text-primary">{formatTime(item.start)} – {formatTime(item.end)}</div>
            <div className="min-w-0 flex-1"><p className="truncate text-sm font-bold text-ink">{item.title}</p><p className="text-[10px] uppercase tracking-wide text-ink-faint">{item.fixed_start?'HORÁRIO FIXO':item.kind==='daily'?'ROTINA':'AFAZER'}</p></div>
            <form action={deleteRoutineActivity}><input type="hidden" name="id" value={item.id}/><button type="submit" aria-label={`Remover ${item.title}`} className="rounded-lg px-2 py-1 text-ink-faint hover:bg-paper hover:text-primary">×</button></form>
          </div>
        ))}</div>}
    </section>
  </>;
}