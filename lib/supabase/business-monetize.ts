// lib/supabase/business-monetize.ts
// Server-side data access for Business Monetization P0.
// Writes go through supabaseServer (service role, RLS bypass). Therefore
// this module MUST enforce ownership / plan / scope / status itself.

import { supabaseServer as supabase } from "@/lib/supabase/server";
import { findUserBySlug } from "@/lib/supabase/data/users.server";
import type { ProfileRecord } from "@/lib/supabase/data/users.server";
import type {
  AdScope,
  BusinessAccountRecord,
  BusinessLocationRecord,
  BusinessMonetizePlan,
  BusinessMonetizeStatus,
  CampaignRecord,
  CampaignStatus,
  CampaignType,
  HalfRegion,
  RegionBlockId,
} from "@/features/business-monetize/types";
import {
  isMonetizePlan,
  isScopeAllowedForPlan,
  getAllowedCampaignTypes,
  PLAN_TO_SCOPE,
  regionBlockForPrefecture,
  halfRegionForBlock,
} from "@/features/business-monetize/constants";

type AccountRow = Record<string, unknown>;
type LocationRow = Record<string, unknown>;
type CampaignRow = Record<string, unknown>;

function mapAccount(row: AccountRow): BusinessAccountRecord {
  return {
    id: String(row.id),
    userId: Number(row.user_id),
    slug: String(row.slug ?? ""),
    displayName: String(row.display_name ?? ""),
    plan: isMonetizePlan(row.plan) ? row.plan : "FREE",
    status: (String(row.status) as BusinessMonetizeStatus) ?? "free",
    primaryPrefecture: row.primary_prefecture ? String(row.primary_prefecture) : null,
    createdAt: String(row.created_at),
    updatedAt: String(row.updated_at),
  };
}

function mapLocation(row: LocationRow): BusinessLocationRecord {
  return {
    id: String(row.id),
    accountId: String(row.account_id),
    name: String(row.name ?? ""),
    prefecture: String(row.prefecture ?? ""),
    address: row.address ? String(row.address) : null,
    latitude: Number(row.latitude),
    longitude: Number(row.longitude),
    hours: row.hours ? String(row.hours) : null,
    phone: row.phone ? String(row.phone) : null,
    website: row.website ? String(row.website) : null,
    createdAt: String(row.created_at),
    updatedAt: String(row.updated_at),
  };
}

function mapCampaign(row: CampaignRow): CampaignRecord {
  const creative = (row.creative as Record<string, unknown>) ?? {};
  return {
    id: String(row.id),
    accountId: String(row.account_id),
    name: String(row.name ?? ""),
    type: (String(row.type) as CampaignType) ?? "activity",
    scope: (String(row.scope) as AdScope) ?? "local",
    regionBlock: row.region_block ? (String(row.region_block) as RegionBlockId) : null,
    half: row.half ? (String(row.half) as HalfRegion) : null,
    prefecture: row.prefecture ? String(row.prefecture) : null,
    locationTarget: String(row.location_target ?? "all") === "specific" ? "specific" : "all",
    locationId: row.location_id ? String(row.location_id) : null,
    creative: {
      title: String(creative.title ?? ""),
      description: creative.description ? String(creative.description) : null,
      imageUrl: creative.image_url ? String(creative.image_url) : null,
      videoUrl: creative.video_url ? String(creative.video_url) : null,
      ctaText: creative.cta_text ? String(creative.cta_text) : null,
      ctaUrl: creative.cta_url ? String(creative.cta_url) : null,
    },
    status: (String(row.status) as CampaignStatus) ?? "draft",
    startedAt: row.started_at ? String(row.started_at) : null,
    endedAt: row.ended_at ? String(row.ended_at) : null,
    createdAt: String(row.created_at),
    updatedAt: String(row.updated_at),
  };
}

// ─────────────────────────────────────────────────────────────
// Account
// ─────────────────────────────────────────────────────────────
/**
 * Business Account（契約）を照会。なければ自動でFREEを作る。
 * server側ではここが plan / status の真実の一次情報。
 */
