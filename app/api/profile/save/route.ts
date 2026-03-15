import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import { verifySession } from "@/lib/auth/session";
import { findUserBySlug, updateUserProfile } from "@/lib/supabase/users";
import { SESSION_COOKIE_NAME } from "@/lib/auth/cookies";

export async function POST(req: NextRequest) {
    const cookieStore = await cookies();
    const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;
    if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const session = verifySession(token);
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const user = await findUserBySlug(session.slug);
    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

    const body = await req.json();

    await updateUserProfile(user.slug, {
        displayName: body.displayName,
        bio: body.bio,
        region: body.region,
        ...(user.prefecture ? {} : { prefecture: body.prefecture }),
        sportsCategory: body.sportsCategory,
        sport: body.sport,
        stance: body.stance,
        instagram: body.instagram,
        xUrl: body.xUrl,
        tiktok: body.tiktok,
        profileImageUrl: body.profileImageUrl,
        avatarUrl: body.avatarUrl,
        ...(typeof body.isPublic === "boolean" ? { isPublic: body.isPublic } : {}),
    });

    return NextResponse.json({ ok: true });
}