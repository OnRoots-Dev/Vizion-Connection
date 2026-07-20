# PII関連ヒヤリハット・注意点の蓄積

> 個人情報・認証・決済まわりで「危なかった」「後から発覚した」事象を時系列で追記する。
> 新しい事象は末尾に `## YYYY-MM-DD タイトル` 形式で追加。解決済みでも消さない（再発防止の記憶）。

## 2026-06-20 RLS監査で本番の権限過剰が発覚（Critical含む5件）

- `users` がanonから自己UPDATE可能で `role=Admin` への昇格・`points` 改ざんが実際に再現した（Critical）。
- `journeys` の他人の行の改ざん、`schedules` の非公開行の読み取り漏れ、`career_profiles` の全行公開読み取りも再現。
- 3本のマイグレーション（`rls_a/b/c`）で修正・検証済み。詳細とロールバックSQLは `SECURITY.md`。
- **教訓**: 「クライアントから書ければ楽」で作った初期ポリシーは全て権限過剰だった。書き込みはservice role経由が恒久ルール（`.claude/rules/db-and-rls.md`）。

## 2026-07-08 MCPアクセストークンが設定ファイルに平文直書きだった

- Supabase MCP のアクセストークン（`sbp_...`）が `~/.claude.json` のローカルスコープ定義にCLI引数として平文保存されていた。project-refスコープ制限も無く、トークン単体で全プロジェクト操作が可能な状態だった。
- 対応: `.mcp.json`（`${SUPABASE_ACCESS_TOKEN}` 参照 + `--project-ref` 固定）に移行。シークレット直書きは pii-guard hook が検知するようにした。
- **教訓**: 「ローカルだから安全」ではない。設定ファイルのシークレットは全て `${ENV_VAR}` 参照。

## 2026-07-08 アカウント「削除」がソフトデリートのみと明文化されていなかった

- `POST /api/account/delete` は `is_deleted` フラグを立てるだけで、email・password_hash・関連データ・Storage画像は全て残る。完全消去フローは未実装。
- 本人から法令ベースの消去請求が来た場合の削除範囲を `.claude/rules/pii-handling.md` §3 に定義した。実装時はそれを仕様とする。
- **教訓**: 「削除」という言葉の実装上の意味（ソフト/ハード）を常に明示する。

## （移行期の既知バグ）`user.id` と `user.slug` の混同

- Airtable→Supabase移行で、`user.slug` を要求するルートに `user.id` を渡す箇所が複数あった（`MIGRATION_ANALYSIS_REPORT.md`）。
- 認可・所有権チェックでこの混同が起きると**他人のデータへのアクセス**になり得る。SQL側の正: `auth.uid() = users.auth_id` または `auth.email() = users.email`（`auth.uid()::text = slug` は壊れたパターン）。
