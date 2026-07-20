-- =============================================================================
-- Seed: Discovery 用プロフィール（users ≒ profiles）約20件
--       + ad_slots（47都道府県 roots + 全国 signal/presence/legacy）
-- 用途: 開発・検証用。本番適用前に内容を確認すること。
-- sold は全て 0 で初期化。
-- password_hash はダミー（ログイン不可想定。実運用では使わない）。
-- =============================================================================

-- ── ad_slots ──────────────────────────────────────────────────────────────────
-- 冪等: ON CONFLICT (prefecture, tier) DO UPDATE

insert into public.ad_slots (prefecture, tier, total, sold) values
  -- 北海道・東北 (sum=20)
  ('北海道', 'roots', 3, 0),
  ('青森県', 'roots', 3, 0),
  ('岩手県', 'roots', 3, 0),
  ('宮城県', 'roots', 3, 0),
  ('秋田県', 'roots', 3, 0),
  ('山形県', 'roots', 3, 0),
  ('福島県', 'roots', 2, 0),
  -- 関東 (sum=20)
  ('茨城県', 'roots', 3, 0),
  ('栃木県', 'roots', 3, 0),
  ('群馬県', 'roots', 3, 0),
  ('埼玉県', 'roots', 3, 0),
  ('千葉県', 'roots', 3, 0),
  ('東京都', 'roots', 3, 0),
  ('神奈川県', 'roots', 2, 0),
  -- 中部 (sum=20)
  ('新潟県', 'roots', 3, 0),
  ('富山県', 'roots', 2, 0),
  ('石川県', 'roots', 2, 0),
  ('福井県', 'roots', 2, 0),
  ('山梨県', 'roots', 2, 0),
  ('長野県', 'roots', 2, 0),
  ('岐阜県', 'roots', 2, 0),
  ('静岡県', 'roots', 2, 0),
  ('愛知県', 'roots', 3, 0),
  -- 近畿 (sum=20)
  ('三重県', 'roots', 3, 0),
  ('滋賀県', 'roots', 3, 0),
  ('京都府', 'roots', 3, 0),
  ('大阪府', 'roots', 3, 0),
  ('兵庫県', 'roots', 3, 0),
  ('奈良県', 'roots', 3, 0),
  ('和歌山県', 'roots', 2, 0),
  -- 中国・四国 (sum=20)
  ('鳥取県', 'roots', 2, 0),
  ('島根県', 'roots', 2, 0),
  ('岡山県', 'roots', 2, 0),
  ('広島県', 'roots', 3, 0),
  ('山口県', 'roots', 2, 0),
  ('徳島県', 'roots', 2, 0),
  ('香川県', 'roots', 2, 0),
  ('愛媛県', 'roots', 3, 0),
  ('高知県', 'roots', 2, 0),
  -- 九州・沖縄 (sum=20)
  ('福岡県', 'roots', 3, 0),
  ('佐賀県', 'roots', 2, 0),
  ('長崎県', 'roots', 3, 0),
  ('熊本県', 'roots', 3, 0),
  ('大分県', 'roots', 2, 0),
  ('宮崎県', 'roots', 2, 0),
  ('鹿児島県', 'roots', 3, 0),
  ('沖縄県', 'roots', 2, 0),
  -- 全国プラン
  ('全国', 'signal', 30, 0),
  ('全国', 'presence', 10, 0),
  ('全国', 'legacy', 5, 0)
on conflict (prefecture, tier) do update
  set total = excluded.total,
      sold = 0,
      updated_at = now();

-- ── Discovery 用テストプロフィール（users）──────────────────────────────────
-- slug 規則: ^[a-z0-9_.]{3,30}$
-- is_public=true / is_deleted=false で Discovery に出る
-- email は seed 専用ドメイン（既存と衝突しにくい）

