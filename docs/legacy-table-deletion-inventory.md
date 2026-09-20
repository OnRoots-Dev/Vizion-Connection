# 旧モデル削除対象テーブル確定リスト

基準日: 2026-09-18  
判定基準: `config/mvp-scope.ts`の封印設定、`supabase/migrations/`のCREATE定義、実コードのSupabase参照を静的照合。

## 結論

現時点で「削除対象」と確定できるのは、封印機能専用で、MVPの現行導線から利用されていないテーブルです。ただし、削除対象でも参照コードが残っているものは、先に参照コード/API/UIを除去してからDB削除します。

`journeys`、`user_follows`、`ads`、`business_orders`、`business_sponsorships`、`portfolio_milestones`は、旧モデル由来であっても現行Profile、Portfolio、広告、決済、Business機能が参照しているため、今回の削除対象から除外します。特に`user_follows`は`connections`と意味が異なり、`portfolio_milestones`は旧Career本体ではなく現行Portfolioの実績補助モデルです。

## 判定一覧

| テーブル | migration定義 | 削除対象 | 理由 | API route参照 | UI/feature参照 |
|---|---|---:|---|---|---|
| `user_follows` | `20260406090000_visibility_missions_discovery.sql` | いいえ | 公開Profile/Portfolio、Athlete statsが現在参照。Connectionへの移行完了まで保持 | `app/api/athlete-hub/stats/route.ts`, `app/api/cheer/suggest/route.ts`, `app/api/instand/route.ts`, `app/api/og/pulse/route.tsx`, `app/api/pulse/score/route.ts` | `app/u/[slug]/page.tsx`, `app/u/[slug]/portfolio/page.tsx`, `features/og/server/og-portfolio-data.ts`, `lib/supabase/follows.ts` |
| `user_onetime_mission_rewards` | `20260406090000_visibility_missions_discovery.sql` | いいえ | 登録完了報酬で使用。封印されたMission画面とは異なり、Auth activationの現役処理 | 直接route参照なし | `features/auth/server/register.ts`, `lib/onetime-missions.ts` |
| `discovery_events` | `20260406090000_visibility_missions_discovery.sql` | はい※ | Discoveryが封印。`lib/supabase/discovery-events.ts`とMember Hubから参照除去後に削除 | 直接route参照なし | `lib/supabase/discovery-events.ts`, `lib/supabase/member-hub.ts` |
| `ad_events` | `20260408093000_business_hub_runtime.sql` | いいえ | 広告のimpression/click/conversion計測で現役。Business広告を削除しないため保持 | `app/api/ads/events/route.ts` | `lib/supabase/business-hub.ts` |
| `business_offers` | `20260408093000_business_hub_runtime.sql` | はい※ | Offers/Business Hubは封印対象。Offers APIとservice/UIを廃止してから削除 | `app/api/business-hub/offers/route.ts`, `app/api/business-hub/offers/[id]/route.ts` | `lib/supabase/business-hub.ts`, `app/(app)/dashboard/business-hub/BusinessHubClient.tsx` |
| `member_hub_events` | `20260408113000_member_hub_runtime.sql` | いいえ | `hub`は封印リストに含まれず、Member Hubの計測で現役 | `app/api/member-hub/events/route.ts` | `lib/supabase/member-hub.ts`, `app/(app)/dashboard/views/MemberHubView.tsx` |
| `member_reward_definitions` | `20260408113000_member_hub_runtime.sql` | いいえ | Member Hubの報酬定義で現役 | `app/api/member-hub/summary/route.ts` | `lib/supabase/member-hub.ts`, `app/(app)/dashboard/views/MemberHubView.tsx` |
| `member_reward_unlocks` | `20260408113000_member_hub_runtime.sql` | いいえ | Member Hubの報酬解除状態で現役 | `app/api/member-hub/summary/route.ts` | `lib/supabase/member-hub.ts`, `app/(app)/dashboard/views/MemberHubView.tsx` |
| `trainer_clients` | `20260408120000_trainer_hub_runtime.sql` | いいえ | Trainer Hubは現行role機能。封印リストに含まれない | `app/api/trainer-hub/summary/route.ts`, `app/api/trainer-hub/sessions/route.ts`, `app/api/trainer-hub/sessions/[id]/route.ts` | `lib/supabase/trainer-hub.ts`, `app/(app)/dashboard/views/TrainerHubView.tsx` |
| `trainer_sessions` | 同上 | いいえ | Trainerのセッション管理で現役 | 同上 | 同上 |
| `trainer_reviews` | 同上 | いいえ | Trainerのレビュー情報で現役 | `app/api/trainer-hub/summary/route.ts` | `lib/supabase/trainer-hub.ts`, `app/(app)/dashboard/views/TrainerHubView.tsx` |
| `news_post_comments` | `20260409100000_news_rooms_comments_media.sql` | はい※ | News/News Roomsは封印。News serviceとコメントUI/APIを除去後に削除 | `app/api/news/comments/route.ts` | `lib/news.ts`, `components/news/`, `app/(app)/news-rooms/` |
| `schedules` | `20260413170000_schedules.sql` | いいえ | MVPのSchedule機能で現役。`/schedule`と公開Profileが参照 | `app/api/schedules/route.ts`, `app/api/schedules/mine/route.ts`, `app/api/schedules/upcoming/route.ts`, `app/api/schedules/public/[slug]/route.ts` | `features/schedules/server/schedules.ts`, `app/schedule/`, `app/u/[slug]/page.tsx` |
| `careers` | `20260415160000_public_profile_careers_and_fields.sql` | いいえ | Profile/Career/Portfolioの現役データ | `app/api/career/me/route.ts`, `app/api/career-profile/route.ts` | `features/career-profile/`, `app/(app)/dashboard/career/CareerDashboardClient.tsx`, `app/(app)/dashboard/views/CareerSPAWrapper.tsx`, `app/u/[slug]/` |
| `events` | `20260418114000_events_invites_reminders.sql` | はい | 現行Scheduleは`schedules`。このテーブルのroute/UI参照は確認できない | 参照なし | 参照なし |
| `event_invites` | 同上 | はい | `events`に従属する旧カレンダー専用。参照なし | 参照なし | 参照なし |
| `event_reminders` | 同上 | はい | `events`に従属する旧カレンダー専用。参照なし | 参照なし | 参照なし |
| `journeys` | `20260608_journey_unification.sql` | いいえ | 公開Profile/Portfolioの軌跡データとして現役。Timeline/Pulseだけを削除してもテーブルは保持 | `app/api/journey/route.ts`, `app/api/journey/list/route.ts`, `app/api/journey/[id]/route.ts`, `app/api/journey/weekly/route.ts`, `app/api/og/pulse/route.tsx`, `app/api/athlete-hub/stats/route.ts`, `app/api/cheer/suggest/route.ts` | `app/(app)/dashboard/views/PortfolioView.tsx`, `app/u/[slug]/page.tsx`, `app/u/[slug]/portfolio/page.tsx`, `features/og/server/og-portfolio-data.ts`, `lib/supabase/portfolio-milestones.ts` |
| `business_sponsorships` | `20260702150000_business_sponsorships.sql` | いいえ | Business sponsorship機能で現役。決済・スポンサー状態に関係するため削除不可 | 直接route参照なし | `lib/supabase/business-sponsorships.ts`, Business画面群 |
| `portfolio_milestones` | `20260702151000_portfolio_milestones.sql` | いいえ | **現行Portfolioの実績モデル**。Career Profile本体とは別だが、公開Profile/Portfolioのバッジ表示で現役。削除ではなく現行モデルとして正式位置付け | `app/api/portfolio/[slug]/milestones/route.ts` | `lib/supabase/portfolio-milestones.ts`, `app/u/[slug]/components/MilestoneBadgeRow.tsx`, `app/u/[slug]/page.tsx`, `app/u/[slug]/portfolio/page.tsx` |
| `ad_slots` | `20260720010000_create_ad_slots.sql` | いいえ | Business checkoutと広告枠在庫で現役 | `app/api/business/region-availability/route.ts`, `app/api/business-monetize/account/route.ts` | `lib/supabase/ad-slots.ts`, Business LP/Checkout |
| `places` | `20260825090000_p0_core_model_contract.sql` | いいえ | 新モデル。Activity/Moment/Viz Mapの正規Place | `app/api/places/route.ts`, `app/api/viz-map/route.ts` | `features/place/`, `PlacePicker`, `VizMapView` |
| `activities` | 同上 | いいえ | 新モデルのMVP中核 | `app/api/activities/route.ts`, `app/api/activities/[id]/route.ts`, `app/api/activities/[id]/comments/route.ts`, `app/api/activities/[id]/cheer/route.ts`, `app/api/activities/[id]/participants/route.ts` | `features/activity/`, `ActivitiesView`, `VizMapView` |
| `moments` | 同上 | いいえ | 新モデルのMVP中核 | `app/api/moments/route.ts`, `app/api/moments/[id]/comments/route.ts`, `app/api/moments/[id]/cheer/route.ts`, `app/api/viz-map/route.ts` | `features/moment/`, `MomentsFeedView`, `MomentCard`, `VizMapView` |
| `moment_comments` | 同上 | いいえ | MomentコメントのMVP機能 | `app/api/moments/[id]/comments/route.ts`, `app/api/moments/[id]/comments/[commentId]/route.ts` | `features/moment/`, `CommentsSheet` |
| `moment_cheers` | 同上 | いいえ | Moment CheerのMVP機能 | `app/api/moments/[id]/cheer/route.ts` | `features/moment/`, `MomentCard` |
| `connections` | 同上 | いいえ | 新モデルのConnection機能 | `app/api/connections/route.ts`, `app/api/connections/[id]/route.ts` | `features/connection/`, `ConnectionButton`, Profile/Moment UI |
| `business_accounts` | `20260828120000_business_monetization_p0.sql` | いいえ | 新Business monetizationモデル。現行契約状態 | `app/api/business-monetize/account/route.ts`, `app/api/business-monetize/campaigns/route.ts` | `lib/supabase/business-monetize.ts`, Business Monetize UI |
| `business_locations` | 同上 | いいえ | 新Business拠点モデル。Map/広告で現役 | `app/api/business-monetize/locations/route.ts`, `app/api/business-monetize/locations/[id]/route.ts` | `lib/supabase/business-monetize.ts`, Business Monetize UI |
| `business_campaigns` | 同上 | いいえ | 新Business広告キャンペーンモデル | `app/api/business-monetize/campaigns/route.ts`, `app/api/business-monetize/campaigns/[id]/route.ts`, `app/api/business-monetize/public/route.ts` | `lib/supabase/business-monetize.ts`, `BusinessMonetizeHubView`, `VizMapView` |
| `activity_comments` | `20260831080000_activity_cheers_comments.sql` | いいえ | Activity詳細コメントのMVP機能 | `app/api/activities/[id]/comments/route.ts`, `app/api/activities/[id]/comments/[commentId]/route.ts` | `features/activity/`, `ActivityCommentsSheet` |
| `activity_cheers` | 同上 | いいえ | Activity CheerのMVP機能 | `app/api/activities/[id]/cheer/route.ts` | `features/activity/`, `ActivitiesView` |
| `activity_participants` | `20260831081000_activity_participants.sql` | いいえ | Activity参加/TogetherのMVP機能 | `app/api/activities/[id]/participants/route.ts`, `app/api/activities/[id]/participants/[userId]/route.ts` | `features/activity/`, `ActivityTogetherPanel` |

