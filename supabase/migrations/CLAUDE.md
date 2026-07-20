# supabase/migrations/ — 注意事項

手順の正: `.claude/skills/db-migration/SKILL.md`。規則の正: `.claude/rules/db-and-rls.md`。

## 鉄則
1. マイグレーションはこのディレクトリ**のみ**。旧 `migrations/`（→ `docs/legacy-migrations/`）には追加禁止。
2. **ファイル作成と `apply_migration` は必ずセット**。ファイルだけ・DB適用だけ、のどちらも禁止。
3. 命名: `YYYYMMDDHHMMSS_snake_case_description.sql`（apply_migration の name と一致させる）。
4. 適用済みファイルは**編集しない**（新しいマイグレーションで修正する）。
5. 破壊的SQLは sql-guard hook が人間確認を強制する。回避しない。

## ⚠️ 既知の履歴乖離（2026-07-08 時点）
本番DBの `schema_migrations` 履歴（18件）とこのディレクトリのファイル（31件）は**一致していない**：
- MCP `apply_migration` 直叩きでファイル化されなかった適用済みマイグレーションが13件（`rls_a/b/c`, `drop_unused_user_columns` 等）
- SQL Editor 適用等で履歴に記録されていないローカルファイルが多数、バージョン番号不一致も数件
- **「正」は実DBスキーマ**。`supabase db push` / `db diff` 等のCLI同期は、ベースライン再構築を行うまで使用しない前提で扱う（protect hook が `db push` を ask、`db reset` を deny にしている）。
