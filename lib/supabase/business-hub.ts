import { supabaseServer } from "@/lib/supabase/server";
import { getPlanFeatures, PLAN_PRIORITY } from "@/features/business/plan-features";
import type { ProfileRecord } from "@/lib/supabase/data/users.server";

type AnalyticsPoint = {
  date: string;
  impressions: number;
  clicks: number;
  conversions: number;
  sales: number;
};

export type BusinessHubAnalytics = {
  kpis: {
    impressions: number;
    clicks: number;
    conversions: number;
    sales: number;
    ctr: number;
    cvr: number;
  };
  timeline: AnalyticsPoint[];
};

export type BusinessHubAd = {
  id: string;
  headline: string;
  bodyText: string | null;
  imageUrl: string | null;
  linkUrl: string | null;
  startsAt: string;
  endsAt: string | null;
  isActive: boolean;
  adScope: "regional" | "national" | null;
  prefecture: string | null;
  metrics: {
    clicks: number;
    conversions: number;
  };
};

export type BusinessHubOffer = {
  id: string;
  title: string;
  message: string;
  rewardAmount: number;
  status: "sent" | "approved" | "rejected";
  target: {
    slug: string;
    displayName: string;
    role: string;
  };
  createdAt: string;
  updatedAt: string;
};

export type ReceivedOffer = {
  id: string;
  title: string;
  message: string;
  rewardAmount: number;
  status: "sent" | "approved" | "rejected";
  business: {
    slug: string;
    displayName: string;
  };
  createdAt: string;
  updatedAt: string;
};

function startOfDay(date: Date) {
  const copy = new Date(date);
  copy.setHours(0, 0, 0, 0);
  return copy;
}

function formatDay(date: Date) {
  return new Intl.DateTimeFormat("ja-JP", { month: "numeric", day: "numeric" }).format(date);
}

function safePercent(numerator: number, denominator: number) {
  if (!denominator) return 0;
  return Number(((numerator / denominator) * 100).toFixed(2));
}

function normalizeAdRow(row: Record<string, unknown>, metrics: { clicks: number; conversions: number }): BusinessHubAd {
  return {
    id: String(row.id),
    headline: String(row.headline ?? "無題の広告"),
    bodyText: row.body_text ? String(row.body_text) : null,
    imageUrl: row.image_url ? String(row.image_url) : null,
    linkUrl: row.link_url ? String(row.link_url) : null,
    startsAt: String(row.starts_at ?? new Date().toISOString()),
    endsAt: row.ends_at ? String(row.ends_at) : null,
    isActive: Boolean(row.is_active),
    adScope: row.ad_scope ? (String(row.ad_scope) as BusinessHubAd["adScope"]) : null,
    prefecture: row.prefecture ? String(row.prefecture) : null,
    metrics,
  };
}

export async function getBusinessHubAnalytics(profile: ProfileRecord, days = 7): Promise<BusinessHubAnalytics> {
  const fromDate = startOfDay(new Date());
  fromDate.setDate(fromDate.getDate() - (days - 1));

  const { data, error } = await supabaseServer
    .from("ad_events")
    .select("event_type, revenue_amount, occurred_at")
    .eq("business_id", profile.id)
    .gte("occurred_at", fromDate.toISOString())
    .order("occurred_at", { ascending: true });

  if (error) {
    console.error("[getBusinessHubAnalytics]", error);
    return {
      kpis: { impressions: 0, clicks: 0, conversions: 0, sales: 0, ctr: 0, cvr: 0 },
      timeline: Array.from({ length: days }, (_, index) => {
        const date = new Date(fromDate);
        date.setDate(date.getDate() + index);
        return { date: formatDay(date), impressions: 0, clicks: 0, conversions: 0, sales: 0 };
      }),
    };
  }

  const buckets = new Map<string, AnalyticsPoint>();
  for (let index = 0; index < days; index += 1) {
    const date = new Date(fromDate);
    date.setDate(date.getDate() + index);
    buckets.set(date.toISOString().slice(0, 10), { date: formatDay(date), impressions: 0, clicks: 0, conversions: 0, sales: 0 });
  }

  let impressions = 0;
  let clicks = 0;
  let conversions = 0;
  let sales = 0;

  for (const row of data ?? []) {
    const key = String(row.occurred_at).slice(0, 10);
    const bucket = buckets.get(key);
    const revenue = Number(row.revenue_amount ?? 0);
    const eventType = String(row.event_type);

    if (eventType == "impression") impressions += 1;
    if (eventType == "click") clicks += 1;
    if (eventType == "conversion") conversions += 1;
    if (eventType == "sale") sales += revenue;

    if (!bucket) continue;
    if (eventType == "impression") bucket.impressions += 1;
    if (eventType == "click") bucket.clicks += 1;
    if (eventType == "conversion") bucket.conversions += 1;
    if (eventType == "sale") bucket.sales += revenue;
  }

  return {
    kpis: {
      impressions,
      clicks,
      conversions,
      sales,
      ctr: safePercent(clicks, impressions),
      cvr: safePercent(conversions, clicks),
    },
    timeline: Array.from(buckets.values()),
  };
}

