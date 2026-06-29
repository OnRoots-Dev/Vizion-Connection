import { NextResponse } from "next/server";
import { getSupabaseProfile } from "@/lib/auth/session";
import { supabaseServer } from "@/lib/supabase/server";
import { computeStreak } from "@/lib/pulse-stats";

export const dynamic = "force-dynamic";

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
            .eq("target_slug", user.slug),
    ]);

    const dates = (journeysRes.data ?? []).map((r) => r.created_at as string);
    const journeyCount = dates.length;
    const streak = computeStreak(dates);
    const cheerCount = (userRes.data?.cheer_count as number | null) ?? 0;
    const bondCount = followsRes.count ?? 0;

    return NextResponse.json({ journeyCount, cheerCount, streak, bondCount });
}
