---
description: DB・RLS・マイグレーションの規則（SECURITY.mdの恒久ルールを含む）
paths:
  - "supabase/**"
  - "lib/supabase/**"
  - "migrations/**"
---

# DB / RLS / マイグレーション規則

> 強制レイヤー: `.claude/hooks/sql-guard.sh`（禁止SQLのdeny・破壊的SQLの人間確認を機械的に強制）
> 手順: `.claude/skills/db-migration/SKILL.md`

## RLS恒久ルール（SECURITY.md より — 変更禁止）
- `anon` / `authenticated` は `users` / `journeys` / `career_profiles` / `ads` に対して **SELECTのみ**。
- **書き込みは全て service role のサーバールート経由**（`lib/supabase/server.ts` → `supabaseServer`）。
- 禁止事項:
  - クライアント直書き（`supabaseBrowser` の INSERT/UPDATE/DELETE）を上記テーブルに復活させない
  - `USING (true)` / `WITH CHECK (true)` の全開ポリシーを public/anon/authenticated の書き込みコマンドに作らない
  - `auth.uid()::text = slug` のような壊れた所有権チェックを書かない。正: `auth.uid() = users.auth_id` または `auth.email() = users.email`
- クライアント書き込みがどうしても必要なら: 列スコープ付きの厳格なRLSポリシー、または `SECURITY DEFINER` RPC。
- 監査履歴・ロールバックSQLは `SECURITY.md` を参照（2026-06-20 RLS監査で Critical 1件含む5件を修正済み）。

## マイグレーション規則
1. 置き場は **`supabase/migrations/` のみ**。ルートの `migrations/`（→ `docs/legacy-migrations/` にアーカイブ済み）には追加禁止。
2. **ファイル作成と `apply_migration` は必ずセット**で行う。どちらか片方だけを行わない。
   - 経緯: 2026-07時点で、DBの `schema_migrations` 履歴（18件）とローカルファイル（31件）は**大きく乖離している**（MCP直叩きでファイル化されなかったもの、SQL Editor適用で履歴未記録のもの、バージョン番号不一致が混在）。「正」は実DBスキーマ。`supabase db push` 等のCLI同期は現状では使えない前提で扱うこと。
3. 命名: `YYYYMMDDHHMMSS_snake_case_description.sql`
4. 破壊的SQL（DROP / TRUNCATE / WHEREなしDELETE・UPDATE / DROP COLUMN / PIIテーブルへのDELETE・UPDATE）は sql-guard が強制的に人間確認へ回す。回避しない。
5. 新テーブルはRLS有効＋ポリシーなし（deny-all）で作り、アクセスはservice role経由が既定。クライアント読み取りが必要な場合のみSELECTポリシーを追加。
6. 適用後は `get_advisors`（security / performance）を確認。

## Supabaseクライアントの使い分け（詳細は lib/supabase/CLAUDE.md）
| 用途 | クライアント |
|---|---|
| Server Action / APIルート（RLSバイパス） | `lib/supabase/server.ts` → `supabaseServer` |
| Server Component（ユーザー文脈・RLS適用） | `lib/supabase/server.ts` → `createClient()` |
| Client Component | `lib/supabase/browser.ts` → `supabaseBrowser` |
| ミドルウェア | `lib/supabase/middleware-client.ts` |
