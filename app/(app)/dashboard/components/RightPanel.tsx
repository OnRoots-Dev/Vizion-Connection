"use client";

// ─────────────────────────────────────────────────────────────────────────────
// components/RightPanel.tsx
// ─────────────────────────────────────────────────────────────────────────────

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { ProfileData } from "@/features/profile/types";
import type { DashboardView, ThemeColors } from "../DashboardClient";

interface Props {
    profile: ProfileData;
    referralCount: number;
    t: ThemeColors;
    roleColor: string;
    setView: (v: DashboardView) => void;
}

const REFERRAL_LIMIT = 30;
const POINTS_PER_REFERRAL = 500;

export function RightPanel({ profile, referralCount, t, roleColor, setView }: Props) {
    const maxPoints = REFERRAL_LIMIT * POINTS_PER_REFERRAL;
    const ptPct = Math.min((profile.points / maxPoints) * 100, 100);

    const MISSIONS = [
        { label: "先行登録完了", done: true },
        { label: "メール認証完了", done: profile.verified },
        { label: "SNSで共有", done: profile.hasShared ?? false },
        { label: "3人招待する", done: referralCount >= 3 },
        { label: "プロフィール編集", done: !!(profile.bio || profile.sport || profile.region) },
    ];
    const completedCount = MISSIONS.filter(m => m.done).length;
    const allDone = completedCount === MISSIONS.length;
    const [bonusGiven, setBonusGiven] = useState(false);

    useEffect(() => {
        if (allDone && !bonusGiven) {
            setBonusGiven(true);
            fetch("/api/missions/complete", { method: "POST" });
        }
    }, [allDone, bonusGiven]);

    return (
        <div style={{ padding: "16px 12px", display: "flex", flexDirection: "column", gap: 12 }}>

            {/* ── Vizion Points ── */}
            <div>
                <p style={{ fontSize: 8, fontWeight: 900, letterSpacing: "0.25em", textTransform: "uppercase", color: t.sub, margin: "0 0 10px", fontFamily: "monospace", opacity: 0.45 }}>
                    Vizion Points
                </p>
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.08 }}
                    style={{ padding: "16px", borderRadius: 14, background: "rgba(255,255,255,0.025)", border: `1px solid ${roleColor}20`, position: "relative", overflow: "hidden" }}
                >
                    <div style={{ position: "absolute", top: -20, right: -20, width: 80, height: 80, borderRadius: "50%", background: `radial-gradient(circle,${roleColor}15,transparent 70%)`, pointerEvents: "none" }} />

                    {/* ポイント数 */}
                    <div style={{ display: "flex", alignItems: "baseline", gap: 5, marginBottom: 3 }}>
                        <motion.span
                            key={profile.points}
                            initial={{ opacity: 0, y: -6 }}
                            animate={{ opacity: 1, y: 0 }}
                            style={{ fontSize: 30, fontWeight: 900, color: roleColor, lineHeight: 1, fontFamily: "monospace" }}
                        >
                            {profile.points.toLocaleString()}
                        </motion.span>
                        <span style={{ fontSize: 11, color: t.sub }}>pt</span>
                    </div>
                    <p style={{ fontSize: 9, color: t.sub, margin: "0 0 10px", opacity: 0.45, fontFamily: "monospace" }}>
                        / {maxPoints.toLocaleString()} pt MAX
                    </p>

                    {/* バー */}
                    <div style={{ height: 4, borderRadius: 99, background: "rgba(255,255,255,0.06)", overflow: "hidden", marginBottom: 10 }}>
                        <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${ptPct}%` }}
                            transition={{ duration: 1.2, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
                            style={{ height: "100%", borderRadius: 99, background: `linear-gradient(90deg,${roleColor},${roleColor}88)`, boxShadow: `0 0 8px ${roleColor}60` }}
                        />
                    </div>

                    {/* 獲得方法 */}
                    <div style={{ display: "flex", gap: 6 }}>
                        {[
                            { label: "招待", val: `+${POINTS_PER_REFERRAL}pt` },
                            { label: "全完了", val: "+500pt" },
                        ].map(({ label, val }) => (
                            <div key={label} style={{ flex: 1, padding: "5px 8px", borderRadius: 8, background: `${roleColor}08`, border: `1px solid ${roleColor}15`, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                <span style={{ fontSize: 9, color: t.sub, opacity: 0.55 }}>{label}</span>
                                <span style={{ fontSize: 10, fontWeight: 800, color: roleColor, fontFamily: "monospace" }}>{val}</span>
                            </div>
                        ))}
                    </div>
                </motion.div>
            </div>

            {/* ── Missions ── */}
            <div>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
                    <p style={{ fontSize: 8, fontWeight: 900, letterSpacing: "0.25em", textTransform: "uppercase", color: t.sub, margin: 0, fontFamily: "monospace", opacity: 0.45 }}>Missions</p>
                    <span style={{ fontSize: 9, fontWeight: 900, fontFamily: "monospace", color: allDone ? "#FFD600" : t.sub, background: allDone ? "rgba(255,214,0,0.1)" : "rgba(255,255,255,0.04)", border: `1px solid ${allDone ? "rgba(255,214,0,0.25)" : "rgba(255,255,255,0.07)"}`, padding: "2px 7px", borderRadius: 99 }}>
                        {completedCount} / {MISSIONS.length}
                    </span>
                </div>
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.14 }}
                    style={{ padding: "12px 14px", borderRadius: 14, background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)" }}
                >
                    {/* ミッションバー */}
                    <div style={{ height: 3, borderRadius: 99, background: "rgba(255,255,255,0.05)", overflow: "hidden", marginBottom: 12 }}>
                        <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${(completedCount / MISSIONS.length) * 100}%` }}
                            transition={{ duration: 1, delay: 0.5, ease: [0.16, 1, 0.3, 1] }}
                            style={{ height: "100%", borderRadius: 99, background: allDone ? "linear-gradient(90deg,#FFD600,#FFD60088)" : "linear-gradient(90deg,rgba(255,255,255,0.3),rgba(255,255,255,0.1))" }}
                        />
                    </div>

                    {/* ミッション行 */}
                    {MISSIONS.map(({ label, done }, i) => (
                        <motion.div
                            key={label}
                            initial={{ opacity: 0, x: 6 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.3, delay: 0.18 + i * 0.04 }}
                            style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: i < MISSIONS.length - 1 ? 7 : 0 }}
                        >
                            <div style={{ width: 16, height: 16, borderRadius: "50%", flexShrink: 0, background: done ? `${roleColor}20` : "rgba(255,255,255,0.04)", border: `1.5px solid ${done ? roleColor : "rgba(255,255,255,0.1)"}`, display: "flex", alignItems: "center", justifyContent: "center", boxShadow: done ? `0 0 5px ${roleColor}40` : "none", transition: "all 0.3s" }}>
                                <AnimatePresence>
                                    {done && (
                                        <motion.svg initial={{ scale: 0, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} width={8} height={8} fill="none" viewBox="0 0 24 24" stroke={roleColor} strokeWidth={3.5}>
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                        </motion.svg>
                                    )}
                                </AnimatePresence>
                            </div>
                            <span style={{ fontSize: 11, color: done ? t.sub : t.text, opacity: done ? 0.45 : 1, textDecoration: done ? "line-through" : "none", flex: 1 }}>
                                {label}
                            </span>
                            {!done && <span style={{ fontSize: 8, color: t.sub, opacity: 0.3, fontFamily: "monospace" }}>→</span>}
                        </motion.div>
                    ))}

                    {/* 全完了バナー */}
                    <AnimatePresence>
                        {allDone && (
                            <motion.div
                                initial={{ opacity: 0, y: 6 }}
                                animate={{ opacity: 1, y: 0 }}
                                style={{ marginTop: 10, padding: "8px 10px", borderRadius: 9, background: "rgba(255,214,0,0.07)", border: "1px solid rgba(255,214,0,0.2)", display: "flex", alignItems: "center", gap: 7 }}
                            >
                                <span style={{ fontSize: 13 }}>🏆</span>
                                <div>
                                    <p style={{ fontSize: 10, fontWeight: 800, color: "#FFD600", margin: 0 }}>全完了！</p>
                                    <p style={{ fontSize: 9, color: t.sub, margin: "1px 0 0", opacity: 0.5 }}>+500pt ボーナス</p>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </motion.div>
            </div>

            {/* ── ミッション詳細ボタン ── */}
            <button
                onClick={() => setView("missions")}
                style={{ width: "100%", padding: "9px 14px", borderRadius: 10, background: `${roleColor}10`, border: `1px solid ${roleColor}22`, color: roleColor, fontSize: 11, fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 6, transition: "filter 0.2s" }}
            >
                <svg width={12} height={12} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                ミッション詳細
            </button>

            {/* ── Cheer クイック表示 ── */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.25 }}
                style={{ padding: "14px", borderRadius: 14, background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)", cursor: "pointer", transition: "border-color 0.2s" }}
                onClick={() => setView("cheer")}
            >
                <p style={{ fontSize: 8, fontWeight: 900, letterSpacing: "0.25em", textTransform: "uppercase", color: t.sub, margin: "0 0 8px", fontFamily: "monospace", opacity: 0.45 }}>Cheer</p>
                <div style={{ display: "flex", alignItems: "baseline", gap: 6 }}>
                    <span style={{ fontSize: 9, color: "#FFD600" }}>★</span>
                    <span style={{ fontSize: 28, fontWeight: 900, color: "#FFD600", lineHeight: 1, fontFamily: "monospace" }}>{profile.cheerCount ?? 0}</span>
                </div>
                <p style={{ fontSize: 10, color: t.sub, opacity: 0.45, margin: "4px 0 0" }}>応援数 · 詳細を見る →</p>
            </motion.div>

        </div>
    );
}