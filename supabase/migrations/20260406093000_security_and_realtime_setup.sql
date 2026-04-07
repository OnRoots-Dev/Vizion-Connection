alter table public.user_follows enable row level security;
alter table public.user_onetime_mission_rewards enable row level security;
alter table public.discovery_events enable row level security;

revoke all on table public.user_follows from anon, authenticated;
revoke all on table public.user_onetime_mission_rewards from anon, authenticated;
revoke all on table public.discovery_events from anon, authenticated;

alter table public.users enable row level security;

drop policy if exists "public users readable" on public.users;
create policy "public users readable"
on public.users
for select
to anon, authenticated
using (is_public = true and is_deleted = false);

alter table public.ads enable row level security;

drop policy if exists "public active ads readable" on public.ads;
create policy "public active ads readable"
on public.ads
for select
to anon, authenticated
using (is_active = true);

alter publication supabase_realtime add table public.users;
alter publication supabase_realtime add table public.ads;
