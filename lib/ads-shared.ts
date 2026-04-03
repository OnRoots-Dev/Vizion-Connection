export interface AdItem {
    id: string;
    businessId: number;
    plan: string;
    prefecture: string | null;
    sportCategory: string | null;
    imageUrl: string | null;
    linkUrl: string | null;
    headline: string;
    bodyText: string | null;
    isActive: boolean;
    startsAt: string;
    endsAt: string | null;
    createdAt: string;
}

export const LOCAL_AD_PLANS = ["local", "local_premium"] as const;
export const NATIONAL_AD_PLANS = ["entry", "starter", "impact", "prime", "champion", "executive", "title"] as const;

export function isLocalPlan(plan: string): boolean {
    return (LOCAL_AD_PLANS as readonly string[]).includes(plan);
}

export function isNationalPlan(plan: string): boolean {
    return (NATIONAL_AD_PLANS as readonly string[]).includes(plan);
}
