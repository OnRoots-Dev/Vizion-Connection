# journeys -> activities Phase B Decision Matrix

Status: **設計・意思決定のみ。実装・DB変更なし**  
Date: 2026-09-18

## 前提

本書はP1-3の契約・依存関係監査を前提に、Phase B実装前にFounderが決定すべき仕様を整理するものです。

現時点で確認済みの事実:

- 本番`journeys`は存在するが0件
- 本番`activities`は存在するが0件
- `journeys`にはREAD/WRITE/API/Realtime/RLS/副作用依存が残る
- `activities`はActivity/Place/Moment/Connectionの新モデルとして実装済み
- `condition_score`はActivityに存在しない
- Journeyの`created_at`は投稿日時、Activityの`starts_at`は活動開始日時
- JourneyのBond可視性とActivityのConnection可視性は異なる
- `portfolio_milestones`、`user_follows`、`ads`、`business_orders`、`business_sponsorships`は本書の削除・統合対象外
- `events`、`event_invites`、`event_reminders`は過去migrationで削除済み

## 1. Product Concept Boundary

### A. Activity

- ユーザーにとって: 実際に行った、または行うスポーツ活動
- 記録対象: 種別、タイトル、説明、開始/終了日時、場所、公開範囲、状態、タグ、メディア
- 作成タイミング: 活動を予定・記録するとき
- Map: publicかつPlaceがあり、時間・状態条件を満たす場合に表示対象
- Portfolio: 活動実績として影響する可能性があるが、最終表示契約は未確定
- Pulse: Activityを基準にするかは未決定
- `condition_score`: 現行Activity schemaにはない
- 1日1件: 現行Activityにはない

### B. Activity Log

- ユーザーにとって: その日の活動を振り返って残すログ、またはActivity作成の簡易入口
- 記録対象: 投稿本文、投稿日時、気分/状態、日次達成、振り返り
- 作成タイミング: 日次ログを残したとき
- Map: 原則としてActivity/Placeを経由するかは未確定
- Portfolio: 継続・積み上げ・日次達成に影響する可能性がある
- Pulse: streakやweekly countの入力になる可能性がある
- `condition_score`: 現行Journey/Daily Logではこの概念に属している
- 1日1件: 現行Journey/Daily Log契約ではJST日次制約がある

**Activityと同一概念かは未決定。** Activity LogをActivityそのものとして扱う場合、投稿日時と活動日時、状態スコア、日次制約の仕様確定が必要です。

### C. Moment

- ユーザーにとって: Activityの周辺で生まれた印象、写真、動画、共有物
- 記録対象: 本文、画像、動画、公開範囲、Cheer、コメント、Activityとの関係
- 作成タイミング: Activityの結果や周辺体験を公開するとき
- Map: 親Activity/Placeの可視性を継承して表示される可能性がある
- Portfolio: Activityの成果物として表示する可能性がある
- Pulse: Momentの投稿日時・反応を使うかは未決定
- `condition_score`: 現行Moment schemaにはない
- 1日1件: 現行Momentにはない

### D. Journey（旧技術モデル）

- ユーザーにとって: 旧UIの「今日の一言・気分・活動記録」
- 記録対象: `content`、`condition_score`、media、tags、`is_public`、投稿日時
- 作成タイミング: 日次Journey投稿時
- Map: Placeを持たないため、Activity Mapと同じ意味では表示できない
- Portfolio: 件数、継続、media、tags、Cheerを通じて影響
- Pulse: `created_at`の日付、Cheer、Bondから影響
- `condition_score`: Journey固有の状態情報
- 1日1件: APIでJST日付単位に制限

## 2. Decision Matrix

