import { NextResponse } from "next/server";
import { requireMemberProfile } from "@/lib/auth/require-member-session";
import { getMemberHubSummary } from "@/lib/supabase/member-hub";

export async function GET() {
  try {
    const profile = await requireMemberProfile();
    const summary = await getMemberHubSummary(profile);
    return NextResponse.json({ success: true, summary });
  } catch (error) {
    const message = error instanceof Error ? error.message : "UNKNOWN";
    if (message === "UNAUTHORIZED") return NextResponse.json({ success: false, error: "ログインが必要です" }, { status: 401 });
    if (message === "FORBIDDEN") return NextResponse.json({ success: false, error: "Membersアカウントのみ利用できます" }, { status: 403 });
    return NextResponse.json({ success: false, error: "Member Hub の取得に失敗しました" }, { status: 500 });
  }
}
