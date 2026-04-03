import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getSessionCookie } from "@/lib/auth/cookies";
import { verifySession } from "@/lib/auth/session";
import { validateCSRF } from "@/lib/security/csrf";
import { readLimitedJson, PayloadTooLargeError } from "@/lib/security/body";
import {
  getUnreadNotificationCount,
  markAllNotificationsRead,
  markNotificationsRead,
} from "@/lib/supabase/notifications";

const bodySchema = z.object({
  markAll: z.boolean().optional(),
  notificationIds: z.array(z.number().int().positive()).max(100).optional(),
}).superRefine((val, ctx) => {
  if (!val.markAll && (!val.notificationIds || val.notificationIds.length === 0)) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "notificationIds is required when markAll is false",
      path: ["notificationIds"],
    });
  }
});

export async function POST(req: NextRequest): Promise<NextResponse> {
  const csrfError = validateCSRF(req);
  if (csrfError) return csrfError as unknown as NextResponse;

  try {
    const token = await getSessionCookie();
    if (!token) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const session = verifySession(token);
    if (!session) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    let body: unknown;
    try {
      body = await readLimitedJson(req);
    } catch (e) {
      if (e instanceof PayloadTooLargeError) {
        return NextResponse.json({ success: false, error: "Payload too large" }, { status: 413 });
      }
      return NextResponse.json({ success: false, error: "Bad request" }, { status: 400 });
    }

    const parsed = bodySchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ success: false, error: "Invalid payload" }, { status: 400 });
    }

    const { markAll = false, notificationIds = [] } = parsed.data;
    const markedCount = markAll
      ? await markAllNotificationsRead(session.slug)
      : await markNotificationsRead(session.slug, notificationIds);

    const unreadCount = await getUnreadNotificationCount(session.slug);
    return NextResponse.json({
      success: true,
      markedCount,
      unreadCount,
    });
  } catch (err) {
    console.error("[POST /api/notifications/read]", err);
    return NextResponse.json({ success: false, error: "サーバーエラーが発生しました" }, { status: 500 });
  }
}
