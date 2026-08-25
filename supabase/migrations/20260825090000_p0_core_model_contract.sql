-- ============================================================
-- P0 Core Model Contract: places / activities / moments /
-- moment_comments / moment_cheers / connections
--
-- Additive-only migration. No existing table is dropped or altered.
-- Internal FKs use users.id (bigint). slug stays public-URL only.
-- All writes go through service-role server routes:
--   INSERT/UPDATE/DELETE/TRUNCATE are revoked from anon/authenticated.
-- RLS is enabled on every new table; SELECT policies implement
-- visibility (public / connections / private) with owner checks via
-- auth.uid() -> users.auth_id -> users.id (no email-based checks).
--
-- Idempotent: safe to re-run.
-- ============================================================

-- ------------------------------------------------------------
-- 1. places (reference master; only place lat/lng lives here)
-- ------------------------------------------------------------
create table if not exists public.places (
    id             uuid primary key default gen_random_uuid(),
    name           text not null,
    prefecture     text not null,
    address        text,
    latitude       double precision not null check (latitude >= -90 and latitude <= 90),
    longitude      double precision not null check (longitude >= -180 and longitude <= 180),
    precision      text not null default 'approximate'
                   check (precision in ('exact', 'approximate')),
    place_type     text not null default 'facility'
                   check (place_type in ('facility', 'park', 'school', 'stadium', 'gym', 'outdoor', 'other')),
    created_by     bigint references public.users(id) on delete set null,
    created_at     timestamptz not null default now()
);

comment on table public.places is
    'Canonical place reference for Viz Map. Coordinates are owned ONLY by this table (Activity/Moment never store lat/lng). precision controls coordinate exposure.';

-- ------------------------------------------------------------
-- 2. activities
-- ------------------------------------------------------------
create table if not exists public.activities (
    id            uuid primary key default gen_random_uuid(),
    user_id       bigint not null references public.users(id),
    type          text not null check (type in (
                      'practice','training','match','competition','event',
                      'coaching','session','workshop',
                      'watching','supporting','participation','other')),
    title         text,
    description   text,
    starts_at     timestamptz not null,
    ends_at       timestamptz,
    place_id      uuid references public.places(id),
    visibility    text not null default 'private'
                  check (visibility in ('public', 'connections', 'private')),
    tags          text[] not null default '{}',
    status        text not null default 'planned'
                  check (status in ('planned', 'completed', 'cancelled')),
    created_at    timestamptz not null default now(),
    updated_at    timestamptz not null default now(),
    constraint activities_time_order_check check (ends_at is null or ends_at > starts_at)
);

do $$
begin
    if not exists (
        select 1 from pg_trigger
        where tgrelid = 'public.activities'::regclass
          and tgname = 'activities_touch_updated_at'
          and not tgisinternal
    ) then
        create trigger activities_touch_updated_at
            before update on public.activities
            for each row execute function public.touch_updated_at();
    end if;
end $$;

comment on table public.activities is
    'Core recurring sport action record (not a social post). Place-aware when possible (place_id NULL = deliberate no-place state).';

-- ------------------------------------------------------------
-- 3. moments
-- ------------------------------------------------------------
create table if not exists public.moments (
    id            uuid primary key default gen_random_uuid(),
    user_id       bigint not null references public.users(id),
    -- NO ACTION (restrict): an activity referenced by moments cannot be
    -- hard-deleted -> owners cancel via status instead, preserving history
    -- (08_ACTIVITY_SPEC: preserve historical Moment references).
    activity_id   uuid references public.activities(id),
    body          text not null,
    image_url     text,
    video_url      text,
    visibility    text not null default 'private'
                  check (visibility in ('public', 'connections', 'private')),
    cheer_count   integer not null default 0,
    comment_count integer not null default 0,
    created_at    timestamptz not null default now(),
    updated_at    timestamptz not null default now()
);

do $$
begin
    if not exists (
        select 1 from pg_trigger
        where tgrelid = 'public.moments'::regclass
          and tgname = 'moments_touch_updated_at'
          and not tgisinternal
    ) then
        create trigger moments_touch_updated_at
            before update on public.moments
            for each row execute function public.touch_updated_at();
    end if;
end $$;

comment on table public.moments is
    'Publishable outcome of an Activity. No own coordinates: map exposure derives from Activity -> Place. Effective visibility = own visibility AND parent activity visibility.';

-- ------------------------------------------------------------
-- 4. moment_comments
-- ------------------------------------------------------------
create table if not exists public.moment_comments (
    id         uuid primary key default gen_random_uuid(),
    moment_id  uuid not null references public.moments(id) on delete cascade,
    user_id    bigint not null references public.users(id),
    body       text not null,
    created_at timestamptz not null default now()
);

