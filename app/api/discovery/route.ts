import { NextRequest, NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase/server";

export async function GET(req: NextRequest) {
    const q = (req.nextUrl.searchParams.get("q") ?? "").trim();
    const role = req.nextUrl.searchParams.get("role") ?? "";
    const region = (req.nextUrl.searchParams.get("region") ?? "").trim();
    const prefecture = (req.nextUrl.searchParams.get("prefecture") ?? "").trim();
    const sort = req.nextUrl.searchParams.get("sort") ?? "all";

    let query = supabaseServer
        .from("users")
        .select("slug,display_name,role,avatar_url,cheer_count,region,prefecture,sport,created_at")
        .eq("is_deleted", false)
        .eq("is_public", true)
        .limit(200);

    if (role) query = query.eq("role", role);
    if (region) query = query.ilike("region", `%${region}%`);
    if (prefecture) query = query.ilike("prefecture", `%${prefecture}%`);
    if (q) query = query.or(`slug.ilike.%${q}%,display_name.ilike.%${q}%`);

    const [{ data: users }, { data: refs }] = await Promise.all([
        query,
        supabaseServer
            .from("users")
            .select("referrer_slug")
            .eq("is_deleted", false)
            .not("referrer_slug", "is", null)
            .limit(1000),
    ]);

    const referralMap = new Map<string, number>();
    for (const row of refs ?? []) {
        const slug = row.referrer_slug as string | null;
        if (!slug) continue;
        referralMap.set(slug, (referralMap.get(slug) ?? 0) + 1);
    }

    const mapped = (users ?? []).map((u: any) => ({
        slug: u.slug,
        display_name: u.display_name,
        role: u.role,
        avatar_url: u.avatar_url,
        cheer_count: u.cheer_count ?? 0,
        referral_count: referralMap.get(u.slug) ?? 0,
        region: u.region,
        prefecture: u.prefecture,
        sport: u.sport,
        created_at: u.created_at,
    }));

    const sorted = [...mapped].sort((a, b) => {
        if (sort === "cheer") return b.cheer_count - a.cheer_count;
        if (sort === "referral") return b.referral_count - a.referral_count;
        if (sort === "new") return String(b.created_at).localeCompare(String(a.created_at));
        return (b.cheer_count + b.referral_count * 4) - (a.cheer_count + a.referral_count * 4);
    });

    const byCheer = [...mapped].sort((a, b) => b.cheer_count - a.cheer_count).slice(0, 5);
    const byReferral = [...mapped].sort((a, b) => b.referral_count - a.referral_count).slice(0, 5);

    return NextResponse.json({
        users: sorted.slice(0, 24),
        picks: {
            cheer: byCheer,
            referral: byReferral,
        },
    });
}
