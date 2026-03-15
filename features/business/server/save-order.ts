// features/business/server/save-order.ts

import { createBusinessOrder } from "@/lib/supabase/business-orders";
import type { BusinessOrderInput, BusinessOrderRecord } from "@/features/business/types";

export async function saveBusinessOrder(
    input: BusinessOrderInput,
    status: "pending" | "completed" | "failed"
): Promise<BusinessOrderRecord> {

    const ok = await createBusinessOrder({
        ...input,
        status,
    });

    if (!ok) {
        throw new Error("Business order creation failed");
    }

    // createBusinessOrder が boolean しか返さないため
    // 仮の BusinessOrderRecord を生成して返す
    return {
        email: input.email,
        slug: input.slug,
        planId: input.planId,
        planName: input.planName,
        amount: input.amount,
        status,
        squareLink: input.squareLink ?? null,
    } as BusinessOrderRecord;
}