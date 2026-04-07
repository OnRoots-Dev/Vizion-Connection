export const PLAN_FEATURES = {
  roots: {
    adSize: "small",
    adScope: "regional",
    discoveryPriority: 0,
    discoveryFixed: false,
    badgeColor: "#BA7517",
    badgeLabel: "Roots Partner",
    simpleReport: false,
    fullReport: false,
    businessHub: false,
    abTest: false,
    cheerLogo: false,
  },
  roots_plus: {
    adSize: "medium",
    adScope: "regional",
    discoveryPriority: 1,
    discoveryFixed: false,
    badgeColor: "#BA7517",
    badgeLabel: "Roots+ Partner",
    simpleReport: true,
    fullReport: false,
    businessHub: false,
    abTest: false,
    cheerLogo: false,
  },
  signal: {
    adSize: "medium",
    adScope: "national",
    discoveryPriority: 2,
    discoveryFixed: false,
    badgeColor: "#534AB7",
    badgeLabel: "Signal Partner",
    simpleReport: false,
    fullReport: true,
    businessHub: false,
    abTest: false,
    cheerLogo: true,
  },
  presence: {
    adSize: "large",
    adScope: "national",
    discoveryPriority: 3,
    discoveryFixed: true,
    badgeColor: "#1D9E75",
    badgeLabel: "Presence Partner",
    simpleReport: false,
    fullReport: true,
    businessHub: true,
    abTest: true,
    cheerLogo: true,
  },
  legacy: {
    adSize: "hero",
    adScope: "national",
    discoveryPriority: 4,
    discoveryFixed: true,
    badgeColor: "#D85A30",
    badgeLabel: "Legacy Partner",
    simpleReport: false,
    fullReport: true,
    businessHub: true,
    abTest: true,
    cheerLogo: true,
  },
} as const;

export type SponsorPlan = keyof typeof PLAN_FEATURES;
export type PlanFeature = (typeof PLAN_FEATURES)[SponsorPlan];

export function getPlanFeatures(plan: string | null) {
  if (!plan) return null;
  return PLAN_FEATURES[plan as SponsorPlan] ?? null;
}

export const PLAN_PRIORITY: Record<string, number> = {
  legacy: 4,
  presence: 3,
  signal: 2,
  roots_plus: 1,
  roots: 0,
};
