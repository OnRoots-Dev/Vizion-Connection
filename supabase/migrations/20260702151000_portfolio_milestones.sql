-- portfolio_milestones: 新プロフィール/ポートフォリオ用の達成記録。
-- 訪問者全員に見える想定のため誰でも読取可能。書込みはservice role or トリガーのみ。
-- milestone_type は自由記述text（例: cheers_received_100, journey_streak_30,
-- journeys_posted_50, bond_50）。今後の種別追加はアプリ側の判定ロジック追加のみで対応する。

create table if not exists public.portfolio_milestones (
  id uuid primary key default gen_random_uuid(),
  slug text not null references public.users(slug) on delete cascade,
  milestone_type text not null,
  achieved_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  unique (slug, milestone_type)
);

create index if not exists idx_portfolio_milestones_slug
  on public.portfolio_milestones (slug, achieved_at desc);

alter table public.portfolio_milestones enable row level security;

revoke all on table public.portfolio_milestones from anon, authenticated;
grant select on table public.portfolio_milestones to anon, authenticated;

create policy "portfolio_milestones_select_public"
  on public.portfolio_milestones for select
  to anon, authenticated
  using (true);

alter publication supabase_realtime add table public.portfolio_milestones;

-- bond_50: user_follows への insert は現状クライアントから直接行われる設計
-- (RLSポリシー follows_insert が既に許可している) ため、アプリ層のフックではなく
-- DBトリガーで確実に検知する。SECURITY DEFINER + search_path固定で、
-- portfolio_milestones への書込み権限を持たない anon/authenticated ロールから
-- 呼ばれても安全に insert できるようにする。
create or replace function public.check_bond_milestone()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  bond_total int;
begin
  select count(*) into bond_total
  from public.user_follows
  where target_slug = new.target_slug;

  if bond_total >= 50 then
    insert into public.portfolio_milestones (slug, milestone_type)
    values (new.target_slug, 'bond_50')
    on conflict (slug, milestone_type) do nothing;
  end if;

  return new;
end;
$$;

drop trigger if exists trg_check_bond_milestone on public.user_follows;
create trigger trg_check_bond_milestone
  after insert on public.user_follows
  for each row
  execute function public.check_bond_milestone();
