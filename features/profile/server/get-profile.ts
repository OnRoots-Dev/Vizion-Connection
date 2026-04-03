// features/profile/server/get-profile.ts

import { getSessionCookie } from "@/lib/auth/cookies";
import { verifySession } from "@/lib/auth/session";
import { findUserBySlug } from "@/lib/supabase/data/users.server";
import { countReferralsBySlug } from "@/lib/supabase/referrals";
import { getLatestCheers } from "@/lib/supabase/cheers";
import { env } from "@/lib/env";
import type { DashboardData } from "@/features/profile/types";

export type GetProfileResult =
    | { success: true; data: DashboardData }
    | { success: false; reason: "unauthenticated" | "not_found" | "error" };

export async function getProfileFromSession(): Promise<GetProfileResult> {
    try {
        const token = await getSessionCookie();
        if (!token) return { success: false, reason: "unauthenticated" };

        const session = verifySession(token);
        if (!session) return { success: false, reason: "unauthenticated" };

        const user = await findUserBySlug(session.slug);
        if (!user) return { success: false, reason: "not_found" };

        const [referralCount, latestCheers] = await Promise.all([
            countReferralsBySlug(user.slug),
            getLatestCheers(user.id, 3),
        ]);
        const referralUrl = `${env.NEXT_PUBLIC_BASE_URL}/register?ref=${user.slug}`;

        return {
            success: true,
            data: {
                profile: {
                    id: String(user.id),
                    slug: user.slug,
                    displayName: user.displayName,
                    role: user.role,
                    plan: user.plan ?? "free",
                    email: user.email,
                    verified: user.verified,
                    points: user.points,
                    referrerSlug: user.referrerSlug ?? undefined,
                    createdAt: user.createdAt,
                    serialId: user.serialId ?? undefined,
                    profileImageUrl: user.profileImageUrl ?? undefined,
                    avatarUrl: user.avatarUrl ?? undefined,
                    bio: user.bio ?? undefined,
                    region: user.region ?? undefined,
                    prefecture: user.prefecture ?? undefined,
                    sportsCategory: user.sportsCategory ?? undefined,
                    stance: user.stance ?? undefined,
                    sport: user.sport ?? undefined,
                    instagram: user.instagram ?? undefined,
                    xUrl: user.xUrl ?? undefined,
                    tiktok: user.tiktok ?? undefined,
                    cheerCount: user.cheerCount ?? 0,
                    missionBonusGiven: user.missionBonusGiven ?? false,
                    isFoundingMember: (user.seq ?? 999) <= 100,
                    latestCheers,
                },
                referralUrl,
                referralCount,
                isFoundingMember: (user.seq ?? 999) <= 100,
            },
        };
    } catch (err) {
        console.error("[getProfileFromSession]", err);
        return { success: false, reason: "error" };
    }
}
