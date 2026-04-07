import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { cookies } from "next/headers";
import { SESSION_COOKIE_NAME } from "@/lib/auth/cookies";
import { verifySession } from "@/lib/auth/session";
import { toggleVoiceLabUpvote } from "@/lib/voicelab";

const schema = z.object({
    postId: z.string().uuid(),
});

export async function POST(req: NextRequest) {
    try {
        const cookieStore = await cookies();
        const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;
        if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const session = verifySession(token);
        if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const parsed = schema.safeParse(await req.json());
        if (!parsed.success) {
            return NextResponse.json({ error: "リクエストが不正です" }, { status: 400 });
        }

        const ok = await toggleVoiceLabUpvote(parsed.data.postId, Number(session.userId));
        if (!ok) return NextResponse.json({ error: "投票処理に失敗しました" }, { status: 500 });

        return NextResponse.json({ success: true });
    } catch (err) {
        console.error("[POST /api/voicelab/upvote]", err);
        return NextResponse.json({ error: "Server error" }, { status: 500 });
    }
}
