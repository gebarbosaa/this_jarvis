'use client';

import { useRef, useState, useTransition } from 'react';

type Mensagem = { id:string; role:'user'|'assistant'; content:string };

export function ChatClient({conversationId,initialMessages}:{conversationId:string;initialMessages:Mensagem[]}) {
  const [mensagens,setMensagens]=useState<Mensagem[]>(initialMessages);
  const [texto,setTexto]=useState('');
  const [erro,setErro]=useState<string|null>(null);
  const [isPending,startTransition]=useTransition();
  const listRef=useRef<HTMLDivElement>(null);

  function enviar() {
    const conteudo=texto.trim();
    if(!conteudo||isPending)return;
    setErro(null); setTexto('');
    setMensagens(atual=>[...atual,{id:`local-${Date.now()}`,role:'user',content:conteudo}]);
    startTransition(async()=>{
      try{
        const res=await fetch('/api/ai/chat',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({conversationId,message:conteudo})});
        const data=await res.json();
        if(!res.ok){setErro(data.error??'Algo deu errado.');return;}
        setMensagens(atual=>[...atual,{id:`local-${Date.now()}-r`,role:'assistant',content:data.reply}]);
        queueMicrotask(()=>listRef.current?.scrollTo(0,listRef.current.scrollHeight));
      }catch{setErro('Não foi possível falar com a Secretária agora.');}
    });
  }

  return (
    <div className="flex min-h-[calc(100dvh-11rem)] flex-col overflow-hidden rounded-[14px] border border-border bg-surface shadow-sm">
      <div ref={listRef} className="min-h-0 flex-1 space-y-3 overflow-y-auto p-3 sm:p-5">
        {mensagens.length===0 && <p className="mt-8 text-center text-sm text-ink-faint">Pergunte algo ou peça para organizar seu dia.</p>}
        {mensagens.map(m=>(
          <div key={m.id} className={`max-w-[88%] rounded-2xl px-3 py-2.5 text-sm leading-6 sm:max-w-[75%] ${m.role==='user'?'ml-auto bg-pine text-black':'mr-auto border border-border bg-paper text-ink'}`}>
            <p className="whitespace-pre-wrap break-words">{m.content}</p>
          </div>
        ))}
        {isPending&&<p className="text-xs text-ink-faint">A Secretária está digitando...</p>}
        {erro&&<p className="text-xs text-clay">{erro}</p>}
      </div>
      <div className="shrink-0 border-t border-border bg-surface p-3 sm:p-4">
        <div className="flex min-w-0 gap-2">
          <input type="text" value={texto} onChange={e=>setTexto(e.target.value)} onKeyDown={e=>{if(e.key==='Enter')enviar();}} placeholder="Escreva para a Secretária..." className="min-w-0 flex-1 rounded-xl border border-border bg-paper px-3 py-2.5 text-sm text-ink outline-none" />
          <button type="button" onClick={enviar} disabled={isPending||!texto.trim()} className="primary-button shrink-0 px-4 disabled:opacity-50">Enviar</button>
        </div>
      </div>
    </div>
  );
}