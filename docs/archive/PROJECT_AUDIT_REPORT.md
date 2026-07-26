# VIZION CONNECTION — プロジェクト監査レポート

> 作成日: 2026-06-24
> 対象: `vizion-connection`（Next.js 16 App Router / React 19 / Supabase）
> 目的: 新規開発ではなく **現状の完全把握**

---

## 0. エグゼクティブサマリ（要点先出し）

| 項目 | 状態 |
|------|------|
| サービス種別 | 日本のスポーツ系SNS/プラットフォーム（アスリート・トレーナー・クルー・企業をつなぐ） |
| 技術構成 | Next.js 16 (App Router) / React 19 / TypeScript / Tailwind v4 / Supabase (Postgres + Auth) |
| 認証 | **Supabase Auth（Cookieセッション）に移行済み** — メール確認・パスワードリセット対応 |
| ルーティング | 公開ページ + 認証アプリ（Dashboardは**URLが変わらないSPA**） |
| DBテーブル数 | 約35テーブル（`public`スキーマ） |
| 完成度 | コア機能（認証・プロフィール・Cheer・Journey・Discovery・通知・各種Hub）はほぼ実装済み。一部Hub機能はデータ0件で運用前段階 |
| 重要な注意点 | ① ルートに `middleware.ts` が**存在しない**（保護はページ/API層で実施）。② `MIGRATION_ANALYSIS_REPORT.md` は**古い実装を記述しており現状と乖離**。③ `airtable` 依存は未使用 |

---

## 1. サービス概要

### 目的
**Vizion Connection** は、アスリート・トレーナー・クルー（サポーター/ファン）・企業（スポンサー）を結ぶ日本語のスポーツプラットフォーム（vizion-connection.jp）。選手の活動可視化、応援（Cheer）、発見（Discovery）、スポンサー接続を軸にした「スポーツ版のキャリア＆応援SNS」。

### 主要ターゲットユーザー（5ロール）
`features/auth/types.ts` で定義：

| ロール | 役割 | カラー |
|--------|------|--------|
| `Athlete`（アスリート） | 選手。プロフィール・実績・Journeyを発信 | `#FF5050` |
| `Trainer`（トレーナー） | 指導者。クライアント/セッション管理 | `#32D278` |
| `Crew`（クルー） | ファン/サポーター。応援・紹介 | `#FFC81E` |
| `Business`（企業） | スポンサー。広告・オファー出稿 | `#3C8CFF` |
| `Admin`（運営） | 管理者。投稿・広告審査 | — |

### 主要実装機能
ダッシュボードSPA + 専用ページとして以下を提供（詳細は §5）：
- プロフィール / キャリアカード / ポートフォリオ
- Journey（活動記録・タイムライン投稿）/ TIMELINE / Pulse
- Cheer（応援）/ Cheerグラフ・ランキング
- Discovery（ユーザー発見・検索）
- ミッション / ポイント / 紹介（Referral）
- ロール別Hub（Athlete / Trainer / Member / Business）
- ニュース（News Rooms）/ VoiceLab（OpenLab：要望投稿）
- スケジュール（カレンダー）
- 通知 / 設定 / 問い合わせ
- 広告（Ads）/ ビジネスオファー / 決済（Square連携）

### 利用導線（概略）
```
マーケLP → 新規登録 → メール確認 → オンボーディング(day0→profile→journey→invite) → Dashboard
```

---

## 2. システム構成

### アプリ全体構造（ルートグループ）
| グループ | パス | 役割 |
|----------|------|------|
| `(marketing)` | `/`, `/business`, `/roadmap` | 公開マーケティングページ |
| `(auth)` | `/login`, `/register`, `/reset-password`, `/thanks` | 認証ページ |
| `(onboarding)` | `/onboarding/*` | 多段オンボーディング |
| `(app)` | `/dashboard`, `/pulse`, `/timeline`, `/news-rooms` | 認証アプリシェル |
| `app/api/*` | REST風APIルート | バックエンド |
| `app/p/[username]` | 公開プロフィールカード |
| `app/u/[slug]`, `/u/[slug]/portfolio`, `/u/[slug]/card` | ユーザー公開ページ |
| `app/r/[slug]` | 紹介リンク |
| `app/card/[slug]`, `app/company`, `app/contact`, `app/discovery`, `app/news`, `app/ranking`, `app/schedule`, `app/voicelab` | 公開/共有ページ群 |

