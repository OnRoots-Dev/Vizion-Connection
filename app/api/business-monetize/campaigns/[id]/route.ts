// app/api/business-monetize/campaigns/[id]/route.ts
// Campaign 詳細・編集・削除。

import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { requireBusinessProfile } from "@/lib/auth/require-business-session";
import { ensureBusinessAccount, getCampaign, updateCampaign, deleteCampaign } from "@/lib/supabase/business-monetize";
import { validateCSRF } from "@/lib/security/csrf";
import { readLimitedJson, PayloadTooLargeError } from "@/lib/security/body";
import { monetizeLimiter, getIp } from "@/lib/ratelimit";
import { isRegionBlockId, isHalfRegion } from "@/features/business-monetize/constants";

const creativeSchema = z.object({
  title: z.string().min(1).max(80).optional(),
  description: z.string().max(280).optional().nullable(),
  imageUrl: z.string().url().optional().nullable().or(z.literal("")),
  videoUrl: z.string().url().optional().nullable().or(z.literal("")),
  ctaText: z.string().max(40).optional().nullable(),
  ctaUrl: z.string().url().optional().nullable().or(z.literal("")),
});

const patchSchema = z.object({
  name: z.string().min(1).max(80).optional(),
  type: z.enum(["activity", "moment"]).optional(),
  scope: z.enum(["local", "region", "half", "national"]).optional(),
  regionBlock: z.string().optional().nullable(),
  half: z.string().optional().nullable(),
  prefecture: z.string().max(40).optional().nullable(),
  locationTarget: z.enum(["all", "specific"]).optional(),
  locationId: z.string().nullable().optional(),
  creative: creativeSchema.optional(),
}).strict();

export async function GET(_req: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const profile = await requireBusinessProfile();
    const { id } = await context.params;
    const account = await ensureBusinessAccount(profile);
    const campaign = await getCampaign(account.id, id);
    if (!campaign) return NextResponse.json({ success: false, error: "Campaignが見つかりません" }, { status: 404 });
    return NextResponse.json({ success: true, campaign });
  } catch (error) {
    const message = error instanceof Error ? error.message : "UNKNOWN";
    if (message === "UNAUTHORIZED") return NextResponse.json({ success: false, error: "ログインが必要です" }, { status: 401 });
    if (message === "FORBIDDEN") return NextResponse.json({ success: false, error: "Businessアカウントのみ利用できます" }, { status: 403 });
    return NextResponse.json({ success: false, error: "Campaignの取得に失敗しました" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  const csrfError = validateCSRF(req);
  if (csrfError) return csrfError as unknown as NextResponse;
  const { success: limited } = await monetizeLimiter.limit(getIp(req));
  if (!limited) return NextResponse.json({ success: false, error: "しばらく時間をおいてから再度お試しください" }, { status: 429 });

  try {
    const profile = await requireBusinessProfile();
    const { id } = await context.params;
    let body: unknown;
    try {
      body = await readLimitedJson(req);
    } catch (error) {
      if (error instanceof PayloadTooLargeError) {
        return NextResponse.json({ success: false, error: "Payload too large" }, { status: 413 });
      }
      return NextResponse.json({ success: false, error: "Bad request" }, { status: 400 });
    }
    const parsed = patchSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ success: false, error: parsed.error.issues[0]?.message ?? "入力内容を確認してください" }, { status: 400 });
    }

    const account = await ensureBusinessAccount(profile);
    let regionBlock: "hokkaido" | "tohoku" | "kanto" | "chubu" | "kinki" | "chugoku" | "shikoku" | "kyushu_okinawa" | null | undefined;
    if (parsed.data.regionBlock !== undefined) {
      regionBlock = parsed.data.regionBlock != null && isRegionBlockId(parsed.data.regionBlock) ? (parsed.data.regionBlock as never) : null;
    }
    let half: "east" | "west" | null | undefined;
    if (parsed.data.half !== undefined) {
      half = parsed.data.half != null && isHalfRegion(parsed.data.half) ? (parsed.data.half as never) : null;
    }
    const campaign = await updateCampaign(account, id, {
      name: parsed.data.name,
      type: parsed.data.type,
      scope: parsed.data.scope,
      regionBlock,
      half,
      prefecture: parsed.data.prefecture,
      locationTarget: parsed.data.locationTarget,
      locationId: parsed.data.locationId,
      creative: parsed.data.creative
        ? {
            title: parsed.data.creative.title ?? "",
            description: parsed.data.creative.description ?? null,
            imageUrl: parsed.data.creative.imageUrl || null,
            videoUrl: parsed.data.creative.videoUrl || null,
            ctaText: parsed.data.creative.ctaText ?? null,
            ctaUrl: parsed.data.creative.ctaUrl || null,
          }
        : undefined,
    });
    if (!campaign) return NextResponse.json({ success: false, error: "Campaignが見つかりません" }, { status: 404 });
    return NextResponse.json({ success: true, campaign });
  } catch (error) {
    const message = error instanceof Error ? error.message : "UNKNOWN";
    if (message === "UNAUTHORIZED") return NextResponse.json({ success: false, error: "ログインが必要です" }, { status: 401 });
    if (message === "FORBIDDEN") return NextResponse.json({ success: false, error: "Businessアカウントのみ利用できます" }, { status: 403 });
    if (message === "CAMPAIGN_NOT_FOUND") return NextResponse.json({ success: false, error: "Campaignが見つかりません" }, { status: 404 });
    if (message === "CAMPAIGN_ACTIVE") return NextResponse.json({ success: false, error: "配信中は編集できません。一時停止後に編集してください" }, { status: 409 });
    if (message === "SCOPE_NOT_ALLOWED") return NextResponse.json({ success: false, error: "契約プランではこの広告配信範囲を利用できません" }, { status: 403 });
    if (message === "CAMPAIGN_TYPE_NOT_ALLOWED") return NextResponse.json({ success: false, error: "契約プランではこのCampaign種別を利用できません" }, { status: 403 });
    if (message === "REGION_REQUIRED" || message === "HALF_REQUIRED" || message === "PREFECTURE_REQUIRED" || message === "LOCATION_REQUIRED") {
      return NextResponse.json({ success: false, error: "配信対象を選択してください" }, { status: 400 });
    }
    return NextResponse.json({ success: false, error: "Campaignの更新に失敗しました" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  const csrfError = validateCSRF(req);
  if (csrfError) return csrfError as unknown as NextResponse;
  const { success: limited } = await monetizeLimiter.limit(getIp(req));
  if (!limited) return NextResponse.json({ success: false, error: "しばらく時間をおいてから再度お試しください" }, { status: 429 });

  try {
    const profile = await requireBusinessProfile();
    const { id } = await context.params;
    const account = await ensureBusinessAccount(profile);
    await deleteCampaign(account.id, id);
    return NextResponse.json({ success: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : "UNKNOWN";
    if (message === "UNAUTHORIZED") return NextResponse.json({ success: false, error: "ログインが必要です" }, { status: 401 });
    if (message === "FORBIDDEN") return NextResponse.json({ success: false, error: "Businessアカウントのみ利用できます" }, { status: 403 });
    if (message === "CAMPAIGN_NOT_FOUND") return NextResponse.json({ success: false, error: "Campaignが見つかりません" }, { status: 404 });
    if (message === "CAMPAIGN_ACTIVE") return NextResponse.json({ success: false, error: "配信中は削除できません。一時停止後に削除してください" }, { status: 409 });
    return NextResponse.json({ success: false, error: "Campaignの削除に失敗しました" }, { status: 500 });
  }
}
