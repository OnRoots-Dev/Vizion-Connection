// features/business/server/save-order.ts

import { createBusinessOrder } from "@/lib/supabase/business-orders";
import type { BusinessOrderInput, BusinessOrderRecord } from "@/features/business/types";

export async function saveBusinessOrder(
    input: BusinessOrderInput,
    status: "pending" | "completed" | "failed"
): Promise<BusinessOrderRecord> {

    const orderId = await createBusinessOrder({
        ...input,
        status,
    });

    if (!orderId) {
        throw new Error("Business order creation failed");
    }

    return {
        id: orderId,
        email: input.email,
        slug: input.slug,
        planId: input.planId,
        planName: input.planName,
        amount: input.amount,
        status,
        squareLink: input.squareLink ?? null,
        createdAt: "",
    } as BusinessOrderRecord;
}