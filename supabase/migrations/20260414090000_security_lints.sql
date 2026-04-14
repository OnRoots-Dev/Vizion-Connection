-- Security lints fixes

-- 0011_function_search_path_mutable
-- Ensure search_path is fixed in trigger function
create or replace function public.touch_updated_at()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- 0024_permissive_rls_policy (schedules)
-- Drop any overly permissive policies and recreate strict ones
alter table if exists public.schedules enable row level security;

drop policy if exists "schedules_delete" on public.schedules;
drop policy if exists "schedules_insert" on public.schedules;
drop policy if exists "schedules_update" on public.schedules;

drop policy if exists "schedules_delete_own" on public.schedules;
drop policy if exists "schedules_insert_own" on public.schedules;
drop policy if exists "schedules_update_own" on public.schedules;
drop policy if exists "schedules_select_public_or_own" on public.schedules;

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

-- 0025_public_bucket_allows_listing (profiles)
-- Public buckets do not require broad SELECT policies. Restrict listing to own objects.
drop policy if exists "Public read 1ige2ga_0" on storage.objects;
drop policy if exists "Public update 1ige2ga_1" on storage.objects;

drop policy if exists "profiles_select_own" on storage.objects;
create policy "profiles_select_own"
  on storage.objects
  for select
  to authenticated
  using (bucket_id = 'profiles' and owner = auth.uid());
