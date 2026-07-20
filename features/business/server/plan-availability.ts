// features/business/server/plan-availability.ts
// BUSINESS_PLANS のカタログ定義に、ad_slots の total/sold を重ねる。

import { BUSINESS_PLANS, getBusinessPlansWithUrls } from "@/features/business/constants";
import type { BusinessPlanWithAvailability, PlanId } from "@/features/business/types";
import {
  getNationalTierAvailabilityFromAdSlots,
  listAdSlots,
} from "@/lib/supabase/ad-slots";

/**
 * プラン一覧 + ad_slots 在庫。
 * DB に行がないプランは remaining=0 / soldOut=true（仮値で販売可能に見せない）。
 */
export async function getPlansWithAdSlotAvailability(options?: {
  withSquareUrls?: boolean;
}): Promise<BusinessPlanWithAvailability[]> {
  const [plansBase, allSlots, national] = await Promise.all([
    Promise.resolve(
      options?.withSquareUrls ? getBusinessPlansWithUrls() : BUSINESS_PLANS.map((p) => ({ ...p, squareUrl: "" })),
    ),
    listAdSlots(),
    getNationalTierAvailabilityFromAdSlots(),
  ]);

  const rootsAgg = allSlots
    .filter((s) => s.tier === "roots")
    .reduce(
      (acc, s) => {
        acc.total += s.total;
        acc.sold += s.sold;
        return acc;
      },
      { total: 0, sold: 0 },
    );
  const nationalByTier = new Map(national.map((n) => [n.tier, n]));

  return plansBase.map((plan) => {
    if (plan.id === "roots") {
      if (rootsAgg.total <= 0) {
        return {
          ...plan,
          seats: 0,
          soldCount: 0,
          remaining: 0,
          soldOut: true,
        };
      }
      const remaining = Math.max(0, rootsAgg.total - rootsAgg.sold);
      return {
        ...plan,
        seats: rootsAgg.total,
        soldCount: rootsAgg.sold,
        remaining,
        soldOut: remaining <= 0,
      };
    }

    const nat = nationalByTier.get(plan.id as PlanId);
    if (nat && nat.seats > 0) {
      return {
        ...plan,
        seats: nat.seats,
        soldCount: nat.seats - nat.remaining,
        remaining: nat.remaining,
        soldOut: nat.soldOut,
      };
    }

    // ad_slots 未登録: カタログ seats を残さない（在庫不明＝売り切れ扱い）
    return {
      ...plan,
      seats: 0,
      soldCount: 0,
      remaining: 0,
      soldOut: true,
    };
  });
}
