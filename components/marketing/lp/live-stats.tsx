"use client";

// components/marketing/lp/live-stats.tsx
// LPの参加者集計を /api/stats から取得して表示する。取得失敗時は何も表示しない（非破壊）。

import { useEffect, useState } from "react";

type Stats = {
  memberCount: number;
  athletes: number;
  trainers: number;
  crew: number;
  business: number;
};

export function LiveStats() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    let active = true;
    fetch("/api/stats", { cache: "no-store" })
      .then((res) => (res.ok ? res.json() : null))
      .then((data: Stats | null) => {
        if (!active) return;
        if (data && typeof data.memberCount === "number") setStats(data);
      })
      .catch(() => {})
      .finally(() => {
        if (active) setLoaded(true);
      });
    return () => {
      active = false;
    };
  }, []);

  if (!loaded || !stats) return null;

  const fmt = (n: number) => n.toLocaleString("ja-JP");
  const count = stats.memberCount;

  return (
    <p
      aria-live="polite"
      className="mx-auto mt-7 flex max-w-xl flex-wrap items-center justify-center gap-x-2 gap-y-1 font-mono text-[11px] uppercase tracking-[0.12em] text-white/45"
    >
      <span className="text-lime">{fmt(count)}</span>
      <span>participants</span>
      <span className="mx-1 text-white/20">·</span>
      <span>ATHLETE {fmt(stats.athletes)} / TRAINER {fmt(stats.trainers)} / FAN {fmt(stats.crew)} / BUSINESS {fmt(stats.business)}</span>
    </p>
  );
}
