-- Additive repair for the production schema; does not drop or rewrite existing records.
create extension if not exists pgcrypto;
do $$ begin create type public.task_status as enum ('pending','done','archived'); exception when duplicate_object then null; end $$;
do $$ begin create type public.task_priority as enum ('low','medium','high'); exception when duplicate_object then null; end $$;
do $$ begin create type public.habit_frequency as enum ('daily','weekly','custom'); exception when duplicate_object then null; end $$;
do $$ begin create type public.goal_status as enum ('active','paused','done','abandoned'); exception when duplicate_object then null; end $$;
create or replace function public.set_updated_at() returns trigger language plpgsql as $$ begin new.updated_at=now(); return new; end $$;

create table if not exists public.profiles (id uuid primary key references auth.users(id) on delete cascade, display_name text, avatar_url text, timezone text not null default 'America/Sao_Paulo', created_at timestamptz not null default now(), updated_at timestamptz not null default now());
create table if not exists public.tasks (id uuid primary key default gen_random_uuid(), user_id uuid not null references auth.users(id) on delete cascade, title text not null, description text, status public.task_status not null default 'pending', priority public.task_priority not null default 'medium', due_date date, due_time time, completed_at timestamptz, created_at timestamptz not null default now(), updated_at timestamptz not null default now());
create table if not exists public.habits (id uuid primary key default gen_random_uuid(), user_id uuid not null references auth.users(id) on delete cascade, name text not null, description text, frequency public.habit_frequency not null default 'daily', target_days_per_week smallint, color text not null default '#3D6B5C', archived boolean not null default false, created_at timestamptz not null default now(), updated_at timestamptz not null default now());
create table if not exists public.habit_logs (id uuid primary key default gen_random_uuid(), habit_id uuid not null references public.habits(id) on delete cascade, user_id uuid not null references auth.users(id) on delete cascade, logged_date date not null default current_date, done boolean not null default true, note text, created_at timestamptz not null default now(), unique(habit_id,logged_date));
create table if not exists public.notes (id uuid primary key default gen_random_uuid(), user_id uuid not null references auth.users(id) on delete cascade, title text not null default '', content text not null default '', pinned boolean not null default false, tags text[] not null default '{}', created_at timestamptz not null default now(), updated_at timestamptz not null default now());
create table if not exists public.goals (id uuid primary key default gen_random_uuid(), user_id uuid not null references auth.users(id) on delete cascade, title text not null, description text, target_date date, status public.goal_status not null default 'active', created_at timestamptz not null default now(), updated_at timestamptz not null default now());
create table if not exists public.goal_steps (id uuid primary key default gen_random_uuid(), goal_id uuid not null references public.goals(id) on delete cascade, user_id uuid not null references auth.users(id) on delete cascade, title text not null, done boolean not null default false, order_index integer not null default 0, created_at timestamptz not null default now());
create table if not exists public.weekly_plans (id uuid primary key default gen_random_uuid(), user_id uuid not null references auth.users(id) on delete cascade, week_start_date date not null, summary text, focus text, generated_by_ai boolean not null default false, created_at timestamptz not null default now(), unique(user_id,week_start_date));
create table if not exists public.integration_permissions (id uuid primary key default gen_random_uuid(), integration_id uuid not null references public.integrations(id) on delete cascade, user_id uuid not null references auth.users(id) on delete cascade, scope text not null, granted_at timestamptz not null default now(), revoked_at timestamptz, unique(integration_id,scope));

alter table public.calendar_events add column if not exists location text;
alter table public.calendar_events add column if not exists source text not null default 'manual';
alter table public.calendar_events add column if not exists updated_at timestamptz not null default now();
alter table public.reminders add column if not exists recurrence_rule text;
alter table public.reminders add column if not exists related_task_id uuid references public.tasks(id) on delete set null;

create index if not exists tasks_user_id_idx on public.tasks(user_id);
create index if not exists tasks_due_date_idx on public.tasks(user_id,due_date);
create index if not exists habits_user_id_idx on public.habits(user_id);
create index if not exists habit_logs_user_id_idx on public.habit_logs(user_id);
create index if not exists habit_logs_habit_date_idx on public.habit_logs(habit_id,logged_date);
create index if not exists notes_user_id_idx on public.notes(user_id);
create index if not exists goals_user_id_idx on public.goals(user_id);
create index if not exists goal_steps_goal_id_idx on public.goal_steps(goal_id);
create index if not exists weekly_plans_user_week_idx on public.weekly_plans(user_id,week_start_date);