`※`は、封印設定だけを根拠に削除してはいけないものです。該当route/service/UIを先に削除・停止し、バックアップと参照ゼロ確認を完了してからDB削除します。

## migrationにはCREATE定義がないが、削除してはいけないテーブル

以下は`supabase/migrations/`のCREATE抽出では確認できない一方、現行コードから参照されます。今回の「全migrationテーブル」一覧とは別に、誤削除防止のため非対象として明記します。

| テーブル | 削除対象 | 現役理由 | 主な参照 |
|---|---:|---|---|
| `users` | いいえ | 全機能のユーザー・Auth対応表 | `features/auth`, `features/profile`, 各種公開Profile/API |
| `ads` | いいえ | Business広告の掲載物（creative、掲載期間、地域、審査/有効状態）。`business_campaigns`と重複し得るが、既存広告配信・Admin運用があるため移行完了まで保持 | `app/api/admin/ads/*`, `app/api/ads/events/route.ts`, `lib/ads/get-ads.ts`, `lib/supabase/business-hub.ts` |
| `business_orders` | いいえ | Square Payment Linkの注文・金額・プラン・完了状態を保持する決済台帳。将来のInvoice/銀行振込を同じ表へ混在させず、共通Subscription/Payment Ledgerへ段階移行するまで保持 | `app/api/business-checkout/*`, `app/api/webhooks/square/route.ts`, `lib/supabase/business-orders.ts` |
| `cheers` | いいえ | 公開Profileと既存Cheer機能 | `app/api/cheer/*`, `lib/supabase/cheers.ts`, 公開Profile |
| `career_profiles` | いいえ | Profile/Careerの現行本体 | `app/api/career-profile/route.ts`, `lib/supabase/career-profiles.ts` |
| `news_posts` | はい※ | News/Admin Posts封印。`news` service/API/UIを除去後に削除 | `app/api/admin/posts/*`, `lib/news.ts`, News UI |
| `news_post_comments` | はい※ | Newsコメント専用。News service/API/UIを除去後に削除 | `app/api/news/comments/route.ts`, `lib/news.ts`, News UI |
| `openlab_posts` | はい※ | VoiceLab封印。VoiceLab API/service/UIを除去後に削除 | `app/api/voicelab/posts/route.ts`, `lib/voicelab.ts` |
| `openlab_upvotes` | はい※ | VoiceLab投票専用。VoiceLab API/service/UIを除去後に削除 | `app/api/voicelab/upvote/route.ts`, `lib/voicelab.ts` |
| `mission_definitions` | はい※ | Missions/Daily Circuit封印。Mission API/service/UIを除去後に削除 | `app/api/missions/*`, `lib/missions.ts` |
| `user_mission_progress` | はい※ | Missions進捗専用。Mission API/service/UIを除去後に削除 | `app/api/missions/*`, `lib/missions.ts` |
| `referrals` | いいえ | `/r/[slug]`の紹介入口と登録フローはMVPで現役 | `app/r/[slug]/`, `lib/supabase/referrals.ts`, Auth/register flow |
| `card_collections` | いいえ | Profile/Cardのコレクション機能はMVPのProfile/Card資産として保持 | `lib/supabase/collections.ts`, Card/Profile UI |

