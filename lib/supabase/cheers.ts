// lib/supabase/cheers.ts
import { supabase } from "./client";

export async function createCheer(toSlug: string, fromSlug: string | null): Promise<boolean> {
    const { error } = await supabase
        .from("cheers")
        .insert({ to_slug: toSlug, from_slug: fromSlug });
    if (error) { console.error("[createCheer]", error); return false; }

    // cheer_count をインクリメント
    await supabase.rpc("increment_cheer_count", { target_slug: toSlug });
    return true;
}

export async function countCheers(toSlug: string): Promise<number> {
    const { count } = await supabase
        .from("cheers")
        .select("*", { count: "exact", head: true })
        .eq("to_slug", toSlug);
    return count ?? 0;
}

export async function hasAlreadyCheered(toSlug: string, fromSlug: string): Promise<boolean> {
    const since = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
    const { data } = await supabase
        .from("cheers")
        .select("id")
        .eq("to_slug", toSlug)
        .eq("from_slug", fromSlug)
        .gte("created_at", since)
        .single();
    return !!data;
}