import { createHmac, timingSafeEqual } from "crypto";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { env } from "@/lib/env";
import { upstashRedis } from "@/lib/upstash-redis";
import { findLatestIncompleteOrderByEmail, markBusinessOrderCompletedById } from "@/lib/supabase/business-orders";
import { setUserSponsorPlanByEmail } from "@/lib/supabase/data/users.server";

const SQUARE_WEBHOOK_NOTIFICATION_URL = "https://vc-api.h-kuro.workers.dev/square/webhook/";
const PROCESSED_TTL_SECONDS = 60 * 60 * 24 * 7;

const squareWebhookSchema = z.object({
  type: z.string(),
  data: z.object({
    object: z.object({
      payment: z.object({
        id: z.string(),
        status: z.string(),
        buyer_email_address: z.string().email().optional(),
        total_money: z.object({
          amount: z.number(),
        }),
      }),
    }),
  }),
});

function verifySquareSignature(signature: string | null, body: string): boolean {
  if (!signature || !env.SQUARE_WEBHOOK_SIGNATURE_KEY) {
    return false;
  }

  const digest = createHmac("sha256", env.SQUARE_WEBHOOK_SIGNATURE_KEY)
    .update(`${SQUARE_WEBHOOK_NOTIFICATION_URL}${body}`)
    .digest("base64");

  try {
    return timingSafeEqual(Buffer.from(signature), Buffer.from(digest));
  } catch {
    return false;
  }
}

function resolvePlanByAmount(amount: number) {
  const normalizedAmount = amount >= 100_000 ? Math.round(amount / 100) : amount;
  // TODO: Square Japan が円で返すか銭で返すかは、テスト決済で実額を確認する。
  const mapping: Record<number, { plan_id: "roots" | "roots_plus" | "signal" | "presence" | "legacy"; plan_name: string }> = {
    30000: { plan_id: "roots", plan_name: "Roots" },
    50000: { plan_id: "roots_plus", plan_name: "Roots+" },
    100000: { plan_id: "signal", plan_name: "Signal" },
    500000: { plan_id: "presence", plan_name: "Presence" },
    1000000: { plan_id: "legacy", plan_name: "Legacy" },
  };

  return mapping[normalizedAmount] ?? null;
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

  if (parsedBody.type !== "payment.updated") {
    return NextResponse.json({ success: true, ignored: true });
  }

  const payment = parsedBody.data.object.payment;
  if (payment.status !== "COMPLETED") {
    return NextResponse.json({ success: true, skipped: true });
  }

  const paymentKey = `square_webhook:payment:${payment.id}`;
  const alreadyProcessed = await upstashRedis.get(paymentKey);
  if (alreadyProcessed) {
    return NextResponse.json({ success: true, duplicate: true });
  }

  const email = payment.buyer_email_address;
  if (!email) {
    console.warn("[square webhook] buyer email not found");
    return NextResponse.json({ success: true, skipped: true });
  }

  const plan = resolvePlanByAmount(payment.total_money.amount);
  if (!plan) {
    console.warn("[square webhook] unknown amount received");
    return NextResponse.json({ success: true, skipped: true });
  }

  const order = await findLatestIncompleteOrderByEmail(email);
  if (!order) {
    console.warn("[square webhook] business order not found for email");
    return NextResponse.json({ success: true, skipped: true });
  }

  const orderUpdated = await markBusinessOrderCompletedById({
    id: order.id,
    planId: plan.plan_id,
    planName: plan.plan_name,
  });
  if (!orderUpdated) {
    return NextResponse.json({ success: false, error: "order_update_failed" }, { status: 500 });
  }

  const userUpdated = await setUserSponsorPlanByEmail(email, plan.plan_id);
  if (!userUpdated) {
    return NextResponse.json({ success: false, error: "user_update_failed" }, { status: 500 });
  }

  await upstashRedis.set(paymentKey, "1", { ex: PROCESSED_TTL_SECONDS });

  return NextResponse.json({ success: true });
}
