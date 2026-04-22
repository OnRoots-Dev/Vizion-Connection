import { AD_CONFIG, AdTier, SlotType } from "../constants/adSlots";

/**
 * ウェイト付き確率で地方枠の広告ティアを抽選する
 */
export function pickLocalSlotTier(): AdTier {
  const weights = AD_CONFIG.LOCAL_SLOT_WEIGHTS;
  const total = Object.values(weights).reduce((a, b) => a + b, 0);
  const rand = Math.random() * total;
  let cumulative = 0;
  for (const [tier, weight] of Object.entries(weights) as [AdTier, number][]) {
    cumulative += weight;
    if (rand < cumulative) return tier;
  }
  return "roots";
}

/**
 * フィードアイテム配列に広告スロットを注入して返す
 * @param feedItems    元のコンテンツ配列
 * @param isLocalUser  地方ユーザーかどうか（地方枠の表示制御）
 * @remarks 各ティアの表示数は AD_CONFIG.SLOT_LIMITS を超えない。
 */
export function injectAdsIntoFeed<T>(
  feedItems: T[],
  isLocalUser: boolean,
): Array<T | { __adSlot: SlotType; tier?: AdTier }> {
  const result: Array<T | { __adSlot: SlotType; tier?: AdTier }> = [];

  const tierCount: Partial<Record<AdTier, number>> = {};

  function canShowTier(tier: AdTier): boolean {
    const limit = AD_CONFIG.SLOT_LIMITS[tier];
    const current = tierCount[tier] ?? 0;
    return current < limit;
  }

  function recordTier(tier: AdTier): void {
    tierCount[tier] = (tierCount[tier] ?? 0) + 1;
  }

  // 枠A: Legacy → Presence をフィード先頭に挿入
  for (const tier of AD_CONFIG.SLOT_A_TIERS) {
    if (!canShowTier(tier)) continue;
    result.push({ __adSlot: "slot_a", tier });
    recordTier(tier);
  }

  // コンテンツと枠B(Signal)・地方枠を交互に挿入
  feedItems.forEach((item, i) => {
    result.push(item);

    const isIntervalHit = (i + 1) % AD_CONFIG.FEED_AD_INTERVAL === 0;
    if (isIntervalHit) {
      // 地方ユーザーには地方枠を差し込む（枠Bの代わりに）
      if (isLocalUser) {
        const tier = pickLocalSlotTier();
        if (canShowTier(tier)) {
          result.push({ __adSlot: "local_slot", tier });
          recordTier(tier);
        }
      } else {
        for (const tier of AD_CONFIG.SLOT_B_TIERS) {
          if (!canShowTier(tier)) continue;
          result.push({ __adSlot: "slot_b", tier });
          recordTier(tier);
        }
      }
    }
  });

  return result;
}

/**
 * 広告スロット注入済み配列の要素が広告かどうか判定する
 */
export function isAdSlot(
  item: unknown,
): item is { __adSlot: SlotType; tier?: AdTier } {
  return typeof item === "object" && item !== null && "__adSlot" in item;
}
