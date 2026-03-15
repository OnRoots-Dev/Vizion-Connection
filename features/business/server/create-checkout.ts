// features/business/server/create-checkout.ts

import { getBusinessPlansWithUrls } from "@/features/business/constants";
import { saveBusinessOrder } from "@/features/business/server/save-order";
import type { PlanId, CreateCheckoutResult } from "@/features/business/types";

interface CreateCheckoutInput {
    planId: PlanId;
    email: string;
    slug: string;
}

export async function createCheckout(
    input: CreateCheckoutInput
): Promise<CreateCheckoutResult> {
    const { planId, email, slug } = input;

    // getBusinessPlansWithUrls() でsquareUrlを含むプラン一覧を取得
    const plans = getBusinessPlansWithUrls();
    const plan = plans.find((p) => p.id === planId);

    if (!plan) {
        return { success: false, error: "プランが見つかりません" };
    }

    if (!plan.squareUrl || plan.squareUrl === "#") {
        return {
            success: false,
            error: "決済リンクが設定されていません。管理者にお問い合わせください。",
        };
    }

    //注文を保存
    await saveBusinessOrder(
        {
            email,
            slug,
            planId: plan.id,
            planName: plan.name,
            amount: plan.amount,
            squareLink: plan.squareUrl,
        },
        "pending"
    );

    return {
        success: true,
        squareUrl: plan.squareUrl,
        planName: plan.name,
    };
}