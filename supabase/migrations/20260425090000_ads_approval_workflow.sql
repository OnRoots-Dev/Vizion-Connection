alter table public.ads
  add column if not exists status text not null default 'approved',
  add column if not exists reviewed_at timestamptz,
  add column if not exists reviewed_by text;

alter table public.ads
  drop constraint if exists ads_status_check;

alter table public.ads
  add constraint ads_status_check
  check (status in ('pending','approved','rejected'));

update public.ads
set status = 'approved'
where status is null;
