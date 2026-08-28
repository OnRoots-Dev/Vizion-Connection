// app/api/business-monetize/locations/route.ts
// Business Locations（多店舗）一覧・追加。

import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { requireBusinessProfile } from "@/lib/auth/require-business-session";
import { ensureBusinessAccount, listLocations, createLocation } from "@/lib/supabase/business-monetize";
import { validateCSRF } from "@/lib/security/csrf";
import { readLimitedJson, PayloadTooLargeError } from "@/lib/security/body";
import { monetizeLimiter, getIp } from "@/lib/ratelimit";

const locationSchema = z.object({
  name: z.string().min(1).max(120),
  prefecture: z.string().min(1).max(40),
  address: z.string().max(300).optional().nullable(),
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
  hours: z.string().max(200).optional().nullable(),
  phone: z.string().max(40).optional().nullable(),
  website: z.string().max(300).optional().nullable(),
}).strict();

export async function GET() {
  try {
    const profile = await requireBusinessProfile();
    const account = await ensureBusinessAccount(profile);
    const locations = await listLocations(account.id);
    return NextResponse.json({ success: true, locations });
  } catch (error) {
    const message = error instanceof Error ? error.message : "UNKNOWN";
    if (message === "UNAUTHORIZED") return NextResponse.json({ success: false, error: "ログインが必要です" }, { status: 401 });
    if (message === "FORBIDDEN") return NextResponse.json({ success: false, error: "Businessアカウントのみ利用できます" }, { status: 403 });
    return NextResponse.json({ success: false, error: "店舗一覧の取得に失敗しました" }, { status: 500 });
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
    const parsed = locationSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ success: false, error: parsed.error.issues[0]?.message ?? "入力内容を確認してください" }, { status: 400 });
    }

    const account = await ensureBusinessAccount(profile);
    const location = await createLocation(account.id, parsed.data);
    return NextResponse.json({ success: true, location });
  } catch (error) {
    const message = error instanceof Error ? error.message : "UNKNOWN";
    if (message === "UNAUTHORIZED") return NextResponse.json({ success: false, error: "ログインが必要です" }, { status: 401 });
    if (message === "FORBIDDEN") return NextResponse.json({ success: false, error: "Businessアカウントのみ利用できます" }, { status: 403 });
    return NextResponse.json({ success: false, error: "店舗の追加に失敗しました" }, { status: 500 });
  }
}
