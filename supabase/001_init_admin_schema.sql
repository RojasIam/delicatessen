-- DELICATESSEN - Supabase schema for admin/content dynamism
-- Run in Supabase SQL Editor

begin;

create table if not exists public.site_config (
  id text primary key,
  data jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now(),
  constraint site_config_singleton check (id = 'main')
);

create table if not exists public.promotions (
  id text primary key,
  active boolean not null default true,
  kind text not null check (kind in ('evento', 'promozione', 'aperitivo')),
  title text not null default '',
  description text not null default '',
  image text not null default '',
  cta_text text not null default '',
  cta_link text not null default '#',
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists trg_site_config_updated_at on public.site_config;
create trigger trg_site_config_updated_at
before update on public.site_config
for each row
execute function public.set_updated_at();

drop trigger if exists trg_promotions_updated_at on public.promotions;
create trigger trg_promotions_updated_at
before update on public.promotions
for each row
execute function public.set_updated_at();

insert into public.site_config (id, data)
values ('main', '{}'::jsonb)
on conflict (id) do nothing;

alter table public.site_config enable row level security;
alter table public.promotions enable row level security;

drop policy if exists "public_read_site_config" on public.site_config;
create policy "public_read_site_config"
on public.site_config
for select
using (true);

drop policy if exists "public_read_active_promotions" on public.promotions;
create policy "public_read_active_promotions"
on public.promotions
for select
using (active = true);

-- Optional (useful if later you manage rows from authenticated dashboard users without service role)
drop policy if exists "authenticated_manage_site_config" on public.site_config;
create policy "authenticated_manage_site_config"
on public.site_config
for all
to authenticated
using (true)
with check (true);

drop policy if exists "authenticated_manage_promotions" on public.promotions;
create policy "authenticated_manage_promotions"
on public.promotions
for all
to authenticated
using (true)
with check (true);

commit;
