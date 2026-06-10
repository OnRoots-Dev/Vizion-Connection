"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Activity } from "lucide-react";
import { supabaseBrowser } from "@/lib/supabase/browser";

type PulseStatus = "active" | "stalled" | "revived" | "day0";

interface JourneyDateRow {
  created_at: string;
}

interface PulseStats {
  currentStreak: number;
  longestStreak: number;
  weeklyCount: number;
  totalCount: number;
  daysSinceLast: number | null;
  activityDays: Set<string>;
}

function getDateKey(date: Date) {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Tokyo",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date);
}

function addDays(date: Date, days: number) {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
}

function diffDays(fromKey: string, toKey: string) {
  const from = new Date(`${fromKey}T00:00:00+09:00`).getTime();
  const to = new Date(`${toKey}T00:00:00+09:00`).getTime();
  return Math.round((to - from) / 86400000);
}

function calculateStats(rows: JourneyDateRow[]): PulseStats {
  const todayKey = getDateKey(new Date());
  const activityDays = new Set(rows.map((row) => getDateKey(new Date(row.created_at))));
  const sortedDays = Array.from(activityDays).sort();
  const lastDay = sortedDays.at(-1) ?? null;
  const daysSinceLast = lastDay ? diffDays(lastDay, todayKey) : null;

  let currentStreak = 0;
  if (activityDays.has(todayKey) || activityDays.has(getDateKey(addDays(new Date(), -1)))) {
    let cursor = activityDays.has(todayKey) ? new Date() : addDays(new Date(), -1);
    while (activityDays.has(getDateKey(cursor))) {
      currentStreak += 1;
      cursor = addDays(cursor, -1);
    }
  }

  let longestStreak = 0;
  let run = 0;
  let previous: string | null = null;
  for (const day of sortedDays) {
    if (previous && diffDays(previous, day) === 1) {
      run += 1;
    } else {
      run = 1;
    }
    longestStreak = Math.max(longestStreak, run);
    previous = day;
  }

  const weeklyCount = Array.from({ length: 7 }, (_, index) => getDateKey(addDays(new Date(), -index)))
    .filter((day) => activityDays.has(day)).length;

  return {
    currentStreak,
    longestStreak,
    weeklyCount,
    totalCount: rows.length,
    daysSinceLast,
    activityDays,
  };
}

function resolveStatus(stats: PulseStats): PulseStatus {
  if (stats.totalCount === 0) return "day0";
  if ((stats.daysSinceLast ?? 0) >= 3) return "stalled";
  if (stats.currentStreak === 1 && stats.longestStreak > 1) return "revived";
  return "active";
}

function StatCard({ label, value, delay }: { label: string; value: string; delay: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className="rounded-lg bg-[var(--surface-2)] p-4 text-center"
    >
      <div className="font-mono text-2xl text-[var(--foreground)]">{value}</div>
      <div className="mt-1 font-display text-xs uppercase tracking-[0.18em] text-[color-mix(in_srgb,var(--foreground)_42%,transparent)]">
        {label}
      </div>
    </motion.div>
  );
}

function LoadingState() {
  return (
    <main className="min-h-screen bg-[var(--surface-1)] px-5 py-8 text-[var(--foreground)]">
      <div className="mx-auto max-w-md space-y-5">
        <div className="mx-auto h-[200px] w-[200px] rounded-full bg-[var(--surface-2)]" />
        <div className="grid grid-cols-2 gap-3">
          {[0, 1, 2, 3].map((item) => (
            <div key={item} className="h-20 rounded-lg bg-[var(--surface-3)]" />
          ))}
        </div>
      </div>
    </main>
  );
}

