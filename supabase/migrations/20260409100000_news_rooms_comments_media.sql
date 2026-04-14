alter table if exists public.news_posts
  add column if not exists gallery_image_urls jsonb not null default '[]'::jsonb,
  add column if not exists video_url text,
  add column if not exists comment_count integer not null default 0;

create table if not exists public.news_post_comments (
  id uuid primary key default gen_random_uuid(),
  post_id text not null,
  user_slug text,
  author_name text not null,
  author_role text,
  avatar_url text,
  body text not null,
  created_at timestamptz not null default now()
);

alter table public.news_post_comments enable row level security;

revoke all on table public.news_post_comments from anon, authenticated;

drop policy if exists "public news comments readable" on public.news_post_comments;
create policy "public news comments readable"
on public.news_post_comments
for select
to anon, authenticated
using (true);

create index if not exists news_post_comments_post_id_idx
  on public.news_post_comments (post_id, created_at desc);

create or replace function public.sync_news_post_comment_count()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  update public.news_posts
  set comment_count = (
    select count(*)::int
    from public.news_post_comments
    where post_id = coalesce(new.post_id, old.post_id)
  )
  where id::text = coalesce(new.post_id, old.post_id);

  return coalesce(new, old);
end;
$$;

drop trigger if exists trg_sync_news_post_comment_count_insert on public.news_post_comments;
create trigger trg_sync_news_post_comment_count_insert
after insert on public.news_post_comments
for each row
execute function public.sync_news_post_comment_count();

drop trigger if exists trg_sync_news_post_comment_count_delete on public.news_post_comments;
create trigger trg_sync_news_post_comment_count_delete
after delete on public.news_post_comments
for each row
execute function public.sync_news_post_comment_count();

update public.news_posts p
set comment_count = counts.total
from (
  select post_id, count(*)::int as total
  from public.news_post_comments
  group by post_id
) counts
where p.id::text = counts.post_id;

update public.news_posts
set comment_count = 0
where comment_count is null;
