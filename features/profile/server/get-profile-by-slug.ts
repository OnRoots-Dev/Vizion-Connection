// features/profile/server/get-profile-by-slug.ts

import { findUserBySlug } from "@/lib/airtable/users";
import { countCheers } from "@/lib/airtable/cheers";
import type { PublicProfileData } from "@/features/profile/types";

export type GetPublicProfileResult =
    | { success: true; data: PublicProfileData }
    | { success: false; reason: "not_found" | "error" };

export async function getPublicProfileBySlug(
    slug: string
): Promise<GetPublicProfileResult> {
    try {
        const user = await findUserBySlug(slug);
        if (!user) {
            return { success: false, reason: "not_found" };
        }
        if (user.isDeleted) return { success: false, reason: "not_found" };

        const cheerCount = await countCheers(slug);

        return {
            success: true,
            data: {
                slug: user.slug,
                displayName: user.displayName,
                role: user.role,
                verified: user.verified,
                cheerCount,
                createdAt: user.createdAt,
                serialId: user.serialId,
                profileImageUrl: user.profileImageUrl,
                avatarUrl: user.avatarUrl,
                bio: user.bio,
                region: user.region,
                prefecture: user.prefecture,
                sport: user.sport,
                sportsCategory: user.sportsCategory,
                stance: user.stance,
                instagram: user.instagram,
                xUrl: user.xUrl,
                tiktok: user.tiktok,
                missionBonusGiven: user.missionBonusGiven ?? false,
                isFoundingMember: user.isFoundingMember ?? false,
                isPublic: user.isPublic ?? true,
                isDeleted: user.isDeleted ?? false,
            },
        };
    } catch (err) {
        console.error("[getPublicProfileBySlug]", err);
        return { success: false, reason: "error" };
    }
}