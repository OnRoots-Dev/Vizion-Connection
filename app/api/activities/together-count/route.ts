import { NextRequest, NextResponse } from "next/server";
import { getSupabaseProfile } from "@/lib/auth/session";
import { supabaseServer } from "@/lib/supabase/server";

/**
 * 現在のユーザーの Together 実績カウント（読み取り専用・動的集計）。
 * activity_participants の accepted 件数を user_id で集計する。
 * DBカラムは追加せず、既存テーブルをその場で数える最小実装。
 * 返すのは数値のみ（PIIなし）。
 */
export async function GET(_req: NextRequest): Promise<NextResponse> {
    const user = await getSupabaseProfile();
    if (!user) return NextResponse.json({ success: false, error: "ログインが必要です" }, { status: 401 });

    const { count, error } = await supabaseServer
        .from("activity_participants")
        .select("*", { count: "exact", head: true })
        .eq("user_id", user.id)
        .eq("status", "accepted");

    if (error) {
        console.error("[activities/together-count]", error);
        return NextResponse.json({ success: false, error: "集計に失敗しました" }, { status: 500 });
    }
    return NextResponse.json({ success: true, count: count ?? 0 });
}
