// app/api/business-monetize/campaigns/[id]/publish/route.ts
// Campaign公開（draft/paused → active）。
// Server側で ownership / status / plan / type / scope / required fields を検証する。

import { NextRequest, NextResponse } from "next/server";
import { requireBusinessProfile } from "@/lib/auth/require-business-session";
import { ensureBusinessAccount, publishCampaign } from "@/lib/supabase/business-monetize";
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
    const campaign = await publishCampaign(account, id);
    return NextResponse.json({ success: true, campaign });
  } catch (error) {
    const message = error instanceof Error ? error.message : "UNKNOWN";
    if (message === "UNAUTHORIZED") return NextResponse.json({ success: false, error: "ログインが必要です" }, { status: 401 });
    if (message === "FORBIDDEN") return NextResponse.json({ success: false, error: "Businessアカウントのみ利用できます" }, { status: 403 });
    if (message === "PLAN_REQUIRED") return NextResponse.json({ success: false, error: "FREEプランでは広告Campaignを公開できません" }, { status: 403 });
    if (message === "BUSINESS_INACTIVE") return NextResponse.json({ success: false, error: "アカウントが利用不可の状態です" }, { status: 403 });
    if (message === "CAMPAIGN_NOT_FOUND") return NextResponse.json({ success: false, error: "Campaignが見つかりません" }, { status: 404 });
    if (message === "CAMPAIGN_ENDED") return NextResponse.json({ success: false, error: "終了済みのCampaignは公開できません" }, { status: 409 });
    if (message === "SCOPE_NOT_ALLOWED") return NextResponse.json({ success: false, error: "契約プランではこの広告配信範囲を利用できません" }, { status: 403 });
    if (message === "CAMPAIGN_TYPE_NOT_ALLOWED") return NextResponse.json({ success: false, error: "契約プランではこのCampaign種別を利用できません" }, { status: 403 });
    if (message.includes("REQUIRED")) return NextResponse.json({ success: false, error: "配信対象の設定が不足しています" }, { status: 400 });
    return NextResponse.json({ success: false, error: message === "CAMPAIGN_PUBLISH_FAILED" ? "Campaignの公開に失敗しました" : "公開に失敗しました" }, { status: 500 });
  }
}
