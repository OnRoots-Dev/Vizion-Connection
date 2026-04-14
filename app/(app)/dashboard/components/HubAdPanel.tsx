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

  return (
    <SectionCard t={t}>
      <SLabel text="Hub Sponsor" color="#FFD600" />
      {primaryAd ? (
        <AdCard ad={primaryAd} size={nationalAd ? "medium" : "small"} />
      ) : (
        <div className="rounded-[14px] border border-dashed p-[18px] text-[12px]" style={{ borderColor: t.border, color: t.sub }}>
          Hub スポンサー広告枠（準備中）
        </div>
      )}
    </SectionCard>
  );
}
