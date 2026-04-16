-- Saved scenarios: add simulation_type + favorite flag

alter table public.saved_scenarios
  add column if not exists simulation_type text;

alter table public.saved_scenarios
  add column if not exists is_favorite boolean not null default false;

create index if not exists saved_scenarios_type_idx on public.saved_scenarios(simulation_type);
create index if not exists saved_scenarios_favorite_idx on public.saved_scenarios(is_favorite);

