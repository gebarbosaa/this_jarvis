import { signIn } from '../actions';

export default function LoginPage({ searchParams }: { searchParams: { erro?: string } }) {
  return (
    <main className="flex min-h-dvh items-center justify-center bg-paper px-4 py-8">
      <div className="w-full max-w-sm space-y-6">
        <div className="flex flex-col items-center gap-3 text-center">
          <span className="gradient-primary flex h-14 w-14 items-center justify-center rounded-2xl text-xl font-black text-black shadow-elegant">J</span>
          <div>
            <h1 className="label-caps text-2xl tracking-[0.2em] text-ink">SECRETÁRIA</h1>
            <p className="mt-1 text-sm text-ink-soft">ORGANIZAÇÃO PESSOAL EM UM SÓ LUGAR.</p>
          </div>
        </div>

        <div className="rounded-2xl border border-border bg-card p-5 shadow-elegant">
          <p className="label-caps mb-4 text-[10px] text-ink-faint">ACESSO PRIVADO</p>
          {searchParams.erro && (
            <p className="mb-4 rounded-xl border border-clay/40 bg-clay-light px-4 py-3 text-sm text-clay">
              {searchParams.erro}
            </p>
          )}
          <form action={signIn} className="flex flex-col gap-4">
            <label className="flex flex-col gap-1.5">
              <span className="label-caps text-[10px] text-ink-soft">PIN DE ACESSO</span>
              <input
                type="password"
                name="pin"
                inputMode="numeric"
                pattern="[0-9]*"
                maxLength={4}
                required
                autoComplete="off"
                autoFocus
                className="w-full rounded-xl border border-input bg-secondary px-4 py-3 text-center text-2xl tracking-[0.5em] text-ink outline-none"
              />
            </label>
            <button type="submit" className="gradient-primary shadow-elegant w-full rounded-xl px-4 py-3 text-sm font-bold text-black transition-transform active:scale-[0.98]">
              ENTRAR
            </button>
          </form>
        </div>
      </div>
    </main>
  );
}