# 旧テーブル復元ランブック

旧テーブル削除後に新モデル移行の不整合が判明した場合の、ステージング検証と緊急復旧手順です。

## 前提と制約

P0-1の出力は `--data-only` ダンプです。したがって、削除したテーブルを完全に復元するには、先に同じスキーマをmigrationまたはschema dumpから再作成する必要があります。データダンプだけではテーブル定義、インデックス、RLS、関数、権限は復元されません。

復元対象は、バックアップディレクトリの `manifest.json` に記録されたテーブルだけです。新形式の`.json`ダンプを優先し、P0-1の旧`.sql`ダンプもNodeのDBクライアントで読み込めます。対象DBの既存データを自動的に上書きしないため、既存行がある場合は停止します。

## 誰が実行するか

1. **サービスオーナー/DB管理者**: 障害判定、復元承認、対象環境の確認
2. **アプリ担当者**: API/UIを停止またはメンテナンス表示にし、復元後の主要導線を確認
3. **DB管理者**: スキーマ再作成、リストアスクリプト実行、検証結果の保管

本番で実行する場合は、必ず承認者、開始時刻、対象DB、バックアップハッシュ、終了時刻を記録します。

## 緊急時の順序

### 1. 書き込み停止

- デプロイを停止する
- 対象テーブルを使うAPIの書き込みを停止する
- 可能ならアプリをメンテナンスモードにする
- SupabaseのDatabase/Project環境名が本番かステージングかを二人で確認する

### 2. バックアップを選ぶ

バックアップディレクトリにある `manifest.json` の生成日時、対象環境、承認済み外部ストレージ上のハッシュを確認します。対象テーブルの件数とchecksumが記録されていない古いmanifestは、件数検証のみとなるため、完全一致の証跡としては使用しません。

### 3. スキーマを復元する

テーブルが削除済みの場合、対象テーブルを作成したmigrationを、依存関係の順に適用します。P0-1のデータSQLだけを先に実行してはいけません。

スキーマ適用後、次で対象テーブルの存在を確認します。

```powershell
$env:DATABASE_URL = "postgresql://..."
node -e "import('pg').then(async ({default: pg}) => { const c = new pg.Client({connectionString: process.env.DATABASE_URL}); await c.connect(); console.log((await c.query(\"select table_name from information_schema.tables where table_schema = 'public' order by table_name\")).rows); await c.end(); })"
```

### 4. ステージングで復元する

```powershell
$env:DATABASE_URL = "postgresql://<staging>"
$env:RESTORE_CONFIRM = "YES"
node scripts/restore-legacy-tables.mjs --backup-dir="C:\Secure\vizion-connection-legacy-backup\2026-09-18"
```

既存のステージングデータを破棄して疑似削除・復元サイクルを検証する場合だけ、明示的に`--truncate`を付けます。`TRUNCATE`は不可逆なので、対象DBがステージングであることを確認してから実行します。

```powershell
$env:DATABASE_URL = "postgresql://<staging>"
$env:RESTORE_CONFIRM = "YES"
node scripts/restore-legacy-tables.mjs --backup-dir="C:\Secure\vizion-connection-legacy-backup\2026-09-18" --truncate
```

スクリプトは各テーブルの件数と、manifestに保存された全行checksumを比較します。`FAIL`が1件でもあれば復元成功とは扱いません。

### 5. SQLで再確認する

```powershell
node -e "import('pg').then(async ({default: pg}) => { const c = new pg.Client({connectionString: process.env.DATABASE_URL}); await c.connect(); const fs = await import('node:fs/promises'); await c.query(await fs.readFile('docs/legacy-restore-verification.sql', 'utf8')); await c.end(); })"
```

件数はmanifestと一致し、主要カラムのサンプルはバックアップ時の`manifest.json`の`sample`と一致している必要があります。checksumが一致している場合、全行のJSON正規化文字列に基づく比較も通っています。

### 6. アプリ確認

- Profile/公開Profile
- Portfolio
- Schedule
- Activity/Moment/Viz Map
- Connection/Cheer
- Business checkout

をステージングで確認します。旧機能の復旧確認だけでMVPコアの確認を省略してはいけません。

### 7. 再開判断

DB管理者、アプリ担当者、サービスオーナーが、次の3点を確認してから書き込みを再開します。

- リストアスクリプトが全テーブル`PASS`
- `legacy-restore-verification.sql`の件数・サンプルが一致
- アプリの主要導線とエラーログに異常がない

## ステージング検証サイクル

推奨順序は「バックアップ → 件数記録 → 疑似削除 → 復元 → 自動比較」です。

```powershell
# 1. ステージング接続を設定
$env:DATABASE_URL = "postgresql://<staging>"

# 2. エクスポート
$env:BACKUP_OUTPUT_DIR = "C:\Secure\vizion-connection-staging-backup\2026-09-18"
node scripts/backup-legacy-tables.mjs

# 3. 対象テーブルを疑似削除（データだけ消す。DROPは禁止）
node -e "import('pg').then(async ({default: pg}) => { const c = new pg.Client({connectionString: process.env.DATABASE_URL}); await c.connect(); await c.query('truncate table public.journeys, public.user_follows, public.ads, public.events, public.event_invites, public.event_reminders, public.business_orders, public.business_sponsorships, public.portfolio_milestones restart identity'); await c.end(); })"

# 4. 復元とchecksum検証
$env:RESTORE_CONFIRM = "YES"
node scripts/restore-legacy-tables.mjs --backup-dir=$env:BACKUP_OUTPUT_DIR
```

接続可能なステージング環境で実行し、`PASS`ログと`manifest.json`をチケットに機密情報として添付せず、承認済みストレージの参照IDだけを記録してください。

## ロールバック不能条件

- manifestがない、またはchecksumがない
- 対象DBを特定できない
- schema migrationの適用順が確認できない
- 件数またはchecksumが不一致
- RLS、FK、インデックス、権限の再確認ができない

この場合は本番復元を中止し、DB管理者がsnapshot/PITRまたはSupabaseサポート手順を選択します。