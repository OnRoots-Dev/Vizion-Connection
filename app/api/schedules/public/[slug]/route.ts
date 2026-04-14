import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase/server";

export async function GET(req: Request, { params }: { params: Promise<{ slug: string }> }): Promise<NextResponse> {
  try {
    const { slug } = await params;

    const url = new URL(req.url);
    const limit = Math.max(1, Math.min(50, Number(url.searchParams.get("limit") ?? "10") || 10));

    const now = new Date();
    now.setHours(0, 0, 0, 0);

    const { data, error } = await supabaseServer
      .from("schedules")
      .select("id,user_slug,title,start_at,end_at,location,description,category,is_public,created_at,updated_at")
      .eq("user_slug", slug)
      .eq("is_public", true)
      .gte("start_at", now.toISOString())
      .order("start_at", { ascending: true })
      .limit(limit);

    if (error) {
      console.error("[GET /api/schedules/public/[slug]]", error);
      return NextResponse.json({ success: false, error: "サーバーエラーが発生しました" }, { status: 500 });
    }

    return NextResponse.json({ success: true, schedules: data ?? [] });
  } catch (err) {
    console.error("[GET /api/schedules/public/[slug]]", err);
    return NextResponse.json({ success: false, error: "サーバーエラーが発生しました" }, { status: 500 });
  }
}
