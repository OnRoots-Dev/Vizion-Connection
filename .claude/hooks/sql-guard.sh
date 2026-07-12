#!/usr/bin/env bash
# PreToolUse hook: destructive-SQL gate for Supabase MCP execute_sql / apply_migration.
# deny  = RLS恒久ルール違反（SECURITY.md）— 絶対禁止
# ask   = 破壊的SQL — 人間の明示的な承認を強制
# ロジック本体は sql-guard.cjs（Windows Git Bash に jq が無いため node で JSON を解析する）
exec node "$(dirname "$0")/sql-guard.cjs"
