// app/api/business/region-availability/route.ts
// Roots プランの地方ブロック別 残枠を返す公開API（LP・申込ページ用）。
import { NextResponse } from "next/server";
import { BUSINESS_REGIONS, ROOTS_SEATS_PER_REGION } from "@/features/business/constants";
import { getRootsOrderCountsByRegion } from "@/lib/supabase/business-orders";

export const dynamic = "force-dynamic";

export async function GET(): Promise<NextResponse> {
    try {
        const counts = await getRootsOrderCountsByRegion();
        const regions = BUSINESS_REGIONS.map((r) => {
            const sold = counts[r.id] ?? 0;
            const remaining = Math.max(0, ROOTS_SEATS_PER_REGION - sold);
            return {
                id: r.id,
                label: r.label,
                seats: ROOTS_SEATS_PER_REGION,
                remaining,
                soldOut: remaining <= 0,
            };
        });
        return NextResponse.json({ regions });
    } catch (err) {
        console.error("[GET /api/business/region-availability]", err);
        return NextResponse.json({ error: "サーバーエラーが発生しました" }, { status: 500 });
    }
}
