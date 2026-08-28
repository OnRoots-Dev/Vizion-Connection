"use client";

// components/marketing/lp/live-stats.tsx
// LPの参加者数とBusiness残枠数を、公開APIからリアルタイム取得して表示する。

import { useEffect, useState } from "react";

type Stats = {
  memberCount: number;
  athletes: number;
  trainers: number;
  crew: number;
  business: number;
};

type BusinessAvailability = {
  regions?: Array<{ remaining?: number; seats?: number }>; 
  national?: Array<{ remaining?: number; seats?: number }>;
};

export function LiveStats() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [businessRemaining, setBusinessRemaining] = useState<number | null>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    let active = true;

    async function load() {
      try {
        const [statsRes, businessRes] = await Promise.all([
          fetch("/api/stats", { cache: "no-store" }),
          fetch("/api/business/region-availability", { cache: "no-store" }),
        ]);

        if (!active) return;

        const statsData: Stats | null = statsRes.ok ? await statsRes.json() : null;
        const businessData: BusinessAvailability | null = businessRes.ok ? await businessRes.json() : null;

        if (statsData && typeof statsData.memberCount === "number") setStats(statsData);

        const regionalRemaining = Array.isArray(businessData?.regions)
          ? businessData.regions.reduce((sum, row) => sum + (Number(row?.remaining) || 0), 0)
          : 0;
        const nationalRemaining = Array.isArray(businessData?.national)
          ? businessData.national.reduce((sum, row) => sum + (Number(row?.remaining) || 0), 0)
          : 0;

        setBusinessRemaining(regionalRemaining + nationalRemaining);
      } catch {
        if (active) {
          setStats(null);
          setBusinessRemaining(null);
        }
      } finally {
        if (active) setLoaded(true);
      }
    }

    void load();

    return () => {
      active = false;
    };
  }, []);

  if (!loaded || !stats) return null;

  const fmt = (n: number) => n.toLocaleString("ja-JP");

  return (
    <div
      aria-live="polite"
      className="mx-auto mt-7 flex max-w-3xl flex-wrap items-center justify-center gap-3 font-mono text-[11px] uppercase tracking-[0.12em] text-white/45"
    >
      <div className="rounded-full border border-white/10 bg-white/3 px-4 py-2">
        <span className="text-lime">{fmt(stats.memberCount)}</span>
        <span className="ml-2 text-white/60">registered</span>
      </div>
      <div className="rounded-full border border-lime/25 bg-lime/[0.06] px-4 py-2">
        <span className="text-lime">{businessRemaining == null ? "--" : fmt(businessRemaining)}</span>
        <span className="ml-2 text-white/60">business slots left</span>
      </div>
      <div className="hidden rounded-full border border-white/10 bg-white/3 px-4 py-2 md:inline-flex">
        <span className="text-white/80">ATHLETE {fmt(stats.athletes)}</span>
        <span className="mx-2 text-white/25">/</span>
        <span className="text-white/80">TRAINER {fmt(stats.trainers)}</span>
        <span className="mx-2 text-white/25">/</span>
        <span className="text-white/80">FAN {fmt(stats.crew)}</span>
      </div>
    </div>
  );
}
