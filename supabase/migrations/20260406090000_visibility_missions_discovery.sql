create table if not exists public.user_follows (
  id uuid primary key default gen_random_uuid(),
  follower_slug text not null references public.users(slug) on delete cascade,
  target_slug text not null references public.users(slug) on delete cascade,
  created_at timestamptz not null default now(),
  unique (follower_slug, target_slug)
);

create index if not exists idx_user_follows_follower on public.user_follows (follower_slug);
create index if not exists idx_user_follows_target on public.user_follows (target_slug);

create table if not exists public.user_onetime_mission_rewards (
  id uuid primary key default gen_random_uuid(),
  user_slug text not null references public.users(slug) on delete cascade,
  mission_key text not null,
  points_awarded integer not null default 0 check (points_awarded >= 0),
  awarded_at timestamptz not null default now(),
  unique (user_slug, mission_key)
);

create index if not exists idx_user_onetime_mission_rewards_user
  on public.user_onetime_mission_rewards (user_slug);

create table if not exists public.discovery_events (
  id uuid primary key default gen_random_uuid(),
  viewer_slug text null references public.users(slug) on delete set null,
  target_slug text null references public.users(slug) on delete set null,
  event_type text not null check (event_type in ('impression', 'detail_open', 'search')),
  query_text text null,
  source text not null default 'dashboard',
  created_at timestamptz not null default now()
);

create index if not exists idx_discovery_events_created_at
  on public.discovery_events (created_at desc);

create index if not exists idx_discovery_events_type
  on public.discovery_events (event_type);

create index if not exists idx_discovery_events_target
  on public.discovery_events (target_slug);
