import { NextResponse } from "next/server";
import { getSupabaseProfile } from "@/lib/auth/session";
import { supabaseServer } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

function jstDayKey(iso: string) {
    return new Date(new Date(iso).getTime() + 9 * 3600 * 1000).toISOString().slice(0, 10);
}

function computeStreak(dates: string[]): number {
    const days = new Set(dates.map(jstDayKey));
    if (days.size === 0) return 0;
    const today = new Date(Date.now() + 9 * 3600 * 1000).toISOString().slice(0, 10);
    const yest = new Date(Date.now() + 9 * 3600 * 1000 - 86400000).toISOString().slice(0, 10);
    let cursor: string | null = days.has(today) ? today : days.has(yest) ? yest : null;
    if (!cursor) return 0;
    let count = 0;
    while (cursor && days.has(cursor)) {
        count++;
        cursor = new Date(new Date(cursor).getTime() - 86400000).toISOString().slice(0, 10);
    }
    return count;
}

export async function GET() {
    const user = await getSupabaseProfile();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const [journeysRes, userRes, followsRes] = await Promise.all([
        supabaseServer
            .from("journeys")
            .select("created_at")
            .eq("user_slug", user.slug)
            .order("created_at", { ascending: false })
            .limit(500),
        supabaseServer
            .from("users")
            .select("cheer_count")
            .eq("slug", user.slug)
            .single(),
        supabaseServer
            .from("user_follows")
            .select("id", { count: "exact", head: true })
            .eq("following_slug", user.slug),
    ]);

    const dates = (journeysRes.data ?? []).map((r) => r.created_at as string);
    const journeyCount = dates.length;
    const streak = computeStreak(dates);
    const cheerCount = (userRes.data?.cheer_count as number | null) ?? 0;
    const bondCount = followsRes.count ?? 0;

    return NextResponse.json({ journeyCount, cheerCount, streak, bondCount });
}
