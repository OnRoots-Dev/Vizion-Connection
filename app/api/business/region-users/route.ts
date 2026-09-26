// Public aggregate of active public users by prefecture.
import { NextResponse } from "next/server";
import { listUserCountsByPrefecture } from "@/lib/supabase/business-region-users";

export const dynamic = "force-dynamic";

export async function GET(): Promise<NextResponse> {
  try {
    const counts = await listUserCountsByPrefecture();
    return NextResponse.json(counts);
  } catch (err) {
    console.error("[GET /api/business/region-users]", err instanceof Error ? err.message : "unknown");
    return NextResponse.json({ error: "サーバーエラーが発生しました" }, { status: 500 });
  }
}
