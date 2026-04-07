import { NextRequest, NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase/server";
import { getPlanFeatures, PLAN_PRIORITY } from "@/features/business/plan-features";

function randomSort() {
    return Math.random() - 0.5;
}

function ensureRoleVisible<T extends { role: string }>(users: T[], roleName: string, visibleCount: number, minVisible: number) {
    const visibleMatches = users.slice(0, visibleCount).filter((user) => user.role === roleName).length;
    if (visibleMatches >= minVisible) {
        return users;
    }

    const candidates = users
        .map((user, index) => ({ user, index }))
        .filter((entry) => entry.user.role === roleName && entry.index >= visibleCount)
        .slice(0, minVisible - visibleMatches);

    if (candidates.length === 0) {
        return users;
    }

    const nextUsers = [...users];
    const insertAt = Array.from({ length: minVisible }, (_, index) =>
        Math.min(visibleCount - 1, Math.max(0, Math.round(((index + 1) * visibleCount) / (minVisible + 1)) - 1)),
    );

    for (const [offset, candidate] of candidates.entries()) {
        const currentIndex = nextUsers.findIndex((user) => user === candidate.user);
        if (currentIndex === -1) continue;

        const [matchedUser] = nextUsers.splice(currentIndex, 1);
        const targetIndex = Math.min(insertAt[Math.min(visibleMatches + offset, insertAt.length - 1)], nextUsers.length);
        nextUsers.splice(targetIndex, 0, matchedUser);
    }

    return nextUsers;
}

export async function GET(req: NextRequest) {
    const q = (req.nextUrl.searchParams.get("q") ?? "").trim();
    const role = req.nextUrl.searchParams.get("role") ?? "";
    const region = (req.nextUrl.searchParams.get("region") ?? "").trim();
    const prefecture = (req.nextUrl.searchParams.get("prefecture") ?? "").trim();
    const sort = req.nextUrl.searchParams.get("sort") ?? "all";

    let query = supabaseServer
        .from("users")
        .select("slug,display_name,role,avatar_url,profile_image_url,cheer_count,region,prefecture,sport,created_at,sponsor_plan")
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
        profile_image_url: u.profile_image_url,
        cheer_count: u.cheer_count ?? 0,
        referral_count: referralMap.get(u.slug) ?? 0,
        region: u.region,
        prefecture: u.prefecture,
        sport: u.sport,
        created_at: u.created_at,
        sponsor_plan: u.sponsor_plan ?? null,
        plan_priority: PLAN_PRIORITY[String(u.sponsor_plan ?? "")] ?? 0,
        discovery_fixed: getPlanFeatures(u.sponsor_plan ?? null)?.discoveryFixed ?? false,
    }));

    const sorted = [...mapped].sort((a, b) => {
        if (a.discovery_fixed !== b.discovery_fixed) return a.discovery_fixed ? -1 : 1;
        if (b.plan_priority !== a.plan_priority) return b.plan_priority - a.plan_priority;
        if (a.plan_priority === b.plan_priority) {
            const randomDiff = randomSort();
            if (randomDiff !== 0) return randomDiff;
        }
        if (sort === "cheer") return b.cheer_count - a.cheer_count;
        if (sort === "referral") return b.referral_count - a.referral_count;
        if (sort === "new") return String(b.created_at).localeCompare(String(a.created_at));
        return (b.cheer_count + b.referral_count * 4) - (a.cheer_count + a.referral_count * 4);
    });

    const byCheerBase = [...mapped].sort((a, b) => {
        if (a.discovery_fixed !== b.discovery_fixed) return a.discovery_fixed ? -1 : 1;
        if (b.plan_priority !== a.plan_priority) return b.plan_priority - a.plan_priority;
        if (a.plan_priority === b.plan_priority) {
            const randomDiff = randomSort();
            if (randomDiff !== 0) return randomDiff;
        }
        return b.cheer_count - a.cheer_count;
    });
    const byReferralBase = [...mapped].sort((a, b) => {
        if (a.discovery_fixed !== b.discovery_fixed) return a.discovery_fixed ? -1 : 1;
        if (b.plan_priority !== a.plan_priority) return b.plan_priority - a.plan_priority;
        if (a.plan_priority === b.plan_priority) {
            const randomDiff = randomSort();
            if (randomDiff !== 0) return randomDiff;
        }
        return b.referral_count - a.referral_count;
    });

    const finalUsers = !role
        ? ensureRoleVisible(sorted, "Business", 12, sort === "all" ? 2 : 1)
        : sorted;
    const byCheer = !role ? ensureRoleVisible(byCheerBase, "Business", 5, 1).slice(0, 5) : byCheerBase.slice(0, 5);
    const byReferral = !role ? ensureRoleVisible(byReferralBase, "Business", 5, 1).slice(0, 5) : byReferralBase.slice(0, 5);

    return NextResponse.json({
        users: finalUsers,
        picks: {
            cheer: byCheer,
            referral: byReferral,
        },
    });
}
