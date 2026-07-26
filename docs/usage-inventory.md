# 利用実態インベントリ / 未使用候補

静的解析（import・`fetch("/api/…")`・`.from("table")`）に基づくスナップショット。  
**実行時の到達保証はない**（条件分岐・ロール制限で未到達の経路あり）。削除前は必ず人間確認。

**調査日**: 2026-07-22  
**クリーンアップ実施**: 2026-07-22（airtable 削除・死ファイル削除・`src/` → `lib/ads/`・監査レポートを `docs/archive/` へ）

---

## 1. 実際に使われているもの

### 1.1 アプリの骨格（生きている）

| 領域 | パス | 用途 |
|---|---|---|
| ルート保護 | `middleware.ts` | 認証・リダイレクト |
| 認証後 SPA | `app/(app)/dashboard/**` | ダッシュボード中核 |
| 独立ページ | `app/(app)/pulse`, `timeline` | Pulse / Timeline |
| 認証 UI | `app/(auth)/**` | login / register / reset / thanks |
| マーケ | `app/(marketing)/**` | LP / business |
| オンボ | `app/(onboarding)/**` | day0〜 |
| 公開プロフィール | `app/u/[slug]/**` | プロフィール・portfolio |
| その他公開 | `app/discovery`, `ranking`, `schedule`, `news`, `voicelab`, `card`, `p`, `r`, `contact`, `company` | |
| ドメイン | `features/**` | auth / business / profile / discovery 等 |
| 横断 | `lib/**`（下記の死ファイル除く） | supabase / auth / design / security |
| DB マイグレーション | `supabase/migrations/**` | スキーマ正本 |
| 静的資産 | `public/**` | images / fonts / lottie |

### 1.2 使用中の API（クライアント or サーバーから参照確認）

| グループ | エンドポイント例 | 主な呼び出し元 |
|---|---|---|
| **Auth** | `/api/login`, `/api/logout`, `/api/register`, `/api/register/resend` | LoginForm / RegisterForm |
| | `/api/auth/confirm/complete` | ThanksClient |
| | `/api/account/reset-password/*` | ResetPasswordForm |
| | `/api/account/change-email`, `change-password`, `delete` | SettingsClient |
| **Profile / Career** | `/api/profile/save`, `save/me`, `upload`, `visibility`, `public/[slug]` | UnifiedProfile / wizard / public |
| | `/api/career-profile`, `/api/career/me` | career wizard / dashboard |
| **Social** | `/api/bond`, `/api/collect`, `/api/cheer*` | 公開プロフィール・Timeline |
| | `/api/instand` | Timeline（user_follows 別名） |
| **Journey / Log** | `/api/journey/*`, `/api/daily-log`, `/api/daily-circuit` | MyJourney / DailyLog / Timeline |
| | `/api/pulse/score` | PulseClient |
| **Missions** | `/api/missions`, `/api/missions/progress` | MissionsView / DiscoveryView |
| **Discovery / Ads** | `/api/discovery`, `/api/discovery/track` | DiscoveryView |
| | `/api/ads`, `/api/ads/events` | NewsRooms / AdCard / CheerView |
| **Business** | `/api/business-checkout`, `complete` | marketing / checkout |
| | `/api/business/region-availability` | business 残枠 |
| | `/api/business-hub/*` | BusinessView / BusinessHubClient |
| | `/api/webhooks/square` | Square（外部） |
| | `/api/sponsorships/[slug]` | 公開スポンサー表示 |
| **Hubs** | `/api/athlete-hub/stats` | AthleteHubView |
| | `/api/member-hub/*` | MemberHub / ReferralView |
| | `/api/trainer-hub/*` | TrainerHubView |
| | `/api/offers/received/*` | OffersView |
| **News / VoiceLab** | `/api/news/*`, `/api/voicelab/*` | news / voicelab UI |
| **Admin** | `/api/admin/ads`, `/api/admin/posts*` | Admin views |
| **Schedules** | `/api/schedules*` | ScheduleClient |
| **Notify / Share / OG** | `/api/notifications*`, `/api/share/*`, `/api/share-image`, `/api/og/*` | Dashboard / Share / card |
| **Other** | `/api/contact`, `/api/onboarding/*`, `/api/referral/clicks`, `/api/portfolio/.../milestones` | 各画面 |

> `app/auth/confirm/route.ts` は App Router のメール確認コールバック（`/auth/confirm`）。

### 1.3 使用中の DB テーブル（コード上 `.from("…")` あり）

