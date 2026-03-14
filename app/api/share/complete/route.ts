// app/api/share/complete/route.ts

import { NextResponse } from "next/server";
import { getSessionCookie } from "@/lib/auth/cookies";
import { verifySession } from "@/lib/auth/session";
import { findUserBySlug, updateUserProfile } from "@/lib/airtable/users";

export async function POST() {
    try {
        const token = await getSessionCookie();
        if (!token) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });

        const session = verifySession(token);
        if (!session) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });

        const user = await findUserBySlug(session.slug);
        if (!user) return NextResponse.json({ success: false, error: "User not found" }, { status: 404 });

        if (!user.hasShared) {
            await updateUserProfile(user.id, { hasShared: true });
        }

        return NextResponse.json({ success: true });
    } catch (err) {
        console.error("[share/complete]", err);
        return NextResponse.json({ success: false, error: "Server error" }, { status: 500 });
    }
}