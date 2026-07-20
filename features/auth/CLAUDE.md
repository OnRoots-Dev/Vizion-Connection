# features/auth/ — 注意事項

認証の中核。変更前に `.claude/rules/auth.md` を必ず読むこと。

- `server/register.ts` — ユーザー作成（service roleでの `users` INSERT + Supabase Auth）。slug重複・referrer処理を含む
- `server/login.ts` — 認証とセッション確立
- `server/complete-verification.ts` — メール確認完了処理
- `validation/` — Zodスキーマが入力仕様の正。**UIとDB制約を変えるならここも同時に変える**

## 特に注意
1. `password_hash` / `reset_token` はログ・レスポンス・クライアントに出さない。
2. 認証フローの変更は register → verify → login → onboarding(day0) の連鎖を壊しやすい。変更時は必ず新規登録の一連の流れを検証する。
3. ロール追加・変更は `types.ts` の union、`validation/register-schema.ts` の `VALID_ROLES`、DBのCHECK制約（`allow_crew_role_in_users` 参照）の3点セット。
4. レートリミット・CSRF・body検証は呼び出し側APIルートの責務（3点セット必須）。Server Action側で省略されている前提を作らない。
