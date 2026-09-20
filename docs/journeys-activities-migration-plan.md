# journeys -> activities 完全移行計画

Status: **調査・設計のみ。DB変更・コード変更は未実施**  
Date: 2026-09-18  
対象DB: Supabase本番（今回の監査で実行したDB操作はSELECTのみ）

## Executive Summary

本番DBの現在件数は`journeys=0`、`activities=0`。データ移行そのものは不要だが、`journeys`をDROPできる状態ではない。

理由は、JourneyのREAD/WRITE API、Profile/Portfolio/Pulse/Timeline/OG/Athlete Hub、Realtime subscription、RLS policy、Portfolio milestone判定が残っているためである。`activities`は新しい正規Activityモデルとして既に存在し、Activity/Place/Moment/ConnectionのMVP経路が実装済みだが、Journey固有の意味を単純コピーできない項目がある。

**今回の結論:**

- 実データ移行: 不要（本番`journeys`は0件）
- 参照移行: 必要
- `journeys` DROP: 現時点では不可
- `user_follows`、`ads`、`business_orders`、`business_sponsorships`、`portfolio_milestones`: 本計画の削除・統合対象外
- `events`、`event_invites`、`event_reminders`: `20260629000000_drop_dead_tables.sql`で削除済み。本計画の対象外
- DB変更: **まだ行わない**

## 1. 現状確認済み

### 本番DB

| 項目 | 結果 |
|---|---|
| `journeys` | 存在、0件、RLS有効 |
| `activities` | 存在、0件、RLS有効 |
| `journeys` backup | 取得済み。JSON backup/manifestあり |
| 実データ移行 | 未実施 |
| 本監査のDB操作 | SELECTのみ |

### `journeys`スキーマ

出典: `supabase/migrations/20260608_journey_unification.sql`、`20260613090000_add_journeys_tags.sql`、本番catalog照会。

| カラム | 型 | NULL | default | 制約/用途 |
|---|---|---:|---|---|
| `id` | uuid | NO | `gen_random_uuid()` | PK |
| `user_slug` | text | NO | - | FK `users(slug)` ON DELETE CASCADE |
| `content` | text | NO | - | Journey本文 |
| `condition_score` | integer | YES | - | 1..5 |
| `image_url` | text | YES | - | |
| `video_url` | text | YES | - | |
| `cheer_count` | integer | NO | `0` | 旧集計 |
| `is_public` | boolean | NO | `true` | 旧公開範囲 |
| `created_at` | timestamptz | NO | `now()` | 投稿日時 |
| `tags` | text[] | NO | `'{}'` | 後続追加 |

本番index: `journeys_pkey`、`idx_journeys_user_slug`、`idx_journeys_created_at`、`idx_journeys_tags`。Incoming FKは確認されていない。

本番RLS/policy:

- `journeys_select_public`: `is_public=true`
- `journeys_select_own`: `current_user_slug()`と本人slug
- `journeys_select_followed`: `user_follows`経由
- `journeys_insert_own`: 本人INSERT
- `journeys_update_own`: 本人UPDATE
- `journeys_delete_own`: 本人DELETE

### `activities`スキーマ

出典: `supabase/migrations/20260825090000_p0_core_model_contract.sql`、`20260827190500_activity_media_columns.sql`、本番catalog照会。

| カラム | 型 | NULL | default | 制約/用途 |
|---|---|---:|---|---|
| `id` | uuid | NO | `gen_random_uuid()` | PK |
| `user_id` | bigint | NO | - | FK `users(id)` |
| `type` | text | NO | - | Activity種別CHECK |
| `title` | text | YES | - | |
| `description` | text | YES | - | |
| `starts_at` | timestamptz | NO | - | 開始日時 |
| `ends_at` | timestamptz | YES | - | `ends_at > starts_at` |
| `place_id` | uuid | YES | - | FK `places(id)` |
| `visibility` | text | NO | `private` | public/connections/private |
| `tags` | text[] | NO | `'{}'` | |
| `status` | text | NO | `planned` | planned/completed/cancelled |
| `created_at` | timestamptz | NO | `now()` | |
| `updated_at` | timestamptz | NO | `now()` | trigger更新 |
| `image_url` | text | YES | - | |
| `video_url` | text | YES | - | |
| `cheer_count` | integer | NO | `0` | |
| `comment_count` | integer | NO | `0` | |