## 現役旧テーブルと新Business/Connectionモデルの対応設計

### `user_follows` -> `connections`

**判定: 別モデルとして正式に位置付け直す。単純移行・統合は行わない。**

`user_follows`は`follower_slug -> target_slug`の一方向Bondです。`createBond`は対象者の承認を要求せず、private profileの閲覧許可にも使われています（`lib/supabase/follows.ts`）。一方、`connections`は`requester_id/addressee_id/status`を持ち、`pending -> accepted`の相互承認関係として定義されています（`supabase/migrations/20260825090000_p0_core_model_contract.sql`）。

したがって、`user_follows`の全行を`connections(status=accepted)`へ移すと、次の意味が失われます。

- フォローされる側の承認なしに成立するBond
- followerとtargetの向き
- Bondを条件とした旧Private Profile可視性
- Bond 50件によるPortfolio milestone判定

対応方針:

- `user_follows`はBond/購読・発見シグナルのレガシーではなく、非対称関係の現行別モデルとして保持
- `connections`は同意ベースの相互Connectionに限定
- Profileの「Bond」と「Connection」をUI/API上で別概念として表示
- 将来Bondを廃止する場合は、承認状態・可視性・通知・milestoneを含む別の移行設計を先に作る

主な参照:

- API: `app/api/instand/route.ts`, `app/api/athlete-hub/stats/route.ts`, `app/api/cheer/suggest/route.ts`, `app/api/pulse/score/route.ts`, `app/api/og/pulse/route.tsx`
- Service: `lib/supabase/follows.ts`, `lib/supabase/portfolio-milestones.ts`
- UI/Page: `app/u/[slug]/page.tsx`, `app/u/[slug]/portfolio/page.tsx`, `app/(app)/dashboard/views/PortfolioView.tsx`

