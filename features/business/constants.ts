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

/** キャンペーン: 1ヶ月分の料金で合計4ヶ月（1ヶ月＋ボーナス3ヶ月） */
export const BUSINESS_CAMPAIGN = {
    periodLabel: "1ヶ月分の料金で合計4ヶ月利用可能（1ヶ月＋ボーナス3ヶ月）",
    periodShort: "4ヶ月利用（1ヶ月料金＋ボーナス3ヶ月）",
    dateRange: "2026年7月19日〜7月31日",
    autoRenewNote:
        "4ヶ月の利用期間終了後は、解約の申し出がない限り同額で自動継続されます。",
} as const;

export type BusinessRegionId = (typeof BUSINESS_REGIONS)[number]["id"];

/** Business 地方ブロック ↔ 都道府県（ad_slots / チェックアウト UI 共通） */
export const PREFECTURES_BY_BUSINESS_REGION: Record<BusinessRegionId, string[]> = {
    hokkaido_tohoku: ["北海道", "青森県", "岩手県", "宮城県", "秋田県", "山形県", "福島県"],
    kanto: ["茨城県", "栃木県", "群馬県", "埼玉県", "千葉県", "東京都", "神奈川県"],
    chubu: ["新潟県", "富山県", "石川県", "福井県", "山梨県", "長野県", "岐阜県", "静岡県", "愛知県"],
    kinki: ["三重県", "滋賀県", "京都府", "大阪府", "兵庫県", "奈良県", "和歌山県"],
    chugoku_shikoku: ["鳥取県", "島根県", "岡山県", "広島県", "山口県", "徳島県", "香川県", "愛媛県", "高知県"],
    kyushu_okinawa: ["福岡県", "佐賀県", "長崎県", "熊本県", "大分県", "宮崎県", "鹿児島県", "沖縄県"],
};

// Roots は全国120枠 ÷ 6ブロック = 各ブロック20枠。
export const ROOTS_SEATS_PER_REGION = 20;

// 1社（1プラン）あたりに支援対象として指定できるアスリート等の人数上限。
// ※ BUSINESS_PLANS の seats（プランを購入できる企業の総枠数、全社合計）とは別概念。
// 初期値は BUSINESS_PLANS.seats の数字をそのまま流用している（指示に基づく仮値）。
export const SPONSOR_SLOTS_PER_PLAN: Record<PlanId, number> = {
    roots: 120,
    signal: 30,
    presence: 10,
    legacy: 5,
};

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
        // 通常価格 = 月額 × 4ヶ月分
        regularPriceLabel: "¥120,000",
        amount: 30_000,
        seats: 120,
        highlight: false,
        benefits: [
            "都道府県・市区町村単位でターゲット表示",
            "同エリアのユーザーのDiscovery・Profileに掲載",
            "コンテンツカード形式（PRバッジ付き）",
            BUSINESS_CAMPAIGN.periodLabel,
            "全国120枠限定",
        ],
    },
    {
        id: "signal",
        name: "⚡ Signal",
        tagline: "存在を、発信する。",
        priceLabel: "¥100,000",
        regularPriceLabel: "¥400,000",
        amount: 100_000,
        seats: 30,
        highlight: false,
        benefits: [
            "地方区分単位でターゲット表示（関西・東海など）",
            "該当地方ユーザーのHub・Discoveryに掲載",
            "コンテンツカード形式（キャッチコピー付き）",
            BUSINESS_CAMPAIGN.periodLabel,
            "全国30枠限定",
        ],
    },
    {
        id: "presence",
        name: "💠 Presence",
        tagline: "存在感を、確立する。",
        priceLabel: "¥300,000",
        regularPriceLabel: "¥1,200,000",
        amount: 300_000,
        seats: 10,
        highlight: true,
        benefits: [
            "全国ユーザーへの表示",
            "全ロールのHub・Discoveryに掲載",
            "PEAK MOMENT・MILESTONE通知での露出",
            "効果測定ダッシュボード（日次更新）",
            BUSINESS_CAMPAIGN.periodLabel,
            "全国10枠限定",
        ],
    },
    {
        id: "legacy",
        name: "🔥 Legacy",
        tagline: "歴史に、刻む。",
        priceLabel: "個別見積",
        regularPriceLabel: null,
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
            BUSINESS_CAMPAIGN.periodLabel,
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