export async function ensureBusinessAccount(profile: ProfileRecord): Promise<BusinessAccountRecord> {
  const { data, error } = await supabase
    .from("business_accounts")
    .select("id, user_id, plan, status, primary_prefecture, created_at, updated_at")
    .eq("user_id", profile.id)
    .maybeSingle();

  if (error) throw new Error("ACCOUNT_QUERY_FAILED");

  if (data) {
    const { data: user } = await supabase
      .from("users")
      .select("slug, display_name")
      .eq("id", profile.id)
      .single();
    return mapAccount({ ...data, slug: user?.slug ?? profile.slug, display_name: user?.display_name ?? profile.displayName ?? profile.slug });
  }

  const { data: inserted, error: insertError } = await supabase
    .from("business_accounts")
    .insert({
      user_id: profile.id,
      plan: "FREE",
      status: "free",
      primary_prefecture: profile.prefecture ?? null,
    })
    .select("id, user_id, plan, status, primary_prefecture, created_at, updated_at")
    .single();

  if (insertError) {
    // 既に作成済み（競合）の場合のフォールバック
    if (insertError.code === "23505") {
      return ensureBusinessAccount(profile);
    }
    throw new Error("ACCOUNT_CREATE_FAILED");
  }

  return mapAccount({
    ...inserted,
    slug: profile.slug,
    display_name: profile.displayName ?? profile.slug,
  });
}

export async function getAccount(accountId: string): Promise<BusinessAccountRecord | null> {
  const { data, error } = await supabase
    .from("business_accounts")
    .select("id, user_id, plan, status, primary_prefecture, created_at, updated_at")
    .eq("id", accountId)
    .maybeSingle();
  if (error || !data) return null;
  const { data: user } = await supabase
    .from("users")
    .select("slug, display_name")
    .eq("id", data.user_id)
    .single();
  return mapAccount({ ...data, slug: user?.slug ?? "", display_name: user?.display_name ?? "" });
}

/** Admin専用: Plan/Statusの付与・変更（契約反映・Enterprise付与など） */
export async function updateAccountPlan(
  accountId: string,
  update: { plan?: BusinessMonetizePlan; status?: BusinessMonetizeStatus; primaryPrefecture?: string | null },
): Promise<BusinessAccountRecord | null> {
  const patch: Record<string, unknown> = {};
  if (update.plan !== undefined) {
    if (!isMonetizePlan(update.plan)) throw new Error("INVALID_PLAN");
    patch.plan = update.plan;
  }
  if (update.status !== undefined) patch.status = update.status;
  if (update.primaryPrefecture !== undefined) patch.primary_prefecture = update.primaryPrefecture;

  const { data, error } = await supabase
    .from("business_accounts")
    .update(patch)
    .eq("id", accountId)
    .select("id, user_id, plan, status, primary_prefecture, created_at, updated_at")
    .single();
  if (error || !data) throw new Error("ACCOUNT_UPDATE_FAILED");
  const { data: user } = await supabase
    .from("users")
    .select("slug, display_name")
    .eq("id", data.user_id)
    .single();
  return mapAccount({ ...data, slug: user?.slug ?? "", display_name: user?.display_name ?? "" });
}

// ─────────────────────────────────────────────────────────────
// Payment → Activation（Square Webhook 決済完了から呼ばれる）
// ─────────────────────────────────────────────────────────────
/**
 * LegacyプランID → 新モネタイズプランへ変換。
 * 判断材料は金額一致（roots=LOCAL ¥30k / signal=FEATURED ¥100k /
 * presence=PREMIUM ¥300k / legacy=ENTERPRISE 個別見積）。
 */
const LEGACY_PLAN_TO_MONETIZE: Record<string, BusinessMonetizePlan> = {
  roots: "LOCAL",
  signal: "FEATURED",
  presence: "PREMIUM",
  legacy: "ENTERPRISE",
};

export function monetizePlanFromLegacyPlanId(planId: string): BusinessMonetizePlan | null {
  return LEGACY_PLAN_TO_MONETIZE[planId] ?? null;
}

