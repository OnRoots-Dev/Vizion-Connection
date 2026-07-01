// app/(app)/dashboard/business/checkout/page.tsx
import { getAllPlanOrderCounts, getRootsOrderCountsByRegion } from "@/lib/supabase/business-orders";
import { getBusinessPlansWithUrls, BUSINESS_REGIONS, ROOTS_SEATS_PER_REGION } from "@/features/business/constants";
import type { BusinessPlanWithAvailability, RootsRegionAvailability } from "@/features/business/types";
import BusinessCheckoutClient from "./BusinessCheckoutClient";

export default async function BusinessCheckoutPage({
  searchParams,
}: {
  searchParams: Promise<{ plan?: string }>;
}) {
  const resolvedSearchParams = await searchParams;
  const [orderCounts, rootsRegionCounts] = await Promise.all([
    getAllPlanOrderCounts(),
    getRootsOrderCountsByRegion(),
  ]);
  const plans = getBusinessPlansWithUrls();

  const plansWithAvailability: BusinessPlanWithAvailability[] = plans.map((plan) => {
    const soldCount = orderCounts[plan.id] ?? 0;
    return {
      ...plan,
      soldCount,
      remaining: plan.seats - soldCount,
      soldOut: soldCount >= plan.seats,
    };
  });

  const rootsRegionAvailability: RootsRegionAvailability[] = BUSINESS_REGIONS.map((r) => {
    const sold = rootsRegionCounts[r.id] ?? 0;
    const remaining = Math.max(0, ROOTS_SEATS_PER_REGION - sold);
    return { id: r.id, label: r.label, seats: ROOTS_SEATS_PER_REGION, remaining, soldOut: remaining <= 0 };
  });

  return (
    <BusinessCheckoutClient
      plans={plansWithAvailability}
      initialPlanId={resolvedSearchParams.plan ?? null}
      rootsRegionAvailability={rootsRegionAvailability}
    />
  );
}
