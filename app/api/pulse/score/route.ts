import { NextResponse } from "next/server";
import { getSupabaseProfile } from "@/lib/auth/session";
import { supabaseServer } from "@/lib/supabase/server";
import { computeStreak, computePulseScore } from "@/lib/pulse-stats";

export const dynamic = "force-dynamic";

export async function GET() {
    const user = await getSupabaseProfile();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const since365 = new Date(Date.now() - 365 * 24 * 60 * 60 * 1000).toISOString();

    const [journeysRes, userRes, followsRes] = await Promise.all([
        supabaseServer
            .from("journeys")
            .select("created_at")
            .eq("user_slug", user.slug)
            .gte("created_at", since365)
            .order("created_at", { ascending: false }),
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

    const streak = computeStreak((journeysRes.data ?? []).map((r) => r.created_at as string));
    const cheerCount = (userRes.data?.cheer_count as number | null) ?? 0;
    const bondCount = followsRes.count ?? 0;
    const score = computePulseScore(streak, cheerCount, bondCount);

    return NextResponse.json({ streak, cheerCount, bondCount, score });
}