/**
 * Square決済COMPLETED後にBusiness Accountを有料プランでactivateする。
 * 紐付けは既存IDで安全に行う（推測しない）:
 *   order.slug → users.id → business_accounts.user_id
 * 行が無ければ作成し、あれば更新する。取り得るPlan/statusの再設定は冪等
 * （二重activation・誤ったplan変更を起こさない）。
 */
export async function activateAccountBySlug(
  slug: string,
  plan: BusinessMonetizePlan,
  primaryPrefecture?: string | null,
): Promise<boolean> {
  if (!isMonetizePlan(plan)) return false;
  const user = await findUserBySlug(slug);
  if (!user) return false;

  const { data: existing, error: findError } = await supabase
    .from("business_accounts")
    .select("id")
    .eq("user_id", user.id)
    .maybeSingle();
  if (findError) return false;

  if (existing) {
    const patch: Record<string, unknown> = { plan, status: "active" };
    if (primaryPrefecture) patch.primary_prefecture = primaryPrefecture;
    const { error } = await supabase
      .from("business_accounts")
      .update(patch)
      .eq("id", existing.id)
      .eq("user_id", user.id);
    return !error;
  }

  const { error: insertError } = await supabase
    .from("business_accounts")
    .insert({
      user_id: user.id,
      plan,
      status: "active",
      primary_prefecture: primaryPrefecture ?? null,
    });
  return !insertError;
}

// ─────────────────────────────────────────────────────────────
// Locations（多店舗・親子）
// ─────────────────────────────────────────────────────────────
export async function listLocations(accountId: string): Promise<BusinessLocationRecord[]> {
  const { data, error } = await supabase
    .from("business_locations")
    .select("*")
    .eq("account_id", accountId)
    .order("created_at", { ascending: true });
  if (error) throw new Error("LOCATIONS_QUERY_FAILED");
  return (data ?? []).map(mapLocation);
}

export async function createLocation(
  accountId: string,
  input: {
    name: string;
    prefecture: string;
    address?: string | null;
    latitude: number;
    longitude: number;
    hours?: string | null;
    phone?: string | null;
    website?: string | null;
  },
): Promise<BusinessLocationRecord> {
  const { data, error } = await supabase
    .from("business_locations")
    .insert({
      account_id: accountId,
      name: input.name,
      prefecture: input.prefecture,
      address: input.address ?? null,
      latitude: input.latitude,
      longitude: input.longitude,
      hours: input.hours ?? null,
      phone: input.phone ?? null,
      website: input.website ?? null,
    })
    .select("*")
    .single();
  if (error || !data) throw new Error("LOCATION_CREATE_FAILED");
  return mapLocation(data);
}

export async function updateLocation(
  accountId: string,
  locationId: string,
  input: Partial<{
    name: string;
    prefecture: string;
    address: string | null;
    latitude: number;
    longitude: number;
    hours: string | null;
    phone: string | null;
    website: string | null;
  }>,
): Promise<BusinessLocationRecord | null> {
  const patch: Record<string, unknown> = {};
  if (input.name !== undefined) patch.name = input.name;
  if (input.prefecture !== undefined) patch.prefecture = input.prefecture;
  if (input.address !== undefined) patch.address = input.address;
  if (input.latitude !== undefined) patch.latitude = input.latitude;
  if (input.longitude !== undefined) patch.longitude = input.longitude;
  if (input.hours !== undefined) patch.hours = input.hours;
  if (input.phone !== undefined) patch.phone = input.phone;
  if (input.website !== undefined) patch.website = input.website;

  const { data, error } = await supabase
    .from("business_locations")
    .update(patch)
    .eq("id", locationId)
    .eq("account_id", accountId)
    .select("*")
    .single();
  if (error || !data) throw new Error("LOCATION_UPDATE_FAILED");
  return mapLocation(data);
}

export async function deleteLocation(accountId: string, locationId: string): Promise<boolean> {
  const { error } = await supabase
    .from("business_locations")
    .delete()
    .eq("id", locationId)
    .eq("account_id", accountId);
  if (error) throw new Error("LOCATION_DELETE_FAILED");
  return true;
}

