-- 1. daily_logsテーブルを削除（空テーブルのため安全）
DROP TABLE IF EXISTS daily_logs CASCADE;

-- 2. journeysテーブルを新規作成
CREATE TABLE IF NOT EXISTS journeys (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_slug     text NOT NULL REFERENCES users(slug) ON DELETE CASCADE,
  content       text NOT NULL,
  condition_score int CHECK (condition_score BETWEEN 1 AND 5),
  image_url     text,
  video_url     text,
  cheer_count   int NOT NULL DEFAULT 0,
  is_public     boolean NOT NULL DEFAULT true,
  created_at    timestamptz NOT NULL DEFAULT now()
);

-- 3. journeysのRLS設定
ALTER TABLE journeys ENABLE ROW LEVEL SECURITY;

-- 全員が公開journeyを閲覧可能（anon含む）
DROP POLICY IF EXISTS "journeys_select_public" ON journeys;
CREATE POLICY "journeys_select_public" ON journeys
  FOR SELECT USING (is_public = true);

-- 本人のみ自分のjourneyを全て閲覧可能（非公開含む）
DROP POLICY IF EXISTS "journeys_select_own" ON journeys;
CREATE POLICY "journeys_select_own" ON journeys
  FOR SELECT USING (
    user_slug = (
      SELECT slug FROM users
      WHERE auth_id = auth.uid()
    )
  );

-- 本人のみinsert可能
DROP POLICY IF EXISTS "journeys_insert_own" ON journeys;
CREATE POLICY "journeys_insert_own" ON journeys
  FOR INSERT WITH CHECK (
    user_slug = (
      SELECT slug FROM users
      WHERE auth_id = auth.uid()
    )
  );

-- 本人のみdelete可能
DROP POLICY IF EXISTS "journeys_delete_own" ON journeys;
CREATE POLICY "journeys_delete_own" ON journeys
  FOR DELETE USING (
    user_slug = (
      SELECT slug FROM users
      WHERE auth_id = auth.uid()
    )
  );

-- 4. user_followsのRLS設定（テーブルは存在済み）
ALTER TABLE user_follows ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "follows_select" ON user_follows;
CREATE POLICY "follows_select" ON user_follows
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "follows_insert" ON user_follows;
CREATE POLICY "follows_insert" ON user_follows
  FOR INSERT WITH CHECK (
    follower_slug = (
      SELECT slug FROM users
      WHERE auth_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "follows_delete" ON user_follows;
CREATE POLICY "follows_delete" ON user_follows
  FOR DELETE USING (
    follower_slug = (
      SELECT slug FROM users
      WHERE auth_id = auth.uid()
    )
  );

-- 5. インデックス追加（パフォーマンス）
CREATE INDEX IF NOT EXISTS idx_journeys_user_slug
  ON journeys(user_slug);
CREATE INDEX IF NOT EXISTS idx_journeys_created_at
  ON journeys(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_user_follows_follower
  ON user_follows(follower_slug);
CREATE INDEX IF NOT EXISTS idx_user_follows_target
  ON user_follows(target_slug);
