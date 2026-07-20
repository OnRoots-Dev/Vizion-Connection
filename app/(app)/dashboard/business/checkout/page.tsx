// app/(app)/dashboard/business/checkout/page.tsx
import { getBusinessPlansWithUrls } from "@/features/business/constants";
import type { BusinessPlanWithAvailability, RootsRegionAvailability } from "@/features/business/types";
import {
  getNationalTierAvailabilityFromAdSlots,
  getRootsRegionAvailabilityFromAdSlots,
  listAdSlots,
} from "@/lib/supabase/ad-slots";
import BusinessCheckoutClient from "./BusinessCheckoutClient";

export default async function BusinessCheckoutPage({
  searchParams,
}: {
  searchParams: Promise<{ plan?: string }>;
}) {
  const resolvedSearchParams = await searchParams;
  const [plans, rootsRegions, national, allSlots] = await Promise.all([
    Promise.resolve(getBusinessPlansWithUrls()),
    getRootsRegionAvailabilityFromAdSlots(),
    getNationalTierAvailabilityFromAdSlots(),
    listAdSlots(),
  ]);

  const rootsTotal = allSlots
    .filter((s) => s.tier === "roots")
    .reduce(
      (acc, s) => {
        acc.total += s.total;
        acc.sold += s.sold;
        return acc;
      },
      { total: 0, sold: 0 },
    );
  const nationalByTier = new Map(national.map((n) => [n.tier, n]));

  const plansWithAvailability: BusinessPlanWithAvailability[] = plans.map((plan) => {
    if (plan.id === "roots") {
      const remaining = Math.max(0, rootsTotal.total - rootsTotal.sold);
      return {
        ...plan,
        seats: rootsTotal.total || plan.seats,
        soldCount: rootsTotal.sold,
        remaining,
        soldOut: remaining <= 0,
      };
    }
    const nat = nationalByTier.get(plan.id);
    if (nat) {
      return {
        ...plan,
        seats: nat.seats || plan.seats,
        soldCount: nat.seats - nat.remaining,
        remaining: nat.remaining,
        soldOut: nat.soldOut,
      };
    }
    return {
      ...plan,
      soldCount: 0,
      remaining: plan.seats,
      soldOut: false,
    };
  });

  const rootsRegionAvailability: RootsRegionAvailability[] = rootsRegions.map((r) => ({
    id: r.id,
    label: r.label,
    seats: r.seats,
    remaining: r.remaining,
    soldOut: r.soldOut,
  }));

  const prefSlots = allSlots
    .filter((s) => s.tier === "roots")
    .map((s) => ({
      prefecture: s.prefecture,
      remaining: s.remaining,
      soldOut: s.soldOut,
      total: s.total,
    }));

  return (
    <BusinessCheckoutClient
      plans={plansWithAvailability}
      initialPlanId={resolvedSearchParams.plan ?? null}
      rootsRegionAvailability={rootsRegionAvailability}
      prefSlots={prefSlots}
    />
  );
}