// ─────────────────────────────────────────────────────────────
// Campaigns（CRUD + Publish/Pause + Scope検証）
// ─────────────────────────────────────────────────────────────
export interface SaveCampaignInput {
  name: string;
  type: CampaignType;
  scope: AdScope;
  regionBlock?: RegionBlockId | null;
  half?: HalfRegion | null;
  prefecture?: string | null;
  locationTarget: "all" | "specific";
  locationId?: string | null;
  creative: {
    title: string;
    description?: string | null;
    imageUrl?: string | null;
    videoUrl?: string | null;
    ctaText?: string | null;
    ctaUrl?: string | null;
  };
}

function validateCreative(input: SaveCampaignInput["creative"]) {
  if (!input.title || !input.title.trim()) throw new Error("CREATIVE_TITLE_REQUIRED");
  if (input.title.length > 80) throw new Error("CREATIVE_TITLE_TOO_LONG");
  if (input.description && input.description.length > 280) throw new Error("CREATIVE_DESC_TOO_LONG");
}

/** Server側のScope検証: 契約Planが要求Scopeを許可しているか */
function assertScopeAllowed(plan: BusinessMonetizePlan, scope: AdScope) {
  if (!isScopeAllowedForPlan(plan, scope)) {
    throw new Error("SCOPE_NOT_ALLOWED");
  }
}

/** Server側のCampaign種別検証: PlanがActivity/Momentを許可しているか（FREE不可） */
function assertCampaignTypeAllowed(plan: BusinessMonetizePlan, type: CampaignType) {
  if (!getAllowedCampaignTypes(plan).includes(type)) {
    throw new Error("CAMPAIGN_TYPE_NOT_ALLOWED");
  }
}

function assertAccountActive(account: BusinessAccountRecord) {
  if (account.plan === "FREE") throw new Error("PLAN_REQUIRED");
  if (account.status !== "active") throw new Error("BUSINESS_INACTIVE");
}

export async function listCampaigns(accountId: string): Promise<CampaignRecord[]> {
  const { data, error } = await supabase
    .from("business_campaigns")
    .select("*")
    .eq("account_id", accountId)
    .order("created_at", { ascending: false });
  if (error) throw new Error("CAMPAIGNS_QUERY_FAILED");
  return (data ?? []).map(mapCampaign);
}

export async function getCampaign(accountId: string, campaignId: string): Promise<CampaignRecord | null> {
  const { data, error } = await supabase
    .from("business_campaigns")
    .select("*")
    .eq("id", campaignId)
    .eq("account_id", accountId)
    .maybeSingle();
  if (error) return null;
  return data ? mapCampaign(data) : null;
}

/** 公開（active）のCampaignを返す（ユーザー向け広告表示）。 */
export async function listActiveCampaigns(): Promise<CampaignRecord[]> {
  const { data, error } = await supabase
    .from("business_campaigns")
    .select("*")
    .eq("status", "active")
    .order("created_at", { ascending: false });
  if (error) return [];
  return (data ?? []).map(mapCampaign);
}

export async function createCampaign(
  account: BusinessAccountRecord,
  input: SaveCampaignInput,
): Promise<CampaignRecord> {
  assertAccountActive(account);
  assertCampaignTypeAllowed(account.plan, input.type);
  assertScopeAllowed(account.plan, input.scope);
  validateCreative(input.creative);

  // Palette at Server: scopeに応じた詳細項目の整合性チェック
  if (input.scope === "region" && !input.regionBlock) {
    throw new Error("REGION_REQUIRED");
  }
  if (input.scope === "half" && !input.half) {
    throw new Error("HALF_REQUIRED");
  }
  if (input.scope === "local" && !input.prefecture) {
    throw new Error("PREFECTURE_REQUIRED");
  }
  if (input.locationTarget === "specific" && !input.locationId) {
    throw new Error("LOCATION_REQUIRED");
  }

  const creative = {
    title: input.creative.title,
    description: input.creative.description ?? null,
    image_url: input.creative.imageUrl ?? null,
    video_url: input.creative.videoUrl ?? null,
    cta_text: input.creative.ctaText ?? null,
    cta_url: input.creative.ctaUrl ?? null,
  };

  const { data, error } = await supabase
    .from("business_campaigns")
    .insert({
      account_id: account.id,
      name: input.name,
      type: input.type,
      scope: input.scope,
      region_block: input.regionBlock ?? null,
      half: input.half ?? null,
      prefecture: input.prefecture ?? (input.locationTarget === "specific" || account.primaryPrefecture ? (account.primaryPrefecture ?? null) : null),
      location_target: input.locationTarget,
      location_id: input.locationId ?? null,
      creative,
      status: "draft",
    })
    .select("*")
    .single();
  if (error || !data) throw new Error("CAMPAIGN_CREATE_FAILED");
  return mapCampaign(data);
}

