// features/profile/server/get-profile-by-slug.ts

import { findUserBySlug } from "@/lib/supabase/data/users.server";
import type { PublicProfileData } from "@/features/profile/types";
import { canViewPrivateProfile } from "@/lib/supabase/follows";

export type GetPublicProfileResult =
    | { success: true; data: PublicProfileData }
    | { success: false; reason: "not_found" | "forbidden" | "error" };

export async function getPublicProfileBySlug(
    slug: string,
    viewerSlug?: string | null,
): Promise<GetPublicProfileResult> {
    try {
        const user = await findUserBySlug(slug);
        if (!user) return { success: false, reason: "not_found" };
        if (user.isDeleted) return { success: false, reason: "not_found" };
        if (user.isPublic === false) {
            const allowed = await canViewPrivateProfile(viewerSlug ?? null, user.slug);
            if (!allowed) {
                return { success: false, reason: "forbidden" };
            }
        }

        return {
            success: true,
            data: {
                slug: user.slug,
                displayName: user.displayName,
                role: user.role,
                verified: user.verified,
                cheerCount: user.cheerCount, // DBのcheer_countをそのまま使用
                createdAt: user.createdAt,
                serialId: user.serialId ?? undefined,
                profileImageUrl: user.profileImageUrl ?? undefined,
                avatarUrl: user.avatarUrl ?? undefined,
                bio: user.bio ?? undefined,
                region: user.region ?? undefined,
                prefecture: user.prefecture ?? undefined,
                sport: user.sport ?? undefined,
                sportsCategory: user.sportsCategory ?? undefined,
                stance: user.stance ?? undefined,
                instagram: user.instagram ?? undefined,
                xUrl: user.xUrl ?? undefined,
                tiktok: user.tiktok ?? undefined,
                missionBonusGiven: user.missionBonusGiven ?? false,
                sponsorPlan: user.sponsorPlan ?? null,
                isFoundingMember: user.isFoundingMember,
                isPublic: user.isPublic ?? true,
                isDeleted: user.isDeleted ?? false,
            },
        };
    } catch (err) {
        console.error("[getPublicProfileBySlug]", err);
        return { success: false, reason: "error" };
    }
}
