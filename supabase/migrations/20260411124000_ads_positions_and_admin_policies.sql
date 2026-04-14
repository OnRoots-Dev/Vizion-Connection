alter table public.ads add column if not exists position integer default 3;
alter table public.ads add column if not exists sponsor text;

create policy "ads_insert" on ads for insert
  with check (auth.jwt() ->> 'role' = 'admin');
create policy "ads_update" on ads for update
  using (auth.jwt() ->> 'role' = 'admin');
create policy "ads_delete" on ads for delete
  using (auth.jwt() ->> 'role' = 'admin');