export async function updateCampaign(
  account: BusinessAccountRecord,
  campaignId: string,
  input: Partial<SaveCampaignInput>,
): Promise<CampaignRecord | null> {
  const existing = await getCampaign(account.id, campaignId);
  if (!existing) throw new Error("CAMPAIGN_NOT_FOUND");
  // 公開後（active）の内容編集は不可（pause後のみ可）
  if (existing.status === "active") throw new Error("CAMPAIGN_ACTIVE");

  const patch: Record<string, unknown> = {};

  if (input.name !== undefined) {
    if (!input.name.trim()) throw new Error("NAME_REQUIRED");
    patch.name = input.name;
  }
  if (input.type !== undefined) {
    assertCampaignTypeAllowed(account.plan, input.type);
    patch.type = input.type;
  }
  if (input.scope !== undefined) {
    assertScopeAllowed(account.plan, input.scope);
    patch.scope = input.scope;
    if (input.scope === "region" && !input.regionBlock) throw new Error("REGION_REQUIRED");
    if (input.scope === "half" && !input.half) throw new Error("HALF_REQUIRED");
    if (input.scope === "local" && !input.prefecture) throw new Error("PREFECTURE_REQUIRED");
  }
  if (input.regionBlock !== undefined) patch.region_block = input.regionBlock ?? null;
  if (input.half !== undefined) patch.half = input.half ?? null;
  if (input.prefecture !== undefined) patch.prefecture = input.prefecture ?? null;
  if (input.locationTarget !== undefined) {
    patch.location_target = input.locationTarget;
    if (input.locationTarget === "specific" && !input.locationId) throw new Error("LOCATION_REQUIRED");
  }
  if (input.locationId !== undefined) patch.location_id = input.locationId ?? null;
  if (input.creative !== undefined) {
    validateCreative(input.creative);
    patch.creative = {
      title: input.creative.title,
      description: input.creative.description ?? null,
      image_url: input.creative.imageUrl ?? null,
      video_url: input.creative.videoUrl ?? null,
      cta_text: input.creative.ctaText ?? null,
      cta_url: input.creative.ctaUrl ?? null,
    };
  }

  const { data, error } = await supabase
    .from("business_campaigns")
    .update(patch)
    .eq("id", campaignId)
    .eq("account_id", account.id)
    .select("*")
    .single();
  if (error || !data) throw new Error("CAMPAIGN_UPDATE_FAILED");
  return mapCampaign(data);
}

export async function deleteCampaign(accountId: string, campaignId: string): Promise<boolean> {
  const existing = await getCampaign(accountId, campaignId);
  if (!existing) throw new Error("CAMPAIGN_NOT_FOUND");
  if (existing.status === "active") throw new Error("CAMPAIGN_ACTIVE");
  const { error } = await supabase
    .from("business_campaigns")
    .delete()
    .eq("id", campaignId)
    .eq("account_id", accountId);
  if (error) throw new Error("CAMPAIGN_DELETE_FAILED");
  return true;
}

/**
 * Publish: draft/paused → active。
 * Publish前に必ず ownership / status / plan / type / scope / required fields を検証する。
 */
