import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getSessionCookie } from "@/lib/auth/cookies";
import { verifySession } from "@/lib/auth/session";
import { supabaseServer } from "@/lib/supabase/server";
import { recordAdEvent } from "@/lib/supabase/business-hub";
import { readLimitedJson, PayloadTooLargeError } from "@/lib/security/body";

const schema = z.object({
  adId: z.string().min(1),
  eventType: z.enum(["impression", "click", "conversion", "sale"]),
  revenueAmount: z.number().min(0).optional(),
  source: z.string().max(80).optional(),
}).strict();

export async function POST(req: NextRequest) {
  try {
    let body: unknown;
    try {
      body = await readLimitedJson(req);
    } catch (error) {
      if (error instanceof PayloadTooLargeError) {
        return NextResponse.json({ success: false, error: "Payload too large" }, { status: 413 });
      }
      return NextResponse.json({ success: false, error: "Bad request" }, { status: 400 });
    }

    const parsed = schema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ success: false, error: parsed.error.issues[0]?.message ?? "入力内容を確認してください" }, { status: 400 });
    }

    const token = await getSessionCookie();
    const session = token ? verifySession(token) : null;
    const { data: ad } = await supabaseServer
      .from("ads")
      .select("id, business_id")
      .eq("id", parsed.data.adId)
      .maybeSingle();

    if (!ad) {
      return NextResponse.json({ success: false, error: "広告が見つかりません" }, { status: 404 });
    }

    await recordAdEvent({
      adId: String(ad.id),
      businessId: typeof ad.business_id === "number" ? ad.business_id : Number(ad.business_id ?? 0) || null,
      viewerSlug: session?.slug ?? null,
      eventType: parsed.data.eventType,
      revenueAmount: parsed.data.revenueAmount,
      metadata: { source: parsed.data.source ?? "unknown" },
    });

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ success: false, error: "広告イベントの記録に失敗しました" }, { status: 500 });
  }
}
