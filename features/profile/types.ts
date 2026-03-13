// features/profile/types.ts

import type { UserRole } from "@/features/auth/types";

export interface ProfileData {
    id: string;
    slug: string;
    displayName: string;
    role: UserRole;
    email: string;
    verified: boolean;
    points: number;
    referrerSlug?: string;
    createdAt: string;
    serialId?: string;
    profileImageUrl?: string;
    cardBgUrl?: string;
    avatarUrl?: string;
    bio?: string;
    region?: string;
    prefecture?: string;
    sport?: string;
    sportsCategory?: string;
    stance?: string;
    instagram?: string;
    xUrl?: string;
    tiktok?: string;
    cheerCount?: number;
    missionBonusGiven?: boolean;
    isFoundingMember: boolean;
    isPublic?: boolean;
    isDeleted?: boolean;
}

export interface DashboardData {
    profile: ProfileData;
    referralUrl: string;
    referralCount: number;
    isFoundingMember: boolean;
}

export interface PublicProfileData {
    slug: string;
    displayName: string;
    role: UserRole;
    verified: boolean;
    cheerCount: number;
    createdAt: string;
    serialId?: string;
    profileImageUrl?: string;
    cardBgUrl?: string;
    bio?: string;
    region?: string;
    prefecture?: string;
    sport?: string;
    sportsCategory?: string;
    stance?: string;
    instagram?: string;
    xUrl?: string;
    tiktok?: string;
    missionBonusGiven?: boolean;
    isFoundingMember: boolean;
    isPublic?: boolean;
    isDeleted?: boolean;
    avatarUrl?: string;
}