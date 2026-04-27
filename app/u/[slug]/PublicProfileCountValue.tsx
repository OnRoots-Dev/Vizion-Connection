"use client";

import { useEffect, useState } from "react";
import { PUBLIC_PROFILE_ENGAGEMENT_EVENT, type PublicProfileEngagementDetail } from "./engagement-events";

export default function PublicProfileCountValue({
  slug,
  initialValue,
  field,
}: {
  slug: string;
  initialValue: number;
  field: "cheerCount" | "collectorCount";
}) {
  const [value, setValue] = useState(initialValue);

  useEffect(() => {
    setValue(initialValue);
  }, [initialValue]);

  useEffect(() => {
    const handleUpdate = (event: Event) => {
      const detail = (event as CustomEvent<PublicProfileEngagementDetail>).detail;
      if (!detail || detail.slug !== slug) return;

      if (field === "cheerCount" && typeof detail.cheerCount === "number") {
        setValue(detail.cheerCount);
      }
      if (field === "collectorCount" && typeof detail.collectorCount === "number") {
        setValue(detail.collectorCount);
      }
    };

    window.addEventListener(PUBLIC_PROFILE_ENGAGEMENT_EVENT, handleUpdate as EventListener);
    return () => window.removeEventListener(PUBLIC_PROFILE_ENGAGEMENT_EVENT, handleUpdate as EventListener);
  }, [field, slug]);

  return <>{value.toLocaleString()}</>;
}