Incoming FK:

- `moments.activity_id -> activities.id`
- `activity_comments.activity_id -> activities.id`
- `activity_cheers.activity_id -> activities.id`
- `activity_participants.activity_id -> activities.id`

RLS/policy:

- RLS有効
- `activities_select_visible`: `can_view_activity(id)`によるSELECT
- authenticated向けのINSERT/UPDATE/DELETE policyは本番catalogでは確認されず、service-role/API層を前提とする

## 2. journeys参照完全分類

行番号は現行リポジトリの確認時点。`journeys`を直接参照する箇所を、機能上まとめて列挙する。

| File | Line | 種類 | READ/WRITE | 現在の役割 | Activitiesへ移行可能か | 対応方針 |
|---|---:|---|---|---|---|---|
| `app/(app)/dashboard/views/PortfolioView.tsx` | 54 | A/E | READ | 自分の履歴・継続・Portfolio表示 | 可能 | `activities`読み取りへ段階移行 |
| `app/(app)/dashboard/views/TimelineView.tsx` | 274 | A/E | READ | 旧Timeline | 可能 | 封印機能の扱いを決定後に移行 |
| `app/(app)/pulse/page.tsx` | 22 | A/E | READ | Pulse日付集計 | 可能 | `starts_at`基準へ変更 |
| `app/(app)/pulse/PulseClient.tsx` | 93 | A/E | READ | Pulse日付集計 | 可能 | 同上 |
| `app/(app)/timeline/TimelineClient.tsx` | 56 | A/C/E | READ/Realtime | Timeline一覧と`journeys`変更購読 | 可能 | Activity/Momentの購読契約を設計 |
| `app/api/athlete-hub/stats/route.ts` | 14 | D | READ | Athlete Hub統計 | 可能 | Activity集計へ変更 |
| `app/api/cheer/suggest/route.ts` | 15 | D | READ | 最近のJourneyをCheer候補に利用 | 条件付き | Moment/Activity候補のUXを決定 |
| `app/api/journey/route.ts` | 52,63 | B/D | READ/WRITE | 同日制限、Journey INSERT | 可能 | Activity作成wrapperまたはAPI移行 |
| `app/api/journey/[id]/route.ts` | 14,48,74 | B/D | READ/WRITE | 所有確認、公開切替、DELETE | 条件付き | visibility/status semanticsを再定義 |
| `app/api/journey/list/route.ts` | 13 | D | READ | Journey一覧API | 可能 | Activities APIへwrapper化候補 |
| `app/api/journey/weekly/route.ts` | 42 | D | READ | 週次Activity（既にActivity読取） | 既対応 | Journey依存なし。現行維持 |
| `app/api/og/pulse/route.tsx` | 23 | D | READ | Pulse OG生成 | 可能 | Activity集計へ変更、OG差分確認 |
| `app/api/pulse/score/route.ts` | 16 | D | READ | Pulse Score | 可能 | Activity基準へ変更、数値互換性確認 |
| `app/u/[slug]/page.tsx` | 140,150,164 | A/E | READ | 公開Profileの件数、日付、プレビュー | 可能 | Activity/Moment表示へ段階移行 |
| `app/u/[slug]/portfolio/page.tsx` | 111 | A/E | READ | 公開Portfolio履歴 | 条件付き | Activity履歴とMomentの表示意味を分離 |
| `lib/supabase/portfolio-milestones.ts` | 56,66 | A | READ | Journey 50件/継続30日の判定 | 可能 | 判定元をActivityへ変更候補 |
| `features/og/server/og-portfolio-data.ts` | 58 | A | READ | Portfolio OG | 可能 | Activity/Momentへ変更 |
| `features/journey/types.ts` | 2 | F | 型 | Journey 1行型 | 可能 | Activity型との互換層を設計 |
| `lib/day-count.ts` | 2,23 | K | 参照契約 | DAY0 fallback説明 | 条件付き | fallback対象をActivityへ変更候補 |
| `supabase/migrations/20260608_journey_unification.sql` | 5-84 | H/G | DDL/RLS | Journey schema/index/policy | 不要 | 新migrationで整理。既存migrationは編集しない |
| `supabase/migrations/20260613090000_add_journeys_tags.sql` | 5-10 | H | DDL | tags/index追加 | 不要 | 履歴として保持 |
| `supabase/migrations/20260720120000_rls_profiles_ad_slots_follows_journeys.sql` | 106-168 | G/H | DDL/RLS | 旧RLS/grant | 不要 | policy依存を先に解消 |
| `scripts/migrate-journeys-to-activities.sql` | 全体 | K | 移行設計 | 未実行のINSERT/UPSERT案 | 実行前提 | 本計画の設計入力。今回未実行 |
| `scripts/migrate-journeys-to-activities.mjs` | 全体 | K | 実行wrapper | 未実行migration runner | 実行前提 | 今回未実行 |
| `docs/*journey*` | 複数 | J | 文書 | 旧モデル/移行方針 | - | 実装後に更新 |

