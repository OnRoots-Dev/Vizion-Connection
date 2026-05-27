import { NextRequest, NextResponse } from "next/server";
import { getSupabaseProfile } from "@/lib/auth/session";
import { updateUserProfile } from "@/lib/supabase/data/users.server";
import { profileLimiter, getIp } from "@/lib/ratelimit";
import { rewardOnetimeMission } from "@/lib/onetime-missions";
import { validateCSRF } from "@/lib/security/csrf";

export async function POST(req: NextRequest) {
    const csrfError = validateCSRF(req);
    if (csrfError) return csrfError as unknown as NextResponse;

    const user = await getSupabaseProfile();
    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

    const { success } = await profileLimiter.limit(getIp(req));
    if (!success) return NextResponse.json({ error: "しばらく時間をおいてから再度お試しください" }, { status: 429 });

    const body = await req.json();

    await updateUserProfile(user.slug, {
        displayName: body.displayName,
        bio: body.bio,
        region: body.region,
        prefecture: body.prefecture,
        location: body.location,
        sportsCategory: body.sportsCategory,
        sport: body.sport,
        stance: body.stance,
        instagram: body.instagram,
        xUrl: body.xUrl,
        tiktok: body.tiktok,
        profileImageUrl: body.profileImageUrl,
        bannerUrl: body.bannerUrl,
        avatarUrl: body.avatarUrl,
        ...(typeof body.isPublic === "boolean" ? { isPublic: body.isPublic } : {}),
    });

    const hasProfileDetails = Boolean(body.bio || body.sport || body.region);
    if (hasProfileDetails) {
        await rewardOnetimeMission(user.slug, "profile_completed");
    }

    return NextResponse.json({ ok: true });
}
