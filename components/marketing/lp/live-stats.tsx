"use client";

// components/marketing/lp/live-stats.tsx
// LPの参加者数とBusiness残枠数を、公開APIからリアルタイム取得して表示する。
// NOTE: This component displays real data from public APIs, not fake statistics.
// The large typography is intentional to show community scale as a social proof element.

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
      <div className="flex flex-col items-center justify-center gap-4 text-center text-white md:flex-row md:items-end md:gap-8">
        <div className="flex items-end gap-2 md:gap-3">
          <span className="font-mono text-[clamp(1.8rem,4vw,2.5rem)] font-bold leading-none tracking-tight text-[#d7ff5b]">
            {fmt(stats.memberCount)}
          </span>
          <span className="mb-1 font-mono text-[10px] uppercase tracking-[0.2em] text-white/50 md:text-[11px]">
            人が参加中
          </span>
        </div>

        {businessRemaining != null && businessRemaining > 0 && (
          <>
            <div className="hidden h-8 w-px bg-white/10 md:block" aria-hidden="true" />
            <div className="flex items-end gap-2 md:gap-3">
              <span className="font-mono text-[clamp(1.6rem,3.5vw,2.2rem)] font-bold leading-none tracking-tight text-white">
                {fmt(businessRemaining)}
              </span>
              <span className="mb-1 font-mono text-[10px] uppercase tracking-[0.2em] text-white/50 md:text-[11px]">
                Business枠残り
              </span>
            </div>
          </>
        )}
      </div>

      <div className="mt-3 flex flex-wrap items-center justify-center gap-x-2 gap-y-1 font-mono text-[10px] uppercase tracking-[0.18em] text-white/40 md:text-[11px]">
        <span>アスリート {fmt(stats.athletes)}</span>
        <span className="text-white/15">·</span>
        <span>トレーナー {fmt(stats.trainers)}</span>
        <span className="text-white/15">·</span>
        <span>クルー {fmt(stats.crew)}</span>
      </div>
    </div>
  );
}