補足:

- `app/api/journey/route.ts`はJourney INSERT前に同日投稿制限、Mission、Daily Circuit、Milestoneを連動する。
- `app/api/journey/[id]/route.ts`は`is_public`更新とDELETEを持つ。
- server actionとしての`.from("journeys")`参照は確認されていない。
- `components/`、`hooks/`、`config/`に直接の`.from("journeys")`参照は確認されていない。
- `docs/`はコード依存ではないが、migration/運用判断の根拠として更新対象になる。

## 3. Field Mapping

| Journey field | Activity field | 判定 | 変換方法 | 注意点 |
|---|---|---|---|---|
| `id` | `id` | 変換 | 同一UUIDを利用する案 | Activity既存ID衝突を事前確認 |
| `user_slug` | `user_id` | 変換 | `users.slug -> users.id` | users欠損は移行不能 |
| `content` | `description` | そのまま対応 | 本文をdescriptionへ | titleとは意味が異なる |
| なし | `title` | 補完 | NULL | 推測生成しない |
| `created_at` | `starts_at` | 意味変換 | 作成日時を開始日時として補完 | 活動開始時刻とは同一でない |
| なし | `ends_at` | 代替なし | NULL | 終了日時なし |
| `is_public` | `visibility` | 変換 | true=public、false=private | connectionsは旧値にない |
| Bond可視性 | `visibility=connections` | 代替なし/追加設計 | `user_follows`とconnectionsを同一視しない | Bondは非対称、Connectionは承認型 |
| `tags` | `tags` | そのまま対応 | そのまま保持 | Activity type判定に使う案は要承認 |
| `condition_score` | なし | 代替なし | 退避タグ案`legacy:condition_score=N` | 正式なActivity状態ではない |
| `image_url` | `image_url` | そのまま対応 | そのまま | Storage URLの有効性確認 |
| `video_url` | `video_url` | そのまま対応 | そのまま | 同上 |
| `cheer_count` | `cheer_count` | 集計値対応 | 数値を移す案 | 個別Cheer行とは別問題 |
| なし | `comment_count` | 補完 | 0 | Journeyコメントがない |
| なし | `status` | 補完 | completed案 | 「記録=完了」の意味を確認 |
| `created_at` | `created_at` | そのまま対応 | 同値 | |
| なし | `updated_at` | 補完 | created_at案 | 更新履歴は復元できない |
| Journey場所 | `place_id` | 代替なし | NULL | 旧Journeyに場所情報なし |
| Journey milestone | `portfolio_milestones` | 別契約 | テーブルは維持し判定元のみ変更候補 | milestone自体をActivityへ統合しない |
| Pulse | 集計 | UI/API変換 | Activity starts_at/status基準案 | 既存数値との互換性検証が必要 |
| Timeline | Activity/Moment | UI/API変換 | Activity履歴とMoment公開物を分離 | Journey=投稿とActivity=行動は同一ではない |

## 4. 機能単位の移行設計

### 1. Journey投稿API

- 現状: `/api/journey`が本文、condition、media、tags、公開状態を受け、JourneyへINSERT。Mission/Daily/Milestoneも連動。
- 方針案: 既存URLを当面維持し、内部実装をActivity作成wrapperへ置換するか、`/api/activities`へのクライアント移行後に互換wrapperを残す。
- 必要変更: 同日制限のキーを`user_id + starts_at`へ変更、conditionの扱いを決定、Mission/Daily/Milestoneのイベント契約を変更。
- 注意: Activityは「継続するスポーツ行動」、Journeyは「投稿/記録」のため、投稿をActivityだけに置換するとMomentとの責務が曖昧になる。

