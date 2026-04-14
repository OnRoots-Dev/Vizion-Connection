"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import type { ProfileData } from "@/features/profile/types";
import type { Schedule, ScheduleCategory } from "@/types/schedule";
import { CATEGORY_CONFIG } from "@/types/schedule";
import { AnimatePresence, motion } from "framer-motion";

function pad2(n: number) {
  return String(n).padStart(2, "0");
}

function toLocalDatetimeValue(d: Date) {
  const yyyy = d.getFullYear();
  const mm = pad2(d.getMonth() + 1);
  const dd = pad2(d.getDate());
  const hh = pad2(d.getHours());
  const mi = pad2(d.getMinutes());
  return `${yyyy}-${mm}-${dd}T${hh}:${mi}`;
}

function startOfMonth(d: Date) {
  return new Date(d.getFullYear(), d.getMonth(), 1, 0, 0, 0, 0);
}

function startOfWeek(d: Date) {
  const base = startOfDay(d);
  const dow = base.getDay();
  const s = new Date(base);
  s.setDate(base.getDate() - dow);
  return s;
}

function startOfDay(d: Date) {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate(), 0, 0, 0, 0);
}

function addMonths(d: Date, diff: number) {
  return new Date(d.getFullYear(), d.getMonth() + diff, 1, 0, 0, 0, 0);
}

function addDays(d: Date, diff: number) {
  const n = new Date(d);
  n.setDate(d.getDate() + diff);
  return n;
}

function diffDays(a: Date, b: Date) {
  const aa = startOfDay(a).getTime();
  const bb = startOfDay(b).getTime();
  return Math.round((aa - bb) / 86400000);
}

function getScheduleDayRange(s: Schedule) {
  const start = new Date(s.start_at);
  const startDay = startOfDay(start);

  if (!s.end_at) {
    return { startDay, endDay: startDay };
  }

  const end = new Date(s.end_at);
  // Treat end_at as exclusive so events ending exactly at 00:00 do not count as the next day.
  const endMinus = new Date(Math.max(end.getTime() - 1, start.getTime()));
  const endDay = startOfDay(endMinus);
  return { startDay, endDay };
}

type WeekSegment = {
  schedule: Schedule;
  startCol: number;
  endCol: number;
  lane: number;
  isStart: boolean;
  isEnd: boolean;
};

function buildWeekSegments(weekStartDay: Date, schedules: Schedule[]): { segments: WeekSegment[]; laneCount: number } {
  const weekEndDay = addDays(weekStartDay, 6);
  const raw: Omit<WeekSegment, "lane">[] = [];

  for (const s of schedules) {
    const { startDay, endDay } = getScheduleDayRange(s);
    if (endDay.getTime() < weekStartDay.getTime()) continue;
    if (startDay.getTime() > weekEndDay.getTime()) continue;

    const segStartDay = startDay.getTime() < weekStartDay.getTime() ? weekStartDay : startDay;
    const segEndDay = endDay.getTime() > weekEndDay.getTime() ? weekEndDay : endDay;

    const startCol = Math.max(0, Math.min(6, diffDays(segStartDay, weekStartDay)));
    const endCol = Math.max(0, Math.min(6, diffDays(segEndDay, weekStartDay)));

    raw.push({
      schedule: s,
      startCol,
      endCol,
      isStart: segStartDay.getTime() === startDay.getTime(),
      isEnd: segEndDay.getTime() === endDay.getTime(),
    });
  }

  raw.sort((a, b) => {
    if (a.startCol !== b.startCol) return a.startCol - b.startCol;
    return (b.endCol - b.startCol) - (a.endCol - a.startCol);
  });

  const laneEnds: number[] = [];
  const segments: WeekSegment[] = [];

  for (const seg of raw) {
    let lane = laneEnds.findIndex((endCol) => seg.startCol > endCol);
    if (lane === -1) {
      lane = laneEnds.length;
      laneEnds.push(-1);
    }
    laneEnds[lane] = seg.endCol;
    segments.push({ ...seg, lane });
  }

  return { segments, laneCount: laneEnds.length };
}

