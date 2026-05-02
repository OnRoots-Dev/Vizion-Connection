import { NextResponse } from "next/server";
import { getSessionCookie } from "@/lib/auth/cookies";
import { verifySession } from "@/lib/auth/session";
import { scheduleLimiter, getIp } from "@/lib/ratelimit";
import { validateCSRF } from "@/lib/security/csrf";
import {
  checkScheduleOwnership,
  createScheduleForUser,
  deleteScheduleForUser,
  updateScheduleForUser,
} from "@/features/schedules/server/schedules";

export async function POST(req: Request): Promise<NextResponse> {
  try {
    const csrfError = validateCSRF(req);
    if (csrfError) return csrfError as unknown as NextResponse;

    const token = await getSessionCookie();
    if (!token) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });

    const session = verifySession(token);
    if (!session) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });

    const { success } = await scheduleLimiter.limit(getIp(req));
    if (!success) return NextResponse.json({ success: false, error: "しばらく時間をおいてから再度お試しください" }, { status: 429 });

    const body = await req.json();

    const title = typeof body?.title === "string" ? body.title.trim() : "";
    const category = typeof body?.category === "string" ? body.category : "";
    const startAt = typeof body?.start_at === "string" ? body.start_at : "";
    if (!title || !category || !startAt) {
      return NextResponse.json({ success: false, error: "Bad Request" }, { status: 400 });
    }

    try {
      const schedule = await createScheduleForUser({
        userSlug: session.slug,
        title,
        category,
        start_at: startAt,
        end_at: body.end_at ?? null,
        location: body.location ?? null,
        site_url: body.site_url ?? null,
        description: body.description ?? null,
        is_public: Boolean(body.is_public),
      });
      return NextResponse.json({ success: true, schedule });
    } catch (error: any) {
      console.error("[POST /api/schedules]", error);
      return NextResponse.json({ success: false, error: error?.message || "サーバーエラーが発生しました" }, { status: 500 });
    }
  } catch (err) {
    console.error("[POST /api/schedules]", err);
    return NextResponse.json({ success: false, error: "サーバーエラーが発生しました" }, { status: 500 });
  }
}

export async function PUT(req: Request): Promise<NextResponse> {
  try {
    const csrfError = validateCSRF(req);
    if (csrfError) return csrfError as unknown as NextResponse;

    const token = await getSessionCookie();
    if (!token) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });

    const session = verifySession(token);
    if (!session) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });

    const { success } = await scheduleLimiter.limit(getIp(req));
    if (!success) return NextResponse.json({ success: false, error: "しばらく時間をおいてから再度お試しください" }, { status: 429 });

    const body = await req.json();
    const id = String(body.id ?? "");
    if (!id) return NextResponse.json({ success: false, error: "Bad Request" }, { status: 400 });

    const title = typeof body?.title === "string" ? body.title.trim() : "";
    const category = typeof body?.category === "string" ? body.category : "";
    const startAt = typeof body?.start_at === "string" ? body.start_at : "";
    if (!title || !category || !startAt) {
      return NextResponse.json({ success: false, error: "Bad Request" }, { status: 400 });
    }

    let schedule: any = null;
    try {
      schedule = await updateScheduleForUser({
        userSlug: session.slug,
        id,
        title,
        category,
        start_at: startAt,
        end_at: body.end_at ?? null,
        location: body.location ?? null,
        site_url: body.site_url ?? null,
        description: body.description ?? null,
        is_public: Boolean(body.is_public),
      });
    } catch (error: any) {
      const msg = String(error?.message ?? "");
      if (msg.toLowerCase().includes("json object requested") || msg.toLowerCase().includes("cannot coerce")) {
        return NextResponse.json({ success: false, error: "Not Found" }, { status: 404 });
      }
      console.error("[PUT /api/schedules]", error);
      return NextResponse.json({ success: false, error: error?.message || "サーバーエラーが発生しました" }, { status: 500 });
    }

    if (!schedule) {
      try {
        const existsData = await checkScheduleOwnership({ id });
        if (existsData && (existsData as any).user_slug && String((existsData as any).user_slug) !== session.slug) {
          return NextResponse.json({ success: false, error: "Forbidden" }, { status: 403 });
        }
      } catch (err) {
        console.error("[PUT /api/schedules] ownership check failed", err);
      }

      return NextResponse.json({ success: false, error: "Not Found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, schedule });
  } catch (err) {
    console.error("[PUT /api/schedules]", err);
    return NextResponse.json({ success: false, error: "サーバーエラーが発生しました" }, { status: 500 });
  }
}

export async function DELETE(req: Request): Promise<NextResponse> {
  try {
    const csrfError = validateCSRF(req);
    if (csrfError) return csrfError as unknown as NextResponse;

    const token = await getSessionCookie();
    if (!token) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });

    const session = verifySession(token);
    if (!session) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });

    const { success } = await scheduleLimiter.limit(getIp(req));
    if (!success) return NextResponse.json({ success: false, error: "しばらく時間をおいてから再度お試しください" }, { status: 429 });

    const body = await req.json();
    const id = String(body.id ?? "");
    if (!id) return NextResponse.json({ success: false, error: "Bad Request" }, { status: 400 });

    let deleted: any = null;
    try {
      deleted = await deleteScheduleForUser({ userSlug: session.slug, id });
    } catch (error: any) {
      console.error("[DELETE /api/schedules]", error);
      return NextResponse.json({ success: false, error: error?.message || "サーバーエラーが発生しました" }, { status: 500 });
    }

    if (!deleted || (Array.isArray(deleted) && deleted.length === 0)) {
      try {
        const existsData = await checkScheduleOwnership({ id });
        if (existsData && (existsData as any).user_slug && String((existsData as any).user_slug) !== session.slug) {
          return NextResponse.json({ success: false, error: "Forbidden" }, { status: 403 });
        }
      } catch (err) {
        console.error("[DELETE /api/schedules] ownership check failed", err);
      }

      return NextResponse.json({ success: false, error: "Not Found" }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[DELETE /api/schedules]", err);
    return NextResponse.json({ success: false, error: "サーバーエラーが発生しました" }, { status: 500 });
  }
}
