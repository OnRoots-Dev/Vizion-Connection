-- users.sports が本番に存在しないドリフト修正。
-- 背景: 20260411133000_add_users_sports_array.sql（add column if not exists sports text[]) が本番に適用済みでない。
-- 「正」は実DBスキーマ（supabase/migrations/CLAUDE.md）。カタログ確認で users.sports 欠落を確認済み。
-- 追加変更のみ（非破壊）。既存データには触れない。
-- 2026-09-05: R7 E2E 検証中に profile/save / オンボーディング保存が PGRST204 で静かに失敗する事象を発見。
alter table public.users
  add column if not exists sports text[] not null default '{}';