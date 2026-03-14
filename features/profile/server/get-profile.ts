// features/profile/server/get-profile.ts

import { getSessionCookie } from "@/lib/auth/cookies";
import { verifySession } from "@/lib/auth/session";
import { findUserBySlug } from "@/lib/airtable/users";
import { countReferralsBySlug } from "@/lib/airtable/referrals";
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

        const referralCount = await countReferralsBySlug(user.slug);
        const referralUrl = `${env.NEXT_PUBLIC_BASE_URL}/register?ref=${user.slug}`;

        return {
            success: true,
            data: {
                profile: {
                    id: user.id,
                    slug: user.slug,
                    displayName: user.displayName,
                    role: user.role,
                    email: user.email,
                    verified: user.verified,
                    points: user.points,
                    referrerSlug: user.referrerSlug,
                    createdAt: user.createdAt,
                    serialId: user.serialId,
                    profileImageUrl: user.profileImageUrl,
                    bio: user.bio,
                    region: user.region,
                    prefecture: user.prefecture,
                    sportsCategory: user.sportsCategory,
                    stance: user.stance,
                    sport: user.sport,
                    instagram: user.instagram,
                    xUrl: user.xUrl,
                    tiktok: user.tiktok,
                    cheerCount: user.cheerCount ?? 0,
                    missionBonusGiven: user.missionBonusGiven ?? false,
                    isFoundingMember: (user.seq ?? 999) <= 100,
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