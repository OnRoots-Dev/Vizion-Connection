import { NextRequest, NextResponse } from "next/server";
import { getSupabaseProfile } from "@/lib/auth/session";
import { supabaseServer } from "@/lib/supabase/server";
import { validateCSRF } from "@/lib/security/csrf";
import { activityLimiter, getIp } from "@/lib/ratelimit";
import { activityUpdateSchema, assertActivityTypeAllowed } from "@/features/activity/validation";
import { deleteActivity, updateActivity, getVisibleActivity } from "@/features/activity/server/activities";

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/**
 * 単一Activityの可視取得（読み取り専用）。
 * 閲覧者の可視性ルール（getVisibleActivity）で判定。他者の公開・募集中Activityも
 * Detail表示できるようにするための入口。書き込みは行わない。
 * PII は author の slug/display_name 程度で、通常の公開Activity表示と同じ扱い。
 */
export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }): Promise<NextResponse> {
    const user = await getSupabaseProfile();
    const { id } = await params;
    if (!UUID_RE.test(id)) return NextResponse.json({ success: false, error: "Not found" }, { status: 404 });

    const activity = await getVisibleActivity(id, user?.id ?? null);
    if (!activity) return NextResponse.json({ success: false, error: "Not found" }, { status: 404 });

    let place: { id: string; name: string; prefecture: string } | null = null;
    if (activity.place_id) {
        const { data } = await supabaseServer
            .from("places")
            .select("id,name,prefecture")
            .eq("id", activity.place_id)
            .maybeSingle<{ id: string; name: string; prefecture: string }>();
        place = data ?? null;
    }
    return NextResponse.json({ success: true, activity: { ...activity, place } });
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }): Promise<NextResponse> {
    const csrfError = validateCSRF(req);
    if (csrfError) return csrfError as unknown as NextResponse;

    const user = await getSupabaseProfile();
    if (!user) return NextResponse.json({ success: false, error: "ログインが必要です" }, { status: 401 });

    const { success: withinLimit } = await activityLimiter.limit(getIp(req));
    if (!withinLimit) {
        return NextResponse.json({ success: false, error: "しばらく時間をおいてから再度お試しください" }, { status: 429 });
    }

    const { id } = await params;
    if (!UUID_RE.test(id)) return NextResponse.json({ success: false, error: "Not found" }, { status: 404 });

    let rawBody: unknown;
    try {
        rawBody = await req.json();
    } catch {
        return NextResponse.json({ success: false, error: "Invalid request body" }, { status: 400 });
    }

    const parsed = activityUpdateSchema.safeParse(rawBody);
    if (!parsed.success) {
        return NextResponse.json(
            { success: false, error: parsed.error.issues[0]?.message ?? "バリデーションエラー" },
            { status: 400 },
        );
    }
    if (parsed.data.type && !assertActivityTypeAllowed(user.role, parsed.data.type)) {
        return NextResponse.json({ success: false, error: "この役割では選択できない種別です" }, { status: 403 });
    }

    try {
        const updated = await updateActivity(user.id, id, parsed.data);
        if (!updated) return NextResponse.json({ success: false, error: "更新に失敗しました" }, { status: 400 });
        return NextResponse.json({ success: true, activity: updated });
    } catch (e) {
        console.error("[activities/PATCH]", e instanceof Error ? e.message : e);
        return NextResponse.json({ success: false, error: e instanceof Error ? e.message : "更新に失敗しました" }, { status: 400 });
    }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }): Promise<NextResponse> {
    const csrfError = validateCSRF(req);
    if (csrfError) return csrfError as unknown as NextResponse;

    const user = await getSupabaseProfile();
    if (!user) return NextResponse.json({ success: false, error: "ログインが必要です" }, { status: 401 });

    const { success: withinLimit } = await activityLimiter.limit(getIp(req));
    if (!withinLimit) {
        return NextResponse.json({ success: false, error: "しばらく時間をおいてから再度お試しください" }, { status: 429 });
    }

    const { id } = await params;
    if (!UUID_RE.test(id)) return NextResponse.json({ success: false, error: "Not found" }, { status: 404 });

    const result = await deleteActivity(user.id, id);
    if (!result.ok) return NextResponse.json({ success: false, error: result.reason }, { status: 400 });
    return NextResponse.json({ success: true });
}
