// lib/supabase/portfolio-milestones.ts
import { supabaseServer } from "@/lib/supabase/server";
import { computeStreak } from "@/lib/pulse-stats";

export type PortfolioMilestoneType =
    | "cheers_received_100"
    | "journey_streak_30"
    | "journeys_posted_50"
    | "bond_50";

export type PortfolioMilestone = {
    id: string;
    milestoneType: PortfolioMilestoneType | string;
    achievedAt: string;
};

export async function getMilestonesForUser(slug: string): Promise<PortfolioMilestone[]> {
    const { data, error } = await supabaseServer
        .from("portfolio_milestones")
        .select("id, milestone_type, achieved_at")
        .eq("slug", slug)
        .order("achieved_at", { ascending: false });

    if (error) {
        console.error("[getMilestonesForUser]", error);
        return [];
    }

    return (data ?? []).map((row) => ({
        id: String(row.id),
        milestoneType: String(row.milestone_type),
        achievedAt: String(row.achieved_at),
    }));
}

async function unlockMilestone(slug: string, milestoneType: PortfolioMilestoneType): Promise<void> {
    const { error } = await supabaseServer
        .from("portfolio_milestones")
        .upsert({ slug, milestone_type: milestoneType }, { onConflict: "slug,milestone_type", ignoreDuplicates: true });

    if (error) {
        console.error("[unlockMilestone]", milestoneType, error);
    }
}

// cheers.createCheer() から、受信者の cheer_count 更新後に呼ぶ。
export async function checkCheersReceivedMilestone(toSlug: string, newCheerCount: number): Promise<void> {
    if (newCheerCount >= 100) {
        await unlockMilestone(toSlug, "cheers_received_100");
    }
}

// /api/journey POST から、投稿成功後に呼ぶ。
export async function checkJourneyMilestones(userSlug: string): Promise<void> {
    const { count, error: countError } = await supabaseServer
        .from("journeys")
        .select("id", { count: "exact", head: true })
        .eq("user_slug", userSlug);

    if (!countError && (count ?? 0) >= 50) {
        await unlockMilestone(userSlug, "journeys_posted_50");
    }

    const since365 = new Date(Date.now() - 365 * 24 * 60 * 60 * 1000).toISOString();
    const { data: dates, error: datesError } = await supabaseServer
        .from("journeys")
        .select("created_at")
        .eq("user_slug", userSlug)
        .gte("created_at", since365);

    if (!datesError && dates) {
        const streak = computeStreak(dates.map((row) => String(row.created_at)));
        if (streak >= 30) {
            await unlockMilestone(userSlug, "journey_streak_30");
        }
    }
}
