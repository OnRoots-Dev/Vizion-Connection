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
    const start = url.searchParams.get("start");
    const end = url.searchParams.get("end");

    const selectWithSiteUrl = "id,user_slug,title,start_at,end_at,location,site_url,description,category,is_public,created_at,updated_at";
    const selectWithoutSiteUrl = "id,user_slug,title,start_at,end_at,location,description,category,is_public,created_at,updated_at";

    const q = (select: string) =>
      supabaseServer
        .from("schedules")
        .select(select as any)
        .eq("user_slug", session.slug)
        .order("start_at", { ascending: true });

    let { data, error } = await q(selectWithSiteUrl);
    if (error) {
      const msg = String((error as any)?.message ?? "");
      if (msg.toLowerCase().includes("site_url") && msg.toLowerCase().includes("column")) {
        ({ data, error } = await q(selectWithoutSiteUrl));
      }
    }

    if (error) {
      console.error("[GET /api/schedules/mine]", error);
      return NextResponse.json({ success: false, error: "サーバーエラーが発生しました" }, { status: 500 });
    }

    const rows = (data ?? []) as any[];

    const schedules = rows.filter((schedule) => {
      const startAt = new Date(String((schedule as any).start_at)).getTime();
      const endAt = (schedule as any).end_at ? new Date(String((schedule as any).end_at)).getTime() : startAt;
      const startLimit = start ? new Date(start).getTime() : null;
      const endLimit = end ? new Date(end).getTime() : null;

      if (startLimit !== null && Number.isFinite(startLimit) && endAt < startLimit) return false;
      if (endLimit !== null && Number.isFinite(endLimit) && startAt >= endLimit) return false;
      return true;
    });

    return NextResponse.json({ success: true, schedules });
  } catch (err) {
    console.error("[GET /api/schedules/mine]", err);
    return NextResponse.json({ success: false, error: "サーバーエラーが発生しました" }, { status: 500 });
  }
}
