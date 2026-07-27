---
name: db-migration
description: Supabase本番DBへのスキーマ変更手順。マイグレーション作成・適用・検証。破壊的SQLは人間確認必須。DBスキーマ変更、テーブル追加、カラム追加、RLSポリシー変更の際に使用。
---

# DBマイグレーション手順

対象プロジェクト: `qyeapzdwdkqmcsylkdfi`（本番。ステージング環境は無い — 一発本番である自覚を持つこと）

## 手順（順番を守る）

1. **現状確認**: `list_tables` で対象テーブルの現状を確認。RLS関連なら `SECURITY.md` と `.Codex/rules/db-and-rls.md` を先に読む。
2. **ファイル作成**: `supabase/migrations/YYYYMMDDHHMMSS_snake_case.sql` を作成。
   - 冪等に書く（`if not exists` / `if exists`）。
   - 新テーブルは `alter table ... enable row level security;` を必ず含める（ポリシーなし＝deny-allが既定）。
3. **セルフレビュー**: 下の破壊的SQLチェックリストに1つでも該当するか確認。
4. **破壊的SQLを含む場合 — 人間確認必須（省略禁止）**:
   - 該当SQL・影響行数の見積り・ロールバック方法を提示し、**ユーザーの明示的な承認を得てから**次へ進む。
   - sql-guard hook が同じ判定を機械的に行うが、hookに止められる前に自分から確認するのが正。
5. **適用**: `apply_migration`（name = ファイル名のタイムスタンプ+説明）。**ファイル作成と適用は必ずセット** — 片方だけで終わらせない（履歴乖離の再発防止）。
6. **検証**: 変更対象のカタログ確認（information_schema / pg_policies）+ `get_advisors`（security, performance）。
7. **記録**: RLS・PIIに関わる変更なら `SECURITY.md` への追記を提案。ヒヤリハットがあれば `agent-memory/pii-incidents.md` に追記。

## 破壊的SQLチェックリスト（1つでも該当したら手順4へ）

- [ ] `DROP TABLE / SCHEMA / DATABASE / ROLE / POLICY`
- [ ] `TRUNCATE`
- [ ] `WHERE` のない `DELETE` / `UPDATE`
- [ ] `ALTER TABLE ... DROP COLUMN / CONSTRAINT`
- [ ] `users` / `contacts` / `business_orders`（PIIテーブル）への `DELETE` / `UPDATE`
- [ ] 型変更（`ALTER COLUMN ... TYPE` — 暗黙のテーブル書き換え・ロック）
- [ ] RLSポリシー・GRANTの変更

## 禁止（sql-guardがdenyする）

- `anon` / `authenticated` / `public` への書き込みGRANT
- 書き込みコマンドの `USING(true)` / `WITH CHECK(true)` ポリシー

## 既知の注意

- DB履歴とローカルファイルは乖離している（`supabase/migrations/AGENTS.md` 参照）。`supabase db push` / `db reset` は使わない。
- 旧 `migrations/`（`docs/legacy-migrations/`）は参照専用。適用禁止。
