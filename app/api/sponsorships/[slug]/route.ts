// app/api/sponsorships/[slug]/route.ts
// このユーザーを支援している企業一覧（公開・認証不要）
import { NextResponse } from "next/server";
import { getSponsorsForUser } from "@/lib/supabase/business-sponsorships";

export async function GET(_req: Request, context: { params: Promise<{ slug: string }> }) {
    const { slug } = await context.params;
    if (!slug) return NextResponse.json({ sponsors: [] });

    const sponsors = await getSponsorsForUser(slug);
    return NextResponse.json({ sponsors });
}
