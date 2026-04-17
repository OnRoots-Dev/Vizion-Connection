// lib/supabase/collections.ts
// プロフィールカードのコレクト機能
// Supabaseに以下のテーブルが必要:
//
// CREATE TABLE card_collections (
//   id bigserial PRIMARY KEY,
//   collector_slug text NOT NULL,   -- コレクトした人
//   target_slug    text NOT NULL,   -- コレクトされた人
//   created_at     timestamptz DEFAULT now(),
//   UNIQUE(collector_slug, target_slug)
// );
// CREATE INDEX ON card_collections(collector_slug);
// CREATE INDEX ON card_collections(target_slug);

import { supabaseServer as supabase } from "./server";

export interface CollectedCard {
    targetSlug: string;
    displayName: string;
    role: string;
    avatarUrl: string | null;
    profileImageUrl: string | null;
    bio: string | null;
    region: string | null;
    prefecture: string | null;
    sport: string | null;
    sponsorPlan: "roots" | "roots_plus" | "signal" | "presence" | "legacy" | null;
    serialId: string | null;
    cheerCount: number;
    isFoundingMember: boolean;
    collectedAt: string;
}

/** コレクト済みかチェック */
export async function hasCollected(collectorSlug: string, targetSlug: string): Promise<boolean> {
    const { data } = await supabase
        .from("card_collections")
        .select("id")
        .eq("collector_slug", collectorSlug)
        .eq("target_slug", targetSlug)
        .single();
    return !!data;
}

/** カードをコレクト */
export async function collectCard(collectorSlug: string, targetSlug: string): Promise<boolean> {
    const { error } = await supabase
        .from("card_collections")
        .insert({ collector_slug: collectorSlug, target_slug: targetSlug });
    if (error) {
        if (error.code === "23505") return false; // 重複
        console.error("[collectCard]", error);
        return false;
    }
    return true;
}

/** コレクトを取り消す */
export async function uncollectCard(collectorSlug: string, targetSlug: string): Promise<boolean> {
    const { error } = await supabase
        .from("card_collections")
        .delete()
        .eq("collector_slug", collectorSlug)
        .eq("target_slug", targetSlug);
    if (error) { console.error("[uncollectCard]", error); return false; }
    return true;
}

/** 自分がコレクトしたカード一覧 */
export async function getCollectedCards(collectorSlug: string): Promise<CollectedCard[]> {
    const { data, error } = await supabase
        .from("card_collections")
        .select(`
            target_slug,
            created_at,
            users!card_collections_target_slug_fkey (
                display_name, role, avatar_url, profile_image_url,
                bio, region, prefecture, sport, sponsor_plan,
                serial_id, cheer_count, is_founding_member
            )
        `)
        .eq("collector_slug", collectorSlug)
        .order("created_at", { ascending: false });

    if (error) { console.error("[getCollectedCards]", error); return []; }

    return (data ?? []).map((row: any) => ({
        targetSlug: row.target_slug,
        displayName: row.users?.display_name ?? "",
        role: row.users?.role ?? "",
        avatarUrl: row.users?.avatar_url ?? null,
        profileImageUrl: row.users?.profile_image_url ?? null,
        bio: row.users?.bio ?? null,
        region: row.users?.region ?? null,
        prefecture: row.users?.prefecture ?? null,
        sport: row.users?.sport ?? null,
        sponsorPlan: row.users?.sponsor_plan ?? null,
        serialId: row.users?.serial_id ?? null,
        cheerCount: row.users?.cheer_count ?? 0,
        isFoundingMember: row.users?.is_founding_member ?? false,
        collectedAt: row.created_at,
    }));
}

/** 自分のカードをコレクトしている人の数 */
export async function getCollectorCount(targetSlug: string): Promise<number> {
    const { count } = await supabase
        .from("card_collections")
        .select("*", { count: "exact", head: true })
        .eq("target_slug", targetSlug);
    return count ?? 0;
}

export async function getCollectedCardCount(collectorSlug: string): Promise<number> {
    const { count } = await supabase
        .from("card_collections")
        .select("*", { count: "exact", head: true })
        .eq("collector_slug", collectorSlug);
    return count ?? 0;
}
