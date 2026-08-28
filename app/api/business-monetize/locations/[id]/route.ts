// app/api/business-monetize/locations/[id]/route.ts
// Business Location 編集・削除。

import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { requireBusinessProfile } from "@/lib/auth/require-business-session";
import { ensureBusinessAccount, updateLocation, deleteLocation, listLocations } from "@/lib/supabase/business-monetize";
import { validateCSRF } from "@/lib/security/csrf";
import { readLimitedJson, PayloadTooLargeError } from "@/lib/security/body";
import { monetizeLimiter, getIp } from "@/lib/ratelimit";

const patchSchema = z.object({
  name: z.string().min(1).max(120).optional(),
  prefecture: z.string().min(1).max(40).optional(),
  address: z.string().max(300).nullable().optional(),
  latitude: z.number().min(-90).max(90).optional(),
  longitude: z.number().min(-180).max(180).optional(),
  hours: z.string().max(200).nullable().optional(),
  phone: z.string().max(40).nullable().optional(),
  website: z.string().max(300).nullable().optional(),
}).strict();

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
    const location = await updateLocation(account.id, id, parsed.data);
    if (!location) return NextResponse.json({ success: false, error: "店舗が見つかりません" }, { status: 404 });
    return NextResponse.json({ success: true, location });
  } catch (error) {
    const message = error instanceof Error ? error.message : "UNKNOWN";
    if (message === "UNAUTHORIZED") return NextResponse.json({ success: false, error: "ログインが必要です" }, { status: 401 });
    if (message === "FORBIDDEN") return NextResponse.json({ success: false, error: "Businessアカウントのみ利用できます" }, { status: 403 });
    return NextResponse.json({ success: false, error: "店舗の更新に失敗しました" }, { status: 500 });
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
    // 削除前に該当店舗が自分のものかを確認（所有権チェック）
    const locations = await listLocations(account.id);
    if (!locations.some((l) => l.id === id)) {
      return NextResponse.json({ success: false, error: "店舗が見つかりません" }, { status: 404 });
    }
    await deleteLocation(account.id, id);
    return NextResponse.json({ success: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : "UNKNOWN";
    if (message === "UNAUTHORIZED") return NextResponse.json({ success: false, error: "ログインが必要です" }, { status: 401 });
    if (message === "FORBIDDEN") return NextResponse.json({ success: false, error: "Businessアカウントのみ利用できます" }, { status: 403 });
    return NextResponse.json({ success: false, error: "店舗の削除に失敗しました" }, { status: 500 });
  }
}
