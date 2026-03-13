// features/auth/server/verify.ts

import { findUserByEmail, findUserBySlug, addPointsToUser, markUserVerified } from "@/lib/airtable/users";
import { findVerifyToken, markTokenUsed } from "@/lib/airtable/verify-tokens";
import { findReferralByReferredSlug, createReferral } from "@/lib/airtable/referrals";
import { sendVerifiedEmail } from "@/lib/resend/send-verified-email";
import { signSession } from "@/lib/auth/session";
import { env } from "@/lib/env";
import type { UserRole } from "@/features/auth/types";

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
    const tokenRecord = await findVerifyToken(token);
    if (!tokenRecord) {
        return { success: false, error: "無効なトークンです" };
    }
    if (tokenRecord.used) {
        return { success: false, error: "このリンクはすでに使用済みです" };
    }

    // 2. 有効期限チェック（24時間）
    const createdAt = new Date(tokenRecord.createdAt).getTime();
    if (Date.now() - createdAt > 24 * 60 * 60 * 1000) {
        return { success: false, error: "リンクの有効期限が切れています" };
    }

    // 3. ユーザー取得
    const user = await findUserByEmail(tokenRecord.email);
    if (!user) {
        return { success: false, error: "ユーザーが見つかりません" };
    }

    // すでに認証済みでもセッション発行してリダイレクト
    if (user.verified) {
        const sessionToken = signSession({
            userId: user.id,
            slug: user.slug,
            role: user.role,
            email: user.email,
        });
        return { success: true, sessionToken, role: user.role as UserRole, slug: user.slug };
    }

    // 4. verified = true に更新
    await markUserVerified(user.email);

    await sendVerifiedEmail({
        to: user.email,
        displayName: user.displayName,
        role: user.role,
        loginUrl: `${env.NEXT_PUBLIC_BASE_URL}/login`,
    });

    // 5. トークンを使用済みに
    await markTokenUsed(tokenRecord.id);

    // 6. 紹介ポイント付与
    await handleReferralReward(user);

    // 7. セッション発行
    const sessionToken = signSession({
        userId: user.id,
        slug: user.slug,
        role: user.role,
        email: user.email,
    });

    return { success: true, sessionToken, role: user.role as UserRole, slug: user.slug };
}

async function handleReferralReward(user: {
    id: string;
    slug: string;
    email: string;
    role: string;
    referrerSlug?: string;
    points: number;
}) {
    const referrerSlug = user.referrerSlug;
    if (!referrerSlug) return;

    // self-referral 防止
    if (referrerSlug === user.slug) return;

    // 紹介者取得
    const referrer = await findUserBySlug(referrerSlug);
    if (!referrer) return;

    // 同一メール防止
    if (referrer.email === user.email) return;

    // 二重付与防止
    const existing = await findReferralByReferredSlug(user.slug);
    if (existing) return;

    // 紹介上限チェック（referrer の現在の紹介数を Referrals テーブルで管理）
    // ここでは points ベースで簡易チェック
    const estimatedCount = Math.floor((referrer.points ?? 0) / POINTS_PER_REFERRAL);
    if (estimatedCount >= MAX_REFERRALS) return;

    // A（紹介者）に 500pt 付与
    await addPointsToUser(referrer.slug, POINTS_PER_REFERRAL);

    // B（被紹介者）に 500pt 付与
    await addPointsToUser(user.slug, POINTS_PER_REFERRAL);

    // Referrals テーブルに記録
    await createReferral({
        referrerSlug,
        referredSlug: user.slug,
        referredEmail: user.email,
        referredRole: user.role,
        status: "completed",
        pointsAwarded: POINTS_PER_REFERRAL,
    });
}