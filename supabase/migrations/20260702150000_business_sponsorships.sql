-- business_sponsorships: 企業(Business)が支援するアスリート等の紐付け。
-- 支援対象の企業一覧はプロフィール/ポートフォリオで公開表示するため誰でも読取可能。
-- 書込みは service role 経由のみ（cheers/business_orders と同じ方針）。

create table if not exists public.business_sponsorships (
  id uuid primary key default gen_random_uuid(),
  business_user_slug text not null references public.users(slug) on delete cascade,
  sponsored_user_slug text not null references public.users(slug) on delete cascade,
  plan_id text not null check (plan_id in ('roots', 'signal', 'presence', 'legacy')),
  business_order_id bigint references public.business_orders(id) on delete set null,
  started_at timestamptz not null default now(),
  ended_at timestamptz,
  created_at timestamptz not null default now(),
  unique (business_user_slug, sponsored_user_slug, plan_id, business_order_id)
);

create index if not exists idx_business_sponsorships_sponsored
  on public.business_sponsorships (sponsored_user_slug, ended_at);
create index if not exists idx_business_sponsorships_business
  on public.business_sponsorships (business_user_slug, ended_at);

alter table public.business_sponsorships enable row level security;

revoke all on table public.business_sponsorships from anon, authenticated;
grant select on table public.business_sponsorships to anon, authenticated;

create policy "business_sponsorships_select_public"
  on public.business_sponsorships for select
  to anon, authenticated
  using (true);
