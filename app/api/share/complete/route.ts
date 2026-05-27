// app/api/share/complete/route.ts

import { NextResponse } from "next/server";
import { getSupabaseProfile } from "@/lib/auth/session";
import { updateUserProfile } from "@/lib/supabase/data/users.server";
import { shareLimiter, getIp } from "@/lib/ratelimit";
import { validateCSRF } from "@/lib/security/csrf";
import { rewardOnetimeMission } from "@/lib/onetime-missions";

export async function POST(req: Request) {
    try {
        const csrfError = validateCSRF(req);
        if (csrfError) return csrfError as unknown as NextResponse;

        const { success } = await shareLimiter.limit(getIp(req));
        if (!success) return NextResponse.json({ success: false, error: "しばらく時間をおいてから再度お試しください" }, { status: 429 });

        const user = await getSupabaseProfile();
        if (!user) return NextResponse.json({ success: false, error: "User not found" }, { status: 404 });

        if (!user.hasShared) {
            await updateUserProfile(user.slug, { hasShared: true });
            await rewardOnetimeMission(user.slug, "profile_shared");
        }

        return NextResponse.json({ success: true });
    } catch (err) {
        console.error("[share/complete]", err);
        return NextResponse.json({ success: false, error: "Server error" }, { status: 500 });
    }
}
