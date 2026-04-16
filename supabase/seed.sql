-- Energiapiloot development seed data (idempotent-ish)
-- Usage (Supabase local):
--   supabase start
--   supabase db reset
-- or run manually in SQL editor after creating test users:
--   - household: demo.household@energiapiloot.dev
--   - business:  demo.business@energiapiloot.dev
--
-- Notes:
-- - This script expects the auth users to already exist.
-- - It will look up auth.users by email and seed data under those users.
-- - If users are missing, it will skip those blocks with a NOTICE.

do $$
declare
  household_email text := 'demo.household@energiapiloot.dev';
  business_email  text := 'demo.business@energiapiloot.dev';
  household_user  uuid;
  business_user   uuid;
  org_id          uuid;
  site_home_id    uuid;
  site_shop_id    uuid;
  scenario_solar_id uuid;
  scenario_ev_id uuid;
  scenario_batt_id uuid;
  sim1_id uuid;
  sim2_id uuid;
  rec1_id uuid;
  rec2_id uuid;
  rpt1_id uuid;
begin
  select id into household_user from auth.users where email = household_email limit 1;
  select id into business_user from auth.users where email = business_email limit 1;

  if household_user is null then
    raise notice 'Seed skipped for household: create auth user % first.', household_email;
  else
    -- PROFILE (household)
    insert into public.profiles (user_id, onboarded, user_type, display_name, object_name, object_type, contract_type, assets, goal, notification_prefs)
    values (
      household_user,
      true,
      'household',
      'Kati Kask',
      'Kati kodu',
      'house',
      'spot',
      '["solar","ev"]'::jsonb,
      'reduce_bill',
      '{"weekly_summary": true, "price_alerts": false}'::jsonb
    )
    on conflict (user_id) do update set
      onboarded = excluded.onboarded,
      user_type = excluded.user_type,
      display_name = excluded.display_name,
      object_name = excluded.object_name,
      object_type = excluded.object_type,
      contract_type = excluded.contract_type,
      assets = excluded.assets,
      goal = excluded.goal,
      notification_prefs = excluded.notification_prefs;

    -- SITE (home)
    insert into public.sites (owner_user_id, owner_organization_id, name, object_type, country, timezone, created_by)
    values (household_user, null, 'Kati kodu', 'house', 'EE', 'Europe/Tallinn', household_user)
    on conflict do nothing;

    select id into site_home_id
    from public.sites
    where owner_user_id = household_user
    order by created_at asc
    limit 1;

    update public.profiles
      set primary_site_id = site_home_id
      where user_id = household_user and (primary_site_id is null or primary_site_id <> site_home_id);

    -- CONTRACT (household)
    insert into public.contracts (site_id, provider_name, contract_type, currency, notes, starts_on, ends_on, created_by)
    values (
      site_home_id,
      'Eesti Energia',
      'spot',
      'EUR',
      'Börs + marginaal (hinnanguline).',
      current_date - interval '120 days',
      null,
      household_user
    )
    on conflict do nothing;

    -- ASSETS (household)
    insert into public.energy_assets (site_id, asset_type, name, metadata, created_by)
    values
      (site_home_id, 'solar', 'Katus PV', '{"kwp": 6.0, "year": 2023}'::jsonb, household_user),
      (site_home_id, 'ev', 'EV laadimine', '{"charger_kw": 7.4, "monthly_kwh": 180}'::jsonb, household_user)
    on conflict do nothing;

    -- SAVED SCENARIOS (household)
    insert into public.saved_scenarios (site_id, simulation_type, is_favorite, name, description, config, created_by)
    values
      (site_home_id, 'solar', true,  'Päike 6 kW • konservatiivne', 'Oma-tarbimine 38%, yield 980 kWh/kW/a.', '{"upfrontEur":6900,"systemKw":6,"selfConsumptionShare":0.38,"annualYieldKwhPerKw":980,"electricityPriceEurPerKwh":0.19}'::jsonb, household_user),
      (site_home_id, 'ev_charger', false, 'EV laadija • nutikas ajastus', 'Ajastatav osa 75%.', '{"upfrontEur":950,"monthlyKwhCharged":180,"smartChargingShare":0.75,"valuePerKwhShiftedEur":0.05}'::jsonb, household_user)
    on conflict do nothing;

    select id into scenario_solar_id
      from public.saved_scenarios
      where site_id = site_home_id and simulation_type = 'solar'
      order by created_at asc
      limit 1;

    select id into scenario_ev_id
      from public.saved_scenarios
      where site_id = site_home_id and simulation_type = 'ev_charger'
      order by created_at asc
      limit 1;

    -- SIMULATIONS (household) - store outputs snapshot as json
    insert into public.simulations (site_id, scenario_id, simulation_type, inputs, outputs, created_by)
    values
      (site_home_id, scenario_solar_id, 'solar', '{"note":"snapshot from scenario"}'::jsonb, '{"monthlySavingsEur":17.3,"annualSavingsEur":207.6,"paybackYears":8.4}'::jsonb, household_user),
      (site_home_id, scenario_ev_id, 'ev_charger', '{"note":"snapshot from scenario"}'::jsonb, '{"monthlySavingsEur":5.6,"annualSavingsEur":67.2,"paybackYears":14.1}'::jsonb, household_user)
    on conflict do nothing;

    -- RECOMMENDATIONS (household)
    insert into public.recommendations (site_id, scenario_id, simulation_id, kind, title, rationale, impact, status, created_by)
    values
      (site_home_id, null, null, 'load_shift', 'Nihuta boiler/EV odavamatesse tundidesse', 'Tipu-sõltuvus on kõrgemapoolne. Ajastamine vähendab kuukulu ilma investeeringuta.', '{"estMonthlyEur":7.8,"confidence":"kõrge"}'::jsonb, 'open', household_user),
      (site_home_id, scenario_solar_id, null, 'investment', 'Prioritiseeri päike enne akut', 'Päikese tasuvus on parem kui aku (praeguste eelduste järgi).', '{"estMonthlyEur":17.3,"confidence":"keskmine"}'::jsonb, 'open', household_user)
    on conflict do nothing;

    -- REPORTS (household)
    insert into public.reports (site_id, scenario_id, title, report_type, status, generated_at, payload, created_by)
    values
      (
        site_home_id,
        scenario_solar_id,
        'Investeeringu simulatsiooni raport',
        'investment_simulation_report',
        'ready',
        now(),
        jsonb_build_object(
          'report_type','investment_simulation_report',
          'title','Investeeringu simulatsiooni raport',
          'generated_at', to_char(now() at time zone 'utc', 'YYYY-MM-DD\"T\"HH24:MI:SS\"Z\"'),
          'site', jsonb_build_object('name','Kati kodu','object_type','house'),
          'audience','household',
          'meta', jsonb_build_object('version',1,'inputs_summary', jsonb_build_array('Objekt: Kati kodu','Publik: Kodu')),
          'sections', jsonb_build_array(
            jsonb_build_object(
              'kind','simulation_snapshot',
              'title','Stsenaariumi kokkuvõte',
              'simulation', jsonb_build_object('type','solar','name','Päike 6 kW • konservatiivne','monthlySavingsEur',17.3,'annualSavingsEur',207.6,'paybackYears',8.4),
              'assumptions', jsonb_build_array(
                jsonb_build_object('label','Tootlikkus','value','980 kWh/kW/a'),
                jsonb_build_object('label','Oma-tarbimine','value','38%'),
                jsonb_build_object('label','Hind (all-in)','value','0.190 €/kWh')
              )
            )
          )
        ),
        household_user
      )
    on conflict do nothing;
  end if;

  if business_user is null then
    raise notice 'Seed skipped for business: create auth user % first.', business_email;
  else
    -- PROFILE (business)
    insert into public.profiles (user_id, onboarded, user_type, display_name, company_name, object_name, object_type, contract_type, assets, goal, notification_prefs)
    values (
      business_user,
      true,
      'business',
      'Marko Mets',
      'Nordic Bakery OÜ',
      'Põhipood',
      'shop',
      'fixed',
      '["commercial_refrigeration","machinery"]'::jsonb,
      'monitor_usage',
      '{"weekly_summary": true, "price_alerts": true}'::jsonb
    )
    on conflict (user_id) do update set
      onboarded = excluded.onboarded,
      user_type = excluded.user_type,
      display_name = excluded.display_name,
      company_name = excluded.company_name,
      object_name = excluded.object_name,
      object_type = excluded.object_type,
      contract_type = excluded.contract_type,
      assets = excluded.assets,
      goal = excluded.goal,
      notification_prefs = excluded.notification_prefs;

    -- ORG + MEMBERSHIP
    insert into public.organizations (name, slug, created_by)
    values ('Nordic Bakery OÜ', 'nordic-bakery', business_user)
    on conflict (slug) do nothing;

    select id into org_id from public.organizations where slug = 'nordic-bakery' limit 1;

    insert into public.organization_members (organization_id, user_id, role)
    values (org_id, business_user, 'owner')
    on conflict do nothing;

    update public.profiles set primary_organization_id = org_id
      where user_id = business_user and (primary_organization_id is null or primary_organization_id <> org_id);

    -- SITE (shop) owned by org
    insert into public.sites (owner_user_id, owner_organization_id, name, object_type, country, timezone, created_by)
    values (null, org_id, 'Põhipood (Tallinn)', 'shop', 'EE', 'Europe/Tallinn', business_user)
    on conflict do nothing;

    select id into site_shop_id
    from public.sites
    where owner_organization_id = org_id
    order by created_at asc
    limit 1;

    update public.profiles
      set primary_site_id = site_shop_id
      where user_id = business_user and (primary_site_id is null or primary_site_id <> site_shop_id);

    -- CONTRACT (business)
    insert into public.contracts (site_id, provider_name, contract_type, currency, notes, starts_on, ends_on, created_by)
    values (
      site_shop_id,
      'Alexela',
      'fixed',
      'EUR',
      'Fikseeritud hind, eesmärk: prognoositavus.',
      current_date - interval '220 days',
      current_date + interval '145 days',
      business_user
    )
    on conflict do nothing;

    -- ASSETS (business)
    insert into public.energy_assets (site_id, asset_type, name, metadata, created_by)
    values
      (site_shop_id, 'battery', 'Aku (piloot)', '{"capacity_kwh": 10, "goal":"peak shaving"}'::jsonb, business_user)
    on conflict do nothing;

    -- SAVED SCENARIOS (business)
    insert into public.saved_scenarios (site_id, simulation_type, is_favorite, name, description, config, created_by)
    values
      (site_shop_id, 'peak_shaving', true, 'Peak shaving • 3kW', 'Võrgutasu sääst tipust.', '{"upfrontEur":2200,"peakKwReduced":3,"networkChargeEurPerKwMonth":6.5,"monthsPerYear":12}'::jsonb, business_user),
      (site_shop_id, 'battery', false, 'Aku 10kWh • ajastus', 'Hinnavahe 0.06 €/kWh.', '{"upfrontEur":7200,"capacityKwh":10,"cyclesPerDay":0.6,"efficiency":0.9,"valuePerKwhShiftedEur":0.06}'::jsonb, business_user)
    on conflict do nothing;

    select id into scenario_batt_id
      from public.saved_scenarios
      where site_id = site_shop_id and simulation_type = 'battery'
      order by created_at asc
      limit 1;

    -- RECOMMENDATIONS (business)
    insert into public.recommendations (site_id, scenario_id, simulation_id, kind, title, rationale, impact, status, created_by)
    values
      (site_shop_id, null, null, 'monitor', 'Kontrolli baas-koormust (külmutus)', 'Äris on 24/7 tarbimine tihti suurim kulu draiver. Mõõda öö tarbimist.', '{"estMonthlyEur":22.0,"confidence":"keskmine"}'::jsonb, 'open', business_user),
      (site_shop_id, scenario_batt_id, null, 'investment', 'Lükka aku edasi, kui hinnavahe on väike', 'Aku tasuvus sõltub hinnavahedest. Kui vahe püsib madal, ei pruugi tasuda.', '{"estMonthlyEur":0,"confidence":"madal"}'::jsonb, 'open', business_user)
    on conflict do nothing;

    -- REPORTS (business)
    insert into public.reports (site_id, scenario_id, title, report_type, status, generated_at, payload, created_by)
    values
      (
        site_shop_id,
        null,
        'Säästu võimaluste kokkuvõte',
        'savings_opportunity_summary',
        'ready',
        now(),
        jsonb_build_object(
          'report_type','savings_opportunity_summary',
          'title','Säästu võimaluste kokkuvõte',
          'generated_at', to_char(now() at time zone 'utc', 'YYYY-MM-DD\"T\"HH24:MI:SS\"Z\"'),
          'site', jsonb_build_object('name','Põhipood (Tallinn)','object_type','shop'),
          'audience','business',
          'meta', jsonb_build_object('version',1,'inputs_summary', jsonb_build_array('Objekt: Põhipood (Tallinn)','Publik: Äri')),
          'sections', jsonb_build_array(
            jsonb_build_object(
              'kind','bullets',
              'title','Top tegevused',
              'items', jsonb_build_array('Mõõda öö tarbimist 7 päeva','Seadista seadmete ajastus, kui võimalik','Võrdle võrgutasu mõju tipule')
            )
          )
        ),
        business_user
      )
    on conflict do nothing;
  end if;
end $$;

