import { supabaseServer } from "@/lib/supabase/server";
import { getPlanFeatures, PLAN_PRIORITY } from "@/features/business/plan-features";
import { ROLE_DISCOVERY_OPTIONS } from "@/lib/discovery-filters";
import { getWeeklyCheerCounts } from "@/lib/supabase/cheers";

type DiscoveryUserRow = {
    slug: string;
    display_name: string;
    role: string;
    avatar_url: string | null;
    profile_image_url: string | null;
    cheer_count: number | null;
    region: string | null;
    prefecture: string | null;
    sport: string | null;
    created_at: string;
    sponsor_plan: "roots" | "roots_plus" | "signal" | "presence" | "legacy" | null;
};

type RankedUser = {
    slug: string;
    display_name: string;
    role: string;
    avatar_url: string | null;
    profile_image_url: string | null;
    cheer_count: number;
    weekly_cheer_count: number;
    referral_count: number;
    region: string | null;
    prefecture: string | null;
    sport: string | null;
    created_at: string;
    sponsor_plan: "roots" | "roots_plus" | "signal" | "presence" | "legacy" | null;
    plan_priority: number;
    discovery_fixed: boolean;
};

type DiscoveryResponse = {
    users: RankedUser[];
    picks: {
        cheer: RankedUser[];
        referral: RankedUser[];
    };
    filters: {
        roleOptions: typeof ROLE_DISCOVERY_OPTIONS;
    };
};

function compareWeeklyCheer(a: { weekly_cheer_count: number; cheer_count: number; referral_count: number; slug: string }, b: { weekly_cheer_count: number; cheer_count: number; referral_count: number; slug: string }) {
    if (b.weekly_cheer_count !== a.weekly_cheer_count) return b.weekly_cheer_count - a.weekly_cheer_count;
    if (b.cheer_count !== a.cheer_count) return b.cheer_count - a.cheer_count;
    if (b.referral_count !== a.referral_count) return b.referral_count - a.referral_count;
    return a.slug.localeCompare(b.slug);
}

function compareReferral(a: { weekly_cheer_count: number; cheer_count: number; referral_count: number; slug: string }, b: { weekly_cheer_count: number; cheer_count: number; referral_count: number; slug: string }) {
    if (b.referral_count !== a.referral_count) return b.referral_count - a.referral_count;
    if (b.weekly_cheer_count !== a.weekly_cheer_count) return b.weekly_cheer_count - a.weekly_cheer_count;
    if (b.cheer_count !== a.cheer_count) return b.cheer_count - a.cheer_count;
    return a.slug.localeCompare(b.slug);
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

export async function getDiscoveryUsers(params: {
    q: string;
    role: string;
    region: string;
    prefecture: string;
    sport: string;
    sort: string;
}): Promise<DiscoveryResponse> {
    const { q, role, region, prefecture, sport, sort } = params;

    const newcomerSince = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();

    let query = supabaseServer
        .from("users")
        .select("slug,display_name,role,avatar_url,profile_image_url,cheer_count,region,prefecture,sport,created_at,sponsor_plan")
        .eq("is_deleted", false)
        .eq("is_public", true)
        .order("created_at", { ascending: false })
        .limit(1000);

    if (role) query = query.eq("role", role);
    if (region) query = query.ilike("region", `%${region}%`);
    if (prefecture) query = query.ilike("prefecture", `%${prefecture}%`);
    if (sport) query = query.ilike("sport", `%${sport}%`);
    if (q) query = query.or(`slug.ilike.%${q}%,display_name.ilike.%${q}%`);

    if (sort === "newcomer") {
        query = query.gte("created_at", newcomerSince);
    }

    const [{ data: users }, { data: refs }] = await Promise.all([
        query,
        supabaseServer
            .from("users")
            .select("referrer_slug")
            .eq("is_deleted", false)
            .not("referrer_slug", "is", null)
            .limit(1000),
    ]);

    const weeklyCheerMap = await getWeeklyCheerCounts(((users ?? []) as DiscoveryUserRow[]).map((user) => user.slug));

    const referralMap = new Map<string, number>();
    for (const row of refs ?? []) {
        const refSlug = row.referrer_slug as string | null;
        if (!refSlug) continue;
        referralMap.set(refSlug, (referralMap.get(refSlug) ?? 0) + 1);
    }

    const mapped: RankedUser[] = ((users ?? []) as DiscoveryUserRow[]).map((u) => ({
        slug: u.slug,
        display_name: u.display_name,
        role: u.role,
        avatar_url: u.avatar_url,
        profile_image_url: u.profile_image_url,
        cheer_count: u.cheer_count ?? 0,
        weekly_cheer_count: weeklyCheerMap.get(u.slug) ?? 0,
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
        if (sort === "cheer") return compareWeeklyCheer(a, b);
        if (sort === "referral") return compareReferral(a, b);
        if (sort === "new" || sort === "newcomer") return String(b.created_at).localeCompare(String(a.created_at));
        const scoreDiff = (b.weekly_cheer_count + b.referral_count * 4) - (a.weekly_cheer_count + a.referral_count * 4);
        if (scoreDiff !== 0) return scoreDiff;
        return compareWeeklyCheer(a, b);
    });

    const byCheerBase = [...mapped].sort(compareWeeklyCheer);
    const byReferralBase = [...mapped].sort(compareReferral);

    const finalUsers = !role
        ? ensureRoleVisible(sorted, "Business", 12, sort === "all" ? 2 : 1)
        : sorted;
    const byCheer = !role ? ensureRoleVisible(byCheerBase, "Business", 5, 1).slice(0, 5) : byCheerBase.slice(0, 5);
    const byReferral = !role ? ensureRoleVisible(byReferralBase, "Business", 5, 1).slice(0, 5) : byReferralBase.slice(0, 5);

    return {
        users: finalUsers,
        picks: {
            cheer: byCheer,
            referral: byReferral,
        },
        filters: {
            roleOptions: ROLE_DISCOVERY_OPTIONS,
        },
    };
}