| テーブル | 主な用途 |
|---|---|
| `users` | 会員・プロフィール・ロール・sponsor_plan |
| `journeys` | 日次記録・Pulse・Timeline |
| `user_follows` | Bond / フォロー（instand API） |
| `cheers` | Cheer |
| `schedules` | スケジュール |
| `daily_logs` / `daily_circuits` | ログ・サーキット |
| `career_profiles` | キャリア |
| `ads` / `ad_events` / `ad_slots` | 広告・在庫 |
| `business_orders` / `business_sponsorships` / `business_offers` | 決済・スポンサー |
| `news_posts` / `news_post_comments` | ニュース |
| `openlab_posts` / `openlab_upvotes` | VoiceLab |
| `mission_definitions` / `user_mission_progress` / `user_onetime_mission_rewards` | ミッション |
| `notifications` / `notification_reads` | 通知 |
| `card_collections` | Collect |
| `contacts` | 問い合わせ |
| `discovery_events` | Discovery 計測 |
| `referrals` | 紹介 |
| `portfolio_milestones` | マイルストーン |
| `trainer_clients` / `trainer_sessions` / `trainer_reviews` | Trainer Hub |
| `member_hub_events` / `member_reward_*` | Member Hub |
| Storage `profiles` | アバター等 |

**既に DROP 済み**（`20260629000000_drop_dead_tables.sql`）:  
`verify_tokens`, `events`, `event_invites`, `event_reminders`, `careers`

### 1.4 使用中の npm 主要依存

Next / React / Supabase / Framer Motion / Tailwind / Zod / Upstash / Resend / FullCalendar / Radix・shadcn / Zustand / Lottie / QR 等 — **本番経路から import あり**。

### 1.5 広告モジュール（旧 `src/` → 移行済み）

| ファイル | 用途 |
|---|---|
| `lib/ads/get-ads.ts` + `index.ts` | `getAdsForUser`（`@/lib/ads`） |
| `lib/ads/adSlots.ts` | 枠・ティア設定 |
| `lib/ads/adSlotUtils.ts` | フィード注入 |
| `lib/ads-shared.ts` | `AdItem` / `isLocalPlan` |

---

## 2. 不要となり得るもの（優先度付き）

### ✅ 2026-07-22 実施済み

| 対象 | 結果 |
|---|---|
| `airtable` / `@types/airtable` | `npm uninstall` 済み |
| `lib/supabase/client.ts`, `lib/db/*`, `ShinyText`, ルート `components/ui.tsx` | 削除済み |
| 空 API スタブ（athlete-hub events/summary/offers, missions/complete, auth/clear） | 削除済み |
| `src/**` → `lib/ads/*` | 移行・`src/` 削除済み |
| 監査レポート | `docs/archive/` へ移動済み |

### 🟡 残タスク（任意）

| 対象 | 根拠 | 推奨 |
|---|---|---|
| **dashboard Primary/Secondary/DangerButton** | ギャラリー中心 | 必要なら残す / 未使用なら削除 |
| **`email-worker/`** | 本アプリから import なし | デプロイ中なら保持 |
| **`tools/lottie-player/`** | ビルド非依存 | ignore / 分離を検討 |
| **重複 onboarding マイグレーション** | 2 ファイル同日付 | 実DBと突合 |
| **`app/api/missions/route.ts` コメント誤記** | complete と書いてある | 修正のみ |
| **`motion` + `framer-motion` 二重** | 要利用確認 | 即削除は非推奨 |
| **Monorepo / features 集約** | 提案のみ | 未実施 |

---

## 3. DB・API の「あるが薄い」領域

実装はあるが、プロダクト上の利用密度が低い / 特定ロール専用:

| 領域 | 備考 |
|---|---|
| Trainer Hub API + テーブル | Trainer ロール向け。利用者少なければ「薄い」が死コードではない |
| Member Hub | 同上 |
| Athlete Hub | **stats のみ**実装。events/summary/offers は空フォルダ |
| VoiceLab / OpenLab | 管理画面 + 公開 voicelab |
| Admin ads/posts | Admin 専用で使用中 |

---

## 4. 推奨アクション（安全順）

1. **即時可**: `airtable` / `@types/airtable` を dependencies から削除  
2. **確認後削除**:  
   - `lib/supabase/client.ts`  
   - `lib/db/getDashboardData.ts`（中身が空/未参照なら）  
   - `components/ShinyText.tsx`  
   - `components/ui.tsx`（ルート）  
   - 空の `app/api/**` ディレクトリ  
3. **リファクタ（任意）**: `src/*` を `lib/ads/` へ移動し News の import 更新  
4. **触らない**: `supabase/migrations` 履歴、`docs/legacy-migrations`、本番で動いている Hub/Admin API  
5. **DB DROP**: コード参照ゼロでも **人間承認必須**（sql-guard / CLAUDE 鉄則）

---

## 5. 調査方法（再現）

```text
# API 一覧
app/api/**/route.ts

# フロントからの API 呼び出し
fetch("/api/…")  /  `/api/…`

# テーブル参照
.from("table_name")

# パッケージ残骸
import airtable  → 0 件
```

自動化（knip / ts-prune / depcheck）は未導入。導入すると未使用 export の精度が上がる。

---

## 6. 関連ドキュメント

- `docs/project-structure.md` — ディレクトリ構成図  
- `CLAUDE.md` — Airtable 残骸の記載  
- `MIGRATION_ANALYSIS_REPORT.md` / `PROJECT_AUDIT_REPORT.md` — 過去監査  
- `SECURITY.md` — RLS  
- `.claude/rules/pii-handling.md` — 削除対象テーブル一覧（完全消去仕様）  
