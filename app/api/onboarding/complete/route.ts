// app/api/onboarding/complete/route.ts

import { NextRequest, NextResponse } from "next/server";
import { getSupabaseProfile } from "@/lib/auth/session";
import { updateOnboardingComplete } from "@/lib/supabase/data/users.server";
import { validateCSRF } from "@/lib/security/csrf";
import { onboardingLimiter } from "@/lib/ratelimit";

export async function POST(req: NextRequest): Promise<NextResponse> {
    const csrfError = validateCSRF(req);
    if (csrfError) return csrfError as unknown as NextResponse;

    const session = await getSupabaseProfile();
    if (!session) return NextResponse.json({ success: false }, { status: 401 });

    const { success: rlOk } = await onboardingLimiter.limit(session.slug);
    if (!rlOk) {
        return NextResponse.json({ success: false, error: "しばらく時間をおいてから再度お試しください" }, { status: 429 });
    }

    const ok = await updateOnboardingComplete(session.slug);
    if (!ok) {
        return NextResponse.json({ success: false }, { status: 500 });
    }
    return NextResponse.json({ success: true });
}
