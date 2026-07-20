# app/api/ — 注意事項

## 全mutatingルート共通の必須3点セット

```ts
const csrfError = validateCSRF(req);            // lib/security/csrf.ts
if (csrfError) return csrfError;
const { success } = await xxxLimiter.limit(getIp(req));  // lib/ratelimit.ts
if (!success) return NextResponse.json({...}, { status: 429 });
const body = await parseBody(req, schema);      // lib/security/body.ts + Zod
```

参考実装: `account/delete/route.ts`。新規ルートでこの3つを省略しない。

## PIIホットゾーン（変更前に `.claude/rules/pii-handling.md` 必読）

| ルート | 扱うPII |
|---|---|
| `account/*`（change-email / change-password / delete / reset-password） | email・パスワード・アカウント削除（※ソフトデリート） |
| `contact/` | 氏名・email・電話番号 |
| `register/`, `profile/` | 会員PII全般・画像アップロード |
| `business-checkout/`, `webhooks/square/` | 決済（`.claude/rules/payments.md` 必読） |
| `admin/`, `voicelab/` | 管理者権限（`require-admin-session` / `voicelab-admin` 必須） |

## その他
- レスポンスに `users` の行を返す時は返却カラムを明示（`password_hash`/`reset_token`/`auth_id` の漏出防止）。
- エラーログにPIIを書かない（id/slugのみ）。
- 認可は `lib/auth/require-*-session.ts` を使う。自前role判定を書かない。
