-- ============================================================================
-- SECRETÁRIA — schema inicial
-- Rode este arquivo inteiro no SQL Editor do Supabase (Project > SQL Editor).
-- Todas as tabelas de dados do usuário têm RLS habilitado e isoladas por user_id.
-- ============================================================================

-- ----------------------------------------------------------------------------
-- Extensões
-- ----------------------------------------------------------------------------
create extension if not exists "pgcrypto";

-- ----------------------------------------------------------------------------
-- Função utilitária: mantém updated_at sempre atualizado
-- ----------------------------------------------------------------------------
create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- ----------------------------------------------------------------------------
-- profiles — um registro por usuário autenticado
-- ----------------------------------------------------------------------------
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  avatar_url text,
  timezone text not null default 'America/Sao_Paulo',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

create policy "profiles_select_own" on public.profiles
  for select using (auth.uid() = id);
create policy "profiles_update_own" on public.profiles
  for update using (auth.uid() = id);
create policy "profiles_insert_own" on public.profiles
  for insert with check (auth.uid() = id);

create trigger profiles_set_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();

-- Cria o profile automaticamente quando um usuário se cadastra
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, display_name)
  values (new.id, coalesce(new.raw_user_meta_data->>'display_name', split_part(new.email, '@', 1)));
  return new;
end;
$$ language plpgsql security definer set search_path = public;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ----------------------------------------------------------------------------
-- tasks
-- ----------------------------------------------------------------------------
create type task_status as enum ('pending', 'done', 'archived');
create type task_priority as enum ('low', 'medium', 'high');

create table public.tasks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  description text,
  status task_status not null default 'pending',
  priority task_priority not null default 'medium',
  due_date date,
  due_time time,
  completed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index tasks_user_id_idx on public.tasks(user_id);
create index tasks_due_date_idx on public.tasks(user_id, due_date);

alter table public.tasks enable row level security;
create policy "tasks_all_own" on public.tasks
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create trigger tasks_set_updated_at
  before update on public.tasks
  for each row execute function public.set_updated_at();

-- ----------------------------------------------------------------------------
-- habits + habit_logs
-- ----------------------------------------------------------------------------
create type habit_frequency as enum ('daily', 'weekly', 'custom');

