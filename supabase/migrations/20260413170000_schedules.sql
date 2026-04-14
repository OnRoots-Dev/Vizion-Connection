create table if not exists public.schedules (
  id uuid primary key default gen_random_uuid(),
  user_slug text not null references public.users(slug) on delete cascade,
  title text not null,
  start_at timestamptz not null,
  end_at timestamptz null,
  location text null,
  description text null,
  category text not null check (category in ('match','practice','event','other')),
  is_public boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_schedules_user_start
  on public.schedules (user_slug, start_at asc);

create or replace function public.touch_schedules_updated_at()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists trg_schedules_updated_at on public.schedules;
create trigger trg_schedules_updated_at
before update on public.schedules
for each row execute function public.touch_schedules_updated_at();

alter table public.schedules enable row level security;

create policy "schedules_select_public_or_own"
  on public.schedules
  for select
  using (
    is_public = true
    or exists (
      select 1
      from public.users u
      where u.email = auth.email() and u.slug = schedules.user_slug
    )
  );

create policy "schedules_insert_own"
  on public.schedules
  for insert
  with check (
    exists (
      select 1
      from public.users u
      where u.email = auth.email() and u.slug = schedules.user_slug
    )
  );

create policy "schedules_update_own"
  on public.schedules
  for update
  using (
    exists (
      select 1
      from public.users u
      where u.email = auth.email() and u.slug = schedules.user_slug
    )
  )
  with check (
    exists (
      select 1
      from public.users u
      where u.email = auth.email() and u.slug = schedules.user_slug
    )
  );

create policy "schedules_delete_own"
  on public.schedules
  for delete
  using (
    exists (
      select 1
      from public.users u
      where u.email = auth.email() and u.slug = schedules.user_slug
    )
  );
