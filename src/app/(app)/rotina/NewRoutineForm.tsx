'use client';
import { useRef } from 'react';
import { createRoutine } from './actions';
export function NewRoutineForm(){
 const ref=useRef<HTMLFormElement>(null);
 return <form ref={ref} action={async fd=>{await createRoutine(fd);ref.current?.reset()}} className="form-shell flex gap-2">
  <input name="name" required placeholder="Nova rotina..." className="field min-w-0 flex-1"/>
  <button className="primary-button" type="submit">CRIAR</button>
 </form>
}