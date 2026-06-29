"use client";

import type { ThemeColors } from "@/app/(app)/dashboard/types";
import type { AdItem } from "@/lib/ads-shared";
import { isLocalPlan } from "@/lib/ads-shared";
import AdCard from "@/components/AdCard";
import { SectionCard, SLabel } from "@/app/(app)/dashboard/components/ui";

export function HubAdPanel({
  ads,
  t,
}: {
  ads: AdItem[];
  t: ThemeColors;
}) {
  const nationalAd = ads.find((ad) => !isLocalPlan(ad.plan)) ?? null;
  const localAd = ads.find((ad) => isLocalPlan(ad.plan)) ?? null;
  const primaryAd = nationalAd ?? localAd ?? null;

  if (!primaryAd) return null;

  return (
    <SectionCard t={t}>
      <SLabel text="Hub Sponsor" color="#FFD600" />
      <AdCard ad={primaryAd} size={nationalAd ? "medium" : "small"} />
    </SectionCard>
  );
}
