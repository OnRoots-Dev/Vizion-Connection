"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import type { ProfileData } from "@/features/profile/types";
import type { DashboardView, ThemeColors } from "@/app/(app)/dashboard/types";
import { ProfileCardSection } from "@/app/(app)/dashboard/components/ProfileCard";
import { ActionPill, CardHeader, SectionCard, SectionHeader, PulseIndicator, StatBlock } from "@/app/(app)/dashboard/components/ui";
import { DailyLogCard } from "@/components/DailyLog/DailyLogCard";
import { supabaseBrowser } from "@/lib/supabase/browser";
import { CATEGORY_CONFIG } from "@/types/schedule";
import type { Schedule } from "@/types/schedule";
import { SkeletonCard } from "@/components/ui/skeleton/SkeletonCard";

// 連続記録（PULSE）日数を JST 基準で算出
function jstDay(iso: string): string {
    return new Date(new Date(iso).getTime() + 9 * 60 * 60 * 1000).toISOString().slice(0, 10);
}
function streakFrom(dates: string[]): number {
    const days = new Set(dates.map(jstDay));
    if (days.size === 0) return 0;
    const today = new Date(Date.now() + 9 * 60 * 60 * 1000).toISOString().slice(0, 10);
    const yest = new Date(Date.now() + 9 * 60 * 60 * 1000 - 86400000).toISOString().slice(0, 10);
    let cursor = days.has(today) ? today : days.has(yest) ? yest : null;
    if (!cursor) return 0;
    let streak = 0;
    while (days.has(cursor)) {
        streak += 1;
        cursor = new Date(new Date(`${cursor}T00:00:00Z`).getTime() - 86400000).toISOString().slice(0, 10);
    }
    return streak;
}
function todayJst(): string {
    return new Date(Date.now() + 9 * 60 * 60 * 1000).toISOString().slice(0, 10);
}

