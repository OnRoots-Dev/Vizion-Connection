import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createNewsPostComment, getNewsPostComments, getNewsPostById } from "@/lib/news";
import { validateCSRF } from "@/lib/security/csrf";
import { PayloadTooLargeError, readLimitedJson } from "@/lib/security/body";
import { getSessionCookie } from "@/lib/auth/cookies";
import { verifySession } from "@/lib/auth/session";
import { findUserBySlug } from "@/lib/supabase/data/users.server";

const schema = z.object({
    postId: z.string().trim().min(1).max(120),
    body: z.string().trim().min(1).max(500),
}).strict();

export async function GET(req: NextRequest) {
    const postId = req.nextUrl.searchParams.get("postId")?.trim();
    if (!postId) {
        return NextResponse.json({ success: false, error: "postId is required" }, { status: 400 });
    }

    const comments = await getNewsPostComments(postId);
    return NextResponse.json({ success: true, comments });
}

export async function POST(req: NextRequest) {
    const csrfError = validateCSRF(req);
    if (csrfError) return csrfError as unknown as NextResponse;

    try {
        const token = await getSessionCookie();
        if (!token) {
            return NextResponse.json({ success: false, error: "ログインが必要です" }, { status: 401 });
        }

        const session = verifySession(token);
        if (!session) {
            return NextResponse.json({ success: false, error: "ログインが必要です" }, { status: 401 });
        }

        const user = await findUserBySlug(session.slug);
        if (!user) {
            return NextResponse.json({ success: false, error: "ユーザーが見つかりません" }, { status: 404 });
        }

        let body: unknown;
        try {
            body = await readLimitedJson(req, 16 * 1024);
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

        const comment = await createNewsPostComment({
            postId: parsed.data.postId,
            userSlug: user.slug,
            authorName: user.displayName || user.slug,
            authorRole: user.role,
            avatarUrl: user.avatarUrl || user.profileImageUrl || null,
            body: parsed.data.body,
        });

        if (!comment) {
            return NextResponse.json({ success: false, error: "コメントの保存に失敗しました" }, { status: 500 });
        }

        return NextResponse.json({ success: true, comment });
    } catch (error) {
        const message = error instanceof Error ? error.message : "UNKNOWN";
        return NextResponse.json({ success: false, error: message || "コメントの投稿に失敗しました" }, { status: 500 });
    }
}