export async function listBusinessHubAds(profile: ProfileRecord): Promise<BusinessHubAd[]> {
  const { data: ads, error } = await supabaseServer
    .from("ads")
    .select("id, headline, body_text, image_url, link_url, starts_at, ends_at, is_active, ad_scope, prefecture, created_at")
    .eq("business_id", profile.id)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("[listBusinessHubAds]", error);
    return [];
  }

  const adIds = (ads ?? []).map((row) => String(row.id));
  const metricsMap = new Map<string, { clicks: number; conversions: number }>();
  if (adIds.length > 0) {
    const { data: events } = await supabaseServer
      .from("ad_events")
      .select("ad_id, event_type")
      .in("ad_id", adIds);

    for (const event of events ?? []) {
      const adId = String(event.ad_id);
      const current = metricsMap.get(adId) ?? { clicks: 0, conversions: 0 };
      if (event.event_type == "click") current.clicks += 1;
      if (event.event_type == "conversion") current.conversions += 1;
      metricsMap.set(adId, current);
    }
  }

  return (ads ?? []).map((row) => normalizeAdRow(row as Record<string, unknown>, metricsMap.get(String(row.id)) ?? { clicks: 0, conversions: 0 }));
}

export async function createBusinessHubAd(profile: ProfileRecord, input: {
  headline: string;
  bodyText?: string | null;
  imageUrl?: string | null;
  linkUrl?: string | null;
  prefecture?: string | null;
  startsAt?: string | null;
  endsAt?: string | null;
}) {
  const features = getPlanFeatures(profile.sponsorPlan ?? null);
  const plan = profile.sponsorPlan ?? "roots";
  const startsAt = input.startsAt ? new Date(input.startsAt).toISOString() : new Date().toISOString();
  const endsAt = input.endsAt ? new Date(input.endsAt).toISOString() : null;

  const payload = {
    business_id: profile.id,
    plan,
    ad_size: features?.adSize ?? "small",
    ad_scope: features?.adScope ?? "regional",
    region: profile.region ?? null,
    plan_priority: PLAN_PRIORITY[String(plan)] ?? 0,
    prefecture: input.prefecture ?? profile.prefecture ?? null,
    sport_category: profile.sportsCategory ?? null,
    image_url: input.imageUrl ?? null,
    link_url: input.linkUrl ?? null,
    headline: input.headline,
    body_text: input.bodyText ?? null,
    is_active: true,
    starts_at: startsAt,
    ends_at: endsAt,
  };

  const { data, error } = await supabaseServer.from("ads").insert(payload).select("*").single();
  if (error) {
    console.error("[createBusinessHubAd]", error);
    throw new Error("広告を作成できませんでした");
  }

  return normalizeAdRow(data as Record<string, unknown>, { clicks: 0, conversions: 0 });
}

