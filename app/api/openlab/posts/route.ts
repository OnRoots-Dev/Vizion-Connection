import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { cookies } from "next/headers";
import { SESSION_COOKIE_NAME } from "@/lib/auth/cookies";
import { verifySession } from "@/lib/auth/session";
import { createOpenlabPost, getOpenlabPosts, updateOpenlabPostStatus } from "@/lib/openlab";

const createSchema = z.object({
    category: z.enum(["feature", "bug", "idea", "other"]),
    title: z.string().min(1).max(120),
    body: z.string().min(1).max(2000),
});

const updateStatusSchema = z.object({
    postId: z.string().min(1),
    status: z.enum(["open", "reviewing", "done"]),
});

export async function GET() {
    const posts = await getOpenlabPosts();
    return NextResponse.json({ posts });
}

export async function POST(req: NextRequest) {
    try {
        const cookieStore = await cookies();
        const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;
        if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const session = verifySession(token);
        if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const parsed = createSchema.safeParse(await req.json());
        if (!parsed.success) {
            return NextResponse.json({ error: "入力内容が不正です" }, { status: 400 });
        }

        const ok = await createOpenlabPost(
            Number(session.userId),
            parsed.data.category,
            parsed.data.title,
            parsed.data.body,
        );

        if (!ok) return NextResponse.json({ error: "投稿に失敗しました" }, { status: 500 });
        return NextResponse.json({ success: true });
    } catch (err) {
        console.error("[POST /api/openlab/posts]", err);
        return NextResponse.json({ error: "Server error" }, { status: 500 });
    }
}

export async function PATCH(req: NextRequest) {
    try {
        const cookieStore = await cookies();
        const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;
        if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const session = verifySession(token);
        if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const parsed = updateStatusSchema.safeParse(await req.json());
        if (!parsed.success) {
            return NextResponse.json({ error: "入力内容が不正です" }, { status: 400 });
        }

        const ok = await updateOpenlabPostStatus(
            parsed.data.postId,
            Number(session.userId),
            parsed.data.status,
        );

        if (!ok) {
            return NextResponse.json(
                { error: "ステータス更新に失敗しました", todo: "TODO: 管理者権限での更新要件が固まったら owner 判定以外も追加する" },
                { status: 500 },
            );
        }

        return NextResponse.json({ success: true });
    } catch (err) {
        console.error("[PATCH /api/openlab/posts]", err);
        return NextResponse.json({ error: "Server error" }, { status: 500 });
    }
}
