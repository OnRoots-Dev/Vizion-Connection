#!/usr/bin/env bash
# PreToolUse hook: PII・シークレット漏洩ガード（Write/Edit と git commit 対象）。
# (a) 設定ファイルへのシークレット直書き検知 → deny（${ENV_VAR} 参照を強制）
# (b) コードへの PII フィールドの console 出力検知 → deny（マスキングを強制）
# (c) git commit 時: .env*/*.pem のステージ、追加行のシークレット/PIIログ検知 → deny
# ロジック本体は pii-guard.cjs
exec node "$(dirname "$0")/pii-guard.cjs"
