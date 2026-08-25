import { z } from "zod";
import { NextRequest, NextResponse } from "next/server";
import { getSupabaseProfile } from "@/lib/auth/session";
import { validateCSRF } from "@/lib/security/csrf";
import { momentCheerLimiter, getIp } from "@/lib/ratelimit";
import { getVisibleMoment, toggleCheer } from "@/features/moment/server/moments";

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const actionSchema = z.object({}).strict();

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }): Promise<NextResponse> {
    const csrfError = validateCSRF(req);
    if (csrfError) return csrfError as unknown as NextResponse;

    const user = await getSupabaseProfile();
    if (!user) return NextResponse.json({ success: false, error: "ログインが必要です" }, { status: 401 });

    const { success: withinLimit } = await momentCheerLimiter.limit(getIp(req));
    if (!withinLimit) {
        return NextResponse.json({ success: false, error: "しばらく時間をおいてから再度お試しください" }, { status: 429 });
    }

    const { id } = await params;
    if (!UUID_RE.test(id)) return NextResponse.json({ success: false, error: "Not found" }, { status: 404 });

    // body は空オブジェクトのみ許可（厳格スキーマ）
    try {
        const raw = await req.json().catch(() => ({}));
        const parsed = actionSchema.safeParse(raw ?? {});
        if (!parsed.success) return NextResponse.json({ success: false, error: "Bad request" }, { status: 400 });
    } catch {
        return NextResponse.json({ success: false, error: "Bad request" }, { status: 400 });
    }

    // 可視性ゲート: 見えないMomentにはCheerできない
    const moment = await getVisibleMoment(id, user.id);
    if (!moment) return NextResponse.json({ success: false, error: "Not found" }, { status: 404 });

    try {
        const result = await toggleCheer(user.id, id);
        return NextResponse.json({ success: true, ...result });
    } catch (e) {
        console.error("[moments/cheer/POST]", e instanceof Error ? e.message : e);
        return NextResponse.json({ success: false, error: e instanceof Error ? e.message : "Cheerに失敗しました" }, { status: 400 });
    }
}
