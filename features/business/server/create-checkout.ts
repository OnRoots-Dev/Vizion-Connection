// features/business/server/create-checkout.ts

import { getBusinessPlansWithUrls, isBusinessRegionId } from "@/features/business/constants";
import { saveBusinessOrder } from "@/features/business/server/save-order";
import type { PlanId, CreateCheckoutResult } from "@/features/business/types";

interface CreateCheckoutInput {
    planId: PlanId;
    email: string;
    slug: string;
    region?: string | null;
}

export async function createCheckout(
    input: CreateCheckoutInput
): Promise<CreateCheckoutResult> {
    const { planId, email, slug, region } = input;

    // getBusinessPlansWithUrls() でsquareUrlを含むプラン一覧を取得
    const plans = getBusinessPlansWithUrls();
    const plan = plans.find((p) => p.id === planId);

    if (!plan) {
        return { success: false, error: "プランが見つかりません" };
    }

    // Roots は地方ブロック商品のため region 必須。全国プランは region を持たない。
    if (plan.id === "roots" && !isBusinessRegionId(region)) {
        return { success: false, error: "地方ブロックを選択してください" };
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
            region: plan.id === "roots" ? region : null,
        },
        "pending"
    );

    return {
        success: true,
        squareUrl: plan.squareUrl,
        planName: plan.name,
    };
}