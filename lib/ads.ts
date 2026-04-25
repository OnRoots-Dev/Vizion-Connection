import { supabaseServer } from "@/lib/supabase/server";
import type { AdItem } from "@/lib/ads-shared";

function shuffle<T>(input: T[]): T[] {
  const arr = [...input];
  for (let i = arr.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

function toAd(row: Record<string, unknown>): AdItem {
  const adScopeValue = row.ad_scope ?? row.adScope;
  const planValue = row.plan ?? row.plan_id ?? "";
  const regionValue = row.region ?? row.prefecture ?? null;
  const statusValue = row.status ? String(row.status) : "";

  return {
    id: String(row.id),
    businessId: Number(row.business_id ?? 0),
    plan: String(planValue),
    status:
      statusValue === "pending" || statusValue === "approved" || statusValue === "rejected"
        ? (statusValue as NonNullable<AdItem["status"]>)
        : undefined,
    adSize: row.ad_size
      ? (String(row.ad_size) as AdItem["adSize"])
      : null,
    adScope: adScopeValue
      ? (String(adScopeValue) as AdItem["adScope"])
      : null,
    region: regionValue ? String(regionValue) : null,
    planPriority: Number(row.plan_priority ?? 0),
    prefecture: row.prefecture ? String(row.prefecture) : regionValue ? String(regionValue) : null,
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

export async function getAdsForUser(userRegion?: string | null, _sport?: string): Promise<AdItem[]> {
  try {
    const normalizedRegion = userRegion?.trim() ?? "";

    const buildBaseQuery = () => supabaseServer
      .from("ads")
      .select("*")
      .eq("is_active", true);

    const nationalPromise = buildBaseQuery()
      .eq("ad_scope", "national")
      .is("region", null)
      .order("plan_priority", { ascending: false })
      .limit(1);

    const regionalPromise = normalizedRegion
      ? buildBaseQuery()
          .eq("ad_scope", "regional")
          .eq("region", normalizedRegion)
      : Promise.resolve({ data: [], error: null } as { data: any[]; error: null });

    const [nationalRes, regionalRes] = await Promise.all([nationalPromise, regionalPromise]);

    const nationalAds = nationalRes.error ? [] : (nationalRes.data ?? []).map((row) => toAd(row as Record<string, unknown>));
    const regionalAds = regionalRes.error ? [] : (regionalRes.data ?? []).map((row) => toAd(row as Record<string, unknown>));

    const onlyApprovedIfStatusExists = (ad: AdItem) => (ad.status ? ad.status === "approved" : true);

    return [...nationalAds, ...shuffle(regionalAds).slice(0, 2)].filter(onlyApprovedIfStatusExists);
  } catch (err) {
    console.error("[getAdsForUser]", err);
    return [];
  }
}
