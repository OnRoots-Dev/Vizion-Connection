"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { ActionPill, CardHeader, SectionCard, ViewHeader, PulseIndicator } from "@/app/(app)/dashboard/components/ui";
import type { DashboardView, ThemeColors } from "@/app/(app)/dashboard/types";
import type { ProfileData } from "@/features/profile/types";
import type { DailyLog } from "@/features/daily-log/types";
import { ConditionScorePicker } from "@/components/DailyLog/ConditionScorePicker";
import { ActivityExtras } from "@/components/DailyLog/ActivityExtras";
import { formatConditionLabel, getConditionMeta, getJourneyHype, getRandomJourneyTemplateSuggestions, getTodayString, JOURNEY_MAX_CHARS } from "@/components/DailyLog/journey";
import { computeStreak } from "@/lib/pulse-stats";
import { calcDayCount } from "@/lib/day-count";
import { supabaseBrowser } from "@/lib/supabase/browser";
import { IconStreak } from "@/lib/design/icons";
import { TextScramble } from "@/components/ui/TextScramble";

// 今週のActivity（Weekly）のレスポンス型
type WeeklyActivity = {
    id: string;
    type: string;
    title: string | null;
    starts_at: string;
    ends_at: string | null;
    status: string;
    visibility: string;
    cheer_count: number;
    comment_count: number;
    place: { id: string; name: string; prefecture: string } | null;
    participants: Array<{ user_slug: string | null; user_display_name: string | null }>;
};
type WeeklyPayload = {
    success: boolean;
    weekStart: string;
    weekEnd: string;
    activities: WeeklyActivity[];
    counts: { total: number; completed: number; byType: Record<string, number>; cheers: number; comments: number; together: number };
};

const WEEKLY_TYPE_LABELS: Record<string, string> = {
    practice: "練習", training: "トレーニング", match: "試合", competition: "大会",
    event: "イベント", coaching: "コーチング", session: "セッション", workshop: "ワークショップ",
    watching: "観戦", supporting: "サポート", participation: "参加", other: "その他",
};
const WEEKLY_STATUS_LABELS: Record<string, string> = {
    planned: "予定", completed: "完了", cancelled: "中止",
};
const WEEKLY_STATUS_COLOR: Record<string, string> = {
    planned: "#FFB454", completed: "#32D278", cancelled: "#FF5C7A",
};

// 連続記録（PULSE）日数を JST 基準で算出（journeys から）

