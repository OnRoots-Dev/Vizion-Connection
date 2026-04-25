drop policy if exists "ads_insert" on public.ads;
drop policy if exists "ads_update" on public.ads;
drop policy if exists "ads_delete" on public.ads;

create policy "ads_insert" on public.ads for insert
  to authenticated
  with check (
    exists (
      select 1
      from public.users u
      where u.slug = auth.uid()::text
        and u.role = 'Admin'
        and u.is_deleted = false
    )
  );

create policy "ads_update" on public.ads for update
  to authenticated
  using (
    exists (
      select 1
      from public.users u
      where u.slug = auth.uid()::text
        and u.role = 'Admin'
        and u.is_deleted = false
    )
  );

create policy "ads_delete" on public.ads for delete
  to authenticated
  using (
    exists (
      select 1
      from public.users u
      where u.slug = auth.uid()::text
        and u.role = 'Admin'
        and u.is_deleted = false
    )
  );
