create table if not exists public.trainer_clients (
  id uuid primary key default gen_random_uuid(),
  trainer_slug text not null references public.users(slug) on delete cascade,
  client_slug text null references public.users(slug) on delete set null,
  client_name text not null,
  status text not null default 'active' check (status in ('active', 'completed')),
  notes text null,
  started_at timestamptz not null default now(),
  last_activity_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_trainer_clients_trainer
  on public.trainer_clients (trainer_slug, last_activity_at desc);

create table if not exists public.trainer_sessions (
  id uuid primary key default gen_random_uuid(),
  trainer_slug text not null references public.users(slug) on delete cascade,
  trainer_client_id uuid not null references public.trainer_clients(id) on delete cascade,
  session_date timestamptz not null default now(),
  duration_minutes integer not null default 60 check (duration_minutes > 0),
  summary text not null,
  session_status text not null default 'completed' check (session_status in ('scheduled', 'completed', 'cancelled')),
  booking_source text not null default 'manual' check (booking_source in ('manual', 'future_booking')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_trainer_sessions_trainer
  on public.trainer_sessions (trainer_slug, session_date desc);
create index if not exists idx_trainer_sessions_client
  on public.trainer_sessions (trainer_client_id, session_date desc);

create table if not exists public.trainer_reviews (
  id uuid primary key default gen_random_uuid(),
  trainer_slug text not null references public.users(slug) on delete cascade,
  trainer_client_id uuid not null references public.trainer_clients(id) on delete cascade,
  rating numeric(2,1) not null check (rating >= 1 and rating <= 5),
  review_text text null,
  created_at timestamptz not null default now()
);

create index if not exists idx_trainer_reviews_trainer
  on public.trainer_reviews (trainer_slug, created_at desc);

create or replace function public.touch_trainer_hub_updated_at()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists trg_trainer_clients_updated_at on public.trainer_clients;
create trigger trg_trainer_clients_updated_at
before update on public.trainer_clients
for each row execute function public.touch_trainer_hub_updated_at();

drop trigger if exists trg_trainer_sessions_updated_at on public.trainer_sessions;
create trigger trg_trainer_sessions_updated_at
before update on public.trainer_sessions
for each row execute function public.touch_trainer_hub_updated_at();

create or replace function public.touch_trainer_client_last_activity()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  update public.trainer_clients
    set last_activity_at = greatest(coalesce(new.session_date, now()), now())
  where id = new.trainer_client_id;
  return new;
end;
$$;

drop trigger if exists trg_trainer_sessions_client_activity on public.trainer_sessions;
create trigger trg_trainer_sessions_client_activity
after insert or update on public.trainer_sessions
for each row execute function public.touch_trainer_client_last_activity();

alter table public.trainer_clients enable row level security;
alter table public.trainer_sessions enable row level security;
alter table public.trainer_reviews enable row level security;

revoke all on table public.trainer_clients from anon, authenticated;
revoke all on table public.trainer_sessions from anon, authenticated;
revoke all on table public.trainer_reviews from anon, authenticated;

alter publication supabase_realtime add table public.trainer_clients;
alter publication supabase_realtime add table public.trainer_sessions;
alter publication supabase_realtime add table public.trainer_reviews;
