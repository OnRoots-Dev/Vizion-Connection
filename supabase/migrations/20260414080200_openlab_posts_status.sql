alter table if exists public.openlab_posts
  add column if not exists status text not null default 'open';

-- Ensure only allowed statuses
alter table if exists public.openlab_posts
  drop constraint if exists openlab_posts_status_check;

alter table if exists public.openlab_posts
  add constraint openlab_posts_status_check
  check (status in ('open','reviewing','planned','done'));