### Dashboard SPAパターン
`/dashboard` は **単一ページSPA**。`DashboardView` union型（`app/(app)/dashboard/types.ts`）が全ビューを列挙し、`DashboardClient` が `switch` でレンダリング、`Sidebar`/`BottomNav` が `setView()` で切替。**URLは変化しない**（`?view=` で初期ビュー指定のみ可）。Pulse / Timeline は独立フルページ。

`DashboardView` の値（28種）:
`home, contact, notifications, hub, offers, admin_posts, admin_ads, collections, journey, portfolio, card, profile, schedule, news, voicelab, referral, career, discovery, roadmap, cheer, cheer_graph, business, edit, settings, action_history, missions, checkout`

### Feature Modules（`features/`）
ドメインロジックは `lib/` ではなく `features/` に配置：
`auth, business, profile, daily-log, missions, schedules, discovery, career-profile, og, hub, contact, journey, media`
各featureは `server/`（Server Actions/サーバ専用）`types.ts` `validation/`（Zod）で構成。

### Supabaseクライアント3分割
| ファイル | 用途 |
|----------|------|
| `lib/supabase/server.ts` → `supabaseServer` | service role（RLSバイパス）。API/Server Action |
| `lib/supabase/server.ts` → `createClient()` | ユーザー認証コンテキスト（Cookie, RLS尊重）。Server Component |
| `lib/supabase/browser.ts` → `supabaseBrowser` | Client Component（anon key） |
| `lib/supabase/client.ts` / `middleware-client.ts` | SSR/ミドルウェア用クライアント |

---

## 3. DB構造

Supabaseプロジェクト `qyeapzdwdkqmcsylkdfi`（ap-northeast-1, Postgres 17）。**全テーブルでRLS有効**。

### 主要テーブル一覧（用途別）

#### 認証・ユーザー
| テーブル | 主キー | 主なカラム | 用途 |
|----------|--------|-----------|------|
| `users` | `id` (bigint) | `slug`(uniq), `email`(uniq), `auth_id`(uuid uniq), `role`, `display_name`, `avatar_url`/`profile_image_url`/`banner_url`/`cover_url`, `bio`, `prefecture`/`region`/`location`/`area`, `sport`/`sports`/`sports_category`, `instagram`/`x_url`/`tiktok`/`youtube_url`, `cheer_count`, `points`, `sponsor_plan`, `is_founding_member`/`founding_number`/`seq`, `verified`, `is_onboarding_complete`, `day0_declaration`/`day0_date`, `is_deleted`/`deleted_at`, `reset_token*` | 中心テーブル。`slug` が多くのFKの参照キー |
| `verify_tokens` | `id` | `token`(uniq), `email`, `slug`, `used` | メール確認トークン（レガシー併存） |
| `referrals` | `id` | `referrer_slug`, `referred_slug`, `status`, `points_awarded` | 紹介実績 |

> 備考: `users.slug` には CHECK制約 `^[a-z0-9_.]{3,30}$`、`role` と `sponsor_plan` にも CHECK制約あり。`users.id`(bigint) と `auth.users.id`(uuid) は別物で `auth_id` で紐付け。

#### プロフィール・キャリア
| テーブル | 用途 |
|----------|------|
| `career_profiles` | キャリアカード本体（`tagline`, `bio_career`, `stats`/`episodes`/`skills`=jsonb, CTA, SNS, `visibility`=public/members/private）。`user_slug` uniq |
| `careers` | 年表エントリ（`year`, `title`, `tag`=tournament/award/affiliation/media） |
| `card_collections` | 名刺カードのコレクション（collector→target） |

#### 投稿・タイムライン
| テーブル | 用途 |
|----------|------|
| `journeys` | Journey投稿（`content`, `condition_score`1-5, `image_url`/`video_url`, `cheer_count`, `tags`[], `is_public`）。TIMELINE/Pulseの元データ |
| `news_posts` | 運営ニュース（`category`=announce/column/interview, gallery/video, `comment_count`） |
| `news_post_comments` | ニュースコメント |
| `openlab_posts` / `openlab_upvotes` | VoiceLab（要望投稿: feature/bug/idea/other, status, upvotes） |

