// features/auth/types.ts

export type UserRole = "Athlete" | "Trainer" | "Crew" | "Business" | "Admin";

export interface RegisterInput {
    email: string;
    password: string;
    role: UserRole;
    displayName?: string;
    slug: string;
    region?: string;
    referrerSlug?: string;
    redirectTo?: string;
    termsAccepted: true;
}

export interface LoginInput {
    email: string;
    password: string;
}

// toProfile() の戻り値と完全に一致させる
export interface UserRecord {
    id: number;
    authId?: string | null;
    slug: string;
    displayName?: string;
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
    sports: string[] | null;
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
    sponsorPlan: "roots" | "roots_plus" | "signal" | "presence" | "legacy" | null;
    resetToken: string | null;
    resetTokenExpires: string | null;
    isDeleted: boolean;
    deletedAt: string | null;
    createdAt: string;
    lastLoginAt: string | null;
}

export interface RegisterResult {
    success: true;
    slug: string;
}

export interface RegisterError {
    success: false;
    error: string;
}

export interface RegisterPendingVerification {
    success: false;
    error: string;
    code: "PENDING_VERIFICATION";
    email: string;
    resent: boolean;
}

export interface RegisterAlreadyRegistered {
    success: false;
    error: string;
    code: "ALREADY_REGISTERED";
    email: string;
}

export type RegisterResponse =
    | RegisterResult
    | RegisterError
    | RegisterPendingVerification
    | RegisterAlreadyRegistered;
