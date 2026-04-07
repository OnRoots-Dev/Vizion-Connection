export interface AdItem {
    id: string;
    businessId: number;
    plan: string;
    adSize: "small" | "medium" | "large" | "hero" | null;
    adScope: "regional" | "national" | null;
    region: string | null;
    planPriority: number;
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

export function isLocalPlan(plan: string): boolean {
    return plan === "regional" || plan === "roots" || plan === "roots_plus" || plan === "local" || plan === "local_premium";
}

export function isNationalPlan(plan: string): boolean {
    return !isLocalPlan(plan);
}
