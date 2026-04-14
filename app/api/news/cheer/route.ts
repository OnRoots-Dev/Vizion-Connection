import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getNewsPostById, incrementNewsPostCheer } from "@/lib/news";
import { PayloadTooLargeError, readLimitedJson } from "@/lib/security/body";
import { validateCSRF } from "@/lib/security/csrf";

const schema = z.object({
    postId: z.string().trim().min(1).max(120),
}).strict();

export async function POST(req: NextRequest) {
    const csrfError = validateCSRF(req);
    if (csrfError) return csrfError as unknown as NextResponse;

    let body: unknown;
    try {
        body = await readLimitedJson(req, 8 * 1024);
    } catch (error) {
        if (error instanceof PayloadTooLargeError) {
            return NextResponse.json({ success: false, error: "Payload too large" }, { status: 413 });
        }
        return NextResponse.json({ success: false, error: "Bad request" }, { status: 400 });
    }

    const parsed = schema.safeParse(body);
    if (!parsed.success) {
        return NextResponse.json({ success: false, error: parsed.error.issues[0]?.message ?? "入力内容を確認してください" }, { status: 400 });
    }

    const post = await getNewsPostById(parsed.data.postId);
    if (!post) {
        return NextResponse.json({ success: false, error: "記事が見つかりません" }, { status: 404 });
    }

    const cheerCount = await incrementNewsPostCheer(parsed.data.postId);
    if (cheerCount == null) {
        return NextResponse.json({ success: false, error: "Cheer の更新に失敗しました" }, { status: 500 });
    }

    return NextResponse.json({ success: true, cheerCount });
}
