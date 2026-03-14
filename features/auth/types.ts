// features/auth/types.ts

import { is } from "zod/locales";

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

export interface UserRecord {
    id: string;
    email: string;
    passwordHash: string;
    role: UserRole;
    displayName: string;
    slug: string;
    verified: boolean;
    points: number;
    referrerSlug?: string;
    createdAt: string;
    serialId?: string;
    profileImageUrl?: string;
    cardBgUrl?: string;
    bio?: string;
    region?: string;
    prefecture?: string;
    sportsCategory?: string;
    sport?: string;
    stance?: string;
    instagram?: string;
    xUrl?: string;
    tiktok?: string;
    cheerCount: number;
    missionBonusGiven: boolean;
    isFoundingMember: boolean;
    isPublic: boolean;
    isDeleted: boolean;
    lastLoginAt?: string;
    ambassadorCode?: string;
    avatarUrl?: string;
    password?: string;
    seq?: number;
    randA?: string;
    randB?: string;
}

export interface VerifyTokenRecord {
    id: string;
    token: string;
    email: string;
    slug: string;
    used: boolean;
    createdAt: string;
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