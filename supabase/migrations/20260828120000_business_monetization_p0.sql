-- ============================================================
-- Business Monetization P0 Model Contract:
-- business_accounts / business_locations / business_campaigns
--
-- Additive-only migration. No existing table is dropped or altered.
-- Plan / Scope / Status are contract-level (per business account),
-- NOT per location (multi-location parent/child supported via
-- business_locations.account_id -> business_accounts.id).
--
-- Map coordinates for locations are ALWAYS the real business location
-- (plan never changes physical lat/lng; plan changes delivery scope).
--
-- Writes are service-role only (INSERT/UPDATE/DELETE/TRUNCATE revoked
-- from anon/authenticated); SELECT policies expose business accounts,
-- locations, and active approved campaigns.
--
-- Idempotent: safe to re-run.
-- ============================================================

-- ------------------------------------------------------------
-- 1. business_accounts (Plan / Status at contract level)
-- ------------------------------------------------------------
create table if not exists public.business_accounts (
    id                 uuid primary key default gen_random_uuid(),
    user_id            bigint not null references public.users(id) on delete cascade,
    plan               text not null check (plan in ('FREE','LOCAL','FEATURED','PREMIUM','ENTERPRISE')),
    status             text not null default 'free'
                       check (status in ('free','active','inactive')),
    primary_prefecture text,
    created_at         timestamptz not null default now(),
    updated_at         timestamptz not null default now(),
    constraint uq_business_accounts_user unique (user_id)
);

comment on table public.business_accounts is
    'Business Monetization contract. Plan is contract-level, shared across all locations of a business.';

do $$ begin
    if not exists (
        select 1 from pg_trigger
        where tgrelid = 'public.business_accounts'::regclass
          and tgname = 'business_accounts_touch_updated_at'
          and not tgisinternal
    ) then
        create trigger business_accounts_touch_updated_at
            before update on public.business_accounts
            for each row execute function public.touch_updated_at();
    end if;
end $$;

-- ------------------------------------------------------------
-- 2. business_locations (child storefronts; real coordinates)
-- ------------------------------------------------------------
create table if not exists public.business_locations (
    id         uuid primary key default gen_random_uuid(),
    account_id uuid not null references public.business_accounts(id) on delete cascade,
    name       text not null,
    prefecture text not null,
    address    text,
    latitude   double precision not null check (latitude >= -90 and latitude <= 90),
    longitude  double precision not null check (longitude >= -180 and longitude <= 180),
    hours      text,
    phone      text,
    website    text,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

comment on table public.business_locations is
    'Child storefront of a Business Account. latitude/longitude are the REAL physical location and must never be moved by plan.';

do $$ begin
    if not exists (
        select 1 from pg_trigger
        where tgrelid = 'public.business_locations'::regclass
          and tgname = 'business_locations_touch_updated_at'
          and not tgisinternal
    ) then
        create trigger business_locations_touch_updated_at
            before update on public.business_locations
            for each row execute function public.touch_updated_at();
    end if;
end $$;

-- ------------------------------------------------------------
-- 3. business_campaigns (Activity / Moment ads)
-- ------------------------------------------------------------
create table if not exists public.business_campaigns (
    id              uuid primary key default gen_random_uuid(),
    account_id      uuid not null references public.business_accounts(id) on delete cascade,
    name            text not null,
    type            text not null check (type in ('activity','moment')),
    scope           text not null check (scope in ('local','region','half','national')),
    region_block    text check (region_block in ('hokkaido','tohoku','kanto','chubu','kinki','chugoku','shikoku','kyushu_okinawa')),
    half            text check (half in ('east','west')),
    prefecture      text,
    location_target text not null default 'all' check (location_target in ('all','specific')),
    location_id     uuid references public.business_locations(id) on delete set null,
    -- creative JSON: { title, description?, image_url?, video_url?, cta_text?, cta_url? }
    creative        jsonb not null default '{}'::jsonb,
    status          text not null default 'draft' check (status in ('draft','active','paused','ended')),
    started_at      timestamptz,
    ended_at        timestamptz,
    created_at      timestamptz not null default now(),
    updated_at      timestamptz not null default now()
);

comment on table public.business_campaigns is
    'Ad campaign of a Business Account. scope must be validated against the account plan at the server level (never trust the client).';

create index if not exists idx_business_campaigns_account on public.business_campaigns (account_id, created_at desc);
create index if not exists idx_business_campaigns_status on public.business_campaigns (status);
create index if not exists idx_business_campaigns_scope on public.business_campaigns (scope);

do $$ begin
    if not exists (
        select 1 from pg_trigger
        where tgrelid = 'public.business_campaigns'::regclass
          and tgname = 'business_campaigns_touch_updated_at'
          and not tgisinternal
    ) then
        create trigger business_campaigns_touch_updated_at
            before update on public.business_campaigns
            for each row execute function public.touch_updated_at();
    end if;
end $$;

-- ------------------------------------------------------------
-- 4. RLS enable + grants (writes are service-role only)
-- ------------------------------------------------------------
alter table public.business_accounts    enable row level security;
alter table public.business_locations   enable row level security;
alter table public.business_campaigns   enable row level security;

revoke insert, update, delete, truncate on public.business_accounts    from anon, authenticated;
revoke insert, update, delete, truncate on public.business_locations   from anon, authenticated;
revoke insert, update, delete, truncate on public.business_campaigns   from anon, authenticated;

grant select on public.business_accounts  to anon, authenticated;
grant select on public.business_locations to anon, authenticated;
grant select on public.business_campaigns to anon, authenticated;

-- ------------------------------------------------------------
-- 5. SELECT policies (public business info + active approved campaigns)
-- ------------------------------------------------------------
do $$ begin
    if not exists (select 1 from pg_policies
                   where schemaname='public' and tablename='business_accounts'
                     and policyname='business_accounts_select_public') then
        create policy business_accounts_select_public on public.business_accounts
            for select to anon, authenticated
            using (true);
    end if;
end $$;

do $$ begin
    if not exists (select 1 from pg_policies
                   where schemaname='public' and tablename='business_locations'
                     and policyname='business_locations_select_public') then
        create policy business_locations_select_public on public.business_locations
            for select to anon, authenticated
            using (true);
    end if;
end $$;

do $$ begin
    if not exists (select 1 from pg_policies
                   where schemaname='public' and tablename='business_campaigns'
                     and policyname='business_campaigns_select_active') then
        create policy business_campaigns_select_active on public.business_campaigns
            for select to anon, authenticated
            using (status = 'active' and scope is not null);
    end if;
end $$;
