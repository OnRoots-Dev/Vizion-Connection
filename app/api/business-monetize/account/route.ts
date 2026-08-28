// app/api/business-monetize/account/route.ts
// Business Monetization Account（plan / status / 契約情報）。

import { NextRequest, NextResponse } from "next/server";
import { requireBusinessProfile } from "@/lib/auth/require-business-session";
import { ensureBusinessAccount, updateAccountPlan } from "@/lib/supabase/business-monetize";
import { validateCSRF } from "@/lib/security/csrf";
import { readLimitedJson, PayloadTooLargeError } from "@/lib/security/body";
import { monetizeLimiter, getIp } from "@/lib/ratelimit";
import { z } from "zod";
import { requireAdminProfile } from "@/lib/auth/require-admin-session";
import { isMonetizePlan } from "@/features/business-monetize/constants";

const planUpdateSchema = z.object({
  plan: z.string().max(20),
  status: z.enum(["free", "active", "inactive"]).optional(),
  primaryPrefecture: z.string().max(40).nullable().optional(),
}).strict();

export async function GET() {
  try {
    const profile = await requireBusinessProfile();
    const account = await ensureBusinessAccount(profile);
    return NextResponse.json({ success: true, account });
  } catch (error) {
    const message = error instanceof Error ? error.message : "UNKNOWN";
    if (message === "UNAUTHORIZED") return NextResponse.json({ success: false, error: "ログインが必要です" }, { status: 401 });
    if (message === "FORBIDDEN") return NextResponse.json({ success: false, error: "Businessアカウントのみ利用できます" }, { status: 403 });
    return NextResponse.json({ success: false, error: "アカウント情報の取得に失敗しました" }, { status: 500 });
  }
}

/**
 * Admin専用：Business AccountのPlan / Statusを付与・変更する。
 * 一般ユーザーはEnterpriseを含め自由に購入できない（営業経由・管理者付与）。
 */
export async function PATCH(req: NextRequest) {
  const csrfError = validateCSRF(req);
  if (csrfError) return csrfError as unknown as NextResponse;
  const { success: limited } = await monetizeLimiter.limit(getIp(req));
  if (!limited) return NextResponse.json({ success: false, error: "しばらく時間をおいてから再度お試しください" }, { status: 429 });

  try {
    await requireAdminProfile();
    let body: unknown;
    try {
      body = await readLimitedJson(req);
    } catch (error) {
      if (error instanceof PayloadTooLargeError) {
        return NextResponse.json({ success: false, error: "Payload too large" }, { status: 413 });
      }
      return NextResponse.json({ success: false, error: "Bad request" }, { status: 400 });
    }
    const parsed = planUpdateSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ success: false, error: parsed.error.issues[0]?.message ?? "入力内容を確認してください" }, { status: 400 });
    }
    if (!isMonetizePlan(parsed.data.plan)) {
      return NextResponse.json({ success: false, error: "プランが不正です" }, { status: 400 });
    }

    const url = new URL(req.url);
    const accountId = url.searchParams.get("accountId");
    if (!accountId) {
      return NextResponse.json({ success: false, error: "accountIdが必要です" }, { status: 400 });
    }

    const account = await updateAccountPlan(accountId, {
      plan: parsed.data.plan,
      status: parsed.data.status,
      primaryPrefecture: parsed.data.primaryPrefecture,
    });
    return NextResponse.json({ success: true, account });
  } catch (error) {
    const message = error instanceof Error ? error.message : "UNKNOWN";
    if (message === "UNAUTHORIZED") return NextResponse.json({ success: false, error: "ログインが必要です" }, { status: 401 });
    if (message === "FORBIDDEN" || message === "FORBIDDEN_EMAIL") return NextResponse.json({ success: false, error: "管理権限が必要です" }, { status: 403 });
    return NextResponse.json({ success: false, error: "アカウント更新に失敗しました" }, { status: 500 });
  }
}
