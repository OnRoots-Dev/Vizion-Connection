-- DAY 0宣言の永続化
-- day0_declaration: オンボーディングで入力する挑戦宣言文
-- day0_date: 「DAY○○」カウントの基準日（宣言を刻んだ日時）
alter table public.users
  add column if not exists day0_declaration text,
  add column if not exists day0_date timestamptz;
