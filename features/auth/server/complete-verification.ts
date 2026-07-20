// features/auth/server/complete-verification.ts
// メール認証完了時の後処理（verified更新・ミッション報酬・紹介報酬・完了メール）
// /auth/confirm（Supabase Authのメール認証着地点）および thanks ページから呼ばれる。

import { findUserBySlug, addPointsToUser, markUserVerified } from "@/lib/supabase/data/users.server";
import { findReferralByReferredSlug, createReferral, countReferralsBySlug } from "@/lib/supabase/referrals";
import { sendVerifiedEmail } from "@/lib/resend/send-verified-email";
import { rewardOnetimeMission } from "@/lib/onetime-missions";
import { env } from "@/lib/env";
import { upstashRedis } from "@/lib/upstash-redis";

const POINTS_PER_REFERRAL = 500;
const MAX_REFERRALS = 30;
const WELCOME_EMAIL_REDIS_PREFIX = "auth:welcome-email:";

/**
 * 認証済みフラグ・ミッション・紹介報酬を確定する。
 * 完了メールは送らない（ページ表示後に sendVerifiedWelcomeEmail で送る）。
 */
export async function completeEmailVerification(slug: string): Promise<boolean> {
    const profile = await findUserBySlug(slug);
    if (!profile) return false;

    // 冪等: 既に認証済みならスキップ
    if (profile.verified) return true;

    await markUserVerified(profile.slug);
    await rewardOnetimeMission(profile.slug, "email_verified");

    await handleReferralReward({
        slug: profile.slug,
        email: profile.email,
        role: profile.role,
        referrerSlug: profile.referrerSlug ?? undefined,
    });

    return true;
}

/**
 * 認証完了ウェルカムメールを 1 回だけ送信する（Redis NX で冪等）。
 * thanks ページ表示後に呼ぶ想定。
 */
export async function sendVerifiedWelcomeEmail(slug: string): Promise<{
    sent: boolean;
    skipped?: "not_found" | "not_verified" | "already_sent" | "error";
}> {
    const profile = await findUserBySlug(slug);
    if (!profile) return { sent: false, skipped: "not_found" };
    if (!profile.verified) return { sent: false, skipped: "not_verified" };

    const redisKey = `${WELCOME_EMAIL_REDIS_PREFIX}${profile.slug}`;
    try {
        // 初回のみ "1" をセット。既にあれば送信しない
        // Upstash: SET NX 成功時は "OK"、既にキーがある場合は null
        const acquired = await upstashRedis.set(redisKey, "1", {
            nx: true,
            ex: 60 * 60 * 24 * 365,
        });
        if (acquired === null) {
            return { sent: false, skipped: "already_sent" };
        }
    } catch (err) {
        console.error("[sendVerifiedWelcomeEmail] redis", err);
        // Redis 障害時は送信を続行（二重送信より未送信を避ける）
    }

    try {
        await sendVerifiedEmail({
            to: profile.email,
            displayName: profile.displayName ?? "",
            role: profile.role,
            loginUrl: `${env.NEXT_PUBLIC_BASE_URL}/login`,
        });
        return { sent: true };
    } catch (err) {
        console.error("[sendVerifiedWelcomeEmail] send failed", err);
        // 失敗時はキーを消し再試行できるようにする
        try {
            await upstashRedis.del(redisKey);
        } catch {
            /* ignore */
        }
        return { sent: false, skipped: "error" };
    }
}

async function handleReferralReward(user: {
    slug: string;
    email: string;
    role: string;
    referrerSlug?: string;
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

    if (currentCount + 1 >= 3) {
        await rewardOnetimeMission(referrer.slug, "invite_three");
    }
}
