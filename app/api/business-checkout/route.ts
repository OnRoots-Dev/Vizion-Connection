// app/api/business-checkout/route.ts

import { NextRequest, NextResponse } from "next/server";
import { verifySession } from "@/lib/auth/session";
import { getSessionCookie } from "@/lib/auth/cookies";
import { getBusinessPlansWithUrls } from "@/features/business/constants";
import { createBusinessOrder, countOrdersByPlanId } from "@/lib/supabase/business-orders";
import { setUserPlan } from "@/lib/supabase/data/users.server";
import { findUserBySlug } from "@/lib/supabase/data/users.server";
import type { PlanId } from "@/features/business/types";
import { businessLimiter, getIp } from "@/lib/ratelimit";
import { validateCSRF } from "@/lib/security/csrf";
import { readLimitedJson, PayloadTooLargeError } from "@/lib/security/body";
import { notifyBusinessCheckoutSubmitted } from "@/lib/notifications/create-notification";

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

        const profile = await findUserBySlug(session.slug);
        if (!profile) {
            return NextResponse.json({ success: false, error: "ユーザーが見つかりません" }, { status: 404 });
        }

        const { success } = await businessLimiter.limit(getIp(req));
        if (!success) {
            return NextResponse.json({ success: false, error: "しばらく時間をおいてから再度お試しください" }, { status: 429 });
        }

        let body: { planId?: PlanId };
        try {
            body = await readLimitedJson(req);
        } catch (e) {
            if (e instanceof PayloadTooLargeError) {
                return NextResponse.json({ error: "Payload too large" }, { status: 413 });
            }
            return NextResponse.json({ error: "Bad request" }, { status: 400 });
        }

        const { planId } = body;
        if (!planId) {
            return NextResponse.json({ success: false, error: "プランIDが指定されていません" }, { status: 400 });
        }

        const plans = getBusinessPlansWithUrls();
        const plan = plans.find(p => p.id === planId);
        if (!plan) {
            return NextResponse.json({ success: false, error: "プランが見つかりません" }, { status: 400 });
        }

        const soldCount = await countOrdersByPlanId(planId);
        if (soldCount >= plan.seats) {
            return NextResponse.json({ success: false, error: "このプランは満席です" }, { status: 409 });
        }

        if (plan.amount === 0) {
            await createBusinessOrder({
                email: profile.email,
                slug: session.slug,
                planId: plan.id,
                planName: plan.name,
                amount: 0,
                status: "completed",
                squareLink: "",
            });
            await setUserPlan(session.slug, "paid");
            return NextResponse.json({ success: true, squareUrl: "" });
        }

        if (!plan.squareUrl) {
            return NextResponse.json({ success: false, error: "決済リンクが設定されていません" }, { status: 500 });
        }

        await createBusinessOrder({
            email: profile.email,
            slug: session.slug,
            planId: plan.id,
            planName: plan.name,
            amount: plan.amount,
            status: "pending",
            squareLink: plan.squareUrl,
        });
        await notifyBusinessCheckoutSubmitted({
            slug: session.slug,
            planName: plan.name,
            amount: plan.amount,
        }).catch((err) => {
            console.error("[notifyBusinessCheckoutSubmitted]", err);
        });

        return NextResponse.json({ success: true, squareUrl: plan.squareUrl });

    } catch (err) {
        console.error("[POST /api/business-checkout]", err);
        return NextResponse.json({ success: false, error: "サーバーエラーが発生しました" }, { status: 500 });
    }
}
