-- =============================================================================
-- RLS hardening / alignment (2026-07-20)
-- マッピング（実スキーマ）:
--   profiles   → public.users
--   follows    → public.user_follows
--   activities → public.journeys（activities テーブルは未存在）
--   ad_slots   → public.ad_slots
--
-- 恒久ルール（SECURITY.md）:
--   users / journeys への anon・authenticated の書き込み GRANT は復活させない
--   （2026-06-20 監査: 自己UPDATE による role 昇格などを修正済み）
--   所有権は auth.uid() = users.auth_id（id ではない）
-- =============================================================================

-- ── helper: 現在ユーザーの slug ─────────────────────────────────────────────
create or replace function public.current_user_slug()
returns text
language sql
stable
security definer
set search_path = public
as $$
  select u.slug
  from public.users u
  where u.auth_id = auth.uid()
    and u.is_deleted = false
  limit 1;
$$;

revoke all on function public.current_user_slug() from public;
grant execute on function public.current_user_slug() to anon, authenticated, service_role;

-- =============================================================================
-- 1) users（profiles 相当）
-- SELECT: 公開プロフィールは誰でも / 本人は自分の行
-- INSERT/UPDATE: service_role のみ（クライアント直書き禁止・SECURITY.md）
-- 機密列（email/password_hash/reset_token 等）は列 GRANT で SELECT 不可のまま維持
-- =============================================================================
alter table public.users enable row level security;

-- 公開読み取り（Discovery）
drop policy if exists "public users readable" on public.users;
create policy "users_select_public"
  on public.users
  for select
  to anon, authenticated
  using (is_public = true and is_deleted = false);

-- 本人読み取り（非公開でも自分は見える）
drop policy if exists "本人のみ自分のレコードを参照" on public.users;
create policy "users_select_own"
  on public.users
  for select
  to authenticated
  using (auth.uid() = auth_id);

-- service_role は全操作（既存を整理）
drop policy if exists "service_role full access" on public.users;
create policy "users_service_role_all"
  on public.users
  for all
  to service_role
  using (true)
  with check (true);

-- 書き込み GRANT を確実に剥奪（INSERT/UPDATE ポリシーは作らない）
revoke insert, update, delete, truncate on table public.users from anon, authenticated;
-- TRUNCATE 等のゴミ権限を掃除
revoke truncate, references, trigger on table public.users from anon, authenticated;

-- 公開 Discovery 用: テーブル SELECT は列 GRANT 方式を維持するため table-level SELECT は付けない
-- （email / password_hash / reset_token は列 SELECT なし）
-- 念のため機密列の SELECT を再 revoke
revoke select (email, password_hash, reset_token, reset_token_expires) on table public.users from anon, authenticated;

-- =============================================================================
-- 2) ad_slots
-- SELECT: 誰でも可（価格ページ残数）
-- INSERT/UPDATE/DELETE: anon/authenticated 不可。service_role のみ
-- =============================================================================
alter table public.ad_slots enable row level security;

drop policy if exists "ad_slots_select_public" on public.ad_slots;
create policy "ad_slots_select_public"
  on public.ad_slots
  for select
  to anon, authenticated
  using (true);

-- 書き込みポリシーは service_role のみ（無ければ bypass だが明示）
drop policy if exists "ad_slots_service_role_all" on public.ad_slots;
create policy "ad_slots_service_role_all"
  on public.ad_slots
  for all
  to service_role
  using (true)
  with check (true);

-- 一般ロールから書き込み系を完全剥奪
revoke insert, update, delete, truncate on table public.ad_slots from anon, authenticated;
grant select on table public.ad_slots to anon, authenticated;
-- 残骸権限
revoke references, trigger on table public.ad_slots from anon, authenticated;

-- =============================================================================
-- 3) journeys（activities 相当）
-- SELECT: 公開投稿 OR 本人 OR フォロー中の投稿
-- INSERT/UPDATE: ポリシー上は本人可だが GRANT は service_role のみ（SECURITY.md）
-- =============================================================================
alter table public.journeys enable row level security;

drop policy if exists "journeys_select_public" on public.journeys;
drop policy if exists "journeys_select_own" on public.journeys;
drop policy if exists "journeys_select_followed" on public.journeys;

create policy "journeys_select_public"
  on public.journeys
  for select
  to anon, authenticated
  using (is_public = true);

create policy "journeys_select_own"
  on public.journeys
  for select
  to authenticated
  using (user_slug = public.current_user_slug());

create policy "journeys_select_followed"
  on public.journeys
  for select
  to authenticated
  using (
    exists (
      select 1
      from public.user_follows uf
      where uf.follower_slug = public.current_user_slug()
        and uf.target_slug = journeys.user_slug
    )
  );

-- 本人 INSERT/UPDATE/DELETE ポリシー（GRANT は service_role のみ）
drop policy if exists "journeys_insert_own" on public.journeys;
drop policy if exists "journeys_update_own" on public.journeys;
drop policy if exists "journeys_delete_own" on public.journeys;

create policy "journeys_insert_own"
  on public.journeys
  for insert
  to authenticated
  with check (user_slug = public.current_user_slug());

create policy "journeys_update_own"
  on public.journeys
  for update
  to authenticated
  using (user_slug = public.current_user_slug())
  with check (user_slug = public.current_user_slug());

create policy "journeys_delete_own"
  on public.journeys
  for delete
  to authenticated
  using (user_slug = public.current_user_slug());

-- SECURITY.md: クライアント直書き禁止 → GRANT は SELECT のみ
revoke insert, update, delete, truncate on table public.journeys from anon, authenticated;
grant select on table public.journeys to anon, authenticated;
revoke references, trigger on table public.journeys from anon, authenticated;

-- =============================================================================
-- 4) user_follows（follows 相当）
-- SELECT: 本人が関わるレコードのみ
-- INSERT/DELETE: フォロワー本人のみ
-- =============================================================================
alter table public.user_follows enable row level security;

drop policy if exists "follows_select" on public.user_follows;
drop policy if exists "follows_insert" on public.user_follows;
drop policy if exists "follows_delete" on public.user_follows;
drop policy if exists "user_follows_select_involved" on public.user_follows;
drop policy if exists "user_follows_insert_own" on public.user_follows;
drop policy if exists "user_follows_delete_own" on public.user_follows;

create policy "user_follows_select_involved"
  on public.user_follows
  for select
  to authenticated
  using (
    follower_slug = public.current_user_slug()
    or target_slug = public.current_user_slug()
  );

create policy "user_follows_insert_own"
  on public.user_follows
  for insert
  to authenticated
  with check (follower_slug = public.current_user_slug());

create policy "user_follows_delete_own"
  on public.user_follows
  for delete
  to authenticated
  using (follower_slug = public.current_user_slug());

-- アプリは現状 service_role 経由だが、RLS 定義と揃えて authenticated に最小 GRANT
grant select, insert, delete on table public.user_follows to authenticated;
revoke update, truncate on table public.user_follows from authenticated;
revoke all on table public.user_follows from anon;
grant select, insert, update, delete on table public.user_follows to service_role;
