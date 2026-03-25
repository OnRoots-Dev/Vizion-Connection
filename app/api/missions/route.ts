// app/api/missions/complete/route.ts

import { NextResponse } from "next/server";
import { getSessionCookie } from "@/lib/auth/cookies";
import { verifySession } from "@/lib/auth/session";
import { findUserBySlug, updateUserPoints, setMissionBonusGiven } from "@/lib/supabase/users";
import { missionLimiter, getIp } from "@/lib/ratelimit";
import { validateCSRF } from "@/lib/security/csrf";

const MISSION_BONUS_POINTS = 1000;

export async function POST(req: Request): Promise<NextResponse> {
    try {
        const csrfError = validateCSRF(req);
        if (csrfError) return csrfError as unknown as NextResponse;

        const token = await getSessionCookie();
        if (!token) return NextResponse.json({ ok: false, error: "unauthenticated" }, { status: 401 });

        const session = verifySession(token);
        if (!session) return NextResponse.json({ ok: false, error: "unauthenticated" }, { status: 401 });

        const { success } = await missionLimiter.limit(getIp(req));
        if (!success) return NextResponse.json({ ok: false, error: "しばらく時間をおいてから再度お試しください" }, { status: 429 });

        const user = await findUserBySlug(session.slug);
        if (!user) return NextResponse.json({ ok: false, error: "not_found" }, { status: 404 });

        // 二重付与防止
        if (user.missionBonusGiven) {
            return NextResponse.json({ ok: true, alreadyGiven: true });
        }

        // ポイント付与 + フラグ更新
        await updateUserPoints(user.slug, user.points + MISSION_BONUS_POINTS);
        await setMissionBonusGiven(user.slug);

        return NextResponse.json({ ok: true, pointsAdded: MISSION_BONUS_POINTS });

    } catch (err) {
        console.error("[missions/complete]", err);
        return NextResponse.json({ ok: false, error: "server_error" }, { status: 500 });
    }
}
