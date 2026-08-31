import { NextRequest, NextResponse } from "next/server";
import { getSupabaseProfile } from "@/lib/auth/session";
import { validateCSRF } from "@/lib/security/csrf";
import { PayloadTooLargeError, readLimitedJson } from "@/lib/security/body";
import { businessCompleteLimiter, getIp } from "@/lib/ratelimit";
import { findBusinessOrderById } from "@/lib/supabase/business-orders";

export async function POST(req: NextRequest): Promise<NextResponse> {
  try {
    const csrfError = validateCSRF(req);
    if (csrfError) return csrfError as unknown as NextResponse;

    const { success: limited } = await businessCompleteLimiter.limit(getIp(req));
    if (!limited) {
      return NextResponse.json({ success: false, error: "リクエストが多すぎます" }, { status: 429 });
    }

    const session = await getSupabaseProfile();
    if (!session) {
      return NextResponse.json({ success: false, error: "セッションが無効です" }, { status: 401 });
    }

    let body: { orderId?: string };
    try {
      body = (await readLimitedJson(req)) as { orderId?: string };
    } catch (e) {
      if (e instanceof PayloadTooLargeError) {
        return NextResponse.json({ success: false, error: "Payload too large" }, { status: 413 });
      }
      return NextResponse.json({ success: false, error: "Bad request" }, { status: 400 });
    }

    const orderId = typeof body?.orderId === "string" && body.orderId ? body.orderId.trim() : "";
    if (!orderId) {
      return NextResponse.json(
        { success: false, pending: false, error: "決済を開始した注文が見つかりません。プラン一覧から再度お試しください。" },
        { status: 400 },
      );
    }

    // 決済完了の根拠は署名検証済みSquare Webhookだけ。
    // ブラウザのreturn URLは状態を有効化せず、Webhook反映済みの注文だけを返す。
    // 「最新のcompleted注文」で過去・他ユーザーの注文を誤成功表示することは禁止。
    const order = await findBusinessOrderById(orderId);
    if (!order) {
      return NextResponse.json(
        { success: false, pending: false, error: "注文が見つかりません。プラン一覧から再度お試しください。" },
        { status: 404 },
      );
    }
    if (order.slug !== session.slug) {
      return NextResponse.json(
        { success: false, pending: false, error: "注文が見つかりません。" },
        { status: 404 },
      );
    }

    if (order.status === "completed") {
      return NextResponse.json({ success: true, planId: order.planId, planName: order.planName });
    }
    if (order.status === "failed") {
      return NextResponse.json(
        { success: false, pending: false, error: "お支払いが完了しませんでした。プラン一覧から再度お試しください。" },
        { status: 400 },
      );
    }

    // pending: Webhook反映待ち。エラー扱いせず待機させる。
    return NextResponse.json(
      { success: false, pending: true, error: "決済確認中です。しばらくしてから再度ご確認ください。" },
      { status: 202 },
    );
  } catch (err) {
    console.error("[POST /api/business-checkout/complete]", err instanceof Error ? err.message : "error");
    return NextResponse.json(
      { success: false, error: "サーバーエラーが発生しました" },
      { status: 500 },
    );
  }
}
