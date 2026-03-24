-- supabase/migrations/career_profiles.sql
-- usersテーブルのslugを外部キーとして使用（既存のusersテーブルに合わせる）

create table if not exists public.career_profiles (
  id            bigserial primary key,
  user_slug     text not null unique,           -- users.slug と対応

  -- キャリア基本情報
  tagline       text,
  bio_career    text,                           -- プロフィールbioとは別のキャリア用bio

  -- 活動場所
  country_code  text not null default 'JP',
  country_name  text,

  -- 実績数値 (JSON配列: [{value, label, color}])
  stats         jsonb not null default '[]'::jsonb,

  -- キャリア年表 (JSON配列)
  episodes      jsonb not null default '[]'::jsonb,

  -- スキル (JSON配列: [{name, level, isHighlight}])
  skills        jsonb not null default '[]'::jsonb,

  -- CTA設定
  cta_title     text,
  cta_sub       text,
  cta_btn       text,

  -- SNS (既存usersテーブルにもあるが、キャリアページ用に独立して持つ)
  sns_x         text,
  sns_instagram text,
  sns_tiktok    text,

  -- 公開設定
  visibility    text not null default 'public'
                check (visibility in ('public', 'members', 'private')),

  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

-- インデックス
create index if not exists career_profiles_user_slug_idx
  on public.career_profiles(user_slug);

-- updated_at 自動更新
create or replace function public.update_career_profiles_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists trg_career_profiles_updated_at on public.career_profiles;
create trigger trg_career_profiles_updated_at
  before update on public.career_profiles
  for each row execute function public.update_career_profiles_updated_at();

-- RLS無効（既存usersテーブルと同様にservice_role_keyで操作）
-- alter table public.career_profiles enable row level security;
