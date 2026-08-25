import { NextRequest, NextResponse } from "next/server";
import { getSupabaseProfile } from "@/lib/auth/session";
import { validateCSRF } from "@/lib/security/csrf";
import { readLimitedJson, PayloadTooLargeError } from "@/lib/security/body";
import { activityLimiter, getIp } from "@/lib/ratelimit";
import { activityCreateSchema, assertActivityTypeAllowed } from "@/features/activity/validation";
import { createActivity, listMyActivities } from "@/features/activity/server/activities";

const createSchema = activityCreateSchema;

export async function POST(req: NextRequest): Promise<NextResponse> {
    const csrfError = validateCSRF(req);
    if (csrfError) return csrfError as unknown as NextResponse;

    const user = await getSupabaseProfile();
    if (!user) return NextResponse.json({ success: false, error: "ログインが必要です" }, { status: 401 });

    const { success: withinLimit } = await activityLimiter.limit(getIp(req));
    if (!withinLimit) {
        return NextResponse.json({ success: false, error: "しばらく時間をおいてから再度お試しください" }, { status: 429 });
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

    const parsed = createSchema.safeParse(body);
    if (!parsed.success) {
        return NextResponse.json(
            { success: false, error: parsed.error.issues[0]?.message ?? "バリデーションエラー" },
            { status: 400 },
        );
    }

    // Role × Activity Type マトリクス（アプリ層強制）
    if (!assertActivityTypeAllowed(user.role, parsed.data.type)) {
        return NextResponse.json({ success: false, error: "この役割では選択できない種別です" }, { status: 403 });
    }

    try {
        const activity = await createActivity(user.id, parsed.data);
        return NextResponse.json({ success: true, activity });
    } catch (e) {
        console.error("[activities/POST]", e instanceof Error ? e.message : e);
        return NextResponse.json({ success: false, error: e instanceof Error ? e.message : "保存に失敗しました" }, { status: 400 });
    }
}

export async function GET(): Promise<NextResponse> {
    const user = await getSupabaseProfile();
    if (!user) return NextResponse.json({ success: false, error: "ログインが必要です" }, { status: 401 });

    const activities = await listMyActivities(user.id);
    return NextResponse.json({ success: true, activities });
}
