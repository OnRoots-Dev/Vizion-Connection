import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getSessionCookie } from "@/lib/auth/cookies";
import { verifySession } from "@/lib/auth/session";
import { getNotificationPage } from "@/lib/supabase/notifications";

const querySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(15),
});

export async function GET(req: NextRequest): Promise<NextResponse> {
  try {
    const token = await getSessionCookie();
    if (!token) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const session = verifySession(token);
    if (!session) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const parsed = querySchema.safeParse({
      page: req.nextUrl.searchParams.get("page") ?? "1",
      limit: req.nextUrl.searchParams.get("limit") ?? "15",
    });
    if (!parsed.success) {
      return NextResponse.json({ success: false, error: "Invalid query" }, { status: 400 });
    }

    const result = await getNotificationPage({
      slug: session.slug,
      page: parsed.data.page,
      limit: parsed.data.limit,
    });

    return NextResponse.json({ success: true, ...result });
  } catch (err) {
    console.error("[GET /api/notifications]", err);
    return NextResponse.json({ success: false, error: "サーバーエラーが発生しました" }, { status: 500 });
  }
}