function getJourneyPlaceholder(role: string): string {
  const r = role.toLowerCase();
  if (r === "athlete") return "今日の練習・コンディション・気づきを残そう";
  if (r === "trainer") return "今日の指導内容・観察・気づきを残そう";
  if (r === "business") return "今日の活動・学び・前進したことを残そう";
  return "今日やったこと・感じたこと・気づきを残そう";
}

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
  // 本人の Journey 記録を journeys テーブルから取得（公開/非公開すべて）
  const [logs, setLogs] = useState<DailyLog[]>([]);

  const loadLogs = useCallback(async () => {
    try {
      const res = await fetch("/api/journey/list", { cache: "no-store" });
      if (!res.ok) return;
      const data = (await res.json()) as {
        journeys?: Array<{ id: string | number; content?: string; condition_score?: number | null; created_at: string }>;
      };
      const rows = data.journeys ?? [];
      setLogs(
        rows.map((j) => ({
          id: String(j.id),
          user_id: 0,
          log_date: formatDateKeyJst(new Date(j.created_at)),
          content: String(j.content ?? ""),
          condition_score: typeof j.condition_score === "number" ? j.condition_score : null,
          created_at: String(j.created_at),
        })),
      );
    } catch {
      /* 取得失敗時は既存の状態を維持 */
    }
  }, []);

  useEffect(() => {
    void loadLogs();
  }, [loadLogs]);

  const [content, setContent] = useState("");
  const [conditionScore, setConditionScore] = useState<number | null>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [tags, setTags] = useState<string[]>([]);
  const [isPublic, setIsPublic] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);
  // 同日重複ガード（409）発動時の案内表示
  const [alreadyLogged, setAlreadyLogged] = useState(false);
  const [templateSuggestions, setTemplateSuggestions] = useState<string[]>(() =>
    getRandomJourneyTemplateSuggestions(profile.role),
  );
  const [welcomeModalOpen, setWelcomeModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [successModalOpen, setSuccessModalOpen] = useState(false);
  const [activeTemplate, setActiveTemplate] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);

  // TIMELINE シェアモーダル（記録済み Journey は is_public なら既に Timeline 表示済み）
  const [showShareModal, setShowShareModal] = useState(false);
  const [, setTodayJourneyId] = useState<string | null>(null);
  const [streakDays, setStreakDays] = useState<number>(0);
  const [sharePosting, setSharePosting] = useState(false);
  const [shareCompleted, setShareCompleted] = useState(false);

  const remaining = useMemo(() => JOURNEY_MAX_CHARS - content.length, [content.length]);
  const showForm = !submitted || isEditing;
  const canSubmit = content.trim().length > 0 && conditionScore !== null && !isSubmitting && !submitted && !alreadyLogged;
  const hypeMessage = useMemo(() => getJourneyHype(null), []);

  useEffect(() => {
    if (submitted) return;
    const key = `myjourney-welcome:${getTodayString()}`;
    const already = localStorage.getItem(key);
    if (already) return;
    setWelcomeModalOpen(true);
  }, [submitted]);

  useEffect(() => {
    setTemplateSuggestions(getRandomJourneyTemplateSuggestions(profile.role));
  }, [profile.role]);

  useEffect(() => {
    if (!toastMessage) return;
    const timer = window.setTimeout(() => setToastMessage(null), 2500);
    return () => window.clearTimeout(timer);
  }, [toastMessage]);

  function applyTemplate(text: string) {
    setContent(text.slice(0, JOURNEY_MAX_CHARS));
    setActiveTemplate(text);
    setToastMessage("テンプレートを入力しました");
    requestAnimationFrame(() => {
      const el = document.getElementById("myjourney-entry");
      el?.scrollIntoView({ behavior: "smooth", block: "center" });
      (el as HTMLTextAreaElement | null)?.focus?.();
    });
  }

  function cancelEditing() {
    setIsEditing(false);
    setContent("");
    setConditionScore(null);
    setActiveTemplate(null);
  }

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

  // DAYカウント: day0_date基準（未設定ならログ起点 = 従来のstreakにフォールバック）
  const dayCount = useMemo(
    () => calcDayCount(profile.day0Date, logs.at(-1)?.log_date ?? null),
    [profile.day0Date, logs],
  );

  const [weekOffset, setWeekOffset] = useState(0);
  const [, setWeekExpanded] = useState(false);

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

  // ==== Weekly（今週のActivity）====
  const [weekly, setWeekly] = useState<WeeklyPayload | null>(null);
  const [weeklyLoading, setWeeklyLoading] = useState(false);

  const loadWeekly = useCallback(async () => {
    setWeeklyLoading(true);
    // 表示中週のJST範囲（月曜00:00 +09:00 〜 翌月曜00:00 +09:00）
    const start = `${formatDateKeyJst(weekStart)}T00:00:00+09:00`;
    const end = `${formatDateKeyJst(addDays(weekStart, 7))}T00:00:00+09:00`;
    try {
      const res = await fetch(
        `/api/journey/weekly?weekStart=${encodeURIComponent(start)}&weekEnd=${encodeURIComponent(end)}`,
        { cache: "no-store" },
      );
      if (!res.ok) {
        setWeekly(null);
        return;
      }
      setWeekly((await res.json()) as WeeklyPayload);
    } catch {
      setWeekly(null);
    } finally {
      setWeeklyLoading(false);
    }
  }, [weekStart]);

  useEffect(() => {
    void loadWeekly();
  }, [loadWeekly]);

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
    if (!content.trim() || isSubmitting) return;
    setIsSubmitting(true);
    setError(null);

    try {
      const res = await fetch("/api/journey", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content: content.trim(),
          condition_score: conditionScore ?? undefined,
          image_url: imageUrl ?? undefined,
          video_url: videoUrl ?? undefined,
          tags: tags.length ? tags : undefined,
          is_public: isPublic,
        }),
      });

      if (res.status === 409) {
        // 同日重複ガード: 生エラーではなく分かりやすい案内を表示し、送信ボタンを封じる
        setError(null);
        setAlreadyLogged(true);
        void loadLogs();
        return;
      }

      if (!res.ok) {
        const data = await res.json() as { error?: string };
        setError(data.error ?? "投稿に失敗しました");
        return;
      }

      const result = (await res.json().catch(() => null)) as { journey?: { id?: string } } | null;
      const wasPublic = isPublic;

      setSubmitted(true);
      setContent("");
      setConditionScore(null);
      setImageUrl(null);
      setVideoUrl(null);
      setTags([]);
      setIsPublic(true);
      setTodayJourneyId(result?.journey?.id ?? null);

      // 今日の記録を履歴・グラフへ即時反映
      void loadLogs();

      // PULSE 継続日数を journeys から算出してモーダルへ反映
      void supabaseBrowser
        .from("journeys")
        .select("created_at")
        .eq("user_slug", profile.slug)
        .order("created_at", { ascending: false })
        .limit(120)
        .then(({ data }) => {
          setStreakDays(computeStreak((data ?? []).map((r) => String(r.created_at))));
        });

      // 公開Journeyは既に Timeline に表示済み → シェア導線（祝祭）を表示。
      // 非公開Journeyは Timeline に出ないため従来の完了モーダル。
      if (wasPublic) {
        setShowShareModal(true);
      } else {
        setSuccessModalOpen(true);
      }
    } catch {
      setError("通信エラーが発生しました");
    } finally {
      setIsSubmitting(false);
    }
  }

  // シェア = 既に公開済みの今日の Journey を Timeline で見せる導線（別テーブルへのinsertは不要）
  async function handleShareToTimeline() {
    if (sharePosting) return;
    setSharePosting(true);
    try {
      // DAILY CIRCUIT 連携: 本日の Journey 記録を daily_circuits に永続化
      await fetch("/api/daily-circuit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "journey" }),
      }).catch(() => { /* サーキット記録失敗はシェア完了を妨げない */ });
      setShareCompleted(true);
    } finally {
      setSharePosting(false);
      window.setTimeout(() => {
        setShowShareModal(false);
        setShareCompleted(false);
        setView("timeline");
      }, 1500);
    }
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      {welcomeModalOpen ? (
        <>
          <button
            type="button"
            aria-label="案内を閉じる"
            onClick={() => {
              localStorage.setItem(`myjourney-welcome:${getTodayString()}`, "1");
              setWelcomeModalOpen(false);
            }}
            style={{ position: "fixed", inset: 0, zIndex: 90, border: "none", background: "rgba(0,0,0,0.55)", backdropFilter: "blur(10px)", cursor: "pointer" }}
          />
          <div style={{ position: "fixed", inset: 0, zIndex: 91, display: "grid", placeItems: "center", padding: 16 }}>
            <div style={{ width: "100%", maxWidth: 440, borderRadius: 16, border: `1px solid ${t.border}`, background: t.bg, padding: 16, boxShadow: "0 18px 60px rgba(0,0,0,0.55)" }}>
              <p style={{ margin: 0, fontSize: 14, fontWeight: 900, color: t.text }}>今日の一歩、記録しよう</p>
              <p style={{ margin: "6px 0 0", fontSize: 11, color: t.sub, lineHeight: 1.7 }}>
                一言だけでもOK。続けた分だけ、あなたのJourneyが資産になります。
              </p>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10, marginTop: 14, flexWrap: "wrap" }}>
                <button
                  type="button"
                  onClick={() => {
                    localStorage.setItem(`myjourney-welcome:${getTodayString()}`, "1");
                    setWelcomeModalOpen(false);
                  }}
                  style={{ border: "none", background: "transparent", color: t.sub, fontSize: 11, fontWeight: 900, cursor: "pointer", padding: 0 }}
                >
                  あとで記録する
                </button>
                <button
                  type="button"
                  onClick={() => {
                    localStorage.setItem(`myjourney-welcome:${getTodayString()}`, "1");
                    setWelcomeModalOpen(false);
                    requestAnimationFrame(() => {
                      const el = document.getElementById("myjourney-entry");
                      el?.scrollIntoView({ behavior: "smooth", block: "center" });
                      (el as HTMLTextAreaElement | null)?.focus?.();
                    });
                  }}
                  style={{ borderRadius: 8, border: "none", background: "#a78bfa", color: "#000", fontWeight: 700, fontSize: 13, padding: "11px 20px", cursor: "pointer", boxShadow: "0 0 20px rgba(167,139,250,0.3)" }}
                >
                  いま記録する
                </button>
              </div>
            </div>
          </div>
        </>
      ) : null}

      <ViewHeader title="Journey" sub="記録画面" onBack={() => setView("home")} t={t} roleColor={roleColor} />

      <SectionCard t={t} accentColor="#a78bfa">
        <CardHeader
          title="今日の記録"
          meta={(
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10, flexWrap: "wrap" }}>
              <p style={{ margin: 0, fontSize: 12, color: t.sub, lineHeight: 1.7 }}>一言と気分を残して、日々の積み上がりを見える化します。</p>
              <span style={{ display: "inline-flex", alignItems: "center", gap: 4, fontSize: 11, fontWeight: 900, borderRadius: 999, padding: "5px 10px", border: "1px solid rgba(255,80,80,0.25)", background: "rgba(255,80,80,0.12)", color: "#FF5050", whiteSpace: "nowrap" }}>
                {dayCount !== null ? `DAY ${dayCount}` : `連続${streak}日`}
                <IconStreak size={11} aria-hidden />
              </span>
            </div>
          )}
        />

        <div style={{ display: "grid", gap: 12 }}>
          <div style={{ borderRadius: 0, border: "none", background: "transparent", padding: 0 }}>
            <p style={{ margin: "0 0 10px", fontSize: 10, color: t.sub, fontWeight: 900, letterSpacing: "0.14em", textTransform: "uppercase", fontFamily: "monospace" }}>
              今日の一言
            </p>

            {showForm ? (
              <div style={{ display: "grid", gap: 14 }}>
                {isEditing ? (
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10, flexWrap: "wrap" }}>
                    <p style={{ margin: 0, fontSize: 12, fontWeight: 800, color: roleColor }}>記録を修正中</p>
                    <button
                      type="button"
                      onClick={cancelEditing}
                      style={{ border: "none", background: "transparent", color: t.sub, fontSize: 11, fontWeight: 700, cursor: "pointer", padding: 0 }}
                    >
                      キャンセル
                    </button>
                  </div>
                ) : null}
                <div>
                  <textarea
                    id="myjourney-entry"
                    value={content}
                    onChange={(event) => {
                      setContent(event.target.value.slice(0, JOURNEY_MAX_CHARS));
                      setActiveTemplate(null);
                    }}
                    maxLength={JOURNEY_MAX_CHARS}
                    placeholder={getJourneyPlaceholder(profile.role)}
                    rows={5}
                    style={{ width: "100%", boxSizing: "border-box", resize: "vertical", borderRadius: 12, border: `1px solid ${t.border}`, background: "rgba(255,255,255,0.03)", color: t.text, padding: "13px 14px", fontSize: 13, lineHeight: 1.7, outline: "none", minHeight: 140 }}
                  />
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 8, gap: 10, flexWrap: "wrap" }}>
                    <span style={{ fontSize: 10, color: t.sub }}>4:00-10:00 の記録で +10pt</span>
                    <span style={{ fontSize: 10, fontWeight: 700, color: remaining <= 10 ? "rgba(255,100,100,0.95)" : t.sub }}>
                      {content.length} / {JOURNEY_MAX_CHARS}
                    </span>
                  </div>
                  {error ? (
                    <p style={{ margin: "8px 0 0", fontSize: 13, color: "var(--destructive)" }}>{error}</p>
                  ) : null}
                </div>

                <div style={{ display: "grid", gap: 8 }}>
                  <div>
                    <p style={{ margin: "0 0 4px", fontSize: 11, fontWeight: 800, color: t.text }}>サンプルから選ぶ</p>
                    <p style={{ margin: 0, fontSize: 11, color: t.sub, lineHeight: 1.5 }}>💡 タップして入力欄に反映できます</p>
                  </div>
                  <div style={{ display: "grid", gap: 8 }}>
                    {templateSuggestions.map((text) => {
                      const isActive = activeTemplate === text;
                      return (
                        <button
                          key={text}
                          type="button"
                          onClick={() => applyTemplate(text)}
                          style={{
                            textAlign: "left",
                            width: "100%",
                            padding: "12px 14px",
                            borderRadius: 12,
                            border: `1px solid ${isActive ? `${roleColor}66` : t.border}`,
                            background: isActive ? `${roleColor}14` : "rgba(255,255,255,0.03)",
                            color: t.text,
                            cursor: "pointer",
                            fontSize: 13,
                            lineHeight: 1.7,
                            transition: "background 0.15s ease, border-color 0.15s ease",
                          }}
                        >
                          {text}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div>
                  <p style={{ margin: "0 0 8px", fontSize: 11, fontWeight: 700, color: t.sub }}>今日のコンディション</p>
                  <ConditionScorePicker
                    value={conditionScore}
                    onChange={setConditionScore}
                    t={t}
                    roleColor={roleColor}
                    showSubLabels={!isMobile}
                  />
                </div>

                <ActivityExtras
                  imageUrl={imageUrl}
                  videoUrl={videoUrl}
                  tags={tags}
                  isPublic={isPublic}
                  onImageChange={setImageUrl}
                  onVideoChange={setVideoUrl}
                  onTagsChange={setTags}
                  onPublicChange={setIsPublic}
                  t={t}
                  roleColor={roleColor}
                  disabled={isSubmitting}
                />

                <button
                  type="button"
                  className="vz-btn"
                  onClick={() => void handleSubmit()}
                  disabled={!canSubmit}
                  style={{
                    width: "100%",
                    border: "none",
                    borderRadius: 8,
                    padding: "14px 14px",
                    background: canSubmit ? "#a78bfa" : "rgba(255,255,255,0.08)",
                    color: canSubmit ? "#000" : "rgba(255,255,255,0.35)",
                    fontSize: 13,
                    fontWeight: 700,
                    cursor: canSubmit ? "pointer" : "not-allowed",
                    boxShadow: canSubmit ? "0 0 20px rgba(167,139,250,0.3)" : "none",
                    opacity: isSubmitting ? 0.7 : 1,
                  }}
                >
                  {isSubmitting ? "Pulseを刻んでいます..." : submitted || alreadyLogged ? "今日は記録済みです" : "Journeyを刻む"}
                </button>

                {alreadyLogged ? (
                  <div
                    role="status"
                    aria-live="polite"
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 8,
                      padding: "12px 14px",
                      borderRadius: 12,
                      border: `1px solid ${roleColor}44`,
                      background: `${roleColor}14`,
                      color: t.text,
                      fontSize: 13,
                      fontWeight: 700,
                      lineHeight: 1.6,
                    }}
                  >
                    今日はすでに記録済みです😊 また明日！
                  </div>
                ) : null}
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 16, padding: "24px 8px", textAlign: "center" }}>
                <motion.p
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ type: "spring", stiffness: 320, damping: 18 }}
                  style={{ margin: 0, fontFamily: "var(--font-bebas)", fontSize: 26, letterSpacing: "0.06em", color: "var(--electric)" }}
                >
                  今日のPulseを刻みました
                </motion.p>
                <div style={{ display: "flex", flexDirection: "column", gap: 8, width: "100%", maxWidth: 360 }}>
                  <button
                    type="button"
                    onClick={() => setView("discovery")}
                    style={{ width: "100%", padding: "12px 14px", borderRadius: 12, border: `1px solid ${roleColor}55`, background: `${roleColor}18`, color: roleColor, fontSize: 13, fontWeight: 800, cursor: "pointer" }}
                  >
                    誰かにCheerを送る →
                  </button>
                  <ActionPill onClick={() => setView("home")} color={roleColor} t={t}>ダッシュボードへ</ActionPill>
                </div>
              </div>
            )}
            <div style={{ marginTop: 14 }}>
              <div style={{ position: "relative", padding: "6px 0 14px" }}>
                <div style={{ position: "absolute", inset: "-12px -10px", borderRadius: 0, background: `radial-gradient(circle at 40% 40%, ${roleColor}40, transparent 62%)`, filter: "blur(18px)", opacity: 0.9, pointerEvents: "none" }} />
                {(() => {
                  const raw = hypeMessage.replace(/^Your Hype:\s*/, "");
                  const dashIndex = raw.lastIndexOf("—");
                  const quote = dashIndex >= 0 ? raw.slice(0, dashIndex).trim() : raw.trim();
                  const author = dashIndex >= 0 ? raw.slice(dashIndex).trim() : "";
                  return (
                    <>
                      <p style={{ position: "relative", margin: 0, fontSize: 14, color: t.text, lineHeight: 1.9, fontWeight: 800 }}>
                        &ldquo;{quote}&rdquo;
                      </p>
                      {author ? (
                        <p style={{ position: "relative", margin: "6px 0 0", fontSize: 12, color: t.sub, fontFamily: "monospace", letterSpacing: "0.04em", lineHeight: 1.4, width: "fit-content", marginLeft: "auto", paddingRight: "18%" }}>
                          {author}
                        </p>
                      ) : null}
                    </>
                  );
                })()}
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
                  <p style={{ margin: 0, fontSize: 24, fontWeight: 900, color: t.text }}>4:00-10:00</p>
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
                        <span style={{ fontSize: 12, color: t.text, fontWeight: 900 }}>{meta?.emoji ?? "🙂"} {formatConditionLabel(selectedLog.condition_score)}</span>
                      </div>
                      <p style={{ margin: 0, fontSize: 13, color: t.text, lineHeight: 1.9, whiteSpace: "pre-wrap" }}>{selectedLog.content}</p>
                    </div>
                  );
                })()
              ) : (
                <p style={{ margin: 0, fontSize: 12, color: t.sub }}>この日の記録はありません。</p>
              )}
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
                <div style={{ width: "100%", maxWidth: 560, marginLeft: "auto", marginRight: "auto" }}>
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

      <SectionCard t={t} accentColor={roleColor}>
        <CardHeader
          title="This Week — 今週の活動"
          meta={<p style={{ margin: 0, fontSize: 12, color: t.sub, lineHeight: 1.7 }}>この週（月曜〜日曜）に記録した Activity をまとめて確認できます。</p>}
          action={weekNav}
        />

        {weeklyLoading ? (
          <p style={{ margin: 0, fontSize: 12, color: t.sub }}>今週のActivityを読み込み中...</p>
        ) : weekly && weekly.activities.length > 0 ? (
          <div style={{ display: "grid", gap: 12 }}>
            {/* 達成度ヘッダー */}
            {(() => {
              const rate = weekly.counts.total > 0 ? weekly.counts.completed / weekly.counts.total : 0;
              const isPerfect = weekly.counts.total > 0 && rate >= 1;
              return (
                <div
                  style={{
                    display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12,
                    padding: "14px 16px", borderRadius: 16,
                    border: `1px solid ${isPerfect ? WEEKLY_STATUS_COLOR.completed + "66" : t.border}`,
                    background: isPerfect ? "rgba(50,210,120,0.08)" : "rgba(255,255,255,0.02)",
                  }}
                >
                  <div style={{ minWidth: 0 }}>
                    <p style={{ margin: 0, fontSize: 10, color: t.sub, fontFamily: "monospace", letterSpacing: "0.16em", textTransform: "uppercase" }}>
                      WEEKLY ACHIEVEMENT
                    </p>
                    <p style={{ margin: "4px 0 0", fontSize: 18, fontWeight: 900, color: isPerfect ? WEEKLY_STATUS_COLOR.completed : t.text }}>
                      {isPerfect ? "GREAT WEEK 🔥" : <TextScramble text={`${Math.round(rate * 100)}%`} delay={200} />}
                    </p>
                  </div>
                  <p style={{ margin: 0, fontSize: 12, color: t.sub, textAlign: "right", lineHeight: 1.7 }}>
                    {weekly.counts.completed} / {weekly.counts.total} 完了
                  </p>
                </div>
              );
            })()}

            {/* スコアボード */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, minmax(0, 1fr))", gap: 10 }}>
              {[
                { label: "ACTIVITIES", value: weekly.counts.total, color: t.text },
                { label: "CHEER", value: weekly.counts.cheers, color: "#FFD600" },
                { label: "COMMENTS", value: weekly.counts.comments, color: "#7BB0FF" },
                { label: "TOGETHER", value: weekly.counts.together, color: "#1D9E75" },
              ].map((s) => (
                <div key={s.label} style={{ padding: "12px 10px", borderRadius: 14, border: `1px solid ${t.border}`, background: "rgba(255,255,255,0.03)", textAlign: "center" }}>
                  <p style={{ margin: 0, fontSize: 26, fontWeight: 900, lineHeight: 1, color: s.color }}>
                    <TextScramble text={String(s.value)} delay={120} />
                  </p>
                  <p style={{ margin: "6px 0 0", fontSize: 8, color: t.sub, fontFamily: "monospace", letterSpacing: "0.14em" }}>{s.label}</p>
                </div>
              ))}
            </div>

            {/* 種別 */}
            <div style={{ padding: "12px 14px", borderRadius: 12, border: `1px solid ${t.border}`, background: "rgba(255,255,255,0.02)" }}>
              <p style={{ margin: 0, fontSize: 9, color: t.sub, fontFamily: "monospace", letterSpacing: "0.12em", textTransform: "uppercase" }}>種別</p>
              <p style={{ margin: "6px 0 0", fontSize: 13, fontWeight: 800, color: t.text, lineHeight: 1.6 }}>
                {Object.entries(weekly.counts.byType).map(([type, n]) => `${WEEKLY_TYPE_LABELS[type] ?? type}×${n}`).join("  ") || "—"}
              </p>
            </div>

            {/* 一覧 */}
            <div style={{ display: "grid", gap: 8 }}>
              {weekly.activities.map((a) => {
                const sc = WEEKLY_STATUS_COLOR[a.status] ?? "rgba(255,255,255,0.5)";
                return (
                  <div
                    key={a.id}
                    style={{
                      display: "flex", flexDirection: "column", gap: 6,
                      padding: "12px 14px", borderRadius: 12,
                      border: `1px solid ${a.status === "completed" ? WEEKLY_STATUS_COLOR.completed + "44" : t.border}`,
                      background: a.status === "completed" ? "rgba(50,210,120,0.05)" : "rgba(255,255,255,0.02)",
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                      <span style={{ fontSize: 10, fontWeight: 800, padding: "2px 8px", borderRadius: 999, background: `${roleColor}16`, color: roleColor, border: `1px solid ${roleColor}30` }}>
                        {WEEKLY_TYPE_LABELS[a.type] ?? a.type}
                      </span>
                      <span style={{ fontSize: 14, fontWeight: 800, color: t.text, flex: 1, minWidth: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {a.title ?? "（タイトルなし）"}
                      </span>
                      <span style={{ fontSize: 10, fontWeight: 700, color: sc }}>{WEEKLY_STATUS_LABELS[a.status] ?? a.status}</span>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 11, color: t.sub, flexWrap: "wrap" }}>
                      <span>🗓 {new Date(a.starts_at).toLocaleString("ja-JP", { month: "numeric", day: "numeric", hour: "2-digit", minute: "2-digit" })}</span>
                      {a.place ? (
                        <>
                          <span aria-hidden style={{ opacity: 0.5 }}>•</span>
                          <span>📍 {a.place.name}（{a.place.prefecture}）</span>
                        </>
                      ) : null}
                    </div>
                    {a.participants.length > 0 ? (
                      <div style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 11, color: t.text }}>
                        <span style={{ color: t.sub }}>Together:</span>
                        <span style={{ fontWeight: 700 }}>
                          {a.participants.map((p) => p.user_display_name ?? p.user_slug ?? "ユーザー").join(", ")}
                        </span>
                      </div>
                    ) : null}
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          <p style={{ margin: 0, fontSize: 12, color: t.sub }}>
            {weekRangeLabel} に記録した Activity はまだありません。
          </p>
        )}

        <button
          type="button"
          onClick={() => setView("activities")}
          style={{ marginTop: 4, border: `1px solid ${roleColor}` , borderRadius: 14, padding: "16px 16px", width: "100%", background: roleColor, color: "#000", fontWeight: 900, fontSize: 14, cursor: "pointer", letterSpacing: "0.06em", boxShadow: `0 10px 32px ${roleColor}55` }}
        >
          FIND NEXT ACTIVITY → 次の活動を探す・募集を見る
        </button>
      </SectionCard>

      <SectionCard t={t} accentColor="#C8E800">
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
          <div style={{ minWidth: 0 }}>
            <p style={{ margin: 0, fontSize: 13, fontWeight: 800, color: t.text }}>Vizion Connection を広めよう</p>
            <p style={{ margin: "4px 0 0", fontSize: 11, color: t.sub }}>友達を招待すると、双方に +500pt</p>
          </div>
          <button
            type="button"
            onClick={() => setView("referral")}
            style={{ border: "none", borderRadius: 10, padding: "10px 16px", background: "#C8E800", color: "#000", fontWeight: 800, fontSize: 12, cursor: "pointer", whiteSpace: "nowrap" }}
          >
            友達を招待する →
          </button>
        </div>
      </SectionCard>

      {toastMessage ? (
        <div
          role="status"
          aria-live="polite"
          style={{
            position: "fixed",
            left: "50%",
            bottom: 24,
            transform: "translateX(-50%)",
            zIndex: 120,
            maxWidth: "min(360px, calc(100vw - 32px))",
            padding: "10px 16px",
            borderRadius: 999,
            border: `1px solid ${roleColor}44`,
            background: "rgba(12,12,16,0.96)",
            color: t.text,
            fontSize: 12,
            fontWeight: 700,
            boxShadow: "0 8px 32px rgba(0,0,0,0.45)",
            pointerEvents: "none",
          }}
        >
          {toastMessage}
        </div>
      ) : null}

      {successModalOpen ? (
        <>
          <button
            type="button"
            aria-label="完了メッセージを閉じる"
            onClick={() => setSuccessModalOpen(false)}
            style={{ position: "fixed", inset: 0, zIndex: 95, border: "none", background: "rgba(0,0,0,0.6)", backdropFilter: "blur(8px)", cursor: "pointer" }}
          />
          <div style={{ position: "fixed", inset: 0, zIndex: 96, display: "grid", placeItems: "center", padding: 16, pointerEvents: "none" }}>
            <div style={{ width: "100%", maxWidth: 400, borderRadius: 16, border: `1px solid ${roleColor}44`, background: t.bg, padding: 20, textAlign: "center", boxShadow: "0 18px 60px rgba(0,0,0,0.55)", pointerEvents: "auto" }}>
              <p style={{ margin: 0, fontSize: 22, fontWeight: 900, color: t.text }}>記録しました 🔥</p>
              <p style={{ margin: "8px 0 0", fontSize: 13, color: t.sub, lineHeight: 1.7 }}>今日のJourneyが積み上がりました。</p>
              <div style={{ display: "flex", flexDirection: "column", gap: 8, marginTop: 16 }}>
                <button
                  type="button"
                  onClick={() => {
                    setSuccessModalOpen(false);
                    setView("discovery");
                  }}
                  style={{ width: "100%", padding: "12px 14px", borderRadius: 12, border: "none", background: roleColor, color: "#0B0B0F", fontSize: 13, fontWeight: 800, cursor: "pointer" }}
                >
                  誰かにCheerを送る
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setSuccessModalOpen(false);
                    setView("home");
                  }}
                  style={{ width: "100%", padding: "12px 14px", borderRadius: 12, border: `1px solid ${t.border}`, background: "rgba(255,255,255,0.04)", color: t.text, fontSize: 13, fontWeight: 700, cursor: "pointer" }}
                >
                  ダッシュボードへ
                </button>
              </div>
            </div>
          </div>
        </>
      ) : null}

      {showShareModal && !shareCompleted ? (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.75)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 100,
            padding: 24,
          }}
        >
          <div
            style={{
              background: "#111118",
              border: "1px solid rgba(255,255,255,0.1)",
              borderRadius: 20,
              padding: "32px 28px",
              maxWidth: 360,
              width: "100%",
              textAlign: "center",
              animation: "vcFadeUp 0.3s ease-out",
            }}
          >
            <div style={{ marginBottom: 16, display: "flex", justifyContent: "center" }}>
              <PulseIndicator days={streakDays} size="lg" />
            </div>

            <h3 style={{ fontSize: 18, fontWeight: 800, color: "#f0f0f5", marginBottom: 8 }}>
              TIMELINEにシェアしますか？
            </h3>
            <p style={{ fontSize: 13, color: "rgba(255,255,255,0.5)", lineHeight: 1.8, marginBottom: 24 }}>
              今日の記録はフォロワーに届いています。
              <br />
              Timelineで見てみましょう。
            </p>

            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              <button
                type="button"
                onClick={() => void handleShareToTimeline()}
                disabled={sharePosting}
                style={{
                  padding: "13px",
                  borderRadius: 10,
                  background: "#a78bfa",
                  color: "#000",
                  border: "none",
                  fontWeight: 700,
                  fontSize: 14,
                  cursor: sharePosting ? "default" : "pointer",
                  opacity: sharePosting ? 0.7 : 1,
                }}
              >
                {sharePosting ? "シェア中..." : "Timelineで見る"}
              </button>
              <button
                type="button"
                onClick={() => setShowShareModal(false)}
                style={{
                  padding: "13px",
                  borderRadius: 10,
                  background: "transparent",
                  border: "1px solid rgba(255,255,255,0.12)",
                  color: "rgba(255,255,255,0.45)",
                  fontSize: 13,
                  cursor: "pointer",
                }}
              >
                あとで
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {showShareModal && shareCompleted ? (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.75)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 100,
          }}
        >
          <div style={{ textAlign: "center", animation: "vcFadeUp 0.3s ease-out" }}>
            <div style={{ fontSize: 48, marginBottom: 12, color: "#a78bfa" }}>✓</div>
            <div style={{ fontSize: 16, fontWeight: 700, color: "#f0f0f5" }}>TIMELINEに表示中</div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
