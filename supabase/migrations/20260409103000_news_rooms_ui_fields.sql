alter table if exists public.news_posts
  add column if not exists summary text,
  add column if not exists author_role text,
  add column if not exists topic text,
  add column if not exists cheer_count integer not null default 0;

update public.news_posts
set summary = left(regexp_replace(coalesce(body, ''), '\s+', ' ', 'g'), 120)
where summary is null or btrim(summary) = '';

update public.news_posts
set author_role = case
  when lower(coalesce(author, '')) like '%athlete%' then 'Athlete'
  when lower(coalesce(author, '')) like '%trainer%' then 'Trainer'
  when lower(coalesce(author, '')) like '%business%' then 'Business'
  else '運営'
end
where author_role is null or btrim(author_role) = '';

update public.news_posts
set topic = case
  when author_role = 'Athlete' then 'athlete'
  when author_role = 'Trainer' then 'trainer'
  when author_role = 'Business' then 'business'
  when category = 'announce' then 'update'
  else 'all'
end
where topic is null or btrim(topic) = '';
