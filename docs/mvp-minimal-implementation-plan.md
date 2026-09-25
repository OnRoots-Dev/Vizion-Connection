# Vizion Connection MVP 最小実装計画

調査日: 2026-09-25  
方針: 既存の Next.js / Supabase 機能を再利用し、不足部分だけ補う。既存画面やルートの大改修はしない。

## 現状とDB変更の事前報告

| 項目 | 現状 | 最小対応 |
|---|---|---|
| Vizion ID / 創設枠 | `users.slug` が公開ID。`serial_id` / `seq` と `founding_number` の読み取り、`is_founding_member` 判定、`referrer_slug` 保存を既存実装で確認 | 創設番号を登録時に確実に採番・保存しているか確認し、既存列で可能ならアプリのみ修正。既存DB列なしの場合だけ差分候補を報告 |
| BASE | `/dashboard` と Timeline/Activities/Moments 等が存在 | BASE内の入口/Activity・Camp・Moment Log雛形を最小調整 |
| Activity | CRUD・status `planned/completed/cancelled`・type・場所あり | UIで「予定/開催中/完了」と「告知型/募集型」を表現。開催中/告知区分の保存先は現スキーマに見当たらず、既存列での表現可否を確認 |
| Map | Viz Map/APIあり | 既存ピン表示に Activity作成導線を接続 |
| Join Stamp | referral OG画像/APIとQR依存あり | 既存生成機能を登録直後導線で再利用 |
| 招待追跡 | 登録時に `referrer_slug` を保存。referral click routeあり | 紹介元→登録者の結びつけは既存列を再利用し、Join Stamp表示のみ確認 |
| Business | business hub、スポンサー/広告管理あり | 既存申込フォームと掲載状態を案内する簡易ページに集約 |
| Cheer/Comment | Activity Cheer toggle・Comment APIあり | Commentを編集可能な1ユーザー1Activity1コメントに整合。キーワード検査を追加 |
| Connection | pending→accepted の相互承認前提で実装済み | MVPでは作成直後 `accepted` とし、画面名を Connection に統一。後日承認導入時に戻せるようAPI境界を維持 |

### スキーマ変更判断

実DBが正本であり、ローカルmigrationだけでは列・制約の有無を断定できない。番号と告知/募集区分の既存格納先がない場合は追加が必要。コメントは既存行重複を確認してから unique index が必要。これらは DBスキーマ変更に当たるため、実DBのread-only確認を先行し、変更候補を確定してから実施する。migration作成と適用はセットのため、適用手段がない場合は未適用migrationを残さず、実装を保留して差分を報告する。

## ファイル単位タスク（優先順）

1. **調査・ID** — `features/auth/server/register.ts`, `lib/supabase/data/users.server.ts`, `features/auth/types.ts`, `app/api/register/route.ts`, `app/api/referral/clicks/route.ts`, `lib/supabase/referrals.ts`: Vizion IDと創設番号の採番・紹介者永続化の現状を監査。必要なDB差分を確定。
2. **BASE** — `app/(app)/dashboard/views/HomeView.tsx`, `app/(app)/dashboard/DashboardClient.tsx`, `app/(app)/dashboard/views/ActivitiesView.tsx`: 個人管理の Activity/Camp/Moment Log入口と雛形を既存情報設計に合わせる。
3. **Activity/Map** — `features/activity/types.ts`, `features/activity/validation.ts`, `features/activity/server/activities.ts`, `app/api/activities/route.ts`, `app/(app)/dashboard/views/ActivitiesView.tsx`, `app/(app)/dashboard/views/VizMapView.tsx`: 状態・告知/募集区分の選択とピン表示をつなぐ。必要なら該当DB列を追加。
4. **Join Stamp/紹介** — `app/api/og/referral/route.tsx`, `app/(auth)/thanks/ThanksClient.tsx`, `app/(auth)/register/RegisterForm.tsx`, `lib/supabase/referrals.ts`: 既存招待コード/リンク・画像生成を登録直後に表示し、紹介元→登録者を記録。
5. **Business** — `app/(marketing)/business/page.tsx`, `app/(app)/dashboard/views/BusinessView.tsx`, `app/(app)/dashboard/business-hub/BusinessHubClient.tsx`: 既存協賛/広告申込導線と掲載状態を簡潔に提示。
6. **Cheer/Comment moderation** — `app/api/activities/[id]/comments/route.ts`, `app/api/activities/[id]/comments/[commentId]/route.ts`, `features/activity/server/activities.ts`, 詳細UI該当コンポーネント: 1人1件の編集、ブロック語チェック、本人向けエラー通知。外部APIなしの正規表現/語句リストを初期実装。
7. **Connection** — `features/connection/server/connections.ts`, `app/api/connections/route.ts`, `app/api/connections/[id]/route.ts`, `app/(app)/dashboard/components/core/ConnectionButton.tsx`, `app/u/[slug]/ConnectionButtonClient.tsx`: 一方向即時成立、表示名を Connection に統一。
8. **共通確認** — 変更ファイルの型整合・差分レビュー。必要なら `npm run build` / `npm run lint` を実施し結果を記録。

## 並行割当て用の境界

- **Big Pickle**: 優先1・4（登録/Vizion ID/Join Stamp/紹介追跡）。DB差分の実適用は現行スキーマ確認後のみ。
- **Muse Spark**: 優先2・3・5（BASE/Activity/Map/Business表示）。スキーマ変更を伴う場合は候補SQLを報告し、適用しない。
- **統合担当**: 優先6・7（コメント制約・モデレーション・Connection即時成立）、全体接続と検証。

## 初回実装で着手する範囲

実DB参照・migration適用経路の有無を確認し、既存スキーマ内で完結する改修から進める。DB変更が必要な部分は差分を先に報告する。
