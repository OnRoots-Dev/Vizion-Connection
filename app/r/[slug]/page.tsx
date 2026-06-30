// app/r/[slug]/page.tsx
// 招待リンク /r/[slug] → クリック計測 → /register?ref=[slug] にリダイレクト

import { redirect } from "next/navigation";
import { upstashRedis } from "@/lib/upstash-redis";

export const dynamic = "force-dynamic";

export default async function ReferralRedirectPage({
    params,
}: {
    params: Promise<{ slug: string }>;
}) {
    const { slug } = await params;

    // 訪問（クリック）トラッキング。計測失敗してもリダイレクトは止めない。
    try {
        await upstashRedis.incr(`ref:clicks:${slug}`);
    } catch {
        /* tracking failure is non-fatal */
    }

    redirect(`/register?ref=${slug}`);
}
