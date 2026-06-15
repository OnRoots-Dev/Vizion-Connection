import { z } from "zod";
import { NextRequest, NextResponse } from "next/server";
import { getSupabaseProfile } from "@/lib/auth/session";
import { supabaseServer } from "@/lib/supabase/server";
import { validateCSRF } from "@/lib/security/csrf";
import { journeyLimiter, getIp } from "@/lib/ratelimit";

const patchSchema = z.object({
    is_public: z.boolean(),
});

async function resolveOwnedJourney(id: string, slug: string) {
    const { data } = await supabaseServer
        .from("journeys")
        .select("id, user_slug")
        .eq("id", id)
        .single();
    if (!data || data.user_slug !== slug) return null;
    return data;
}

// 公開/非公開の切り替え（後から制御できる構造の中核）。
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const csrfError = validateCSRF(req);
    if (csrfError) return csrfError as unknown as NextResponse;

    const user = await getSupabaseProfile();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { success } = await journeyLimiter.limit(getIp(req));
    if (!success) return NextResponse.json({ error: "しばらく時間をおいてから再度お試しください" }, { status: 429 });

    const { id } = await params;

    let rawBody: unknown;
    try {
        rawBody = await req.json();
    } catch {
        return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
    }
    const parsed = patchSchema.safeParse(rawBody);
    if (!parsed.success) return NextResponse.json({ error: "バリデーションエラー" }, { status: 400 });

    const owned = await resolveOwnedJourney(id, user.slug);
    if (!owned) return NextResponse.json({ error: "Not found" }, { status: 404 });

    const { data, error } = await supabaseServer
        .from("journeys")
        .update({ is_public: parsed.data.is_public })
        .eq("id", id)
        .select("id, is_public")
        .single();

    if (error || !data) {
        console.error("[journey/[id]] update error:", error);
        return NextResponse.json({ error: "更新に失敗しました" }, { status: 500 });
    }

    return NextResponse.json({ journey: data });
}

// 本人の記録を削除。
export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const csrfError = validateCSRF(req);
    if (csrfError) return csrfError as unknown as NextResponse;

    const user = await getSupabaseProfile();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id } = await params;
    const owned = await resolveOwnedJourney(id, user.slug);
    if (!owned) return NextResponse.json({ error: "Not found" }, { status: 404 });

    const { error } = await supabaseServer.from("journeys").delete().eq("id", id);
    if (error) {
        console.error("[journey/[id]] delete error:", error);
        return NextResponse.json({ error: "削除に失敗しました" }, { status: 500 });
    }

    return NextResponse.json({ ok: true });
}