function isSameDay(a: Date, b: Date) {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

function withinMonth(d: Date, month: Date) {
  return d.getFullYear() === month.getFullYear() && d.getMonth() === month.getMonth();
}

function buildMonthGrid(month: Date) {
  const first = startOfMonth(month);
  const firstDow = first.getDay();
  const start = new Date(first);
  start.setDate(first.getDate() - firstDow);

  const days: Date[] = [];
  for (let i = 0; i < 42; i++) {
    const d = new Date(start);
    d.setDate(start.getDate() + i);
    days.push(d);
  }
  return days;
}

const LOCK_ICON_PATH =
  "M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 0h10.5A2.25 2.25 0 0119.5 12.75v6A2.25 2.25 0 0117.25 21h-10.5A2.25 2.25 0 014.5 18.75v-6A2.25 2.25 0 016.75 10.5z";

type DraftSchedule = {
  id?: string;
  title: string;
  start_at: string;
  end_at: string;
  location: string;
  description: string;
  category: ScheduleCategory;
  is_public: boolean;
};

function toDraft(s: Schedule): DraftSchedule {
  return {
    id: s.id,
    title: s.title,
    start_at: toLocalDatetimeValue(new Date(s.start_at)),
    end_at: s.end_at ? toLocalDatetimeValue(new Date(s.end_at)) : "",
    location: s.location ?? "",
    description: s.description ?? "",
    category: s.category,
    is_public: Boolean(s.is_public),
  };
}

export default function ScheduleClient({ profile, embedded = false }: { profile: ProfileData; embedded?: boolean }) {
  const canEdit = true;

  const [viewMode, setViewMode] = useState<"month" | "week">("month");
  const [month, setMonth] = useState(() => startOfMonth(new Date()));
  const [focusDate, setFocusDate] = useState(() => startOfDay(new Date()));
  const [items, setItems] = useState<Schedule[]>([]);
  const [loading, setLoading] = useState(false);
  const [selected, setSelected] = useState<Schedule | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [draft, setDraft] = useState<DraftSchedule>(() => ({
    title: "",
    start_at: toLocalDatetimeValue(new Date()),
    end_at: "",
    location: "",
    description: "",
    category: "practice",
    is_public: true,
  }));
  const [saving, setSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const rangeStart = useMemo(() => {
    if (viewMode === "week") return startOfWeek(focusDate);
    return startOfMonth(month);
  }, [focusDate, month, viewMode]);

  const rangeEnd = useMemo(() => {
    if (viewMode === "week") return addDays(startOfWeek(focusDate), 7);
    return addMonths(month, 1);
  }, [focusDate, month, viewMode]);

  const fetchRange = useCallback(async () => {
    setLoading(true);
    try {
      const qs = new URLSearchParams({
        start: rangeStart.toISOString(),
        end: rangeEnd.toISOString(),
      });
      const res = await fetch(`/api/schedules/mine?${qs.toString()}`, { cache: "no-store" });
      const json = await res.json().catch(() => ({}));
      if (!res.ok || json?.success === false) {
        console.error("[ScheduleClient] fetchRange failed", { status: res.status, json });
        setItems([]);
        return;
      }
      setItems(Array.isArray(json.schedules) ? (json.schedules as Schedule[]) : []);
    } catch (err) {
      console.error("[ScheduleClient] fetchRange error", err);
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, [rangeEnd, rangeStart]);

  useEffect(() => {
    fetchRange().catch(() => undefined);
  }, [fetchRange]);

  const grid = useMemo(() => buildMonthGrid(month), [month]);

  const monthWeeks = useMemo(() => {
    const weeks: Date[][] = [];
    for (let i = 0; i < 6; i++) {
      weeks.push(grid.slice(i * 7, i * 7 + 7));
    }
    return weeks;
  }, [grid]);

  const monthWeekLayouts = useMemo(() => {
    const multiDay = items.filter((s) => {
      const { startDay, endDay } = getScheduleDayRange(s);
      return startDay.getTime() !== endDay.getTime();
    });
    return monthWeeks.map((week) => buildWeekSegments(startOfDay(week[0]), multiDay));
  }, [items, monthWeeks]);

  const weekStart = useMemo(() => startOfWeek(focusDate), [focusDate]);
  const weekDays = useMemo(() => Array.from({ length: 7 }).map((_, i) => addDays(weekStart, i)), [weekStart]);

  const weekSpanLayout = useMemo(() => {
    const multiDay = items.filter((s) => {
      const { startDay, endDay } = getScheduleDayRange(s);
      return startDay.getTime() !== endDay.getTime();
    });
    return buildWeekSegments(weekStart, multiDay);
  }, [items, weekStart]);

  const singleDayItemsByDay = useMemo(() => {
    const map = new Map<string, Schedule[]>();
    for (const s of items) {
      const { startDay, endDay } = getScheduleDayRange(s);
      if (startDay.getTime() !== endDay.getTime()) continue;
      const key = startDay.toISOString().slice(0, 10);
      const arr = map.get(key) ?? [];
      arr.push(s);
      map.set(key, arr);
    }
    for (const [k, arr] of map.entries()) {
      arr.sort((a, b) => new Date(a.start_at).getTime() - new Date(b.start_at).getTime());
      map.set(k, arr);
    }
    return map;
  }, [items]);

  const openCreate = () => {
    setErrorMessage(null);
    setSelected(null);
    setDraft({
      title: "",
      start_at: toLocalDatetimeValue(new Date()),
      end_at: "",
      location: "",
      description: "",
      category: "practice",
      is_public: true,
    });
    setModalOpen(true);
  };

  const openCreateAtTime = (day: Date, hour: number) => {
    setErrorMessage(null);
    const d = new Date(day);
    d.setHours(hour, 0, 0, 0);
    setSelected(null);
    setDraft({
      title: "",
      start_at: toLocalDatetimeValue(d),
      end_at: "",
      location: "",
      description: "",
      category: "practice",
      is_public: true,
    });
    setModalOpen(true);
  };

  const openCreateAt = (day: Date) => {
    setErrorMessage(null);
    const d = new Date(day);
    d.setHours(9, 0, 0, 0);
    setSelected(null);
    setDraft({
      title: "",
      start_at: toLocalDatetimeValue(d),
      end_at: "",
      location: "",
      description: "",
      category: "practice",
      is_public: true,
    });
    setModalOpen(true);
  };

  const openEdit = (s: Schedule) => {
    setErrorMessage(null);
    setSelected(s);
    setDraft(toDraft(s));
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setSelected(null);
    setErrorMessage(null);
  };

  const save = async () => {
    if (!canEdit) return;
    if (!draft.title.trim()) return;

    setSaving(true);
    setErrorMessage(null);
    try {
      const payload = {
        id: draft.id,
        title: draft.title,
        start_at: new Date(draft.start_at).toISOString(),
        end_at: draft.end_at ? new Date(draft.end_at).toISOString() : null,
        location: draft.location.trim() ? draft.location.trim() : null,
        description: draft.description.trim() ? draft.description.trim() : null,
        category: draft.category,
        is_public: draft.is_public,
      };

      let savedSchedule: Schedule | null = null;

      if (draft.id) {
        const res = await fetch("/api/schedules", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        const json = await res.json().catch(() => ({}));
        if (!res.ok || json?.success === false) {
          console.error("[ScheduleClient] PUT /api/schedules failed", { status: res.status, json });
          throw new Error(typeof json?.error === "string" ? json.error : "予定の更新に失敗しました");
        }
        savedSchedule = (json.schedule as Schedule | undefined) ?? null;
      } else {
        const res = await fetch("/api/schedules", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        const json = await res.json().catch(() => ({}));
        if (!res.ok || json?.success === false) {
          console.error("[ScheduleClient] POST /api/schedules failed", { status: res.status, json });
          throw new Error(typeof json?.error === "string" ? json.error : "予定の作成に失敗しました");
        }
        savedSchedule = (json.schedule as Schedule | undefined) ?? null;
      }

      if (savedSchedule) {
        setItems((current) => {
          const next = draft.id
            ? current.map((item) => (item.id === savedSchedule!.id ? savedSchedule! : item))
            : [savedSchedule!, ...current];
          return next.sort((a, b) => new Date(a.start_at).getTime() - new Date(b.start_at).getTime());
        });
      }

      // TODO: FanTrise連携 - ファンクラブメンバーへの予定通知
      // TODO: VZ MAP連携 - locationをMapbox上にピン表示
      // TODO: Arena連携 - イベントカテゴリの予定をArenaに自動投稿

      await fetchRange();
      closeModal();
    } catch (err) {
      const msg = err instanceof Error ? err.message : "保存に失敗しました";
      setErrorMessage(msg);
      console.error("[ScheduleClient] save failed", err);
    } finally {
      setSaving(false);
    }
  };

  const remove = async () => {
    if (!canEdit) return;
    if (!selected) return;

    setSaving(true);
    setErrorMessage(null);
    try {
      const res = await fetch("/api/schedules", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: selected.id }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok || json?.success === false) {
        console.error("[ScheduleClient] DELETE /api/schedules failed", { status: res.status, json });
        throw new Error(typeof json?.error === "string" ? json.error : "予定の削除に失敗しました");
      }
      await fetchRange();
      closeModal();
    } catch (err) {
      const msg = err instanceof Error ? err.message : "削除に失敗しました";
      setErrorMessage(msg);
      console.error("[ScheduleClient] remove failed", err);
    } finally {
      setSaving(false);
    }
  };

  const roleColor = profile.role === "Athlete" ? "#C1272D" : profile.role === "Trainer" ? "#1A7A4A" : "#FFD600";

  const weekday = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const hours = useMemo(() => Array.from({ length: 17 }).map((_, i) => i + 6), []); // 06:00 - 22:00

  return (
    <div style={embedded ? undefined : { minHeight: "100vh", background: "#0B0B0F", color: "#fff" }}>
      <div style={embedded ? { width: "100%" } : { maxWidth: 980, margin: "0 auto", padding: "28px 16px 80px" }}>
        {!embedded ? (
          <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: 12, flexWrap: "wrap", marginBottom: 16 }}>
            <div>
              <p style={{ margin: "0 0 6px", fontSize: 9, fontWeight: 900, letterSpacing: "0.28em", textTransform: "uppercase", fontFamily: "monospace", opacity: 0.6 }}>
                Schedule
              </p>
              <h1 style={{ margin: 0, fontSize: 34, fontWeight: 900, letterSpacing: "-0.01em" }}>
                スケジュール管理
              </h1>
              <p style={{ margin: "6px 0 0", fontSize: 12, color: "rgba(255,255,255,0.55)" }}>@{profile.slug}</p>
            </div>
          </div>
        ) : null}

        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, flexWrap: "wrap", marginBottom: 12 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
            {viewMode === "month" ? (
              <>
                <button
                  type="button"
                  onClick={() => setMonth((m) => addMonths(m, -1))}
                  style={{ padding: "10px 12px", borderRadius: 12, border: "1px solid rgba(255,255,255,0.10)", background: "rgba(255,255,255,0.04)", color: "rgba(255,255,255,0.85)", cursor: "pointer", fontWeight: 800 }}
                >
                  ← 前月
                </button>
                <div style={{ padding: "10px 12px", borderRadius: 12, border: "1px solid rgba(255,255,255,0.10)", background: "rgba(255,255,255,0.02)", fontFamily: "monospace", fontSize: 12, fontWeight: 800 }}>
                  {month.getFullYear()}-{pad2(month.getMonth() + 1)}
                </div>
                <button
                  type="button"
                  onClick={() => setMonth((m) => addMonths(m, 1))}
                  style={{ padding: "10px 12px", borderRadius: 12, border: "1px solid rgba(255,255,255,0.10)", background: "rgba(255,255,255,0.04)", color: "rgba(255,255,255,0.85)", cursor: "pointer", fontWeight: 800 }}
                >
                  次月 →
                </button>
              </>
            ) : (
              <>
                <button
                  type="button"
                  onClick={() => setFocusDate((d) => addDays(d, -7))}
                  style={{ padding: "10px 12px", borderRadius: 12, border: "1px solid rgba(255,255,255,0.10)", background: "rgba(255,255,255,0.04)", color: "rgba(255,255,255,0.85)", cursor: "pointer", fontWeight: 800 }}
                >
                  ← 前週
                </button>
                <div style={{ padding: "10px 12px", borderRadius: 12, border: "1px solid rgba(255,255,255,0.10)", background: "rgba(255,255,255,0.02)", fontFamily: "monospace", fontSize: 12, fontWeight: 800 }}>
                  {weekStart.getFullYear()}-{pad2(weekStart.getMonth() + 1)}-{pad2(weekStart.getDate())}
                </div>
                <button
                  type="button"
                  onClick={() => setFocusDate((d) => addDays(d, 7))}
                  style={{ padding: "10px 12px", borderRadius: 12, border: "1px solid rgba(255,255,255,0.10)", background: "rgba(255,255,255,0.04)", color: "rgba(255,255,255,0.85)", cursor: "pointer", fontWeight: 800 }}
                >
                  次週 →
                </button>
              </>
            )}
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
            <div style={{ display: "inline-flex", borderRadius: 12, border: "1px solid rgba(255,255,255,0.10)", background: "rgba(255,255,255,0.02)", overflow: "hidden" }}>
              <button
                type="button"
                onClick={() => setViewMode("month")}
                style={{ padding: "9px 12px", border: "none", cursor: "pointer", background: viewMode === "month" ? "rgba(255,255,255,0.06)" : "transparent", color: viewMode === "month" ? "#fff" : "rgba(255,255,255,0.55)", fontWeight: 900, fontSize: 11, fontFamily: "monospace" }}
              >
                Month
              </button>
              <button
                type="button"
                onClick={() => setViewMode("week")}
                style={{ padding: "9px 12px", border: "none", cursor: "pointer", background: viewMode === "week" ? "rgba(255,255,255,0.06)" : "transparent", color: viewMode === "week" ? "#fff" : "rgba(255,255,255,0.55)", fontWeight: 900, fontSize: 11, fontFamily: "monospace" }}
              >
                Week
              </button>
            </div>

            {canEdit ? (
              <button
                type="button"
                onClick={openCreate}
                style={{ padding: "10px 14px", borderRadius: 12, border: `1px solid ${roleColor}40`, background: `${roleColor}18`, color: roleColor, cursor: "pointer", fontWeight: 900 }}
              >
                ＋ 予定を追加
              </button>
            ) : null}
          </div>
        </div>

        {viewMode === "month" ? (
          <div style={{ borderRadius: 18, border: "1px solid rgba(255,255,255,0.10)", background: "rgba(255,255,255,0.02)", overflow: "hidden" }}>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(7, minmax(0, 1fr))", borderBottom: "1px solid rgba(255,255,255,0.06)", background: "rgba(0,0,0,0.25)" }}>
              {weekday.map((w) => (
                <div key={w} style={{ padding: "10px 10px", fontSize: 10, letterSpacing: "0.14em", fontFamily: "monospace", color: "rgba(255,255,255,0.45)", textTransform: "uppercase" }}>
                  {w}
                </div>
              ))}
            </div>

            <div style={{ display: "grid" }}>
              {monthWeeks.map((week, weekIndex) => {
                const layout = monthWeekLayouts[weekIndex];
                const laneHeight = 22;
                const barsTop = 28;
                const barsPadX = 10;
                const maxLanes = 4;
                const visibleSegments = layout.segments.filter((seg) => seg.lane < maxLanes);
                const hiddenCount = layout.segments.filter((seg) => seg.lane >= maxLanes).length;

                return (
                  <div key={weekIndex} style={{ position: "relative", display: "grid", gridTemplateColumns: "repeat(7, minmax(0, 1fr))" }}>
                    {week.map((day) => {
                      const key = startOfDay(day).toISOString().slice(0, 10);
                      const list = singleDayItemsByDay.get(key) ?? [];
                      const muted = !withinMonth(day, month);
                      const isToday = isSameDay(day, new Date());

                      return (
                        <div
                          key={key}
                          tabIndex={canEdit && !muted ? 0 : -1}
                          aria-label={`予定を作成: ${key}`}
                          title={`予定を作成: ${key}`}
                          onClick={() => {
                            if (!canEdit) return;
                            if (muted) return;
                            openCreateAt(day);
                          }}
                          onKeyDown={(e) => {
                            if (!canEdit) return;
                            if (muted) return;
                            if (e.key !== "Enter" && e.key !== " ") return;
                            e.preventDefault();
                            openCreateAt(day);
                          }}
                          style={{
                            minHeight: 122,
                            padding: 10,
                            borderRight: "1px solid rgba(255,255,255,0.06)",
                            borderBottom: "1px solid rgba(255,255,255,0.06)",
                            background: muted ? "rgba(255,255,255,0.01)" : "transparent",
                            opacity: muted ? 0.55 : 1,
                            cursor: canEdit && !muted ? "pointer" : "default",
                            outline: "none",
                          }}
                        >
                          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
                            <div
                              style={{
                                fontFamily: "monospace",
                                fontSize: 11,
                                fontWeight: 900,
                                color: isToday ? roleColor : "rgba(255,255,255,0.65)",
                              }}
                            >
                              {day.getDate()}
                            </div>
                          </div>

                          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                            {list.slice(0, 3).map((s) => {
                              const cfg = CATEGORY_CONFIG[s.category];
                              const st = new Date(s.start_at);
                              const time = `${pad2(st.getHours())}:${pad2(st.getMinutes())}`;
                              return (
                                <button
                                  key={s.id}
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    openEdit(s);
                                  }}
                                  style={{
                                    width: "100%",
                                    border: `1px solid ${cfg.color}45`,
                                    background: `linear-gradient(90deg, ${cfg.color}26 0%, rgba(255,255,255,0.02) 70%)`,
                                    color: "rgba(255,255,255,0.92)",
                                    padding: "7px 8px",
                                    borderRadius: 10,
                                    cursor: "pointer",
                                    textAlign: "left",
                                    display: "grid",
                                    gridTemplateColumns: "auto 1fr",
                                    alignItems: "center",
                                    gap: 8,
                                  }}
                                >
                                  <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-start", gap: 2 }}>
                                    <span style={{ fontSize: 9, fontFamily: "monospace", fontWeight: 900, color: cfg.color }}>{time}</span>
                                    {!s.is_public ? (
                                      <svg width={12} height={12} fill="none" viewBox="0 0 24 24" stroke={cfg.color} strokeWidth={2} style={{ flexShrink: 0, opacity: 0.85 }}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d={LOCK_ICON_PATH} />
                                      </svg>
                                    ) : (
                                      <span style={{ width: 10, height: 10, borderRadius: 3, background: cfg.color, opacity: 0.5 }} />
                                    )}
                                  </div>
                                  <span style={{ minWidth: 0, fontSize: 11, fontWeight: 900, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{s.title}</span>
                                </button>
                              );
                            })}
                            {list.length > 3 ? (
                              <div style={{ fontSize: 10, color: "rgba(255,255,255,0.35)", fontFamily: "monospace" }}>+{list.length - 3} more</div>
                            ) : null}
                          </div>
                        </div>
                      );
                    })}

                    {layout.segments.length > 0 ? (
                      <div
                        style={{
                          position: "absolute",
                          left: 0,
                          right: 0,
                          top: barsTop,
                          padding: `0 ${barsPadX}px`,
                          pointerEvents: "none",
                        }}
                      >
                        <div
                          style={{
                            display: "grid",
                            gridTemplateColumns: "repeat(7, minmax(0, 1fr))",
                            gridAutoRows: laneHeight,
                            gap: 6,
                          }}
                        >
                          {visibleSegments.map((seg) => {
                            const cfg = CATEGORY_CONFIG[seg.schedule.category];
                            const radiusL = seg.isStart ? 10 : 3;
                            const radiusR = seg.isEnd ? 10 : 3;
                            return (
                              <button
                                key={`${seg.schedule.id}-${seg.lane}-${seg.startCol}-${seg.endCol}`}
                                type="button"
                                onClick={() => openEdit(seg.schedule)}
                                style={{
                                  pointerEvents: "auto",
                                  gridColumn: `${seg.startCol + 1} / ${seg.endCol + 2}`,
                                  gridRow: `${seg.lane + 1}`,
                                  height: laneHeight,
                                  border: `1px solid ${cfg.color}55`,
                                  background: `linear-gradient(90deg, ${cfg.color}40, ${cfg.color}18)`,
                                  color: "rgba(255,255,255,0.95)",
                                  borderTopLeftRadius: radiusL,
                                  borderBottomLeftRadius: radiusL,
                                  borderTopRightRadius: radiusR,
                                  borderBottomRightRadius: radiusR,
                                  padding: "0 10px",
                                  display: "flex",
                                  alignItems: "center",
                                  gap: 8,
                                  cursor: "pointer",
                                  overflow: "hidden",
                                }}
                                title={`${seg.schedule.title}${seg.schedule.end_at ? ` (${new Date(seg.schedule.start_at).toLocaleString("ja-JP")} - ${new Date(seg.schedule.end_at).toLocaleString("ja-JP")})` : ""}`}
                              >
                                {!seg.schedule.is_public ? (
                                  <svg width={12} height={12} fill="none" viewBox="0 0 24 24" stroke={cfg.color} strokeWidth={2} style={{ flexShrink: 0, opacity: 0.9 }}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d={LOCK_ICON_PATH} />
                                  </svg>
                                ) : (
                                  <span style={{ width: 10, height: 10, borderRadius: 3, background: cfg.color, opacity: 0.7, flexShrink: 0 }} />
                                )}
                                <span style={{ minWidth: 0, fontSize: 11, fontWeight: 900, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{seg.schedule.title}</span>
                              </button>
                            );
                          })}
                        </div>

                        {hiddenCount > 0 ? (
                          <div style={{ marginTop: 6, fontSize: 10, color: "rgba(255,255,255,0.35)", fontFamily: "monospace" }}>+{hiddenCount} more spans</div>
                        ) : null}
                      </div>
                    ) : null}
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          <div style={{ borderRadius: 18, border: "1px solid rgba(255,255,255,0.10)", background: "rgba(255,255,255,0.02)", overflow: "hidden" }}>
            <div style={{ display: "grid", gridTemplateColumns: "80px repeat(7, minmax(0, 1fr))", borderBottom: "1px solid rgba(255,255,255,0.06)", background: "rgba(0,0,0,0.25)" }}>
              <div style={{ padding: "10px 10px", fontSize: 10, letterSpacing: "0.14em", fontFamily: "monospace", color: "rgba(255,255,255,0.25)", textTransform: "uppercase" }}>Time</div>
              {weekDays.map((d, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => {
                    setFocusDate(d);
                    if (!canEdit) return;
                    openCreateAt(d);
                  }}
                  style={{ padding: "10px 10px", border: "none", background: "transparent", textAlign: "left", cursor: canEdit ? "pointer" : "default" }}
                >
                  <div style={{ fontSize: 10, letterSpacing: "0.14em", fontFamily: "monospace", color: "rgba(255,255,255,0.45)", textTransform: "uppercase" }}>{weekday[d.getDay()]}</div>
                  <div style={{ marginTop: 2, fontSize: 12, fontWeight: 900, color: isSameDay(d, new Date()) ? roleColor : "rgba(255,255,255,0.85)" }}>{pad2(d.getMonth() + 1)}/{pad2(d.getDate())}</div>
                </button>
              ))}
            </div>

            {weekSpanLayout.segments.length > 0 ? (
              <div style={{ display: "grid", gridTemplateColumns: "80px repeat(7, minmax(0, 1fr))", borderBottom: "1px solid rgba(255,255,255,0.06)", background: "rgba(255,255,255,0.01)" }}>
                <div style={{ padding: "10px", borderRight: "1px solid rgba(255,255,255,0.06)", fontFamily: "monospace", fontSize: 10, color: "rgba(255,255,255,0.35)" }}>Span</div>
                <div style={{ gridColumn: "2 / -1", position: "relative", padding: "10px 8px" }}>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(7, minmax(0, 1fr))", gridAutoRows: 22, gap: 6 }}>
                    {weekSpanLayout.segments.map((seg) => {
                      const cfg = CATEGORY_CONFIG[seg.schedule.category];
                      const radiusL = seg.isStart ? 10 : 3;
                      const radiusR = seg.isEnd ? 10 : 3;
                      return (
                        <button
                          key={`${seg.schedule.id}-${seg.lane}-${seg.startCol}-${seg.endCol}`}
                          type="button"
                          onClick={() => openEdit(seg.schedule)}
                          style={{
                            gridColumn: `${seg.startCol + 1} / ${seg.endCol + 2}`,
                            gridRow: `${seg.lane + 1}`,
                            height: 22,
                            border: `1px solid ${cfg.color}55`,
                            background: `linear-gradient(90deg, ${cfg.color}40, ${cfg.color}18)`,
                            color: "rgba(255,255,255,0.95)",
                            borderTopLeftRadius: radiusL,
                            borderBottomLeftRadius: radiusL,
                            borderTopRightRadius: radiusR,
                            borderBottomRightRadius: radiusR,
                            padding: "0 10px",
                            display: "flex",
                            alignItems: "center",
                            gap: 8,
                            cursor: "pointer",
                            overflow: "hidden",
                          }}
                        >
                          {!seg.schedule.is_public ? (
                            <svg width={12} height={12} fill="none" viewBox="0 0 24 24" stroke={cfg.color} strokeWidth={2} style={{ flexShrink: 0, opacity: 0.9 }}>
                              <path strokeLinecap="round" strokeLinejoin="round" d={LOCK_ICON_PATH} />
                            </svg>
                          ) : (
                            <span style={{ width: 10, height: 10, borderRadius: 3, background: cfg.color, opacity: 0.7, flexShrink: 0 }} />
                          )}
                          <span style={{ minWidth: 0, fontSize: 11, fontWeight: 900, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{seg.schedule.title}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            ) : null}

            <div style={{ maxHeight: embedded ? 520 : undefined, overflow: "auto" }}>
              {hours.map((h) => (
                <div key={h} style={{ display: "grid", gridTemplateColumns: "80px repeat(7, minmax(0, 1fr))" }}>
                  <div style={{ padding: "10px", borderRight: "1px solid rgba(255,255,255,0.06)", borderBottom: "1px solid rgba(255,255,255,0.06)", fontFamily: "monospace", fontSize: 11, color: "rgba(255,255,255,0.4)" }}>
                    {pad2(h)}:00
                  </div>
                  {weekDays.map((d, idx) => {
                    const cellStart = new Date(d);
                    cellStart.setHours(h, 0, 0, 0);
                    const cellEnd = new Date(d);
                    cellEnd.setHours(h + 1, 0, 0, 0);

                    const cellItems = items.filter((s) => {
                      const { startDay, endDay } = getScheduleDayRange(s);
                      if (startDay.getTime() !== endDay.getTime()) return false;
                      const st = new Date(s.start_at);
                      return st >= cellStart && st < cellEnd;
                    });

                    return (
                      <div
                        key={idx}
                        tabIndex={canEdit ? 0 : -1}
                        aria-label={`予定を作成: ${pad2(d.getMonth() + 1)}/${pad2(d.getDate())} ${pad2(h)}:00`}
                        title={`予定を作成: ${pad2(d.getMonth() + 1)}/${pad2(d.getDate())} ${pad2(h)}:00`}
                        onClick={() => {
                          if (!canEdit) return;
                          openCreateAtTime(d, h);
                        }}
                        onKeyDown={(e) => {
                          if (!canEdit) return;
                          if (e.key !== "Enter" && e.key !== " ") return;
                          e.preventDefault();
                          openCreateAtTime(d, h);
                        }}
                        style={{
                          minHeight: 48,
                          padding: 8,
                          borderRight: "1px solid rgba(255,255,255,0.06)",
                          borderBottom: "1px solid rgba(255,255,255,0.06)",
                          cursor: canEdit ? "pointer" : "default",
                          outline: "none",
                        }}
                      >
                        {cellItems.slice(0, 2).map((s) => {
                          const cfg = CATEGORY_CONFIG[s.category];
                          const st = new Date(s.start_at);
                          const time = `${pad2(st.getHours())}:${pad2(st.getMinutes())}`;
                          return (
                            <button
                              key={s.id}
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                openEdit(s);
                              }}
                              style={{
                                width: "100%",
                                border: `1px solid ${cfg.color}45`,
                                background: `linear-gradient(90deg, ${cfg.color}26 0%, rgba(255,255,255,0.02) 70%)`,
                                color: "rgba(255,255,255,0.92)",
                                padding: "6px 8px",
                                borderRadius: 10,
                                cursor: "pointer",
                                textAlign: "left",
                                display: "grid",
                                gridTemplateColumns: "auto 1fr",
                                alignItems: "center",
                                gap: 8,
                                marginBottom: 6,
                              }}
                            >
                              <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-start", gap: 2 }}>
                                <span style={{ fontSize: 9, fontFamily: "monospace", fontWeight: 900, color: cfg.color }}>{time}</span>
                                {!s.is_public ? (
                                  <svg width={12} height={12} fill="none" viewBox="0 0 24 24" stroke={cfg.color} strokeWidth={2} style={{ flexShrink: 0, opacity: 0.85 }}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d={LOCK_ICON_PATH} />
                                  </svg>
                                ) : (
                                  <span style={{ width: 10, height: 10, borderRadius: 3, background: cfg.color, opacity: 0.5 }} />
                                )}
                              </div>
                              <span style={{ minWidth: 0, fontSize: 11, fontWeight: 900, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{s.title}</span>
                            </button>
                          );
                        })}
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
        )}

        {loading ? <p style={{ marginTop: 12, color: "rgba(255,255,255,0.45)" }}>読み込み中...</p> : null}
      </div>

      <AnimatePresence>
        {modalOpen ? (
          <>
            <motion.button
              type="button"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={closeModal}
              style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.72)", border: "none", zIndex: 90 }}
            />
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 24 }}
              style={{ position: "fixed", inset: 0, zIndex: 91, display: "grid", placeItems: "center", padding: 16 }}
            >
              <div style={{ width: "min(620px, 100%)", borderRadius: 24, border: "1px solid rgba(255,255,255,0.10)", background: "#0b0b11", padding: 20, boxShadow: "0 18px 60px rgba(0,0,0,0.45)" }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, marginBottom: 14 }}>
                  <div>
                    <p style={{ margin: "0 0 4px", fontSize: 10, fontWeight: 900, letterSpacing: "0.18em", color: "rgba(255,255,255,0.35)", fontFamily: "monospace" }}>SCHEDULE</p>
                    <h2 style={{ margin: 0, fontSize: 20, fontWeight: 900, color: "#fff" }}>{selected ? "予定詳細" : "予定を追加"}</h2>
                  </div>
                  <button type="button" onClick={closeModal} style={{ padding: "8px 12px", borderRadius: 12, border: "1px solid rgba(255,255,255,0.1)", background: "rgba(255,255,255,0.04)", color: "rgba(255,255,255,0.75)", cursor: "pointer" }}>
                    閉じる
                  </button>
                </div>

                {errorMessage ? (
                  <div style={{ marginBottom: 12, padding: "10px 12px", borderRadius: 12, border: "1px solid rgba(255,80,80,0.25)", background: "rgba(255,80,80,0.10)", color: "rgba(255,160,160,0.95)", fontSize: 12, fontWeight: 700, lineHeight: 1.6 }}>
                    {errorMessage}
                  </div>
                ) : null}

                {selected && !canEdit ? (
                  <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                    <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
                      <span style={{ fontSize: 11, padding: "5px 10px", borderRadius: 999, background: `${CATEGORY_CONFIG[selected.category].color}18`, border: `1px solid ${CATEGORY_CONFIG[selected.category].color}25`, color: CATEGORY_CONFIG[selected.category].color, fontWeight: 800 }}>
                        {CATEGORY_CONFIG[selected.category].label}
                      </span>
                      {!selected.is_public ? (
                        <span style={{ fontSize: 11, padding: "5px 10px", borderRadius: 999, background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.10)", color: "rgba(255,255,255,0.75)", fontWeight: 800 }}>
                          非公開
                        </span>
                      ) : null}
                    </div>
                    <p style={{ margin: 0, fontSize: 18, fontWeight: 900 }}>{selected.title}</p>
                    <p style={{ margin: 0, fontSize: 12, color: "rgba(255,255,255,0.6)" }}>{new Date(selected.start_at).toLocaleString("ja-JP")}{selected.end_at ? ` - ${new Date(selected.end_at).toLocaleString("ja-JP")}` : ""}</p>
                    {selected.location ? <p style={{ margin: 0, fontSize: 12, color: "rgba(255,255,255,0.6)" }}>場所: {selected.location}</p> : null}
                    {selected.description ? <p style={{ margin: 0, fontSize: 13, lineHeight: 1.8, color: "rgba(255,255,255,0.72)" }}>{selected.description}</p> : null}
                    <div style={{ marginTop: 6 }}>
                      {canEdit ? (
                        <button type="button" onClick={() => openEdit(selected)} style={{ padding: "10px 14px", borderRadius: 12, border: `1px solid ${roleColor}40`, background: `${roleColor}18`, color: roleColor, cursor: "pointer", fontWeight: 900 }}>
                          編集する
                        </button>
                      ) : null}
                    </div>
                  </div>
                ) : (
                  <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                    {!selected ? null : (
                      <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
                        <span style={{ fontSize: 11, padding: "5px 10px", borderRadius: 999, background: `${CATEGORY_CONFIG[selected.category].color}18`, border: `1px solid ${CATEGORY_CONFIG[selected.category].color}25`, color: CATEGORY_CONFIG[selected.category].color, fontWeight: 800 }}>
                          {CATEGORY_CONFIG[selected.category].label}
                        </span>
                        {!selected.is_public ? (
                          <span style={{ fontSize: 11, padding: "5px 10px", borderRadius: 999, background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.10)", color: "rgba(255,255,255,0.75)", fontWeight: 800 }}>
                            非公開
                          </span>
                        ) : null}
                      </div>
                    )}

                    <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: 10 }}>
                      <label style={{ display: "grid", gap: 6 }}>
                        <span style={{ fontSize: 10, fontFamily: "monospace", opacity: 0.55 }}>タイトル</span>
                        <input value={draft.title} onChange={(e) => setDraft((d) => ({ ...d, title: e.target.value }))} style={{ height: 42, borderRadius: 12, border: "1px solid rgba(255,255,255,0.12)", background: "rgba(255,255,255,0.03)", color: "#fff", padding: "0 12px", outline: "none" }} />
                      </label>

                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                        <label style={{ display: "grid", gap: 6 }}>
                          <span style={{ fontSize: 10, fontFamily: "monospace", opacity: 0.55 }}>開始日時</span>
                          <input type="datetime-local" value={draft.start_at} onChange={(e) => setDraft((d) => ({ ...d, start_at: e.target.value }))} style={{ height: 42, borderRadius: 12, border: "1px solid rgba(255,255,255,0.12)", background: "rgba(255,255,255,0.03)", color: "#fff", padding: "0 12px", outline: "none" }} />
                        </label>
                        <label style={{ display: "grid", gap: 6 }}>
                          <span style={{ fontSize: 10, fontFamily: "monospace", opacity: 0.55 }}>終了日時</span>
                          <input type="datetime-local" value={draft.end_at} onChange={(e) => setDraft((d) => ({ ...d, end_at: e.target.value }))} style={{ height: 42, borderRadius: 12, border: "1px solid rgba(255,255,255,0.12)", background: "rgba(255,255,255,0.03)", color: "#fff", padding: "0 12px", outline: "none" }} />
                        </label>
                      </div>

                      <label style={{ display: "grid", gap: 6 }}>
                        <span style={{ fontSize: 10, fontFamily: "monospace", opacity: 0.55 }}>場所</span>
                        <input value={draft.location} onChange={(e) => setDraft((d) => ({ ...d, location: e.target.value }))} style={{ height: 42, borderRadius: 12, border: "1px solid rgba(255,255,255,0.12)", background: "rgba(255,255,255,0.03)", color: "#fff", padding: "0 12px", outline: "none" }} />
                      </label>

                      <label style={{ display: "grid", gap: 6 }}>
                        <span style={{ fontSize: 10, fontFamily: "monospace", opacity: 0.55 }}>説明</span>
                        <textarea value={draft.description} onChange={(e) => setDraft((d) => ({ ...d, description: e.target.value }))} rows={4} style={{ borderRadius: 12, border: "1px solid rgba(255,255,255,0.12)", background: "rgba(255,255,255,0.03)", color: "#fff", padding: "10px 12px", outline: "none", resize: "vertical" }} />
                      </label>

                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                        <label style={{ display: "grid", gap: 6 }}>
                          <span style={{ fontSize: 10, fontFamily: "monospace", opacity: 0.55 }}>カテゴリ</span>
                          <select value={draft.category} onChange={(e) => setDraft((d) => ({ ...d, category: e.target.value as ScheduleCategory }))} style={{ height: 42, borderRadius: 12, border: "1px solid rgba(255,255,255,0.12)", background: "rgba(255,255,255,0.03)", color: "#fff", padding: "0 12px", outline: "none" }}>
                            {Object.entries(CATEGORY_CONFIG).map(([k, v]) => (
                              <option key={k} value={k}>{v.label}</option>
                            ))}
                          </select>
                        </label>

                        <label style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 22 }}>
                          <input type="checkbox" checked={draft.is_public} onChange={(e) => setDraft((d) => ({ ...d, is_public: e.target.checked }))} />
                          <span style={{ fontSize: 12, color: "rgba(255,255,255,0.7)" }}>公開する</span>
                        </label>
                      </div>
                    </div>

                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 6, gap: 10, flexWrap: "wrap" }}>
                      <div style={{ display: "flex", gap: 8 }}>
                        {selected ? (
                          <button type="button" onClick={remove} disabled={saving} style={{ padding: "10px 14px", borderRadius: 12, border: "1px solid rgba(255,80,80,0.35)", background: "rgba(255,80,80,0.12)", color: "rgba(255,120,120,0.95)", cursor: "pointer", fontWeight: 900, opacity: saving ? 0.6 : 1 }}>
                            削除
                          </button>
                        ) : null}
                      </div>

                      <button type="button" onClick={save} disabled={saving} style={{ padding: "10px 16px", borderRadius: 12, border: `1px solid ${roleColor}40`, background: roleColor, color: "#050510", cursor: "pointer", fontWeight: 900, opacity: saving ? 0.6 : 1 }}>
                        保存
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          </>
        ) : null}
      </AnimatePresence>
    </div>
  );
}
