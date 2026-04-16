-- Energiapiloot MVP schema (multi-user + multi-site ready)
-- Requires Supabase auth + RLS

create extension if not exists pgcrypto;

-- -----------------------------
-- Organizations (future business multi-user support)
-- -----------------------------

create table if not exists public.organizations (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text unique,
  created_by uuid not null references auth.users(id) on delete restrict,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.organizations enable row level security;

create table if not exists public.organization_members (
  organization_id uuid not null references public.organizations(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role text not null default 'member', -- owner | admin | member (MVP: text)
  created_at timestamptz not null default now(),
  primary key (organization_id, user_id)
);

alter table public.organization_members enable row level security;

-- Helper: is current user a member of org
create or replace function public.is_org_member(org_id uuid)
returns boolean
language sql
stable
as $$
  select exists (
    select 1
    from public.organization_members m
    where m.organization_id = org_id
      and m.user_id = auth.uid()
  );
$$;

-- Profiles: keep existing table from 0001, add optional primary org
alter table public.profiles
  add column if not exists primary_organization_id uuid references public.organizations(id) on delete set null;

drop trigger if exists set_organizations_updated_at on public.organizations;
create trigger set_organizations_updated_at
before update on public.organizations
for each row execute function public.set_updated_at();

-- -----------------------------
-- Sites / Objects
-- -----------------------------

create table if not exists public.sites (
  id uuid primary key default gen_random_uuid(),
  owner_user_id uuid references auth.users(id) on delete cascade,
  owner_organization_id uuid references public.organizations(id) on delete cascade,
  name text not null,
  object_type text not null, -- apartment | house | office | shop | warehouse | other
  country text, -- EE | LV | LT (optional MVP)
  timezone text,
  created_by uuid not null references auth.users(id) on delete restrict,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint sites_owner_one_of check (
    (owner_user_id is not null and owner_organization_id is null)
    or
    (owner_user_id is null and owner_organization_id is not null)
  )
);

create index if not exists sites_owner_user_idx on public.sites(owner_user_id);
create index if not exists sites_owner_org_idx on public.sites(owner_organization_id);

alter table public.sites enable row level security;

drop trigger if exists set_sites_updated_at on public.sites;
create trigger set_sites_updated_at
before update on public.sites
for each row execute function public.set_updated_at();

-- -----------------------------
-- Contracts
-- -----------------------------

create table if not exists public.contracts (
  id uuid primary key default gen_random_uuid(),
  site_id uuid not null references public.sites(id) on delete cascade,
  provider_name text,
  contract_type text not null, -- spot | fixed | hybrid | unknown
  currency text not null default 'EUR',
  -- minimal fields; extend later with tariff structure
  notes text,
  starts_on date,
  ends_on date,
  created_by uuid not null references auth.users(id) on delete restrict,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists contracts_site_idx on public.contracts(site_id);

alter table public.contracts enable row level security;

drop trigger if exists set_contracts_updated_at on public.contracts;
create trigger set_contracts_updated_at
before update on public.contracts
for each row execute function public.set_updated_at();

-- -----------------------------
-- Energy assets
-- -----------------------------

create table if not exists public.energy_assets (
  id uuid primary key default gen_random_uuid(),
  site_id uuid not null references public.sites(id) on delete cascade,
  asset_type text not null, -- solar | battery | ev | heat_pump
  name text,
  metadata jsonb not null default '{}'::jsonb,
  created_by uuid not null references auth.users(id) on delete restrict,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists energy_assets_site_idx on public.energy_assets(site_id);

alter table public.energy_assets enable row level security;

drop trigger if exists set_energy_assets_updated_at on public.energy_assets;
create trigger set_energy_assets_updated_at
before update on public.energy_assets
for each row execute function public.set_updated_at();

-- -----------------------------
-- Simulations + saved scenarios
-- -----------------------------

create table if not exists public.saved_scenarios (
  id uuid primary key default gen_random_uuid(),
  site_id uuid not null references public.sites(id) on delete cascade,
  name text not null,
  description text,
  config jsonb not null default '{}'::jsonb,
  created_by uuid not null references auth.users(id) on delete restrict,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists saved_scenarios_site_idx on public.saved_scenarios(site_id);

alter table public.saved_scenarios enable row level security;

drop trigger if exists set_saved_scenarios_updated_at on public.saved_scenarios;
create trigger set_saved_scenarios_updated_at
before update on public.saved_scenarios
for each row execute function public.set_updated_at();

create table if not exists public.simulations (
  id uuid primary key default gen_random_uuid(),
  site_id uuid not null references public.sites(id) on delete cascade,
  scenario_id uuid references public.saved_scenarios(id) on delete set null,
  simulation_type text not null, -- solar | battery | ev | heat_pump | contract | other
  inputs jsonb not null default '{}'::jsonb,
  outputs jsonb not null default '{}'::jsonb,
  created_by uuid not null references auth.users(id) on delete restrict,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists simulations_site_idx on public.simulations(site_id);
create index if not exists simulations_scenario_idx on public.simulations(scenario_id);

alter table public.simulations enable row level security;

drop trigger if exists set_simulations_updated_at on public.simulations;
create trigger set_simulations_updated_at
before update on public.simulations
for each row execute function public.set_updated_at();

-- -----------------------------
-- Recommendations
-- -----------------------------

create table if not exists public.recommendations (
  id uuid primary key default gen_random_uuid(),
  site_id uuid not null references public.sites(id) on delete cascade,
  scenario_id uuid references public.saved_scenarios(id) on delete set null,
  simulation_id uuid references public.simulations(id) on delete set null,
  kind text not null, -- contract_change | load_shift | investment | monitor | other
  title text not null,
  rationale text,
  impact jsonb not null default '{}'::jsonb,
  status text not null default 'open', -- open | dismissed | accepted
  created_by uuid not null references auth.users(id) on delete restrict,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists recommendations_site_idx on public.recommendations(site_id);
create index if not exists recommendations_scenario_idx on public.recommendations(scenario_id);

alter table public.recommendations enable row level security;

drop trigger if exists set_recommendations_updated_at on public.recommendations;
create trigger set_recommendations_updated_at
before update on public.recommendations
for each row execute function public.set_updated_at();

-- -----------------------------
-- Reports
-- -----------------------------

create table if not exists public.reports (
  id uuid primary key default gen_random_uuid(),
  site_id uuid not null references public.sites(id) on delete cascade,
  scenario_id uuid references public.saved_scenarios(id) on delete set null,
  title text not null,
  report_type text not null default 'summary', -- summary | comparison | export
  payload jsonb not null default '{}'::jsonb,
  created_by uuid not null references auth.users(id) on delete restrict,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists reports_site_idx on public.reports(site_id);

alter table public.reports enable row level security;

drop trigger if exists set_reports_updated_at on public.reports;
create trigger set_reports_updated_at
before update on public.reports
for each row execute function public.set_updated_at();

-- -----------------------------
-- Subscription status (Stripe sync later)
-- -----------------------------

create table if not exists public.subscription_status (
  id uuid primary key default gen_random_uuid(),
  owner_user_id uuid references auth.users(id) on delete cascade,
  owner_organization_id uuid references public.organizations(id) on delete cascade,
  plan_id text not null default 'free', -- free | pro | (future)
  status text not null default 'active', -- active | trialing | past_due | canceled
  stripe_customer_id text,
  stripe_subscription_id text,
  current_period_end timestamptz,
  cancel_at_period_end boolean not null default false,
  created_by uuid not null references auth.users(id) on delete restrict,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint subscription_owner_one_of check (
    (owner_user_id is not null and owner_organization_id is null)
    or
    (owner_user_id is null and owner_organization_id is not null)
  )
);

create index if not exists subscription_owner_user_idx on public.subscription_status(owner_user_id);
create index if not exists subscription_owner_org_idx on public.subscription_status(owner_organization_id);

alter table public.subscription_status enable row level security;

drop trigger if exists set_subscription_status_updated_at on public.subscription_status;
create trigger set_subscription_status_updated_at
before update on public.subscription_status
for each row execute function public.set_updated_at();

-- -----------------------------
-- RLS policies
-- -----------------------------

-- organizations: members can read; creator can insert; owners/admins can update (MVP: any member update for now)
create policy "org_select_member"
on public.organizations
for select
using (public.is_org_member(id));

create policy "org_insert_creator"
on public.organizations
for insert
with check (auth.uid() = created_by);

create policy "org_update_member"
on public.organizations
for update
using (public.is_org_member(id))
with check (public.is_org_member(id));

-- organization_members: members can view; org members can add/remove (MVP: any member; tighten later)
create policy "org_members_select_member"
on public.organization_members
for select
using (public.is_org_member(organization_id));

create policy "org_members_insert_member"
on public.organization_members
for insert
with check (public.is_org_member(organization_id));

create policy "org_members_delete_member"
on public.organization_members
for delete
using (public.is_org_member(organization_id));

-- sites
create policy "sites_select_owner"
on public.sites
for select
using (
  owner_user_id = auth.uid()
  or public.is_org_member(owner_organization_id)
);

create policy "sites_insert_owner"
on public.sites
for insert
with check (
  created_by = auth.uid()
  and (
    owner_user_id = auth.uid()
    or public.is_org_member(owner_organization_id)
  )
);

create policy "sites_update_owner"
on public.sites
for update
using (
  owner_user_id = auth.uid()
  or public.is_org_member(owner_organization_id)
)
with check (
  owner_user_id = auth.uid()
  or public.is_org_member(owner_organization_id)
);

-- contracts / assets / scenarios / simulations / recommendations / reports share the same ownership via site
create or replace function public.can_access_site(site uuid)
returns boolean
language sql
stable
as $$
  select exists (
    select 1
    from public.sites s
    where s.id = site
      and (
        s.owner_user_id = auth.uid()
        or public.is_org_member(s.owner_organization_id)
      )
  );
$$;

create policy "contracts_select_site"
on public.contracts
for select
using (public.can_access_site(site_id));

create policy "contracts_insert_site"
on public.contracts
for insert
with check (created_by = auth.uid() and public.can_access_site(site_id));

create policy "contracts_update_site"
on public.contracts
for update
using (public.can_access_site(site_id))
with check (public.can_access_site(site_id));

create policy "energy_assets_select_site"
on public.energy_assets
for select
using (public.can_access_site(site_id));

create policy "energy_assets_insert_site"
on public.energy_assets
for insert
with check (created_by = auth.uid() and public.can_access_site(site_id));

create policy "energy_assets_update_site"
on public.energy_assets
for update
using (public.can_access_site(site_id))
with check (public.can_access_site(site_id));

create policy "saved_scenarios_select_site"
on public.saved_scenarios
for select
using (public.can_access_site(site_id));

create policy "saved_scenarios_insert_site"
on public.saved_scenarios
for insert
with check (created_by = auth.uid() and public.can_access_site(site_id));

create policy "saved_scenarios_update_site"
on public.saved_scenarios
for update
using (public.can_access_site(site_id))
with check (public.can_access_site(site_id));

create policy "simulations_select_site"
on public.simulations
for select
using (public.can_access_site(site_id));

create policy "simulations_insert_site"
on public.simulations
for insert
with check (created_by = auth.uid() and public.can_access_site(site_id));

create policy "simulations_update_site"
on public.simulations
for update
using (public.can_access_site(site_id))
with check (public.can_access_site(site_id));

create policy "recommendations_select_site"
on public.recommendations
for select
using (public.can_access_site(site_id));

create policy "recommendations_insert_site"
on public.recommendations
for insert
with check (created_by = auth.uid() and public.can_access_site(site_id));

create policy "recommendations_update_site"
on public.recommendations
for update
using (public.can_access_site(site_id))
with check (public.can_access_site(site_id));

create policy "reports_select_site"
on public.reports
for select
using (public.can_access_site(site_id));

create policy "reports_insert_site"
on public.reports
for insert
with check (created_by = auth.uid() and public.can_access_site(site_id));

create policy "reports_update_site"
on public.reports
for update
using (public.can_access_site(site_id))
with check (public.can_access_site(site_id));

-- subscription_status
create policy "sub_select_owner"
on public.subscription_status
for select
using (
  owner_user_id = auth.uid()
  or public.is_org_member(owner_organization_id)
);

create policy "sub_insert_owner"
on public.subscription_status
for insert
with check (
  created_by = auth.uid()
  and (
    owner_user_id = auth.uid()
    or public.is_org_member(owner_organization_id)
  )
);

create policy "sub_update_owner"
on public.subscription_status
for update
using (
  owner_user_id = auth.uid()
  or public.is_org_member(owner_organization_id)
)
with check (
  owner_user_id = auth.uid()
  or public.is_org_member(owner_organization_id)
);

