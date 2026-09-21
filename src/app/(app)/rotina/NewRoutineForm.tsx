'use client';
import { useRef } from 'react';
import { createRoutine } from './actions';
export function NewRoutineForm(){
 const ref=useRef<HTMLFormElement>(null);
 return <form ref={ref} action={async fd=>{ref.current?.reset();await createRoutine(fd)}} className="form-shell flex gap-2">
  <input name="name" required placeholder="Nova rotina..." className="field min-w-0 flex-1"/>
  <button className="primary-button" type="submit">CRIAR</button>
 </form>
}