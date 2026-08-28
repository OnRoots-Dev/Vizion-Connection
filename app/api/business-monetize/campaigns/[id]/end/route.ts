// app/api/business-monetize/campaigns/[id]/end/route.ts
// Campaign終了（active/paused → ended）。

import { NextRequest, NextResponse } from "next/server";
import { requireBusinessProfile } from "@/lib/auth/require-business-session";
import { ensureBusinessAccount, endCampaign } from "@/lib/supabase/business-monetize";
import { validateCSRF } from "@/lib/security/csrf";
import { monetizeLimiter, getIp } from "@/lib/ratelimit";

export async function POST(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  const csrfError = validateCSRF(req);
  if (csrfError) return csrfError as unknown as NextResponse;
  const { success: limited } = await monetizeLimiter.limit(getIp(req));
  if (!limited) return NextResponse.json({ success: false, error: "しばらく時間をおいてから再度お試しください" }, { status: 429 });

  try {
    const profile = await requireBusinessProfile();
    const { id } = await context.params;
    const account = await ensureBusinessAccount(profile);
    const campaign = await endCampaign(account, id);
    return NextResponse.json({ success: true, campaign });
  } catch (error) {
    const message = error instanceof Error ? error.message : "UNKNOWN";
    if (message === "UNAUTHORIZED") return NextResponse.json({ success: false, error: "ログインが必要です" }, { status: 401 });
    if (message === "FORBIDDEN") return NextResponse.json({ success: false, error: "Businessアカウントのみ利用できます" }, { status: 403 });
    if (message === "CAMPAIGN_NOT_FOUND") return NextResponse.json({ success: false, error: "Campaignが見つかりません" }, { status: 404 });
    return NextResponse.json({ success: false, error: "Campaignの終了に失敗しました" }, { status: 500 });
  }
}
