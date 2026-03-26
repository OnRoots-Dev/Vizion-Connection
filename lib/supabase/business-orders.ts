// lib/supabase/business-orders.ts
import { supabaseServer as supabase } from "./server";

// 注文作成
export async function createBusinessOrder(params: {
    email: string;
    slug: string;
    planId: string;
    planName: string;
    amount: number;
    status: string;
    squareLink?: string;
}): Promise<boolean> {
    const { error } = await supabase
        .from("business_orders")
        .insert({
            email: params.email,
            slug: params.slug,
            plan_id: params.planId,
            plan_name: params.planName,
            amount: params.amount,
            status: params.status,
            square_link: params.squareLink ?? null,
        });
    if (error) { console.error("[createBusinessOrder]", error); return false; }
    return true;
}

// プランごとの注文数
export async function countOrdersByPlanId(planId: string): Promise<number> {
    const { count } = await supabase
        .from("business_orders")
        .select("*", { count: "exact", head: true })
        .eq("plan_id", planId)
        .eq("status", "completed");
    return count ?? 0;
}

// 全プランの注文数まとめて取得
export async function getAllPlanOrderCounts(): Promise<Record<string, number>> {
    const { data, error } = await supabase
        .from("business_orders")
        .select("plan_id")
        .eq("status", "completed");
    if (error) { console.error("[getAllPlanOrderCounts]", error); return {}; }

    const counts: Record<string, number> = {};
    for (const row of data ?? []) {
        counts[row.plan_id] = (counts[row.plan_id] ?? 0) + 1;
    }
    return counts;
}