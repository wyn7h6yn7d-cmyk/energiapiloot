-- Settings/account support fields

alter table public.profiles
  add column if not exists display_name text;

alter table public.profiles
  add column if not exists company_name text;

alter table public.profiles
  add column if not exists notification_prefs jsonb not null default '{}'::jsonb;

alter table public.profiles
  add column if not exists primary_site_id uuid references public.sites(id) on delete set null;

create index if not exists profiles_primary_site_idx on public.profiles(primary_site_id);

