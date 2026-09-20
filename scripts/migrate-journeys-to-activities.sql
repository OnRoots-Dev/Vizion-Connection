\set ON_ERROR_STOP on

begin;

-- This migration is INSERT/UPSERT only. It never deletes or drops journeys.
create temp table journey_activity_migration_log (
  journey_id uuid not null,
  activity_id uuid,
  status text not null,
  reason text,
  primary key (journey_id)
) on commit preserve rows;

-- A missing owner is the only expected hard migration blocker in the local schema.
insert into journey_activity_migration_log (journey_id, activity_id, status, reason)
select
  j.id,
  null,
  'skipped',
  'users.id が解決できない user_slug=' || j.user_slug
from public.journeys j
left join public.users u on u.slug = j.user_slug
where u.id is null;

with source_rows as (
  select
    j.id,
    u.id as user_id,
    case
      when exists (select 1 from unnest(coalesce(j.tags, '{}'::text[])) tag where lower(tag) = any(array['practice','training','match','competition','event','coaching','session','workshop','watching','supporting','participation']))
        then (select lower(tag) from unnest(coalesce(j.tags, '{}'::text[])) tag where lower(tag) = any(array['practice','training','match','competition','event','coaching','session','workshop','watching','supporting','participation']) limit 1)
      else 'other'
    end as activity_type,
    null::text as title,
    j.content as description,
    j.created_at as starts_at,
    null::timestamptz as ends_at,
    null::uuid as place_id,
    case when j.is_public then 'public' else 'private' end as visibility,
    case
      when j.condition_score is null then coalesce(j.tags, '{}'::text[])
      else array_append(coalesce(j.tags, '{}'::text[]), 'legacy:condition_score=' || j.condition_score::text)
    end as tags,
    'completed'::text as status,
    j.image_url,
    j.video_url,
    j.cheer_count,
    j.created_at as updated_at
  from public.journeys j
  join public.users u on u.slug = j.user_slug
)
insert into public.activities (
  id, user_id, type, title, description, starts_at, ends_at, place_id,
  visibility, tags, status, image_url, video_url, cheer_count, comment_count,
  created_at, updated_at
)
select
  id, user_id, activity_type, title, description, starts_at, ends_at, place_id,
  visibility, tags, status, image_url, video_url, cheer_count, 0,
  starts_at, updated_at
from source_rows
on conflict (id) do update set
  user_id = excluded.user_id,
  type = excluded.type,
  title = excluded.title,
  description = excluded.description,
  starts_at = excluded.starts_at,
  ends_at = excluded.ends_at,
  place_id = excluded.place_id,
  visibility = excluded.visibility,
  tags = excluded.tags,
  status = excluded.status,
  image_url = excluded.image_url,
  video_url = excluded.video_url,
  cheer_count = excluded.cheer_count,
  created_at = excluded.created_at,
  updated_at = excluded.updated_at;

insert into journey_activity_migration_log (journey_id, activity_id, status, reason)
select j.id, j.id, 'migrated', 'journey.id を activity.id としてUPSERT'
from public.journeys j
join public.users u on u.slug = j.user_slug
on conflict (journey_id) do update set
  activity_id = excluded.activity_id,
  status = excluded.status,
  reason = excluded.reason;

commit;

-- Counts: every journey must have one matching activity unless it is listed as skipped.
select
  (select count(*) from public.journeys) as journeys_total,
  (select count(*) from journey_activity_migration_log where status = 'migrated') as migrated_total,
  (select count(*) from journey_activity_migration_log where status = 'skipped') as skipped_total,
  (select count(*) from public.journeys j join public.activities a on a.id = j.id) as activities_matched_by_external_id;

-- Unmigrated records and reasons. Expected result: zero rows.
select journey_id, status, reason
from journey_activity_migration_log
where status <> 'migrated'
order by journey_id;

-- Sample comparison: user, timestamp, type, visibility and content/media.
select
  j.id as journey_id,
  a.id as activity_id,
  j.user_slug,
  a.user_id,
  j.created_at as journey_created_at,
  a.starts_at,
  j.tags as journey_tags,
  a.type as activity_type,
  j.is_public,
  a.visibility,
  j.content,
  a.description,
  j.image_url,
  a.image_url,
  j.video_url,
  a.video_url
from public.journeys j
left join public.activities a on a.id = j.id
order by j.created_at desc, j.id
limit 10;

-- Field-level mismatch counts. Expected result: all zeros.
select
  count(*) filter (where a.id is null) as missing_activity,
  count(*) filter (where a.user_id is distinct from u.id) as user_mismatch,
  count(*) filter (where a.starts_at is distinct from j.created_at) as timestamp_mismatch,
  count(*) filter (where a.description is distinct from j.content) as content_mismatch,
  count(*) filter (where a.image_url is distinct from j.image_url) as image_mismatch,
  count(*) filter (where a.video_url is distinct from j.video_url) as video_mismatch,
  count(*) filter (where a.visibility is distinct from case when j.is_public then 'public' else 'private' end) as visibility_mismatch
from public.journeys j
left join public.users u on u.slug = j.user_slug
left join public.activities a on a.id = j.id;
