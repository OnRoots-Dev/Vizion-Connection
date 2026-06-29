"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Activity } from "lucide-react";
import { supabaseBrowser } from "@/lib/supabase/browser";
import { calcDayCount, getJstDateKey } from "@/lib/day-count";
import { computePulseStats } from "@/lib/pulse-stats";

type PulseScore = { score: number; streak: number; cheerCount: number; bondCount: number };

function addDays(date: Date, days: number) {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
}

function LoadingState() {
  return (
    <main className="min-h-screen bg-[var(--surface-1)] px-5 py-8 text-[var(--foreground)]">
      <div className="mx-auto max-w-md space-y-5">
        <div className="mx-auto h-[200px] w-[200px] rounded-full bg-[var(--surface-2)]" />
        <div className="grid grid-cols-3 gap-3">
          {[0, 1, 2].map((item) => (
            <div key={item} className="h-20 rounded-lg bg-[var(--surface-3)]" />
          ))}
        </div>
      </div>
    </main>
  );
}

export default function PulseClient() {
  const [journeyDates, setJourneyDates] = useState<string[]>([]);
  const [slug, setSlug] = useState<string | null>(null);
  const [day0Date, setDay0Date] = useState<string | null>(null);
  const [pulseScore, setPulseScore] = useState<PulseScore | null>(null);
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
    const [{ data: journeys, error: journeysError }, { data: userRow }] = await Promise.all([
      supabaseBrowser
        .from("journeys")
        .select("created_at")
        .eq("user_slug", resolvedSlug)
        .gte("created_at", since365)
        .order("created_at", { ascending: false }),
      supabaseBrowser
        .from("users")
        .select("day0_date")
        .eq("slug", resolvedSlug)
        .single(),
    ]);

    setDay0Date((userRow?.day0_date as string | null) ?? null);

    if (journeysError) {
      setError("Pulseを読み込めませんでした。");
      setIsLoading(false);
      return;
    }

    setJourneyDates((journeys ?? []).map((r) => r.created_at as string));
    setIsLoading(false);
  }, []);

  useEffect(() => {
    void fetchPulse();
  }, [fetchPulse]);

  useEffect(() => {
    fetch("/api/pulse/score")
      .then((r) => r.json())
      .then((d) => setPulseScore(d as PulseScore))
      .catch(() => { /* サイレント */ });
  }, []);

  const stats = useMemo(() => computePulseStats(journeyDates), [journeyDates]);
  const { status } = stats;
  const dayCount = useMemo(
    () => calcDayCount(day0Date, journeyDates.at(-1) ?? null),
    [day0Date, journeyDates],
  );
  const graphDays = useMemo(
    () => Array.from({ length: 28 }, (_, index) => addDays(new Date(), index - 27)),
    [],
  );
  const todayKey = getJstDateKey(new Date());
  const isStalled = status === "stalled";
  const isRevived = status === "revived";
  const glowOpacity = isStalled ? "opacity-30" : "opacity-80";
  const ringClass = isStalled ? "opacity-25" : "opacity-70";

  if (isLoading) return <LoadingState />;

  if (status === "day0") {
    return (
      <main className="min-h-screen bg-[var(--surface-1)] px-5 py-8 text-[var(--foreground)]">
        <div className="mx-auto max-w-md">
          <a href="/dashboard" style={{ color: "var(--muted-foreground)", fontSize: 12, fontFamily: "monospace", display: "flex", alignItems: "center", gap: 4, marginBottom: 16 }}>← DASHBOARD</a>
        </div>
        <section className="mx-auto flex min-h-[86vh] max-w-md flex-col items-center justify-center text-center">
          <motion.div
            initial={{ opacity: 0, y: 24, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.6 }}
            className="relative flex h-[200px] w-[200px] items-center justify-center rounded-full border border-[var(--electric)] bg-[var(--surface-2)]"
          >
            <span className="animate-pulse-ring absolute inset-0 rounded-full border border-[var(--electric)] bg-[var(--pulse-dim)]" />
            <span className="animate-pulse-ring absolute inset-0 rounded-full border border-[var(--electric)] bg-[var(--pulse-dim)] [animation-delay:1s]" />
            <div className="relative text-center">
              <div className="font-mono text-xs uppercase tracking-[0.3em] text-[var(--electric)]">PULSE SCORE</div>
              <div className="font-mono text-5xl text-[var(--foreground)]">0</div>
              <div className="mt-2 font-display text-xs uppercase tracking-[0.28em] text-[color-mix(in_srgb,var(--foreground)_42%,transparent)]">
                DAY {dayCount ?? 0}
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
        <a href="/dashboard" style={{ color: "var(--muted-foreground)", fontSize: 12, fontFamily: "monospace", display: "flex", alignItems: "center", gap: 4, marginBottom: 16 }}>← DASHBOARD</a>
        <header className="mb-8 flex items-center justify-between">
          <div>
            <p className="font-mono text-[10px] uppercase tracking-[0.28em] text-[var(--electric)]">
              {slug ?? "PULSE"}
            </p>
            <h1 className="mt-1 font-display text-4xl uppercase tracking-wider text-[var(--foreground)]">
              PULSE SCORE
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

        {/* ─── メインリング（PULSE SCORE 中央表示） ─── */}
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
              <div className="font-mono text-xs uppercase tracking-[0.3em] text-[var(--electric)]">
                PULSE SCORE
              </div>
              <div className="font-mono text-6xl text-[var(--foreground)]">
                {pulseScore?.score ?? "—"}
              </div>
              <div className="mt-2 font-display text-xs uppercase tracking-[0.32em] text-[color-mix(in_srgb,var(--foreground)_42%,transparent)]">
                DAY {dayCount ?? stats.currentStreak}
              </div>
            </div>
          </div>

          {/* スコア構成要素 3列 */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mt-6 grid w-full grid-cols-3 gap-3"
          >
            {[
              { label: "継続日数", value: `${stats.currentStreak}日` },
              { label: "Cheer", value: `${pulseScore?.cheerCount ?? "—"}` },
              { label: "Bond", value: `${pulseScore?.bondCount ?? "—"}人` },
            ].map((item) => (
              <div key={item.label} className="rounded-lg bg-[var(--surface-2)] p-3 text-center">
                <div className="font-mono text-xl text-[var(--electric)]">{item.value}</div>
                <div className="mt-1 font-display text-[10px] uppercase tracking-[0.18em] text-[color-mix(in_srgb,var(--foreground)_42%,transparent)]">
                  {item.label}
                </div>
              </div>
            ))}
          </motion.div>

          <p className="mt-5 min-h-6 text-center text-sm text-[color-mix(in_srgb,var(--foreground)_58%,transparent)]">
            {isStalled ? "Pulseが弱まっています" : isRevived ? "Pulseが戻ってきた" : "今日もPulseが続いています"}
          </p>

          {isStalled ? (
            <Link
              href="/dashboard?view=journey"
              className="mt-4 rounded-lg bg-[var(--electric)] px-5 py-3 font-display text-sm uppercase tracking-[0.16em] text-[var(--surface-1)]"
            >
              今日のJourneyを記録する
            </Link>
          ) : null}
        </motion.section>

        {/* ─── 28日アクティビティ ─── */}
        <motion.section
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mt-8 rounded-lg bg-[var(--surface-2)] p-5"
        >
          <div className="mb-4 flex items-center gap-2 font-display text-sm uppercase tracking-[0.18em] text-[color-mix(in_srgb,var(--foreground)_58%,transparent)]">
            <Activity className="h-4 w-4 text-[var(--electric)]" />
            28 Days Activity
          </div>
          <div className="grid grid-cols-7 gap-3">
            {graphDays.map((day) => {
              const key = getJstDateKey(day);
              const active = stats.activityDays.has(key);
              const isToday = key === todayKey;
              return (
                <div
                  key={key}
                  title={key}
                  className={[
                    "h-4 w-4 rounded-full",
                    active ? "bg-[var(--electric)]" : "bg-[var(--surface-3)]",
                    isToday ? "ring-2 ring-[var(--electric)] ring-offset-2 ring-offset-[var(--surface-2)]" : "",
                  ].join(" ")}
                />
              );
            })}
          </div>
        </motion.section>

        {/* ─── サブ統計 ─── */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.55 }}
          className="mt-4 text-center font-mono text-xs text-[color-mix(in_srgb,var(--foreground)_36%,transparent)]"
        >
          最長継続 {stats.longestStreak}日 &nbsp;/&nbsp; 今週 {stats.weeklyCount}/7 &nbsp;/&nbsp; 総Journey {stats.totalJourneys}
        </motion.p>

        {/* ─── シェアボタン ─── */}
        {pulseScore && slug ? (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.65 }}
            className="mt-6 flex justify-center"
          >
            <PulseShareButton slug={slug} pulseScore={pulseScore} />
          </motion.div>
        ) : null}
      </div>
    </main>
  );
}

