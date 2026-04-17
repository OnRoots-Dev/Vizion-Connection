create table if not exists public.careers (
  id uuid primary key default gen_random_uuid(),
  user_slug text not null references public.users(slug) on delete cascade,
  year int not null,
  title text not null,
  description text,
  tag text not null check (tag in ('tournament','award','affiliation','media')),
  created_at timestamptz not null default now()
);

create index if not exists idx_careers_user_year
  on public.careers (user_slug, year desc);

alter table public.careers enable row level security;

drop policy if exists "careers_select_public_or_own" on public.careers;
create policy "careers_select_public_or_own"
  on public.careers
  for select
  to anon, authenticated
  using (
    exists (
      select 1
      from public.users u
      where u.slug = careers.user_slug and u.is_public = true and u.is_deleted = false
    )
    or exists (
      select 1
      from public.users u
      where u.email = auth.email() and u.slug = careers.user_slug
    )
  );

drop policy if exists "careers_insert_own" on public.careers;
create policy "careers_insert_own"
  on public.careers
  for insert
  to authenticated
  with check (
    exists (
      select 1
      from public.users u
      where u.email = auth.email() and u.slug = careers.user_slug
    )
  );

drop policy if exists "careers_update_own" on public.careers;
create policy "careers_update_own"
  on public.careers
  for update
  to authenticated
  using (
    exists (
      select 1
      from public.users u
      where u.email = auth.email() and u.slug = careers.user_slug
    )
  )
  with check (
    exists (
      select 1
      from public.users u
      where u.email = auth.email() and u.slug = careers.user_slug
    )
  );

drop policy if exists "careers_delete_own" on public.careers;
create policy "careers_delete_own"
  on public.careers
  for delete
  to authenticated
  using (
    exists (
      select 1
      from public.users u
      where u.email = auth.email() and u.slug = careers.user_slug
    )
  );

alter table public.users
  add column if not exists username text,
  add column if not exists full_name text,
  add column if not exists cover_url text,
  add column if not exists is_available boolean not null default false,
  add column if not exists instagram_url text,
  add column if not exists youtube_url text,
  add column if not exists affiliation text,
  add column if not exists area text,
  add column if not exists sponsor_logos text[] not null default '{}'::text[];

create unique index if not exists users_username_unique
  on public.users (username);
