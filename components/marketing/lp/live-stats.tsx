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
    <div aria-live="polite" className="mx-auto mt-8 w-full max-w-5xl">
      <div className="flex flex-col items-center justify-center gap-5 text-center text-white md:flex-row md:items-end md:gap-10">
        <div className="flex items-end gap-3 md:gap-4">
          <span className="font-mono text-[clamp(2.5rem,6vw,5.5rem)] font-black leading-none tracking-[-0.08em] text-[#d7ff5b]">
            {fmt(stats.memberCount)}
          </span>
          <span className="mb-2 font-mono text-[10px] uppercase tracking-[0.24em] text-white/60 md:text-[11px]">
            registered
          </span>
        </div>

        <div className="hidden h-12 w-px bg-white/10 md:block" aria-hidden="true" />

        <div className="flex items-end gap-3 md:gap-4">
          <span className="font-mono text-[clamp(2.3rem,5.2vw,4.8rem)] font-black leading-none tracking-[-0.08em] text-white">
            {businessRemaining == null ? "--" : fmt(businessRemaining)}
          </span>
          <span className="mb-2 font-mono text-[10px] uppercase tracking-[0.24em] text-white/60 md:text-[11px]">
            business slots left
          </span>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap items-center justify-center gap-x-3 gap-y-1 font-mono text-[10px] uppercase tracking-[0.22em] text-white/45 md:text-[11px]">
        <span>athlete {fmt(stats.athletes)}</span>
        <span className="text-white/20">·</span>
        <span>trainer {fmt(stats.trainers)}</span>
        <span className="text-white/20">·</span>
        <span>crew {fmt(stats.crew)}</span>
      </div>
    </div>
  );
}
