#!/usr/bin/env bash
# PreToolUse hook: 破壊的シェルコマンドのブロック（Bash / PowerShell ツール対象）。
# deny = リポジトリ/機密ファイルを壊すコマンド、ask = 危険だが正当な場合もあるコマンド。
# ロジック本体は protect.cjs
exec node "$(dirname "$0")/protect.cjs"