### 2. Journey個別取得

- 現状: `/api/journey/[id]`がJourney所有確認。
- 方針案: 既存URLを互換wrapperとして維持し、Activity IDを受けてActivity可視性を適用。
- 注意: `activities`のRLSは`can_view_activity`、Journeyはpublic/own/followedであり、可視性結果が変わる。

### 3. Journey更新

- 現状: `is_public`だけUPDATE。
- 方針案: Activityの`visibility`更新へ変換。
- 注意: private/publicとconnectionsの3値差、所有者条件、service-role API側認可を揃える。

### 4. Journey削除

- 現状: JourneyをDELETE。
- 方針案: ActivityはMoment等のFKを持つため、Activity削除ではなく`status=cancelled`を基本にする。
- 注意: 既存UIの「削除」とActivityの履歴保全が衝突するため、確認ダイアログとcopy変更が必要。

### 5. Profile / 6. Public Profile

- 現状: Journey件数、日付、直近プレビューを表示。
- 方針案: Activityの可視性付き一覧・件数へ置換し、Momentは公開物として別表示。
- 注意: `user_slug`ではなく`users.id`解決が必要。公開Profileの既存Journey表示をActivity表示へ変えると意味が変わる。

### 7. Portfolio

- 現状: Journeyの投稿日・継続・画像・タグ・CheerをTimelineとして表示。
- 方針案: Activityの履歴とMomentの成果物を分けて表示する。単純にActivityをJourneyカードへ流し込まない。
- 注意: Portfolioの既存完成度計算と数値互換性を確認する。

### 8. Portfolio Milestones

- 現状: `portfolio_milestones`は正式維持。Journey 50件/30日継続などの判定がJourneyを読む。
- 方針案: テーブルは維持し、将来の判定元をActivityへ変更する候補を別チケット化。
- 注意: milestone行はJourney IDを保持していない。0件なので既存行移行は不要だが、今後の生成ロジック変更は必要。

### 9. Pulse

- 現状: Journeyのcreated_atとcheer/follow集計を利用。
- 方針案: Activity `starts_at`/`created_at`とActivity/Moment反応へ段階移行。
- 注意: Pulseの過去数値の連続性、BondとConnectionの違いを検証する。

### 10. Timeline

- 現状: Journey一覧を直接SELECTし、role filterを適用。
- 方針案: 封印機能として残すかを決定後、Activity履歴またはMoment Feedへ移行。
- 注意: TimelineとMomentsは同じものではない。

### 11. OG

- 現状: Pulse/Portfolio OGでJourney日付・件数・画像・tagsを読む。
- 方針案: Activity/Momentから同等のOGデータを作る。
- 注意: OGキャッシュと表示文言の互換性を確認。

### 12. Athlete Hub

- 現状: Journey日付で統計を計算。
- 方針案: Activity集計へ変更。
- 注意: role別Activity type制約と旧Journeyの自由度差。

### 13. Realtime

- 現状: `TimelineClient`がchannel `timeline-journeys`でpublic `journeys`のpostgres_changes全イベントを購読し、変更時に全再取得。
- 方針案: ActivityまたはMomentの購読へ変更するが、どちらをTimelineの正規イベントにするか先に決定。
- 注意: Activity INSERTとMoment INSERTの両方を購読すると二重表示・二重再取得が起きる。event IDと表示責務を分ける必要がある。

### 14. RLS

- 現状: Journeyはpublic/own/followedと本人write。Activitiesは`can_view_activity`によるvisible SELECT、writeはserver route前提。
- 方針案: Journey policyをActivities policyへ機械置換しない。
- 注意: Bond可視性をConnection可視性へ変えるには、認可仕様の承認とnegative testが必要。

### 15. その他

- `features/og/server/og-portfolio-data.ts`、`lib/day-count.ts`、`lib/supabase/portfolio-milestones.ts`、Journey型定義を移行対象として追跡する。
- `scripts/migrate-journeys-to-activities.*`は設計案であり、今回実行しない。

## 5. API移行方針案

### 比較

