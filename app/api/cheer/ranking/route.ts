// app/api/cheer/ranking/route.ts
import { NextRequest, NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase/server";
import { getWeeklyCheerCounts } from "@/lib/supabase/cheers";

export async function GET(req: NextRequest) {
    const role = req.nextUrl.searchParams.get("role") ?? undefined;

    let query = supabaseServer
        .from("users")
        .select("slug, display_name, role, avatar_url, profile_image_url, cheer_count, is_founding_member, sport, region")
        .eq("is_deleted", false)
        .eq("is_public", true)
        .limit(200);

    if (role) query = query.eq("role", role);

    const { data } = await query;
    const users = data ?? [];
    const weeklyMap = await getWeeklyCheerCounts(users.map((user) => String(user.slug)));
    const ranked = users
        .map((user) => ({ ...user, weekly_cheer_count: weeklyMap.get(String(user.slug)) ?? 0 }))
        .sort((a, b) => {
            if (b.weekly_cheer_count !== a.weekly_cheer_count) return b.weekly_cheer_count - a.weekly_cheer_count;
            return Number(b.cheer_count ?? 0) - Number(a.cheer_count ?? 0);
        })
        .slice(0, 50);

    return NextResponse.json({ users: ranked });
}
