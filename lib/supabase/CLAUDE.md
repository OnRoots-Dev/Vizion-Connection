# lib/supabase/ — 注意事項

## ⚠️ `server.ts` は service role キーの唯一の入口

- `SUPABASE_SERVICE_ROLE_KEY` を読むのはこのディレクトリの `server.ts` **だけ**。他の場所で読まない・importで持ち出さない。
- service role は **GRANT も RLS も全てバイパスする**。`supabaseServer` を使うコードは、認可チェック（セッション確認・所有権確認）を自分で行う責任を負う。
- `server.ts` はブラウザ到達時にモジュールロードで throw する防御を持つ。この防御を外さない。
- キー自体のログ出力・エラーメッセージへの混入禁止。

## クライアント4種の使い分け（間違えると事故）

| ファイル / export | 使う場所 | 権限 |
|---|---|---|
| `server.ts` → `supabaseServer` | Server Action / APIルート | service role（RLSバイパス） |
| `server.ts` → `createClient()` | Server Component / Server Action | ユーザーセッション（RLS適用） |
| `client.ts` → `createClient()` | Client Component（Cookie 認証） | anonキー + 共有 Cookie |
| `browser.ts` → `supabaseBrowser` | Client Component（RLS 読み取り等） | anonキー（セッション非永続） |
| `middleware-client.ts` | middleware.ts | SSRセッション更新 |
| `cookie-options.ts` | 上記の Cookie 設定の単一ソース | Domain=.vizion-connection.jp 等 |

## クロスサブドメイン Cookie（本番）

- `vizion-connection.jp`（登録・認証）と `app.vizion-connection.jp`（アプリ）でセッションを共有する。
- 設定は `cookie-options.ts` のみを編集する（`domain: .vizion-connection.jp`, `sameSite: none`, `secure: true`）。
- server / middleware / browser SSR クライアントの3箇所で同じ `getAuthCookieOptions()` を使うこと。1箇所でも domain が欠けると host-only Cookie が混在してログインが切れる。

- **クライアント（browser.ts）から `users`/`journeys`/`career_profiles`/`ads` への書き込みは恒久的に禁止**（SECURITY.md / `.claude/rules/db-and-rls.md`）。
- データアクセスヘルパーはドメイン別（`career-profiles.ts`, `follows.ts`, `contacts.ts` 等）。新規アクセスは既存ヘルパーに追加し、ルートハンドラに生クエリを書かない。

## PII注意
`data/users.server.ts`（`password_hash`/`reset_token` を含む全カラム）, `contacts.ts`, `business-orders.ts` を触る前に `.claude/rules/pii-handling.md` を読むこと。SELECTは返却カラムを明示し、`*` をAPIレスポンスへ直流ししない。
