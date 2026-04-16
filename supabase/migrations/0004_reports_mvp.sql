-- Reports MVP: status + generated date + consistent types

alter table public.reports
  add column if not exists status text not null default 'ready';

alter table public.reports
  add column if not exists generated_at timestamptz;

alter table public.reports
  add column if not exists report_version int not null default 1;

create index if not exists reports_type_idx on public.reports(report_type);
create index if not exists reports_status_idx on public.reports(status);
create index if not exists reports_generated_at_idx on public.reports(generated_at);

