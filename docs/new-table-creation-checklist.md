# 新規テーブル作成チェックリスト

このチェックリストは、新規テーブルを作成する際にRLS設定が適切に行われていることを確認するためのものです。

## 前提条件
- [ ] テーブルの目的とアクセス要件を明確にする
- [ ] 機密データ（email, password_hash等）を含むか確認する

## テーブル作成

### 1. 基本定義
- [ ] `create table if not exists public.[table_name] (...)` を作成
- [ ] 適切な主キー（uuid primary key default gen_random_uuid()）を設定
- [ ] 外部キー制約を必要に応じて追加
- [ ] CHECK制約を必要に応じて追加
- [ ] インデックスを必要な列に作成

### 2. RLS有効化（必須）
```sql
alter table public.[table_name] enable row level security;
```
- [ ] RLSを有効化

### 3. SELECTポリシー（必要な場合のみ）

#### 公開読み取りが必要な場合
```sql
create policy "[table_name]_select_public"
  on public.[table_name]
  for select
  to anon, authenticated
  using ([公開条件]);
```
- [ ] 公開読み取りポリシーを作成（必要な場合）

#### 本人読み取りが必要な場合
```sql
create policy "[table_name]_select_own"
  on public.[table_name]
  for select
  to authenticated
  using ([本人識別条件]);
```
- [ ] 本人読み取りポリシーを作成（必要な場合）

### 4. 書き込み権限の剥奪（必須）
```sql
revoke insert, update, delete, truncate on table public.[table_name] from anon, authenticated;
revoke references, trigger on table public.[table_name] from anon, authenticated;
```
- [ ] anon/authenticatedからの書き込み権限を完全剥奪
- [ ] ゴミ権限（references, trigger）も剥奪

### 5. 機密列のSELECT権限制限（必要な場合）
```sql
revoke select ([機密列名...]) on table public.[table_name] from anon, authenticated;
```
- [ ] 機密列のSELECT権限を制限（必要な場合）

### 6. マイグレーションファイルの命名規則
- [ ] ファイル名: `YYYYMMDDHHMMSS_[description].sql`
- [ ] 日付はUTCまたはJSTで統一
- [ ] 説明は簡潔かつ具体的に（例: `add_user_preferences_table`）

## RPC関数作成（必要な場合）

### 1. 関数定義
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
- [ ] `security definer` を指定
- [ ] `set search_path = public` を指定
- [ ] 適切な戻り値型を設定

### 2. 実行権限の制限（必須）
```sql
revoke execute on function public.[function_name](...) from anon, authenticated;
grant execute on function public.[function_name](...) to service_role;
```
- [ ] anon/authenticatedからの実行権限を剥奪
- [ ] service_roleにのみ実行権限を付与

## サーバーサイド実装

### 1. サービスロールクライアントの使用
```typescript
import { supabaseServer } from "@/lib/supabase/server";

// 書き込み操作は必ず supabaseServer を使用
const { error } = await supabaseServer.from("[table_name]").insert(...);
```
- [ ] 書き込み操作に `supabaseServer` を使用
- [ ] ブラウザコンポーネントからの直接書き込みを禁止

### 2. APIルートの実装
```typescript
// app/api/[endpoint]/route.ts
import { createClient } from "@/lib/supabase/server";

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  // 認証・認可チェック
  // 書き込み操作
}
```
- [ ] APIルート経由でのみ書き込みを許可
- [ ] 適切な認証・認可チェックを実装

## レビュー項目

### セキュリティ
- [ ] anonからの書き込みが不可能である
- [ ] authenticatedからの書き込みが不可能である（意図的な場合を除く）
- [ ] 機密列が保護されている
- [ ] RPC関数がservice_roleのみ実行可能である

### 機能性
- [ ] SELECTポリシーが適切に設定されている
- [ ] 必要なインデックスが作成されている
- [ ] 外部キー制約が適切に設定されている

### 保守性
- [ ] マイグレーションファイルが適切に命名されている
- [ ] コメントが十分に記述されている
- [ ] ドキュメント（`docs/rls-operational-rules.md`）が更新されている

## 検証

### 手動テスト
- [ ] anonロールでSELECTを試し、適切に制限されているか確認
- [ ] authenticatedロールでSELECTを試し、適切に制限されているか確認
- [ ] anon/authenticatedでINSERT/UPDATE/DELETEを試し、エラーになるか確認
- [ ] service_roleで書き込みが成功することを確認

### 自動テスト（推奨）
- [ ] RLS設定の自動テストを追加
- [ ] 権限チェックの統合テストを追加

## 参考資料
- [RLS運用ルール](./rls-operational-rules.md)
- [過去のセキュリティインシデント](../agent-memory/pii-incidents.md)
- [RLS設定の参照実装](../supabase/migrations/20260720120000_rls_profiles_ad_slots_follows_journeys.sql)
