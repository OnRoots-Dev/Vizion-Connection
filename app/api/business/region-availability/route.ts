// app/api/business/region-availability/route.ts
// Roots 地方ブロック別 残枠 + 全国 tier 残枠を ad_slots から返す公開API。
import { NextResponse } from "next/server";
import {
  getNationalTierAvailabilityFromAdSlots,
  getRootsRegionAvailabilityFromAdSlots,
  listAdSlots,
} from "@/lib/supabase/ad-slots";

export const dynamic = "force-dynamic";

export async function GET(): Promise<NextResponse> {
  try {
    const [regions, national, slots] = await Promise.all([
      getRootsRegionAvailabilityFromAdSlots(),
      getNationalTierAvailabilityFromAdSlots(),
      listAdSlots(),
    ]);

    return NextResponse.json({
      regions,
      national,
      // 都道府県単位の生データ（JapanMap 等で利用可）
      slots: slots.map((s) => ({
        prefecture: s.prefecture,
        tier: s.tier,
        total: s.total,
        sold: s.sold,
        remaining: s.remaining,
        soldOut: s.soldOut,
      })),
    });
  } catch (err) {
    console.error("[GET /api/business/region-availability]", err instanceof Error ? err.message : "unknown");
    return NextResponse.json({ error: "サーバーエラーが発生しました" }, { status: 500 });
  }
}
