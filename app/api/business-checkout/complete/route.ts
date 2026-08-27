import { NextRequest, NextResponse } from "next/server";
import { getSupabaseProfile } from "@/lib/auth/session";
import { validateCSRF } from "@/lib/security/csrf";
import { businessCompleteLimiter, getIp } from "@/lib/ratelimit";
import { supabaseServer } from "@/lib/supabase/server";

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

    // 決済完了の根拠は署名検証済みSquare Webhookだけ。
    // ブラウザのreturn URLは状態を有効化せず、Webhook反映済みの結果だけを返す。
    const { data: latest } = await supabaseServer
      .from("business_orders")
      .select("plan_id, plan_name")
      .eq("slug", session.slug)
      .eq("status", "completed")
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (!latest) {
      return NextResponse.json({ success: false, pending: true, error: "決済確認中です。しばらくしてから再度ご確認ください。" }, { status: 202 });
    }
    return NextResponse.json({ success: true, planId: latest.plan_id, planName: latest.plan_name, alreadyCompleted: true });
  } catch (err) {
    console.error("[POST /api/business-checkout/complete]", err instanceof Error ? err.message : "error");
    return NextResponse.json(
      { success: false, error: "サーバーエラーが発生しました" },
      { status: 500 },
    );
  }
}
