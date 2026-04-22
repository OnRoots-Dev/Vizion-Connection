"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import type { ProfileData } from "@/features/profile/types";
import type { DashboardView, ThemeColors } from "@/app/(app)/dashboard/types";
import { ProfileCardSection } from "@/app/(app)/dashboard/components/ProfileCard";
import { ActionPill, CardHeader, SectionCard } from "@/app/(app)/dashboard/components/ui";
import { DailyLogCard } from "@/components/DailyLog/DailyLogCard";
import { CATEGORY_CONFIG } from "@/types/schedule";
import type { Schedule } from "@/types/schedule";

export function HomeView({ profile, referralUrl, referralCount, t, roleColor, setView }: {
    profile: ProfileData;
    referralUrl: string;
    referralCount: number;
    t: ThemeColors;
    roleColor: string;
    setView: (v: DashboardView) => void;
}) {
    const [upcomingSchedules, setUpcomingSchedules] = useState<Schedule[]>([]);

    const formatTime = (iso: string) => new Date(iso).toLocaleTimeString("ja-JP", { hour: "2-digit", minute: "2-digit" });
    const formatMd = (iso: string) => new Date(iso).toLocaleDateString("ja-JP", { month: "2-digit", day: "2-digit" });

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

    return (
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <div style={{ position: "relative", overflow: "hidden", paddingBottom: 8 }}>
                <motion.p initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} style={{ fontSize: 9, fontWeight: 900, letterSpacing: "0.35em", textTransform: "uppercase", color: t.sub, opacity: 0.5, margin: "0 0 4px", fontFamily: "monospace" }}>
                    Vizion Connection Dashboard
                </motion.p>
                <motion.h1 initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.05 }} className="font-display" style={{ fontSize: "clamp(32px,5vw,56px)", fontWeight: 900, color: t.text, margin: 0, lineHeight: 1, letterSpacing: "-0.01em", textTransform: "uppercase" }}>
                    <span style={{ color: roleColor }}>{profile.role}</span> / BASE
                </motion.h1>
            </div>

            <ProfileCardSection profile={profile} t={t} roleColor={roleColor} setView={setView} referralUrl={referralUrl} referralCount={referralCount} />

            <DailyLogCard t={t} roleColor={roleColor} role={profile.role} onOpenJourney={setView} />

            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
                <SectionCard t={t} accentColor={roleColor}>
                    <CardHeader
                        title="Schedule"
                        color={roleColor}
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
        </div>
    );
}
