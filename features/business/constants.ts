// features/business/constants.ts
import type { BusinessPlan, PlanId } from "./types";

// 地方ブロック（Business用の6区分）。LP の JapanMap / FAQ と一致。
// ※ ユーザー登録の region（北海道と東北が別の7区分）とは別物。
export const BUSINESS_REGIONS = [
    { id: "hokkaido_tohoku", label: "北海道・東北" },
    { id: "kanto", label: "関東" },
    { id: "chubu", label: "中部" },
    { id: "kinki", label: "近畿" },
    { id: "chugoku_shikoku", label: "中国・四国" },
    { id: "kyushu_okinawa", label: "九州・沖縄" },
] as const;

export type BusinessRegionId = (typeof BUSINESS_REGIONS)[number]["id"];

// Roots は全国120枠 ÷ 6ブロック = 各ブロック20枠。
export const ROOTS_SEATS_PER_REGION = 20;

export function isBusinessRegionId(value: unknown): value is BusinessRegionId {
    return typeof value === "string" && BUSINESS_REGIONS.some((r) => r.id === value);
}

export function getBusinessRegionLabel(id: string): string {
    return BUSINESS_REGIONS.find((r) => r.id === id)?.label ?? id;
}

export const PLAN_LINKS = {
    roots: process.env.NEXT_PUBLIC_SQUARE_LINK_ROOTS ?? "",
    signal: process.env.NEXT_PUBLIC_SQUARE_LINK_SIGNAL ?? "",
    presence: process.env.NEXT_PUBLIC_SQUARE_LINK_PRESENCE ?? "",
    legacy: process.env.NEXT_PUBLIC_SQUARE_LINK_LEGACY ?? "", // Calendlyリンクを設定
} as const;

export function getPlanLinkById(planId: PlanId): string {
    if (planId === "roots") return PLAN_LINKS.roots;
    if (planId === "signal") return PLAN_LINKS.signal;
    if (planId === "presence") return PLAN_LINKS.presence;
    return PLAN_LINKS.legacy;
}

const PLANS_BASE: Omit<BusinessPlan, "squareUrl">[] = [
    {
        id: "roots",
        name: "🌱 Roots",
        tagline: "地域に根ざす、最初の一歩。",
        priceLabel: "¥30,000",
        amount: 30_000,
        seats: 120,
        highlight: false,
        benefits: [
            "都道府県・市区町村単位でターゲット表示",
            "同エリアのユーザーのDiscovery・Profileに掲載",
            "コンテンツカード形式（PRバッジ付き）",
            "β版価格が正式版以降も継続（価格保護）",
            "全国120枠限定",
        ],
    },
    {
        id: "signal",
        name: "⚡ Signal",
        tagline: "存在を、発信する。",
        priceLabel: "¥100,000",
        amount: 100_000,
        seats: 30,
        highlight: false,
        benefits: [
            "地方区分単位でターゲット表示（関西・東海など）",
            "該当地方ユーザーのHub・Discoveryに掲載",
            "コンテンツカード形式（キャッチコピー付き）",
            "β版価格が正式版以降も継続（価格保護）",
            "全国30枠限定",
        ],
    },
    {
        id: "presence",
        name: "💠 Presence",
        tagline: "存在感を、確立する。",
        priceLabel: "¥300,000",
        amount: 300_000,
        seats: 10,
        highlight: true,
        benefits: [
            "全国ユーザーへの表示",
            "全ロールのHub・Discoveryに掲載",
            "PEAK MOMENT・MILESTONE通知での露出",
            "効果測定ダッシュボード（日次更新）",
            "β版価格が正式版以降も継続（価格保護）",
            "全国10枠限定",
        ],
    },
    {
        id: "legacy",
        name: "🔥 Legacy",
        tagline: "歴史に、刻む。",
        priceLabel: "個別見積",
        amount: 0, // 問い合わせ必須のため決済フローに乗せない
        seats: 5,
        highlight: false,
        benefits: [
            "全国ユーザーへの最優先表示",
            "全広告枠への掲載",
            "PEAK MOMENT・MILESTONE・STORY内での露出",
            "リアルタイム効果測定ダッシュボード",
            "専任担当者による月次戦略MTG",
            "Legacyパートナー認定バッジ",
            "β版価格が正式版以降も継続（価格保護）",
            "全国5枠限定",
        ],
    },
];

// クライアントでも安全にimportできる（squareUrlなし）
export const BUSINESS_PLANS: Omit<BusinessPlan, "squareUrl">[] = PLANS_BASE;

// サーバーサイドのみで使う（squareUrlあり）
export function getBusinessPlansWithUrls(): BusinessPlan[] {
    return PLANS_BASE.map(p => ({
        ...p,
        squareUrl: getPlanLinkById(p.id),
    }));
}