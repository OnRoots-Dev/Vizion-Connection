// app/api/onboarding/complete/route.ts

import { NextRequest, NextResponse } from "next/server";
import { getSupabaseProfile } from "@/lib/auth/session";
import { updateOnboardingComplete } from "@/lib/supabase/data/users.server";

export async function POST(_req: NextRequest): Promise<NextResponse> {
    const session = await getSupabaseProfile();
    if (!session) return NextResponse.json({ success: false }, { status: 401 });

    const ok = await updateOnboardingComplete(session.slug);
    if (!ok) {
        return NextResponse.json({ success: false }, { status: 500 });
    }
    return NextResponse.json({ success: true });
}
