# 旧モデル全件バックアップ

旧モデルを削除する前に、対象テーブルをJSON形式で全件退避する手順です。バックアップには個人情報・決済情報・利用履歴が含まれる可能性があります。

## 対象テーブル

必須対象:

- `journeys`
- `user_follows`
- `ads`
- `events`
- `event_invites`
- `event_reminders`
- `business_orders`
- `business_sponsorships`
- `portfolio_milestones`

`mvp-scope.ts`で封印されている旧機能に対応する候補もスクリプトに含めています。対象DBに存在する場合だけエクスポートされます:

- `user_onetime_mission_rewards`, `discovery_events`, `ad_events`, `business_offers`
- `member_hub_events`, `member_reward_definitions`, `member_reward_unlocks`
- `trainer_clients`, `trainer_sessions`, `trainer_reviews`
- `news_posts`, `news_post_comments`, `openlab_posts`, `openlab_upvotes`
- `mission_definitions`, `user_mission_progress`, `referrals`, `card_collections`

実際の対象は、実行時に `information_schema.tables` で確認します。指定した必須テーブルが1つでも存在しない場合、スクリプトは削除やバックアップを行わず停止します。

## 前提

- 対象DBへ接続できるPostgreSQL接続URLがあること
- リポジトリの依存関係を`npm install`済みであること（`pg`を使用）
- 接続URLは `DATABASE_URL`、`SUPABASE_DB_URL`、または `POSTGRES_URL` のいずれかに設定すること
- 接続URLやパスワードをログ・Git・チャットへ出力しないこと
- Supabaseのanon keyやservice-role keyは接続URLの代用になりません

Supabaseの接続URLは、対象プロジェクトのDatabase接続情報から取得してください。ローカル/ステージング/本番はURLを取り違えないよう、実行前に環境名を確認します。

## 実行方法

PowerShell:

```powershell
$env:DATABASE_URL = "postgresql://..."
node scripts/backup-legacy-tables.mjs
```

リポジトリ内に出力したい場合は、Git管理対象外のディレクトリを明示します。ただし、既定の出力先はリポジトリ外です。

```powershell
$env:BACKUP_OUTPUT_DIR = "C:\Secure\vizion-connection-legacy-backup\2026-09-18"
node scripts/backup-legacy-tables.mjs
```

既定の出力先:

```text
リポジトリの親ディレクトリ/vizion-connection-legacy-backup/
```

各テーブルについて次のファイルが生成されます。

- `<table>.json`: 列名と全行を含むNode取得データ。リストア時はパラメータ付きINSERTに使用
- `manifest.json`: DB件数、ダンプ内INSERT件数、判定結果
- `README.txt`: 機密バックアップであることの注意書き

既存ファイルは上書きしません。再実行する場合は、別の出力ディレクトリを指定するか、内容を確認したうえで出力ディレクトリを削除してください。

## 検証

スクリプトは各テーブルについて次を実行します。

1. `SELECT COUNT(*) FROM public.<table>`
2. Nodeで取得したJSON行数
3. 1と2が一致するかを比較

成功ログの例:

```text
PASS journeys: SELECT COUNT(*)=1234, dump INSERT rows=1234
PASS user_follows: SELECT COUNT(*)=87, dump INSERT rows=87
Backup complete: 2 table(s) written to ...
```

`FAIL`が1件でも出た場合、または終了コードが0でない場合は削除を進めないでください。`manifest.json`と対象DBの状態を確認し、別ディレクトリへ再取得します。

## 想定所要時間

所要時間はレコード数、回線、DB負荷に依存します。小規模なローカル/ステージングDBは通常数秒から数分、本番の大規模テーブルは数分以上を想定してください。実行中は対象DBへの負荷が発生するため、削除作業前の低トラフィック時間帯に行います。

## 実行後の保管

検証後、出力ディレクトリをリポジトリ外の承認済み社外秘ストレージへ移動してください。バックアップをGitにコミットしたり、Issue・チャット・ログへ添付したりしないでください。移動後にローカルの一時コピーを削除し、ストレージ側のアクセス権と保持期間を確認します。

## 実行結果

接続可能な環境で上記コマンドを実行し、生成された`manifest.json`と`PASS`ログを削除承認の証跡として保管してください。