create table public.habits (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  description text,
  frequency habit_frequency not null default 'daily',
  target_days_per_week smallint,
  color text not null default '#3D6B5C',
  archived boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index habits_user_id_idx on public.habits(user_id);

alter table public.habits enable row level security;
create policy "habits_all_own" on public.habits
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create trigger habits_set_updated_at
  before update on public.habits
  for each row execute function public.set_updated_at();

create table public.habit_logs (
  id uuid primary key default gen_random_uuid(),
  habit_id uuid not null references public.habits(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  logged_date date not null default current_date,
  done boolean not null default true,
  note text,
  created_at timestamptz not null default now(),
  unique (habit_id, logged_date)
);

create index habit_logs_user_id_idx on public.habit_logs(user_id);
create index habit_logs_habit_date_idx on public.habit_logs(habit_id, logged_date);

alter table public.habit_logs enable row level security;
create policy "habit_logs_all_own" on public.habit_logs
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- ----------------------------------------------------------------------------
-- notes
-- ----------------------------------------------------------------------------
create table public.notes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null default '',
  content text not null default '',
  pinned boolean not null default false,
  tags text[] not null default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index notes_user_id_idx on public.notes(user_id);

alter table public.notes enable row level security;
create policy "notes_all_own" on public.notes
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create trigger notes_set_updated_at
  before update on public.notes
  for each row execute function public.set_updated_at();

-- ----------------------------------------------------------------------------
-- goals + goal_steps
-- ----------------------------------------------------------------------------
create type goal_status as enum ('active', 'paused', 'done', 'abandoned');

create table public.goals (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  description text,
  target_date date,
  status goal_status not null default 'active',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index goals_user_id_idx on public.goals(user_id);

alter table public.goals enable row level security;
create policy "goals_all_own" on public.goals
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create trigger goals_set_updated_at
  before update on public.goals
  for each row execute function public.set_updated_at();

create table public.goal_steps (
  id uuid primary key default gen_random_uuid(),
  goal_id uuid not null references public.goals(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  done boolean not null default false,
  order_index integer not null default 0,
  created_at timestamptz not null default now()
);

create index goal_steps_goal_id_idx on public.goal_steps(goal_id);

alter table public.goal_steps enable row level security;
create policy "goal_steps_all_own" on public.goal_steps
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- ----------------------------------------------------------------------------
-- reminders
-- ----------------------------------------------------------------------------
create table public.reminders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  remind_at timestamptz not null,
  recurrence_rule text,
  related_task_id uuid references public.tasks(id) on delete set null,
  dismissed_at timestamptz,
  created_at timestamptz not null default now()
);

create index reminders_user_id_idx on public.reminders(user_id);
create index reminders_remind_at_idx on public.reminders(user_id, remind_at);

alter table public.reminders enable row level security;
create policy "reminders_all_own" on public.reminders
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- ----------------------------------------------------------------------------
-- calendar_events + weekly_plans
-- ----------------------------------------------------------------------------
create table public.calendar_events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  description text,
  start_at timestamptz not null,
  end_at timestamptz,
  all_day boolean not null default false,
  location text,
  source text not null default 'manual',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index calendar_events_user_id_idx on public.calendar_events(user_id);
create index calendar_events_start_at_idx on public.calendar_events(user_id, start_at);

alter table public.calendar_events enable row level security;
create policy "calendar_events_all_own" on public.calendar_events
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create trigger calendar_events_set_updated_at
  before update on public.calendar_events
  for each row execute function public.set_updated_at();

create table public.weekly_plans (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  week_start_date date not null,
  summary text,
  focus text,
  generated_by_ai boolean not null default false,
  created_at timestamptz not null default now(),
  unique (user_id, week_start_date)
);

alter table public.weekly_plans enable row level security;
create policy "weekly_plans_all_own" on public.weekly_plans
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- ----------------------------------------------------------------------------
-- ai_conversations + ai_messages (Secretária IA)
-- ----------------------------------------------------------------------------
create type ai_message_role as enum ('user', 'assistant', 'system');

create table public.ai_conversations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null default 'Nova conversa',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index ai_conversations_user_id_idx on public.ai_conversations(user_id);

alter table public.ai_conversations enable row level security;
create policy "ai_conversations_all_own" on public.ai_conversations
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create trigger ai_conversations_set_updated_at
  before update on public.ai_conversations
  for each row execute function public.set_updated_at();

create table public.ai_messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references public.ai_conversations(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role ai_message_role not null,
  content text not null,
  created_at timestamptz not null default now()
);

create index ai_messages_conversation_id_idx on public.ai_messages(conversation_id, created_at);

alter table public.ai_messages enable row level security;
create policy "ai_messages_all_own" on public.ai_messages
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- ============================================================================
-- FASE 4 (preparado, não usado ainda) — integração com o Harmony Hub
-- Criamos as tabelas desde já para não precisar migrar o schema depois,
-- mas nenhuma tela da Fase 1–3 depende delas.
-- ============================================================================
create type integration_provider as enum ('harmony_hub');
create type integration_status as enum ('pending', 'connected', 'revoked', 'error');

create table public.integrations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  provider integration_provider not null,
  status integration_status not null default 'pending',
  external_account_id text,
  metadata jsonb not null default '{}'::jsonb,
  connected_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, provider)
);

alter table public.integrations enable row level security;
create policy "integrations_all_own" on public.integrations
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create trigger integrations_set_updated_at
  before update on public.integrations
  for each row execute function public.set_updated_at();

create table public.integration_permissions (
  id uuid primary key default gen_random_uuid(),
  integration_id uuid not null references public.integrations(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  scope text not null,
  granted_at timestamptz not null default now(),
  revoked_at timestamptz,
  unique (integration_id, scope)
);

alter table public.integration_permissions enable row level security;
create policy "integration_permissions_all_own" on public.integration_permissions
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- ============================================================================
-- Fim do schema inicial.
-- ============================================================================