### `portfolio_milestones`

**判定: 現行のまま残す。削除対象から除外する。**

`features/career-profile`は`career_profiles`のtagline/bio/stats/episodes/skillsを保存するProfile編集機能であり、`portfolio_milestones`を置き換える実装ではありません。`portfolio_milestones`は別途、Cheer 100件、Journey投稿50件、Journey streak 30日、Bond 50件を達成したときにupsertされ、公開Profile/Portfolioの`MilestoneBadgeRow`で表示されます。

主な参照:

- 判定/書込み: `lib/supabase/portfolio-milestones.ts`
- 達成条件呼び出し: `features/auth/server/register.ts`周辺の既存Auth処理、Cheer/Journey処理
- API: `app/api/portfolio/[slug]/milestones/route.ts`
- UI: `app/u/[slug]/components/MilestoneBadgeRow.tsx`, `app/u/[slug]/page.tsx`, `app/u/[slug]/portfolio/page.tsx`

`journey_streak_30`と`journeys_posted_50`の判定元は現状`journeys`です。JourneyをActivityへ完全移行する場合は、milestone計算を`activities`基準へ切り替えてから`journeys`を削除します。

### `ads` -> `business_accounts` / `business_campaigns`

**判定: 統合可能。ただし段階移行完了まで現行のまま残す。**

