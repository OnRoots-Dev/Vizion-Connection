alter table public.news_post_comments enable row level security;

revoke all on table public.news_post_comments from anon, authenticated;

drop policy if exists "public news comments readable" on public.news_post_comments;
create policy "public news comments readable"
on public.news_post_comments
for select
to anon, authenticated
using (true);
