// app/api/business-monetize/campaigns/route.ts
// Campaign 一覧・作成。

import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { requireBusinessProfile } from "@/lib/auth/require-business-session";
import { ensureBusinessAccount, listCampaigns, createCampaign } from "@/lib/supabase/business-monetize";
import { validateCSRF } from "@/lib/security/csrf";
import { readLimitedJson, PayloadTooLargeError } from "@/lib/security/body";
import { monetizeLimiter, getIp } from "@/lib/ratelimit";
import { isRegionBlockId, isHalfRegion } from "@/features/business-monetize/constants";

const creativeSchema = z.object({
  title: z.string().min(1).max(80),
  description: z.string().max(280).optional().nullable(),
  imageUrl: z.string().url().optional().nullable().or(z.literal("")),
  videoUrl: z.string().url().optional().nullable().or(z.literal("")),
  ctaText: z.string().max(40).optional().nullable(),
  ctaUrl: z.string().url().optional().nullable().or(z.literal("")),
});

const campaignSchema = z.object({
  name: z.string().min(1).max(80),
  type: z.enum(["activity", "moment"]),
  scope: z.enum(["local", "region", "half", "national"]),
  regionBlock: z.string().optional().nullable(),
  half: z.string().optional().nullable(),
  prefecture: z.string().max(40).optional().nullable(),
  locationTarget: z.enum(["all", "specific"]).default("all"),
  locationId: z.string().optional().nullable(),
  creative: creativeSchema,
}).strict();

export async function GET() {
  try {
    const profile = await requireBusinessProfile();
    const account = await ensureBusinessAccount(profile);
    const campaigns = await listCampaigns(account.id);
    return NextResponse.json({ success: true, campaigns });
  } catch (error) {
    const message = error instanceof Error ? error.message : "UNKNOWN";
    if (message === "UNAUTHORIZED") return NextResponse.json({ success: false, error: "ログインが必要です" }, { status: 401 });
    if (message === "FORBIDDEN") return NextResponse.json({ success: false, error: "Businessアカウントのみ利用できます" }, { status: 403 });
    return NextResponse.json({ success: false, error: "Campaign一覧の取得に失敗しました" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const csrfError = validateCSRF(req);
  if (csrfError) return csrfError as unknown as NextResponse;
  const { success: limited } = await monetizeLimiter.limit(getIp(req));
  if (!limited) return NextResponse.json({ success: false, error: "しばらく時間をおいてから再度お試しください" }, { status: 429 });

  try {
    const profile = await requireBusinessProfile();
    let body: unknown;
    try {
      body = await readLimitedJson(req);
    } catch (error) {
      if (error instanceof PayloadTooLargeError) {
        return NextResponse.json({ success: false, error: "Payload too large" }, { status: 413 });
      }
      return NextResponse.json({ success: false, error: "Bad request" }, { status: 400 });
    }
    const parsed = campaignSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ success: false, error: parsed.error.issues[0]?.message ?? "入力内容を確認してください" }, { status: 400 });
    }

    const account = await ensureBusinessAccount(profile);
    const regionBlock = parsed.data.regionBlock != null && isRegionBlockId(parsed.data.regionBlock)
      ? (parsed.data.regionBlock as never)
      : null;
    const half = parsed.data.half != null && isHalfRegion(parsed.data.half)
      ? (parsed.data.half as never)
      : null;
    const campaign = await createCampaign(account, {
      name: parsed.data.name,
      type: parsed.data.type,
      scope: parsed.data.scope,
      regionBlock,
      half,
      prefecture: parsed.data.prefecture ?? null,
      locationTarget: parsed.data.locationTarget,
      locationId: parsed.data.locationId ?? null,
      creative: {
        title: parsed.data.creative.title,
        description: parsed.data.creative.description ?? null,
        imageUrl: parsed.data.creative.imageUrl || null,
        videoUrl: parsed.data.creative.videoUrl || null,
        ctaText: parsed.data.creative.ctaText ?? null,
        ctaUrl: parsed.data.creative.ctaUrl || null,
      },
    });
    return NextResponse.json({ success: true, campaign });
  } catch (error) {
    const message = error instanceof Error ? error.message : "UNKNOWN";
    if (message === "UNAUTHORIZED") return NextResponse.json({ success: false, error: "ログインが必要です" }, { status: 401 });
    if (message === "FORBIDDEN") return NextResponse.json({ success: false, error: "Businessアカウントのみ利用できます" }, { status: 403 });
    if (message === "PLAN_REQUIRED") return NextResponse.json({ success: false, error: "FREEプランでは広告Campaignを作成できません。有料プランが必要です" }, { status: 403 });
    if (message === "BUSINESS_INACTIVE") return NextResponse.json({ success: false, error: "アカウントが利用不可の状態です" }, { status: 403 });
    if (message === "SCOPE_NOT_ALLOWED") return NextResponse.json({ success: false, error: "契約プランではこの広告配信範囲を利用できません" }, { status: 403 });
    if (message === "CAMPAIGN_TYPE_NOT_ALLOWED") return NextResponse.json({ success: false, error: "契約プランではこのCampaign種別を利用できません" }, { status: 403 });
    if (message === "CREATIVE_TITLE_REQUIRED") return NextResponse.json({ success: false, error: "クリエイティブのタイトルは必須です" }, { status: 400 });
    if (message === "REGION_REQUIRED") return NextResponse.json({ success: false, error: "地方ブロックを選択してください" }, { status: 400 });
    if (message === "HALF_REQUIRED") return NextResponse.json({ success: false, error: "東日本 / 西日本を選択してください" }, { status: 400 });
    if (message === "PREFECTURE_REQUIRED") return NextResponse.json({ success: false, error: "都道府県を選択してください" }, { status: 400 });
    if (message === "LOCATION_REQUIRED") return NextResponse.json({ success: false, error: "配信対象の店舗を選択してください" }, { status: 400 });
    return NextResponse.json({ success: false, error: "Campaignの作成に失敗しました" }, { status: 500 });
  }
}
