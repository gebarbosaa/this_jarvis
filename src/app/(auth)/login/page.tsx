import { signIn } from '../actions';

export default function LoginPage({ searchParams }: { searchParams: { erro?: string } }) {
  return (
    <main className="flex min-h-dvh flex-col justify-center px-6 py-12">
      <div className="mx-auto w-full max-w-sm">
        <h1 className="font-display text-3xl text-ink">Secretária</h1>
        <p className="mt-2 text-ink-soft">Digite seu PIN para entrar.</p>
        {searchParams.erro && (
          <p className="mt-6 rounded-card border border-clay/40 bg-clay-light px-4 py-3 text-sm text-clay">
            {searchParams.erro}
          </p>
        )}
        <form action={signIn} className="mt-8 flex flex-col gap-4">
          <label className="flex flex-col gap-1.5">
            <span className="text-sm text-ink-soft">PIN</span>
            <input
              type="password"
              name="pin"
              inputMode="numeric"
              pattern="[0-9]*"
              maxLength={4}
              required
              autoComplete="off"
              autoFocus
              className="rounded-card border border-border bg-white px-4 py-3 text-center text-2xl tracking-[0.5em] text-ink outline-none focus:border-pine"
            />
          </label>
          <button type="submit" className="mt-2 rounded-card bg-pine px-4 py-3 font-medium text-white transition-colors active:bg-pine-dark">
            Entrar
          </button>
        </form>
      </div>
    </main>
  );
}
