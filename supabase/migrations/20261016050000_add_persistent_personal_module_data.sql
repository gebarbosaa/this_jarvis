create table if not exists public.personal_module_data (id uuid primary key default gen_random_uuid(), user_id uuid not null references auth.users(id) on delete cascade, module_key text not null check (module_key in ('desenvolvimento-pessoal','casa','leitura','alimentacao','habitos-rotina')), tab_key text not null, entries jsonb not null default '[]'::jsonb, updated_at timestamptz not null default now(), constraint personal_module_data_user_module_tab_key unique (user_id,module_key,tab_key));
alter table public.personal_module_data enable row level security;
create policy "personal_module_data_select_own" on public.personal_module_data for select to authenticated using (auth.uid() = user_id);
create policy "personal_module_data_insert_own" on public.personal_module_data for insert to authenticated with check (auth.uid() = user_id);
create policy "personal_module_data_update_own" on public.personal_module_data for update to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "personal_module_data_delete_own" on public.personal_module_data for delete to authenticated using (auth.uid() = user_id);
grant select, insert, update, delete on public.personal_module_data to authenticated;
