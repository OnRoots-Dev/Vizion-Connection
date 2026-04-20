"use client";

import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { ActionPill, CardHeader, SectionCard, SLabel, ViewHeader } from "@/app/(app)/dashboard/components/ui";
import type { DashboardView, ThemeColors } from "@/app/(app)/dashboard/types";
import type { ProfileData } from "@/features/profile/types";
import { useDailyLogStore } from "@/hooks/useDailyLogStore";
import { CONDITION_OPTIONS, getConditionMeta, getJourneyHype, getRandomJourneyTemplateSuggestions, getTodayString, JOURNEY_MAX_CHARS } from "@/components/DailyLog/journey";

function getDateKey(offset: number) {
  const date = new Date();
  date.setDate(date.getDate() - offset);
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Tokyo",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date);
}

function addDays(base: Date, days: number) {
  const d = new Date(base);
  d.setDate(d.getDate() + days);
  return d;
}

function startOfWeekMonday(base: Date) {
  const d = new Date(base);
  d.setHours(0, 0, 0, 0);
  const dow = d.getDay();
  const diff = (dow + 6) % 7;
  d.setDate(d.getDate() - diff);
  return d;
}

function formatDateKeyJst(date: Date) {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Tokyo",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date);
}

function formatRangeJst(start: Date, endExclusive: Date) {
  const fmt = new Intl.DateTimeFormat("ja-JP", { timeZone: "Asia/Tokyo", month: "2-digit", day: "2-digit" });
  const s = fmt.format(start);
  const e = fmt.format(addDays(endExclusive, -1));
  return `${s} - ${e}`;
}

function getHourJst(iso?: string | null): number | null {
  if (!iso) return null;
  const formatted = new Intl.DateTimeFormat("en-GB", {
    timeZone: "Asia/Tokyo",
    hour: "2-digit",
    hourCycle: "h23",
  }).format(new Date(iso));
  const hour = Number(formatted);
  return Number.isFinite(hour) ? hour : null;
}

