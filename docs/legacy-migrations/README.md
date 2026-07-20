# legacy-migrations — 適用禁止・参照用

旧 `migrations/`（ルート直下）のアーカイブ。**このディレクトリのSQLを本番DBに適用してはならない。**
現行のマイグレーション置き場は `supabase/migrations/` のみ（規則: `.claude/rules/db-and-rls.md`）。

## 各ファイルの状態（2026-07-08 本番DB実カタログ照会に基づく）

| ファイル | 状態 |
|---|---|
| `20260402_notifications.sql` | ✅ 反映済み（テーブル・関数・インデックス全て本番に存在） |
| `20260403_daily_missions.sql` | ✅ 反映済み（シードデータ含め稼働中） |
| `20260403_daily_logs.sql` | ♻️ 上位互換で置換済み（正規の `create_daily_logs_table` 2026-06-28 が現行） |
| `20260403_daily_logs_user_id_fix.sql` | ♻️ 同上 |
| `20260402_users_region_required.sql` | ❌ 未反映・廃止（region必須化はコード側にも痕跡なし。復活させるなら新規マイグレーション＋UI変更として起票） |
| `20260403_business_plan_activation.sql` | ❌ 未反映・廃止設計（`users.plan` free/paid は sponsor_plan 体系に置換され、コード参照ゼロ） |
| `20260404_news_media_and_views.sql` | ❌ 未反映・廃止設計（news_rooms シリーズ 2026-04-09 で別設計に置換、コード参照ゼロ） |