#### 応援・通知・ミッション
| テーブル | 用途 |
|----------|------|
| `cheers` | 応援（`to_slug`, `from_slug`, `comment`） |
| `notifications` / `notification_reads` | 通知と既読管理 |
| `mission_definitions` / `user_mission_progress` | ミッション定義と進捗（daily/weekly/monthly, period_key） |
| `user_onetime_mission_rewards` | 1回限りミッション報酬（register_complete等） |
| `user_follows` | フォロー関係（follower→target） |

#### ビジネス・広告・決済
| テーブル | 用途 |
|----------|------|
| `ads` / `ad_events` | 広告（plan多段, `status`=pending/approved/rejected, position, region）と効果計測（impression/click/conversion/sale） |
| `business_offers` | 企業→ユーザーへのオファー（reward, status） |
| `business_orders` | スポンサープラン購入（Square `square_link`, amount, status） |

#### Hub（ロール別）
| テーブル | 用途 |
|----------|------|
| `member_hub_events` | クルーHubのイベント計測 |
| `member_reward_definitions` / `member_reward_unlocks` | クルー報酬定義/解除 |
| `trainer_clients` / `trainer_sessions` / `trainer_reviews` | トレーナーHub（クライアント・セッション・レビュー） |
| `discovery_events` | Discovery計測（impression/detail_open/search, 265行＝最も利用） |

#### スケジュール
| テーブル | 用途 |
|----------|------|
| `schedules` | 公開スケジュール（`category`=match/practice/event/other, `is_public`） |
| `events` / `event_invites` / `event_reminders` | 高機能カレンダー（`owner_id`→`auth.users`、招待・リマインダー）。※`schedules`と二系統が併存 |

### ER関係（要点）
- **`users.slug` がハブ**。`cheers, journeys, careers, career_profiles, user_follows, card_collections, business_offers, trainer_*, member_*, discovery_events, ad_events` がすべて `user_slug`/`*_slug` でFK参照。
- **`users.id`(bigint)** は `ads.business_id`, `openlab_posts.user_id`, `user_mission_progress.user_id` などが参照。
- **`auth.users.id`(uuid)** は `events.owner_id`, `event_invites.invitee_id`, `event_reminders.user_id` が参照（カレンダー系のみauth直結）。
- `notifications` ← `notification_reads`、`mission_definitions` ← `user_mission_progress`、`openlab_posts` ← `openlab_upvotes`、`trainer_clients` ← `trainer_sessions`/`trainer_reviews`。

```
                          ┌──────────────┐
        (auth.users.uuid) │   events     │── event_invites / event_reminders
                          └──────────────┘
                                 ▲ owner_id
   ┌────────────┐   slug    ┌─────────┐  slug   ┌──────────────┐
   │  cheers    │──────────▶│  users  │◀────────│  journeys    │
   └────────────┘           │ (id/slug│         └──────────────┘
   career_profiles ────────▶│  /auth) │◀──────── careers
   user_follows ───────────▶│         │◀──────── card_collections
   discovery_events ───────▶│         │◀──────── business_offers
   trainer_clients ────────▶│         │◀──────── member_hub_events
        │                   └─────────┘
        ├─ trainer_sessions       ▲ id (bigint)
        └─ trainer_reviews        ├── ads / ad_events (business_id)
                                  ├── openlab_posts / openlab_upvotes
                                  └── user_mission_progress ── mission_definitions
```

---

## 4. 認証フロー

### 方式
**Supabase Auth（Cookieベース, `@supabase/ssr`）** を採用。
- ログイン: `supabase.auth.signInWithPassword`（`features/auth/server/login.ts`）
- 登録: `supabase.auth.signUp` + `public.users` 行を別途 `createUser` で作成（`features/auth/server/register.ts`）。`user_metadata` に `slug`/`role` を格納。
- メール確認: Supabaseの確認メール → `/auth/confirm`（フォールバックAPI `app/api/auth/confirm/complete`）→ `completeEmailVerification(slug)` で `verified=true`。
- パスワードリセット: `app/api/account/reset-password/{request,confirm}`、`app/(auth)/reset-password`。
- パスワード/メール変更・退会: `app/api/account/{change-password,change-email,delete}`。

