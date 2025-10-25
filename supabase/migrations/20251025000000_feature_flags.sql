-- Feature Flags: Global, authenticated-read only
-- Creates feature_flags table and RLS policies; seed analytics_enabled=false

create table if not exists public.feature_flags (
  id uuid primary key default gen_random_uuid(),
  key text unique not null,
  enabled boolean not null default false,
  description text default '',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table public.feature_flags enable row level security;

-- Allow authenticated users to read flags
drop policy if exists "feature flags readable by authenticated" on public.feature_flags;
create policy "feature flags readable by authenticated"
  on public.feature_flags for select
  to authenticated
  using (true);

-- Deny writes from authenticated clients (managed via Studio/service role)
drop policy if exists "deny insert on feature_flags" on public.feature_flags;
create policy "deny insert on feature_flags"
  on public.feature_flags for insert
  to authenticated
  with check (false);

drop policy if exists "deny update on feature_flags" on public.feature_flags;
create policy "deny update on feature_flags"
  on public.feature_flags for update
  to authenticated
  using (false);

drop policy if exists "deny delete on feature_flags" on public.feature_flags;
create policy "deny delete on feature_flags"
  on public.feature_flags for delete
  to authenticated
  using (false);

-- Seed initial flag
insert into public.feature_flags (key, enabled, description)
values ('analytics_enabled', false, 'Globally toggle Analytics visibility')
on conflict (key) do nothing;


