do $$
declare
  users_id_type text;
begin
  select format_type(a.atttypid, a.atttypmod)
    into users_id_type
  from pg_attribute a
  join pg_class c on c.oid = a.attrelid
  join pg_namespace n on n.oid = c.relnamespace
  where n.nspname = 'public'
    and c.relname = 'users'
    and a.attname = 'id'
    and a.atttypid <> 0
    and not a.attisdropped;

  if users_id_type is null then
    raise exception 'public.users.id が見つかりません';
  end if;

  execute '
    create table if not exists public.mission_definitions (
      id uuid primary key default gen_random_uuid(),
      title text not null,
      description text null,
      mission_type text not null check (mission_type in (''daily'', ''weekly'', ''monthly'')),
      required_action text not null,
      required_count integer not null default 1 check (required_count > 0),
      point_reward integer not null check (point_reward >= 0),
      is_active boolean not null default true
    )';

  execute format(
    'create table if not exists public.user_mission_progress (
      id uuid primary key default gen_random_uuid(),
      user_id %s not null references public.users(id) on delete cascade,
      mission_id uuid not null references public.mission_definitions(id) on delete cascade,
      period_key text not null,
      current_count integer not null default 0 check (current_count >= 0),
      completed_at timestamptz null,
      unique (user_id, mission_id, period_key)
    )',
    users_id_type
  );
end $$;

create index if not exists idx_mission_definitions_type_active
  on public.mission_definitions (mission_type, is_active);

create index if not exists idx_user_mission_progress_user_period
  on public.user_mission_progress (user_id, period_key);

insert into public.mission_definitions (
  title,
  description,
  mission_type,
  required_action,
  required_count,
  point_reward,
  is_active
)
select *
from (
  values
    ('デイリーログを記録する', '今日の一言や取り組みを記録しよう', 'daily', 'daily_log', 1, 10, true),
    ('他のユーザーにCheerを送る', '仲間に応援を届けてつながりを広げよう', 'daily', 'cheer', 1, 5, true),
    ('Discoveryを訪問する', '今日の出会いを探しにDiscoveryをのぞこう', 'daily', 'discovery_visit', 1, 3, true)
) as seed(title, description, mission_type, required_action, required_count, point_reward, is_active)
where not exists (
  select 1
  from public.mission_definitions existing
  where existing.title = seed.title
    and existing.mission_type = seed.mission_type
    and existing.required_action = seed.required_action
);
