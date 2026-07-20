-- ad_slots: 法人プラン掲載枠の在庫管理（都道府県 / 全国 × tier）
-- SELECT は公開可。書き込みは service role のみ（RLS deny-all for anon/authenticated write）。

create table if not exists public.ad_slots (
  id uuid primary key default gen_random_uuid(),
  prefecture text not null,
  tier text not null
    check (tier = any (array['roots'::text, 'signal'::text, 'presence'::text, 'legacy'::text])),
  total integer not null check (total >= 0),
  sold integer not null default 0 check (sold >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint ad_slots_prefecture_tier_unique unique (prefecture, tier),
  constraint ad_slots_sold_lte_total check (sold <= total)
);

comment on table public.ad_slots is 'Business 掲載枠在庫。prefecture=都道府県名 or 全国。remaining = total - sold';
comment on column public.ad_slots.prefecture is '都道府県名（例: 東京都）または 全国';
comment on column public.ad_slots.tier is 'roots | signal | presence | legacy';

create index if not exists idx_ad_slots_tier on public.ad_slots (tier);
create index if not exists idx_ad_slots_prefecture on public.ad_slots (prefecture);

alter table public.ad_slots enable row level security;

-- 公開 SELECT（残枠表示用）。書き込みポリシーなし = deny-all for anon/authenticated
drop policy if exists "ad_slots_select_public" on public.ad_slots;
create policy "ad_slots_select_public"
  on public.ad_slots
  for select
  to anon, authenticated
  using (true);

revoke insert, update, delete on public.ad_slots from anon, authenticated;
grant select on public.ad_slots to anon, authenticated;
