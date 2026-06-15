-- Journey 活動タグ（活動の種類）を追加。
-- image_url / video_url / is_public は既存（20260608_journey_unification.sql）。
-- 本マイグレーションは tags のみ追加する追加的・後方互換な変更。

ALTER TABLE journeys
  ADD COLUMN IF NOT EXISTS tags text[] NOT NULL DEFAULT '{}';

-- タグ検索（将来の絞り込み/集計）用の GIN インデックス
CREATE INDEX IF NOT EXISTS idx_journeys_tags
  ON journeys USING GIN (tags);
