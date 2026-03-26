// app/api/cheer/ranking/route.ts
import { NextRequest, NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase/server";

export async function GET(req: NextRequest) {
    const role = req.nextUrl.searchParams.get("role") ?? undefined;

    let query = supabaseServer
        .from("users")
        .select("slug, display_name, role, avatar_url, cheer_count, is_founding_member, sport, region")
        .eq("is_deleted", false)
        .eq("is_public", true)
        .order("cheer_count", { ascending: false })
        .limit(50);

    if (role) query = query.eq("role", role);

    const { data } = await query;
    return NextResponse.json({ users: data ?? [] });
}