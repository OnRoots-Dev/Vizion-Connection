-- ============================================================
-- P0 add-on: Activity Cheer / Comment
--
-- ActivityにもMoment同様の反応（Cheer / Comment）を持たせる（Core UX TASK 4）。
-- 設計は既存の moment_cheers / moment_comments をそのまま踏襲（複製はせず、同パターンを適用）。
-- ルール:
--   * 書き込み（INSERT/UPDATE/DELETE/TRUNCATE）は anon/authenticated から revoke（service-role サーバールート経由のみ）。
--   * SELECT は can_view_activity() で可視性ゲート（作成物の可視性を継承）。
--   * activities に cheer_count / comment_count を追加（moments と同型）。
--
-- 注意: このファイルは「作成のみ」。利用者（人間）の承認が得られるまで apply_migration はしない。
-- ============================================================

-- ------------------------------------------------------------
-- 1. activities に cheer_count / comment_count を追加（冪等, additive）
-- ------------------------------------------------------------
alter table public.activities
    add column if not exists cheer_count integer not null default 0;
alter table public.activities
    add column if not exists comment_count integer not null default 0;

comment on column public.activities.cheer_count  is 'Activityへの総Cheer数（denormalized）。moment_cheersと同型。';
comment on column public.activities.comment_count is 'Activityへの総Comment数（denormalized）。moment_commentsと同型。';

-- ------------------------------------------------------------
-- 2. activity_comments
-- ------------------------------------------------------------
create table if not exists public.activity_comments (
    id          uuid primary key default gen_random_uuid(),
    activity_id uuid not null references public.activities(id) on delete cascade,
    user_id     bigint not null references public.users(id),
    body        text not null,
    created_at  timestamptz not null default now()
);

comment on table public.activity_comments is
    'Activityへの文脈付きコメント。可視性は親Activityの有効可視性に厳密に従う（moment_commentsと同パターン）。';

create index if not exists idx_activity_comments_activity_created
    on public.activity_comments (activity_id, created_at);
create index if not exists idx_activity_comments_user
    on public.activity_comments (user_id);

-- ------------------------------------------------------------
-- 3. activity_cheers（user→activity の反応。既存の user→user cheers とは分離）
-- ------------------------------------------------------------
create table if not exists public.activity_cheers (
    id           uuid primary key default gen_random_uuid(),
    activity_id  uuid not null references public.activities(id) on delete cascade,
    from_user_id bigint not null references public.users(id),
    created_at   timestamptz not null default now()
);

create unique index if not exists uq_activity_cheers_activity_from
    on public.activity_cheers (activity_id, from_user_id);

comment on table public.activity_cheers is
    '1名につき1Activityにつき1回のCheer（トグル）。UIラベルは "Cheer"（moment_cheersと同型）。';

create index if not exists idx_activity_cheers_from_user
    on public.activity_cheers (from_user_id);

-- ------------------------------------------------------------
-- 4. can_view_activity ゲート付き SELECT のための RLS
-- ------------------------------------------------------------
alter table public.activity_comments enable row level security;
alter table public.activity_cheers   enable row level security;

revoke insert, update, delete, truncate on public.activity_comments from anon, authenticated;
revoke insert, update, delete, truncate on public.activity_cheers   from anon, authenticated;

grant select on public.activity_comments to anon, authenticated;
grant select on public.activity_cheers   to anon, authenticated;

do $$ begin
    if not exists (select 1 from pg_policies
                   where schemaname='public' and tablename='activity_comments'
                     and policyname='activity_comments_select_if_visible') then
        create policy activity_comments_select_if_visible on public.activity_comments
            for select to anon, authenticated
            using (public.can_view_activity(activity_id));
    end if;
end $$;

do $$ begin
    if not exists (select 1 from pg_policies
                   where schemaname='public' and tablename='activity_cheers'
                     and policyname='activity_cheers_select_if_visible') then
        create policy activity_cheers_select_if_visible on public.activity_cheers
            for select to anon, authenticated
            using (public.can_view_activity(activity_id));
    end if;
end $$;
