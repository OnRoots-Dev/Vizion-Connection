// features/business/constants.ts
import type { BusinessPlan, PlanId } from "./types";

export const PLAN_LINKS = {
    roots: process.env.NEXT_PUBLIC_SQUARE_LINK_ROOTS ?? "",
    rootsPlus: process.env.NEXT_PUBLIC_SQUARE_LINK_ROOTS_PLUS ?? "",
    signal: process.env.NEXT_PUBLIC_SQUARE_LINK_SIGNAL ?? "",
    presence: process.env.NEXT_PUBLIC_SQUARE_LINK_PRESENCE ?? "",
    legacy: process.env.NEXT_PUBLIC_SQUARE_LINK_LEGACY ?? "",
} as const;

export function getPlanLinkById(planId: PlanId): string {
    if (planId === "roots-plus") return PLAN_LINKS.rootsPlus;
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
            "地方ブロック内ユーザーへの表示（smallサイズ）",
            "ロゴ + キャッチコピー表示",
            "PRバッジ表示",
            "正式版3ヶ月間 月額料金で利用可能",
            "6ブロック × 各20枠（全国120枠限定）",
        ],
    },
    {
        id: "roots-plus",
        name: "🌿 Roots+",
        tagline: "地域で、際立つ存在になる。",
        priceLabel: "¥50,000",
        amount: 50_000,
        seats: 60,
        highlight: false,
        benefits: [
            "地方ブロック内ユーザーへの優先表示（mediumサイズ）",
            "画像 + キャッチコピー + 本文テキスト表示",
            "Discovery画面での優先表示",
            "PRバッジ表示",
            "正式版3ヶ月間 月額料金で利用可能",
            "6ブロック × 各10枠（全国60枠限定）",
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
            "先行ロゴ掲載（Signalセクション）",
            "全国ユーザーへの露出",
            "Discovery表示",
            "正式版3ヶ月間 月額料金で利用可能",
            "先行登録メンバーへの優先露出",
            "30枠限定",
        ],
    },
    {
        id: "presence",
        name: "💠 Presence",
        tagline: "存在感を、確立する。",
        priceLabel: "¥500,000",
        amount: 500_000,
        seats: 10,
        highlight: true,
        benefits: [
            "先行ロゴ掲載（Presenceセクション）",
            "Discovery優先表示（β期間〜正式版）",
            "地域ターゲット広告枠（1ブロック選択可）",
            "月次レポート提供（表示数・クリック数・Cheer連動データ）",
            "正式版3ヶ月間 月額料金で利用可能",
            "10枠限定",
        ],
    },
    {
        id: "legacy",
        name: "🔥 Legacy",
        tagline: "歴史に、刻む。",
        priceLabel: "¥1,000,000",
        amount: 1_000_000,
        seats: 5,
        highlight: false,
        benefits: [
            "最上位ロゴ掲載（Legacy最上位セクション）",
            "Discovery 全国最優先表示",
            "地域ターゲット広告枠（全ブロック対応）",
            "月次レポート＋戦略MTG（月1回）",
            "限定バッジ表示（Legacyパートナー認定）",
            "アスリート・トレーナーとのコラボレーション優先権",
            "正式版3ヶ月間 月額料金で利用可能",
            "5枠限定",
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
