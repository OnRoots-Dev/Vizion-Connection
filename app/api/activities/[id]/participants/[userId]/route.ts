import { NextRequest, NextResponse } from "next/server";
import { getSupabaseProfile } from "@/lib/auth/session";
import { validateCSRF } from "@/lib/security/csrf";
import { readLimitedJson, PayloadTooLargeError } from "@/lib/security/body";
import { activityParticipantLimiter, getIp } from "@/lib/ratelimit";
import { activityParticipantRespondSchema } from "@/features/activity/validation";
import { respondParticipant } from "@/features/activity/server/activities";

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const USER_ID_RE = /^\d{1,18}$/;

/** Activity オーナーが Together 参加申請に応答（Accept / Decline）。 */
export async function PATCH(
    req: NextRequest,
    { params }: { params: Promise<{ id: string; userId: string }> },
): Promise<NextResponse> {
    const csrfError = validateCSRF(req);
    if (csrfError) return csrfError as unknown as NextResponse;

    const user = await getSupabaseProfile();
    if (!user) return NextResponse.json({ success: false, error: "ログインが必要です" }, { status: 401 });

    const { success: withinLimit } = await activityParticipantLimiter.limit(getIp(req));
    if (!withinLimit) {
        return NextResponse.json({ success: false, error: "しばらく時間をおいてから再度お試しください" }, { status: 429 });
    }

    const { id, userId } = await params;
    if (!UUID_RE.test(id) || !USER_ID_RE.test(userId)) {
        return NextResponse.json({ success: false, error: "Not found" }, { status: 404 });
    }

    let body: unknown;
    try {
        body = await readLimitedJson(req);
    } catch (e) {
        if (e instanceof PayloadTooLargeError) {
            return NextResponse.json({ success: false, error: "Payload too large" }, { status: 413 });
        }
        return NextResponse.json({ success: false, error: "Bad request" }, { status: 400 });
    }

    const parsed = activityParticipantRespondSchema.safeParse(body);
    if (!parsed.success) return NextResponse.json({ success: false, error: "Bad request" }, { status: 400 });

    try {
        const participant = await respondParticipant(user.id, id, Number(userId), parsed.data.status);
        if (!participant) {
            return NextResponse.json({ success: false, error: "応答できませんでした" }, { status: 404 });
        }
        return NextResponse.json({ success: true, participant });
    } catch (e) {
        console.error("[activities/participants/PATCH]", e instanceof Error ? e.message : e);
        return NextResponse.json({ success: false, error: "応答に失敗しました" }, { status: 400 });
    }
}
