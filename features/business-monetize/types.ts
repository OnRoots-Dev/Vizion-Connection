// features/business-monetize/types.ts
// Business Monetization P0 — ドメイン型のSingle Source of Truth。
// 各画面・API・DBはここから型をimportし、文字列をハードコードしない。

/** 契約可能なBusinessプラン（新モネタイズモデル） */
export type BusinessMonetizePlan =
  | "FREE"
  | "LOCAL"
  | "FEATURED"
  | "PREMIUM"
  | "ENTERPRISE";

/** 広告配信範囲（4種類のみ） */
export type AdScope = "local" | "region" | "half" | "national";

/**
 * Businessの利用状態。
 * 「Planを持っていること」と「現在利用可能な状態」を区別する。
 * - free    : Plan未契約（最低限のBusiness機能のみ）
 * - active  : 有料Plan契約中で利用可能
 * - inactive: 有料Plan契約だが支払い失敗・一時停止等で利用不可
 */
export type BusinessMonetizeStatus = "free" | "active" | "inactive";

/** Campaignの状態 */
export type CampaignStatus = "draft" | "active" | "paused" | "ended";

/** Campaign種別 */
export type CampaignType = "activity" | "moment";

/** Campaign配信ターゲット（多店舗向け） */
export type CampaignLocationTarget = "all" | "specific";

/** 地方ブロック（8ブロック） */
export type RegionBlockId =
  | "hokkaido"
  | "tohoku"
  | "kanto"
  | "chubu"
  | "kinki"
  | "chugoku"
  | "shikoku"
  | "kyushu_okinawa";

/** 東日本 / 西日本 */
export type HalfRegion = "east" | "west";

/** Campaignクリエイティブ */
export interface CampaignCreative {
  title: string;
  description?: string | null;
  imageUrl?: string | null;
  videoUrl?: string | null;
  ctaText?: string | null;
  ctaUrl?: string | null;
}

/** Business Account（親） */
export interface BusinessAccountRecord {
  id: string;
  /** userId (users.id) */
  userId: number;
  slug: string;
  displayName: string;
  plan: BusinessMonetizePlan;
  status: BusinessMonetizeStatus;
  /** 契約上の主要プリフェクチャ（LOCALプランの基準となる都道府県） */
  primaryPrefecture: string | null;
  createdAt: string;
  updatedAt: string;
}

/** Business Location（子店舗） */
export interface BusinessLocationRecord {
  id: string;
  accountId: string;
  name: string;
  prefecture: string;
  address: string | null;
  latitude: number;
  longitude: number;
  /** 営業時間等の自由記述 */
  hours: string | null;
  phone: string | null;
  website: string | null;
  createdAt: string;
  updatedAt: string;
}

/** Campaign */
export interface CampaignRecord {
  id: string;
  accountId: string;
  name: string;
  type: CampaignType;
  scope: AdScope;
  regionBlock: RegionBlockId | null;
  half: HalfRegion | null;
  prefecture: string | null;
  /** 多店舗ターゲティング */
  locationTarget: CampaignLocationTarget;
  locationId: string | null;
  creative: CampaignCreative;
  status: CampaignStatus;
  startedAt: string | null;
  endedAt: string | null;
  createdAt: string;
  updatedAt: string;
}
