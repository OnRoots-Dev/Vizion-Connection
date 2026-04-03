import { supabaseServer } from "@/lib/supabase/server";
import { LOCAL_AD_PLANS, NATIONAL_AD_PLANS } from "@/lib/ads-shared";
import type { AdItem } from "@/lib/ads-shared";

function shuffle<T>(input: T[]): T[] {
    const arr = [...input];
    for (let i = arr.length - 1; i > 0; i -= 1) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
}

function nowIso(): string {
    return new Date().toISOString();
}

function toAd(row: Record<string, unknown>): AdItem {
    return {
        id: String(row.id),
        businessId: Number(row.business_id),
        plan: String(row.plan ?? ""),
        prefecture: row.prefecture ? String(row.prefecture) : null,
        sportCategory: row.sport_category ? String(row.sport_category) : null,
        imageUrl: row.image_url ? String(row.image_url) : null,
        linkUrl: row.link_url ? String(row.link_url) : null,
        headline: String(row.headline ?? ""),
        bodyText: row.body_text ? String(row.body_text) : null,
        isActive: Boolean(row.is_active),
        startsAt: String(row.starts_at ?? ""),
        endsAt: row.ends_at ? String(row.ends_at) : null,
        createdAt: String(row.created_at ?? ""),
    };
}

export async function getAdsForUser(prefecture?: string | null, sport?: string): Promise<AdItem[]> {
    try {
        const now = nowIso();
        const normalizedPrefecture = prefecture?.trim() ?? "";

        const nationalPromise = supabaseServer
            .from("ads")
            .select("*")
            .eq("is_active", true)
            .in("plan", [...NATIONAL_AD_PLANS])
            .is("prefecture", null)
            .lte("starts_at", now)
            .or(`ends_at.is.null,ends_at.gte.${now}`);

        const localPromise = normalizedPrefecture
            ? supabaseServer
                .from("ads")
                .select("*")
                .eq("is_active", true)
                .in("plan", [...LOCAL_AD_PLANS])
                .eq("prefecture", normalizedPrefecture)
                .lte("starts_at", now)
                .or(`ends_at.is.null,ends_at.gte.${now}`)
            : Promise.resolve({ data: [], error: null } as { data: any[]; error: null });

        const [localRes, nationalRes] = await Promise.all([localPromise, nationalPromise]);

        // 広告テーブル未作成・RLS・一時的障害時は静かにフォールバック
        // （UI側ではプレースホルダーを表示するため、ここでのコンソール出力は抑制）

        let localAds = localRes.error ? [] : (localRes.data ?? []).map((r) => toAd(r as Record<string, unknown>));
        const nationalAds = nationalRes.error ? [] : (nationalRes.data ?? []).map((r) => toAd(r as Record<string, unknown>));

        if (sport) {
            const matched = localAds.filter((ad) => ad.sportCategory === sport);
            const fallback = localAds.filter((ad) => ad.sportCategory !== sport);
            localAds = [...matched, ...fallback];
        }

        const pickedLocal = shuffle(localAds).slice(0, 2);
        const pickedNational = shuffle(nationalAds).slice(0, 1);

        return [...pickedLocal, ...pickedNational];
    } catch (err) {
        console.error("[getAdsForUser]", err);
        return [];
    }
}
