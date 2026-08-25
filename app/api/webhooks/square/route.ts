import { createHmac, timingSafeEqual } from "crypto";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { env } from "@/lib/env";
import { upstashRedis } from "@/lib/upstash-redis";
import {
  findLatestIncompleteOrderByEmail,
  markBusinessOrderCompletedById,
} from "@/lib/supabase/business-orders";
import { setUserSponsorPlanByEmail } from "@/lib/supabase/data/users.server";
import { incrementAdSlotSold } from "@/lib/supabase/ad-slots";
import type { PlanId } from "@/features/business/types";

const PROCESSED_TTL_SECONDS = 60 * 60 * 24 * 7;

const squareWebhookSchema = z.object({
  type: z.string(),
  data: z.object({
    object: z.object({
      payment: z.object({
        id: z.string(),
        status: z.string(),
        buyer_email_address: z.string().email().optional(),
        note: z.string().optional(),
        total_money: z.object({
          amount: z.number(),
          currency: z.string().optional(),
        }),
      }),
    }),
  }),
});

function verifySquareSignature(signature: string | null, body: string): boolean {
  if (!signature || !env.SQUARE_WEBHOOK_SIGNATURE_KEY) {
    return false;
  }

  const notificationUrl = env.SQUARE_WEBHOOK_NOTIFICATION_URL;
  const digest = createHmac("sha256", env.SQUARE_WEBHOOK_SIGNATURE_KEY)
    .update(`${notificationUrl}${body}`)
    .digest("base64");

  try {
    return timingSafeEqual(Buffer.from(signature), Buffer.from(digest));
  } catch {
    return false;
  }
}

/** payment.note: vc:planId:prefecture:slug */
function parsePaymentNote(note: string | undefined): {
  planId: PlanId | null;
  prefecture: string | null;
  slug: string | null;
} {
  if (!note || !note.startsWith("vc:")) {
    return { planId: null, prefecture: null, slug: null };
  }
  const parts = note.split(":");
  if (parts.length < 4) return { planId: null, prefecture: null, slug: null };
  const planId = parts[1] as PlanId;
  if (!["roots", "signal", "presence", "legacy"].includes(planId)) {
    return { planId: null, prefecture: null, slug: null };
  }
  return {
    planId,
    prefecture: parts[2] || null,
    slug: parts.slice(3).join(":") || null,
  };
}

function isPlanId(value: string): value is PlanId {
  return ["roots", "signal", "presence", "legacy"].includes(value);
}

export async function POST(req: NextRequest): Promise<NextResponse> {
  const signature = req.headers.get("x-square-hmacsha256-signature");
  const body = await req.text();

  if (!verifySquareSignature(signature, body)) {
    return NextResponse.json({ success: false, error: "invalid_signature" }, { status: 401 });
  }

  let parsedBody: z.infer<typeof squareWebhookSchema>;
  try {
    parsedBody = squareWebhookSchema.parse(JSON.parse(body));
  } catch {
    return NextResponse.json({ success: false, error: "invalid_payload" }, { status: 400 });
  }

  // event type のみログ（PII・生ペイロード禁止）
  console.info("[square webhook]", parsedBody.type);

  if (parsedBody.type !== "payment.updated") {
    return NextResponse.json({ success: true, ignored: true });
  }

  const payment = parsedBody.data.object.payment;
  if (payment.status !== "COMPLETED") {
    return NextResponse.json({ success: true, skipped: true });
  }

  const paymentKey = `square_webhook:payment:${payment.id}`;
  // Redis 冪等キーは best-effort。障害時は DB 側の注文状態遷移
  // (incomplete -> completed) が冪等性を担保する。
  let alreadyProcessed: unknown = null;
  try {
    alreadyProcessed = await upstashRedis.get(paymentKey);
  } catch (err) {
    console.error("[square webhook] redis unavailable — skip dedupe check", err instanceof Error ? err.message : err);
  }
  if (alreadyProcessed) {
    return NextResponse.json({ success: true, duplicate: true });
  }

  const noteMeta = parsePaymentNote(payment.note);
  const email = payment.buyer_email_address;

  // 注文照合: email の pending 注文を優先。無ければ note の plan/prefecture で枠だけ更新しない（注文必須）
  if (!email) {
    console.warn("[square webhook] buyer email missing", payment.id);
    return NextResponse.json({ success: true, skipped: true });
  }

  const order = await findLatestIncompleteOrderByEmail(email);
  if (!order) {
    console.warn("[square webhook] order not found", payment.id);
    return NextResponse.json({ success: true, skipped: true });
  }

  const planId: PlanId = isPlanId(order.planId)
    ? order.planId
    : noteMeta.planId && isPlanId(noteMeta.planId)
      ? noteMeta.planId
      : "roots";
  const planName = order.planName || planId;
  const slotPrefecture =
    order.region ||
    noteMeta.prefecture ||
    (planId === "roots" ? null : "全国");

  const orderUpdated = await markBusinessOrderCompletedById({
    id: order.id,
    planId,
    planName,
  });
  if (!orderUpdated) {
    return NextResponse.json({ success: false, error: "order_update_failed" }, { status: 500 });
  }

  const userUpdated = await setUserSponsorPlanByEmail(email, planId);
  if (!userUpdated) {
    return NextResponse.json({ success: false, error: "user_update_failed" }, { status: 500 });
  }

  // ad_slots.sold +1
  if (slotPrefecture) {
    const slotResult = await incrementAdSlotSold(slotPrefecture, planId);
    if (!slotResult.success) {
      // 注文は完了済み。枠更新失敗はログのみ（再試行は payment id でブロックされるため warn）
      console.warn("[square webhook] ad_slot increment failed", slotResult.error, payment.id);
    }
  } else {
    console.warn("[square webhook] slot prefecture missing", payment.id);
  }

  try {
    await upstashRedis.set(paymentKey, "1", { ex: PROCESSED_TTL_SECONDS });
  } catch (err) {
    console.error("[square webhook] redis set failed (non-fatal)", err instanceof Error ? err.message : err);
  }

  return NextResponse.json({ success: true, orderId: order.id });
}
