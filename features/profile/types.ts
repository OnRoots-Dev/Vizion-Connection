// features/profile/types.ts

import type { UserRole } from "@/features/auth/types";

export interface LatestCheerItem {
    id: string;
    comment: string;
    fromSlug: string;
    fromDisplayName: string;
    createdAt: string;
}

export interface ProfileData {
    id: string;
    slug: string;
    displayName: string;
    role: UserRole;
    email?: string;
    plan?: "free" | "paid";
    verified: boolean;
    points: number;
    referrerSlug?: string;
    createdAt: string;
    serialId?: string;
    profileImageUrl?: string;
    bannerUrl?: string;
    cardBgUrl?: string;
    avatarUrl?: string;
    bio?: string;
    region?: string;
    prefecture?: string;
    career?: string;
    sport?: string;
    sports?: string[];
    sportsCategory?: string;
    stance?: string;
    claim?: string;
    instagram?: string;
    xUrl?: string;
    tiktok?: string;
    cheerCount?: number;
    missionBonusGiven?: boolean;
    sponsorPlan?: "roots" | "roots_plus" | "signal" | "presence" | "legacy" | null;
    isFoundingMember: boolean;
    foundingNumber?: number;
    isPublic?: boolean;
    isDeleted?: boolean;
    hasShared?: boolean;
    latestCheers?: LatestCheerItem[];
}

export interface DashboardData {
    profile: ProfileData;
    plan?: "free" | "paid";
    referralUrl: string;
    referralCount: number;
    isFoundingMember: boolean;
}

export interface PublicProfileData {
    slug: string;
    displayName: string;
    role: UserRole;
    plan?: "free" | "paid";
    verified: boolean;
    cheerCount: number;
    createdAt: string;
    serialId?: string;
    profileImageUrl?: string;
    bannerUrl?: string;
    cardBgUrl?: string;
    bio?: string;
    region?: string;
    prefecture?: string;
    career?: string;
    sport?: string;
    sports?: string[];
    sportsCategory?: string;
    stance?: string;
    claim?: string;
    instagram?: string;
    xUrl?: string;
    tiktok?: string;
    missionBonusGiven?: boolean;
    sponsorPlan?: "roots" | "roots_plus" | "signal" | "presence" | "legacy" | null;
    isFoundingMember: boolean;
    foundingNumber?: number;
    isPublic?: boolean;
    isDeleted?: boolean;
    avatarUrl?: string;
    hasShared?: boolean;
}