export async function updateBusinessHubAd(profile: ProfileRecord, adId: string, input: {
  headline?: string;
  bodyText?: string | null;
  imageUrl?: string | null;
  linkUrl?: string | null;
  prefecture?: string | null;
  startsAt?: string | null;
  endsAt?: string | null;
  isActive?: boolean;
}) {
  const patch: Record<string, unknown> = {};
  if (typeof input.headline == "string") patch.headline = input.headline;
  if (typeof input.bodyText != "undefined") patch.body_text = input.bodyText;
  if (typeof input.imageUrl != "undefined") patch.image_url = input.imageUrl;
  if (typeof input.linkUrl != "undefined") patch.link_url = input.linkUrl;
  if (typeof input.prefecture != "undefined") patch.prefecture = input.prefecture;
  if (typeof input.startsAt != "undefined") patch.starts_at = input.startsAt ? new Date(input.startsAt).toISOString() : null;
  if (typeof input.endsAt != "undefined") patch.ends_at = input.endsAt ? new Date(input.endsAt).toISOString() : null;
  if (typeof input.isActive == "boolean") patch.is_active = input.isActive;

  const { data, error } = await supabaseServer
    .from("ads")
    .update(patch)
    .eq("id", adId)
    .eq("business_id", profile.id)
    .select("*")
    .single();

  if (error) {
    console.error("[updateBusinessHubAd]", error);
    throw new Error("広告を更新できませんでした");
  }

  const { data: events } = await supabaseServer.from("ad_events").select("event_type").eq("ad_id", adId);
  const metrics = { clicks: 0, conversions: 0 };
  for (const event of events ?? []) {
    if (event.event_type == "click") metrics.clicks += 1;
    if (event.event_type == "conversion") metrics.conversions += 1;
  }
  return normalizeAdRow(data as Record<string, unknown>, metrics);
}

export async function listBusinessHubOffers(profile: ProfileRecord): Promise<BusinessHubOffer[]> {
  const { data, error } = await supabaseServer
    .from("business_offers")
    .select("id, title, message, reward_amount, status, target_slug, created_at, updated_at")
    .eq("business_slug", profile.slug)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("[listBusinessHubOffers]", error);
    return [];
  }

  const targetSlugs = Array.from(new Set((data ?? []).map((row) => String(row.target_slug))));
  const targetMap = new Map<string, { display_name: string; role: string }>();
  if (targetSlugs.length > 0) {
    const { data: users } = await supabaseServer
      .from("users")
      .select("slug, display_name, role")
      .in("slug", targetSlugs)
      .eq("is_deleted", false);

    for (const user of users ?? []) {
      targetMap.set(String(user.slug), { display_name: String(user.display_name ?? "Unknown"), role: String(user.role ?? "Members") });
    }
  }

  return (data ?? []).map((row) => {
    const target = targetMap.get(String(row.target_slug));
    return {
      id: String(row.id),
      title: String(row.title),
      message: String(row.message),
      rewardAmount: Number(row.reward_amount ?? 0),
      status: String(row.status) as BusinessHubOffer["status"],
      target: {
        slug: String(row.target_slug),
        displayName: target?.display_name ?? String(row.target_slug),
        role: target?.role ?? "Members",
      },
      createdAt: String(row.created_at),
      updatedAt: String(row.updated_at),
    };
  });
}

export async function createBusinessHubOffer(profile: ProfileRecord, input: {
  targetSlug: string;
  title: string;
  message: string;
  rewardAmount: number;
}) {
  const { data: targetUser, error: targetError } = await supabaseServer
    .from("users")
    .select("slug, display_name, role")
    .eq("slug", input.targetSlug)
    .eq("is_deleted", false)
    .maybeSingle();

  if (targetError || !targetUser) {
    throw new Error("対象ユーザーが見つかりませんでした");
  }

  const { data, error } = await supabaseServer
    .from("business_offers")
    .insert({
      business_slug: profile.slug,
      target_slug: input.targetSlug,
      title: input.title,
      message: input.message,
      reward_amount: input.rewardAmount,
      status: "sent",
    })
    .select("*")
    .single();

  if (error) {
    console.error("[createBusinessHubOffer]", error);
    throw new Error("オファーを作成できませんでした");
  }

  return {
    id: String(data.id),
    title: String(data.title),
    message: String(data.message),
    rewardAmount: Number(data.reward_amount ?? 0),
    status: String(data.status) as BusinessHubOffer["status"],
    target: {
      slug: String(targetUser.slug),
      displayName: String(targetUser.display_name),
      role: String(targetUser.role),
    },
    createdAt: String(data.created_at),
    updatedAt: String(data.updated_at),
  } satisfies BusinessHubOffer;
}