alter table public.profiles enable row level security;
alter table public.tasks enable row level security;
alter table public.habits enable row level security;
alter table public.habit_logs enable row level security;
alter table public.notes enable row level security;
alter table public.goals enable row level security;
alter table public.goal_steps enable row level security;
alter table public.weekly_plans enable row level security;
alter table public.integration_permissions enable row level security;

do $$ begin create policy profiles_select_own on public.profiles for select to authenticated using ((select auth.uid())=id); exception when duplicate_object then null; end $$;
do $$ begin create policy profiles_insert_own on public.profiles for insert to authenticated with check ((select auth.uid())=id); exception when duplicate_object then null; end $$;
do $$ begin create policy profiles_update_own on public.profiles for update to authenticated using ((select auth.uid())=id) with check ((select auth.uid())=id); exception when duplicate_object then null; end $$;
do $$ begin create policy tasks_all_own on public.tasks for all to authenticated using ((select auth.uid())=user_id) with check ((select auth.uid())=user_id); exception when duplicate_object then null; end $$;
do $$ begin create policy habits_all_own on public.habits for all to authenticated using ((select auth.uid())=user_id) with check ((select auth.uid())=user_id); exception when duplicate_object then null; end $$;
do $$ begin create policy habit_logs_all_own on public.habit_logs for all to authenticated using ((select auth.uid())=user_id) with check ((select auth.uid())=user_id); exception when duplicate_object then null; end $$;
do $$ begin create policy notes_all_own on public.notes for all to authenticated using ((select auth.uid())=user_id) with check ((select auth.uid())=user_id); exception when duplicate_object then null; end $$;
do $$ begin create policy goals_all_own on public.goals for all to authenticated using ((select auth.uid())=user_id) with check ((select auth.uid())=user_id); exception when duplicate_object then null; end $$;
do $$ begin create policy goal_steps_all_own on public.goal_steps for all to authenticated using ((select auth.uid())=user_id) with check ((select auth.uid())=user_id); exception when duplicate_object then null; end $$;
do $$ begin create policy weekly_plans_all_own on public.weekly_plans for all to authenticated using ((select auth.uid())=user_id) with check ((select auth.uid())=user_id); exception when duplicate_object then null; end $$;
do $$ begin create policy integration_permissions_all_own on public.integration_permissions for all to authenticated using ((select auth.uid())=user_id) with check ((select auth.uid())=user_id); exception when duplicate_object then null; end $$;

do $$ begin create trigger profiles_set_updated_at before update on public.profiles for each row execute function public.set_updated_at(); exception when duplicate_object then null; end $$;
do $$ begin create trigger tasks_set_updated_at before update on public.tasks for each row execute function public.set_updated_at(); exception when duplicate_object then null; end $$;
do $$ begin create trigger habits_set_updated_at before update on public.habits for each row execute function public.set_updated_at(); exception when duplicate_object then null; end $$;
do $$ begin create trigger notes_set_updated_at before update on public.notes for each row execute function public.set_updated_at(); exception when duplicate_object then null; end $$;
do $$ begin create trigger goals_set_updated_at before update on public.goals for each row execute function public.set_updated_at(); exception when duplicate_object then null; end $$;
do $$ begin create trigger calendar_events_set_updated_at before update on public.calendar_events for each row execute function public.set_updated_at(); exception when duplicate_object then null; end $$;

create or replace function public.handle_new_user() returns trigger language plpgsql security definer set search_path=public as $$
begin
  insert into public.profiles(id,display_name) values (new.id,coalesce(new.raw_user_meta_data->>'display_name',split_part(coalesce(new.email,''),'@',1))) on conflict(id) do nothing;
  return new;
end $$;
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created after insert on auth.users for each row execute function public.handle_new_user();
insert into public.profiles(id,display_name) select id,coalesce(raw_user_meta_data->>'display_name',split_part(coalesce(email,''),'@',1)) from auth.users on conflict(id) do nothing;
grant select,insert,update,delete on public.profiles,public.tasks,public.habits,public.habit_logs,public.notes,public.goals,public.goal_steps,public.weekly_plans,public.integration_permissions to authenticated;


-- Keep conversation ordering in sync with the latest user/assistant message.
create or replace function public.touch_ai_conversation_on_message()
returns trigger language plpgsql as $$
begin
  update public.ai_conversations
  set updated_at = now()
  where id = new.conversation_id and user_id = new.user_id;
  return new;
end $$;
drop trigger if exists ai_messages_touch_conversation on public.ai_messages;
create trigger ai_messages_touch_conversation
after insert on public.ai_messages
for each row execute function public.touch_ai_conversation_on_message();

-- The function is only intended to run as a trigger, not as a public RPC.
revoke execute on function public.handle_new_user() from public, anon, authenticated;
revoke execute on function public.touch_ai_conversation_on_message() from public, anon, authenticated;
