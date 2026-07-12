#!/usr/bin/env bash
# PostToolUse hook: 編集後の自動フォーマット（非ブロック — 常に exit 0）。
# Prettier は未導入のため ESLint --fix を使用。.ts/.tsx のみ対象。
exec node "$(dirname "$0")/format.cjs"
