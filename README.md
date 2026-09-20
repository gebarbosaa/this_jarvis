# Secretária

Assistente pessoal (tarefas, hábitos, notas, objetivos, lembretes e uma IA central),
com arquitetura já preparada para conversar com o Harmony Hub no futuro.

## Stack

- Next.js 14 (App Router) + React + TypeScript
- Tailwind CSS
- Supabase (Auth + Postgres + RLS)
- Deploy: Vercel
- IA: API da Anthropic, chamada a partir de uma Route Handler no servidor

## 1. Criar o projeto no Supabase

1. Crie um projeto em https://supabase.com/dashboard
2. Vá em **Project Settings → API** e copie:
   - `Project URL` → vai virar `NEXT_PUBLIC_SUPABASE_URL`
   - `anon public key` → vai virar `NEXT_PUBLIC_SUPABASE_ANON_KEY`
3. Vá em **SQL Editor**, cole o conteúdo de `supabase/schema.sql` inteiro e rode.
   Isso cria todas as tabelas, os índices e as políticas de RLS (cada usuário só
   enxerga os próprios dados).
4. (Opcional, recomendado) Em **Authentication → Providers**, confirme que
   "Email" está habilitado. Por padrão o Supabase exige confirmação de e-mail —
   se quiser testar mais rápido em desenvolvimento, você pode desativar essa
   confirmação em **Authentication → Providers → Email**.

## 2. Rodar localmente

```bash
npm install
cp .env.example .env.local
```

Preencha o `.env.local` com as duas chaves do Supabase e, se quiser testar a
Secretária IA, sua `ANTHROPIC_API_KEY` (https://console.anthropic.com).

```bash
npm run dev
```

Abra http://localhost:3000 — você será redirecionado para `/login`. Crie uma
conta pela tela de cadastro (isso já cria automaticamente o seu `profile` via
trigger do banco).

## 3. Deploy na Vercel

1. Suba este projeto para um repositório no GitHub.
2. Em https://vercel.com, importe o repositório.
3. Em **Environment Variables**, adicione as mesmas variáveis do `.env.local`:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `ANTHROPIC_API_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY` (em Project Settings → API → `service_role`, no Supabase — necessária só para o cron)
   - `CRON_SECRET` (qualquer valor aleatório, ex: `openssl rand -hex 32`)
4. Deploy. A cada `git push` a Vercel gera um novo deploy automaticamente.
5. O arquivo `vercel.json` já registra o cron diário (`/api/cron/daily-brief`, todo dia
   às 11h UTC ≈ 8h em São Paulo). No plano Hobby da Vercel, crons só rodam uma vez
   por dia — está dentro do limite. A Vercel injeta o `Authorization: Bearer $CRON_SECRET`
   automaticamente ao chamar a rota; não precisa configurar nada além da env var.

## Estrutura

```
src/app/(auth)/       login, cadastro, actions de autenticação
src/app/(app)/         páginas protegidas (nav inferior + botão de adicionar)
  inicio/              resumo do dia
  semana/              visão da semana (tarefas + eventos)
  tarefas/             CRUD completo de tarefas
  habitos/             hábitos + registro diário
  notas/               notas com fixar/excluir
  objetivos/           metas com passos e progresso
  lembretes/           lembretes com data/hora
  secretaria-ia/        chat com a IA (persistido no banco)
  ajustes/             perfil + logout
src/app/api/ai/chat/       route handler do chat (com tool use: cria itens de verdade)
src/app/api/ai/weekly-plan/  gera o plano da semana (resumo + foco) com IA
src/app/api/cron/daily-brief/  job diário: sugestões proativas + plano semanal (segundas)
src/lib/ai/                 helpers de IA compartilhados (chamada à API, plano, resumo diário)
src/lib/supabase/      clients (browser, server, middleware, admin/service role)
supabase/schema.sql    schema completo do banco, com RLS

## Fase 3 — Inteligência (status atual)

- **Chat da Secretária**: conversa persistida em `ai_conversations`/`ai_messages`.
- **Comandos naturais**: a IA tem ferramentas reais (tool use) para criar tarefa,
  hábito, nota, lembrete e objetivo direto no banco — não é só texto bonito.
- **Planejamento semanal**: botão em Semana gera um resumo + foco da semana a
  partir dos dados reais do usuário, salvo em `weekly_plans`.
- **Sugestões e alertas**: o Início mostra tarefas atrasadas sem precisar de IA;
  o cron diário (`/api/cron/daily-brief`) roda uma vez por dia, olha a carga do
  usuário (atrasos, dia cheio, lembretes) e, quando há algo relevante, escreve
  uma mensagem proativa na conversa dele — que aparece na próxima vez que ele
  abrir a Secretária IA. Às segundas, o mesmo job também gera o plano da semana
  de todo mundo automaticamente.
```

## Preparado para o Harmony Hub (Fase 4)

O schema já inclui as tabelas `integrations` e `integration_permissions`,
isoladas por `user_id` e com RLS, mas nenhuma tela das Fases 1–3 depende delas.
Quando o Harmony Hub estiver pronto para se conectar:

1. Criar uma tela em Ajustes para iniciar a conexão (grava em `integrations`).
2. Definir os escopos de permissão (`integration_permissions`) que o usuário
   autoriza — ex.: "consultar dados financeiros", "criar lembretes".
3. Criar uma API própria (`/api/integrations/harmony/...`) que valide o
   `integration_permissions` antes de trocar qualquer dado com o Harmony.

Isso evita reconstruir o banco ou a autenticação mais tarde — só se adiciona
uma nova camada por cima do que já existe.

## Regra de ouro

Assim como no Harmony: não mexer no que já está funcionando sem necessidade.
Cada fase nova deve ser aditiva, não uma reescrita.