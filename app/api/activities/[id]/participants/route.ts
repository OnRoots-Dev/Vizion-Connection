import { NextRequest, NextResponse } from "next/server";
import { getSupabaseProfile } from "@/lib/auth/session";
import { validateCSRF } from "@/lib/security/csrf";
import { readLimitedJson, PayloadTooLargeError } from "@/lib/security/body";
import { activityParticipantLimiter, getIp } from "@/lib/ratelimit";
import { activityParticipantApplySchema } from "@/features/activity/validation";
import { applyParticipant, getParticipantState, getVisibleActivity, listActivityParticipants } from "@/features/activity/server/activities";

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }): Promise<NextResponse> {
    const user = await getSupabaseProfile();
    const { id } = await params;
    if (!UUID_RE.test(id)) return NextResponse.json({ success: false, error: "Not found" }, { status: 404 });

    const activity = await getVisibleActivity(id, user?.id ?? null);
    if (!activity) return NextResponse.json({ success: false, error: "Not found" }, { status: 404 });

    const participants = await listActivityParticipants(id);
    const state = user ? await getParticipantState(user.id, id) : { status: null };
    return NextResponse.json({ success: true, participants, state });
}

/** 参加申請（Together 参加を希望）。 */
export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }): Promise<NextResponse> {
    const csrfError = validateCSRF(req);
    if (csrfError) return csrfError as unknown as NextResponse;

    const user = await getSupabaseProfile();
    if (!user) return NextResponse.json({ success: false, error: "ログインが必要です" }, { status: 401 });

    const { success: withinLimit } = await activityParticipantLimiter.limit(getIp(req));
    if (!withinLimit) {
        return NextResponse.json({ success: false, error: "しばらく時間をおいてから再度お試しください" }, { status: 429 });
    }

    const { id } = await params;
    if (!UUID_RE.test(id)) return NextResponse.json({ success: false, error: "Not found" }, { status: 404 });

    const activity = await getVisibleActivity(id, user.id);
    if (!activity) return NextResponse.json({ success: false, error: "Not found" }, { status: 404 });
    if (activity.user_id === user.id) {
        return NextResponse.json({ success: false, error: "自分のActivityには参加申請できません" }, { status: 400 });
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

    const parsed = activityParticipantApplySchema.safeParse(body);
    if (!parsed.success) return NextResponse.json({ success: false, error: "Bad request" }, { status: 400 });

    try {
        const participant = await applyParticipant(user.id, id);
        if (!participant) {
            return NextResponse.json({ success: false, error: "申請できませんでした（重複の可能性があります）" }, { status: 400 });
        }
        return NextResponse.json({ success: true, participant });
    } catch (e) {
        console.error("[activities/participants/POST]", e instanceof Error ? e.message : e);
        return NextResponse.json({ success: false, error: "申請に失敗しました" }, { status: 400 });
    }
}