| Decision | Current Journey | Current Activity | Proposed Direction | Required Human Decision | Risk |
|---|---|---|---|---|---|
| `condition_score` | 1〜5の気分/状態を保存 | フィールドなし | Activityへ直接統合せず、Activity Log固有または別契約として扱う候補 | Activity、Activity Log、Momentのどこに属するか | HIGH |
| 投稿日時 | `created_at`が投稿日時 | `created_at`は作成日時 | 投稿履歴として保持するか決める | 投稿日時を正式表示・集計に使うか | HIGH |
| 活動日時 | 専用フィールドなし | `starts_at`/`ends_at` | Activityの正式な活動日時として維持 | Logから活動日時を必須にするか | HIGH |
| 1日1件 | JST日付でJourneyを1件に制限 | 制約なし | Activity全体ではなくActivity Log契約に限定する案 | Activityにも適用するか | HIGH |
| `visibility` | `is_public` + Bond RLS | public/connections/private + `can_view_activity` | BondとConnectionを同一視せず別契約として扱う | Logの公開範囲をActivityと同じにするか | HIGH |
| Bond | `user_follows`の非対称関係 | Activityはaccepted Connection | 既存`user_follows`を維持し、単純移行しない | BondをLog可視性に残すか | HIGH |
| Connection | Journeyにはなし | Activity可視性のaccepted関係 | Activityの同意ベース関係として維持 | LogにもConnectionを使うか | HIGH |
| Activity type | 専用typeなし | 12種のCHECK付きtype | Journey LogをActivity typeへ割り当てるか決定 | `other`流用か既存typeか | HIGH |
| `title` | なし | 任意だがUI入力あり | LogからActivity化時のtitle補完を決定 | titleを必須にするか | MEDIUM |
| `description/content` | `content`が本文 | `description`が説明 | 内容は変換候補だが意味差を確認 | 投稿本文と説明を同一視するか | MEDIUM |
| `place` | なし | `place_id`任意 | LogはPlaceなしでも成立させる案 | PlaceなしActivityを許可するか | MEDIUM |
| `tags` | 最大5件 | 最大5件 | そのまま対応候補 | type判定にも使うか | LOW |
| `media` | image/video | image/video | 既存Activity mediaを再利用候補 | LogのmediaをActivityかMomentへ置くか | MEDIUM |
| `status` | なし | planned/completed/cancelled | Logをcompleted Activityにする案 | 自動completedを認めるか | MEDIUM |
| Cheer | `cheer_count`の旧集計 | Activity Cheerと個別`activity_cheers` | 集計と個別反応を分離して扱う | Journey CheerをActivityへ引き継ぐか | MEDIUM |
| Comments | Journeyには個別コメントなし | `activity_comments`あり | 新規ActivityコメントをJourney互換に含めない | Logにコメントを持たせるか | MEDIUM |
| Mission | Journey CREATE後に`requiredAction=journey` | Activity CREATEには別通知処理 | トリガー対象をLog/Activityのどちらかに決定 | 同一投稿で一度だけ進めるか | HIGH |
| Daily Circuit | Journey CREATE後に`journey_done=true` | Activity CREATEでは同じ副作用なし | Logイベントとして維持する案 | Activity作成で達成扱いにするか | HIGH |
| Milestone | Journey件数/streakで判定 | Activity基準未実装 | `portfolio_milestones`は維持し判定元を別途決める | Log件数かActivity件数か | HIGH |
| Pulse | Journey投稿日時、Cheer、Bondを利用 | Activity基準未確定 | 投稿日時と活動日時を分離して再定義 | Pulseの基準イベント | HIGH |
| Portfolio | Journey件数、継続、media、tags | Activity/Momentの新経路あり | Activity履歴とLog/Momentを分離表示候補 | Portfolioの正規実績とは何か | HIGH |
| Timeline | Journey投稿一覧 | Activity/Momentとは責務が異なる | Activity、Log、Momentのどれを表示するか決定 | Timelineの正規イベント | HIGH |
| Realtime | `journeys`全イベントを購読 | Activity/Moment購読は別設計 | Log/Activity/Momentの一つを購読対象にする | 二重イベントを許容するか | HIGH |
| API | `/api/journey*` | `/api/activities*` | 既存Journey URLを互換wrapperとして残す案 | 外部/deep link互換期間 | HIGH |
| upload | `/api/journey/upload` | Activity UIにもmedia uploadあり | Log/Activity/Momentのupload責務を決定 | 既存URLを残すか | MEDIUM |

## 3. 3つの統合モデル

### MODEL A: Journeyを完全にActivityへ統合

- Product meaning: JourneyをActivity Logという名称だけに置き換え、全てをActivityとして扱う
- Data meaning: `content -> description`、`user_slug -> user_id`、投稿日時/活動日時をどちらかへ寄せる
- UX: Activity作成・日次Log・Map・Portfolioを一つの入口にまとめる
- API: `/api/journey*`をActivities APIへwrapper化または廃止
- Side effects: Mission/Daily/Milestone/PulseをActivity CREATEへ移す
- Realtime: ActivityをTimelineの唯一イベントにする案
- RLS: `user_follows`由来のBond可視性をActivity policyへ変換する必要
- Migration complexity: API、UI、side effect、RLS、Realtimeを一括で整理する必要がある
- DROP可能性: 全依存を除去できれば高まる
- 意味変更リスク: 投稿日時、condition、日次制約、Bond可視性が変わる
- 未解決点: ActivityにconditionとLog固有契約を持たせない場合の情報保存先

