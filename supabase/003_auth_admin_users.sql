-- DELICATESSEN - Auth + admin authorization table
-- Run after 001_init_admin_schema.sql

begin;

create table if not exists public.admin_users (
  user_id uuid primary key references auth.users(id) on delete cascade,
  email text unique not null,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

alter table public.admin_users enable row level security;

drop policy if exists "admin_users_read_own" on public.admin_users;
create policy "admin_users_read_own"
on public.admin_users
for select
to authenticated
using (auth.uid() = user_id);

-- No public insert/update/delete policies.
-- Manage this table via SQL editor with service role privileges.

commit;

-- After creating your first auth user, whitelist it:
-- insert into public.admin_users (user_id, email, is_active)
-- values ('YOUR_AUTH_USER_UUID', 'owner@yourmail.com', true)
-- on conflict (user_id) do update set is_active = excluded.is_active, email = excluded.email;
