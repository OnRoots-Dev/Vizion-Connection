// features/auth/server/verify.ts

import { findUserByEmail, findUserBySlug, addPointsToUser, markUserVerified } from "@/lib/supabase/data/users.server";
import { findVerifyToken, markTokenUsed } from "@/lib/supabase/data/tokens.server";
import { findReferralByReferredSlug, createReferral, countReferralsBySlug } from "@/lib/supabase/referrals";
import { sendVerifiedEmail } from "@/lib/resend/send-verified-email";
import { signSession } from "@/lib/auth/session";
import { env } from "@/lib/env";
import type { UserRole } from "@/features/auth/types";
import { rewardOnetimeMission } from "@/lib/onetime-missions";

type VerifyResult =
    | {
        success: true;
        sessionToken: string;
        role: UserRole;
        slug: string;
    }
    | {
        success: false;
        error: string;
    };

const POINTS_PER_REFERRAL = 500;
const MAX_REFERRALS = 30;

export async function verifyEmailToken(token: string): Promise<VerifyResult> {
    // 1. トークン取得
    const tokenRecord = (await findVerifyToken(token)) as {
        id: string;
        email: string;
        slug: string;
        used: boolean;
        created_at: string;
    } | null;

    if (!tokenRecord) {
        return { success: false, error: "無効なトークンです" };
    }

    if (tokenRecord.used) {
        return { success: false, error: "このリンクはすでに使用済みです" };
    }

    // 2. 有効期限チェック（24時間）
    const createdAt = new Date(tokenRecord.created_at).getTime();
    if (Date.now() - createdAt > 24 * 60 * 60 * 1000) {
        return { success: false, error: "リンクの有効期限が切れています" };
    }

    // 3. ユーザー取得
    const user = await findUserByEmail(tokenRecord.email);
    if (!user) {
        return { success: false, error: "ユーザーが見つかりません" };
    }

    // すでに認証済み
    if (user.verified) {
        const sessionToken = signSession({
            userId: String(user.id),
            slug: user.slug,
            role: user.role,
            email: user.email,
        });

        return {
            success: true,
            sessionToken,
            role: user.role as UserRole,
            slug: user.slug,
        };
    }

    await markUserVerified(user.slug);
    await rewardOnetimeMission(user.slug, "email_verified");

    await sendVerifiedEmail({
        to: user.email,
        displayName: user.displayName,
        role: user.role,
        loginUrl: `${env.NEXT_PUBLIC_BASE_URL}/login`,
    });

    // 5. トークン使用済み
    await markTokenUsed(token);

    // 6. 紹介ポイント
    await handleReferralReward({
        id: user.id,
        slug: user.slug,
        email: user.email,
        role: user.role,
        referrerSlug: user.referrerSlug ?? undefined,
        points: user.points ?? 0,
    });

    
    // 7. セッション発行
    const sessionToken = signSession({
        userId: String(user.id),
        slug: user.slug,
        role: user.role,
        email: user.email,
    });

    return {
        success: true,
        sessionToken,
        role: user.role as UserRole,
        slug: user.slug,
    };
}

async function handleReferralReward(user: {
    id: number;
    slug: string;
    email: string;
    role: string;
    referrerSlug?: string;
    points: number;
}) {
    const referrerSlug = user.referrerSlug;
    if (!referrerSlug) return;

    if (referrerSlug === user.slug) return;

    const referrer = await findUserBySlug(referrerSlug);
    if (!referrer) return;

    if (referrer.email === user.email) return;

    const existing = await findReferralByReferredSlug(user.slug);
    if (existing) return;

    const currentCount = await countReferralsBySlug(referrer.slug);
    if (currentCount >= MAX_REFERRALS) return;

    const referralCreated = await createReferral({
        referrerSlug,
        referredSlug: user.slug,
        referredEmail: user.email,
        referredRole: user.role,
    });
    if (!referralCreated) return;

    await addPointsToUser(referrer.slug, POINTS_PER_REFERRAL);
    await addPointsToUser(user.slug, POINTS_PER_REFERRAL);

    const nextCount = currentCount + 1;
    if (nextCount >= 3) {
        await rewardOnetimeMission(referrer.slug, "invite_three");
    }
}
