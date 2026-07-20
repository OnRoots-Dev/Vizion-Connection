export const AD_CONFIG = {
  // フィード内の広告挿入間隔（コンテンツN件ごとに1広告）
  FEED_AD_INTERVAL: 3,

  // 枠A: Legacy → Presence の順でフィード最上部に固定配置（Above the Fold）
  SLOT_A_TIERS: ["legacy", "presence"] as const,

  // 枠B: Signal のみ。FEED_AD_INTERVAL ごとにインライン挿入
  SLOT_B_TIERS: ["signal"] as const,

  // 地方枠: Roots のみ
  LOCAL_SLOT_TIERS: ["roots"] as const,

  // 表示ウェイト（地方枠は Roots に一本化）
  LOCAL_SLOT_WEIGHTS: {
    roots: 1,
  } as const,

  // フィード内「同時表示」上限（UI 配置ルール）。
  // Business 在庫（ad_slots.total/sold）とは別。在庫は checkout / region-availability を参照。
  SLOT_LIMITS: {
    legacy: 5,
    presence: 20,
    signal: 30,
    roots: 180,
  } as const,

  // 単価（円）
  UNIT_PRICE: {
    legacy: 1_000_000,
    presence: 500_000,
    signal: 100_000,
    roots: 30_000,
  } as const,

  // 枠Aはスクロール前（Above the Fold）に予約表示
  ABOVE_FOLD_RESERVED: true,
} as const;

export type AdTier = "legacy" | "presence" | "signal" | "roots";
export type SlotType = "slot_a" | "slot_b" | "local_slot";
