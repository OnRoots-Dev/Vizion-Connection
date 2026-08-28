import { NextRequest, NextResponse } from "next/server";
import { getSupabaseProfile } from "@/lib/auth/session";
import { listPublicMapActivities, listPublicMapMoments } from "@/features/activity/server/map";

/**
 * Viz Map データ契約（読み取り専用）。
 * 公開Activityのみ（private / connections は決して返さない）。
 * bbox 必須。段階的取得のため limit と期間で制限する。
 */
export async function GET(req: NextRequest): Promise<NextResponse> {
    const user = await getSupabaseProfile();
    if (!user) return NextResponse.json({ success: false, error: "ログインが必要です" }, { status: 401 });

    const sp = req.nextUrl.searchParams;
    const minLat = Number(sp.get("min_lat"));
    const maxLat = Number(sp.get("max_lat"));
    const minLng = Number(sp.get("min_lng"));
    const maxLng = Number(sp.get("max_lng"));

    if (![minLat, maxLat, minLng, maxLng].every(Number.isFinite)) {
        return NextResponse.json({ success: false, error: "bboxパラメータが必要です" }, { status: 400 });
    }
    if (minLat >= maxLat || minLng >= maxLng) {
        return NextResponse.json({ success: false, error: "bboxの指定が不正です" }, { status: 400 });
    }
    if (minLat < -90 || maxLat > 90 || minLng < -180 || maxLng > 180) {
        return NextResponse.json({ success: false, error: "bboxの指定が不正です" }, { status: 400 });
    }
    // 世界規模のクエリを防ぐ（MVPは日本国内想定の段階的取得）
    if (maxLat - minLat > 30 || maxLng - minLng > 40) {
        return NextResponse.json({ success: false, error: "範囲が広すぎます。ズームしてください" }, { status: 400 });
    }

    // Existing callers without an explicit type retain the original Activity-only response.
    const requestedType = sp.get("type") ?? "activity";
    if (!["activity", "moment", "all"].includes(requestedType)) {
        return NextResponse.json({ success: false, error: "typeの指定が不正です" }, { status: 400 });
    }
    const activities = await listPublicMapActivities(
        { minLat, maxLat, minLng, maxLng },
        { limit: Math.min(Number(sp.get("limit")) || 200, 500) },
    );
    const moments = requestedType === "activity" ? [] : await listPublicMapMoments(activities);
    const items = requestedType === "moment" ? moments : [...activities, ...moments];

    return NextResponse.json({ success: true, items });
}
