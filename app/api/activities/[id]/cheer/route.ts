import { NextRequest, NextResponse } from "next/server";
import { getSupabaseProfile } from "@/lib/auth/session";
import { validateCSRF } from "@/lib/security/csrf";
import { activityCheerLimiter, getIp } from "@/lib/ratelimit";
import { getVisibleActivity, toggleActivityCheer } from "@/features/activity/server/activities";

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }): Promise<NextResponse> {
    const csrfError = validateCSRF(req);
    if (csrfError) return csrfError as unknown as NextResponse;

    const user = await getSupabaseProfile();
    if (!user) return NextResponse.json({ success: false, error: "ログインが必要です" }, { status: 401 });

    const { success: withinLimit } = await activityCheerLimiter.limit(getIp(req));
    if (!withinLimit) {
        return NextResponse.json({ success: false, error: "しばらく時間をおいてから再度お試しください" }, { status: 429 });
    }

    const { id } = await params;
    if (!UUID_RE.test(id)) return NextResponse.json({ success: false, error: "Not found" }, { status: 404 });

    // 可視性ゲート: 見えないActivityにはCheerできない
    const activity = await getVisibleActivity(id, user.id);
    if (!activity) return NextResponse.json({ success: false, error: "Not found" }, { status: 404 });

    try {
        const result = await toggleActivityCheer(user.id, id);
        return NextResponse.json({ success: true, ...result });
    } catch (e) {
        console.error("[activities/cheer/POST]", e instanceof Error ? e.message : e);
        return NextResponse.json({ success: false, error: e instanceof Error ? e.message : "Cheerに失敗しました" }, { status: 400 });
    }
}
