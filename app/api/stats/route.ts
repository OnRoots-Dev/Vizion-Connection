// app/api/stats/route.ts
// 公開集計（LP用）: 非削除ユーザーの人数。PIIを一切返さない読み取り専用GET。
// マーケティングLPは静的生成のため、クライアント側からこのルートで集計を取得する。

import { NextResponse } from "next/server";
import { getPublicMemberStats } from "@/lib/supabase/data/stats.server";

export const dynamic = "force-dynamic";

export async function GET() {
  const stats = await getPublicMemberStats();
  return NextResponse.json(
    { ...stats },
    {
      headers: {
        "Cache-Control": "s-maxage=300, stale-while-revalidate=600",
      },
    },
  );
}
