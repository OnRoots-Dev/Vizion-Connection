alter table public.users
add column if not exists sports text[] not null default '{}';

update public.users
set sports = array[sport]
where (sports is null or cardinality(sports) = 0)
  and sport is not null
  and length(trim(sport)) > 0;
