-- Notification infrastructure
-- Apply this SQL in Supabase SQL editor (or your migration pipeline).

create table if not exists public.notifications (
  id bigint generated always as identity primary key,
  recipient_slug text not null,
  actor_slug text null,
  type text not null,
  title text not null,
  body text not null default '',
  link_url text null,
  payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists idx_notifications_recipient_created_at
  on public.notifications (recipient_slug, created_at desc);

create table if not exists public.notification_reads (
  id bigint generated always as identity primary key,
  notification_id bigint not null references public.notifications(id) on delete cascade,
  reader_slug text not null,
  read_at timestamptz not null default now(),
  unique (notification_id, reader_slug)
);

create index if not exists idx_notification_reads_reader
  on public.notification_reads (reader_slug, read_at desc);

create or replace function public.mark_notifications_read(
  target_slug text,
  target_ids bigint[]
)
returns integer
language plpgsql
as $$
declare
  inserted_count integer;
begin
  if target_ids is null or array_length(target_ids, 1) is null then
    return 0;
  end if;

  with inserted as (
    insert into public.notification_reads (notification_id, reader_slug)
    select n.id, target_slug
    from public.notifications n
    where n.recipient_slug = target_slug
      and n.id = any(target_ids)
    on conflict (notification_id, reader_slug) do nothing
    returning 1
  )
  select count(*) into inserted_count from inserted;

  return coalesce(inserted_count, 0);
end;
$$;

create or replace function public.mark_all_notifications_read(
  target_slug text
)
returns integer
language plpgsql
as $$
declare
  inserted_count integer;
begin
  with inserted as (
    insert into public.notification_reads (notification_id, reader_slug)
    select n.id, target_slug
    from public.notifications n
    where n.recipient_slug = target_slug
      and not exists (
        select 1
        from public.notification_reads r
        where r.notification_id = n.id
          and r.reader_slug = target_slug
      )
    on conflict (notification_id, reader_slug) do nothing
    returning 1
  )
  select count(*) into inserted_count from inserted;

  return coalesce(inserted_count, 0);
end;
$$;

create or replace function public.get_unread_notifications_count(
  target_slug text
)
returns integer
language sql
stable
as $$
  select count(*)::integer
  from public.notifications n
  where n.recipient_slug = target_slug
    and not exists (
      select 1
      from public.notification_reads r
      where r.notification_id = n.id
        and r.reader_slug = target_slug
    );
$$;