export async function publishCampaign(account: BusinessAccountRecord, campaignId: string): Promise<CampaignRecord> {
  assertAccountActive(account);
  const existing = await getCampaign(account.id, campaignId);
  if (!existing) throw new Error("CAMPAIGN_NOT_FOUND");
  if (existing.status === "ended") throw new Error("CAMPAIGN_ENDED");

  assertCampaignTypeAllowed(account.plan, existing.type);
  assertScopeAllowed(account.plan, existing.scope);
  validateCreative(existing.creative);
  if (existing.scope === "region" && !existing.regionBlock) throw new Error("REGION_REQUIRED");
  if (existing.scope === "half" && !existing.half) throw new Error("HALF_REQUIRED");
  if (existing.scope === "local" && !existing.prefecture) throw new Error("PREFECTURE_REQUIRED");
  if (existing.locationTarget === "specific" && !existing.locationId) throw new Error("LOCATION_REQUIRED");

  const { data, error } = await supabase
    .from("business_campaigns")
    .update({
      status: "active",
      started_at: new Date().toISOString(),
      ended_at: null,
    })
    .eq("id", campaignId)
    .eq("account_id", account.id)
    .select("*")
    .single();
  if (error || !data) throw new Error("CAMPAIGN_PUBLISH_FAILED");
  return mapCampaign(data);
}

export async function pauseCampaign(account: BusinessAccountRecord, campaignId: string): Promise<CampaignRecord> {
  const existing = await getCampaign(account.id, campaignId);
  if (!existing) throw new Error("CAMPAIGN_NOT_FOUND");
  if (existing.status !== "active") throw new Error("CAMPAIGN_NOT_ACTIVE");
  const { data, error } = await supabase
    .from("business_campaigns")
    .update({
      status: "paused",
      ended_at: new Date().toISOString(),
    })
    .eq("id", campaignId)
    .eq("account_id", account.id)
    .select("*")
    .single();
  if (error || !data) throw new Error("CAMPAIGN_PAUSE_FAILED");
  return mapCampaign(data);
}

export async function endCampaign(account: BusinessAccountRecord, campaignId: string): Promise<CampaignRecord> {
  const existing = await getCampaign(account.id, campaignId);
  if (!existing) throw new Error("CAMPAIGN_NOT_FOUND");
  const { data, error } = await supabase
    .from("business_campaigns")
    .update({
      status: "ended",
      ended_at: new Date().toISOString(),
    })
    .eq("id", campaignId)
    .eq("account_id", account.id)
    .select("*")
    .single();
  if (error || !data) throw new Error("CAMPAIGN_END_FAILED");
  return mapCampaign(data);
}

/** 現Planがデフォルト許可するScope（Hub表示用） */
export function defaultScopeForPlan(plan: BusinessMonetizePlan): AdScope {
  return PLAN_TO_SCOPE[plan] ?? "local";
}

// ─────────────────────────────────────────────────────────────
// Public exposure（ユーザー向け広告表示 / Map Pin用）
// ─────────────────────────────────────────────────────────────
export interface ActiveCampaignWithBusiness extends CampaignRecord {
  business: {
    slug: string;
    displayName: string;
    plan: BusinessMonetizePlan;
    status: BusinessMonetizeStatus;
  };
  location: {
    name: string;
    prefecture: string;
    latitude: number;
    longitude: number;
  } | null;
}

/**
 * 公開（active）のCampaignを、Business情報・所在地座標と合わせて返す。
 * Map Pinの座標は必ず実店舗（business_locations）の実座標。
 * local scope（FREE/LOCAL）は該当都道府県で絞る。
 */