comment on table public.moment_comments is
    'Contextual comments on a Moment. Readability strictly follows parent moment effective visibility.';

-- ------------------------------------------------------------
-- 5. moment_cheers (separate from legacy user-targeted cheers;
--    the existing cheers table is intentionally untouched)
-- ------------------------------------------------------------
create table if not exists public.moment_cheers (
    id           uuid primary key default gen_random_uuid(),
    moment_id    uuid not null references public.moments(id) on delete cascade,
    from_user_id bigint not null references public.users(id),
    created_at   timestamptz not null default now()
);

create unique index if not exists uq_moment_cheers_moment_from
    on public.moment_cheers (moment_id, from_user_id);

comment on table public.moment_cheers is
    'One cheer per user per moment (toggle semantics). UI label remains "Cheer"; storage is isolated from legacy user-to-user cheers.';

-- ------------------------------------------------------------
-- 6. connections (consent-based mutual relationship; NOT a follow)
-- ------------------------------------------------------------
create table if not exists public.connections (
    id            uuid primary key default gen_random_uuid(),
    requester_id  bigint not null references public.users(id),
    addressee_id  bigint not null references public.users(id),
    status        text not null default 'pending' check (status in ('pending', 'accepted')),
    created_at    timestamptz not null default now(),
    updated_at    timestamptz not null default now(),
    constraint connections_no_self check (requester_id <> addressee_id)
);

create unique index if not exists uq_connections_requester_addressee
    on public.connections (requester_id, addressee_id);

do $$
begin
    if not exists (
        select 1 from pg_trigger
        where tgrelid = 'public.connections'::regclass
          and tgname = 'connections_touch_updated_at'
          and not tgisinternal
    ) then
        create trigger connections_touch_updated_at
            before update on public.connections
            for each row execute function public.touch_updated_at();
    end if;
end $$;

comment on table public.connections is
    'Consent-based mutual relationship: pending -> accepted, decline/cancel/remove = DELETE row. Deliberately separate from user_follows (Bond), which stays untouched.';

-- ------------------------------------------------------------
-- 7. indexes
-- ------------------------------------------------------------
create index if not exists idx_places_prefecture      on public.places (prefecture);
create index if not exists idx_places_lat_lng         on public.places (latitude, longitude);
create index if not exists idx_places_created_by      on public.places (created_by);

create index if not exists idx_activities_user_created    on public.activities (user_id, created_at desc);
create index if not exists idx_activities_place           on public.activities (place_id);
create index if not exists idx_activities_visibility_starts on public.activities (visibility, starts_at);
create index if not exists idx_activities_starts_at       on public.activities (starts_at);
create index if not exists idx_activities_tags            on public.activities using gin (tags);

create index if not exists idx_moments_activity          on public.moments (activity_id);
create index if not exists idx_moments_user_created      on public.moments (user_id, created_at desc);
create index if not exists idx_moments_visibility_created on public.moments (visibility, created_at desc);

create index if not exists idx_moment_comments_moment_created on public.moment_comments (moment_id, created_at);
create index if not exists idx_moment_comments_user      on public.moment_comments (user_id);

create index if not exists idx_moment_cheers_from_user   on public.moment_cheers (from_user_id);

create index if not exists idx_connections_requester_status on public.connections (requester_id, status);
create index if not exists idx_connections_addressee_status on public.connections (addressee_id, status);

-- ------------------------------------------------------------
-- 8. helper functions (SECURITY DEFINER, hardened search_path)
-- ------------------------------------------------------------
create or replace function public.current_user_id()
returns bigint
language sql
stable
security definer
set search_path = ''
as $$
    select u.id
    from public.users u
    where u.auth_id = auth.uid()
    limit 1
$$;

create or replace function public.can_view_activity(p_activity_id uuid)
returns boolean
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
    v_me bigint := public.current_user_id();
    r record;
begin
    if p_activity_id is null then
        return false;
    end if;

    select a.user_id, a.visibility, o.is_public, o.is_deleted, o.auth_id as owner_auth
    into r
    from public.activities a
    join public.users o on o.id = a.user_id
    where a.id = p_activity_id;

    if not found then
        return false;
    end if;

    -- owner always sees own records
    if r.owner_auth = auth.uid() then
        return true;
    end if;

    if r.is_deleted then
        return false;
    end if;

    if r.visibility = 'public' then
        return r.is_public;
    end if;

    if r.visibility = 'connections' then
        return exists (
            select 1 from public.connections c
            where c.status = 'accepted'
              and ((c.requester_id = r.user_id and c.addressee_id = v_me)
                or (c.addressee_id = r.user_id and c.requester_id = v_me))
        );
    end if;

    -- private: owner only (already handled above)
    return false;