### セッション・保護の実装（重要）
- **`middleware.ts` はリポジトリに存在しない**（`lib/supabase/middleware-client.ts` は用意されているが未配線）。
- 保護は**ページ層とAPI層**で実施：
  - ページ: `getProfileFromSession()`（`features/profile/server/get-profile.ts`）→ 失敗時 `redirect("/login")`。
  - API: `getSupabaseProfile()` / `getSupabaseUser()`（`lib/auth/session.ts`）でセッション検証。
- **ロール別ガード**: `lib/auth/require-{athlete,trainer,member,business,admin}-session.ts`。例: `requireAthleteProfile()` は `role !== "Athlete"` で `FORBIDDEN`。
- 識別子は `auth.user_metadata.slug` → `findUserBySlug(slug)` で `public.users` 解決（`auth_id` フォールバックあり）。

### セキュリティ規約
- **CSRF**: 変更系APIは `validateCSRF(req)`（`lib/security/csrf.ts`）で Origin/Referer をallowlist照合。
- **レート制限**: `lib/ratelimit.ts`（Upstash Redis）。例: `cheerLimiter`。
- **ボディ検証**: `lib/security/body.ts`（`readLimitedJson`）+ Zod `.strict()`。
- **service role キー**は `lib/supabase/server.ts` がブラウザ実行時に throw して漏洩防止。

### フロー図
```
[登録]
register → supabase.auth.signUp(metadata:slug,role) → public.users INSERT
         → 確認メール送信 → rewardOnetimeMission("register_complete")
            │
            ▼
[メール確認]  確認リンク /auth/confirm → completeEmailVerification(slug) → verified=true
            │
            ▼
[ログイン]   signInWithPassword → user_metadata.slug/role 取得
            → findUserBySlug → updateLastLogin
            → isOnboardingComplete? ─ No → /onboarding  ─ Yes → /dashboard
            │
            ▼
[保護ルート] page: getProfileFromSession → 失敗で /login へredirect
            api : getSupabaseProfile + validateCSRF + rateLimit + Zod
            role: require*Session でロール検証
```

---

## 5. 機能一覧

| 機能 | 状態 | 主な使用テーブル | 主なAPI | 主なコンポーネント/ビュー |
|------|------|------------------|---------|---------------------------|
| 認証（登録/ログイン/確認/リセット） | ✅完成 | users, verify_tokens | `/api/register`, `/api/login`, `/api/logout`, `/api/auth/confirm/complete`, `/api/account/*` | `(auth)/*`, `LoginForm`, `RegisterForm` |
| オンボーディング | ✅完成 | users (day0_*, is_onboarding_complete) | `/api/onboarding/day0`, `/api/onboarding/complete` | `(onboarding)/onboarding/{day0,profile,journey,invite}` |
| プロフィール/キャリアカード | ✅完成 | users, career_profiles, careers | `/api/profile/*`, `/api/career-profile`, `/api/career/me` | `DashboardProfileView`, `career-wizard/*`, `unified-profile/*` |
| ポートフォリオ | ✅完成 | journeys, careers, career_profiles | `/api/journey/list` | `PortfolioView`, `app/u/[slug]/portfolio` |
| Journey（活動記録） | ✅完成 | journeys | `/api/journey`, `/api/journey/[id]`, `/api/journey/upload`, `/api/journey/list` | `MyJourneyView`, `DailyLog/*` |
| TIMELINE | ✅完成 | journeys, cheers | `/api/journey/list` | `(app)/timeline` |
| Pulse | ✅完成 | journeys | — | `(app)/pulse` |
| Cheer（応援） | ✅完成 | cheers, users | `/api/cheer`, `/api/cheer/received`, `/api/cheer/insights`, `/api/cheer/ranking` | `CheerView`, `CheerGraphView`, `CheerButton` |
| Discovery（発見） | ✅完成（最も利用、265計測） | users, discovery_events | `/api/discovery`, `/api/discovery/track` | `DiscoveryView`, `app/discovery` |
| 通知 | ✅完成 | notifications, notification_reads | `/api/notifications`, `/api/notifications/{read,unread}` | `NotificationsView` |
| ミッション/ポイント | ✅完成 | mission_definitions, user_mission_progress, user_onetime_mission_rewards | `/api/missions`, `/api/missions/progress` | `MissionsView` |
| 紹介（Referral） | ✅完成 | referrals, users | （登録時連携） | `ReferralView`, `app/r/[slug]` |
| Collections（カード収集） | ⚠️実装済/データ0 | card_collections | `/api/collect`, `/api/collect/list` | `CollectionsView`, `CollectionCarousel` |
| スケジュール | ✅完成 | schedules（+events系は別実装） | `/api/schedules/*` | `ScheduleClient`, `schedule/*`, FullCalendar |
| ニュース（News Rooms） | ✅完成 | news_posts, news_post_comments | `/api/news/*` | `NewsView`, `(app)/news-rooms`, `app/news` |
| VoiceLab/OpenLab | ✅完成 | openlab_posts, openlab_upvotes | `/api/voicelab/*` | `VoiceLabView`, `app/voicelab` |
| Athlete Hub | ✅実装 | users, journeys, cheers | `/api/instand`, `/api/daily-log` | `AthleteHubView` |
| Trainer Hub | ⚠️実装済/データ0 | trainer_clients, trainer_sessions, trainer_reviews | `/api/trainer-hub/*` | `TrainerHubView` |
| Member（Crew）Hub | ⚠️実装済/データ0 | member_hub_events, member_reward_* | `/api/member-hub/*` | `MemberHubView` |
| Business Hub | ⚠️実装済/データ0 | ads, ad_events, business_offers, business_orders | `/api/business-hub/*`, `/api/ads`, `/api/offers/*` | `BusinessView` |
| 広告（Ads） | ✅実装/データ0 | ads, ad_events | `/api/ads`, `/api/ads/events`, `/api/admin/ads/*` | `AdCard`, `AdminAdsView` |
| ビジネス決済（Square） | ✅実装 | business_orders | `/api/business-checkout`, `/api/business-checkout/complete`, `/api/webhooks/square` | `CheckoutView`, `business/checkout` |
| 管理（投稿/広告審査） | ✅実装（Adminのみ） | news_posts, ads | `/api/admin/posts/*`, `/api/admin/ads/*` | `AdminPostsView`, `AdminAdsView` |
| 問い合わせ | ✅完成 | contacts | `/api/contact` | `ContactView`, `app/contact` |
| 設定 | ✅完成 | users | `/api/account/*`, `/api/profile/visibility` | `SettingsView` |
| ロードマップ | ✅完成（静的） | — | — | `RoadmapView`, `(marketing)/roadmap` |
| OGP画像生成 | ✅実装 | users, career_profiles | `/api/share-image` | `features/og/*` |

