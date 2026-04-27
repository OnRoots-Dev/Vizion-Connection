"use client";

export const PUBLIC_PROFILE_ENGAGEMENT_EVENT = "vz:public-profile-engagement";

export type PublicProfileEngagementDetail = {
  slug: string;
  cheerCount?: number;
  collectorCount?: number;
  collected?: boolean;
};

export function dispatchPublicProfileEngagement(detail: PublicProfileEngagementDetail) {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent<PublicProfileEngagementDetail>(PUBLIC_PROFILE_ENGAGEMENT_EVENT, { detail }));
}
