// features/business/types.ts

export type PlanId =
    | "entry-supporter"
    | "starter-position"
    | "impact-partner"
    | "prime-sponsor"
    | "champion-partner";

export interface BusinessPlan {
    id: PlanId;
    name: string;
    tagline: string;
    priceLabel: string;
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

export interface BusinessOrderInput {
    email: string;
    slug: string;
    planId: PlanId;
    planName: string;
    amount: number;
    squareLink: string;
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