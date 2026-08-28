// features/business-monetize/constants.ts
// Business Monetization P0 — 定数のSingle Source of Truth。
// Plan / Scope / 地方ブロック / 東日本・西日本 / 料金等はここだけに定義する。

import type {
  AdScope,
  BusinessMonetizePlan,
  CampaignType,
  HalfRegion,
  RegionBlockId,
} from "./types";

// ─────────────────────────────────────────────────────────────
// Business Plans
// ─────────────────────────────────────────────────────────────
export interface MonetizePlanDef {
  id: BusinessMonetizePlan;
  monthlyPrice: number;
  priceLabel: string;
  scope: AdScope;
  /** 広告Scope选择の選択単位 */
  selectionUnit: string;
  benefits: string[];
  /** Enterpriseは個別見積（自由購入不可） */
  enterprise: boolean;
}

export const MONETIZE_PLANS: readonly MonetizePlanDef[] = [
  {
    id: "FREE",
    monthlyPrice: 0,
    priceLabel: "¥0",
    scope: "local",
    selectionUnit: "固定",
    enterprise: false,
    benefits: [
      "Business Profile掲載（最低限）",
      "実所在地のMap Pin",
      "Activity / Moment広告は利用不可",
    ],
  },
  {
    id: "LOCAL",
    monthlyPrice: 30_000,
    priceLabel: "¥30,000/月",
    scope: "local",
    selectionUnit: "1都道府県",
    enterprise: false,
    benefits: [
      "フルBusiness Profile",
      "都道府県単位の広告配信（スポーツ特化コミュニティへ）",
      "Activity / Moment広告（Standard）",
    ],
  },
  {
    id: "FEATURED",
    monthlyPrice: 100_000,
    priceLabel: "¥100,000/月",
    scope: "region",
    selectionUnit: "1地方ブロック",
    enterprise: false,
    benefits: [
      "フルBusiness Profile",
      "地方ブロック単位の広告配信",
      "Activity広告（拡大枠）/ Moment広告（画像・動画活用）",
      "優先表示",
    ],
  },
  {
    id: "PREMIUM",
    monthlyPrice: 300_000,
    priceLabel: "¥300,000/月",
    scope: "half",
    selectionUnit: "東日本 / 西日本",
    enterprise: false,
    benefits: [
      "フルBusiness Profile",
      "東日本 または 西日本の広告配信",
      "Activity広告（Premium Card）/ Moment広告（大型メディア）",
      "優先表示",
    ],
  },
  {
    id: "ENTERPRISE",
    monthlyPrice: 0,
    priceLabel: "個別見積",
    scope: "national",
    selectionUnit: "制限なし",
    enterprise: true,
    benefits: [
      "全国広告配信（制限なし）",
      "全広告タイプ・フル利用",
      "優先表示",
      "個別契約（営業ヒアリング必須）",
    ],
  },
];

export const MONETIZE_PLAN_IDS = MONETIZE_PLANS.map((p) => p.id);

export function getMonetizePlan(id: BusinessMonetizePlan | string | null | undefined): MonetizePlanDef | null {
  if (!id) return null;
  return MONETIZE_PLANS.find((p) => p.id === id) ?? null;
}

export function isMonetizePlan(value: unknown): value is BusinessMonetizePlan {
  return typeof value === "string" && MONETIZE_PLAN_IDS.includes(value as BusinessMonetizePlan);
}

// ─────────────────────────────────────────────────────────────
// Plan → Scope Rule（API/Server共通の検証にも使う）
// ─────────────────────────────────────────────────────────────
export const PLAN_TO_SCOPE: Record<BusinessMonetizePlan, AdScope> = {
  FREE: "local",
  LOCAL: "local",
  FEATURED: "region",
  PREMIUM: "half",
  ENTERPRISE: "national",
};

/**
 * 契約Planが許可するScope集合を返す。
 * Server側の受け入れ判定に必ず使う（Client改ざん対策）。
 */
