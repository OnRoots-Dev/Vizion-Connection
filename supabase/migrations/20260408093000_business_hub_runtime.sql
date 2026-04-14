create table if not exists public.ad_events (
  id uuid primary key default gen_random_uuid(),
  ad_id text not null,
  business_id bigint null references public.users(id) on delete set null,
  event_type text not null check (event_type in ('impression', 'click', 'conversion', 'sale')),
  revenue_amount numeric(12,2) not null default 0 check (revenue_amount >= 0),
  viewer_slug text null references public.users(slug) on delete set null,
  metadata jsonb not null default '{}'::jsonb,
  occurred_at timestamptz not null default now()
);

create index if not exists idx_ad_events_business_occurred_at
  on public.ad_events (business_id, occurred_at desc);
create index if not exists idx_ad_events_ad_id
  on public.ad_events (ad_id);
create index if not exists idx_ad_events_event_type
  on public.ad_events (event_type);

create table if not exists public.business_offers (
  id uuid primary key default gen_random_uuid(),
  business_slug text not null references public.users(slug) on delete cascade,
  target_slug text not null references public.users(slug) on delete cascade,
  title text not null,
  message text not null,
  reward_amount integer not null default 0 check (reward_amount >= 0),
  status text not null default 'sent' check (status in ('sent', 'approved', 'rejected')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_business_offers_business_slug
  on public.business_offers (business_slug, created_at desc);
create index if not exists idx_business_offers_target_slug
  on public.business_offers (target_slug, created_at desc);
create index if not exists idx_business_offers_status
  on public.business_offers (status);

create or replace function public.touch_business_offers_updated_at()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists trg_business_offers_updated_at on public.business_offers;
create trigger trg_business_offers_updated_at
before update on public.business_offers
for each row execute function public.touch_business_offers_updated_at();

alter table public.ad_events enable row level security;
alter table public.business_offers enable row level security;

revoke all on table public.ad_events from anon, authenticated;
revoke all on table public.business_offers from anon, authenticated;
