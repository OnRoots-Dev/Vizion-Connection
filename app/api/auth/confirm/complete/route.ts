import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { addPointsToUser, findUserBySlug, markUserVerified } from "@/lib/supabase/data/users.server";
import { rewardOnetimeMission } from "@/lib/onetime-missions";
import { findReferralByReferredSlug, createReferral, countReferralsBySlug } from "@/lib/supabase/referrals";
import { sendVerifiedEmail } from "@/lib/resend/send-verified-email";

const POINTS_PER_REFERRAL = 500;
const MAX_REFERRALS = 30;

export async function POST(): Promise<NextResponse> {
    const supabase = await createClient();
    const {
        data: { user },
        error,
    } = await supabase.auth.getUser();

    if (error || !user) {
        return NextResponse.json({ success: false, error: "UNAUTHORIZED" }, { status: 401 });
    }

    const slug = user.user_metadata.slug;
    if (typeof slug !== "string" || !slug) {
        return NextResponse.json({ success: false, error: "INVALID_USER" }, { status: 400 });
    }

    const profile = await findUserBySlug(slug);
    if (!profile) {
        return NextResponse.json({ success: false, error: "NOT_FOUND" }, { status: 404 });
    }

    if (!profile.verified) {
        await markUserVerified(profile.slug);
        await rewardOnetimeMission(profile.slug, "email_verified");
        await sendVerifiedEmail({
            to: profile.email,
            displayName: profile.displayName,
            role: profile.role,
            loginUrl: `${process.env.NEXT_PUBLIC_BASE_URL}/login`,
        });
        await handleReferralReward({
            id: profile.id,
            slug: profile.slug,
            email: profile.email,
            role: profile.role,
            referrerSlug: profile.referrerSlug ?? undefined,
        });
    }

    return NextResponse.json({ success: true });
}

async function handleReferralReward(user: {
    id: number;
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