end;
$$;

create or replace function public.can_view_moment(p_moment_id uuid)
returns boolean
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
    v_me bigint := public.current_user_id();
    r record;
begin
    if p_moment_id is null then
        return false;
    end if;

    select m.user_id, m.activity_id, m.visibility,
           o.is_public, o.is_deleted, o.auth_id as owner_auth
    into r
    from public.moments m
    join public.users o on o.id = m.user_id
    where m.id = p_moment_id;

    if not found then
        return false;
    end if;

    -- owner always sees own records
    if r.owner_auth = auth.uid() then
        return true;
    end if;

    if r.is_deleted then
        return false;
    end if;

    -- parent gate first: a moment linked to an activity can never be
    -- more visible than its parent activity
    if r.activity_id is not null and not public.can_view_activity(r.activity_id) then
        return false;
    end if;

    if r.visibility = 'public' then
        return r.is_public;
    end if;

    if r.visibility = 'connections' then
        return exists (
            select 1 from public.connections c
            where c.status = 'accepted'
              and ((c.requester_id = r.user_id and c.addressee_id = v_me)
                or (c.addressee_id = r.user_id and c.requester_id = v_me))
        );
    end if;

    return false;
end;
$$;

-- ------------------------------------------------------------
-- 9. RLS enable + grants (writes are service-role-only)
-- ------------------------------------------------------------
alter table public.places          enable row level security;
alter table public.activities      enable row level security;
alter table public.moments         enable row level security;
alter table public.moment_comments enable row level security;
alter table public.moment_cheers   enable row level security;
alter table public.connections     enable row level security;

-- House rule: every write goes through service-role server routes.
revoke insert, update, delete, truncate on public.places          from anon, authenticated;
revoke insert, update, delete, truncate on public.activities      from anon, authenticated;
revoke insert, update, delete, truncate on public.moments         from anon, authenticated;
revoke insert, update, delete, truncate on public.moment_comments from anon, authenticated;
revoke insert, update, delete, truncate on public.moment_cheers   from anon, authenticated;
revoke insert, update, delete, truncate on public.connections     from anon, authenticated;

grant select on public.places          to anon, authenticated;
grant select on public.activities      to anon, authenticated;
grant select on public.moments         to anon, authenticated;
grant select on public.moment_comments to anon, authenticated;
grant select on public.moment_cheers   to anon, authenticated;
grant select on public.connections     to authenticated;

-- ------------------------------------------------------------
-- 10. SELECT policies (visibility-safe reads; deny-all for anything else)
-- ------------------------------------------------------------
do $$ begin
    if not exists (select 1 from pg_policies
                   where schemaname='public' and tablename='places'
                     and policyname='places_select_all') then
        create policy places_select_all on public.places
            for select to anon, authenticated
            using (true);
    end if;
end $$;

do $$ begin
    if not exists (select 1 from pg_policies
                   where schemaname='public' and tablename='activities'
                     and policyname='activities_select_visible') then
        create policy activities_select_visible on public.activities
            for select to anon, authenticated
            using (public.can_view_activity(id));
    end if;
end $$;

do $$ begin
    if not exists (select 1 from pg_policies
                   where schemaname='public' and tablename='moments'
                     and policyname='moments_select_visible') then
        create policy moments_select_visible on public.moments
            for select to anon, authenticated
            using (public.can_view_moment(id));
    end if;
end $$;

do $$ begin
    if not exists (select 1 from pg_policies
                   where schemaname='public' and tablename='moment_comments'
                     and policyname='moment_comments_select_if_visible') then
        create policy moment_comments_select_if_visible on public.moment_comments
            for select to anon, authenticated
            using (public.can_view_moment(moment_id));
    end if;
end $$;

do $$ begin
    if not exists (select 1 from pg_policies
                   where schemaname='public' and tablename='moment_cheers'
                     and policyname='moment_cheers_select_if_visible') then
        create policy moment_cheers_select_if_visible on public.moment_cheers
            for select to anon, authenticated
            using (public.can_view_moment(moment_id));
    end if;
end $$;

do $$ begin
    if not exists (select 1 from pg_policies
                   where schemaname='public' and tablename='connections'
                     and policyname='connections_select_party') then
        create policy connections_select_party on public.connections
            for select to authenticated
            using (requester_id = public.current_user_id()
                or addressee_id = public.current_user_id());
    end if;
end $$;
