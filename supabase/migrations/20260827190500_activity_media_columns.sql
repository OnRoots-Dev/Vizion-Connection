-- Activity へのメディア（画像・動画）添付対応。
-- referential / 破壊的変更なし（ADD COLUMN のみ）。既存行は NULL。
-- 書き込み経路: service role のサーバールート（lib/supabase/server.ts → supabaseServer）。
-- RLS: 既存 activities のポリシーに変更なし（追加カラムは既存の可視性規則に従う）。
alter table public.activities
    add column if not exists image_url text,
    add column if not exists video_url text;

comment on column public.activities.image_url is
    'Optional attached image (Supabase Storage public URL). Reuses profiles bucket.';
comment on column public.activities.video_url is
    'Optional attached video (Supabase Storage public URL). Reuses profiles bucket.';
