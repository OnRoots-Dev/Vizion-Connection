import { createHmac, timingSafeEqual } from "crypto";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { env } from "@/lib/env";
import { upstashRedis } from "@/lib/upstash-redis";
import {
  findBusinessOrderById,
  findLatestIncompleteOrderByEmail,
  markBusinessOrderCompletedById,
} from "@/lib/supabase/business-orders";
import { setUserSponsorPlanByEmail } from "@/lib/supabase/data/users.server";
import { incrementAdSlotSold } from "@/lib/supabase/ad-slots";
import {
  activateAccountBySlug,
  monetizePlanFromLegacyPlanId,
} from "@/lib/supabase/business-monetize";
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

/**
 * payment.note: vc:planId:prefecture:slug[:orderId]
 * - 現行形式: 末尾に注文ID（ビジネス_orders.id）を持つ
 * - 旧形式(vc:planId:prefecture:slug): 注文IDなし（過去に発行したPayment Link）
 */
function parsePaymentNote(note: string | undefined): {
  planId: PlanId | null;
  prefecture: string | null;
  slug: string | null;
  orderId: string | null;
} {
  if (!note || !note.startsWith("vc:")) {
    return { planId: null, prefecture: null, slug: null, orderId: null };
  }
  const parts = note.split(":");
  if (parts.length < 4) return { planId: null, prefecture: null, slug: null, orderId: null };
  const planId = parts[1] as PlanId;
  if (!["roots", "signal", "presence", "legacy"].includes(planId)) {
    return { planId: null, prefecture: null, slug: null, orderId: null };
  }
  // 現在形は orderId が末尾。旧形式は slug が末尾。slug 内の ':' は全体に含める。
  if (parts.length >= 5) {
    return {
      planId,
      prefecture: parts[2] || null,
      slug: parts.slice(3, parts.length - 1).join(":") || null,
      orderId: parts[parts.length - 1] || null,
    };
  }
  return {
    planId,
    prefecture: parts[2] || null,
    slug: parts.slice(3).join(":") || null,
    orderId: null,
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

  /**
   * note / 金額 / 通貨はサーバーで発行したpending注文と完全一致が必要。
   * 署名付きSquare payloadでも、別商品の支払いを別の注文に充当させない。
   */
  const matchesOrder = (o: {
    slug: string;
    planId: string;
    region: string | null;
    amount: number;
  }): boolean =>
    Boolean(
      noteMeta.planId &&
        noteMeta.planId === o.planId &&
        noteMeta.slug === o.slug &&
        noteMeta.prefecture !== null &&
        noteMeta.prefecture === o.region &&
        payment.total_money.currency === "JPY" &&
        payment.total_money.amount === o.amount,
    );

  // 注文解決: 現在形の note は注文IDで一意に特定（誤った注文・過去の注文に充当しない）。
  // Redis 失効後の再送・旧形式の場合は email の最新 pending 注文へフォールバック。
  let order:
    | (Awaited<ReturnType<typeof findLatestIncompleteOrderByEmail>> & { status: string })
    | null = null;
  if (noteMeta.orderId) {
    const byId = await findBusinessOrderById(noteMeta.orderId);
    if (byId && byId.email === email && matchesOrder(byId)) {
      order = byId;
    }
  }
  if (!order) {
    const byEmail = await findLatestIncompleteOrderByEmail(email);
    if (byEmail && matchesOrder(byEmail)) {
      order = byEmail;
    }
  }
  if (!order) {
    console.warn("[square webhook] no matching pending order", payment.id);
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

  /**
   * 冪等な注文完了。同じイベントが何度届いても安全に成功扱いできる：
   * - completed（今回遷移）: 副作用（sponsor_plan / activation / ad_slot）を実行
   * - already（既に完了済み）: 重複・再送。二重加算せず no-op / 200
   * - missing: 注文が消えている → 安全な no-op / 200
   * - error: DB障害 → 500（Squareに再送させる）
   */
  const orderResult = await markBusinessOrderCompletedById({
    id: order.id,
    planId,
    planName,
  });
  if (orderResult === "error") {
    return NextResponse.json({ success: false, error: "order_update_failed" }, { status: 500 });
  }
  if (orderResult === "already" || orderResult === "missing") {
    return NextResponse.json({ success: true, orderId: order.id, duplicate: orderResult === "already" });
  }

  const userUpdated = await setUserSponsorPlanByEmail(email, planId);
  if (!userUpdated) {
    return NextResponse.json({ success: false, error: "user_update_failed" }, { status: 500 });
  }

  // 新モネタイズP0: Business Accountを購入プランでactivateする。
  // option注文は大体として既存IDで紐付け（order.slug must be the buying user's slug）。
  const monetizePlan = monetizePlanFromLegacyPlanId(planId);
  if (monetizePlan) {
    const localPrefecture =
      monetizePlan === "LOCAL" && order.region && order.region !== "全国"
        ? order.region
        : undefined;
    const activated = await activateAccountBySlug(order.slug, monetizePlan, localPrefecture);
    if (!activated) {
      // 注文・sponsor_plan は完了済み。activation失敗はpayment idで再送が止まるため
      // ログのみ（ad_slot更新と同じく非致命的。整合が取れない場合は管理者確認必要）。
      console.warn("[square webhook] business_accounts activation failed", order.slug);
    }
  }

  // ad_slots.sold +1（"completed"遷移時のみ。重複・再送では実行しない＝二重加算防止）
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
