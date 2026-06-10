import { z } from "zod";
import { NextRequest, NextResponse } from "next/server";
import { getSupabaseProfile } from "@/lib/auth/session";
import { supabaseServer } from "@/lib/supabase/server";
import { validateCSRF } from "@/lib/security/csrf";
import { journeyLimiter, getIp } from "@/lib/ratelimit";

const schema = z.object({
    content: z.string().min(1, "内容は必須です").max(500, "500文字以内で入力してください"),
    condition_score: z.number().int().min(1).max(5).optional(),
    image_url: z.string().url().optional(),
});

export async function POST(req: NextRequest) {
    const csrfError = validateCSRF(req);
    if (csrfError) return csrfError as unknown as NextResponse;

    const user = await getSupabaseProfile();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { success } = await journeyLimiter.limit(getIp(req));
    if (!success) return NextResponse.json({ error: "しばらく時間をおいてから再度お試しください" }, { status: 429 });

    let rawBody: unknown;
    try {
        rawBody = await req.json();
    } catch {
        return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
    }

    const parsed = schema.safeParse(rawBody);
    if (!parsed.success) {
        const message = parsed.error.issues[0]?.message ?? "バリデーションエラー";
        return NextResponse.json({ error: message }, { status: 400 });
    }

    const { content, condition_score, image_url } = parsed.data;

    // 同日投稿チェック（JST基準）
    const jstToday = new Date(Date.now() + 9 * 60 * 60 * 1000)
        .toISOString()
        .slice(0, 10); // "YYYY-MM-DD"
    const dayStart = `${jstToday}T00:00:00+09:00`;
    const dayEnd = `${jstToday}T23:59:59.999+09:00`;

    const { count } = await supabaseServer
        .from("journeys")
        .select("id", { count: "exact", head: true })
        .eq("user_slug", user.slug)
        .gte("created_at", dayStart)
        .lte("created_at", dayEnd);

    if (count && count > 0) {
        return NextResponse.json({ error: "今日のJourneyは既に記録済みです" }, { status: 409 });
    }

    const { data, error } = await supabaseServer
        .from("journeys")
        .insert({
            user_slug: user.slug,
            content,
            condition_score: condition_score ?? null,
            image_url: image_url ?? null,
            cheer_count: 0,
        })
        .select("id, user_slug, content, condition_score, created_at")
        .single();

    if (error || !data) {
        console.error("[journey/route] insert error:", error);
        return NextResponse.json({ error: "投稿に失敗しました" }, { status: 500 });
    }

    return NextResponse.json({ journey: data }, { status: 201 });
}