export function getAllowedScopes(plan: BusinessMonetizePlan | string | null): AdScope[] {
  if (!isMonetizePlan(plan)) return [];
  return [PLAN_TO_SCOPE[plan]];
}

/** Server側：要求ScopeがPlanで許可されているか検証 */
export function isScopeAllowedForPlan(plan: BusinessMonetizePlan | string | null, scope: AdScope): boolean {
  return getAllowedScopes(plan).includes(scope);
}

// ─────────────────────────────────────────────────────────────
// Region Blocks（8ブロック）と同封の都道府県
// ─────────────────────────────────────────────────────────────
export const REGION_BLOCKS: readonly { id: RegionBlockId; label: string; prefectures: readonly string[] }[] = [
  { id: "hokkaido", label: "北海道", prefectures: ["北海道"] },
  {
    id: "tohoku",
    label: "東北",
    prefectures: ["青森県", "岩手県", "宮城県", "秋田県", "山形県", "福島県"],
  },
  {
    id: "kanto",
    label: "関東",
    prefectures: ["茨城県", "栃木県", "群馬県", "埼玉県", "千葉県", "東京都", "神奈川県"],
  },
  {
    id: "chubu",
    label: "中部",
    prefectures: ["新潟県", "富山県", "石川県", "福井県", "山梨県", "長野県", "岐阜県", "静岡県", "愛知県"],
  },
  {
    id: "kinki",
    label: "近畿",
    prefectures: ["三重県", "滋賀県", "京都府", "大阪府", "兵庫県", "奈良県", "和歌山県"],
  },
  {
    id: "chugoku",
    label: "中国",
    prefectures: ["鳥取県", "島根県", "岡山県", "広島県", "山口県"],
  },
  { id: "shikoku", label: "四国", prefectures: ["徳島県", "香川県", "愛媛県", "高知県"] },
  {
    id: "kyushu_okinawa",
    label: "九州・沖縄",
    prefectures: ["福岡県", "佐賀県", "長崎県", "熊本県", "大分県", "宮崎県", "鹿児島県", "沖縄県"],
  },
];

export const HALF_REGIONS: readonly { id: HalfRegion; label: string; blocks: readonly RegionBlockId[] }[] = [
  { id: "east", label: "東日本", blocks: ["hokkaido", "tohoku", "kanto", "chubu"] },
  { id: "west", label: "西日本", blocks: ["kinki", "chugoku", "shikoku", "kyushu_okinawa"] },
];

export function getRegionBlock(id: RegionBlockId | string | null): (typeof REGION_BLOCKS)[number] | null {
  if (!id) return null;
  return REGION_BLOCKS.find((b) => b.id === id) ?? null;
}

export function getHalfRegion(id: HalfRegion | string | null): (typeof HALF_REGIONS)[number] | null {
  if (!id) return null;
  return HALF_REGIONS.find((h) => h.id === id) ?? null;
}

export function isRegionBlockId(value: unknown): value is RegionBlockId {
  return typeof value === "string" && REGION_BLOCKS.some((b) => b.id === value);
}

export function isHalfRegion(value: unknown): value is HalfRegion {
  return typeof value === "string" && HALF_REGIONS.some((h) => h.id === value);
}

/** 都道府県 → 地方ブロック検索 */
export function regionBlockForPrefecture(prefecture: string): RegionBlockId | null {
  return REGION_BLOCKS.find((b) => (b.prefectures as readonly string[]).includes(prefecture))?.id ?? null;
}

/** 地方ブロック → 東日本/西日本 */
export function halfRegionForBlock(block: RegionBlockId): HalfRegion | null {
  return HALF_REGIONS.find((h) => h.blocks.includes(block))?.id ?? null;
}

// ─────────────────────────────────────────────────────────────
// Campaign Types（Activity / Moment）
// ─────────────────────────────────────────────────────────────
export const CAMPAIGN_TYPES: readonly { id: CampaignType; label: string }[] = [
  { id: "activity", label: "Activity広告" },
  { id: "moment", label: "Moment広告" },
];

