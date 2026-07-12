---
description: 認証・セッション・アカウント操作を触る時の規則
paths:
  - "features/auth/**"
  - "lib/auth/**"
  - "app/(auth)/**"
  - "app/api/auth/**"
  - "app/api/login/**"
  - "app/api/logout/**"
  - "app/api/register/**"
  - "app/api/account/**"
  - "middleware.ts"
---

# 認証関連の規則

## 構成
- `features/auth/server/` — register / login / complete-verification のServer Action
- `features/auth/validation/` — Zodスキーマ（`registerSchema` / `loginSchema`）
- `lib/auth/session.ts` — `getSupabaseProfile()`（cookieベースのセッション→usersプロフィール解決）
- `lib/auth/require-*-session.ts` — ロール別ガード（admin / athlete / business / member / trainer）+ `voicelab-admin.ts`
- `middleware.ts` — ルート保護

## 鉄則
1. **mutating APIルートは必ず3点セット**: `validateCSRF(req)` → レートリミッター（`lib/ratelimit.ts` の該当limiter）→ `lib/security/body.ts` でのbody検証。既存の `app/api/account/delete/route.ts` が参考実装。
2. ロール制限が必要なルートでは対応する `require-*-session.ts` を使う。自前でrole判定を書かない。
3. `password_hash` / `reset_token` は取得・返却・ログ出力禁止（`.claude/rules/pii-handling.md`）。パスワード検証・リセットは既存の server/ 実装経由のみ。
4. 認可判定に `user.id` と `user.slug` を混同しない（Airtable移行時の既知バグ源。`MIGRATION_ANALYSIS_REPORT.md`）。所有権チェックのSQL側の正は `auth.uid() = users.auth_id` または `auth.email() = users.email`。
5. リダイレクト先やslugをユーザー入力から組み立てる時は `registerSchema` のslug規則（`^[a-z0-9_.]+$`）を通す。
6. セッションcookieの読み取りはServer Componentなら `lib/supabase/server.ts` の `createClient()`、ミドルウェアなら `middleware-client.ts`。service role（`supabaseServer`）をセッション判定に使わない。

## バリデーション仕様（現状）
- `registerSchema`: email必須 / password 8〜100字（英数記号）/ role は Athlete|Trainer|Crew|Business / **region は任意** / slug 3〜30字 `^[a-z0-9_.]+$` / 利用規約同意必須
- 変更時は register UI・onboarding・DB制約の三者を同期させること
