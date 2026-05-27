// app/api/collect/route.ts

import { NextRequest, NextResponse } from "next/server";
import { getSupabaseProfile } from "@/lib/auth/session";
import { collectCard, uncollectCard, hasCollected, getCollectedCardCount } from "@/lib/supabase/collections";
import { validateCSRF } from "@/lib/security/csrf";
import { readLimitedJson, PayloadTooLargeError } from "@/lib/security/body";
import { z } from "zod";

const schema = z.object({
    targetSlug: z.string().min(1).max(50),
    action: z.enum(["collect", "uncollect"]),
}).strict();

const COLLECTION_LIMIT = 10;

export async function POST(req: NextRequest): Promise<NextResponse> {
    const csrfError = validateCSRF(req);
    if (csrfError) return csrfError as unknown as NextResponse;

    const session = await getSupabaseProfile();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    let body: { targetSlug: string; action: "collect" | "uncollect" };
    try {
        body = await readLimitedJson(req);
    } catch (e) {
        if (e instanceof PayloadTooLargeError) {
            return new NextResponse("Payload too large", { status: 413 });
        }
        return new NextResponse("Bad request", { status: 400 });
    }
    const parsed = schema.safeParse(body);
    if (!parsed.success) return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
    const { targetSlug, action } = parsed.data;

    if (!targetSlug) return NextResponse.json({ error: "targetSlug required" }, { status: 400 });
    if (targetSlug === session.slug) return NextResponse.json({ error: "自分のカードはコレクトできません" }, { status: 400 });

    if (action === "uncollect") {
        await uncollectCard(session.slug, targetSlug);
        return NextResponse.json({ ok: true, collected: false });
    }

    // 重複チェック
    const already = await hasCollected(session.slug, targetSlug);
    if (already) return NextResponse.json({ ok: true, collected: true, alreadyCollected: true });

    const collectedCount = await getCollectedCardCount(session.slug);
    if (collectedCount >= COLLECTION_LIMIT) {
        return NextResponse.json({ error: `コレクションの上限は${COLLECTION_LIMIT}枚です` }, { status: 400 });
    }

    const success = await collectCard(session.slug, targetSlug);
    return NextResponse.json({ ok: success, collected: success });
}

export async function GET(req: NextRequest): Promise<NextResponse> {
    const session = await getSupabaseProfile();
    if (!session) return NextResponse.json({ collected: false });

    const targetSlug = req.nextUrl.searchParams.get("targetSlug");
    if (!targetSlug) return NextResponse.json({ collected: false });

    const collected = await hasCollected(session.slug, targetSlug);
    return NextResponse.json({ collected });
}
