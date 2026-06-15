// features/auth/server/complete-verification.ts
// メール認証完了時の後処理（verified更新・ミッション報酬・紹介報酬・完了メール）
// /auth/confirm（Supabase Authのメール認証着地点）から呼ばれる。

import { findUserBySlug, addPointsToUser, markUserVerified } from "@/lib/supabase/data/users.server";
import { findReferralByReferredSlug, createReferral, countReferralsBySlug } from "@/lib/supabase/referrals";
import { sendVerifiedEmail } from "@/lib/resend/send-verified-email";
import { rewardOnetimeMission } from "@/lib/onetime-missions";
import { env } from "@/lib/env";

const POINTS_PER_REFERRAL = 500;
const MAX_REFERRALS = 30;

export async function completeEmailVerification(slug: string): Promise<boolean> {
    const profile = await findUserBySlug(slug);
    if (!profile) return false;

    // 冪等: 既に認証済みなら何もしない
    if (profile.verified) return true;

    await markUserVerified(profile.slug);
    await rewardOnetimeMission(profile.slug, "email_verified");

    await sendVerifiedEmail({
        to: profile.email,
        displayName: profile.displayName,
        role: profile.role,
        loginUrl: `${env.NEXT_PUBLIC_BASE_URL}/login`,
    });

    await handleReferralReward({
        slug: profile.slug,
        email: profile.email,
        role: profile.role,
        referrerSlug: profile.referrerSlug ?? undefined,
    });

    return true;
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