export function HomeView({ profile, referralUrl, referralCount, t, roleColor, setView }: {
    profile: ProfileData;
    referralUrl: string;
    referralCount: number;
    t: ThemeColors;
    roleColor: string;
    setView: (v: DashboardView) => void;
}) {
    const [upcomingSchedules, setUpcomingSchedules] = useState<Schedule[]>([]);
    const [pulseDays, setPulseDays] = useState(0);
    const [circuit, setCircuit] = useState({ journey: false, cheer: false, timeline: false });
    const [initialLoading, setInitialLoading] = useState(true);
    const loadedRef = useRef(false);

    const formatTime = (iso: string) => new Date(iso).toLocaleTimeString("ja-JP", { hour: "2-digit", minute: "2-digit" });
    const formatMd = (iso: string) => new Date(iso).toLocaleDateString("ja-JP", { month: "2-digit", day: "2-digit" });

    // PULSE 日数を journeys から、DAILY CIRCUIT 状態を daily_circuits（API）から取得
    useEffect(() => {
        let cancelled = false;
        const t = todayJst();
        if (!loadedRef.current) {
            loadedRef.current = true;
            window.setTimeout(() => { if (!cancelled) setInitialLoading(false); }, 600);
        }
        void supabaseBrowser
            .from("journeys")
            .select("created_at")
            .eq("user_slug", profile.slug)
            .order("created_at", { ascending: false })
            .limit(120)
            .then(({ data }) => {
                if (cancelled) return;
                const dates = (data ?? []).map((r) => String(r.created_at));
                const journeyToday = dates.some((d) => jstDay(d) === t);
                setPulseDays(streakFrom(dates));
                // journeys に当日記録があれば journey は確定で done
                if (journeyToday) setCircuit((prev) => ({ ...prev, journey: true }));
            });
        void fetch("/api/daily-circuit", { cache: "no-store" })
            .then((r) => r.json())
            .then((d) => {
                if (cancelled || !d?.circuit) return;
                setCircuit((prev) => ({
                    journey: prev.journey || !!d.circuit.journey,
                    cheer: !!d.circuit.cheer,
                    timeline: !!d.circuit.timeline,
                }));
            })
            .catch(() => { /* 取得失敗時は既定値のまま */ });
        return () => { cancelled = true; };
    }, [profile.slug]);

    const circuitTasks = [
        { key: "journey", label: "Journey記録", done: circuit.journey, view: "journey" as DashboardView },
        { key: "cheer", label: "Cheer送信", done: circuit.cheer, view: "timeline" as DashboardView },
        { key: "timeline", label: "Timeline閲覧", done: circuit.timeline, view: "timeline" as DashboardView },
    ];
    const circuitComplete = circuitTasks.every((task) => task.done);

    useEffect(() => {
        let cancelled = false;
        fetch("/api/schedules/upcoming?limit=3", { cache: "no-store" })
            .then((r) => r.json())
            .then((d) => {
                if (!cancelled) {
                    setUpcomingSchedules(Array.isArray(d.schedules) ? (d.schedules as Schedule[]) : []);
                }
            })
            .catch(() => {
                if (!cancelled) setUpcomingSchedules([]);
            });
        return () => { cancelled = true; };
    }, []);

    if (initialLoading) {
        return (
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                <SkeletonCard height={80} />
                <SkeletonCard height={160} />
                <SkeletonCard height={120} />
            </div>
        );
    }

    return (
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <div style={{ position: "relative", overflow: "hidden", paddingBottom: 8 }}>
                <motion.p initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} style={{ fontSize: 10, fontWeight: 600, letterSpacing: "0.18em", textTransform: "uppercase", color: "rgba(255,255,255,0.28)", margin: "0 0 4px", fontFamily: "'Space Mono', monospace" }}>
                    Vizion Connection Dashboard
                </motion.p>
                <motion.h1 initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.05 }} className="font-display" style={{ fontSize: "clamp(2rem,5vw,3.5rem)", fontWeight: 800, color: "#f0f0f5", margin: 0, lineHeight: 1, letterSpacing: "-0.01em", textTransform: "uppercase" }}>
                    <span style={{ color: roleColor }}>{profile.role}</span> / BASE
                </motion.h1>
            </div>

            {/* DAILY CIRCUIT */}
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
                <SectionCard t={t} accentColor="#a78bfa">
                    <CardHeader
                        title="Daily Circuit"
                        meta={
                            <span style={{ fontSize: 11, color: circuitComplete ? "#32D278" : "var(--vc-text3)", fontFamily: "'Space Mono', monospace" }}>
                                {circuitComplete ? "⊹ 本日のサーキット完了 — PULSE +1" : `${circuitTasks.filter((task) => task.done).length} / 3 完了`}
                            </span>
                        }
                    />
                    <div>
                        {circuitTasks.map((task) => (
                            <button
                                key={task.key}
                                type="button"
                                onClick={() => setView(task.view)}
                                style={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: 12,
                                    width: "100%",
                                    padding: "12px 0",
                                    borderBottom: "1px solid var(--vc-border)",
                                    background: "transparent",
                                    border: "none",
                                    borderBottomWidth: 1,
                                    borderBottomStyle: "solid",
                                    borderBottomColor: "var(--vc-border)",
                                    cursor: "pointer",
                                    opacity: task.done ? 0.5 : 1,
                                    textAlign: "left",
                                }}
                            >
                                <span
                                    style={{
                                        width: 22,
                                        height: 22,
                                        borderRadius: "50%",
                                        border: task.done ? "none" : "1.5px solid rgba(255,255,255,0.2)",
                                        background: task.done ? "var(--vc-accent)" : "transparent",
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        flexShrink: 0,
                                        transition: "all 0.3s",
                                    }}
                                >
                                    {task.done && <span style={{ fontSize: 12, color: "#000" }}>✓</span>}
                                </span>
                                <span style={{ fontSize: 14, color: task.done ? "var(--vc-text3)" : "var(--vc-text1)", textDecoration: task.done ? "line-through" : "none" }}>
                                    {task.label}
                                </span>
                            </button>
                        ))}
                    </div>
                </SectionCard>
            </motion.div>

            {/* PULSE ステータス */}
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
                <SectionCard t={t} accentColor={roleColor}>
                    <CardHeader title="Pulse" meta={<PulseIndicator days={pulseDays} size="md" />} />
                    <div style={{ display: "flex", gap: 28, flexWrap: "wrap" }}>
                        <StatBlock value={pulseDays} label="継続日数" accent="var(--vc-accent)" />
                        <StatBlock value={profile.cheerCount ?? 0} label="Cheer" accent="#FFC81E" />
                        <StatBlock value={referralCount} label="Referral" />
                    </div>
                </SectionCard>
            </motion.div>

            <ProfileCardSection profile={profile} t={t} roleColor={roleColor} setView={setView} referralUrl={referralUrl} referralCount={referralCount} />

            <DailyLogCard t={t} roleColor={roleColor} role={profile.role} onOpenJourney={setView} />

            {/* Schedule section commented out temporarily */}
            {/*
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
                <SectionCard t={t} accentColor="#a78bfa">
                    <CardHeader
                        title="Schedule"
                        action={<ActionPill onClick={() => setView("schedule")} color={roleColor} t={t}>View →</ActionPill>}
                    />
                    {upcomingSchedules.length === 0 ? (
                        <p style={{ margin: 0, fontSize: 12, color: t.sub }}>直近の予定はありません。</p>
                    ) : (
                        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                            {upcomingSchedules.slice(0, 3).map((s) => {
                                const cfg = CATEGORY_CONFIG[s.category];
                                const startLabel = `${formatMd(s.start_at)} ${formatTime(s.start_at)}`;
                                const endLabel = s.end_at ? formatTime(s.end_at) : null;
                                const timeLabel = endLabel ? `${startLabel} - ${endLabel}` : startLabel;
                                const locationLabel = String(s.location ?? "").trim();
                                return (
                                    <button
                                        key={s.id}
                                        type="button"
                                        onClick={() => setView("schedule")}
                                        style={{
                                            display: "grid",
                                            gridTemplateColumns: "auto minmax(0, 1fr)",
                                            gap: 10,
                                            alignItems: "center",
                                            padding: "10px 12px",
                                            borderRadius: 12,
                                            border: `1px solid ${t.border}`,
                                            background: "rgba(255,255,255,0.02)",
                                            color: t.text,
                                            textDecoration: "none",
                                            textAlign: "left",
                                            cursor: "pointer",
                                        }}
                                    >
                                        <span style={{ fontSize: 10, fontWeight: 800, color: cfg.color, padding: "4px 8px", borderRadius: 999, background: `${cfg.color}18`, border: `1px solid ${cfg.color}25`, flexShrink: 0 }}>
                                            {cfg.label}
                                        </span>
                                        <div style={{ minWidth: 0 }}>
                                            <p style={{ margin: "0 0 2px", fontSize: 12, fontWeight: 800, color: t.text, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{s.title}</p>
                                            <p style={{ margin: 0, fontSize: 10, color: t.sub, fontFamily: "monospace", opacity: 0.75, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                                                {timeLabel}
                                            </p>
                                            {locationLabel ? (
                                                <p style={{ margin: "3px 0 0", fontSize: 10, color: t.sub, opacity: 0.65, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                                                    {locationLabel}
                                                </p>
                                            ) : null}
                                        </div>
                                    </button>
                                );
                            })}
                        </div>
                    )}
                </SectionCard>
            </motion.div>
            */}
        </div>
    );
}
