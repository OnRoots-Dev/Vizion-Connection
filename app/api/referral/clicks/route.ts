// app/api/referral/clicks/route.ts
// 自分の招待リンク（/r/[slug]）の累計クリック数を返す（Upstash Redis カウンタ）。

import { NextResponse } from "next/server";
import { getSupabaseProfile } from "@/lib/auth/session";
import { upstashRedis } from "@/lib/upstash-redis";

export const dynamic = "force-dynamic";

export async function GET(): Promise<NextResponse> {
    const session = await getSupabaseProfile();
    if (!session) {
        return NextResponse.json({ clicks: 0 }, { status: 401 });
    }

    let clicks = 0;
    try {
        const raw = await upstashRedis.get<number | string>(`ref:clicks:${session.slug}`);
        clicks = Number(raw) || 0;
    } catch {
        clicks = 0;
    }

    return NextResponse.json({ clicks });
}
