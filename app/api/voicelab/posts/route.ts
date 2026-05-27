import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getSupabaseProfile } from "@/lib/auth/session";
import { createVoiceLabPost, getVoiceLabPosts, updateVoiceLabPostStatus } from "@/lib/voicelab";

const createSchema = z.object({
    category: z.enum(["feature", "bug", "idea", "other"]),
    title: z.string().min(1).max(120),
    body: z.string().min(1).max(2000),
});

const updateStatusSchema = z.object({
    postId: z.string().uuid(),
    status: z.enum(["open", "reviewing", "planned", "done"]),
});

export async function GET() {
    const posts = await getVoiceLabPosts();
    return NextResponse.json({ posts });
}

export async function POST(req: NextRequest) {
    try {
        const session = await getSupabaseProfile();
        if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const parsed = createSchema.safeParse(await req.json());
        if (!parsed.success) {
            return NextResponse.json({ error: "入力内容が不正です" }, { status: 400 });
        }

        const ok = await createVoiceLabPost(
            Number(session.id),
            parsed.data.category,
            parsed.data.title,
            parsed.data.body,
        );

        if (!ok) return NextResponse.json({ error: "投稿に失敗しました" }, { status: 500 });
        return NextResponse.json({ success: true });
    } catch (err) {
        console.error("[POST /api/voicelab/posts]", err);
        return NextResponse.json({ error: "Server error" }, { status: 500 });
    }
}

export async function PATCH(req: NextRequest) {
    try {
        const session = await getSupabaseProfile();
        if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        if (session.role !== "Admin") {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }

        const parsed = updateStatusSchema.safeParse(await req.json());
        if (!parsed.success) {
            return NextResponse.json({ error: "入力内容が不正です" }, { status: 400 });
        }

        const ok = await updateVoiceLabPostStatus(parsed.data.postId, parsed.data.status);

        if (!ok) {
            return NextResponse.json({ error: "ステータス更新に失敗しました" }, { status: 500 });
        }

        return NextResponse.json({ success: true });
    } catch (err) {
        console.error("[PATCH /api/voicelab/posts]", err);
        return NextResponse.json({ error: "Server error" }, { status: 500 });
    }
}