| 方針 | 利点 | リスク |
|---|---|---|
| `/api/journey`を即廃止し`/api/activities`へ変更 | 正規モデルが明確 | 既存UI、外部クライアント、deep link、Mission連携が壊れる |
| 既存URLをActivity wrapperにする | 後方互換、段階移行可能 | Journeyという名前とActivity意味のずれが残る |
| 新URLへ先に移行し旧URLをread-only wrapperとして残す | 移行を観測できる | 二重契約・重複イベント管理が必要 |

### 推奨

1. 既存`/api/journey`と`/api/journey/[id]`は当面維持する
2. 新規UIは`/api/activities`を正規入口にする
3. 旧Journey APIは互換wrapperまたはread-only legacy endpointへ段階移行する
4. write wrapperを停止する前に、Mission/Daily/Milestone/Realtime契約を移行する
5. URL変更は必須とせず、利用クライアントとdeep linkの実測後に判断する

一日一件制限は、まずAPIの認可済みserver serviceで`user_id + JST day + Activity starts_at`を検査する案。ただしDB制約追加は今回の確定事項にしない。

`condition_score`は次の選択肢を比較し、未決定のまま実装しない。

- UI表示専用の旧属性として別途保持
- tagsへのlegacy退避
- Activityの正規状態ではなくMoment/コンディションイベントへ分離

## 6. Timeline / Realtime

現在の購読:

- Channel名: `timeline-journeys`
- schema: `public`
- table: `journeys`
- event: `*`
- 変更時に`fetchJourneys()`を実行

移行方針:

- Activityだけを購読する場合: 行動の更新通知として成立するが、公開投稿のUXは別途必要
- Momentだけを購読する場合: 公開Feedには適するが、Activity履歴の更新を失う
- Activity + Moment両方: 二重イベントと表示重複を避けるID/責務設計が必要

追加検証:

- Supabase Realtimeでactivities/momentsのpublication対象が有効か
- 現行Timelineを継続するのか、Momentsへ統合するのか
- Cheer/Comment更新を一覧へ反映する必要性

## 7. RLS / Policy対応

| Journey policy | Activities側 | 判定 |
|---|---|---|
| public SELECT | `can_view_activity(id)` | そのまま置換不可。owner public/deleted/visibilityを比較 |
| own SELECT | `can_view_activity` | 概念は対応するが、user_id解決が必要 |
| followed SELECT | 既存Activity policyはconnections判定 | 置換不可。BondをConnectionと同一視しない |
| own INSERT | service route前提、liveではauthenticated insert policyなし | API認可とActivity owner条件を別途検証 |
| own UPDATE | 同上 | `is_public`から3値visibilityへ変換が必要 |
| own DELETE | ActivityはMoment FK保全のためstatus変更が基本 | そのまま置換不可 |

RLS変更候補は、移行実装後に別途policy設計・negative test・本番catalog確認を行う。今回policyは変更しない。

## 8. Portfolio Milestones

`portfolio_milestones`は正式維持し、Journey IDを保持していない。現在の`milestone_type`は達成種類とslug/日時のみで、Journey UUIDへの直接FKはない。

- 既存行の移行: 本番0件のため不要
- 将来生成: `journeys_posted_50`、`journey_streak_30`の判定元がJourneyに残るため、Activity移行後に判定ロジック変更が必要
- 変更候補: `checkJourneyMilestones`をActivity基準へ置換
- 確定事項: `portfolio_milestones`の削除・統合はしない

## 9. 段階的実装順序

