do $$
declare
  users_id_type text;
  cast_expression text;
  fk_name text;
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

  if users_id_type in ('integer', 'bigint', 'smallint') then
    cast_expression := 'case when user_id::text ~ ''^[0-9]+$'' then user_id::text::' || users_id_type || ' else null end';
  else
    cast_expression := 'user_id::text::' || users_id_type;
  end if;

  select conname into fk_name
  from pg_constraint
  where conrelid = 'public.daily_logs'::regclass
    and contype = 'f'
  limit 1;

  if fk_name is not null then
    execute format('alter table public.daily_logs drop constraint %I', fk_name);
  end if;

  execute 'drop policy if exists "daily_logs_select_own" on public.daily_logs';
  execute 'drop policy if exists "daily_logs_insert_own" on public.daily_logs';
  execute 'drop policy if exists "daily_logs_update_own" on public.daily_logs';

  execute format(
    'alter table public.daily_logs alter column user_id type %s using %s',
    users_id_type,
    cast_expression
  );

  execute format(
    'alter table public.daily_logs add constraint daily_logs_user_id_fkey foreign key (user_id) references public.users(id) on delete cascade'
  );
end $$;