現行`ads`は掲載物そのものです。`business_id`、creative（headline/body/image/link）、掲載期間、地域、plan、審査status、is_activeを持ち、`ad_events`がimpression/click/conversion/saleを記録します。Admin審査、Business Hub管理、公開Profile/広告表示、イベント計測がこのモデルに依存しています。

新しい`business_accounts`は契約単位、新しい`business_locations`は実店舗、新しい`business_campaigns`はActivity/Moment広告キャンペーンです。責務は近いため、将来は次の対応が可能です。

- `ads.business_id` -> `business_accounts.user_id`またはaccount ID
- `ads`の掲載期間・地域・creative -> `business_campaigns`
- `ads`の物理拠点情報 -> `business_locations`
- `ad_events` -> 新キャンペーンの計測イベントへ移行または共通化

ただし現時点では`business_subscriptions`/`business_slots`はこのリポジトリに実装されておらず、`business_accounts`/`business_locations`/`business_campaigns`も別のP0モデルです。移行契約と広告配信の切替を先に実装せず、`ads`を削除してはいけません。

### `business_orders` -> 将来のSubscription/Payment Ledger

**判定: 現行のまま残す。将来モデルとは決済アダプター境界で統合する。**

現行表はSquare Payment Linkの注文台帳です。注文作成、pending/completed/failed状態、金額、plan、region、Square linkを保持し、Square webhookが署名検証後にcompletedへ冪等遷移させます（`lib/supabase/business-orders.ts`, `app/api/webhooks/square/route.ts`）。

将来の手動Invoice/銀行振込は、Square固有列を増やして混在させるのではなく、次のどちらかを別チケットで決めます。

1. `business_subscriptions`（契約）と`business_payments`（支払台帳）を新設し、既存`business_orders`をSquare adapterの履歴として保持
2. 共通Payment Ledgerへ移行し、`provider=square|invoice|bank_transfer`と外部取引IDを持たせる

いずれの場合も、既存注文の監査証跡とWebhook再送処理を移行確認するまで削除しません。

### `business_sponsorships`

**判定: 別モデルとして正式に位置付け直す。現行のまま残す。**

この表はBusinessが特定ユーザーを支援する関係（business_user_slug -> sponsored_user_slug）で、plan、開始/終了日、元注文を保持します。公開Profileのスポンサー表示とBusiness Hubの支援対象一覧・枠数管理に使われます（`lib/supabase/business-sponsorships.ts`、`app/api/sponsorships/[slug]/route.ts`）。

