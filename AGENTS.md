# AGENTS.md

**Vizion Connection**（vizion-connection.jp）— アスリート・トレーナー・クルー・企業をつなぐ日本のスポーツプラットフォーム。
Next.js 16 App Router / React 19 / TypeScript / Tailwind v4 / Supabase。個人開発・単一リポジトリ・**顧客の個人情報を扱う本番SaaS**。

## コマンド

```bash
npm run dev       # devサーバー (localhost:3000)
npm run build     # 本番ビルド
npm run lint      # ESLint
npx tsc --noEmit  # 型チェック（テストスイートは無い）
```

## 鉄則（違反はhooksが機械的にブロックする）

1. **RLS**: `anon`/`authenticated` は `users`/`journeys`/`career_profiles`/`ads` にSELECTのみ。書き込みは全て service role のサーバールート経由。全開ポリシー（`USING(true)`）禁止。
2. **service role キー**はブラウザに出さない。入口は `lib/supabase/server.ts` のみ。
3. **mutating APIルートは3点セット必須**: `validateCSRF` + レートリミット + body検証。
4. **PIIをログに出さない**: email/phone/氏名/token/`console.log(user)` 丸ごと出力は禁止。識別子は id/slug のみ。
5. **破壊的SQL**（DROP/TRUNCATE/WHEREなしDELETE・UPDATE/PIIテーブル変更）は人間の承認必須。
6. **シークレットの直書き禁止**: 設定ファイルは `${ENV_VAR}` 参照。`.env*` はコミット・削除・上書きしない。
7. マイグレーションは `supabase/migrations/` のみ。**ファイル作成と `apply_migration` は必ずセット**。
8. `user.id` と `user.slug` を混同しない（移行期の既知バグ源）。
9. アカウント「削除」はソフトデリート（`is_deleted`）。完全消去は `.Codex/rules/pii-handling.md` の範囲定義に従う。
10. 破壊的なシェル操作（`rm -rf`、`.env`削除、`git clean -x` 等）はhooksがブロックする。回避しない。

## 作業前に読むルール（対象パスを触る時は必読）

| 触るパス | 読むファイル |
|---|---|
| `features/auth/`, `lib/auth/`, `app/api/account/`, `middleware.ts` | `.Codex/rules/auth.md` |
| PII関連（`app/api/{account,contact,profile,register}/`, `lib/supabase/data/`, `contacts.ts`, `business-orders.ts`） | `.Codex/rules/pii-handling.md` |
| `supabase/`, `lib/supabase/`, SQL全般 | `.Codex/rules/db-and-rls.md` |
| 決済（`app/api/business-checkout/`, `app/api/webhooks/`, `features/business/`） | `.Codex/rules/payments.md` |
| UI（`app/`, `components/`） | `.Codex/rules/frontend.md` |
| DBマイグレーション作業 | `.Codex/skills/db-migration/SKILL.md` |
| デプロイ | `.Codex/skills/deploy/SKILL.md` |

危険地帯ディレクトリには個別の `AGENTS.md` がある（`features/auth/`, `app/api/`, `lib/supabase/`, `supabase/migrations/`）。
PII関連のヒヤリハットは `agent-memory/pii-incidents.md` に追記・参照。

## アーキテクチャ（要点のみ）

- ルートグループ: `app/(app)/`（認証済みシェル: dashboard/pulse/timeline）, `app/(auth)/`, `app/(marketing)/`, `app/(onboarding)/`（day0→profile→discovery→journey→invite→cheer）, `app/api/`, 公開プロフィール `app/p/[slug]` `app/u/[slug]` `app/r/[slug]`
- `/dashboard` は**URLを変えないSPA**（詳細: `.Codex/rules/frontend.md`）
- 機能ロジックは `features/<name>/{server,types.ts,validation}`。`lib/` は横断ヘルパー
- Supabaseクライアントは4種を使い分け（**必読**: `lib/supabase/AGENTS.md`）
- ロール: `Athlete | Trainer | Crew | Business | Admin`（`features/auth/types.ts`）
- スポンサープラン: `roots | signal | presence | legacy`

## 環境変数（`lib/env.ts`）

必須: `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `RESEND_API_KEY`, `UPSTASH_REDIS_REST_URL`, `UPSTASH_REDIS_REST_TOKEN`, `NEXT_PUBLIC_BASE_URL`
任意: `FROM_EMAIL`, `VOICELAB_ADMIN_EMAILS`, `SQUARE_LINK_*`, `SQUARE_WEBHOOK_SIGNATURE_KEY`
MCP用（gitファイルに値を書かない）: `SUPABASE_ACCESS_TOKEN`（`.mcp.json` が参照）

## 経緯メモ

- 2026年前半に Airtable → Supabase 移行済み。移行メモは `docs/archive/MIGRATION_ANALYSIS_REPORT.md`。
- RLS監査（2026-06-20）の記録とロールバックSQLは `SECURITY.md`。
- 旧 `migrations/`（ルート直下）は `docs/legacy-migrations/` にアーカイブ済み。追加禁止。

## Product specification and local skills

Before product work, read [00_MASTER_SPEC.md](00_MASTER_SPEC.md), then the relevant numbered specification and `.skills/<area>/SKILL.md`.

- **Existing first / Reuse first**: search existing routes, components, feature services, and migrations before adding anything.
- **No duplicate responsibility**: extend an existing canonical model or API only when its responsibility matches; otherwise document the boundary first.
- **Spec first**: Current, MVP, Planned, Future, and Deprecated must never be conflated.
- **Production DB first**: production Supabase is the schema authority. Migration files are historical evidence, not proof of live state; verify read-only before any schema work.
- **Minimal change and verification**: preserve existing behavior; after changes run the relevant TypeScript, lint, test, and `git diff` checks.
- **Security is non-optional**: apply authentication, authorization, RLS, CSRF, body validation, and rate limiting to every mutable surface.
