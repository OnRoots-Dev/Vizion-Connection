import { NextResponse } from "next/server";
import { requireTrainerProfile } from "@/lib/auth/require-trainer-session";
import { getTrainerHubSummary } from "@/lib/supabase/trainer-hub";

export async function GET() {
  try {
    const profile = await requireTrainerProfile();
    const summary = await getTrainerHubSummary(profile);
    return NextResponse.json({ success: true, summary });
  } catch (error) {
    const message = error instanceof Error ? error.message : "UNKNOWN";
    if (message === "UNAUTHORIZED") return NextResponse.json({ success: false, error: "ログインが必要です" }, { status: 401 });
    if (message === "FORBIDDEN") return NextResponse.json({ success: false, error: "Trainerアカウントのみ利用できます" }, { status: 403 });
    return NextResponse.json({ success: false, error: "Trainer Hub の取得に失敗しました" }, { status: 500 });
  }
}
