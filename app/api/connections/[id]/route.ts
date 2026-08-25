import { NextRequest, NextResponse } from "next/server";
import { getSupabaseProfile } from "@/lib/auth/session";
import { validateCSRF } from "@/lib/security/csrf";
import { connectionLimiter, getIp } from "@/lib/ratelimit";
import { acceptConnection, removeConnection } from "@/features/connection/server/connections";

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/** 承認（addressee のみ / pending のみ）。 */
export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }): Promise<NextResponse> {
    const csrfError = validateCSRF(req);
    if (csrfError) return csrfError as unknown as NextResponse;

    const user = await getSupabaseProfile();
    if (!user) return NextResponse.json({ success: false, error: "ログインが必要です" }, { status: 401 });

    const { success: withinLimit } = await connectionLimiter.limit(getIp(req));
    if (!withinLimit) {
        return NextResponse.json({ success: false, error: "しばらく時間をおいてから再度お試しください" }, { status: 429 });
    }

    const { id } = await params;
    if (!UUID_RE.test(id)) return NextResponse.json({ success: false, error: "Not found" }, { status: 404 });

    const result = await acceptConnection(user.id, id);
    if (!result.ok) return NextResponse.json({ success: false, error: result.reason }, { status: 400 });
    return NextResponse.json({ success: true, accepted: true });
}

/** 取り消し（pending）/ 解除（accepted）— 当事者のどちらでも可。 */
export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }): Promise<NextResponse> {
    const csrfError = validateCSRF(req);
    if (csrfError) return csrfError as unknown as NextResponse;

    const user = await getSupabaseProfile();
    if (!user) return NextResponse.json({ success: false, error: "ログインが必要です" }, { status: 401 });

    const { success: withinLimit } = await connectionLimiter.limit(getIp(req));
    if (!withinLimit) {
        return NextResponse.json({ success: false, error: "しばらく時間をおいてから再度お試しください" }, { status: 429 });
    }

    const { id } = await params;
    if (!UUID_RE.test(id)) return NextResponse.json({ success: false, error: "Not found" }, { status: 404 });

    const result = await removeConnection(user.id, id);
    if (!result.ok) return NextResponse.json({ success: false, error: result.reason }, { status: 400 });
    return NextResponse.json({ success: true, removed: true });
}
