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

export async function completeLatestPendingOrderBySlug(slug: string): Promise<{
    success: boolean;
    planId?: string;
    planName?: string;
    error?: string;
}> {
    const { data: pendingOrder, error: findError } = await supabase
        .from("business_orders")
        .select("id, plan_id, plan_name")
        .eq("slug", slug)
        .eq("status", "pending")
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();

    if (findError) {
        console.error("[completeLatestPendingOrderBySlug.find]", findError);
        return { success: false, error: "pending_order_lookup_failed" };
    }

    if (!pendingOrder) {
        return { success: false, error: "pending_order_not_found" };
    }

    const { error: updateError } = await supabase
        .from("business_orders")
        .update({ status: "completed" })
        .eq("id", pendingOrder.id)
        .eq("status", "pending");

    if (updateError) {
        console.error("[completeLatestPendingOrderBySlug.update]", updateError);
        return { success: false, error: "pending_order_update_failed" };
    }

    return {
        success: true,
        planId: pendingOrder.plan_id,
        planName: pendingOrder.plan_name,
    };
}

export async function findLatestIncompleteOrderByEmail(email: string): Promise<{
    id: string;
    email: string;
    slug: string;
    status: string;
} | null> {
    const { data, error } = await supabase
        .from("business_orders")
        .select("id, email, slug, status")
        .eq("email", email)
        .neq("status", "completed")
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();

    if (error) {
        console.error("[findLatestIncompleteOrderByEmail]", error);
        return null;
    }

    return data ? {
        id: String(data.id),
        email: String(data.email),
        slug: String(data.slug),
        status: String(data.status),
    } : null;
}

export async function markBusinessOrderCompletedById(params: {
    id: string;
    planId: string;
    planName: string;
}): Promise<boolean> {
    const { error } = await supabase
        .from("business_orders")
        .update({
            status: "completed",
            plan_id: params.planId,
            plan_name: params.planName,
        })
        .eq("id", params.id);

    if (error) {
        console.error("[markBusinessOrderCompletedById]", error);
        return false;
    }

    return true;
}