insert into public.users (
  slug, display_name, email, password_hash, role,
  is_public, is_deleted, verified, is_onboarding_complete,
  region, prefecture, sport, bio, cheer_count
) values
  ('seed_runner_tokyo', '青木 陸', 'seed.runner.tokyo@example.invalid', 'SEED_HASH_NOT_LOGINABLE', 'Athlete', true, false, true, true, '関東', '東京都', '陸上', '都内で短距離を走るテストアスリート。', 12),
  ('seed_soccer_osaka', '田中 翔', 'seed.soccer.osaka@example.invalid', 'SEED_HASH_NOT_LOGINABLE', 'Athlete', true, false, true, true, '近畿', '大阪府', 'サッカー', '関西リーグ所属のテスト選手。', 28),
  ('seed_basket_aichi', '佐藤 美咲', 'seed.basket.aichi@example.invalid', 'SEED_HASH_NOT_LOGINABLE', 'Athlete', true, false, true, true, '中部', '愛知県', 'バスケットボール', 'Bリーグを目指すガード。', 19),
  ('seed_swim_fukuoka', '鈴木 海', 'seed.swim.fukuoka@example.invalid', 'SEED_HASH_NOT_LOGINABLE', 'Athlete', true, false, true, true, '九州・沖縄', '福岡県', '水泳', '自由形200mが得意。', 8),
  ('seed_tennis_hokkaido', '伊藤 蓮', 'seed.tennis.hokkaido@example.invalid', 'SEED_HASH_NOT_LOGINABLE', 'Athlete', true, false, true, true, '北海道', '北海道', 'テニス', '札幌拠点のシングルス選手。', 5),
  ('seed_baseball_miyagi', '渡辺 大輝', 'seed.baseball.miyagi@example.invalid', 'SEED_HASH_NOT_LOGINABLE', 'Athlete', true, false, true, true, '東北', '宮城県', '野球', '投手志望のテストデータ。', 15),
  ('seed_volley_kyoto', '中村 結衣', 'seed.volley.kyoto@example.invalid', 'SEED_HASH_NOT_LOGINABLE', 'Athlete', true, false, true, true, '近畿', '京都府', 'バレーボール', 'セッター。', 11),
  ('seed_rugby_kanagawa', '小林 剛', 'seed.rugby.kanagawa@example.invalid', 'SEED_HASH_NOT_LOGINABLE', 'Athlete', true, false, true, true, '関東', '神奈川県', 'ラグビー', 'FW。', 7),
  ('seed_trainer_tokyo', '加藤 コーチ', 'seed.trainer.tokyo@example.invalid', 'SEED_HASH_NOT_LOGINABLE', 'Trainer', true, false, true, true, '関東', '東京都', 'ストレングス', 'パーソナル・チーム帯同対応。', 22),
  ('seed_trainer_osaka', '吉田 リハ', 'seed.trainer.osaka@example.invalid', 'SEED_HASH_NOT_LOGINABLE', 'Trainer', true, false, true, true, '近畿', '大阪府', 'リハビリ', 'ACL後の復帰サポート。', 9),
  ('seed_trainer_aichi', '山本 栄養', 'seed.trainer.aichi@example.invalid', 'SEED_HASH_NOT_LOGINABLE', 'Trainer', true, false, true, true, '中部', '愛知県', '栄養サポート', '試合期の食事設計。', 6),
  ('seed_crew_tokyo', '松本 ファン', 'seed.crew.tokyo@example.invalid', 'SEED_HASH_NOT_LOGINABLE', 'Crew', true, false, true, true, '関東', '東京都', 'スポーツ観戦', 'ホームゲーム応援。', 4),
  ('seed_crew_hiroshima', '井上 サポ', 'seed.crew.hiroshima@example.invalid', 'SEED_HASH_NOT_LOGINABLE', 'Crew', true, false, true, true, '中国', '広島県', '応援活動', '地域イベント参加。', 3),
  ('seed_crew_okinawa', '木村 ボラ', 'seed.crew.okinawa@example.invalid', 'SEED_HASH_NOT_LOGINABLE', 'Crew', true, false, true, true, '九州・沖縄', '沖縄県', 'ボランティア', '大会運営ボランティア。', 2),
  ('seed_biz_signal', 'Vizion Sports Co', 'seed.biz.signal@example.invalid', 'SEED_HASH_NOT_LOGINABLE', 'Business', true, false, true, true, '関東', '東京都', 'スポンサー', '全国展開ブランドのテスト企業。', 1),
  ('seed_biz_roots', 'Local Gear Shop', 'seed.biz.roots@example.invalid', 'SEED_HASH_NOT_LOGINABLE', 'Business', true, false, true, true, '近畿', '大阪府', 'スポーツマーケティング', '地域密着ギアショップ。', 0),
  ('seed_golf_chiba', '林 プロ', 'seed.golf.chiba@example.invalid', 'SEED_HASH_NOT_LOGINABLE', 'Athlete', true, false, true, true, '関東', '千葉県', 'ゴルフ', 'アマチュア大会出場。', 10),
  ('seed_martial_osaka', '森 拳', 'seed.martial.osaka@example.invalid', 'SEED_HASH_NOT_LOGINABLE', 'Athlete', true, false, true, true, '近畿', '大阪府', '格闘技', 'キックボクシング。', 14),
  ('seed_dance_tokyo', '清水 舞', 'seed.dance.tokyo@example.invalid', 'SEED_HASH_NOT_LOGINABLE', 'Athlete', true, false, true, true, '関東', '東京都', 'ダンス', 'ヒップホップチーム所属。', 16),
  ('seed_esports_fukuoka', '池田 ネト', 'seed.esports.fukuoka@example.invalid', 'SEED_HASH_NOT_LOGINABLE', 'Athlete', true, false, true, true, '九州・沖縄', '福岡県', 'eスポーツ', 'FPS チームメンバー。', 13)
on conflict (slug) do update
  set display_name = excluded.display_name,
      role = excluded.role,
      is_public = true,
      is_deleted = false,
      region = excluded.region,
      prefecture = excluded.prefecture,
      sport = excluded.sport,
      bio = excluded.bio,
      cheer_count = excluded.cheer_count;

-- email 衝突時のフォールバック（slug が違うが email が既存の場合はスキップされる想定）
-- 必要なら DELETE FROM users WHERE email LIKE 'seed.%@example.invalid'; で掃除可
