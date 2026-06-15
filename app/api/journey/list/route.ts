import { NextResponse } from "next/server";
import { getSupabaseProfile } from "@/lib/auth/session";
import { supabaseServer } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

// 本人の Journey 一覧（公開/非公開すべて）。Portfolio の時系列表示に使用。
export async function GET() {
    const user = await getSupabaseProfile();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { data, error } = await supabaseServer
        .from("journeys")
        .select("id, user_slug, content, condition_score, image_url, video_url, tags, is_public, cheer_count, created_at")
        .eq("user_slug", user.slug)
        .order("created_at", { ascending: false })
        .limit(300);

    if (error) {
        console.error("[journey/list] select error:", error);
        return NextResponse.json({ error: "読み込みに失敗しました" }, { status: 500 });
    }

    return NextResponse.json({ journeys: data ?? [] });
}