### MODEL B: Activity中心 + Activity Log補助概念

- Product meaning: Activityは実活動、Activity Logは日次振り返り/投稿のユーザー向け概念
- Data meaning: ActivityとLogの責務を分け、必要ならLogからActivityを参照・生成する
- UX: Activity作成と日次Logを別入口として残し、MomentはActivity周辺の共有物にする
- API: `/api/activities`を正規Activity、旧`/api/journey`はActivity Log互換APIとして段階維持
- Side effects: Daily/Mission/PulseはActivity Logイベント、Map/参加/PlaceはActivityイベントへ分離候補
- Realtime: LogとActivity/Momentのイベントを用途別に購読
- RLS: LogのBond可視性とActivityのConnection可視性を別契約として維持
- Migration complexity: 旧Journeyの意味を保ちやすいが、二つの契約を長期維持する必要
- DROP可能性: JourneyをLog後継へ移行できた後に判断
- 意味変更リスク: 二重記録、重複副作用、ActivityとLogの関係不明確化
- 未解決点: Logを既存テーブルで表現するか、Activity/Momentとの関係をどう持つか

### MODEL C: JourneyとActivityを技術的にも完全分離

- Product meaning: Journeyは日次投稿、Activityは実活動として独立
- Data meaning: 各テーブルの意味を保持し、相互変換しない
- UX: Journey/Activityの二重入口と二重表示を許容
- API: `/api/journey*`と`/api/activities*`を別契約で維持
- Side effects: JourneyはMission/Daily/Pulse、ActivityはMap/Participant/Moment等に限定
- Realtime: `journeys`と`activities`/`moments`を別購読
- RLS: 現行policyをそれぞれ維持
- Migration complexity: データ移行は不要だが、機能・運用の二重管理が続く
- DROP可能性: 低い。Journey依存を解消しない限りDROPできない
- 意味変更リスク: 低いが、UX・集計の二重化リスクが残る
- 未解決点: ユーザーが同じ行動をJourneyとActivityに二重記録する場合の扱い

## 4. Recommended Questions for Founder

Q1. Activity Logの1投稿は「実際に行った活動」そのものですか、それとも「その日の活動を振り返って残すログ」ですか？  
回答:

Q2. `condition_score`はActivityに属しますか、Activity Logに属しますか、それともMomentに属しますか？  
回答:

Q3. 活動日時と投稿日時を別々に保持しますか？  
回答:

Q4. Activity LogはJST基準で1日1件ですか？  
回答:

Q5. ActivityのvisibilityとActivity Logのvisibilityは同一ルールですか？  
回答:

Q6. Bond（`user_follows`）とConnectionを統合しますか？  
回答:

Q7. Bondによる閲覧許可をActivity Logでも維持しますか？  
回答:

Q8. Activity LogからActivityを自動生成しますか、それともActivity作成後にActivity Logを生成しますか？  
回答:

Q9. Activity LogにActivity typeを必須にしますか？  
回答:

Q10. Journey投稿にtitleを要求しますか？  
回答:

Q11. Journey/Activity LogはPlaceなしでも成立しますか？  
回答:

Q12. Mission/Daily CircuitのトリガーはActivity、Activity Log、または両方ですか？  
回答:

Q13. Portfolio Milestoneの件数・streakはActivity、Activity Log、または別のイベントを数えますか？  
回答:

Q14. Pulseのstreakは投稿日時、活動日時、またはActivity Log日時のどれを基準にしますか？  
回答:

Q15. TimelineはActivityを表示しますか、Activity Logを表示しますか、Momentを表示しますか？  
回答:

Q16. Activity CREATEとActivity Log CREATEが同時に起きた場合、副作用は一度だけ実行しますか？  
回答:

Q17. `/api/journey*`は後方互換wrapperとして残しますか？  
回答:

Q18. Journey uploadのURL互換を維持しますか？  
回答:

Q19. Realtimeの正規購読対象はActivity、Activity Log、Momentのどれですか？  
回答:

Q20. 最終的に`journeys`テーブルをDROPすることを目標にしますか？  
回答:

## 5. Phase B Implementation Gates

