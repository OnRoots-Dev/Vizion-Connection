---
description: 個人情報（PII）の取り扱い規則。PII該当フィールド・ログ禁止・削除範囲の定義（最重要）
paths:
  - "app/api/account/**"
  - "app/api/contact/**"
  - "app/api/profile/**"
  - "app/api/register/**"
  - "lib/supabase/data/**"
  - "lib/supabase/contacts.ts"
  - "lib/supabase/business-orders.ts"
  - "features/contact/**"
  - "features/profile/**"
---

# PII（個人情報）取り扱い規則

> 強制レイヤー: `.claude/hooks/pii-guard.sh`（PIIのconsole出力・シークレット直書き・.envコミットを機械的にブロック）
> このファイルは「何がPIIか」「何をしてはいけないか」の定義。

## 1. PII該当テーブル・フィールド（実スキーマ準拠 / 2026-07-08時点）

### `public.users` — 会員情報（最重要）
| 区分 | カラム |
|---|---|
| 🔴 機密（クライアント・ログ・APIレスポンスに絶対出さない） | `password_hash`, `reset_token`, `reset_token_expires`, `auth_id` |
| 🟠 PII本体 | `email`, `display_name`, `region`, `prefecture`, `location`, `area` |
| 🟡 準PII（本人が公開設定したものだが集約・突合に注意） | `bio`, `sport`, `instagram`, `x_url`, `tiktok`, `avatar_url`, `profile_image_url`, `banner_url`（顔写真）, `day0_declaration`（自由記述）, `last_login_at` |

- `is_public = false` のユーザーの情報は、いかなる一覧APIにも含めないこと。
- SELECTで `*` を取ってそのままAPIレスポンスに流さない。返却カラムを明示すること（🔴区分の漏出防止）。

### `public.contacts` — 問い合わせ
`name`, `email`, `phone`, `message`（自由記述＝何が書かれているか不明のためPII扱い）

### `public.business_orders` — 決済注文
`email`, `region`, `amount` + `square_link`（取引情報。`.claude/rules/payments.md` も参照）

### `auth.users`（Supabase Auth スキーマ）
email・暗号化パスワード。`supabase.auth.admin` API でのみ操作。

### Storage
アバター・バナー画像（顔写真はPII）。`lib/supabase/storage-cleanup.ts` が削除経路。

## 2. ログ出力禁止（pii-guard.sh が強制）

- `console.*` に `email` / `phone` / `address` / `password` / `token` / 氏名系フィールドを渡さない。
- ユーザー・注文・問い合わせオブジェクトの丸ごと出力（`console.log(user)`, `JSON.stringify(user)`）禁止。
- エラーログの識別子は **`id` または `slug` のみ**を使う（例: `console.error("[saveProfile]", slug, error.code)`）。
- どうしても必要な場合はマスキングする（例: `k***@example.com`、電話は下2桁のみ）。
- Square webhook のペイロード生ログ禁止（payments.md参照）。

## 3. 削除リクエスト対応

### 現状の実装（事実）
`POST /api/account/delete` → `deactivateUser(slug)` は **ソフトデリートのみ**
（`users.is_deleted = true` + `deleted_at` を立てるだけ。email等のPII・auth.users・関連データ・Storage画像は**全て残る**）。

### 本人からの「完全消去」要求（個人情報保護法対応）で消すべき範囲
ソフトデリートでは不十分。以下が対象（実行は必ず人間の承認を得てから。sql-guardが強制的にaskする）:

1. `public.users` — 行削除、または匿名化（email/password_hash/reset_token→NULL、display_name→"退会ユーザー"）
2. `auth.users` — `supabase.auth.admin.deleteUser(auth_id)`
3. 関連テーブル（slug/user_id で紐づく行）: `journeys`, `daily_logs`, `daily_circuits`, `schedules`, `career_profiles`, `notifications`（recipient_slug / actor_slug 両方）, `notification_reads`, `user_follows`, `cheers`, `user_mission_progress`, `user_onetime_mission_rewards`, `discovery_events`, `referrals`, `member_hub_events`, `trainer_clients` / `trainer_sessions` / `trainer_reviews`
4. `contacts` — 本人からの問い合わせ（emailで特定）
5. `business_orders` — 会計法令の保存義務と相談の上で判断（即消しない）
6. Storage — アバター/バナー画像（`storage-cleanup.ts` の経路を使用）
7. 外部: Resend の送信履歴はAnthropic外部サービス側に残る点を本人に説明

### 既知のギャップ（未実装）
完全消去フローは未実装。実装時はこのリストを仕様とすること。
ヒヤリハットは `agent-memory/pii-incidents.md` に追記する。

## 4. その他

- `scripts/cleanup-orphan-users.ts` は破壊的スクリプト。実行は人間の明示承認必須。
- 新しくPIIカラム・テーブルを追加したら、このファイルの表と `.claude/hooks/pii-guard.cjs` / `sql-guard.cjs` の対象リストを同時に更新すること。
