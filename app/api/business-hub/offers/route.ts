import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { requireBusinessProfile } from "@/lib/auth/require-business-session";
import { createBusinessHubOffer, listBusinessHubOffers } from "@/lib/supabase/business-hub";
import { validateCSRF } from "@/lib/security/csrf";
import { readLimitedJson, PayloadTooLargeError } from "@/lib/security/body";

const offerSchema = z.object({
  targetSlug: z.string().min(1).max(80),
  title: z.string().min(1).max(80),
  message: z.string().min(1).max(500),
  rewardAmount: z.number().int().min(0).max(100000000),
}).strict();

export async function GET() {
  try {
    const profile = await requireBusinessProfile();
    const offers = await listBusinessHubOffers(profile);
    return NextResponse.json({ success: true, offers });
  } catch (error) {
    const message = error instanceof Error ? error.message : "UNKNOWN";
    if (message === "UNAUTHORIZED") return NextResponse.json({ success: false, error: "ログインが必要です" }, { status: 401 });
    if (message === "FORBIDDEN") return NextResponse.json({ success: false, error: "Businessアカウントのみ利用できます" }, { status: 403 });
    return NextResponse.json({ success: false, error: "オファー一覧の取得に失敗しました" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const csrfError = validateCSRF(req);
  if (csrfError) return csrfError as unknown as NextResponse;

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

    const parsed = offerSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ success: false, error: parsed.error.issues[0]?.message ?? "入力内容を確認してください" }, { status: 400 });
    }

    const offer = await createBusinessHubOffer(profile, parsed.data);
    return NextResponse.json({ success: true, offer });
  } catch (error) {
    const message = error instanceof Error ? error.message : "UNKNOWN";
    if (message === "UNAUTHORIZED") return NextResponse.json({ success: false, error: "ログインが必要です" }, { status: 401 });
    if (message === "FORBIDDEN") return NextResponse.json({ success: false, error: "Businessアカウントのみ利用できます" }, { status: 403 });
    return NextResponse.json({ success: false, error: message == "対象ユーザーが見つかりませんでした" ? message : "オファーの作成に失敗しました" }, { status: 500 });
  }
}