export function MyJourneyView({
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
  const { logs, todayLog, isLoading, isSubmitting, hasLoaded, error, fetchLogs, submitLog } = useDailyLogStore();
  const [content, setContent] = useState("");
  const [conditionScore, setConditionScore] = useState<number | null>(null);

  useEffect(() => {
    if (!hasLoaded) {
      void fetchLogs();
    }
  }, [fetchLogs, hasLoaded]);

  const remaining = useMemo(() => JOURNEY_MAX_CHARS - content.length, [content.length]);
  const canSubmit = content.trim().length > 0 && conditionScore !== null && !isSubmitting && !todayLog;
  const todayCondition = getConditionMeta(todayLog?.condition_score);
  const hypeMessage = useMemo(() => getJourneyHype(todayLog), [todayLog]);
  const templateSuggestions = useMemo(() => getRandomJourneyTemplateSuggestions(profile.role), [profile.role]);

  const logMap = useMemo(() => new Map(logs.map((log) => [log.log_date, log])), [logs]);

  const monthDays = useMemo(() => Array.from({ length: 30 }, (_, index) => getDateKey(29 - index)), []);
  const monthlyCount = useMemo(() => monthDays.reduce((count, day) => count + (logMap.has(day) ? 1 : 0), 0), [logMap, monthDays]);
  const streak = useMemo(() => {
    let count = 0;
    for (let i = 0; i < 30; i += 1) {
      if (logMap.has(getDateKey(i))) {
        count += 1;
      } else {
        break;
      }
    }
    return count;
  }, [logMap]);

  const weeklyStats = useMemo(
    () =>
      Array.from({ length: 4 }, (_, index) => {
        const slice = monthDays.slice(index * 7, index * 7 + 7);
        const total = slice.reduce((sum, day) => sum + (logMap.get(day)?.condition_score ?? 0), 0);
        const count = slice.filter((day) => logMap.has(day)).length;
        return {
          label: `W${index + 1}`,
          count,
          avg: count > 0 ? total / count : 0,
        };
      }),
    [logMap, monthDays],
  );

  const morningBonusEligible = useMemo(() => {
    const hour = getHourJst(todayLog?.created_at);
    return hour !== null && hour >= 4 && hour < 10;
  }, [todayLog?.created_at]);

  const [weekOffset, setWeekOffset] = useState(0);
  const [weekExpanded, setWeekExpanded] = useState(false);

  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(max-width: 640px)");
    const update = () => setIsMobile(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  const weekStart = useMemo(() => addDays(startOfWeekMonday(new Date()), weekOffset * 7), [weekOffset]);
  const weekDays = useMemo(() => Array.from({ length: 7 }, (_, i) => addDays(weekStart, i)), [weekStart]);
  const weekKeys = useMemo(() => weekDays.map((d) => formatDateKeyJst(d)), [weekDays]);
  const weekRangeLabel = useMemo(() => formatRangeJst(weekStart, addDays(weekStart, 7)), [weekStart]);

  const weekLogs = useMemo(
    () =>
      weekKeys
        .map((k) => logMap.get(k))
        .filter((v): v is NonNullable<typeof v> => Boolean(v))
        .slice()
        .sort((a, b) => String(b.log_date).localeCompare(String(a.log_date))),
    [logMap, weekKeys],
  );

  const [selectedDayKey, setSelectedDayKey] = useState<string>(() => getTodayString());

  useEffect(() => {
    setWeekExpanded(false);
    const todayKey = getTodayString();
    if (weekKeys.includes(todayKey)) {
      setSelectedDayKey(todayKey);
      return;
    }
    setSelectedDayKey(weekKeys[0] ?? todayKey);
  }, [weekKeys]);

  const selectedLog = useMemo(() => logMap.get(selectedDayKey) ?? null, [logMap, selectedDayKey]);

  const weekNav = (
    <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
      <button
        type="button"
        onClick={() => setWeekOffset((v) => v - 1)}
        style={{ padding: "7px 10px", borderRadius: 10, border: `1px solid ${t.border}`, background: "rgba(255,255,255,0.04)", color: t.text, cursor: "pointer", fontWeight: 900, fontSize: 11 }}
      >
        ← 前週
      </button>
      <div style={{ padding: "7px 10px", borderRadius: 10, border: `1px solid ${t.border}`, background: "rgba(255,255,255,0.02)", fontFamily: "monospace", fontSize: 11, fontWeight: 900, color: t.sub }}>
        {weekRangeLabel}
      </div>
      <button
        type="button"
        onClick={() => setWeekOffset((v) => v + 1)}
        style={{ padding: "7px 10px", borderRadius: 10, border: `1px solid ${t.border}`, background: "rgba(255,255,255,0.04)", color: t.text, cursor: "pointer", fontWeight: 900, fontSize: 11 }}
      >
        次週 →
      </button>
    </div>
  );

  async function handleSubmit() {
    if (!canSubmit || conditionScore === null) return;

    const ok = await submitLog({
      content: content.trim(),
      conditionScore,
    });

    if (ok) {
      setContent("");
      setConditionScore(null);
    }
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <ViewHeader title="My Journey" sub="記録画面" onBack={() => setView("home")} t={t} roleColor={roleColor} />

      <SectionCard t={t}>
        <SLabel text="AD SLOT" color="#FFD600" />
        <p style={{ margin: 0, fontSize: 11, color: t.sub, opacity: 0.5 }}>スポンサー広告枠（空き枠）</p>
      </SectionCard>

      <SectionCard t={t} accentColor={roleColor}>
        <CardHeader
          title="Today's Hype"
          color={roleColor}
          meta={<p style={{ margin: 0, fontSize: 12, color: t.sub, lineHeight: 1.7 }}>一言と気分を残して、日々の積み上がりを見える化します。</p>}
        />

        <div style={{ display: "grid", gap: 12 }}>
          <div style={{ borderRadius: 0, border: "none", background: "transparent", padding: 0 }}>
            <p style={{ margin: "0 0 10px", fontSize: 10, color: t.sub, fontWeight: 900, letterSpacing: "0.14em", textTransform: "uppercase", fontFamily: "monospace" }}>
              Today + Your HYPE
            </p>

            {error ? (
              <div style={{ marginBottom: 12, padding: "10px 12px", borderRadius: 0, border: "1px solid rgba(255,80,80,0.2)", background: "rgba(255,80,80,0.08)", color: "rgba(255,160,160,0.95)", fontSize: 12 }}>
                {error}
              </div>
            ) : null}

            {!hasLoaded && isLoading ? <div style={{ padding: "12px 0", fontSize: 12, color: t.sub }}>読み込み中...</div> : null}

            {todayLog ? (
              <div style={{ display: "grid", gap: 12 }}>
                <div style={{ padding: "14px 16px", borderRadius: 0, border: `1px solid ${t.border}`, background: "rgba(255,255,255,0.03)" }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, marginBottom: 8, flexWrap: "wrap" }}>
                    <p style={{ margin: 0, fontSize: 10, color: t.sub, fontWeight: 900, letterSpacing: "0.14em", textTransform: "uppercase", fontFamily: "monospace" }}>
                      {getTodayString()}
                    </p>
                    <span style={{ fontSize: 12, color: t.text }}>
                      {todayCondition?.emoji ?? "🙂"} {todayCondition?.label ?? "記録済み"} / {todayLog.condition_score ?? "-"}点
                    </span>
                  </div>
                  <p style={{ margin: 0, fontSize: 14, color: t.text, lineHeight: 1.8, whiteSpace: "pre-wrap" }}>{todayLog.content}</p>
                </div>
                <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                  <ActionPill onClick={() => setView("home")} color={roleColor} t={t}>ダッシュボードへ</ActionPill>
                  <div style={{ display: "inline-flex", alignItems: "center", padding: "6px 12px", borderRadius: 0, border: `1px solid ${roleColor}24`, background: `${roleColor}10`, color: t.text, fontSize: 11 }}>
                    {morningBonusEligible ? "+10pt 対象で記録済み" : "本日の記録を保存済み"}
                  </div>
                </div>
              </div>
            ) : (
              <div style={{ display: "grid", gap: 12 }}>
                <div>
                  <textarea
                    value={content}
                    onChange={(event) => setContent(event.target.value.slice(0, JOURNEY_MAX_CHARS))}
                    maxLength={JOURNEY_MAX_CHARS}
                    placeholder="今日の一言・取り組みを記録しよう"
                    rows={5}
                    style={{ width: "100%", resize: "vertical", borderRadius: 0, border: `1px solid ${t.border}`, background: "rgba(255,255,255,0.03)", color: t.text, padding: "13px 14px", fontSize: 13, lineHeight: 1.7, outline: "none", minHeight: 140 }}
                  />
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 8, gap: 10, flexWrap: "wrap" }}>
                    <span style={{ fontSize: 10, color: t.sub }}>4:00-10:00 の記録で +10pt</span>
                    <span style={{ fontSize: 10, color: remaining >= 0 ? t.sub : "rgba(255,80,80,0.9)" }}>残り{remaining}文字</span>
                  </div>
                </div>

                <div style={{ display: "grid", gap: 8 }}>
                  <p style={{ margin: 0, fontSize: 10, color: t.sub, fontWeight: 900, letterSpacing: "0.14em", textTransform: "uppercase", fontFamily: "monospace" }}>
                    Templates
                  </p>
                  <div style={{ display: "grid", gap: 8 }}>
                    {templateSuggestions.map((text) => (
                      <button
                        key={text}
                        type="button"
                        onClick={() => setContent(text.slice(0, JOURNEY_MAX_CHARS))}
                        style={{
                          textAlign: "left",
                          width: "100%",
                          padding: "12px 12px",
                          borderRadius: 0,
                          border: `1px solid ${t.border}`,
                          background: "rgba(255,255,255,0.02)",
                          color: t.text,
                          cursor: "pointer",
                          fontSize: 13,
                          lineHeight: 1.7,
                        }}
                      >
                        {text}
                      </button>
                    ))}
                  </div>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "repeat(5, minmax(0, 1fr))", gap: 8 }}>
                  {CONDITION_OPTIONS.map((option) => {
                    const selected = conditionScore === option.score;
                    return (
                      <motion.button
                        key={option.score}
                        type="button"
                        whileTap={{ scale: 0.96 }}
                        animate={{ scale: selected ? 1.03 : 1 }}
                        onClick={() => setConditionScore(option.score)}
                        style={{
                          borderRadius: 0,
                          border: `1px solid ${selected ? `${roleColor}44` : t.border}`,
                          background: selected ? `${roleColor}18` : "rgba(255,255,255,0.03)",
                          color: selected ? t.text : t.sub,
                          padding: "12px 6px",
                          cursor: "pointer",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          flexDirection: "column",
                          gap: 6,
                        }}
                        aria-label={option.label}
                      >
                        <span style={{ fontSize: 22, lineHeight: 1 }}>{option.emoji}</span>
                        <span style={{ fontSize: 10 }}>{option.label}</span>
                      </motion.button>
                    );
                  })}
                </div>

                <button
                  type="button"
                  className="vz-btn"
                  onClick={handleSubmit}
                  disabled={!canSubmit}
                  style={{ width: "100%", border: "none", borderRadius: 0, padding: "13px 14px", background: canSubmit ? roleColor : "rgba(255,255,255,0.08)", color: canSubmit ? "#0B0B0F" : "rgba(255,255,255,0.35)", fontSize: 13, fontWeight: 800, cursor: canSubmit ? "pointer" : "not-allowed" }}
                >
                  {isSubmitting ? "記録中..." : "Journeyを記録"}
                </button>
              </div>
            )}
            <div style={{ marginTop: 14 }}>
              <div style={{ position: "relative", padding: "6px 0 14px" }}>
                <div style={{ position: "absolute", inset: "-12px -10px", borderRadius: 0, background: `radial-gradient(circle at 40% 40%, ${roleColor}40, transparent 62%)`, filter: "blur(18px)", opacity: 0.9, pointerEvents: "none" }} />
                <p style={{ position: "relative", margin: 0, fontSize: 14, color: t.text, lineHeight: 1.9, fontWeight: 800 }}>
                  “{hypeMessage.replace(/^Your Hype:\s*/, "")}”
                </p>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: 10 }}>
                <div style={{ padding: 0, borderRadius: 0, border: "none", background: "transparent" }}>
                  <p style={{ margin: "0 0 6px", fontSize: 9, color: t.sub, fontFamily: "monospace", letterSpacing: "0.14em", textTransform: "uppercase" }}>Monthly Log</p>
                  <p style={{ margin: 0, fontSize: 28, fontWeight: 900, color: t.text }}>{monthlyCount}<span style={{ fontSize: 12, color: t.sub }}> / 30日</span></p>
                </div>
                <div style={{ padding: 0, borderRadius: 0, border: "none", background: "transparent" }}>
                  <p style={{ margin: "0 0 6px", fontSize: 9, color: t.sub, fontFamily: "monospace", letterSpacing: "0.14em", textTransform: "uppercase" }}>Habit Streak</p>
                  <p style={{ margin: 0, fontSize: 28, fontWeight: 900, color: roleColor }}>{streak}<span style={{ fontSize: 12, color: t.sub }}> 日連続</span></p>
                </div>
                <div style={{ padding: 0, borderRadius: 0, border: "none", background: "transparent" }}>
                  <p style={{ margin: "0 0 6px", fontSize: 9, color: t.sub, fontFamily: "monospace", letterSpacing: "0.14em", textTransform: "uppercase" }}>Morning Bonus</p>
                  <p style={{ margin: 0, fontSize: 24, fontWeight: 900, color: morningBonusEligible ? roleColor : t.text }}>{morningBonusEligible ? "+10pt" : "4:00-10:00"}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </SectionCard>

      <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: 12 }}>
        <SectionCard t={t}>
          <CardHeader
            title="Last 30 Days"
            meta={<p style={{ margin: 0, fontSize: 12, color: t.sub, lineHeight: 1.7 }}>記録の有無とコンディションの流れをざっと見返せます。</p>}
            action={weekNav}
          />

          <div style={{ display: "grid", gap: 10 }}>
            <div
              style={
                isMobile
                  ? {
                      display: "grid",
                      gridAutoFlow: "column",
                      gridAutoColumns: "calc((100% - 16px) / 3)",
                      gap: 8,
                      overflowX: "auto",
                      paddingBottom: 6,
                      scrollSnapType: "x mandatory",
                      WebkitOverflowScrolling: "touch",
                    }
                  : { display: "grid", gridTemplateColumns: "repeat(7, minmax(0, 1fr))", gap: 8 }
              }
            >
              {weekDays.map((d, idx) => {
                const key = weekKeys[idx] ?? "";
                const log = key ? logMap.get(key) : undefined;
                const score = log?.condition_score ?? 0;
                const intensity = score > 0 ? 0.14 + score * 0.10 : 0.035;
                const isToday = key === getTodayString();
                const selected = key === selectedDayKey;
                const dayLabel = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"][idx] ?? "";

                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() => setSelectedDayKey(key)}
                    style={{
                      scrollSnapAlign: isMobile ? "start" : undefined,
                      borderRadius: 14,
                      border: `1px solid ${selected ? `${roleColor}85` : isToday ? `${roleColor}55` : "rgba(255,255,255,0.10)"}`,
                      background: log ? `linear-gradient(180deg, rgba(255,255,255,${intensity}), rgba(255,255,255,0.02))` : "rgba(255,255,255,0.02)",
                      boxShadow: log ? `0 0 16px ${roleColor}12, inset 0 0 0 1px ${roleColor}14` : "none",
                      color: t.text,
                      padding: "10px 10px",
                      cursor: "pointer",
                      textAlign: "left",
                      minHeight: 84,
                      outline: "none",
                      overflow: "hidden",
                    }}
                    title={log ? `${key} / score ${score}` : `${key} / no log`}
                  >
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8, marginBottom: 6 }}>
                      <span style={{ fontSize: 9, fontFamily: "monospace", letterSpacing: "0.12em", color: t.sub, opacity: 0.9, textTransform: "uppercase" }}>{dayLabel}</span>
                      {log ? <span style={{ fontSize: 12, fontWeight: 900, color: roleColor }}>{score}</span> : <span style={{ fontSize: 10, color: t.sub, opacity: 0.6 }}>—</span>}
                    </div>
                    <div style={{ fontSize: 11, fontFamily: "monospace", color: t.sub }}>{new Intl.DateTimeFormat("ja-JP", { month: "2-digit", day: "2-digit" }).format(d)}</div>
                    {log ? (
                      <div style={{ marginTop: 6, fontSize: 10, color: "rgba(255,255,255,0.62)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{log.content}</div>
                    ) : null}
                  </button>
                );
              })}
            </div>

            <div
              style={{
                borderRadius: 16,
                border: `1px solid ${roleColor}66`,
                background: `linear-gradient(180deg, ${roleColor}14, rgba(255,255,255,0.02))`,
                boxShadow: `0 0 0 1px ${roleColor}14, 0 10px 30px rgba(0,0,0,0.35)`,
                padding: "14px 14px",
              }}
            >
              {selectedLog ? (
                (() => {
                  const meta = getConditionMeta(selectedLog.condition_score);
                  return (
                    <div>
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10, marginBottom: 8, flexWrap: "wrap" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                          <span style={{ padding: "4px 8px", borderRadius: 999, border: `1px solid ${roleColor}55`, background: `${roleColor}18`, color: t.text, fontSize: 10, fontWeight: 900 }}>
                            選択中
                          </span>
                          <span style={{ fontSize: 10, fontFamily: "monospace", color: t.sub, letterSpacing: "0.12em", textTransform: "uppercase" }}>{selectedLog.log_date}</span>
                        </div>
                        <span style={{ fontSize: 12, color: t.text, fontWeight: 900 }}>{meta?.emoji ?? "🙂"} {meta?.label ?? ""} / {selectedLog.condition_score ?? "-"}点</span>
                      </div>
                      <p style={{ margin: 0, fontSize: 13, color: t.text, lineHeight: 1.9, whiteSpace: "pre-wrap" }}>{selectedLog.content}</p>
                    </div>
                  );
                })()
              ) : (
                <p style={{ margin: 0, fontSize: 12, color: t.sub }}>この日の記録はありません。</p>
              )}
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {weekLogs.length === 0 ? (
                <p style={{ margin: 0, fontSize: 12, color: t.sub }}>この週の記録はまだありません。</p>
              ) : (
                (weekExpanded ? weekLogs : weekLogs.slice(0, 3)).map((log) => {
                  const meta = getConditionMeta(log.condition_score);
                  return (
                    <div
                      key={log.log_date}
                      style={{
                        borderRadius: 14,
                        border: `1px solid ${t.border}`,
                        background: "rgba(255,255,255,0.02)",
                        padding: "12px 14px",
                      }}
                    >
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10, marginBottom: 6, flexWrap: "wrap" }}>
                        <span style={{ fontSize: 10, fontFamily: "monospace", color: t.sub, letterSpacing: "0.12em", textTransform: "uppercase" }}>{log.log_date}</span>
                        <span style={{ fontSize: 12, color: t.text, fontWeight: 800 }}>{meta?.emoji ?? "🙂"} {meta?.label ?? ""} / {log.condition_score ?? "-"}点</span>
                      </div>
                      <p style={{ margin: 0, fontSize: 13, color: t.text, lineHeight: 1.8, whiteSpace: "pre-wrap" }}>{log.content}</p>
                    </div>
                  );
                })
              )}

              {weekLogs.length > 3 ? (
                <button
                  type="button"
                  onClick={() => setWeekExpanded((v) => !v)}
                  style={{
                    padding: "10px 12px",
                    borderRadius: 12,
                    border: `1px solid ${t.border}`,
                    background: "rgba(255,255,255,0.03)",
                    color: t.text,
                    cursor: "pointer",
                    fontWeight: 900,
                    fontSize: 12,
                  }}
                >
                  {weekExpanded ? "閉じる" : "もっと見る →"}
                </button>
              ) : null}
            </div>
          </div>
        </SectionCard>

        <SectionCard t={t}>
          <CardHeader
            title="Habit Graph"
            meta={<p style={{ margin: 0, fontSize: 12, color: t.sub, lineHeight: 1.7 }}>7日分のコンディション推移です。</p>}
            action={weekNav}
          />

          {(() => {
            const scores = weekKeys.map((k) => {
              const v = logMap.get(k)?.condition_score;
              return typeof v === "number" && Number.isFinite(v) ? Math.max(1, Math.min(5, v)) : null;
            });

            const w = 520;
            const h = 140;
            const padX = 18;
            const padY = 18;
            const innerW = w - padX * 2;
            const innerH = h - padY * 2;
            const stepX = innerW / 6;

            const toY = (score: number) => {
              const tScore = (score - 1) / 4;
              return padY + (1 - tScore) * innerH;
            };

            const points = scores
              .map((s, i) => (s === null ? null : `${padX + i * stepX},${toY(s)}`))
              .filter((v): v is string => Boolean(v));

            const showNoData = points.length === 0;

            return (
              <div style={{ display: "grid", gap: 10 }}>
                <div style={{ borderRadius: 16, border: `1px solid ${t.border}`, background: "rgba(255,255,255,0.02)", overflow: "hidden" }}>
                  <svg viewBox={`0 0 ${w} ${h}`} width="100%" height={h} preserveAspectRatio="none" style={{ display: "block" }}>
                    <defs>
                      <linearGradient id="vzWeekLine" x1="0" y1="0" x2="1" y2="0">
                        <stop offset="0%" stopColor={roleColor} stopOpacity={0.95} />
                        <stop offset="100%" stopColor={roleColor} stopOpacity={0.45} />
                      </linearGradient>
                    </defs>

                    {[1, 2, 3, 4, 5].map((v) => {
                      const y = toY(v);
                      return <line key={v} x1={0} y1={y} x2={w} y2={y} stroke="rgba(255,255,255,0.06)" strokeWidth={1} />;
                    })}

                    {weekDays.map((_, i) => {
                      const x = padX + i * stepX;
                      return <line key={i} x1={x} y1={0} x2={x} y2={h} stroke="rgba(255,255,255,0.04)" strokeWidth={1} />;
                    })}

                    {showNoData ? null : (
                      <polyline fill="none" stroke="url(#vzWeekLine)" strokeWidth={3} strokeLinejoin="round" strokeLinecap="round" points={points.join(" ")} />
                    )}

                    {scores.map((s, i) => {
                      if (s === null) return null;
                      const x = padX + i * stepX;
                      const y = toY(s);
                      return (
                        <g key={i}>
                          <circle cx={x} cy={y} r={6} fill={roleColor} fillOpacity={0.18} />
                          <circle cx={x} cy={y} r={3} fill={roleColor} />
                        </g>
                      );
                    })}
                  </svg>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "repeat(7, minmax(0, 1fr))", gap: 8 }}>
                  {weekDays.map((d, i) => (
                    <div key={weekKeys[i]} style={{ textAlign: "center", fontSize: 10, fontFamily: "monospace", color: t.sub, opacity: 0.8 }}>
                      {new Intl.DateTimeFormat("ja-JP", { month: "2-digit", day: "2-digit" }).format(d)}
                    </div>
                  ))}
                </div>

                {showNoData ? <p style={{ margin: 0, fontSize: 12, color: t.sub }}>この週のデータがありません。</p> : null}
              </div>
            );
          })()}
        </SectionCard>
      </div>

      <SectionCard t={t}>
        <SLabel text="AD SLOT" color="#FFD600" />
        <p style={{ margin: 0, fontSize: 11, color: t.sub, opacity: 0.5 }}>スポンサー広告枠（空き枠）</p>
      </SectionCard>
    </div>
  );
}
