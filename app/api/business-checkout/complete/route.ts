import { NextRequest, NextResponse } from "next/server";
import { getSupabaseProfile } from "@/lib/auth/session";
import { completeLatestPendingOrderBySlug } from "@/lib/supabase/business-orders";
import { setUserPlan } from "@/lib/supabase/data/users.server";
import { incrementAdSlotSold } from "@/lib/supabase/ad-slots";
import { validateCSRF } from "@/lib/security/csrf";
import type { PlanId } from "@/features/business/types";
import { supabaseServer } from "@/lib/supabase/server";

export async function POST(req: NextRequest): Promise<NextResponse> {
  try {
    const csrfError = validateCSRF(req);
    if (csrfError) return csrfError as unknown as NextResponse;

    const session = await getSupabaseProfile();
    if (!session) {
      return NextResponse.json({ success: false, error: "セッションが無効です" }, { status: 401 });
    }

    // まず pending を完了。webhook が先に済ませている場合は最新 completed を参照。
    const completed = await completeLatestPendingOrderBySlug(session.slug);

    if (completed.success) {
      const updated = await setUserPlan(session.slug, "paid");
      if (!updated) {
        return NextResponse.json(
          { success: false, error: "プラン有効化に失敗しました" },
          { status: 500 },
        );
      }

      // webhook 遅延時のフォールバック: 注文の region + plan_id で sold+1
      await tryIncrementSlotForLatestCompleted(session.slug, completed.planId);

      return NextResponse.json({
        success: true,
        planId: completed.planId ?? null,
        planName: completed.planName ?? null,
      });
    }

    if (completed.error === "pending_order_not_found") {
      // 既に webhook で完了済みの可能性
      const { data: latest } = await supabaseServer
        .from("business_orders")
        .select("plan_id, plan_name, status")
        .eq("slug", session.slug)
        .eq("status", "completed")
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (latest) {
        return NextResponse.json({
          success: true,
          planId: latest.plan_id,
          planName: latest.plan_name,
          alreadyCompleted: true,
        });
      }

      return NextResponse.json(
        { success: false, error: "完了対象の注文が見つかりませんでした" },
        { status: 404 },
      );
    }

    return NextResponse.json(
      { success: false, error: "注文の完了処理に失敗しました" },
      { status: 500 },
    );
  } catch (err) {
    console.error("[POST /api/business-checkout/complete]", err instanceof Error ? err.message : "error");
    return NextResponse.json(
      { success: false, error: "サーバーエラーが発生しました" },
      { status: 500 },
    );
  }
}

async function tryIncrementSlotForLatestCompleted(
  slug: string,
  planId: string | undefined,
): Promise<void> {
  try {
    const { data } = await supabaseServer
      .from("business_orders")
      .select("plan_id, region")
      .eq("slug", slug)
      .eq("status", "completed")
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (!data?.region || !data.plan_id) return;
    const tier = (planId || data.plan_id) as PlanId;
    if (!["roots", "signal", "presence", "legacy"].includes(tier)) return;

    // 二重加算防止: Redis が無い経路なので、sold は webhook と race し得る。
    // ここでは webhook 未到達時のフォールバックとして 1 回だけ試みる。
    // 厳密な冪等は payment.id の Redis キー側。
    await incrementAdSlotSold(String(data.region), tier);
  } catch {
    /* best-effort */
  }
}
