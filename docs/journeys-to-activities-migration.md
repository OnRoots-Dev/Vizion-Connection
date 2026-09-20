# journeys -> activities 移行

基準日: 2026-09-18

## 前提

- P0-1の全件バックアップを完了していること
- 本スクリプトは`journeys`を削除・更新しない
- `activities`のスキーマと`users`の正規データが対象DBに適用済みであること
- 実行前にステージングで検証し、承認後に本番へ実行すること

## スキーマ確認

`journeys`は次のmigrationで定義・拡張されています。

- `supabase/migrations/20260608_journey_unification.sql`
- `supabase/migrations/20260613090000_add_journeys_tags.sql`
- `supabase/migrations/20260720120000_rls_profiles_ad_slots_follows_journeys.sql`（RLS、grant、indexを更新）

`activities`は次で定義されています。

- `supabase/migrations/20260825090000_p0_core_model_contract.sql`
- `supabase/migrations/20260827190500_activity_media_columns.sql`

## カラムマッピング

| journeys | activities | 変換 | 備考 |
|---|---|---|---|
| `id uuid` | `id uuid` | そのまま使用 | 外部IDを同一にして再実行時のupsertキーにする |
| `user_slug text` | `user_id bigint` | `users.slug`から`users.id`をJOIN | 対応する`users`がない行は移行不能としてログ出力 |
| なし | `type` | tagsに許可値があれば採用。なければ`other` | Journeyに独立した種目カラムがないため補完 |
| なし | `title` | `NULL` | 元データにタイトルがないため |
| `content` | `description` | そのまま | 投稿本文をActivity説明として保持 |
| `created_at` | `starts_at` | そのまま | Journeyは開始日時を持たないため作成日時を使用 |
| なし | `ends_at` | `NULL` | 終了日時の情報がないため |
| なし | `place_id` | `NULL` | Journeyに場所・座標・Place FKがないため。推測で場所を作らない |
| `is_public` | `visibility` | `true`=`public`, `false`=`private` | Journeyに`connections`相当の状態がないため |
| `tags` | `tags` | そのまま | 種目判定にも使用 |
| `condition_score` | `tags` | `legacy:condition_score=N`を追加 | 正規カラムがないため、値を捨てずタグへ退避 |
| なし | `status` | `completed` | Journeyは既存の記録・投稿であり、予定Activityではないため |
| `image_url` | `image_url` | そのまま | |
| `video_url` | `video_url` | そのまま | |
| `cheer_count` | `cheer_count` | そのまま | 旧Cheer集計を保持。個別Cheer行は別移行対象外 |
| なし | `comment_count` | `0` | Journeyにコメント情報がないため |
| `created_at` | `created_at` | そのまま | |
| なし | `updated_at` | `created_at`を使用 | 旧テーブルに更新日時がないため |

### 移行先がない情報

- **場所**: `journeys`に場所名・住所・緯度経度がないため、`places`を推測作成せず`place_id=NULL`
- **終了日時**: 情報がないため`ends_at=NULL`
- **タイトル**: 情報がないため`title=NULL`
- **Connection公開範囲**: 旧`is_public`から`public/private`のみへ変換
- **コメント個別行**: `journeys`にコメントテーブルへのFK・本文がないため、`comment_count=0`

## 実行方法

### ステージング

```powershell
$env:DATABASE_URL = "postgresql://<staging>"
node scripts/migrate-journeys-to-activities.mjs
```

同じスクリプトを2回実行しても、`journeys.id = activities.id`のupsertなので重複行は作成されません。

### 本番

1. P0-1バックアップの`manifest.json`と保管先を確認
2. ステージングの件数・サンプル・MVP画面を確認
3. 承認者とDB管理者が実行対象DBを二重確認
4. 書き込み負荷の低い時間帯に実行
5. 実行ログをチケットへ記録（個人情報そのものは添付しない）

```powershell
$env:DATABASE_URL = "postgresql://<production>"
node scripts/migrate-journeys-to-activities.mjs
```

## 出力ログと判定

スクリプトは次を出力します。

- `journeys_total`: 移行前の全Journey件数
- `migrated_total`: `users`を解決でき、Activityへupsertした件数
- `skipped_total`: 移行不能件数
- `activities_matched_by_external_id`: 同じIDでActivityに存在する件数
- サンプル10件のユーザー、日時、種目、公開範囲、本文、メディア比較
- フィールド別不一致件数
- 移行不能レコードと理由

受け入れ条件は次です。

```text
journeys_total = migrated_total + skipped_total
journeys_total = activities_matched_by_external_id + skipped_total
missing_activity = 0
user_mismatch = 0
timestamp_mismatch = 0
content_mismatch = 0
image_mismatch = 0
video_mismatch = 0
visibility_mismatch = 0
```

`skipped_total > 0`の場合、最後の「移行不能レコード」結果を保存し、usersの欠損を解消してから再実行します。`skipped`行はActivityを作らないため、全件移行完了とは扱いません。

## 実行ログ

この環境ではステージングDB接続URLと`psql`が利用できないため、実行ログは未取得です。接続可能なステージングで実行し、上記の集計結果とサンプル比較をチケットに記録してください。

## ロールバック

本スクリプトは`journeys`を変更しません。移行したActivityだけを戻す必要がある場合は、`journeys.id`に一致するActivityを特定してから、別途承認済みのロールバックSQLを作成します。本チケットでは本番ActivityのDELETEは行いません。