> 「データ0」= テーブルは存在しコードも実装済みだが、本番データが未投入＝運用前段階。

---

## 6. API一覧

`app/api/**/route.ts`（全72ルート）。代表的なものをドメイン別に整理。共通規約: 変更系は `validateCSRF` → rateLimit → `getSupabaseProfile` → Zod検証 → 処理。

| ドメイン | エンドポイント | メソッド | 概要 |
|----------|----------------|----------|------|
| 認証 | `/api/register`, `/api/register/resend` | POST | 新規登録/確認メール再送 |
| 認証 | `/api/login`, `/api/logout` | POST | ログイン/ログアウト |
| 認証 | `/api/auth/confirm/complete` | POST | メール確認後処理 |
| アカウント | `/api/account/change-password`, `/api/account/change-email`, `/api/account/delete`, `/api/account/delete/change-password` | POST | 認証情報変更・退会 |
| アカウント | `/api/account/reset-password/request`, `/api/account/reset-password/confirm` | POST | パスワードリセット |
| プロフィール | `/api/profile/save`, `/api/profile/save/me`, `/api/profile/upload`, `/api/profile/visibility`, `/api/profile/public/[slug]` | GET/POST | プロフィール取得/保存/画像/公開設定 |
| キャリア | `/api/career-profile`, `/api/career/me` | GET/POST | キャリアカード |
| Journey | `/api/journey`, `/api/journey/[id]`, `/api/journey/list`, `/api/journey/upload` | GET/POST/PATCH/DELETE | Journey CRUD・画像 |
| Cheer | `/api/cheer`, `/api/cheer/received`, `/api/cheer/insights`, `/api/cheer/ranking` | GET/POST | 応援・分析・ランキング |
| Discovery | `/api/discovery`, `/api/discovery/track` | GET/POST | 検索・計測 |
| 通知 | `/api/notifications`, `/api/notifications/read`, `/api/notifications/unread` | GET/POST | 通知一覧/既読/未読数 |
| ミッション | `/api/missions`, `/api/missions/progress` | GET/POST | ミッション・進捗 |
| Collections | `/api/collect`, `/api/collect/list` | GET/POST | カード収集 |
| スケジュール | `/api/schedules`, `/api/schedules/mine`, `/api/schedules/upcoming`, `/api/schedules/public/[slug]` | GET/POST | 予定 |
| ニュース | `/api/news/posts`, `/api/news/feed`, `/api/news/top`, `/api/news/local`, `/api/news/comments`, `/api/news/cheer` | GET/POST | ニュース・コメント |
| VoiceLab | `/api/voicelab/posts`, `/api/voicelab/upvote` | GET/POST | 要望投稿・投票 |
| Hub | `/api/member-hub/{summary,events}`, `/api/trainer-hub/{summary,sessions,sessions/[id]}`, `/api/business-hub/{analytics,ads,ads/[id],offers,offers/[id]}` | GET/POST/PATCH | ロール別Hub |
| 広告 | `/api/ads`, `/api/ads/events`, `/api/admin/ads`, `/api/admin/ads/[id]` | GET/POST | 広告配信・計測・審査 |
| オファー | `/api/offers/received`, `/api/offers/received/[id]` | GET/PATCH | 受信オファー |
| 決済 | `/api/business-checkout`, `/api/business-checkout/complete`, `/api/webhooks/square` | POST | Square決済・Webhook |
| 管理 | `/api/admin/posts`, `/api/admin/posts/[id]`, `/api/admin/posts/[id]/notify` | GET/POST/PATCH/DELETE | 投稿管理・通知配信 |
| その他 | `/api/contact`, `/api/share/complete`, `/api/share-image`, `/api/daily-log`, `/api/instand`, `/api/onboarding/day0`, `/api/onboarding/complete` | GET/POST | 各種 |

