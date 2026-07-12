alter table public.news_posts
  add column if not exists image_url text null,
  add column if not exists view_count integer not null default 0;

create index if not exists idx_news_posts_published_view_count
  on public.news_posts (is_published, view_count desc, published_at desc);
