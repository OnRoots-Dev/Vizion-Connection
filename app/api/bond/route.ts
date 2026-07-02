// app/api/bond/route.ts
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getSupabaseProfile } from "@/lib/auth/session";
import { createBond, isFollowing } from "@/lib/supabase/follows";
import { validateCSRF } from "@/lib/security/csrf";
import { readLimitedJson, PayloadTooLargeError } from "@/lib/security/body";
import { bondLimiter, getIp } from "@/lib/ratelimit";

const schema = z.object({
    targetSlug: z.string().min(1).max(50),
}).strict();

export async function POST(req: NextRequest): Promise<NextResponse> {
    const csrfError = validateCSRF(req);
    if (csrfError) return csrfError as unknown as NextResponse;

    const session = await getSupabaseProfile();
    if (!session) return NextResponse.json({ success: false, error: "ログインが必要です" }, { status: 401 });

    const { success: withinLimit } = await bondLimiter.limit(getIp(req));
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

    const parsed = schema.safeParse(body);
    if (!parsed.success) {
        return NextResponse.json({ success: false, error: "入力内容を確認してください" }, { status: 400 });
    }

    if (parsed.data.targetSlug === session.slug) {
        return NextResponse.json({ success: false, error: "自分自身をBondすることはできません" }, { status: 400 });
    }

    const result = await createBond(session.slug, parsed.data.targetSlug);
    if (!result.success) {
        return NextResponse.json({ success: false, error: result.error ?? "Bondに失敗しました" }, { status: 400 });
    }

    return NextResponse.json({ success: true, bonded: true });
}

export async function GET(req: NextRequest): Promise<NextResponse> {
    const session = await getSupabaseProfile();
    if (!session) return NextResponse.json({ bonded: false });

    const targetSlug = req.nextUrl.searchParams.get("targetSlug");
    if (!targetSlug) return NextResponse.json({ bonded: false });

    const bonded = await isFollowing(session.slug, targetSlug);
    return NextResponse.json({ bonded });
}
