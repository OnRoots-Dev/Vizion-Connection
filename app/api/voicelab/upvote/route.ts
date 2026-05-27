import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getSupabaseProfile } from "@/lib/auth/session";
import { toggleVoiceLabUpvote } from "@/lib/voicelab";

const schema = z.object({
    postId: z.string().uuid(),
});

export async function POST(req: NextRequest) {
    try {
        const session = await getSupabaseProfile();
        if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const parsed = schema.safeParse(await req.json());
        if (!parsed.success) {
            return NextResponse.json({ error: "リクエストが不正です" }, { status: 400 });
        }

        const ok = await toggleVoiceLabUpvote(parsed.data.postId, Number(session.id));
        if (!ok) return NextResponse.json({ error: "投票処理に失敗しました" }, { status: 500 });

        return NextResponse.json({ success: true });
    } catch (err) {
        console.error("[POST /api/voicelab/upvote]", err);
        return NextResponse.json({ error: "Server error" }, { status: 500 });
    }
}
