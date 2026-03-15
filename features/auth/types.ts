// features/auth/types.ts

export type UserRole = "Athlete" | "Trainer" | "Members" | "Business";

export interface RegisterInput {
    email: string;
    password: string;
    role: UserRole;
    displayName: string;
    slug: string;
    referrerSlug?: string;
}

export interface LoginInput {
    email: string;
    password: string;
}

// toProfile() の戻り値と完全に一致させる
export interface UserRecord {
    id: number;
    slug: string;
    displayName: string;
    passwordHash: string;
    email: string;
    role: UserRole;
    isPublic: boolean;
    isFoundingMember: boolean;
    verified: boolean;
    serialId: string | null;
    seq: number | null;
    randA: string | null;
    randB: string | null;
    avatarUrl: string | null;
    profileImageUrl: string | null;
    bio: string | null;
    region: string | null;
    prefecture: string | null;
    location: string | null;
    sport: string | null;
    sportsCategory: string | null;
    stance: string | null;
    claim: string | null;
    instagram: string | null;
    xUrl: string | null;
    tiktok: string | null;
    proofUrl: string | null;
    ambassadorCode: string | null;
    foundingNumber: number | null;
    fromSlug: string | null;
    referrerSlug: string | null;
    cheerCount: number;
    points: number;
    missionBonusGiven: boolean;
    hasShared: boolean;
    resetToken: string | null;
    resetTokenExpires: string | null;
    isDeleted: boolean;
    deletedAt: string | null;
    createdAt: string;
    lastLoginAt: string | null;
}

export interface VerifyTokenRecord {
    id: string;
    token: string;
    email: string;
    slug: string;
    used: boolean;
    created_at: string;
}

export interface RegisterResult {
    success: true;
    slug: string;
}

export interface RegisterError {
    success: false;
    error: string;
}

export type RegisterResponse = RegisterResult | RegisterError;