export async function listPublicCampaigns(options?: { prefecture?: string | null; limit?: number }): Promise<ActiveCampaignWithBusiness[]> {
  let query = supabase
    .from("business_campaigns")
    .select("id, account_id, name, type, scope, region_block, half, prefecture, location_target, location_id, creative, status, started_at, ended_at, created_at, updated_at")
    .eq("status", "active");

  if (options?.prefecture) {
    query = query.eq("prefecture", options.prefecture);
  }

  const { data, error } = await query.order("created_at", { ascending: false }).limit(Math.min(options?.limit ?? 20, 50));
  if (error || !data) return [];

  const accountIds = Array.from(new Set(data.map((r) => String(r.account_id))));
  const accountMap = new Map<string, { user_id: number; plan: string; status: string }>();
  if (accountIds.length > 0) {
    const { data: accounts } = await supabase
      .from("business_accounts")
      .select("id, user_id, plan, status")
      .in("id", accountIds);
    for (const a of accounts ?? []) {
      accountMap.set(String(a.id), { user_id: Number(a.user_id), plan: String(a.plan), status: String(a.status) });
    }
  }

  const userIds = Array.from(new Set([...accountMap.values()].map((a) => a.user_id)));
  const userMap = new Map<number, { slug: string; display_name: string }>();
  if (userIds.length > 0) {
    const { data: users } = await supabase
      .from("users")
      .select("id, slug, display_name")
      .in("id", userIds)
      .eq("is_deleted", false);
    for (const u of users ?? []) {
      userMap.set(Number(u.id), { slug: String(u.slug), display_name: String(u.display_name ?? u.slug) });
    }
  }

  const locationIds = Array.from(new Set(data.map((r) => (r.location_id ? String(r.location_id) : "")).filter(Boolean)));
  const locationMap = new Map<string, { name: string; prefecture: string; latitude: number; longitude: number }>();
  if (locationIds.length > 0) {
    const { data: locations } = await supabase
      .from("business_locations")
      .select("id, name, prefecture, latitude, longitude")
      .in("id", locationIds);
    for (const l of locations ?? []) {
      locationMap.set(String(l.id), {
        name: String(l.name),
        prefecture: String(l.prefecture),
        latitude: Number(l.latitude),
        longitude: Number(l.longitude),
      });
    }
  }

  const results: ActiveCampaignWithBusiness[] = [];
  for (const row of data) {
    const accountId = String(row.account_id);
    const acc = accountMap.get(accountId);
    const user = acc ? userMap.get(acc.user_id) : undefined;
    const loc = row.location_id ? locationMap.get(String(row.location_id)) : undefined;

    results.push({
      ...mapCampaign(row),
      business: {
        slug: user?.slug ?? "",
        displayName: user?.display_name ?? "",
        plan: isMonetizePlan(acc?.plan) ? acc.plan : "FREE",
        status: (String(acc?.status ?? "free") as BusinessMonetizeStatus) ?? "free",
      },
      location: loc ?? null,
    });
  }
  return results;
}

// ─────────────────────────────────────────────────────────────
// 広告（バナー等）配信：active Campaign × active有料Businessのみ。
// scopeターゲティング・プラン優先順位・ローテーションはserver側で判定
// （Clientから表示可否を迂回できない）。
// ─────────────────────────────────────────────────────────────
export interface PublicAd extends ActiveCampaignWithBusiness {}

const AD_PLAN_PRIORITY: Record<string, number> = {
  ENTERPRISE: 0,
  PREMIUM: 1,
  FEATURED: 2,
  LOCAL: 3,
};

/** ローテーション用シード。1時間単位で先頭広告を変え、同一プラン内の独占を防ぐ。 */
function adRotationHour(): number {
  return Math.floor(Date.now() / 3_600_000);
}

/**
 * 表示対象の広告（active Campaign）を返す。
 * @param prefecture 閲覧者の都道府県（server側で解決済み）。nullならnational系のみ。
 *   - national (ENTERPRISE): 常時
 *   - half (PREMIUM)      : 閲覧者の東/西日本ブロックと一致
 *   - region (FEATURED)   : 閲覧者の地方ブロックと一致
 *   - local (LOCAL)       : 閲覧者の都道府県と一致
 * 優先順位: ENTERPRISE > PREMIUM > FEATURED > LOCAL。
 * 同一プラン内は時間ベースでローテーションし、特定Businessが先頭を独占しない。
 * 未購入 / 期限切れ / 無効（status!=='active'）Businessは表示対象外。
 */
