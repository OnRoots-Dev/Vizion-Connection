// app/api/portfolio/[slug]/milestones/route.ts
// このユーザーが達成したマイルストーン一覧（公開・認証不要）
import { NextResponse } from "next/server";
import { getMilestonesForUser } from "@/lib/supabase/portfolio-milestones";

export async function GET(_req: Request, context: { params: Promise<{ slug: string }> }) {
    const { slug } = await context.params;
    if (!slug) return NextResponse.json({ milestones: [] });

    const milestones = await getMilestonesForUser(slug);
    return NextResponse.json({ milestones });
}