export default function PulseClient() {
  const [rows, setRows] = useState<JourneyDateRow[]>([]);
  const [slug, setSlug] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPulse = useCallback(async () => {
    setError(null);
    const { data: authData, error: authError } = await supabaseBrowser.auth.getUser();

    if (authError || !authData.user) {
      setError("ログインが必要です。");
      setIsLoading(false);
      return;
    }

    // Use JWT metadata slug to skip users table round-trip when available
    let resolvedSlug = authData.user.user_metadata?.slug as string | undefined;
    if (!resolvedSlug) {
      const { data: profile, error: profileError } = await supabaseBrowser
        .from("users")
        .select("slug")
        .eq("auth_id", authData.user.id)
        .single();
      if (profileError || !profile?.slug) {
        setError("プロフィールを取得できませんでした。");
        setIsLoading(false);
        return;
      }
      resolvedSlug = profile.slug;
    }

    setSlug(resolvedSlug ?? null);

    const since365 = new Date(Date.now() - 365 * 24 * 60 * 60 * 1000).toISOString();
    const { data: journeys, error: journeysError } = await supabaseBrowser
      .from("journeys")
      .select("created_at")
      .eq("user_slug", resolvedSlug)
      .gte("created_at", since365)
      .order("created_at", { ascending: false });

    if (journeysError) {
      setError("Pulseを読み込めませんでした。");
      setIsLoading(false);
      return;
    }

    setRows((journeys ?? []) as JourneyDateRow[]);
    setIsLoading(false);
  }, []);

  useEffect(() => {
    void fetchPulse();
  }, [fetchPulse]);

  const stats = useMemo(() => calculateStats(rows), [rows]);
  const status = useMemo(() => resolveStatus(stats), [stats]);
  const graphDays = useMemo(
    () => Array.from({ length: 28 }, (_, index) => addDays(new Date(), index - 27)),
    [],
  );
  const todayKey = getDateKey(new Date());
  const isStalled = status === "stalled";
  const isRevived = status === "revived";
  const glowOpacity = isStalled ? "opacity-30" : "opacity-80";
  const ringClass = isStalled ? "opacity-25" : "opacity-70";

  if (isLoading) return <LoadingState />;

  if (status === "day0") {
    return (
      <main className="min-h-screen bg-[var(--surface-1)] px-5 py-8 text-[var(--foreground)]">
        <section className="mx-auto flex min-h-[86vh] max-w-md flex-col items-center justify-center text-center">
          <motion.div
            initial={{ opacity: 0, y: 24, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.6 }}
            className="relative flex h-[200px] w-[200px] items-center justify-center rounded-full border border-[var(--electric)] bg-[var(--surface-2)]"
          >
            <span className="animate-pulse-ring absolute inset-0 rounded-full border border-[var(--electric)] bg-[var(--pulse-dim)]" />
            <span className="animate-pulse-ring absolute inset-0 rounded-full border border-[var(--electric)] bg-[var(--pulse-dim)] [animation-delay:1s]" />
            <div className="relative">
              <div className="font-mono text-5xl text-[var(--foreground)]">DAY 0</div>
              <div className="mt-2 font-display text-sm uppercase tracking-[0.28em] text-[color-mix(in_srgb,var(--foreground)_42%,transparent)]">
                PULSE
              </div>
            </div>
          </motion.div>
          <h1 className="mt-10 font-display text-3xl uppercase tracking-wide text-[var(--foreground)]">
            あなたのPulseを刻み始めよう
          </h1>
          <Link
            href="/onboarding/journey"
            className="mt-8 rounded-lg bg-[var(--electric)] px-6 py-3 font-display text-sm uppercase tracking-[0.18em] text-[var(--surface-1)]"
          >
            最初のJourneyを記録する
          </Link>
        </section>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[var(--surface-1)] px-5 py-8 text-[var(--foreground)]">
      <div className="mx-auto max-w-md">
        <header className="mb-8 flex items-center justify-between">
          <div>
            <p className="font-mono text-[10px] uppercase tracking-[0.28em] text-[var(--electric)]">
              {slug ?? "PULSE"}
            </p>
            <h1 className="mt-1 font-display text-4xl uppercase tracking-wider text-[var(--foreground)]">
              PULSE
            </h1>
          </div>
          {status === "active" ? (
            <span className="rounded-lg border border-[var(--electric)] bg-[var(--pulse-dim)] px-3 py-1.5 font-display text-xs uppercase tracking-[0.18em] text-[var(--electric)]">
              継続中
            </span>
          ) : null}
        </header>

        {error ? (
          <div className="mb-5 rounded-lg bg-[var(--surface-2)] p-4 text-sm text-[var(--electric)]">
            {error}
          </div>
        ) : null}

        <motion.section
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="flex flex-col items-center"
        >
          <div className="relative flex h-[200px] w-[200px] items-center justify-center rounded-full border border-[var(--electric)] bg-[var(--surface-2)]">
            <span className={`animate-pulse-ring absolute inset-0 rounded-full border border-[var(--electric)] bg-[var(--pulse-dim)] ${ringClass}`} />
            <span className={`animate-pulse-ring absolute inset-0 rounded-full border border-[var(--electric)] bg-[var(--pulse-dim)] [animation-delay:1s] ${ringClass}`} />
            <motion.span
              initial={isRevived ? { opacity: 1, scale: 0.92 } : false}
              animate={isRevived ? { opacity: [0.4, 1, 0.5], scale: [0.92, 1.08, 1] } : {}}
              transition={{ duration: 1.1, ease: "easeOut" }}
              className={`absolute inset-0 rounded-full bg-[var(--pulse-glow)] blur-2xl ${glowOpacity}`}
            />
            <div className="relative text-center">
              <div className="font-mono text-6xl text-[var(--foreground)]">
                {stats.currentStreak}
              </div>
              <div className="mt-2 font-display text-sm uppercase tracking-[0.32em] text-[color-mix(in_srgb,var(--foreground)_42%,transparent)]">
                PULSE
              </div>
            </div>
          </div>

          <p className="mt-7 min-h-6 text-center text-sm text-[color-mix(in_srgb,var(--foreground)_58%,transparent)]">
            {isStalled ? "Pulseが弱まっています" : isRevived ? "Pulseが戻ってきた" : "今日もPulseが続いています"}
          </p>

          {isStalled ? (
            <Link
              href="/dashboard?view=journey"
              className="mt-5 rounded-lg bg-[var(--electric)] px-5 py-3 font-display text-sm uppercase tracking-[0.16em] text-[var(--surface-1)]"
            >
              今日のJourneyを記録する
            </Link>
          ) : null}
        </motion.section>

        <section className="mt-10 grid grid-cols-2 gap-3">
          <StatCard label="現在の継続日数" value={`${stats.currentStreak}`} delay={0.1} />
          <StatCard label="最長継続日数" value={`${stats.longestStreak}`} delay={0.2} />
          <StatCard label="今週の記録" value={`${stats.weeklyCount}/7`} delay={0.3} />
          <StatCard label="総Journey数" value={`${stats.totalCount}`} delay={0.4} />
        </section>

        <motion.section
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mt-6 rounded-lg bg-[var(--surface-2)] p-5"
        >
          <div className="mb-4 flex items-center gap-2 font-display text-sm uppercase tracking-[0.18em] text-[color-mix(in_srgb,var(--foreground)_58%,transparent)]">
            <Activity className="h-4 w-4 text-[var(--electric)]" />
            28 Days Activity
          </div>
          <div className="grid grid-cols-7 gap-3">
            {graphDays.map((day) => {
              const key = getDateKey(day);
              const active = stats.activityDays.has(key);
              const today = key === todayKey;
              return (
                <div
                  key={key}
                  title={key}
                  className={[
                    "h-4 w-4 rounded-full",
                    active ? "bg-[var(--electric)]" : "bg-[var(--surface-3)]",
                    today ? "ring-2 ring-[var(--electric)] ring-offset-2 ring-offset-[var(--surface-2)]" : "",
                  ].join(" ")}
                />
              );
            })}
          </div>
        </motion.section>
      </div>
    </main>
  );
}
