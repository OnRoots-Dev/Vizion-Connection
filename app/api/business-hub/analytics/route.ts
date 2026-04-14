import { NextResponse } from "next/server";
import { requireBusinessProfile } from "@/lib/auth/require-business-session";
import { getBusinessHubAnalytics } from "@/lib/supabase/business-hub";

export async function GET() {
  try {
    const profile = await requireBusinessProfile();
    const analytics = await getBusinessHubAnalytics(profile);
    return NextResponse.json({ success: true, analytics });
  } catch (error) {
    const message = error instanceof Error ? error.message : "UNKNOWN";
    if (message === "UNAUTHORIZED") return NextResponse.json({ success: false, error: "ログインが必要です" }, { status: 401 });
    if (message === "FORBIDDEN") return NextResponse.json({ success: false, error: "Businessアカウントのみ利用できます" }, { status: 403 });
    return NextResponse.json({ success: false, error: "分析データの取得に失敗しました" }, { status: 500 });
  }
}
