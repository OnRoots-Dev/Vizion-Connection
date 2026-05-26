do $$
declare
  constraint_name text;
begin
  for constraint_name in
    select con.conname
    from pg_constraint con
    join pg_class rel on rel.oid = con.conrelid
    join pg_namespace nsp on nsp.oid = rel.relnamespace
    where nsp.nspname = 'public'
      and rel.relname = 'users'
      and con.contype = 'c'
      and pg_get_constraintdef(con.oid) ilike '%slug%'
  loop
    execute format('alter table public.users drop constraint %I', constraint_name);
  end loop;
end
$$;

alter table public.users
  add constraint users_slug_check
  check (slug ~ '^[a-z0-9_.]{3,30}$');
