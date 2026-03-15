// features/profile/server/get-profile-by-slug.ts

import { findUserBySlug } from "@/lib/supabase/users";
import type { PublicProfileData } from "@/features/profile/types";

export type GetPublicProfileResult =
    | { success: true; data: PublicProfileData }
    | { success: false; reason: "not_found" | "error" };

export async function getPublicProfileBySlug(
    slug: string
): Promise<GetPublicProfileResult> {
    try {
        const user = await findUserBySlug(slug);
        if (!user) return { success: false, reason: "not_found" };
        if (user.isDeleted) return { success: false, reason: "not_found" };

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