// app/api/share/complete/route.ts

import { NextResponse } from "next/server";
import { getSessionCookie } from "@/lib/auth/cookies";
import { verifySession } from "@/lib/auth/session";
import { findUserBySlug, updateUserProfile } from "@/lib/supabase/users";
import { shareLimiter, getIp } from "@/lib/ratelimit";
import { validateCSRF } from "@/lib/security/csrf";

export async function POST(req: Request) {
    try {
        const csrfError = validateCSRF(req);
        if (csrfError) return csrfError as unknown as NextResponse;

        const { success } = await shareLimiter.limit(getIp(req));
        if (!success) return NextResponse.json({ success: false, error: "しばらく時間をおいてから再度お試しください" }, { status: 429 });

        const token = await getSessionCookie();
        if (!token) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });

        const session = verifySession(token);
        if (!session) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });

        const user = await findUserBySlug(session.slug);
        if (!user) return NextResponse.json({ success: false, error: "User not found" }, { status: 404 });

        if (!user.hasShared) {
            await updateUserProfile(user.slug, { hasShared: true });
        }

        return NextResponse.json({ success: true });
    } catch (err) {
        console.error("[share/complete]", err);
        return NextResponse.json({ success: false, error: "Server error" }, { status: 500 });
    }
}
