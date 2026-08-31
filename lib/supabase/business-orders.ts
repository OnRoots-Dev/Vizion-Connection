// lib/supabase/business-orders.ts
import { supabaseServer as supabase } from "./server";

// 注文作成（作成した注文の id を返す。失敗時は null）
export async function createBusinessOrder(params: {
    email: string;
    slug: string;
    planId: string;
    planName: string;
    amount: number;
    status: string;
    squareLink?: string;
    region?: string | null;
}): Promise<string | null> {
    const { data, error } = await supabase
        .from("business_orders")
        .insert({
            email: params.email,
            slug: params.slug,
            plan_id: params.planId,
            plan_name: params.planName,
            amount: params.amount,
            status: params.status,
            square_link: params.squareLink ?? null,
            region: params.region ?? null,
        })
        .select("id")
        .single();
    if (error) { console.error("[createBusinessOrder]", error.code); return null; }
    return data ? String(data.id) : null;
}

/** 指定した注文を1件取得（戻りURLの order パラメータからの照会用） */
export async function findBusinessOrderById(id: string): Promise<{
    id: string;
    email: string;
    slug: string;
    status: string;
    planId: string;
    planName: string;
    amount: number;
    /** roots: 都道府県名 / 全国プラン: 全国 */
    region: string | null;
} | null> {
    const { data, error } = await supabase
        .from("business_orders")
        .select("id, email, slug, status, plan_id, plan_name, amount, region")
        .eq("id", id)
        .maybeSingle();
    if (error) {
        console.error("[findBusinessOrderById]", error.code);
        return null;
    }
    if (!data) return null;
    return {
        id: String(data.id),
        email: String(data.email),
        slug: String(data.slug),
        status: String(data.status),
        planId: String(data.plan_id),
        planName: String(data.plan_name),
        amount: Number(data.amount) || 0,
        region: data.region != null ? String(data.region) : null,
    };
}

/** 注文ステータスを更新（Payment Link生成失敗時などの後始末に使う） */
export async function setBusinessOrderStatus(id: string, status: "pending" | "completed" | "failed"): Promise<boolean> {
    const { error } = await supabase
        .from("business_orders")
        .update({ status })
        .eq("id", id);
    if (error) { console.error("[setBusinessOrderStatus]", error.code); return false; }
    return true;
}

/** Payment Link 生成後に注文へ square_link を記録する */
export async function setBusinessOrderSquareLink(id: string, squareLink: string): Promise<boolean> {
    const { error } = await supabase
        .from("business_orders")
        .update({ square_link: squareLink })
        .eq("id", id);
    if (error) { console.error("[setBusinessOrderSquareLink]", error.code); return false; }
    return true;
}

// Rootsプランの地方ブロック別 完了注文数
export async function getRootsOrderCountsByRegion(): Promise<Record<string, number>> {
    const { data, error } = await supabase
        .from("business_orders")
        .select("region")
        .eq("plan_id", "roots")
        .eq("status", "completed");
    if (error) { console.error("[getRootsOrderCountsByRegion]", error); return {}; }

    const counts: Record<string, number> = {};
    for (const row of data ?? []) {
        const region = row.region;
        if (!region) continue;
        counts[region] = (counts[region] ?? 0) + 1;
    }
    return counts;
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
    planId: string;
    planName: string;
    amount: number;
    /** roots: 都道府県名 / 全国プラン: 全国 */
    region: string | null;
} | null> {
    const { data, error } = await supabase
        .from("business_orders")
        .select("id, email, slug, status, plan_id, plan_name, amount, region")
        .eq("email", email)
        .eq("status", "pending")
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();

    if (error) {
        console.error("[findLatestIncompleteOrderByEmail]", error.code);
        return null;
    }

    return data ? {
        id: String(data.id),
        email: String(data.email),
        slug: String(data.slug),
        status: String(data.status),
        planId: String(data.plan_id),
        planName: String(data.plan_name),
        amount: Number(data.amount) || 0,
        region: data.region != null ? String(data.region) : null,
    } : null;
}

/**
 * 注文を completed に遷移させる（冪等）。
 * - "completed": 今回 pending → completed に遷移した（副作用を実行すべき）
 * - "already"  : 既に completed（重複・再送。副作用は実行しない）
 * - "missing"  : 指定IDの注文が無い
 * - "error"    : DBエラー（再送を促す）
 * 同一注文を何度呼んでも安全（Redis が無くても DB 状態から冪等に判定できる）。
 */
export type CompleteOrderResult = "completed" | "already" | "missing" | "error";

export async function markBusinessOrderCompletedById(params: {
    id: string;
    planId: string;
    planName: string;
}): Promise<CompleteOrderResult> {
    const { data: current, error: findError } = await supabase
        .from("business_orders")
        .select("id, status")
        .eq("id", params.id)
        .maybeSingle();
    if (findError) {
        console.error("[markBusinessOrderCompletedById.find]", findError.code);
        return "error";
    }
    if (!current) return "missing";
    if (current.status === "completed") return "already";

    const { data: updated, error: updateError } = await supabase
        .from("business_orders")
        .update({
            status: "completed",
            plan_id: params.planId,
            plan_name: params.planName,
        })
        .eq("id", params.id)
        .eq("status", "pending")
        .select("id, status")
        .maybeSingle();

    if (updateError) {
        console.error("[markBusinessOrderCompletedById.update]", updateError.code);
        return "error";
    }
    if (!updated) {
        // 競合（他リクエストが同時に完了済み）: 再確認して冪等に判定
        const { data: recheck } = await supabase
            .from("business_orders")
            .select("status")
            .eq("id", params.id)
            .maybeSingle();
        return recheck?.status === "completed" ? "already" : "error";
    }
    return "completed";
}
