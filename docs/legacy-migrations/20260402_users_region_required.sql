-- Ensure users.region is mandatory for new records.
-- Existing nulls are backfilled to "未設定" so migration can be applied safely.

update public.users
set region = '未設定'
where region is null;

alter table public.users
  alter column region set default '未設定';

alter table public.users
  alter column region set not null;
