import { NextResponse } from "next/server";
import { getSessionCookie } from "@/lib/auth/cookies";
import { verifySession } from "@/lib/auth/session";
import { supabaseServer } from "@/lib/supabase/server";

export async function POST(req: Request): Promise<NextResponse> {
  try {
    const token = await getSessionCookie();
    if (!token) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });

    const session = verifySession(token);
    if (!session) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });

    const body = await req.json();

    const title = typeof body?.title === "string" ? body.title.trim() : "";
    const category = typeof body?.category === "string" ? body.category : "";
    const startAt = typeof body?.start_at === "string" ? body.start_at : "";
    if (!title || !category || !startAt) {
      return NextResponse.json({ success: false, error: "Bad Request" }, { status: 400 });
    }

    const insertBase = {
      user_slug: session.slug,
      title,
      start_at: startAt,
      end_at: body.end_at ?? null,
      location: body.location ?? null,
      description: body.description ?? null,
      category,
      is_public: Boolean(body.is_public),
    };

    const insertWithSite = { ...insertBase, site_url: body.site_url ?? null };
    const selectWithSiteUrl = "id,user_slug,title,start_at,end_at,location,site_url,description,category,is_public,created_at,updated_at";
    const selectWithoutSiteUrl = "id,user_slug,title,start_at,end_at,location,description,category,is_public,created_at,updated_at";

    let { data, error } = await supabaseServer
      .from("schedules")
      .insert(insertWithSite as any)
      .select(selectWithSiteUrl as any)
      .single();

    if (error) {
      const msg = String((error as any)?.message ?? "");
      if (msg.toLowerCase().includes("site_url") && msg.toLowerCase().includes("column")) {
        ({ data, error } = await supabaseServer
          .from("schedules")
          .insert(insertBase as any)
          .select(selectWithoutSiteUrl as any)
          .single());
      }
    }

    if (error) {
      console.error("[POST /api/schedules]", error);
      return NextResponse.json({ success: false, error: error.message || "サーバーエラーが発生しました" }, { status: 500 });
    }

    return NextResponse.json({ success: true, schedule: data });
  } catch (err) {
    console.error("[POST /api/schedules]", err);
    return NextResponse.json({ success: false, error: "サーバーエラーが発生しました" }, { status: 500 });
  }
}

export async function PUT(req: Request): Promise<NextResponse> {
  try {
    const token = await getSessionCookie();
    if (!token) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });

    const session = verifySession(token);
    if (!session) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });

    const body = await req.json();
    const id = String(body.id ?? "");
    if (!id) return NextResponse.json({ success: false, error: "Bad Request" }, { status: 400 });

    const title = typeof body?.title === "string" ? body.title.trim() : "";
    const category = typeof body?.category === "string" ? body.category : "";
    const startAt = typeof body?.start_at === "string" ? body.start_at : "";
    if (!title || !category || !startAt) {
      return NextResponse.json({ success: false, error: "Bad Request" }, { status: 400 });
    }

    const updateBase = {
      title,
      start_at: startAt,
      end_at: body.end_at ?? null,
      location: body.location ?? null,
      description: body.description ?? null,
      category,
      is_public: Boolean(body.is_public),
    };

    const updateWithSite = { ...updateBase, site_url: body.site_url ?? null };
    const selectWithSiteUrl = "id,user_slug,title,start_at,end_at,location,site_url,description,category,is_public,created_at,updated_at";
    const selectWithoutSiteUrl = "id,user_slug,title,start_at,end_at,location,description,category,is_public,created_at,updated_at";

    let { data, error } = await supabaseServer
      .from("schedules")
      .update(updateWithSite as any)
      .eq("id", id)
      .eq("user_slug", session.slug)
      .select(selectWithSiteUrl as any)
      .single();

    if (error) {
      const msg = String((error as any)?.message ?? "");
      if (msg.toLowerCase().includes("site_url") && msg.toLowerCase().includes("column")) {
        ({ data, error } = await supabaseServer
          .from("schedules")
          .update(updateBase as any)
          .eq("id", id)
          .eq("user_slug", session.slug)
          .select(selectWithoutSiteUrl as any)
          .single());
      }
    }

    if (error) {
      console.error("[PUT /api/schedules]", error);
      return NextResponse.json({ success: false, error: error.message || "サーバーエラーが発生しました" }, { status: 500 });
    }

    return NextResponse.json({ success: true, schedule: data });
  } catch (err) {
    console.error("[PUT /api/schedules]", err);
    return NextResponse.json({ success: false, error: "サーバーエラーが発生しました" }, { status: 500 });
  }
}

export async function DELETE(req: Request): Promise<NextResponse> {
  try {
    const token = await getSessionCookie();
    if (!token) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });

    const session = verifySession(token);
    if (!session) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });

    const body = await req.json();
    const id = String(body.id ?? "");
    if (!id) return NextResponse.json({ success: false, error: "Bad Request" }, { status: 400 });

    const { error } = await supabaseServer
      .from("schedules")
      .delete()
      .eq("id", id)
      .eq("user_slug", session.slug);

    if (error) {
      console.error("[DELETE /api/schedules]", error);
      return NextResponse.json({ success: false, error: error.message || "サーバーエラーが発生しました" }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[DELETE /api/schedules]", err);
    return NextResponse.json({ success: false, error: "サーバーエラーが発生しました" }, { status: 500 });
  }
}
