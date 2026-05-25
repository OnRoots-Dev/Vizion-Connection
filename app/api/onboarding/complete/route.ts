// app/api/onboarding/complete/route.ts

import { NextRequest, NextResponse } from "next/server";
import { getSessionCookie } from "@/lib/auth/cookies";
import { verifySession } from "@/lib/auth/session";
import { updateOnboardingComplete } from "@/lib/supabase/data/users.server";

export async function POST(_req: NextRequest): Promise<NextResponse> {
    const token = await getSessionCookie();
    if (!token) return NextResponse.json({ success: false }, { status: 401 });

    const session = verifySession(token);
    if (!session) return NextResponse.json({ success: false }, { status: 401 });

    const ok = await updateOnboardingComplete(session.slug);
    return NextResponse.json({ success: ok });
}
