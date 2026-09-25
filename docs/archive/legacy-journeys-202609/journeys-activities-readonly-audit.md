# journeys -> activities 読み取り専用移行監査

基準日: 2026-09-18  
対象環境: Supabase本番DB（読み取り専用カタログ照会）

## 実行制約と実施結果

今回実行したDB操作は、`information_schema`、`pg_class`、`pg_indexes`、`pg_policies`、`pg_constraint`、`pg_proc`へのSELECTと、`journeys`/`activities`の`COUNT(*)`のみです。

実行していない操作:

- INSERT / UPDATE / DELETE / TRUNCATE
- DROP / ALTER / CREATE
- migration実行、`db push`、restore
- journeys -> activities移行スクリプト実行

本番件数:

| テーブル | 件数 |
|---|---:|
| `journeys` | 0 |
| `activities` | 0 |

## 1. 現在のDBスキーマ

### journeys

| カラム | 型 | NULL | default | 備考 |
|---|---|---:|---|---|
| `id` | uuid | NO | `gen_random_uuid()` | PRIMARY KEY |
| `user_slug` | text | NO | なし | FK `users(slug)`、ON DELETE CASCADE |
| `content` | text | NO | なし | 本文 |
| `condition_score` | integer | YES | なし | CHECK 1..5 |
| `image_url` | text | YES | なし | |
| `video_url` | text | YES | なし | |
| `cheer_count` | integer | NO | `0` | |
| `is_public` | boolean | NO | `true` | |
| `created_at` | timestamptz | NO | `now()` | |
| `tags` | text[] | NO | `'{}'::text[]` | 後続migrationで追加 |

Live index:

- `journeys_pkey` UNIQUE btree (`id`)
- `idx_journeys_user_slug` btree (`user_slug`)
- `idx_journeys_created_at` btree (`created_at DESC`)
- `idx_journeys_tags` GIN (`tags`)

Live RLS:

- RLS有効、`relforcerowsecurity=false`
- `journeys_select_public`: anon/authenticated、`is_public = true`
- `journeys_select_own`: authenticated、`user_slug = current_user_slug()`
- `journeys_select_followed`: authenticated、`user_follows`経由
- `journeys_insert_own`: authenticated、本人slugのみ
- `journeys_update_own`: authenticated、本人slugのみ
- `journeys_delete_own`: authenticated、本人slugのみ

### activities

| カラム | 型 | NULL | default | 備考 |
|---|---|---:|---|---|
| `id` | uuid | NO | `gen_random_uuid()` | PRIMARY KEY |
| `user_id` | bigint | NO | なし | FK `users(id)` |
| `type` | text | NO | なし | Activity種別CHECK |
| `title` | text | YES | なし | |
| `description` | text | YES | なし | |
| `starts_at` | timestamptz | NO | なし | |
| `ends_at` | timestamptz | YES | なし | `ends_at > starts_at`またはNULL |
| `place_id` | uuid | YES | なし | FK `places(id)` |
| `visibility` | text | NO | `'private'` | public/connections/private |
| `tags` | text[] | NO | `'{}'::text[]` | GIN index |
| `status` | text | NO | `'planned'` | planned/completed/cancelled |
| `created_at` | timestamptz | NO | `now()` | |
| `updated_at` | timestamptz | NO | `now()` | trigger更新 |
| `image_url` | text | YES | なし | 後続migrationで追加 |
| `video_url` | text | YES | なし | 後続migrationで追加 |
| `cheer_count` | integer | NO | `0` | 後続実装で存在確認 |
| `comment_count` | integer | NO | `0` | 後続実装で存在確認 |

Live constraint/FK:

- `activities_pkey`: PRIMARY KEY (`id`)
- `activities_user_id_fkey`: `users(id)`
- `activities_place_id_fkey`: `places(id)`
- `activities_type_check`
- `activities_visibility_check`
- `activities_status_check`
- `activities_time_order_check`

Live index:

- `activities_pkey` UNIQUE btree (`id`)
- `idx_activities_user_created` btree (`user_id, created_at DESC`)
- `idx_activities_place` btree (`place_id`)
- `idx_activities_visibility_starts` btree (`visibility, starts_at`)
- `idx_activities_starts_at` btree (`starts_at`)
- `idx_activities_tags` GIN (`tags`)

Live RLS:

- RLS有効、`relforcerowsecurity=false`
- `activities_select_visible`: anon/authenticated、`can_view_activity(id)`
- 書込みはservice-role/API層前提。authenticated向けのinsert/update/delete policyはlive catalogでは確認されなかった

Incoming FK依存:

- `moments.activity_id -> activities.id`
- `activity_comments.activity_id -> activities.id`
- `activity_cheers.activity_id -> activities.id`
- `activity_participants.activity_id -> activities.id`
- `journeys`を参照するincoming FKは確認されなかった

## 2. カラムマッピング