function PulseShareButton({ slug, pulseScore }: { slug: string; pulseScore: { score: number; streak: number; cheerCount: number; bondCount: number } }) {
  const [shared, setShared] = useState<"idle" | "done" | "copied">("idle");

  async function handleShare() {
    const url = `${window.location.origin}/u/${slug}`;
    const title = `${slug}のPulse Score — ${pulseScore.score}`;
    const text = `継続${pulseScore.streak}日 / Cheer${pulseScore.cheerCount} / Bond${pulseScore.bondCount}`;
    if (typeof navigator.share !== "undefined") {
      try {
        await navigator.share({ title, text, url });
        setShared("done");
        setTimeout(() => setShared("idle"), 2000);
      } catch { /* キャンセル無視 */ }
    } else {
      try { await navigator.clipboard.writeText(`${title}\n${text}\n${url}`); } catch { /* ignore */ }
      setShared("copied");
      setTimeout(() => setShared("idle"), 2000);
    }
  }

  return (
    <button
      onClick={() => void handleShare()}
      className="flex items-center gap-2 rounded-lg border border-[var(--electric)] bg-[var(--pulse-dim)] px-5 py-3 font-display text-sm uppercase tracking-[0.16em] text-[var(--electric)] transition-opacity hover:opacity-80"
    >
      {shared === "done" ? (
        "シェアしました ✓"
      ) : shared === "copied" ? (
        "コピーしました ✓"
      ) : (
        <>
          <svg width={14} height={14} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" d="M7.217 10.907a2.25 2.25 0 100 2.186m0-2.186c.18.324.283.696.283 1.093s-.103.77-.283 1.093m0-2.186l9.566-5.314m-9.566 7.5l9.566 5.314m0 0a2.25 2.25 0 103.935 2.186 2.25 2.25 0 00-3.935-2.186zm0-12.814a2.25 2.25 0 103.933-2.185 2.25 2.25 0 00-3.933 2.185z" />
          </svg>
          Pulseをシェアする
        </>
      )}
    </button>
  );
}
