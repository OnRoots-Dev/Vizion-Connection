import { NextResponse } from "next/server";
import { getSessionCookie } from "@/lib/auth/cookies";
import { verifySession } from "@/lib/auth/session";
import { supabaseServer } from "@/lib/supabase/server";

export async function GET(req: Request): Promise<NextResponse> {
  try {
    const token = await getSessionCookie();
    if (!token) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const session = verifySession(token);
    if (!session) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const url = new URL(req.url);
    const limit = Math.max(1, Math.min(20, Number(url.searchParams.get("limit") ?? "3") || 3));

    const nowIso = new Date().toISOString();

    const selectWithSiteUrl = "id,user_slug,title,start_at,end_at,location,site_url,description,category,is_public,created_at,updated_at";
    const selectWithoutSiteUrl = "id,user_slug,title,start_at,end_at,location,description,category,is_public,created_at,updated_at";

    const q = (select: string) =>
      supabaseServer
        .from("schedules")
        .select(select as any)
        .eq("user_slug", session.slug)
        // Show items that are upcoming OR currently ongoing
        .or(`start_at.gte.${nowIso},end_at.gte.${nowIso}`)
        .order("start_at", { ascending: true })
        .limit(limit);

    let { data, error } = await q(selectWithSiteUrl);
    if (error) {
      const msg = String((error as any)?.message ?? "");
      if (msg.toLowerCase().includes("site_url") && msg.toLowerCase().includes("column")) {
        ({ data, error } = await q(selectWithoutSiteUrl));
      }
    }

    if (error) {
      console.error("[GET /api/schedules/upcoming]", error);
      return NextResponse.json({ success: false, error: "サーバーエラーが発生しました" }, { status: 500 });
    }

    return NextResponse.json({ success: true, schedules: data ?? [] });
  } catch (err) {
    console.error("[GET /api/schedules/upcoming]", err);
    return NextResponse.json({ success: false, error: "サーバーエラーが発生しました" }, { status: 500 });
  }
}
