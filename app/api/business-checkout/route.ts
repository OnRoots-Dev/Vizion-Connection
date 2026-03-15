// app/api/business-checkout/route.ts

import { NextRequest, NextResponse } from "next/server";
import { verifySession } from "@/lib/auth/session";
import { getSessionCookie } from "@/lib/auth/cookies";
import { getBusinessPlansWithUrls } from "@/features/business/constants";
import { createBusinessOrder, countOrdersByPlanId } from "@/lib/supabase/business-orders";
import type { PlanId } from "@/features/business/types";

export async function POST(req: NextRequest): Promise<NextResponse> {
    try {
        const token = await getSessionCookie();
        if (!token) {
            return NextResponse.json({ success: false, error: "ログインが必要です" }, { status: 401 });
        }

        const session = verifySession(token);
        if (!session) {
            return NextResponse.json({ success: false, error: "セッションが無効です" }, { status: 401 });
        }

        const body = await req.json() as { planId?: PlanId };
        const { planId } = body;

        if (!planId) {
            return NextResponse.json({ success: false, error: "プランIDが指定されていません" }, { status: 400 });
        }

        // getBusinessPlansWithUrls() でsquareUrlを含むプラン一覧を取得
        const plans = getBusinessPlansWithUrls();
        const plan = plans.find(p => p.id === planId);

        if (!plan) {
            return NextResponse.json({ success: false, error: "プランが見つかりません" }, { status: 400 });
        }

        // 残席チェック
        const soldCount = await countOrdersByPlanId(planId);
        if (soldCount >= plan.seats) {
            return NextResponse.json({ success: false, error: "このプランは満席です" }, { status: 409 });
        }

        if (!plan.squareUrl) {
            return NextResponse.json({ success: false, error: "決済リンクが設定されていません" }, { status: 500 });
        }

        // 注文保存
        await createBusinessOrder({
            email: session.email,
            slug: session.slug,
            planId: plan.id,
            planName: plan.name,
            amount: plan.amount,
            status: "pending",
            squareLink: plan.squareUrl,
        });

        return NextResponse.json({ success: true, squareUrl: plan.squareUrl });
    } catch (err) {
        console.error("[POST /api/business-checkout]", err);
        return NextResponse.json({ success: false, error: "サーバーエラーが発生しました" }, { status: 500 });
    }
}