// lib/supabase/stats.ts
// 登録者数など統計取得用

import { supabase } from "./client";

/** 全登録者数（削除済みを除く）を返す */
export async function getTotalUserCount(): Promise<number> {
    const { count, error } = await supabase
        .from("users")
        .select("*", { count: "exact", head: true })
        .eq("is_deleted", false);
    if (error) { console.error("[getTotalUserCount]", error); return 0; }
    return count ?? 0;
}