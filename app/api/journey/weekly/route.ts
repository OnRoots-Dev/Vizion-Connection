import { NextRequest, NextResponse } from "next/server";
import { getSupabaseProfile } from "@/lib/auth/session";
import { supabaseServer } from "@/lib/supabase/server";

/**
 * Journey Weekly: 指定JST週（月曜00:00 〜 翌月曜00:00）の自分の Activity を返す。
 * Journey の「今週のActivity」集計表示（Weekly）のデータソース。
 * Daily（journeys テーブル）には一切触れず、activities のみ読む。既存構造を変更しない。
 */

function thisWeekJst(): { weekStart: string; weekEnd: string } {
    // 現在時刻をJST基準のDateで表現（既存 journey/route.ts と同じ手法）
    const nowJst = new Date(Date.now() + 9 * 60 * 60 * 1000);
    const y = nowJst.getUTCFullYear();
    const m = nowJst.getUTCMonth();
    const d = nowJst.getUTCDate();
    const dow = (nowJst.getUTCDay() + 6) % 7; // 0=月
    const startJst = new Date(Date.UTC(y, m, d - dow, 0, 0, 0));
    const endJst = new Date(startJst.getTime() + 7 * 24 * 60 * 60 * 1000);
    // UTC の Date を "+09:00" オフセット表記へ変換
    const toIsoJst = (dt: Date) => `${dt.toISOString().slice(0, 19)}+09:00`;
    return { weekStart: toIsoJst(startJst), weekEnd: toIsoJst(endJst) };
}

export async function GET(req: NextRequest): Promise<NextResponse> {
    const user = await getSupabaseProfile();
    if (!user) return NextResponse.json({ success: false, error: "ログインが必要です" }, { status: 401 });

    const { weekStart: defaultStart, weekEnd: defaultEnd } = thisWeekJst();
    const rawStart = req.nextUrl.searchParams.get("weekStart") ?? defaultStart;
    const rawEnd = req.nextUrl.searchParams.get("weekEnd") ?? defaultEnd;

    const startMs = Date.parse(rawStart);
    const endMs = Date.parse(rawEnd);
    if (!Number.isFinite(startMs) || !Number.isFinite(endMs) || endMs <= startMs) {
        return NextResponse.json({ success: false, error: "週の範囲が不正です" }, { status: 400 });
    }
    const weekStart = new Date(startMs).toISOString();
    const weekEnd = new Date(endMs).toISOString();

    const { data, error } = await supabaseServer
        .from("activities")
        .select(
            `id,type,title,starts_at,ends_at,status,visibility,
             place:places!left(id,name,prefecture)`,
        )
        .eq("user_id", user.id)
        .gte("starts_at", weekStart)
        .lt("starts_at", weekEnd)
        .order("starts_at", { ascending: false });

    if (error) {
        console.error("[journey/weekly] select error:", error.message);
        return NextResponse.json({ success: false, error: "読み込みに失敗しました" }, { status: 500 });
    }

    const rows = (data ?? []) as unknown as Array<{
        id: string; type: string; title: string | null; starts_at: string; ends_at: string | null;
        status: string; visibility: string;
        place: { id: string; name: string; prefecture: string } | null;
    }>;

    // 各Activityの Together（accepted）参加者を取得
    const activities = await Promise.all(
        rows.map(async (r) => {
            let participants: { user_slug: string | null; user_display_name: string | null }[] = [];
            try {
                const { data: parts } = await supabaseServer
                    .from("activity_participants")
                    .select("participant:users(id,slug,display_name)")
                    .eq("activity_id", r.id)
                    .eq("status", "accepted");
                if (parts) {
                    participants = (parts as unknown as Array<{ participant: { slug: string; display_name: string | null } | null }>).map(
                        (p) => ({ user_slug: p.participant?.slug ?? null, user_display_name: p.participant?.display_name ?? null }),
                    );
                }
            } catch {
                /* participants 未導入でも集計は壊さない */
            }
            return {
                id: r.id,
                type: r.type,
                title: r.title,
                starts_at: r.starts_at,
                ends_at: r.ends_at,
                status: r.status,
                visibility: r.visibility,
                place: r.place,
                participants,
            };
        }),
    );

    const total = activities.length;
    const completed = activities.filter((a) => a.status === "completed").length;
    const byType: Record<string, number> = {};
    for (const a of activities) {
        byType[a.type] = (byType[a.type] ?? 0) + 1;
    }

    return NextResponse.json({
        success: true,
        weekStart,
        weekEnd,
        activities,
        counts: { total, completed, byType },
    });
}