| Gate | 仕様確定が必要な項目 | 確定後に可能になる実装 |
|---|---|---|
| G1 | ActivityとActivity Logの意味境界 | CREATE経路の選択 |
| G2 | `condition_score`の所属先 | 入力・保存・表示の移行 |
| G3 | 投稿日時/活動日時 | `created_at`/`starts_at`集計の実装 |
| G4 | one-per-dayの対象 | 日次制約の移行 |
| G5 | Bond/Connectionの可視性 | API/RLS互換設計 |
| G6 | Activity type補完 | validationとUI入力 |
| G7 | Placeなしの扱い | Activity CREATE payload |
| G8 | Mission/Daily/Milestone/Pulse trigger | side effect移行と重複防止 |
| G9 | Portfolio/Timelineの正規表示 | READ契約と表示変換 |
| G10 | `/api/journey*`互換期間 | API移行とclient更新 |
| G11 | Realtime正規イベント | subscription移行 |
| G12 | RLS/Policy方針 | 認可実装とnegative test |

**各Gateは「仕様確定 -> 実装可能」の順序とする。仕様未確定のままActivity schemaやAPIを変更しない。**

## 6. DROP Gate

`journeys`のDROPは、次をすべて満たすまで実施しない。

- Journey WRITE参照 = 0
- Journey READ参照 = 0
- Journey DELETE参照 = 0
- `/api/journey*` = 0、または後継APIへの移行完了
- `/api/journey/upload` = 0
- Journey Realtime subscription = 0
- Journey RLS policy = 0
- Mission依存 = 0
- Daily Circuit依存 = 0
- Milestone依存 = 0
- Pulse依存 = 0
- Portfolio依存 = 0
- incoming FK依存 = 0
- function依存 = 0
- view/materialized view依存 = 0
- trigger依存 = 0
- migration/運用手順の整理完了
- Activity/Activity Logへの移行後テスト完了
- 本番backup/checksum確認済み
- rollback手段確立
- 一定期間Activities側のみで正常稼働

## 7. Final Decision Sheet

Q1: Activity Logの意味  
回答:

Q2: `condition_score`の所属先  
回答:

Q3: 投稿日時と活動日時を分離するか  
回答:

Q4: one-per-dayの対象  
回答:

Q5: visibilityの共通化  
回答:

Q6: BondとConnectionの統合  
回答:

Q7: Bond可視性の維持  
回答:

Q8: LogからActivityを生成するか  
回答:

Q9: Activity typeの必須性  
回答:

Q10: titleの必須性  
回答:

Q11: PlaceなしActivityの許可  
回答:

Q12: Mission/Dailyのtrigger対象  
回答:

Q13: Milestoneの集計対象  
回答:

Q14: Pulseの日時基準  
回答:

Q15: Timelineの表示対象  
回答:

Q16: 副作用の重複防止単位  
回答:

Q17: `/api/journey*`の互換期間  
回答:

Q18: upload URL互換  
回答:

Q19: Realtimeの正規対象  
回答:

Q20: `journeys` DROP目標  
回答:

## 8. Risk Classification

| 項目 | リスク |
|---|---|
| condition_scoreの欠落 | HIGH |
| 投稿日時と活動日時の混同 | HIGH |
| Bond/Connection可視性変更 | HIGH |
| Mission/Daily/Milestone/Pulse二重実行 | HIGH |
| Activity type補完 | HIGH |
| API互換性 | HIGH |
| DELETEとActivity FK保全 | HIGH |
| Realtime二重イベント | HIGH |
| Portfolio/Timeline表示変更 | HIGH |
| PlaceなしActivity | MEDIUM |
| media/upload移行 | MEDIUM |
| `user_slug -> user_id` | MEDIUM |
| tags対応 | LOW |
| cheer/comment集計 | MEDIUM |

## Final Gate

- Phase B implementation ready: **NO**
- 未決事項: Q1〜Q20の回答、特にcondition、日時、visibility、one-per-day、type、副作用
- Phase Bで最初に触る候補: `/api/journey/route.ts`、`/api/journey/[id]/route.ts`、`/api/activities/route.ts`、`/api/activities/[id]/route.ts`、`features/activity/validation.ts`、`features/activity/server/activities.ts`
- Phase Bで触ってはいけない領域: Founder決定前のschema、RLS、Realtime、migration、`user_follows`、`portfolio_milestones`、DROP

## 作業制約の確認

本書は意思決定用の設計資料です。今回、コード、DB、SQL、migration、RLS、Realtime、UI、API、Activity schemaは変更していません。 `journeys`の削除・移行も実施していません。