| Phase | 対象ファイル | 変更内容 | DB変更 | リスク | 検証 | ロールバック |
|---|---|---|---|---|---|---|
| A: 契約固定 | `features/activity/types.ts`、Journey型、各API | field/意味・日次制限・condition・visibilityを決定 | なし | 意味の混同 | 型/API契約レビュー | 文書差し戻し |
| B: READ shadow | Profile/Portfolio/Pulse/Athlete Hub/OG | Activity読み取りを並行計測し差分比較 | なし | 数値差・可視性漏れ | dual-read比較、ログ | Journey readへ戻す |
| C: READ切替 | 同上、`features/og`、`lib/day-count` | Activityを正規readへ | なし | UI表示変化 | E2E/visibility/OG比較 | feature flagで旧read |
| D: WRITE切替 | `/api/journey*`、`/api/activities*`、Mission/Daily/Milestone | 新規書込みをActivityへ。旧URLはwrapper | 原則なし | 二重書込み・日次競合 | idempotency、API tests | 旧write wrapperへ戻す |
| E: Realtime | `TimelineClient` | ActivityまたはMomentへ購読切替 | Realtime設定確認が必要 | 二重イベント | event matrix、重複検知 | Journey subscriptionへ戻す |
| F: RLS整理 | `journeys`/`activities` policy、server auth | policyを追加変更する場合は別レビュー | あり得る | 公開範囲漏れ | anon/owner/non-owner/Bond/Connection test | 事前policy backup/rollback |
| G: legacy参照ゼロ | 全repo、CI grep | Journey direct read/write/realtimeを0件確認 | なし | 見落とし | ripgrep、build、E2E | 修正前状態へ戻す |
| H: 安定稼働 | production monitoring | Activitiesのみで一定期間運用 | なし | latent contract | metrics/error/DB counts | wrapper/read fallback |
| I: DROP判断 | migration、DB catalog | 依存ゼロを確認後、別承認 | あり | 不可逆 | backup/PITR/rollback drill | DROP前snapshot/PITR |

## 10. DROP最終条件

以下をすべて満たすまで`journeys`をDROPしない。

- コード全体の`journeys`参照ゼロ
- `/api/journey`のWRITEゼロ
- `/api/journey`のREADゼロ
- Timeline Realtime購読ゼロ
- Journey型・client helper・OG・Portfolio参照ゼロ
- `portfolio_milestones`判定元をActivityへ切替済み
- Journey RLS policy全削除のレビュー済み
- `pg_policies`でJourney policy 0件
- incoming FK 0件
- function依存0件
- trigger依存0件
- view/materialized view依存0件
- migration履歴を編集せず、削除migrationを別レビュー済み
- 本番backup manifest/JSONとchecksumを承認済み保管
- Activitiesのみで一定期間正常稼働
- rollback方法（snapshot/PITR、read fallback、API wrapper）が確立
- 本番でDROP前のread-only catalog再確認
- 承認者、DB管理者、アプリ担当者の承認

## Risk / Rollback

主なリスク:

- BondとConnectionを混同した公開範囲変更
- Journey本文とActivity/Momentの責務混同
- condition_scoreの欠落
- Pulse/Portfolioの過去数値不連続
- Realtime二重イベント
- ActivityのMoment FKによるDELETE不能
- Journey APIの外部/内部クライアント破壊

Rollback方針案:

- DROP前はbackup manifest/checksumとDB snapshot/PITRを確保
- APIは旧URL wrapperを一定期間残す
- READ切替はfeature flagまたはdual-read比較で戻せるようにする
- DB変更を伴うpolicy/migrationは、適用前後のcatalogとrollback SQLをレビューする
- 本計画ではrollback SQLを実行・作成しない

## 最終判定

### A. journeysの現状

本番に存在するが0件。RLS、policy、API、UI、Realtime、milestone、OG等の依存が残る。

### B. Activitiesへの移行可能性

主要なActivity情報は移行可能。ただしデータ移行ではなく、現在は参照・書込み・表示契約の移行が中心になる。

### C. 単純移行できない項目

`condition_score`、Bond由来のvisibility、場所、Journeyの一日一件制限、旧Milestone/Pulse/Timeline/OG契約、削除semantics。

### D. 現在残っている主要な依存

Journey API、Portfolio/Profile、Pulse、Timeline、OG、Athlete Hub、Cheer suggest、Milestone判定、Timeline Realtime、Journey RLS、`user_follows`参照policy。

### E. 実装時の推奨移行順序

契約固定 → dual-read → READ切替 → WRITE切替 → Realtime切替 → RLS整理 → 参照ゼロ確認 → 一定期間監視 → DROP判断。

### F. journeysをDROPできる条件

コード/API/Realtime/RLS/FK/function/trigger/migration/Portfolio依存をすべて整理し、backup・snapshot・rollback・一定期間のActivities稼働を確認した後のみ、別承認で判断する。

### G. 現時点でDB変更を行ってよいか

**DB変更はまだ行わない。**

本成果物は実装計画のみであり、コード変更、SQL変更、migration作成、DB変更、migration実行、restoreは実施していない。
