// features/business/types.ts

export type PlanId =
    | "roots"
    | "signal"
    | "presence"
    | "legacy";

export interface BusinessPlan {
    id: PlanId;
    name: string;
    tagline: string;
    /** キャンペーン価格（1ヶ月分の料金 = 請求額） */
    priceLabel: string;
    /**
     * 4ヶ月換算の通常価格（取り消し線表示用）。
     * 月額 × 4。個別見積プランは null。
     */
    regularPriceLabel: string | null;
    amount: number;
    seats: number;
    highlight: boolean;
    benefits: string[];
    squareUrl: string;
}

export interface BusinessPlanWithAvailability extends BusinessPlan {
    soldCount: number;
    remaining: number;
    soldOut: boolean;
}

// Rootsプランの地方ブロック別 残枠
export interface RootsRegionAvailability {
    id: string;
    label: string;
    seats: number;
    remaining: number;
    soldOut: boolean;
}

export interface BusinessOrderInput {
    email: string;
    slug: string;
    planId: PlanId;
    planName: string;
    amount: number;
    squareLink: string;
    region?: string | null;
}

export interface BusinessOrderRecord {
    id: string;
    email: string;
    slug: string;
    planId: string;
    planName: string;
    amount: number;
    status: string;
    squareLink: string;
    createdAt: string;
}

export type CreateCheckoutResult =
    | { success: true; squareUrl: string; planName: string }
    | { success: false; error: string };
