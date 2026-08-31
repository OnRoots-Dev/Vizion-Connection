import { NextRequest, NextResponse } from "next/server";
import { getSupabaseProfile } from "@/lib/auth/session";
import { validateCSRF } from "@/lib/security/csrf";
import { readLimitedJson, PayloadTooLargeError } from "@/lib/security/body";
import { activityCommentLimiter, getIp } from "@/lib/ratelimit";
import { activityCommentCreateSchema } from "@/features/activity/validation";
import { addActivityComment, getVisibleActivity, listActivityComments } from "@/features/activity/server/activities";

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }): Promise<NextResponse> {
    const user = await getSupabaseProfile();
    const { id } = await params;
    if (!UUID_RE.test(id)) return NextResponse.json({ success: false, error: "Not found" }, { status: 404 });

    // 親Activityの可視性を必ず確認（private/connectionsには非当事者はアクセス不能）
    const activity = await getVisibleActivity(id, user?.id ?? null);
    if (!activity) return NextResponse.json({ success: false, error: "Not found" }, { status: 404 });

    const comments = await listActivityComments(id);
    return NextResponse.json({ success: true, comments });
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }): Promise<NextResponse> {
    const csrfError = validateCSRF(req);
    if (csrfError) return csrfError as unknown as NextResponse;

    const user = await getSupabaseProfile();
    if (!user) return NextResponse.json({ success: false, error: "ログインが必要です" }, { status: 401 });

    const { success: withinLimit } = await activityCommentLimiter.limit(getIp(req));
    if (!withinLimit) {
        return NextResponse.json({ success: false, error: "しばらく時間をおいてから再度お試しください" }, { status: 429 });
    }

    const { id } = await params;
    if (!UUID_RE.test(id)) return NextResponse.json({ success: false, error: "Not found" }, { status: 404 });

    const activity = await getVisibleActivity(id, user.id);
    if (!activity) return NextResponse.json({ success: false, error: "Not found" }, { status: 404 });

    let body: unknown;
    try {
        body = await readLimitedJson(req);
    } catch (e) {
        if (e instanceof PayloadTooLargeError) {
            return NextResponse.json({ success: false, error: "Payload too large" }, { status: 413 });
        }
        return NextResponse.json({ success: false, error: "Bad request" }, { status: 400 });
    }

    const parsed = activityCommentCreateSchema.safeParse(body);
    if (!parsed.success) {
        return NextResponse.json(
            { success: false, error: parsed.error.issues[0]?.message ?? "バリデーションエラー" },
            { status: 400 },
        );
    }

    try {
        const comment = await addActivityComment(user.id, id, parsed.data.body);
        return NextResponse.json({ success: true, comment });
    } catch (e) {
        console.error("[activities/comments/POST]", e instanceof Error ? e.message : e);
        return NextResponse.json({ success: false, error: "コメントに失敗しました" }, { status: 400 });
    }
}
