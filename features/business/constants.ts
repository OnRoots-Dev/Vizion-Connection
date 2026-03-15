// features/business/constants.ts
import type { BusinessPlan, PlanId } from "./types";

// squareUrl は関数にして遅延評価（サーバー側でのみ呼ぶ）
// Client Component から BUSINESS_PLANS をimportしても env は評価されない
const SQUARE_URLS = () => ({
    "entry-supporter": process.env.SQUARE_LINK_ENTRY_SUPPORTER ?? "",
    "starter-position": process.env.SQUARE_LINK_STARTER_POSITION ?? "",
    "impact-partner": process.env.SQUARE_LINK_IMPACT_PARTNER ?? "",
    "prime-sponsor": process.env.SQUARE_LINK_PRIME_SPONSOR ?? "",
    "champion-partner": process.env.SQUARE_LINK_CHAMPION_PARTNER ?? "",
});

const PLANS_BASE: Omit<BusinessPlan, "squareUrl">[] = [
    {
        id: "entry-supporter",
        name: "Entry Supporter",
        tagline: "Vizion Connection への最初の一歩",
        priceLabel: "¥50,000",
        amount: 50_000,
        seats: 50,
        highlight: false,
        benefits: [
            "先行ロゴ掲載（Entryセクション）",
            "正式版3ヶ月間 月額料金で利用可能",
            "先行登録メンバーへの露出",
        ],
    },
    {
        id: "starter-position",
        name: "Starter Position",
        tagline: "早期から存在感を示すポジション",
        priceLabel: "¥100,000",
        amount: 100_000,
        seats: 20,
        highlight: false,
        benefits: [
            "先行ロゴ掲載（Starterセクション）",
            "正式版3ヶ月間 月額料金で利用可能",
            "Discovery 優先表示（β期間）",
        ],
    },
    {
        id: "impact-partner",
        name: "Impact Partner",
        tagline: "業界内での認知を加速させる",
        priceLabel: "¥300,000",
        amount: 300_000,
        seats: 10,
        highlight: true,
        benefits: [
            "先行ロゴ掲載（Impactセクション）",
            "正式版3ヶ月間 月額料金で利用可能",
            "Discovery 優先表示（β期間）",
            "地域ターゲット広告枠（1エリア）",
        ],
    },
    {
        id: "prime-sponsor",
        name: "Prime Sponsor",
        tagline: "Vizion の成長と共に走るパートナー",
        priceLabel: "¥500,000",
        amount: 500_000,
        seats: 5,
        highlight: false,
        benefits: [
            "先行ロゴ掲載（Primeセクション）",
            "正式版3ヶ月間 月額料金で利用可能",
            "Discovery 最優先表示",
            "地域ターゲット広告枠（3エリア）",
            "月次レポート提供",
        ],
    },
    {
        id: "champion-partner",
        name: "Champion Partner",
        tagline: "Vizion Connection の顔となる最上位パートナー",
        priceLabel: "¥1,000,000",
        amount: 1_000_000,
        seats: 3,
        highlight: false,
        benefits: [
            "先行ロゴ掲載（Champion最上位）",
            "正式版3ヶ月間 月額料金で利用可能",
            "Discovery 全国最優先表示",
            "地域ターゲット広告枠（全エリア）",
            "月次レポート＋戦略MTG",
            "限定バッジ表示",
        ],
    },
];

// クライアントでも安全にimportできる（squareUrlなし）
export const BUSINESS_PLANS: Omit<BusinessPlan, "squareUrl">[] = PLANS_BASE;

// サーバーサイドのみで使う（squareUrlあり）
export function getBusinessPlansWithUrls(): BusinessPlan[] {
    const urls = SQUARE_URLS();
    return PLANS_BASE.map(p => ({
        ...p,
        squareUrl: urls[p.id as keyof typeof urls] ?? "",
    }));
}