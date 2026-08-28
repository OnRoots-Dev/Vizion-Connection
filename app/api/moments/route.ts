import { z } from "zod";
import { NextRequest, NextResponse } from "next/server";
import { getSupabaseProfile } from "@/lib/auth/session";
import { validateCSRF } from "@/lib/security/csrf";
import { readLimitedJson, PayloadTooLargeError } from "@/lib/security/body";
import { momentLimiter, getIp } from "@/lib/ratelimit";
import { momentCreateSchema } from "@/features/moment/validation";
import { createMoment, listPublicMoments } from "@/features/moment/server/moments";
import { listVisibleMomentFeed } from "@/features/moment/server/moments";
import { listMyConnections } from "@/features/connection/server/connections";
import { notifyMomentCreated } from "@/lib/notifications/create-notification";
import { getOwnedActivity } from "@/features/activity/server/activities";

const feedQuerySchema = z.object({
    limit: z.coerce.number().int().min(1).max(50).optional(),
    before: z.string().datetime({ offset: true }).optional(),
    scope: z.enum(["all", "mine", "connections"]).optional(),
});

export async function POST(req: NextRequest): Promise<NextResponse> {
    const csrfError = validateCSRF(req);
    if (csrfError) return csrfError as unknown as NextResponse;

    const user = await getSupabaseProfile();
    if (!user) return NextResponse.json({ success: false, error: "ログインが必要です" }, { status: 401 });

    const { success: withinLimit } = await momentLimiter.limit(getIp(req));
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

    const parsed = momentCreateSchema.safeParse(body);
    if (!parsed.success) {
        return NextResponse.json(
            { success: false, error: parsed.error.issues[0]?.message ?? "バリデーションエラー" },
            { status: 400 },
        );
    }

    try {
        const moment = await createMoment(user.id, parsed.data);
        // Activityのタイトルを取得して通知を送信
        if (moment.activity_id) {
            const activity = await getOwnedActivity(user.id, moment.activity_id);
            if (activity && activity.title) {
                await notifyMomentCreated({
                    slug: user.slug,
                    momentId: moment.id,
                    activityTitle: activity.title,
                });
            }
        }
        return NextResponse.json({ success: true, moment });
    } catch (e) {
        console.error("[moments/POST]", e instanceof Error ? e.message : e);
        return NextResponse.json({ success: false, error: e instanceof Error ? e.message : "保存に失敗しました" }, { status: 400 });
    }
}

/** 公開フィード（public かつ親Activityも公開かつ所有者プロフィール公開のみ）。 */
export async function GET(req: NextRequest): Promise<NextResponse> {
    const user = await getSupabaseProfile();
    const parsed = feedQuerySchema.safeParse(Object.fromEntries(req.nextUrl.searchParams));
    const options = parsed.success ? parsed.data : {};

    if (options.scope === "mine" || options.scope === "connections") {
        if (!user) return NextResponse.json({ success: false, error: "ログインが必要です" }, { status: 401 });
        const ownerIds = options.scope === "mine"
            ? [user.id]
            : (await listMyConnections(user.id)).filter((connection) => connection.status === "accepted" && connection.counterpart).map((connection) => connection.counterpart!.id);
        const items = await listVisibleMomentFeed({ ownerIds, viewerId: user.id, includePrivate: options.scope === "mine", limit: options.limit, before: options.before });
        return NextResponse.json({ success: true, items });
    }

    const items = await listPublicMoments({
        limit: options.limit,
        before: options.before,
        viewerId: user?.id ?? null,
    });
    return NextResponse.json({ success: true, items });
}
