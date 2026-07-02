// lib/supabase/business-sponsorships.ts
import { supabaseServer } from "@/lib/supabase/server";
import { SPONSOR_SLOTS_PER_PLAN } from "@/features/business/constants";
import type { PlanId } from "@/features/business/types";
import type { ProfileRecord } from "@/lib/supabase/data/users.server";

export type SponsorshipTarget = {
    id: string;
    slug: string;
    displayName: string;
    role: string;
    avatarUrl: string | null;
    startedAt: string;
};

export type SponsoringBusiness = {
    slug: string;
    displayName: string;
    avatarUrl: string | null;
    planId: string;
    startedAt: string;
};

// このユーザーを支援している企業一覧（公開プロフィール表示用）
export async function getSponsorsForUser(slug: string): Promise<SponsoringBusiness[]> {
    const { data, error } = await supabaseServer
        .from("business_sponsorships")
        .select("business_user_slug, plan_id, started_at")
        .eq("sponsored_user_slug", slug)
        .is("ended_at", null)
        .order("started_at", { ascending: false });

    if (error) {
        console.error("[getSponsorsForUser]", error);
        return [];
    }
    if (!data || data.length === 0) return [];

    const businessSlugs = Array.from(new Set(data.map((row) => String(row.business_user_slug))));
    const { data: businesses } = await supabaseServer
        .from("users")
        .select("slug, display_name, avatar_url")
        .in("slug", businessSlugs)
        .eq("is_deleted", false)
        .eq("is_public", true);

    const businessMap = new Map((businesses ?? []).map((u) => [String(u.slug), u]));

    return data
        .filter((row) => businessMap.has(String(row.business_user_slug)))
        .map((row) => {
            const business = businessMap.get(String(row.business_user_slug))!;
            return {
                slug: String(row.business_user_slug),
                displayName: String(business.display_name ?? row.business_user_slug),
                avatarUrl: business.avatar_url ? String(business.avatar_url) : null,
                planId: String(row.plan_id),
                startedAt: String(row.started_at),
            } satisfies SponsoringBusiness;
        });
}

// この企業が現在支援しているアスリート等一覧＋残り枠数（Business Hub用）
export async function listSponsorshipsForBusiness(profile: ProfileRecord): Promise<{
    targets: SponsorshipTarget[];
    slotsUsed: number;
    slotsTotal: number;
}> {
    const planId = profile.sponsorPlan as PlanId | null;
    const slotsTotal = planId ? SPONSOR_SLOTS_PER_PLAN[planId] ?? 0 : 0;

    const { data, error } = await supabaseServer
        .from("business_sponsorships")
        .select("id, sponsored_user_slug, started_at")
        .eq("business_user_slug", profile.slug)
        .is("ended_at", null)
        .order("started_at", { ascending: false });

    if (error) {
        console.error("[listSponsorshipsForBusiness]", error);
        return { targets: [], slotsUsed: 0, slotsTotal };
    }

    const rows = data ?? [];
    if (rows.length === 0) return { targets: [], slotsUsed: 0, slotsTotal };

    const targetSlugs = Array.from(new Set(rows.map((row) => String(row.sponsored_user_slug))));
    const { data: users } = await supabaseServer
        .from("users")
        .select("slug, display_name, role, avatar_url")
        .in("slug", targetSlugs);

    const userMap = new Map((users ?? []).map((u) => [String(u.slug), u]));

    const targets = rows.map((row) => {
        const user = userMap.get(String(row.sponsored_user_slug));
        return {
            id: String(row.id),
            slug: String(row.sponsored_user_slug),
            displayName: String(user?.display_name ?? row.sponsored_user_slug),
            role: String(user?.role ?? "Athlete"),
            avatarUrl: user?.avatar_url ? String(user.avatar_url) : null,
            startedAt: String(row.started_at),
        } satisfies SponsorshipTarget;
    });

    return { targets, slotsUsed: targets.length, slotsTotal };
}

// 支援対象を追加。プラン枠数超過・重複・対象不在はエラーを投げる。
export async function addSponsorship(profile: ProfileRecord, sponsoredUserSlug: string): Promise<SponsorshipTarget> {
    if (sponsoredUserSlug === profile.slug) {
        throw new Error("自社を支援対象にはできません");
    }

    const planId = profile.sponsorPlan as PlanId | null;
    if (!planId) {
        throw new Error("有効なスポンサープランがありません");
    }

    const { data: targetUser, error: targetError } = await supabaseServer
        .from("users")
        .select("slug, display_name, role, avatar_url")
        .eq("slug", sponsoredUserSlug)
        .eq("is_deleted", false)
        .maybeSingle();

    if (targetError || !targetUser) {
        throw new Error("対象ユーザーが見つかりませんでした");
    }

    const { slotsUsed, slotsTotal } = await listSponsorshipsForBusiness(profile);
    if (slotsUsed >= slotsTotal) {
        throw new Error(`このプランで支援できるのは${slotsTotal}人までです`);
    }

    const { data: order } = await supabaseServer
        .from("business_orders")
        .select("id")
        .eq("slug", profile.slug)
        .eq("plan_id", planId)
        .eq("status", "completed")
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();

    const { data, error } = await supabaseServer
        .from("business_sponsorships")
        .insert({
            business_user_slug: profile.slug,
            sponsored_user_slug: sponsoredUserSlug,
            plan_id: planId,
            business_order_id: order?.id ?? null,
        })
        .select("id, sponsored_user_slug, started_at")
        .single();

    if (error || !data) {
        if (error?.code === "23505") {
            throw new Error("すでに支援対象に追加されています");
        }
        console.error("[addSponsorship]", error);
        throw new Error("支援対象の追加に失敗しました");
    }

    return {
        id: String(data.id),
        slug: String(data.sponsored_user_slug),
        displayName: String(targetUser.display_name ?? sponsoredUserSlug),
        role: String(targetUser.role ?? "Athlete"),
        avatarUrl: targetUser.avatar_url ? String(targetUser.avatar_url) : null,
        startedAt: String(data.started_at),
    } satisfies SponsorshipTarget;
}

// 支援を終了（物理削除ではなく ended_at を打刻）
export async function endSponsorship(profile: ProfileRecord, sponsorshipId: string): Promise<void> {
    const { error } = await supabaseServer
        .from("business_sponsorships")
        .update({ ended_at: new Date().toISOString() })
        .eq("id", sponsorshipId)
        .eq("business_user_slug", profile.slug)
        .is("ended_at", null);

    if (error) {
        console.error("[endSponsorship]", error);
        throw new Error("支援の終了に失敗しました");
    }
}
