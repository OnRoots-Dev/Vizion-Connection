import { NextRequest, NextResponse } from "next/server";
import { getSupabaseProfile } from "@/lib/auth/session";
import { validateCSRF } from "@/lib/security/csrf";
import { activityCommentLimiter, getIp } from "@/lib/ratelimit";
import { deleteActivityComment } from "@/features/activity/server/activities";

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/** Activityコメント削除（投稿者本人のみ）。 */
export async function DELETE(
    req: NextRequest,
    { params }: { params: Promise<{ id: string; commentId: string }> },
): Promise<NextResponse> {
    const csrfError = validateCSRF(req);
    if (csrfError) return csrfError as unknown as NextResponse;

    const user = await getSupabaseProfile();
    if (!user) return NextResponse.json({ success: false, error: "ログインが必要です" }, { status: 401 });

    const { success: withinLimit } = await activityCommentLimiter.limit(getIp(req));
    if (!withinLimit) {
        return NextResponse.json({ success: false, error: "しばらく時間をおいてから再度お試しください" }, { status: 429 });
    }

    const { id, commentId } = await params;
    if (!UUID_RE.test(id) || !UUID_RE.test(commentId)) {
        return NextResponse.json({ success: false, error: "Not found" }, { status: 404 });
    }

    try {
        const { deleted } = await deleteActivityComment(user.id, id, commentId);
        if (!deleted) return NextResponse.json({ success: false, error: "Not found" }, { status: 404 });
        return NextResponse.json({ success: true, deleted: true });
    } catch (e) {
        console.error("[activities/comments/DELETE]", e instanceof Error ? e.message : e);
        return NextResponse.json({ success: false, error: "削除に失敗しました" }, { status: 400 });
    }
}
