-- API / onboarding integration fields (address, business id, data connection preference)

alter table public.profiles
  add column if not exists site_address jsonb;

alter table public.profiles
  add column if not exists business_registry_code text;

alter table public.profiles
  add column if not exists data_connection text default 'none';
-- none | estfeed_pending | estfeed_connected (MVP text; refine when Estfeed OAuth exists)

comment on column public.profiles.site_address is 'Normalized address snapshot from geocoding adapter (JSON).';
comment on column public.profiles.business_registry_code is 'EE business registry code when user_type=business.';
comment on column public.profiles.data_connection is 'User preference/state for metering data hub connection.';
