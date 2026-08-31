-- ============================================================
-- P0 add-on: Together Activity（activity_participants）
--
-- Core UX TASK 5: Activity作成/編集時に「一緒に活動した人（Together）」を
-- 検索・招待できる。相手は Accept / Decline でき、Accept された場合のみ
-- 「Together Activity」として正式確定。
--
-- 重要: Together Activity（一緒に活動）≠ Connection（承認制の双方向関係）。
-- 既存 connections モデルを再利用し、新たな Connection テーブルは作らない。
-- activity_participants は「Activityに誰が参加したか」だけを表す。
--
-- ルール: 書き込みは service-role サーバールート経由のみ（anon/authenticated revoke）。
-- SELECT は parties（参加者本人 / Activity オーナー）または可視Activity参加者に制限。
--
-- 注意: このファイルは「作成のみ」。利用者（人間）の承認が得られるまで apply_migration はしない。
-- ============================================================

create table if not exists public.activity_participants (
    id          uuid primary key default gen_random_uuid(),
    activity_id uuid not null references public.activities(id) on delete cascade,
    user_id     bigint not null references public.users(id),
    status      text not null default 'pending'
                check (status in ('pending', 'accepted', 'declined')),
    -- そのActivityでの役割（任意ラベル: "監督", "メンター", "次走" など）
    role        text,
    invited_by  bigint not null references public.users(id),
    created_at  timestamptz not null default now(),
    updated_at  timestamptz not null default now()
);

create unique index if not exists uq_activity_participants_activity_user
    on public.activity_participants (activity_id, user_id);

do $$
begin
    if not exists (
        select 1 from pg_trigger
        where tgrelid = 'public.activity_participants'::regclass
          and tgname = 'activity_participants_touch_updated_at'
          and not tgisinternal
    ) then
        create trigger activity_participants_touch_updated_at
            before update on public.activity_participants
            for each row execute function public.touch_updated_at();
    end if;
end $$;

comment on table public.activity_participants is
    '「一緒に活動した人（Together Activity）」。pending -> accepted / declined。
     これは Connection とは独立。Connection 成立は別アクション（任意）。';

create index if not exists idx_activity_participants_user
    on public.activity_participants (user_id, status);
create index if not exists idx_activity_participants_activity
    on public.activity_participants (activity_id, status);

-- ------------------------------------------------------------
-- RLS：書き込みは service-role のみ。SELECT は参加者本人 / Activity オーナー。
-- 「可視Activityの参加者すべて」への公開刊行はコメントでオプションとして明記。
-- ------------------------------------------------------------
alter table public.activity_participants enable row level security;

revoke insert, update, delete, truncate on public.activity_participants from anon, authenticated;
grant select on public.activity_participants to authenticated;

do $$ begin
    if not exists (select 1 from pg_policies
                   where schemaname='public' and tablename='activity_participants'
                     and policyname='activity_participants_select_party') then
        create policy activity_participants_select_party on public.activity_participants
            for select to authenticated
            using (
                user_id = public.current_user_id()
                or activity_id in (
                    select id from public.activities
                    where user_id = public.current_user_id()
                )
            );
    end if;
end $$;
