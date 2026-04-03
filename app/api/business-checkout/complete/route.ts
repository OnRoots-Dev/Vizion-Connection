import { NextRequest, NextResponse } from "next/server";
import { getSessionCookie } from "@/lib/auth/cookies";
import { verifySession } from "@/lib/auth/session";
import { completeLatestPendingOrderBySlug } from "@/lib/supabase/business-orders";
import { setUserPlan } from "@/lib/supabase/data/users.server";
import { validateCSRF } from "@/lib/security/csrf";

export async function POST(req: NextRequest): Promise<NextResponse> {
    try {
        const csrfError = validateCSRF(req);
        if (csrfError) return csrfError as unknown as NextResponse;

        const token = await getSessionCookie();
        if (!token) {
            return NextResponse.json({ success: false, error: "ログインが必要です" }, { status: 401 });
        }

        const session = verifySession(token);
        if (!session) {
            return NextResponse.json({ success: false, error: "セッションが無効です" }, { status: 401 });
        }

        const completed = await completeLatestPendingOrderBySlug(session.slug);
        if (!completed.success) {
            if (completed.error === "pending_order_not_found") {
                return NextResponse.json(
                    { success: false, error: "完了対象の注文が見つかりませんでした" },
                    { status: 404 }
                );
            }
            return NextResponse.json(
                { success: false, error: "注文の完了処理に失敗しました" },
                { status: 500 }
            );
        }

        const updated = await setUserPlan(session.slug, "paid");
        if (!updated) {
            return NextResponse.json(
                { success: false, error: "プラン有効化に失敗しました" },
                { status: 500 }
            );
        }

        return NextResponse.json({
            success: true,
            planId: completed.planId ?? null,
            planName: completed.planName ?? null,
        });
    } catch (err) {
        console.error("[POST /api/business-checkout/complete]", err);
        return NextResponse.json(
            { success: false, error: "サーバーエラーが発生しました" },
            { status: 500 }
        );
    }
}
