'use client';

import { useRef, useState, useTransition } from 'react';

type Mensagem = { id: string; role: 'user' | 'assistant'; content: string };

export function ChatClient({
  conversationId,
  initialMessages,
}: {
  conversationId: string;
  initialMessages: Mensagem[];
}) {
  const [mensagens, setMensagens] = useState<Mensagem[]>(initialMessages);
  const [texto, setTexto] = useState('');
  const [erro, setErro] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const listRef = useRef<HTMLDivElement>(null);

  function enviar() {
    const conteudo = texto.trim();
    if (!conteudo || isPending) return;

    setErro(null);
    setTexto('');

    const mensagemUsuario: Mensagem = {
      id: `local-${Date.now()}`,
      role: 'user',
      content: conteudo,
    };
    setMensagens((atual) => [...atual, mensagemUsuario]);

    startTransition(async () => {
      try {
        const res = await fetch('/api/ai/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ conversationId, message: conteudo }),
        });

        const data = await res.json();

        if (!res.ok) {
          setErro(data.error ?? 'Algo deu errado.');
          return;
        }

        setMensagens((atual) => [
          ...atual,
          { id: `local-${Date.now()}-r`, role: 'assistant', content: data.reply },
        ]);
        queueMicrotask(() => listRef.current?.scrollTo(0, listRef.current.scrollHeight));
      } catch {
        setErro('Não foi possível falar com a Secretária agora.');
      }
    });
  }

  return (
    <div className="flex h-[calc(100dvh-9rem)] flex-col">
      <div ref={listRef} className="flex-1 space-y-3 overflow-y-auto pb-4">
        {mensagens.length === 0 && (
          <p className="mt-8 text-center text-sm text-ink-faint">
            Pergunte algo ou peça para organizar seu dia.
          </p>
        )}
        {mensagens.map((m) => (
          <div
            key={m.id}
            className={`max-w-[85%] rounded-card px-3 py-2 text-sm ${
              m.role === 'user'
                ? 'ml-auto bg-pine text-white'
                : 'mr-auto border border-border bg-white text-ink'
            }`}
          >
            <p className="whitespace-pre-wrap">{m.content}</p>
          </div>
        ))}
        {isPending && <p className="text-xs text-ink-faint">A Secretária está digitando...</p>}
        {erro && <p className="text-xs text-clay">{erro}</p>}
      </div>

      <div className="flex items-center gap-2 border-t border-border bg-paper pt-3">
        <input
          type="text"
          value={texto}
          onChange={(e) => setTexto(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') enviar();
          }}
          placeholder="Escreva para a Secretária..."
          className="flex-1 rounded-card border border-border bg-white px-3 py-2.5 text-ink outline-none focus:border-pine"
        />
        <button
          type="button"
          onClick={enviar}
          disabled={isPending || !texto.trim()}
          className="shrink-0 rounded-card bg-pine px-4 py-2.5 text-sm font-medium text-white disabled:opacity-50"
        >
          Enviar
        </button>
      </div>
    </div>
  );
}