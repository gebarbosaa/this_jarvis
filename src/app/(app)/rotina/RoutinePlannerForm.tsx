'use client';
import { useRef } from 'react';
import { addRoutineActivity, saveRoutineSettings } from './actions';

const PRESETS=[['Acordar','10'],['Banho','20'],['Café da manhã','30'],['Almoço','60'],['Jantar','30'],['Trabalho','480']];

export function RoutinePlannerForm({dayStart,dayEnd}:{dayStart:string;dayEnd:string}){
 const ref=useRef<HTMLFormElement>(null);
 return <div className="space-y-4">
  <section className="app-card p-4 sm:p-5"><div className="mb-4"><p className="section-label">Meu dia</p><p className="mt-1 text-sm text-ink-soft">Defina quando seu dia começa e termina.</p></div>
   <form action={saveRoutineSettings} className="grid gap-3 sm:grid-cols-3">
    <label className="text-xs font-bold text-ink-soft">COMEÇA<input className="field mt-1 w-full" type="time" name="day_start" defaultValue={dayStart} required/></label>
    <label className="text-xs font-bold text-ink-soft">TERMINA<input className="field mt-1 w-full" type="time" name="day_end" defaultValue={dayEnd} required/></label>
    <button className="primary-button self-end" type="submit">SALVAR HORÁRIO</button>
   </form>
  </section>
  <section className="app-card p-4 sm:p-5"><div className="mb-4"><p className="section-label">Afazeres e rotina cotidiana</p><p className="mt-1 text-sm text-ink-soft">Horários fixos ficam protegidos; o restante é encaixado automaticamente.</p></div>
   <form ref={ref} action={async fd=>{ref.current?.reset();await addRoutineActivity(fd)}} className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
    <input name="title" required placeholder="Ex.: estudar, academia..." className="field lg:col-span-2"/>
    <input name="duration_minutes" type="number" min="1" max="1440" defaultValue="30" className="field" placeholder="Minutos"/>
    <input name="fixed_start" type="time" className="field" aria-label="Horário fixo (opcional)"/>
    <select name="kind" className="field"><option value="daily">Todo dia</option><option value="task">Afazer</option></select>
    <button className="primary-button sm:col-span-2 lg:col-span-5" type="submit">ADICIONAR AO MEU DIA</button>
   </form>
   <div className="mt-4 flex flex-wrap gap-2">{PRESETS.map(([title,minutes])=><form key={title} action={async fd=>{await addRoutineActivity(fd)}}><input type="hidden" name="title" value={title}/><input type="hidden" name="duration_minutes" value={minutes}/><input type="hidden" name="kind" value="daily"/><button className="rounded-full border border-border bg-paper px-3 py-1.5 text-[10px] font-bold tracking-wide text-ink-soft hover:text-primary" type="submit">+ {title}</button></form>)}</div>
  </section>
 </div>;
}