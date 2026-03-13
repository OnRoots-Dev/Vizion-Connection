// features/business/server/save-order.ts

import { createBusinessOrder } from "@/lib/airtable/business-orders";
import type { BusinessOrderInput, BusinessOrderRecord } from "@/features/business/types";

export async function saveBusinessOrder(
    input: BusinessOrderInput,
    status: "pending" | "completed" | "failed"
): Promise<BusinessOrderRecord> {
    return await createBusinessOrder({ ...input, status });
}