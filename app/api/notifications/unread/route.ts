import { NextResponse } from "next/server";
import { getSessionCookie } from "@/lib/auth/cookies";
import { verifySession } from "@/lib/auth/session";
import { getUnreadNotificationCount } from "@/lib/supabase/notifications";

export async function GET(): Promise<NextResponse> {
  try {
    const token = await getSessionCookie();
    if (!token) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const session = verifySession(token);
    if (!session) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const unreadCount = await getUnreadNotificationCount(session.slug);
    return NextResponse.json({ success: true, unreadCount });
  } catch (err) {
    console.error("[GET /api/notifications/unread]", err);
    return NextResponse.json({ success: false, error: "サーバーエラーが発生しました" }, { status: 500 });
  }
}
