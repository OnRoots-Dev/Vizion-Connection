// app/(app)/dashboard/business/checkout/page.tsx
import type { RootsRegionAvailability } from "@/features/business/types";
import { getPlansWithAdSlotAvailability } from "@/features/business/server/plan-availability";
import {
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
  const [plansWithAvailability, rootsRegions, allSlots] = await Promise.all([
    getPlansWithAdSlotAvailability({ withSquareUrls: true }),
    getRootsRegionAvailabilityFromAdSlots(),
    listAdSlots(),
  ]);

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
      rootsRegionAvailability={rootsRegionAvailability}
      prefSlots={prefSlots}
      initialPlanId={resolvedSearchParams.plan ?? null}
    />
  );
}
