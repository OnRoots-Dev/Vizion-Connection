"use client";

import { motion } from "framer-motion";
import type { ProfileData } from "@/features/profile/types";
import type { DashboardView, ThemeColors } from "@/app/(app)/dashboard/types";

export function RightPanel({ profile, referralCount, t, roleColor, setView }: {
    profile: ProfileData;
    referralCount: number;
    t: ThemeColors;
    roleColor: string;
    setView: (v: DashboardView) => void;
}) {
    const REFERRAL_LIMIT = 30;
    const POINTS_PER_REFERRAL = 500;
    const maxPoints = REFERRAL_LIMIT * POINTS_PER_REFERRAL;
    const ptPct = Math.min((profile.points / maxPoints) * 100, 100);

    const MISSIONS = [
        { label: "先行登録完了", done: true },
        { label: "メール認証完了", done: profile.verified },
        { label: "SNSで共有", done: profile.hasShared ?? false },
        { label: "3人招待する", done: referralCount >= 3 },
        { label: "プロフィール編集", done: !!(profile.bio || profile.sport || profile.region) },
    ];

    const completedCount = MISSIONS.filter((m) => m.done).length;
    const allDone = completedCount === MISSIONS.length;

    return (
        <div style={{ padding: "16px 12px", display: "flex", flexDirection: "column", gap: 12 }}>
            <div>
                <p style={{ fontSize: 8, fontWeight: 900, letterSpacing: "0.25em", textTransform: "uppercase", color: t.sub, margin: "0 0 10px", fontFamily: "monospace", opacity: 0.45 }}>Vizion Points</p>
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.08 }}
                    style={{ padding: "16px", borderRadius: 14, background: "rgba(255,255,255,0.025)", border: `1px solid ${roleColor}20` }}
                >
                    <div style={{ display: "flex", alignItems: "baseline", gap: 5, marginBottom: 3 }}>
                        <span style={{ fontSize: 30, fontWeight: 900, color: roleColor, lineHeight: 1, fontFamily: "monospace" }}>{profile.points.toLocaleString()}</span>
                        <span style={{ fontSize: 11, color: t.sub }}>pt</span>
                    </div>
                    <p style={{ fontSize: 9, color: t.sub, margin: "0 0 10px", opacity: 0.45, fontFamily: "monospace" }}>/ {maxPoints.toLocaleString()} pt MAX</p>
                    <div style={{ height: 4, borderRadius: 99, background: "rgba(255,255,255,0.06)", overflow: "hidden" }}>
                        <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${ptPct}%` }}
                            transition={{ duration: 1.2, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
                            style={{ height: "100%", borderRadius: 99, background: `linear-gradient(90deg,${roleColor},${roleColor}88)`, boxShadow: `0 0 8px ${roleColor}60` }}
                        />
                    </div>
                </motion.div>
            </div>

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
                    <div style={{ height: 3, borderRadius: 99, background: "rgba(255,255,255,0.05)", overflow: "hidden", marginBottom: 12 }}>
                        <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${(completedCount / MISSIONS.length) * 100}%` }}
                            transition={{ duration: 1, delay: 0.5, ease: [0.16, 1, 0.3, 1] }}
                            style={{ height: "100%", borderRadius: 99, background: allDone ? "linear-gradient(90deg,#FFD600,#FFD60088)" : "linear-gradient(90deg,rgba(255,255,255,0.3),rgba(255,255,255,0.1))" }}
                        />
                    </div>
                    {MISSIONS.map(({ label, done }, i) => (
                        <div key={label} style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: i < MISSIONS.length - 1 ? 7 : 0 }}>
                            <div style={{ width: 16, height: 16, borderRadius: "50%", flexShrink: 0, background: done ? `${roleColor}20` : "rgba(255,255,255,0.04)", border: `1.5px solid ${done ? roleColor : "rgba(255,255,255,0.1)"}`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                                {done && <svg width={8} height={8} fill="none" viewBox="0 0 24 24" stroke={roleColor} strokeWidth={3.5}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>}
                            </div>
                            <span style={{ fontSize: 11, color: done ? t.sub : t.text, opacity: done ? 0.45 : 1, textDecoration: done ? "line-through" : "none", flex: 1 }}>{label}</span>
                        </div>
                    ))}
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
                </motion.div>
            </div>

            <button
                onClick={() => setView("missions")}
                style={{ width: "100%", padding: "9px 14px", borderRadius: 10, background: `${roleColor}10`, border: `1px solid ${roleColor}22`, color: roleColor, fontSize: 11, fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}
            >
                <svg width={12} height={12} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                ミッション詳細
            </button>

            {profile.role === "Business" && profile.plan !== "paid" && (
                <motion.button
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    onClick={() => setView("business")}
                    style={{ width: "100%", padding: "14px", borderRadius: 14, background: "linear-gradient(135deg, rgba(60,140,255,0.12), rgba(60,140,255,0.04))", border: "1px solid rgba(60,140,255,0.3)", cursor: "pointer", textAlign: "left", position: "relative", overflow: "hidden" }}
                >
                    <div style={{ position: "absolute", top: -10, right: -10, width: 60, height: 60, borderRadius: "50%", background: "radial-gradient(circle,rgba(60,140,255,0.2),transparent 70%)", pointerEvents: "none" }} />
                    <p style={{ fontSize: 8, fontWeight: 900, letterSpacing: "0.2em", textTransform: "uppercase", color: "#3C8CFF", margin: "0 0 5px", fontFamily: "monospace" }}>Upgrade Plan</p>
                    <p style={{ fontSize: 11, fontWeight: 700, color: "#fff", margin: "0 0 4px" }}>有料プランで機能を解放</p>
                    <p style={{ fontSize: 9, color: "rgba(255,255,255,0.35)", margin: 0, lineHeight: 1.5 }}>広告掲載・効果測定・<br />アスリートマッチングを利用</p>
                    <div style={{ display: "inline-flex", alignItems: "center", gap: 4, marginTop: 8, padding: "4px 10px", borderRadius: 6, background: "#3C8CFF", color: "#000", fontSize: 10, fontWeight: 800 }}>詳細を見る →</div>
                </motion.button>
            )}
        </div>
    );
}
