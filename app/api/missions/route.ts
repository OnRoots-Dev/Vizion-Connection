// app/api/missions/complete/route.ts

import { NextResponse } from "next/server";
import { getSessionCookie } from "@/lib/auth/cookies";
import { verifySession } from "@/lib/auth/session";
import { findUserBySlug, updateUserPoints, setMissionBonusGiven } from "@/lib/supabase/data/users.server";
import { countReferralsBySlug } from "@/lib/supabase/referrals";
import { missionLimiter, getIp } from "@/lib/ratelimit";
import { validateCSRF } from "@/lib/security/csrf";
import { notifyMissionRewardGranted } from "@/lib/notifications/create-notification";
import { buildOnetimeMissions, getDailyMissionsWithProgress } from "@/lib/missions";

const MISSION_BONUS_POINTS = 1000;

export async function GET(): Promise<NextResponse> {
    try {
        const token = await getSessionCookie();
        if (!token) return NextResponse.json({ success: false, error: "unauthenticated" }, { status: 401 });

        const session = verifySession(token);
        if (!session) return NextResponse.json({ success: false, error: "unauthenticated" }, { status: 401 });

        const user = await findUserBySlug(session.slug);
        if (!user) return NextResponse.json({ success: false, error: "not_found" }, { status: 404 });

        const [referralCount, daily] = await Promise.all([
            countReferralsBySlug(user.slug),
            getDailyMissionsWithProgress(session.userId),
        ]);

        const onetime = buildOnetimeMissions({
            verified: user.verified,
            hasShared: Boolean(user.hasShared),
            referralCount,
            hasProfileDetails: Boolean(user.bio || user.sport || user.region),
        });

        return NextResponse.json({ onetime, daily });
    } catch (err) {
        console.error("[GET /api/missions]", err);
        return NextResponse.json({ success: false, error: "server_error" }, { status: 500 });
    }
}

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
        const referralCount = await countReferralsBySlug(user.slug);

        // 二重付与防止
        if (user.missionBonusGiven) {
            return NextResponse.json({ ok: true, alreadyGiven: true });
        }

        const allDone = Boolean(
            user.verified &&
            user.hasShared &&
            referralCount >= 3 &&
            (user.bio || user.sport || user.region),
        );
        if (!allDone) {
            return NextResponse.json({ ok: false, error: "missions_not_completed" }, { status: 400 });
        }

        // ポイント付与 + フラグ更新
        const pointOk = await updateUserPoints(user.slug, user.points + MISSION_BONUS_POINTS);
        const flagOk = await setMissionBonusGiven(user.slug);
        if (!pointOk || !flagOk) {
            return NextResponse.json({ ok: false, error: "update_failed" }, { status: 500 });
        }
        await notifyMissionRewardGranted({
            slug: user.slug,
            points: MISSION_BONUS_POINTS,
        }).catch((err) => {
            console.error("[notifyMissionRewardGranted]", err);
        });

        return NextResponse.json({ ok: true, pointsAdded: MISSION_BONUS_POINTS });

    } catch (err) {
        console.error("[missions/complete]", err);
        return NextResponse.json({ ok: false, error: "server_error" }, { status: 500 });
    }
}
