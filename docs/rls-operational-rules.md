# RLS運用ルール

## 概要
Vizion ConnectionプロジェクトにおけるRow Level Security (RLS)の運用ルールを定義。

## 背景
2026年7月20日のRLS設定強化（`20260720120000_rls_profiles_ad_slots_follows_journeys.sql`）により、主要テーブルのクライアント直接書き込みが禁止された。今後のテーブル追加時にもこのセキュリティレベルを維持するためのルール。

## 基本原則

### 1. デフォルト拒否 (Default Deny)
- **anon/authenticatedからの書き込み権限はデフォルトで剥奪**
- 新規テーブル作成時、必ず `revoke insert, update, delete, truncate on table [table_name] from anon, authenticated;` を実行
- 書き込みが必要な場合は、service_role経由のサーバーサイド実装のみを許可

### 2. service_role経由の書き込み
- すべての書き込み操作（INSERT/UPDATE/DELETE）はservice_roleクライアント経由で実行
- クライアント（ブラウザ）からの直接書き込みは禁止
- RPC関数を使用する場合も、anon/authenticatedからの実行権限を剥奪

### 3. RLSポリシーの最小権限原則
- SELECTポリシーは必要最小限に
- 機密列（email, password_hash等）は列レベルのGRANTでSELECT権限を制限
- INSERT/UPDATE/DELETEポリシーは原則作成しない（service_roleのみ許可）

## 運用ルール

### 新規テーブル作成時の必須手順

#### ステップ1: テーブル作成
```sql
create table if not exists public.[table_name] (
  -- カラム定義
);
```

#### ステップ2: RLS有効化
```sql
alter table public.[table_name] enable row level security;
```

#### ステップ3: SELECTポリシー作成（必要な場合のみ）
```sql
-- 公開読み取りが必要な場合
create policy "[table_name]_select_public"
  on public.[table_name]
  for select
  to anon, authenticated
  using ([公開条件]);

-- 本人読み取りが必要な場合
create policy "[table_name]_select_own"
  on public.[table_name]
  for select
  to authenticated
  using ([本人識別条件]);
```

#### ステップ4: 書き込み権限の剥奪（必須）
```sql
-- anon/authenticatedからの書き込み権限を完全剥奪
revoke insert, update, delete, truncate on table public.[table_name] from anon, authenticated;
revoke references, trigger on table public.[table_name] from anon, authenticated;
```

#### ステップ5: 機密列のSELECT権限制限（必要な場合）
```sql
-- 機密列がある場合
revoke select ([機密列名...]) on table public.[table_name] from anon, authenticated;
```

### RPC関数作成時の必須手順

#### ステップ1: 関数作成
```sql
create or replace function public.[function_name](...)
returns [return_type]
language plpgsql
security definer
set search_path = public
as $$
begin
  -- 関数本体
end;
$$;
```

#### ステップ2: 実行権限の制限（必須）
```sql
-- anon/authenticatedからの実行権限を剥奪
revoke execute on function public.[function_name](...) from anon, authenticated;
grant execute on function public.[function_name](...) to service_role;
```

## 既存テーブルのRLS設定状況

### 完全保護（anon書き込み完全剥奪）
- ✅ users (profiles) - `20260720120000_rls_profiles_ad_slots_follows_journeys.sql`
- ✅ ad_slots - `20260720120000_rls_profiles_ad_slots_follows_journeys.sql`
- ✅ journeys - `20260720120000_rls_profiles_ad_slots_follows_journeys.sql`
- ✅ user_follows - `20260720120000_rls_profiles_ad_slots_follows_journeys.sql`
- ✅ discovery_events - `20260406093000_security_and_realtime_setup.sql`
- ✅ ad_events - `20260408093000_business_hub_runtime.sql`
- ✅ business_offers - `20260408093000_business_hub_runtime.sql`
- ✅ member_hub_events - `20260408113000_member_hub_runtime.sql`
- ✅ member_reward_definitions - `20260408113000_member_hub_runtime.sql`
- ✅ member_reward_unlocks - `20260408113000_member_hub_runtime.sql`
- ✅ trainer_clients - `20260408120000_trainer_hub_runtime.sql`
- ✅ trainer_sessions - `20260408120000_trainer_hub_runtime.sql`
- ✅ trainer_reviews - `20260408120000_trainer_hub_runtime.sql`
- ✅ news_post_comments - `20260409100000_news_rooms_comments_media.sql`
- ✅ business_sponsorships - `20260702150000_business_sponsorships.sql`
- ✅ portfolio_milestones - `20260702151000_portfolio_milestones.sql`
- ✅ user_onetime_mission_rewards - `20260406093000_security_and_realtime_setup.sql`

### 要確認（RLS有効化だが書き込み権限の明示的剥奪なし）
- ⚠️ schedules - RLS有効化済みだがINSERT/UPDATE/DELETEポリシーが存在（`20260413170000_schedules.sql`）
- ⚠️ careers - RLS有効化済みだがINSERT/UPDATE/DELETEポリシーが存在（`20260415160000_public_profile_careers_and_fields.sql`）
- ⚠️ ads - RLS有効化済みだがINSERT/UPDATE/DELETEポリシーが存在（`20260411124000_ads_positions_and_admin_policies.sql`）

### 削除済み
- ❌ events - `20260629000000_drop_dead_tables.sql` で削除
- ❌ event_invites - `20260629000000_drop_dead_tables.sql` で削除
- ❌ event_reminders - `20260629000000_drop_dead_tables.sql` で削除
- ❌ careers - `20260629000000_drop_dead_tables.sql` で削除（ただし再作成されている可能性）

## 推奨アクション

### 緊急（P0）
- schedules/careers/adsの書き込み権限を確認し、必要に応じてanon/authenticatedからの剥奪を実施

### 中期（P1）
- CI/CDパイプラインにRLS設定チェックを追加
  - 新規テーブルのRLS有効化チェック
  - anon/authenticatedへの書き込み権限付与の検出
- マイグレーションテンプレートの作成

### 長期（P2）
- Supabaseマイグレーション生成ツールの導入検討
- 自動RLS設定スクリプトの作成

## 参考資料
- `supabase/migrations/20260720120000_rls_profiles_ad_slots_follows_journeys.sql` - RLS設定の参照実装
- `agent-memory/pii-incidents.md` - 過去のセキュリティインシデント