| journeys | activities | 対応 | 備考 |
|---|---|---|---|
| `id uuid` | `id uuid` | そのまま | 同一IDを使えば冪等キーにできる。ただしactivities側の既存ID衝突確認が必要 |
| `user_slug text` | `user_id bigint` | `users.slug -> users.id`で解決 | users欠損行は移行不能として報告 |
| なし | `type` | tagsにActivity種別があれば採用、なければ`other` | 旧Journeyに種別専用カラムはない |
| `content` | `description` | そのまま | 本文をActivity説明へ |
| なし | `title` | NULL | 旧Journeyにタイトルなし |
| `created_at` | `starts_at` | `created_at`を補完 | 旧Journeyに活動開始日時なし。意味が完全一致するわけではない |
| なし | `ends_at` | NULL | 終了日時なし |
| なし | `place_id` | NULL | 旧JourneyにPlace/住所/座標なし。推測しない |
| `is_public=true` | `visibility=public` | 変換 | |
| `is_public=false` | `visibility=private` | 変換 | connections相当は表現できない |
| `tags` | `tags` | そのまま | 種別判定の入力にも使用 |
| `condition_score` | `tags` | `legacy:condition_score=N`を付加 | Activityにcondition_scoreがないため値を保持する最低限の退避 |
| なし | `status` | `completed` | 既存の記録を予定ではなく完了履歴として扱う想定 |
| `image_url` | `image_url` | そのまま | |
| `video_url` | `video_url` | そのまま | |
| `cheer_count` | `cheer_count` | そのまま | 個別のCheer行は別移行設計が必要 |
| なし | `comment_count` | `0` | Journeyにコメント情報がない |
| `created_at` | `created_at` | そのまま | |
| なし | `updated_at` | `created_at`で補完 | 旧Journeyに更新日時がない |

場所関連は対応する旧カラムがなく、今回の本番データは0件なので、移行不能データも場所補完データも存在しません。

## 3. journeys直接参照コード

### 読み取り

| ファイル | 行 | 目的 | activities置換 |
|---|---:|---|---|
| `app/(app)/dashboard/views/PortfolioView.tsx` | 54 | 自分のPortfolio履歴を取得 | 可能。ただし旧Journey表示仕様をActivity表示へ変更必要 |
| `app/(app)/dashboard/views/TimelineView.tsx` | 274 | 旧Timeline一覧 | 可能。ただしTimelineは封印対象 |
| `app/(app)/pulse/page.tsx` | 22 | Pulse用日付・継続集計 | 可能。Activityの`starts_at`基準へ変更 |
| `app/(app)/pulse/PulseClient.tsx` | 93 | Pulse用日付取得 | 可能。Activityの`starts_at`基準へ変更 |
| `app/(app)/timeline/TimelineClient.tsx` | 56 | Timeline一覧 | 可能。ただし旧Timelineは封印対象 |
| `app/api/athlete-hub/stats/route.ts` | 14 | Athlete HubのJourney統計 | 可能。Activity集計へ変更 |
| `app/api/cheer/suggest/route.ts` | 15 | 最近のJourneyをCheer候補に利用 | Activity/Moment候補へ設計変更が必要 |
| `app/api/journey/[id]/route.ts` | 14, 48 | Journey詳細・所有確認 | Activity詳細APIへ置換可能 |
| `app/api/journey/list/route.ts` | 13 | Journey一覧API | `/api/activities`へ統合可能 |
| `app/api/og/pulse/route.tsx` | 23 | Pulse OG画像の継続情報 | Activity集計へ変更 |
| `app/api/pulse/score/route.ts` | 16 | Pulse Score集計 | Activity集計へ変更 |
| `app/u/[slug]/portfolio/page.tsx` | 111 | 公開Portfolio履歴 | Activity/Momentへ再設計必要 |
| `app/u/[slug]/page.tsx` | 140, 150, 164 | 公開ProfileのJourney件数・日付・プレビュー | Activity/Momentへ置換可能だが表示意味の確認が必要 |
| `lib/supabase/portfolio-milestones.ts` | 56, 66 | Journey 50件・30日継続の達成判定 | Activity基準へ変更可能。ただしマイルストーン意味を維持する必要 |
| `features/og/server/og-portfolio-data.ts` | 58 | 公開Portfolio OGデータ | Activity/Momentへ再設計必要 |

### 書き込み

| ファイル | 行 | 操作 | 目的 | activities置換 |
|---|---:|---|---|---|
| `app/api/journey/route.ts` | 52, 63 | SELECT、INSERT | 同日投稿制限後にJourneyを作成し、Mission/Daily/Milestoneを連動 | Activity作成APIへ置換可能だが、関連するMission/Daily/Milestone契約も変更必要 |
| `app/api/journey/[id]/route.ts` | 48 | UPDATE | 公開/非公開切替 | Activityの`visibility`更新へ置換可能 |
| `app/api/journey/[id]/route.ts` | 74 | DELETE | 本人のJourney削除 | ActivityはMoment FKがあるため削除ではなくstatus変更設計が必要 |