これは「広告をどこへ露出するか」というBusiness Exposureのcampaign/slotとは異なり、「企業と人物の支援契約」という関係モデルです。将来Exposure Architectureに含める場合でも、`sponsorships`を広告campaignへ潰さず、Business Account/Subscriptionへの参照を追加する設計が適切です。

## 設計上の削除条件

上記テーブルは現役参照があるため、削除SQLを作成してはいけません。削除可能になる条件は次の通りです。

- `user_follows`: Bondを正式廃止し、可視性・通知・milestoneを移行した後
- `portfolio_milestones`: Activity/Cheer基準のmilestoneモデルへ移行し、公開Profileの表示確認後
- `ads`: Business Campaignへの全掲載物・審査・計測移行後
- `business_orders`: 新Payment Ledgerへの監査証跡・Webhook履歴移行後
- `business_sponsorships`: 支援契約モデルの後継と公開Profile/Business Hubの切替後

## 削除対象テーブルの参照コード一覧

### P1-3: 参照停止・API/UI除去

| テーブル | route.ts / route.tsx | service / UI |
|---|---|---|
| `discovery_events` | 直接route参照なし | `lib/supabase/discovery-events.ts`, `lib/supabase/member-hub.ts` |
| `business_offers` | `app/api/business-hub/offers/route.ts`, `app/api/business-hub/offers/[id]/route.ts` | `lib/supabase/business-hub.ts`, `app/(app)/dashboard/business-hub/BusinessHubClient.tsx` |
| `news_posts` | `app/api/admin/posts/route.ts`, `app/api/admin/posts/[id]/route.ts`, `app/api/admin/posts/[id]/notify/route.ts` | `lib/news.ts`, News/Admin Posts UI |
| `news_post_comments` | `app/api/news/comments/route.ts` | `lib/news.ts`, `components/news/`, `app/(app)/news-rooms/` |
| `openlab_posts` | `app/api/voicelab/posts/route.ts` | `lib/voicelab.ts`, VoiceLab UI |
| `openlab_upvotes` | `app/api/voicelab/upvote/route.ts` | `lib/voicelab.ts`, VoiceLab UI |
| `mission_definitions` | `app/api/missions/route.ts`, `app/api/missions/progress/route.ts` | `lib/missions.ts`, `app/(app)/dashboard/views/MissionsView.tsx` |
| `user_mission_progress` | `app/api/missions/route.ts`, `app/api/missions/progress/route.ts` | `lib/missions.ts`, `app/(app)/dashboard/views/MissionsView.tsx` |

### P1-4: 旧カレンダー停止

| テーブル | route.ts | UI参照 |
|---|---|---|
| `events` | 直接参照なし | 参照なし |
| `event_invites` | 直接参照なし | 参照なし |
| `event_reminders` | 直接参照なし | 参照なし |

### P1-6: DB削除前の最終確認

P1-6では、上記の削除対象について次を機械的に確認します。

- `Get-ChildItem app,components,features,lib -Recurse -File | Select-String '.from("<table>")'` が0件
- routeのHTTP入口、Server Action、UI importが0件
- バックアップの`manifest.json`が存在する
- 本番DBで`SELECT COUNT(*)`を取得済み
- 外部キー、View、Function、Trigger、Storage policyからの参照が0件
- Supabase本番の`pg_tables`/`pg_depend`/`pg_policies`を確認済み

## 削除順序

1. P1-3で封印機能のroute/service/UI参照を除去
2. `npm run lint`、`npx tsc --noEmit`、対象APIのテストを実行
3. [旧モデル全件バックアップ手順](legacy-model-backup.md)を実行し、件数一致を確認
4. P1-6で本番DBの依存関係を確認
5. 依存関係を追加migrationで削除
6. 本番で削除後のMVPコア（Profile、Portfolio、Schedule、Activity、Moment、Connection、Business checkout）を確認

この文書は削除SQLそのものではありません。`journeys`や`user_follows`など非対象テーブルを、封印機能があるという理由だけで削除することは禁止します。
