import { NextResponse } from "next/server";
import { getSupabaseProfile } from "@/lib/auth/session";
import { supabaseServer } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

// 直近24時間にJourneyを投稿したユーザーを最大5件返す（自分自身を除外）
export async function GET() {
    const user = await getSupabaseProfile();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const since = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();

    const { data, error } = await supabaseServer
        .from("journeys")
        .select("user_slug, users!inner(slug, display_name, role, region, prefecture, avatar_url, profile_image_url)")
        .neq("user_slug", user.slug)
        .eq("is_public", true)
        .gte("created_at", since)
        .order("created_at", { ascending: false })
        .limit(20);

    if (error) {
        console.error("[cheer/suggest]", error);
        return NextResponse.json({ items: [] });
    }

    // slug 単位で重複除去して最大5件
    const seen = new Set<string>();
    const items: {
        slug: string;
        displayName: string;
        role: string | null;
        region: string | null;
        prefecture: string | null;
        avatarUrl: string | null;
        profileImageUrl: string | null;
    }[] = [];

    for (const row of (data ?? [])) {
        const u = row.users as unknown as Record<string, unknown>;
        const slug = String(u.slug ?? row.user_slug ?? "");
        if (!slug || seen.has(slug)) continue;
        seen.add(slug);
        items.push({
            slug,
            displayName: String(u.display_name ?? slug),
            role: u.role ? String(u.role) : null,
            region: u.region ? String(u.region) : null,
            prefecture: u.prefecture ? String(u.prefecture) : null,
            avatarUrl: u.avatar_url ? String(u.avatar_url) : null,
            profileImageUrl: u.profile_image_url ? String(u.profile_image_url) : null,
        });
        if (items.length >= 5) break;
    }

    return NextResponse.json({ items });
}