その他:

- `app/(app)/timeline/TimelineClient.tsx`のRealtime subscriptionは`journeys`を直接監視
- `scripts/migrate-journeys-to-activities.sql`は移行設計だけで、本番では未実行
- `scripts/migrate-journeys-to-activities.mjs`も未実行
- `supabase/migrations/`にはJourneyのCREATE、ALTER、RLS、index定義が残る
- `config/`に直接DB参照は確認されなかった
- server actionとしての`.from("journeys")`参照は確認されなかった

## 4. activities側の同等機能

既存実装で確認できるもの:

- Activity CRUD: `features/activity/server/activities.ts`, `app/api/activities/**`
- Activity一覧・作成・詳細: `app/(app)/dashboard/views/ActivitiesView.tsx`
- Activityのvisibility: public/connections/private
- Activityの日時: starts_at/ends_at
- Place連携: place_id、`features/place/`
- Activityのcheer/comment/participants
- Map公開: `features/activity/server/map.ts`, `app/api/viz-map/route.ts`
- Weekly Activity: `app/api/journey/weekly/route.ts`は既に`activities`のみを読む
- 公開ProfileのActivity件数: `app/u/[slug]/page.tsx`の`listVisibleActivitiesByOwner`

完全同等でないもの:

- Journeyの`condition_score`
- Journeyの一日一件制限
- Journeyを前提にしたPulse/Timeline/旧Mission/Milestone
- Bond（user_follows）経由のJourney可視性
- Journey固有のdelete semantics

## 5. 移行SQL設計（未実行）

現在の本番`journeys`件数は0のため、実データ移行は不要です。設計のみを示します。

1. `journeys.id`をActivity IDとして利用
2. `journeys.user_slug`を`users.id`へ解決
3. `content -> description`
4. `created_at -> starts_at`
5. `is_public -> visibility`（public/private）
6. `tags`からActivity typeを判定し、判定不能は`other`
7. `condition_score`は`legacy:condition_score=N`タグへ退避するか、別の移行設計を承認
8. `status=completed`
9. `place_id=NULL`、`ends_at=NULL`、`title=NULL`
10. `ON CONFLICT (id) DO UPDATE`または存在確認付きINSERTで冪等化
11. users欠損・ID衝突・制約違反を移行不能一覧へ出力

既存の移行SQL案は[`scripts/migrate-journeys-to-activities.sql`](../scripts/migrate-journeys-to-activities.sql)にありますが、本監査では実行していません。

## 6. journeys DROP可否

### 現状: DROP不可

理由:

- `journeys`直接参照がapp/lib/featuresに残っている
- JourneyのINSERT/UPDATE/DELETE APIが残っている
- Timeline Realtime subscriptionが残っている
- `journeys`のRLS policyが残っている
- RLS policy `journeys_select_followed`が`user_follows`を参照する
- `portfolio_milestones`の達成判定がJourney件数・日付に依存する
- Journeyのmigration定義・RLS・index migrationが履歴に残る
- 実DBのincoming FKはないが、これはコード・policy依存が解消済みという意味ではない

### DROP前の必須条件

- journeys直接参照を0件にする
- Journey API/UI/Realtime subscriptionをActivity/Momentへ切替
- `portfolio_milestones`判定をActivity基準へ切替
- Bond/Visibilityの意味を確認し、`user_follows`依存policyを整理
- migration履歴は編集せず、削除migrationを別途レビュー
- `pg_constraint`でincoming FK 0件を再確認
- `pg_policies`でjourneys policy 0件を再確認
- backup manifestとJSONダンプを承認済み保管場所に保持
- 本番でread-only検証後、別チケットでDROPを承認

## 最終判定

### A. journeysの現状

本番にテーブルは存在するが、レコード件数は0件。RLS有効で、公開・本人・Bond経由SELECTと本人INSERT/UPDATE/DELETE policyが残っている。アプリ/API/Portfolio/Pulse/Timelineからの参照も残る。

### B. activitiesとの対応

Activityは既に本番に存在し、レコード件数は0件。ユーザー、日時、公開範囲、タグ、メディア、Place、Cheer/Comment/Participantsを持つ新モデルで、Journeyの機能を概ね置換できる。ただしcondition_score、Bond可視性、一日一件制限、旧Milestone/Pulse契約は追加設計が必要。

### C. journeys参照コードの残存状況

残存している。読み取りだけでなく、Journey作成INSERT、公開範囲UPDATE、削除DELETE、Realtime subscription、RLS policyが残っている。したがってコード参照0条件は未達。

### D. journeysを削除できる状態か

削除不可。データが0件でbackup済みでも、コード・API・RLS・Milestone・旧UI依存が残っているため、現時点でDROPしてはいけない。