---

## 7. コンポーネント構造

### レイアウト/共通UI
- `components/layout/`: `Header`, `Footer`, `HeaderLight`, `FooterLight`（公開/ライト系で分岐）
- `components/ui/`: shadcn/ui ベース（`button`, `sheet`, `alert-dialog`, `switch`）+ `LottieAnim`, `PrivateProfilePage`, `FoundingMemberBadge`
- `components/ui.tsx`: 共通UI集約
- `app/(app)/AppShell.tsx`: 認証エリア共通シェル（roleでBottomNav出し分け）

### 機能別コンポーネント群
- `components/career-wizard/` + `hooks/useCareerWizard.ts`: キャリアカード作成ウィザード（Role/Tagline/Bio/Stats/Skills/Episodes/Location/Contact/Media/Complete）
- `components/unified-profile/`: 統合プロフィール編集モーダル
- `components/schedule/`: カレンダー一式（`ScheduleCalendar`, `WeekView`, `MiniCalendar`, `EventModal` 等、FullCalendar連携）
- `components/DailyLog/` + `hooks/useDailyLogStore.ts`: Journey/活動記録入力
- `components/profile/`: `CheerButton`, `ShareButtonClient`, 各種CropModal（Avatar/Banner/Media/Hero）
- `components/news/`: ニュース表示・コメント・アクション
- `components/marketing/`: LP用セクション群（Hero/Feature/FAQ/CTA/JapanMap 等）
- `components/collections/`, `components/AdCard.tsx`, `components/SponsorBadge.tsx`

### Dashboard固有
- `app/(app)/dashboard/DashboardClient.tsx`: SPA本体（view切替・テーマ・通知ポーリング）
- `app/(app)/dashboard/components/`: `Sidebar`, `BottomNav`, `DashboardProfileView`, `ProfilePreviewModal`, `Day0WelcomeModal`
- `app/(app)/dashboard/views/`: 28+ビュー（HomeView, CheerView, DiscoveryView, 各Hub等）

### Hooks / Utility
- Hooks: `useCareerWizard`, `useDailyLogStore`（Zustand）
- Utility: `lib/utils.ts`, `lib/countries.ts`, `lib/day-count.ts`, `lib/discovery-filters.ts`, `lib/cheers.ts`, `lib/missions.ts`, `lib/ads*.ts`, `lib/news*`, `lib/voicelab*`

