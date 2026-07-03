"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { CardHeader, SectionCard, ViewHeader, ViewLoader } from "@/app/(app)/dashboard/components/ui";
import type { DashboardView, ThemeColors } from "@/app/(app)/dashboard/types";
import type { ProfileData } from "@/features/profile/types";
import type { JourneyEntry } from "@/features/journey/types";
import { getConditionMeta } from "@/components/DailyLog/journey";
import { calcDayCount, getJstDateKey } from "@/lib/day-count";
import { computeStreak, computeLongestStreak } from "@/lib/pulse-stats";
import { IconCheer, IconJourney, IconStreak, IconTrophy } from "@/lib/design/icons";

// ─── helpers ──────────────────────────────────────────────────────────────────
function diffJstDays(fromKey: string, toKey: string): number {
  const from = new Date(`${fromKey}T00:00:00+09:00`).getTime();
  const to = new Date(`${toKey}T00:00:00+09:00`).getTime();
  return Math.round((to - from) / 86400000);
}

function addDays(base: Date, days: number) {
  const d = new Date(base);
  d.setDate(d.getDate() + days);
  return d;
}

function formatJa(dateIso: string): string {
  return new Intl.DateTimeFormat("ja-JP", { timeZone: "Asia/Tokyo", month: "2-digit", day: "2-digit" }).format(new Date(dateIso));
}

function monthLabel(dateIso: string): string {
  return new Intl.DateTimeFormat("ja-JP", { timeZone: "Asia/Tokyo", year: "numeric", month: "long" }).format(new Date(dateIso));
}

// コンディション(1-5)を色で表現
const CONDITION_COLOR: Record<number, string> = { 1: "#FF5050", 2: "#FF8A3C", 3: "#FFC81E", 4: "#7FD15B", 5: "#32D278" };


