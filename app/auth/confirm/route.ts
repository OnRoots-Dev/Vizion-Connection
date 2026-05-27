import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { markUserVerified, findUserBySlug, addPointsToUser } from "@/lib/supabase/data/users.server";
import { rewardOnetimeMission } from "@/lib/onetime-missions";
import { findReferralByReferredSlug, createReferral, countReferralsBySlug } from "@/lib/supabase/referrals";
import { sendVerifiedEmail } from "@/lib/resend/send-verified-email";

const POINTS_PER_REFERRAL = 500;
const MAX_REFERRALS = 30;

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const token_hash = searchParams.get("token_hash");
  const type = searchParams.get("type") as "email" | null;
  const next = searchParams.get("next") ?? "/login";

  if (token_hash && type) {
    const supabase = await createClient();
    const { data, error } = await supabase.auth.verifyOtp({ token_hash, type });

    if (!error) {
      const user = data.user;
      const slug = user?.user_metadata?.slug;
      const role = user?.user_metadata?.role;

      if (typeof slug === "string" && slug) {
        const profile = await findUserBySlug(slug);
        if (profile && !profile.verified) {
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
      }

      return NextResponse.redirect(new URL(next, request.url));
    }
  }

  return NextResponse.redirect(
    new URL("/login?error=confirmation_failed", request.url),
  );
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
