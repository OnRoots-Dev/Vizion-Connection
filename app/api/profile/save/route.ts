// app/api/profile/me/route.ts
// プロフィール編集後にダッシュボードの状態を更新するためのAPI

import { NextResponse } from "next/server";
import { getSessionCookie } from "@/lib/auth/cookies";
import { verifySession } from "@/lib/auth/session";
import { findUserBySlug } from "@/lib/supabase/users";

export async function GET(): Promise<NextResponse> {
    const token = await getSessionCookie();
    if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const session = verifySession(token);
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const user = await findUserBySlug(session.slug);
    if (!user) return NextResponse.json({ error: "Not found" }, { status: 404 });

    // ProfileData形式で返す
    const profile = {
        id: user.id,
        slug: user.slug,
        displayName: user.displayName,
        email: user.email,
        role: user.role,
        isPublic: user.isPublic,
        isFoundingMember: user.isFoundingMember,
        verified: user.verified,
        serialId: user.serialId,
        avatarUrl: user.avatarUrl,
        profileImageUrl: user.profileImageUrl,
        bio: user.bio,
        region: user.region,
        prefecture: user.prefecture,
        location: user.location,
        sport: user.sport,
        sportsCategory: user.sportsCategory,
        stance: user.stance,
        instagram: user.instagram,
        xUrl: user.xUrl,
        tiktok: user.tiktok,
        cheerCount: user.cheerCount,
        points: user.points,
        missionBonusGiven: user.missionBonusGiven,
        hasShared: user.hasShared,
        referrerSlug: user.referrerSlug,
        createdAt: user.createdAt,
        lastLoginAt: user.lastLoginAt,
    };

    return NextResponse.json({ profile });
}