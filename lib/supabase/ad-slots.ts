// lib/supabase/ad-slots.ts
// Business 掲載枠在庫（ad_slots: prefecture, tier, total, sold）

import { supabaseServer } from "@/lib/supabase/server";
import type { PlanId } from "@/features/business/types";
import {
  BUSINESS_REGIONS,
  PREFECTURES_BY_BUSINESS_REGION,
  type BusinessRegionId,
} from "@/features/business/constants";

export type AdSlotRow = {
  id: string;
  prefecture: string;
  tier: PlanId;
  total: number;
  sold: number;
};

export type AdSlotAvailability = AdSlotRow & {
  remaining: number;
  soldOut: boolean;
};

export { PREFECTURES_BY_BUSINESS_REGION };

export function remainingOf(row: Pick<AdSlotRow, "total" | "sold">): number {
  return Math.max(0, row.total - row.sold);
}

export async function listAdSlots(tier?: PlanId): Promise<AdSlotAvailability[]> {
  let query = supabaseServer
    .from("ad_slots")
    .select("id,prefecture,tier,total,sold")
    .order("prefecture", { ascending: true });

  if (tier) query = query.eq("tier", tier);

  const { data, error } = await query;
  if (error) {
    console.error("[listAdSlots]", error.code);
    return [];
  }

  return ((data ?? []) as AdSlotRow[]).map((row) => {
    const remaining = remainingOf(row);
    return {
      ...row,
      remaining,
      soldOut: remaining <= 0,
    };
  });
}

/** Roots 地方ブロック別の残枠（都道府県行を集計） */
export async function getRootsRegionAvailabilityFromAdSlots(): Promise<
  Array<{
    id: BusinessRegionId;
    label: string;
    seats: number;
    remaining: number;
    soldOut: boolean;
  }>
> {
  const slots = await listAdSlots("roots");
  const byPref = new Map(slots.map((s) => [s.prefecture, s]));

  return BUSINESS_REGIONS.map((region) => {
    const prefs = PREFECTURES_BY_BUSINESS_REGION[region.id];
    let total = 0;
    let sold = 0;
    for (const pref of prefs) {
      const row = byPref.get(pref);
      if (!row) continue;
      total += row.total;
      sold += row.sold;
    }
    const remaining = Math.max(0, total - sold);
    return {
      id: region.id,
      label: region.label,
      seats: total,
      remaining,
      soldOut: remaining <= 0,
    };
  });
}

/** 全国プラン（signal / presence / legacy）の残枠 */
export async function getNationalTierAvailabilityFromAdSlots(): Promise<
  Array<{
    tier: PlanId;
    prefecture: string;
    seats: number;
    remaining: number;
    soldOut: boolean;
  }>
> {
  const slots = await listAdSlots();
  return slots
    .filter((s) => s.prefecture === "全国" && s.tier !== "roots")
    .map((s) => ({
      tier: s.tier,
      prefecture: s.prefecture,
      seats: s.total,
      remaining: s.remaining,
      soldOut: s.soldOut,
    }));
}

export async function getAdSlot(
  prefecture: string,
  tier: PlanId,
): Promise<AdSlotAvailability | null> {
  const { data, error } = await supabaseServer
    .from("ad_slots")
    .select("id,prefecture,tier,total,sold")
    .eq("prefecture", prefecture)
    .eq("tier", tier)
    .maybeSingle();

  if (error) {
    console.error("[getAdSlot]", error.code);
    return null;
  }
  if (!data) return null;

  const row = data as AdSlotRow;
  const remaining = remainingOf(row);
  return { ...row, remaining, soldOut: remaining <= 0 };
}

/**
 * 決済完了時に sold を +1（sold < total のときのみ）。
 * 冪等性は呼び出し側（webhook の payment.id など）で担保する。
 */
export async function incrementAdSlotSold(
  prefecture: string,
  tier: PlanId,
): Promise<{ success: boolean; remaining?: number; error?: string }> {
  const slot = await getAdSlot(prefecture, tier);
  if (!slot) {
    return { success: false, error: "slot_not_found" };
  }
  if (slot.soldOut) {
    return { success: false, error: "slot_sold_out" };
  }

  const nextSold = slot.sold + 1;
  const { data, error } = await supabaseServer
    .from("ad_slots")
    .update({ sold: nextSold, updated_at: new Date().toISOString() })
    .eq("id", slot.id)
    .eq("sold", slot.sold) // 楽観ロック
    .select("total,sold")
    .maybeSingle();

  if (error || !data) {
    console.error("[incrementAdSlotSold]", error?.code ?? "no_row");
    return { success: false, error: "slot_update_failed" };
  }

  return {
    success: true,
    remaining: Math.max(0, Number(data.total) - Number(data.sold)),
  };
}