// ─── component ────────────────────────────────────────────────────────────────
export function PortfolioView({
  profile,
  t,
  roleColor,
  setView,
}: {
  profile: ProfileData;
  t: ThemeColors;
  roleColor: string;
  setView: (view: DashboardView) => void;
}) {
  const [journeys, setJourneys] = useState<JourneyEntry[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

  const fetchJourneys = useCallback(async () => {
    setError(null);
    try {
      const res = await fetch("/api/journey/list", { cache: "no-store" });
      if (!res.ok) {
        setError("読み込みに失敗しました");
        setJourneys([]);
        return;
      }
      const data = (await res.json()) as { journeys?: JourneyEntry[] };
      setJourneys(data.journeys ?? []);
    } catch {
      setError("通信エラーが発生しました");
      setJourneys([]);
    }
  }, []);

  useEffect(() => {
    void fetchJourneys();
  }, [fetchJourneys]);

  // 基準日（DAY 0）: day0Date 優先 / 無ければ最古の記録
  const oldestIso = journeys && journeys.length ? journeys[journeys.length - 1].created_at : null;
  const basisKey = useMemo(() => {
    if (profile.day0Date) return getJstDateKey(new Date(profile.day0Date));
    return oldestIso ? getJstDateKey(new Date(oldestIso)) : null;
  }, [profile.day0Date, oldestIso]);

  const dayCount = useMemo(() => calcDayCount(profile.day0Date, oldestIso), [profile.day0Date, oldestIso]);

  const journeyDateStrings = useMemo(() => (journeys ?? []).map((j) => j.created_at), [journeys]);
  const streaks = useMemo(() => ({
    current: computeStreak(journeyDateStrings),
    longest: computeLongestStreak(journeyDateStrings),
  }), [journeyDateStrings]);

  const stats = useMemo(() => {
    const list = journeys ?? [];
    const total = list.length;
    const publicCount = list.filter((j) => j.is_public).length;
    const withMedia = list.some((j) => j.image_url || j.video_url);
    const withTags = list.some((j) => j.tags?.length);
    const totalCheer = list.reduce((s, j) => s + (j.cheer_count ?? 0), 0);
    const scored = list.filter((j) => typeof j.condition_score === "number");
    const avg = scored.length ? scored.reduce((s, j) => s + (j.condition_score ?? 0), 0) / scored.length : 0;
    return { total, publicCount, withMedia, withTags, totalCheer, avg };
  }, [journeys]);

  // Portfolio 完成度
  const completion = useMemo(() => {
    const list = journeys ?? [];
    const items = [
      { label: "DAY 0 を宣言", done: Boolean(profile.day0Date) },
      { label: "はじめての Journey", done: stats.total >= 1 },
      { label: "7 日分の記録", done: stats.total >= 7 },
      { label: "30 日の積み上げ", done: stats.total >= 30 },
      { label: "写真・動画を添付", done: stats.withMedia },
      { label: "活動タグを活用", done: stats.withTags },
      { label: "公開した記録がある", done: stats.publicCount >= 1 },
      { label: "プロフィール自己紹介", done: Boolean(profile.bio?.trim() || profile.claim?.trim()) },
    ];
    void list;
    const doneCount = items.filter((i) => i.done).length;
    const percent = Math.round((doneCount / items.length) * 100);
    const next = items.find((i) => !i.done) ?? null;
    return { items, doneCount, percent, next };
  }, [journeys, profile, stats]);

  const toggleVisibility = useCallback(async (entry: JourneyEntry) => {
    setBusyId(entry.id);
    const next = !entry.is_public;
    setJourneys((prev) => prev?.map((j) => (j.id === entry.id ? { ...j, is_public: next } : j)) ?? prev);
    try {
      const res = await fetch(`/api/journey/${entry.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ is_public: next }),
      });
      if (!res.ok) {
        setJourneys((prev) => prev?.map((j) => (j.id === entry.id ? { ...j, is_public: entry.is_public } : j)) ?? prev);
      }
    } catch {
      setJourneys((prev) => prev?.map((j) => (j.id === entry.id ? { ...j, is_public: entry.is_public } : j)) ?? prev);
    } finally {
      setBusyId(null);
    }
  }, []);

  if (journeys === null) return <ViewLoader t={t} />;

  const day0DateLabel = profile.day0Date
    ? new Intl.DateTimeFormat("ja-JP", { timeZone: "Asia/Tokyo", year: "numeric", month: "long", day: "numeric" }).format(new Date(profile.day0Date))
    : oldestIso
      ? new Intl.DateTimeFormat("ja-JP", { timeZone: "Asia/Tokyo", year: "numeric", month: "long", day: "numeric" }).format(new Date(oldestIso))
      : null;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <ViewHeader title="Portfolio" sub="成長軌跡 / 活動証明" onBack={() => setView("home")} t={t} roleColor={roleColor} />

      {profile.slug ? (
        <a
          href={`/u/${profile.slug}/portfolio`}
          target="_blank"
          rel="noopener noreferrer"
          style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 6, padding: "9px 14px", borderRadius: 12, border: `1px solid ${roleColor}44`, background: `${roleColor}10`, color: roleColor, fontSize: 12, fontWeight: 800, textDecoration: "none", width: "fit-content" }}
        >
          🔗 公開ページを確認・共有
        </a>
      ) : null}

      {/* ── Hero: DAY カウント + 継続 + 完成度ゲージ ── */}
      <SectionCard t={t} accentColor={roleColor}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 18, flexWrap: "wrap" }}>
          <div style={{ minWidth: 160 }}>
            <p style={{ margin: 0, fontSize: 10, fontFamily: "monospace", letterSpacing: "0.22em", textTransform: "uppercase", color: roleColor }}>
              Growth Trajectory
            </p>
            <div style={{ display: "flex", alignItems: "baseline", gap: 8, marginTop: 4 }}>
              <span style={{ fontSize: 13, fontWeight: 800, color: t.sub }}>DAY</span>
              <span style={{ fontFamily: "var(--font-bebas)", fontSize: 56, lineHeight: 1, color: t.text, letterSpacing: "0.02em" }}>
                {dayCount ?? 0}
              </span>
            </div>
            {day0DateLabel ? (
              <p style={{ margin: "6px 0 0", fontSize: 11, color: t.sub }}>
                Since <span style={{ color: t.text, fontWeight: 700 }}>{day0DateLabel}</span>
              </p>
            ) : (
              <p style={{ margin: "6px 0 0", fontSize: 11, color: t.sub }}>まだ DAY 0 が設定されていません</p>
            )}

            <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 12 }}>
              <Chip icon={<IconStreak size={12} />} label="継続" value={`${streaks.current}日`} roleColor={roleColor} t={t} />
              <Chip icon={<IconTrophy size={12} />} label="最長" value={`${streaks.longest}日`} roleColor={roleColor} t={t} />
              <Chip icon={<IconJourney size={12} />} label="記録" value={`${stats.total}`} roleColor={roleColor} t={t} />
              {stats.totalCheer > 0 ? <Chip icon={<IconCheer size={12} style={{ color: "#FFD600" }} />} label="Cheer" value={`${stats.totalCheer}`} roleColor={roleColor} t={t} /> : null}
            </div>
          </div>

          <CompletionGauge percent={completion.percent} roleColor={roleColor} t={t} />
        </div>

        {/* 完成度: 次の一手 */}
        {completion.next ? (
          <button
            type="button"
            onClick={() => setView(completion.next?.label === "プロフィール自己紹介" ? "profile" : "journey")}
            style={{
              marginTop: 14,
              width: "100%",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 10,
              padding: "11px 14px",
              borderRadius: 12,
              border: `1px solid ${roleColor}44`,
              background: `${roleColor}10`,
              color: t.text,
              cursor: "pointer",
            }}
          >
            <span style={{ display: "flex", flexDirection: "column", alignItems: "flex-start", gap: 2 }}>
              <span style={{ fontSize: 10, color: t.sub, fontFamily: "monospace", letterSpacing: "0.1em" }}>NEXT STEP</span>
              <span style={{ fontSize: 13, fontWeight: 800 }}>{completion.next.label}</span>
            </span>
            <span style={{ fontSize: 12, fontWeight: 900, color: roleColor }}>→</span>
          </button>
        ) : (
          <div style={{ marginTop: 14, padding: "11px 14px", borderRadius: 12, border: `1px solid ${roleColor}44`, background: `${roleColor}10`, textAlign: "center", fontSize: 12, fontWeight: 800, color: roleColor }}>
            🎉 Portfolio 完成度 100% を達成しました
          </div>
        )}
      </SectionCard>

      {error ? (
        <SectionCard t={t}>
          <p style={{ margin: 0, fontSize: 13, color: "var(--destructive)" }}>{error}</p>
        </SectionCard>
      ) : null}

      {/* ── 時系列ストーリー ── */}
      <SectionCard t={t}>
        <CardHeader
          title="Story"
          meta={<p style={{ margin: 0, fontSize: 12, color: t.sub, lineHeight: 1.7 }}>DAY 0 から現在までの活動の軌跡。各記録の公開/非公開を切り替えられます。</p>}
        />

        {journeys.length === 0 ? (
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 14, padding: "28px 10px", textAlign: "center" }}>
            <p style={{ margin: 0, fontSize: 13, color: t.sub, lineHeight: 1.8 }}>
              まだ軌跡がありません。<br />Activity で最初の Journey を刻みましょう。
            </p>
            <button
              type="button"
              onClick={() => setView("journey")}
              style={{ padding: "12px 18px", borderRadius: 12, border: "none", background: roleColor, color: "#0B0B0F", fontSize: 13, fontWeight: 800, cursor: "pointer" }}
            >
              Activity を記録する
            </button>
          </div>
        ) : (
          <div style={{ position: "relative" }}>
            {/* 縦のレール */}
            <div style={{ position: "absolute", left: 11, top: 8, bottom: 8, width: 2, background: `linear-gradient(${roleColor}66, ${roleColor}22 70%, ${t.border})` }} />

            {journeys.map((entry, idx) => {
              const iso = entry.created_at;
              const prevIso = idx > 0 ? journeys[idx - 1].created_at : null;
              const showMonth = !prevIso || monthLabel(prevIso) !== monthLabel(iso);
              const dayKey = getJstDateKey(new Date(iso));
              const dayNo = basisKey ? Math.max(0, diffJstDays(basisKey, dayKey)) : null;
              return (
                <div key={entry.id}>
                  {showMonth ? (
                    <div style={{ position: "relative", paddingLeft: 34, margin: "6px 0 10px" }}>
                      <span style={{ fontFamily: "monospace", fontSize: 11, fontWeight: 900, letterSpacing: "0.1em", color: t.sub, textTransform: "uppercase" }}>
                        {monthLabel(iso)}
                      </span>
                    </div>
                  ) : null}
                  <JourneyCard
                    entry={entry}
                    dayNo={dayNo}
                    index={idx}
                    roleColor={roleColor}
                    t={t}
                    busy={busyId === entry.id}
                    onToggle={() => void toggleVisibility(entry)}
                  />
                </div>
              );
            })}

            {/* ── DAY 0 起点ノード ── */}
            <div style={{ position: "relative", paddingLeft: 34, paddingTop: 4 }}>
              <div style={{ position: "absolute", left: 2, top: 6, width: 20, height: 20, borderRadius: "50%", background: `radial-gradient(circle, var(--pulse), ${roleColor})`, boxShadow: `0 0 0 4px ${roleColor}22, 0 0 16px var(--pulse-glow)`, border: "2px solid #0B0B0F" }} />
              <div style={{ borderRadius: 14, border: `1px solid ${roleColor}44`, background: `linear-gradient(160deg, ${roleColor}14, rgba(255,255,255,0.02))`, padding: 14 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: day0DateLabel ? 6 : 0, flexWrap: "wrap" }}>
                  <span style={{ fontFamily: "var(--font-bebas)", fontSize: 20, letterSpacing: "0.04em", color: roleColor }}>DAY 0</span>
                  <span style={{ fontSize: 11, fontWeight: 800, color: t.text }}>はじまりの記録</span>
                  {day0DateLabel ? <span style={{ fontFamily: "monospace", fontSize: 10, color: t.sub }}>{day0DateLabel}</span> : null}
                </div>
                {profile.day0Declaration ? (
                  <p style={{ margin: 0, fontSize: 13, color: t.text, lineHeight: 1.8, whiteSpace: "pre-wrap" }}>「{profile.day0Declaration}」</p>
                ) : (
                  <p style={{ margin: 0, fontSize: 12, color: t.sub, lineHeight: 1.7 }}>あなたの挑戦の原点。ここから全ての軌跡が始まります。</p>
                )}
              </div>
            </div>
          </div>
        )}
      </SectionCard>
    </div>
  );
}

// ─── sub components ──────────────────────────────────────────────────────────
function Chip({ icon, label, value, roleColor, t }: { icon: React.ReactNode; label: string; value: string; roleColor: string; t: ThemeColors }) {
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 5, padding: "5px 10px", borderRadius: 999, border: `1px solid ${t.border}`, background: "rgba(255,255,255,0.03)" }}>
      <span style={{ display: "inline-flex", color: roleColor }} aria-hidden>{icon}</span>
      <span style={{ fontSize: 10, color: t.sub }}>{label}</span>
      <span style={{ fontSize: 12, fontWeight: 900, color: roleColor }}>{value}</span>
    </span>
  );
}

function CompletionGauge({ percent, roleColor, t }: { percent: number; roleColor: string; t: ThemeColors }) {
  const r = 34;
  const c = 2 * Math.PI * r;
  const offset = c - (percent / 100) * c;
  return (
    <div style={{ position: "relative", width: 90, height: 90, flexShrink: 0 }}>
      <svg width={90} height={90} viewBox="0 0 90 90" style={{ transform: "rotate(-90deg)" }}>
        <circle cx={45} cy={45} r={r} fill="none" stroke={t.border} strokeWidth={7} />
        <motion.circle
          cx={45}
          cy={45}
          r={r}
          fill="none"
          stroke={roleColor}
          strokeWidth={7}
          strokeLinecap="round"
          strokeDasharray={c}
          initial={{ strokeDashoffset: c }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
        />
      </svg>
      <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
        <span style={{ fontFamily: "var(--font-bebas)", fontSize: 24, lineHeight: 1, color: t.text }}>{percent}%</span>
        <span style={{ fontSize: 8, color: t.sub, letterSpacing: "0.08em", fontFamily: "monospace" }}>COMPLETE</span>
      </div>
    </div>
  );
}

function JourneyCard({
  entry,
  dayNo,
  index,
  roleColor,
  t,
  busy,
  onToggle,
}: {
  entry: JourneyEntry;
  dayNo: number | null;
  index: number;
  roleColor: string;
  t: ThemeColors;
  busy: boolean;
  onToggle: () => void;
}) {
  const meta = getConditionMeta(entry.condition_score);
  const condColor = entry.condition_score ? CONDITION_COLOR[entry.condition_score] ?? roleColor : t.border;
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: Math.min(index * 0.04, 0.4) }}
      style={{ position: "relative", paddingLeft: 34, paddingBottom: 16 }}
    >
      {/* ノード */}
      <div style={{ position: "absolute", left: 4, top: 6, width: 16, height: 16, borderRadius: "50%", background: condColor, boxShadow: `0 0 0 4px ${condColor}22`, border: "2px solid #0B0B0F" }} />

      <div style={{ position: "relative", borderRadius: 14, border: `1px solid ${entry.is_public ? t.border : `${roleColor}33`}`, background: "rgba(255,255,255,0.02)", padding: 14, overflow: "hidden" }}>
        {/* コンディション縦アクセント */}
        <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: 3, background: condColor, opacity: 0.85 }} />

        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10, flexWrap: "wrap", marginBottom: 8 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
            {dayNo !== null ? (
              <span style={{ fontFamily: "monospace", fontSize: 11, fontWeight: 900, color: roleColor, letterSpacing: "0.06em" }}>DAY {dayNo}</span>
            ) : null}
            <span style={{ fontFamily: "monospace", fontSize: 11, color: t.sub }}>{formatJa(entry.created_at)}</span>
            {meta ? <span style={{ fontSize: 12 }}>{meta.emoji}</span> : null}
            {entry.cheer_count > 0 ? <span style={{ fontSize: 11, color: "#FFD600", fontWeight: 800 }}>★{entry.cheer_count}</span> : null}
          </div>

          <button
            type="button"
            onClick={onToggle}
            disabled={busy}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 5,
              padding: "4px 9px",
              borderRadius: 999,
              border: `1px solid ${entry.is_public ? `${roleColor}55` : t.border}`,
              background: entry.is_public ? `${roleColor}14` : "rgba(255,255,255,0.03)",
              color: entry.is_public ? roleColor : t.sub,
              fontSize: 10,
              fontWeight: 800,
              cursor: busy ? "wait" : "pointer",
            }}
          >
            {entry.is_public ? "🌐 公開" : "🔒 非公開"}
          </button>
        </div>

        <p style={{ margin: 0, fontSize: 13, color: t.text, lineHeight: 1.8, whiteSpace: "pre-wrap" }}>{entry.content}</p>

        {entry.image_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={entry.image_url} alt="記録画像" style={{ marginTop: 10, width: "100%", maxWidth: 340, borderRadius: 10, border: `1px solid ${t.border}` }} />
        ) : null}
        {entry.video_url ? (
          <video src={entry.video_url} controls style={{ marginTop: 10, width: "100%", maxWidth: 340, borderRadius: 10, border: `1px solid ${t.border}` }} />
        ) : null}

        {entry.tags?.length ? (
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginTop: 10 }}>
            {entry.tags.map((tag) => (
              <span key={tag} style={{ padding: "3px 8px", borderRadius: 999, border: `1px solid ${t.border}`, background: "rgba(255,255,255,0.03)", color: t.sub, fontSize: 10, fontWeight: 700 }}>
                {tag}
              </span>
            ))}
          </div>
        ) : null}
      </div>
    </motion.div>
  );
}
