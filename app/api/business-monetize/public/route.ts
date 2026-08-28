// app/api/business-monetize/public/route.ts
// 公開（ユーザー向け）読み取り専用 API。
// ・active Campaign（広告）一覧
// ・Map Pin（有料Businessの実店舗座標）
// 認証不要（anonでも可能だが、認証済みなら視聴者情報も取れる）。

import { NextRequest, NextResponse } from "next/server";
import { listPublicCampaigns, listBusinessMapPins, listPublicAds } from "@/lib/supabase/business-monetize";
import { getSupabaseProfile } from "@/lib/auth/session";

export async function GET(req: NextRequest) {
  try {
    const sp = req.nextUrl.searchParams;
    const mode = sp.get("mode") ?? "all";
    const prefecture = sp.get("prefecture");
    const limit = Number(sp.get("limit")) || 20;

    if (mode === "pins") {
      const pins = await listBusinessMapPins();
      return NextResponse.json({ success: true, pins });
    }
    if (mode === "campaigns") {
      const campaigns = await listPublicCampaigns({ prefecture: prefecture || null, limit });
      return NextResponse.json({ success: true, campaigns });
    }
    if (mode === "ads") {
      // scopeターゲティング用の閲覧者都道府県はserver側のセッションから解決する
      // （Client指定を信用しない = Client側で表示可否を迂回できない）。
      const profile = await getSupabaseProfile();
      const viewerPrefecture = profile?.prefecture ?? null;
      const ads = await listPublicAds({ prefecture: viewerPrefecture, limit });
      return NextResponse.json({ success: true, ads });
    }

    const [campaigns, pins] = await Promise.all([
      listPublicCampaigns({ prefecture: prefecture || null, limit }),
      listBusinessMapPins(),
    ]);
    return NextResponse.json({ success: true, campaigns, pins });
  } catch {
    return NextResponse.json({ success: false, error: "情報の取得に失敗しました" }, { status: 500 });
  }
}
