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
    and a.attnum > 0
    and not a.attisdropped;

  if users_id_type is null then
    raise exception 'public.users.id が見つかりません';
  end if;

  execute format(
    'create table if not exists public.daily_logs (
      id uuid primary key default gen_random_uuid(),
      user_id %s not null references public.users(id) on delete cascade,
      log_date date not null default current_date,
      content text not null check (char_length(content) <= 200),
      condition_score integer null check (condition_score between 1 and 5),
      created_at timestamptz not null default now(),
      unique (user_id, log_date)
    )',
    users_id_type
  );
end $$;

create extension if not exists pgcrypto;

create index if not exists idx_daily_logs_user_date
  on public.daily_logs (user_id, log_date desc);
