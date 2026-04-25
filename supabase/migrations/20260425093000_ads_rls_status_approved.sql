drop policy if exists "public active ads readable" on public.ads;
create policy "public active ads readable"
on public.ads
for select
to anon, authenticated
using (is_active = true and (status = 'approved' or status is null));
