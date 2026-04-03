// app/(marketing)/business/checkout/page.tsx
import { getAllPlanOrderCounts } from "@/lib/supabase/business-orders";
import { getBusinessPlansWithUrls } from "@/features/business/constants";
import type { BusinessPlanWithAvailability } from "@/features/business/types";
import BusinessCheckoutClient from "./BusinessCheckoutClient";

export default async function BusinessCheckoutPage({
  searchParams,
}: {
  searchParams: Promise<{ plan?: string }>;
}) {
  const resolvedSearchParams = await searchParams;
  const orderCounts = await getAllPlanOrderCounts();
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

  return (
    <BusinessCheckoutClient
      plans={plansWithAvailability}
      deadlineText="申込締切: 2026年4月9日 12:00まで"
      initialPlanId={resolvedSearchParams.plan ?? null}
    />
  );
}
