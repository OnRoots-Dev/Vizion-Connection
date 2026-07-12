-- Business plan activation flow
-- 1) users.plan を追加し、ダッシュボードの free/paid 判定をDBで保持
-- 2) business_orders の参照性能を向上（完了・保留の検索用）

alter table public.users
  add column if not exists plan text not null default 'free'
  check (plan in ('free', 'paid'));

create index if not exists idx_business_orders_slug_status_created_at
  on public.business_orders (slug, status, created_at desc);