### 依存方向
```
app/(routes) ──▶ features/* (server logic, Zod) ──▶ lib/supabase/* (data access) ──▶ Supabase
     │                                                      ▲
     └──▶ components/* (UI) ──▶ hooks/* (state) ───────────┘
          lib/security/*, lib/ratelimit.ts (横断的関心)
```

---

## 8. 状態管理

| 手段 | 利用箇所 | 備考 |
|------|----------|------|
| **Server Components / Server Actions** | `features/*/server/`, page.tsx | 主たるデータ取得。`getProfileFromSession` 等 |
| **React `useState`/`useEffect`** | `DashboardClient` ほか各ビュー | SPAのview管理・ローカル状態 |
| **`useSyncExternalStore`** | テーマ管理（`vz-theme` をlocalStorage+storageイベント同期） | Dashboardテーマ（dark/dim/light） |
| **Zustand** | `hooks/useDailyLogStore.ts`, `hooks/useCareerWizard.ts` | DailyLog/ウィザードのクライアント状態 |
| **fetch + ポーリング** | 通知未読数（5分間隔 + focus/visibility） | `NOTIFICATION_POLL_MS` |
| Redux / Context API | — | 未使用（React Contextはほぼ使われていない） |

状態は「サーバ取得＋ローカルuseState」が中心で、グローバルストアはZustandを限定的に使用。

---

## 9. 未使用コード・技術的負債

### 確実に未使用
- **`airtable` / `@types/airtable`**: `package.json` にあるがソース未import（Airtable→Supabase移行の残骸）。削除可。
- **`MIGRATION_ANALYSIS_REPORT.md` の記述が現状と乖離**: 同レポートは「Supabase Authは使っていない」「`lib/supabase/users.ts`」「`features/auth/server/verify.ts`」等を前提とするが、**現コードはSupabase Auth採用済み**で該当ファイルは `lib/supabase/data/users.server.ts` / `complete-verification.ts` に再編されている。**レポートのP0バグ指摘（id/slug混在・verify未設定・cheer引数逆転等）は旧実装のものであり、現行コードでは別実装**。→ レポートは「歴史的資料」として扱い、現行コードで再監査すべき。

### 構造上の重複・要整理
- **スケジュールが二系統**: `schedules`（`user_slug`, 実利用2行）と `events`/`event_invites`/`event_reminders`（`auth.users` 直結, 全0行）が併存。後者は高機能だが未配線の可能性。どちらを正とするか要決定。
- **`verify_tokens`（レガシー）とSupabase Auth確認の併存**: 確認系が二重。
- **プロフィール編集ビューの重複感**: `career-wizard/`（StepProfileBasicWizard等）と `unified-profile/`（StepProfileBasic等）が類似ステップを持つ。統合余地。
- **`app/discovery`・`app/news`・`app/ranking`・`app/voicelab`・`app/schedule`（公開ページ）とDashboard内同名ビューの二重実装**: 共有/SEO用途なら妥当だが、ロジック重複の保守コストに注意。
- **`account/delete/change-password`** ルート: `account/change-password` と挙動が重複（旧レポートでも指摘）。要否確認。

### 要確認（データ0件で運用前）
`ads`, `ad_events`, `business_offers`, `member_hub_events`, `trainer_clients/sessions/reviews`, `card_collections`, `user_follows`, `events*` — 実装済みだが本番データなし。リリース前のQA対象。

### 補足（セキュリティ良好点）
- 全テーブルRLS有効。クライアント書き込みはservice role経由に統一（メモリの RLS方針 と整合）。
- CSRF/レート制限/ボディサイズ制限/Zod strict の多層防御。
- service roleキーのブラウザ漏洩ガードあり。

---

## 10. 技術構成まとめ

| 項目 | 採用技術 |
|------|----------|
| Framework | Next.js **16.2.4**（App Router）/ React **19.2.3** / TypeScript 5 |
| Compiler | React Compiler（`babel-plugin-react-compiler`） |
| Database | Supabase（PostgreSQL 17, ap-northeast-1） |
| Auth | Supabase Auth（`@supabase/ssr`, Cookieセッション） |
| Hosting | Vercel 想定（`@vercel/speed-insights`） |
| Storage | Supabase Storage（`lib/supabase/upload-image.ts`, `storage-cleanup.ts`） |
| State | Server Components/Actions + useState + Zustand + useSyncExternalStore |
| Styling | Tailwind v4 / shadcn/ui / Framer Motion / `--vc-*`トークン / Bebas Neue + Noto Sans JP |
| Cache/RateLimit | Upstash Redis（`@upstash/ratelimit`） |
| Email | Resend |
| 決済 | Square（リンク決済 + Webhook署名検証） |
| Validation | Zod 4 |
| カレンダー | FullCalendar |
| その他 | nanoid, qrcode, react-easy-crop, lottie, fast-xml-parser（RSS） |

