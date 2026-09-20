import Link from 'next/link';
import { signUp } from '../actions';

export default function CadastroPage({
  searchParams,
}: {
  searchParams: { erro?: string };
}) {
  return (
    <main className="flex min-h-dvh flex-col justify-center px-6 py-12">
      <div className="mx-auto w-full max-w-sm">
        <h1 className="font-display text-3xl text-ink">Criar conta</h1>
        <p className="mt-2 text-ink-soft">Seus dados ficam só com você.</p>
        {searchParams.erro && (
          <p className="mt-6 rounded-card border border-clay/40 bg-clay-light px-4 py-3 text-sm text-clay">
            {searchParams.erro}
          </p>
        )}
        <form action={signUp} className="mt-8 flex flex-col gap-4">
          <label className="flex flex-col gap-1.5"><span className="text-sm text-ink-soft">Como podemos te chamar?</span><input type="text" name="display_name" required autoComplete="name" className="rounded-card border border-border bg-white px-4 py-3 text-ink outline-none focus:border-pine" /></label>
          <label className="flex flex-col gap-1.5"><span className="text-sm text-ink-soft">E-mail</span><input type="email" name="email" required autoComplete="email" className="rounded-card border border-border bg-white px-4 py-3 text-ink outline-none focus:border-pine" /></label>
          <label className="flex flex-col gap-1.5"><span className="text-sm text-ink-soft">Senha</span><input type="password" name="password" required minLength={6} autoComplete="new-password" className="rounded-card border border-border bg-white px-4 py-3 text-ink outline-none focus:border-pine" /></label>
          <button type="submit" className="mt-2 rounded-card bg-pine px-4 py-3 font-medium text-white transition-colors active:bg-pine-dark">Criar minha conta</button>
        </form>
        <p className="mt-6 text-center text-sm text-ink-soft">Já tem conta? <Link href="/login" className="font-medium text-pine underline underline-offset-2">Entrar</Link></p>
      </div>
    </main>
  );
}