export async function updateBusinessHubOfferStatus(profile: ProfileRecord, offerId: string, status: BusinessHubOffer["status"]) {
  const { data, error } = await supabaseServer
    .from("business_offers")
    .update({ status })
    .eq("id", offerId)
    .eq("business_slug", profile.slug)
    .select("*")
    .single();

  if (error) {
    console.error("[updateBusinessHubOfferStatus]", error);
    throw new Error("オファーを更新できませんでした");
  }

  const { data: targetUser } = await supabaseServer
    .from("users")
    .select("slug, display_name, role")
    .eq("slug", data.target_slug)
    .maybeSingle();

  return {
    id: String(data.id),
    title: String(data.title),
    message: String(data.message),
    rewardAmount: Number(data.reward_amount ?? 0),
    status: String(data.status) as BusinessHubOffer["status"],
    target: {
      slug: String(data.target_slug),
      displayName: String(targetUser?.display_name ?? data.target_slug),
      role: String(targetUser?.role ?? "Members"),
    },
    createdAt: String(data.created_at),
    updatedAt: String(data.updated_at),
  } satisfies BusinessHubOffer;
}

export async function listReceivedOffers(profile: ProfileRecord): Promise<ReceivedOffer[]> {
  const { data, error } = await supabaseServer
    .from("business_offers")
    .select("id, title, message, reward_amount, status, business_slug, created_at, updated_at")
    .eq("target_slug", profile.slug)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("[listReceivedOffers]", error);
    return [];
  }

  const businessSlugs = Array.from(new Set((data ?? []).map((row) => String(row.business_slug))));
  const businessMap = new Map<string, string>();
  if (businessSlugs.length > 0) {
    const { data: users } = await supabaseServer
      .from("users")
      .select("slug, display_name")
      .in("slug", businessSlugs)
      .eq("is_deleted", false);

    for (const user of users ?? []) {
      businessMap.set(String(user.slug), String(user.display_name ?? user.slug));
    }
  }

  return (data ?? []).map((row) => ({
    id: String(row.id),
    title: String(row.title),
    message: String(row.message),
    rewardAmount: Number(row.reward_amount ?? 0),
    status: String(row.status) as ReceivedOffer["status"],
    business: {
      slug: String(row.business_slug),
      displayName: businessMap.get(String(row.business_slug)) ?? String(row.business_slug),
    },
    createdAt: String(row.created_at),
    updatedAt: String(row.updated_at),
  }));
}

export async function updateReceivedOfferStatus(profile: ProfileRecord, offerId: string, status: ReceivedOffer["status"]) {
  const { data, error } = await supabaseServer
    .from("business_offers")
    .update({ status })
    .eq("id", offerId)
    .eq("target_slug", profile.slug)
    .select("id, title, message, reward_amount, status, business_slug, created_at, updated_at")
    .single();

  if (error) {
    console.error("[updateReceivedOfferStatus]", error);
    throw new Error("オファーを更新できませんでした");
  }

  const { data: businessUser } = await supabaseServer
    .from("users")
    .select("slug, display_name")
    .eq("slug", data.business_slug)
    .maybeSingle();

  return {
    id: String(data.id),
    title: String(data.title),
    message: String(data.message),
    rewardAmount: Number(data.reward_amount ?? 0),
    status: String(data.status) as ReceivedOffer["status"],
    business: {
      slug: String(data.business_slug),
      displayName: String(businessUser?.display_name ?? data.business_slug),
    },
    createdAt: String(data.created_at),
    updatedAt: String(data.updated_at),
  } satisfies ReceivedOffer;
}

export async function recordAdEvent(params: {
  adId: string;
  businessId: number | null;
  viewerSlug?: string | null;
  eventType: "impression" | "click" | "conversion" | "sale";
  revenueAmount?: number;
  metadata?: Record<string, unknown>;
}) {
  const { error } = await supabaseServer.from("ad_events").insert({
    ad_id: params.adId,
    business_id: params.businessId,
    viewer_slug: params.viewerSlug ?? null,
    event_type: params.eventType,
    revenue_amount: params.revenueAmount ?? 0,
    metadata: params.metadata ?? {},
  });

  if (error) {
    console.error("[recordAdEvent]", error);
  }
}
