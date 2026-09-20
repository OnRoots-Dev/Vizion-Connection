-- Run against the restored staging database with psql.
-- This file is intentionally read-only.

select 'journeys' as table_name, count(*) as row_count from public.journeys
union all select 'user_follows', count(*) from public.user_follows
union all select 'ads', count(*) from public.ads
union all select 'events', count(*) from public.events
union all select 'event_invites', count(*) from public.event_invites
union all select 'event_reminders', count(*) from public.event_reminders
union all select 'business_orders', count(*) from public.business_orders
union all select 'business_sponsorships', count(*) from public.business_sponsorships
union all select 'portfolio_milestones', count(*) from public.portfolio_milestones
order by table_name;

-- Major-column samples. Compare these results with the pre-delete capture in manifest.json.
select id, user_slug, content, created_at, is_public
from public.journeys order by to_jsonb(journeys)::text limit 5;

select id, follower_slug, target_slug
from public.user_follows order by to_jsonb(user_follows)::text limit 5;

select id, headline, status, is_active, created_at
from public.ads order by to_jsonb(ads)::text limit 5;

select id, title, start_at, end_at
from public.events order by to_jsonb(events)::text limit 5;

select id, event_id, invitee_id, status
from public.event_invites order by to_jsonb(event_invites)::text limit 5;

select id, event_id, user_id
from public.event_reminders order by to_jsonb(event_reminders)::text limit 5;

-- business_orders is an existing production table without a CREATE migration here;
-- compare its full-row JSON sample rather than guessing its legacy column names.
select row_to_json(sample_row)::text
from (select * from public.business_orders as source_row order by to_jsonb(source_row)::text limit 5) as sample_row;

select id, business_user_slug, sponsored_user_slug, business_order_id
from public.business_sponsorships order by to_jsonb(business_sponsorships)::text limit 5;

select id, slug, milestone_type, achieved_at, created_at
from public.portfolio_milestones order by to_jsonb(portfolio_milestones)::text limit 5;