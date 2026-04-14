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

    const { data, error } = await supabaseServer
      .from("schedules")
      .select("id,user_slug,title,start_at,end_at,location,description,category,is_public,created_at,updated_at")
      .eq("user_slug", session.slug)
      .gte("start_at", nowIso)
      .order("start_at", { ascending: true })
      .limit(limit);

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