export async function listPublicAds(options?: { prefecture?: string | null; limit?: number }): Promise<PublicAd[]> {
  const prefecture = options?.prefecture ?? null;
  const limit = Math.min(Math.max(options?.limit ?? 10, 1), 20);

  const campaigns = await listPublicCampaigns({ prefecture: null, limit: 50 });
  if (campaigns.length === 0) return [];

  // TASK8: 有効な有料Plan（active）のみ。FREE / inactive（期限切れ・無効）は除外。
  const eligible = campaigns.filter((c) => {
    if (c.business.status !== "active") return false;
    return c.business.plan === "LOCAL" || c.business.plan === "FEATURED" || c.business.plan === "PREMIUM" || c.business.plan === "ENTERPRISE";
  });
  if (eligible.length === 0) return [];

  // TASK10: scopeターゲティング（既存のprefecture→region→halfチェーンを再利用）。
  const block = prefecture ? regionBlockForPrefecture(prefecture) : null;
  const half = block ? halfRegionForBlock(block) : null;
  const scoped = eligible.filter((c) => {
    if (!prefecture) {
      // N04: 閲覧者の地域が不明な場合は、広域広告（national / half / region）を救済表示する。
      // 都道府県単位の local 広告は「地域不明」に無条件配信せず、対象外にする（商品価値維持）。
      return c.scope === "national" || c.scope === "half" || c.scope === "region";
    }
    switch (c.scope) {
      case "national":
        return true;
      case "half":
        return Boolean(c.half && half && c.half === half);
      case "region":
        return Boolean(c.regionBlock && block && c.regionBlock === block);
      case "local":
        return Boolean(c.prefecture === prefecture);
      default:
        return false;
    }
  });
  if (scoped.length === 0) return [];

  // TASK9: プラン優先順位で安定ソート → プラン毎に時間ベースでローテーション。
  const sorted = [...scoped].sort((a, b) => (AD_PLAN_PRIORITY[a.business.plan] ?? 9) - (AD_PLAN_PRIORITY[b.business.plan] ?? 9));
  const grouped = new Map<string, PublicAd[]>();
  for (const ad of sorted) {
    const arr = grouped.get(ad.business.plan) ?? [];
    arr.push(ad);
    grouped.set(ad.business.plan, arr);
  }
  const result: PublicAd[] = [];
  for (const plan of ["ENTERPRISE", "PREMIUM", "FEATURED", "LOCAL"]) {
    const group = grouped.get(plan);
    if (!group || group.length === 0) continue;
    const offset = adRotationHour() % group.length;
    result.push(...group.slice(offset), ...group.slice(0, offset));
  }
  return result.slice(0, limit);
}

/** Map Pin描画用：有料Business（LOCAL以上）の全ての実店舗座標を返す。 */
export async function listBusinessMapPins(): Promise<
  { slug: string; displayName: string; plan: BusinessMonetizePlan; latitude: number; longitude: number; locationName: string; prefecture: string }[]
> {
  const { data: accounts, error: accountError } = await supabase
    .from("business_accounts")
    .select("id, user_id, plan")
    .in("plan", ["LOCAL", "FEATURED", "PREMIUM", "ENTERPRISE"]);
  if (accountError || !accounts) return [];

  const accountIds = accounts.map((a) => String(a.id));
  const accountIdToPlan = new Map(accountIds.map((id, i) => [id, accounts[i].plan as BusinessMonetizePlan]));

  const { data: locations } = await supabase
    .from("business_locations")
    .select("account_id, name, prefecture, latitude, longitude")
    .in("account_id", accountIds);

  const userIds = accounts.map((a) => Number(a.user_id));
  const userMap = new Map<number, { slug: string; display_name: string }>();
  if (userIds.length > 0) {
    const { data: users } = await supabase
      .from("users")
      .select("id, slug, display_name")
      .in("id", userIds)
      .eq("is_deleted", false);
    for (const u of users ?? []) {
      userMap.set(Number(u.id), { slug: String(u.slug), display_name: String(u.display_name ?? u.slug) });
    }
  }

  const pins: { slug: string; displayName: string; plan: BusinessMonetizePlan; latitude: number; longitude: number; locationName: string; prefecture: string }[] = [];
  for (const l of locations ?? []) {
    const accountId = String(l.account_id);
    const plan = accountIdToPlan.get(accountId);
    const userId = accounts.find((a) => String(a.id) === accountId)?.user_id;
    const user = userId != null ? userMap.get(Number(userId)) : undefined;
    pins.push({
      slug: user?.slug ?? "",
      displayName: user?.display_name ?? user?.slug ?? "",
      plan: plan ?? "LOCAL",
      latitude: Number(l.latitude),
      longitude: Number(l.longitude),
      locationName: String(l.name),
      prefecture: String(l.prefecture),
    });
  }
  return pins;
}
