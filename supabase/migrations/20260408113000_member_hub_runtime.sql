create table if not exists public.member_hub_events (
  id uuid primary key default gen_random_uuid(),
  member_slug text not null references public.users(slug) on delete cascade,
  target_slug text null references public.users(slug) on delete set null,
  event_type text not null check (event_type in ('event_join', 'referral_link_copied', 'referral_link_shared')),
  label text null,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists idx_member_hub_events_member_created
  on public.member_hub_events (member_slug, created_at desc);
create index if not exists idx_member_hub_events_type
  on public.member_hub_events (event_type);

create table if not exists public.member_reward_definitions (
  id text primary key,
  title text not null,
  description text not null,
  requirement_type text not null check (requirement_type in ('cheers_sent', 'referrals_completed', 'events_joined')),
  required_count integer not null check (required_count > 0),
  accent_color text not null default '#FFD600',
  sort_order integer not null default 0,
  is_active boolean not null default true
);

create table if not exists public.member_reward_unlocks (
  id uuid primary key default gen_random_uuid(),
  member_slug text not null references public.users(slug) on delete cascade,
  reward_id text not null references public.member_reward_definitions(id) on delete cascade,
  unlocked_at timestamptz not null default now(),
  unique (member_slug, reward_id)
);

create index if not exists idx_member_reward_unlocks_member
  on public.member_reward_unlocks (member_slug, unlocked_at desc);

insert into public.member_reward_definitions (id, title, description, requirement_type, required_count, accent_color, sort_order, is_active)
values
  ('support_starter', 'Support Starter', '3回のCheerでコミュニティ参加の最初の特典を解放', 'cheers_sent', 3, '#FFD600', 10, true),
  ('connector_pass', 'Connector Pass', '1人の紹介成功でコネクター特典を解放', 'referrals_completed', 1, '#32D278', 20, true),
  ('community_guest', 'Community Guest', 'イベント参加1回で参加者特典を解放', 'events_joined', 1, '#3C8CFF', 30, true),
  ('ambassador_lane', 'Ambassador Lane', '紹介成功3人でアンバサダー特典を解放', 'referrals_completed', 3, '#FF7A45', 40, true)
on conflict (id) do update
set
  title = excluded.title,
  description = excluded.description,
  requirement_type = excluded.requirement_type,
  required_count = excluded.required_count,
  accent_color = excluded.accent_color,
  sort_order = excluded.sort_order,
  is_active = excluded.is_active;

alter table public.member_hub_events enable row level security;
alter table public.member_reward_definitions enable row level security;
alter table public.member_reward_unlocks enable row level security;

revoke all on table public.member_hub_events from anon, authenticated;
revoke all on table public.member_reward_definitions from anon, authenticated;
revoke all on table public.member_reward_unlocks from anon, authenticated;

alter publication supabase_realtime add table public.member_hub_events;
alter publication supabase_realtime add table public.member_reward_unlocks;
