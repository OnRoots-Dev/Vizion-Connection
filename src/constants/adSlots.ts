export const AD_CONFIG = {
  // フィード内の広告挿入間隔（コンテンツN件ごとに1広告）
  FEED_AD_INTERVAL: 3,

  // 枠A: Legacy → Presence の順でフィード最上部に固定配置（Above the Fold）
  SLOT_A_TIERS: ["legacy", "presence"] as const,

  // 枠B: Signal のみ。FEED_AD_INTERVAL ごとにインライン挿入
  SLOT_B_TIERS: ["signal"] as const,

  // 地方枠: Roots+ と Roots を同一スロットでランダム共有（ウェイト付き）
  LOCAL_SLOT_TIERS: ["roots_plus", "roots"] as const,

  // 表示ウェイト（単価比に基づく）: roots_plus は roots の2倍表示
  LOCAL_SLOT_WEIGHTS: {
    roots_plus: 2,
    roots: 1,
  } as const,

  // 枠数上限
  SLOT_LIMITS: {
    legacy: 10,
    presence: 20,
    signal: 30,
    roots_plus: 60,
    roots: 120,
  } as const,

  // 単価（円）
  UNIT_PRICE: {
    legacy: 1_000_000,
    presence: 500_000,
    signal: 100_000,
    roots_plus: 50_000,
    roots: 30_000,
  } as const,

  // 枠Aはスクロール前（Above the Fold）に予約表示
  ABOVE_FOLD_RESERVED: true,
} as const;

export type AdTier = "legacy" | "presence" | "signal" | "roots_plus" | "roots";
export type SlotType = "slot_a" | "slot_b" | "local_slot";