/** 各Planで利用可能なCampaignタイプ（FREEは利用不可 → 空配列） */
export const CAMPAIGN_TYPES_BY_PLAN: Record<BusinessMonetizePlan, readonly CampaignType[]> = {
  FREE: [],
  LOCAL: ["activity", "moment"],
  FEATURED: ["activity", "moment"],
  PREMIUM: ["activity", "moment"],
  ENTERPRISE: ["activity", "moment"],
};

export function getAllowedCampaignTypes(plan: BusinessMonetizePlan | string | null): readonly CampaignType[] {
  if (!isMonetizePlan(plan)) return [];
  return CAMPAIGN_TYPES_BY_PLAN[plan];
}

// ─────────────────────────────────────────────────────────────
// Map Pin表現（Plan別。位置は常に実所在地）
// ─────────────────────────────────────────────────────────────
export const PLAN_PIN_SIZE: Record<BusinessMonetizePlan, number> = {
  FREE: 10,
  LOCAL: 14,
  FEATURED: 18,
  PREMIUM: 22,
  ENTERPRISE: 26,
};

/** FEATURED以上はSpotlight表示 / Premium Sheet等の表現を有効化 */
export function planHasSpotlight(plan: BusinessMonetizePlan | string | null): boolean {
  return plan === "FEATURED" || plan === "PREMIUM" || plan === "ENTERPRISE";
}

export function planIsPremiumOrAbove(plan: BusinessMonetizePlan | string | null): boolean {
  return plan === "PREMIUM" || plan === "ENTERPRISE";
}

// ─────────────────────────────────────────────────────────────
// 料金表ラベル（表示用オーバーレイ。金額は MONETIZE_PLANS が正）
// ─────────────────────────────────────────────────────────────
export const PLAN_PRICE_LABEL: Record<BusinessMonetizePlan, string> = Object.fromEntries(
  MONETIZE_PLANS.map((p) => [p.id, p.priceLabel]),
) as Record<BusinessMonetizePlan, string>;

/** Scopeの表示ラベル */
export const AD_SCOPE_LABEL: Record<AdScope, string> = {
  local: "都道府県",
  region: "地方",
  half: "東日本 / 西日本",
  national: "全国",
};

/** 人間向けの配信範囲メタ（アイコン + 説明）。技術情報はUIに見せない。 */
export const SCOPE_META: Record<AdScope, { icon: string; label: string; description: string }> = {
  local: { icon: "📍", label: "都道府県", description: "特定の1都道府県内のユーザーへ届きます" },
  region: { icon: "🗾", label: "地方ブロック", description: "関東・東北など、その地方のユーザーへ届きます" },
  half: { icon: "🗾", label: "東日本 / 西日本", description: "東日本または西日本の広い地域へ届きます" },
  national: { icon: "🌐", label: "全国", description: "全国のユーザーへ届きます" },
};

/** 人間向けのプラン表示名（内部PlanコードはUIに出さない） */
export const PLAN_LABEL: Record<BusinessMonetizePlan, string> = {
  FREE: "無料",
  LOCAL: "ローカル",
  FEATURED: "フィーチャード",
  PREMIUM: "プレミアム",
  ENTERPRISE: "エンタープライズ",
};

/** プランの配信範囲（人間向け表示用） */
export function planScopeLabel(plan: BusinessMonetizePlan | string | null | undefined): string {
  const def = getMonetizePlan(plan);
  return def ? SCOPE_META[def.scope].label : "-";
}

/**
 * 新モネタイズPlan → 既存の広告枠（ad_slots.tier / legacy PlanId）対応。
 * 広告枠表示（P1-3）で getPlansWithAdSlotAvailability の在庫に紐付けるために使う。
 * API / 決済とは無関係の表示用マッピング。FREEは広告枠を持たないためnull。
 */
export const MONETIZE_TO_AD_SLOT_TIER: Record<BusinessMonetizePlan, string | null> = {
  FREE: null,
  LOCAL: "roots",
  FEATURED: "signal",
  PREMIUM: "presence",
  ENTERPRISE: "legacy",
};