---

## 11. ユーザー体験フロー（時系列）

```
① 認知      マーケLP (/) で価値訴求・ロール別ベネフィット閲覧
   ↓
② 新規登録   /register（メール・パスワード・ロール・slug・紹介コード）
   ↓        supabase.auth.signUp → public.users 作成 → 確認メール送信
③ メール確認  確認リンク → /auth/confirm → verified=true
   ↓
④ オンボーディング  /onboarding
   ↓        day0（宣言）→ profile（基本情報）→ journey（最初の投稿）→ invite（紹介）
   ↓        → /api/onboarding/complete で is_onboarding_complete=true
⑤ Dashboard  /dashboard（?welcome=1 でDay0歓迎モーダル）
   ↓
⑥ プロフィール充実  キャリアカード作成（career-wizard）・画像アップ
   ↓
⑦ 発見・交流  Discovery で他ユーザー検索 → Cheer 送信 → Journey 投稿
   ↓
⑧ 継続       ミッション達成でポイント / 通知 / TIMELINE・Pulse 閲覧
   ↓
⑨ ロール別    Athlete/Trainer/Crew/Business それぞれのHubで専門機能
              （Businessはスポンサープラン購入・広告・オファー）
```

---

## 12. 今後の開発優先順位（提案）

### 完成している（運用可能）
認証・オンボーディング・プロフィール/キャリアカード・Journey/TIMELINE/Pulse・Cheer・Discovery・通知・ミッション・ニュース・VoiceLab・スケジュール・問い合わせ・設定。

### 追加・改善すべき（優先度順）

**P0（リリース前必須）**
1. **`middleware.ts` の導入検討**: 現状ページ/API層保護のみ。`lib/supabase/middleware-client.ts` が用意済みなので、未認証アクセスの一元ガード＋セッションリフレッシュを配線すると堅牢。
2. **現行コードでのセキュリティ再監査**: `MIGRATION_ANALYSIS_REPORT.md` は旧実装ベースで陳腐化。現行のSupabase Auth実装に対し id/slug整合・verify・cheer重複・ミッション二重付与を改めて検証。
3. **データ0機能のQA**: Ads/Offers/各Hub/Collections/Follows を実データで通し試験。

**P1（運用品質）**
4. **スケジュール二系統の一本化**: `schedules` と `events*` のどちらを正とするか決定し、不要側を廃止。
5. **プロフィール編集UIの統合**: `career-wizard` と `unified-profile` の重複ステップ整理。
6. **確認系の一本化**: `verify_tokens`（レガシー）を廃止しSupabase Auth確認に統一。

**P2（整理・負債返済）**
7. `airtable`/`@types/airtable` 依存削除、`MIGRATION_ANALYSIS_REPORT.md` を現状に合わせ更新 or アーカイブ。
8. `account/delete/change-password` 等の重複ルート整理。
9. 公開ページとDashboardビューの重複ロジック共通化。

### 不要・縮小候補
- `airtable` 依存（即削除可）。
- 旧 `verify_tokens` 系（Supabase Auth確認に集約後）。
- 二系統スケジュールの片方。

---

## 付録: 重要な所見

1. **CLAUDE.md と実装の差分**: CLAUDE.md は middleware用クライアントを「ミドルウェアで使う」と記すが、`middleware.ts` 自体は未配置。保護はページ/APIで担保されている（機能はするが、一元化されていない）。
2. **移行レポートの陳腐化**: `MIGRATION_ANALYSIS_REPORT.md` のP0群は**旧カスタムセッション時代**の指摘。現行はSupabase Authへ再設計済みのため、そのまま鵜呑みにせず現行コードで再評価が必要。
3. **データ駆動の運用前段階**: コアSNS機能は稼働可能だが、収益系（Ads/Offers/決済）と一部Hubは実データ投入前。ビジネスモデル検証はこれから。
```
