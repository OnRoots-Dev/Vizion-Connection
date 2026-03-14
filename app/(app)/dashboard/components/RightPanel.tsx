"use client";

import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { useState, useEffect } from "react";
import type { ProfileData } from "@/features/profile/types";

const ROLE_COLOR: Record<string, string> = {
    Athlete: "#FF5050", Trainer: "#32D278", Members: "#FFC81E", Business: "#3C8CFF",
};
const ROLE_LABEL: Record<string, string> = {
    Athlete: "Athlete", Trainer: "Trainer", Members: "Members", Business: "Business",
};

interface ThemeColors { bg: string; surface: string; border: string; text: string; sub: string; }

const REFERRAL_LIMIT = 30;
const POINTS_PER_REFERRAL = 500;

interface Props {
    profile: ProfileData;
    referralCount: number;
    onLogout: () => void;
    t: ThemeColors;
    onEditProfile?: () => void;
}

// ── ラベル ──────────────────────────────────────────────────────────────────
function SectionLabel({ text }: { text: string }) {
    return (
        <p style={{
            fontSize: "8px", fontWeight: 900, letterSpacing: "0.25em",
            textTransform: "uppercase", color: "rgba(255,255,255,0.2)",
            margin: "0 0 14px", fontFamily: "monospace",
        }}>
            {text}
        </p>
    );
}

// ── カード ──────────────────────────────────────────────────────────────────
function Panel({ children, delay = 0, accent }: { children: React.ReactNode; delay?: number; accent?: string }) {
    return (
        <motion.div
            initial={{ opacity: 0, x: 14 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay, ease: [0.16, 1, 0.3, 1] }}
            style={{
                borderRadius: "14px",
                padding: "16px",
                background: "rgba(255,255,255,0.025)",
                border: `1px solid ${accent ? `${accent}20` : "rgba(255,255,255,0.07)"}`,
                marginBottom: "10px",
                position: "relative",
                overflow: "hidden",
            }}
        >
            {/* アクセントグロー */}
            {accent && (
                <div style={{
                    position: "absolute", top: "-20px", right: "-20px",
                    width: "80px", height: "80px", borderRadius: "50%",
                    background: `radial-gradient(circle, ${accent}15, transparent 70%)`,
                    pointerEvents: "none",
                }} />
            )}
            {children}
        </motion.div>
    );
}

export function RightPanel({ profile, referralCount, onLogout, t, onEditProfile }: Props) {
    const roleColor = ROLE_COLOR[profile.role] ?? "#a78bfa";
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
        <div style={{ padding: "14px 10px" }}>

            {/* ── Points ── */}
            <Panel delay={0.08} accent={roleColor}>
                <SectionLabel text="Vizion Points" />

                {/* ポイント数 */}
                <div style={{ display: "flex", alignItems: "baseline", gap: "6px", marginBottom: "4px" }}>
                    <motion.span
                        key={profile.points}
                        initial={{ opacity: 0, y: -6 }}
                        animate={{ opacity: 1, y: 0 }}
                        style={{ fontSize: "32px", fontWeight: 900, color: roleColor, lineHeight: 1, fontFamily: "monospace" }}
                    >
                        {profile.points.toLocaleString()}
                    </motion.span>
                    <span style={{ fontSize: "11px", color: t.sub, fontWeight: 500 }}>pt</span>
                </div>

                <p style={{ fontSize: "9px", color: t.sub, margin: "0 0 12px", opacity: 0.5, fontFamily: "monospace" }}>
                    / {maxPoints.toLocaleString()} pt MAX
                </p>

                {/* プログレスバー */}
                <div style={{ height: "5px", borderRadius: "99px", background: "rgba(255,255,255,0.06)", overflow: "hidden" }}>
                    <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${ptPct}%` }}
                        transition={{ duration: 1.2, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
                        style={{
                            height: "100%", borderRadius: "99px",
                            background: `linear-gradient(90deg, ${roleColor}, ${roleColor}88)`,
                            boxShadow: `0 0 8px ${roleColor}60`,
                        }}
                    />
                </div>

                {/* ポイント獲得方法 */}
                <div style={{ display: "flex", gap: "6px", marginTop: "10px" }}>
                    {[
                        { label: "招待", val: `+${POINTS_PER_REFERRAL}pt` },
                        { label: "全完了", val: "+1000pt" },
                    ].map(({ label, val }) => (
                        <div key={label} style={{
                            flex: 1, padding: "5px 8px", borderRadius: "8px",
                            background: `${roleColor}0a`, border: `1px solid ${roleColor}18`,
                            display: "flex", justifyContent: "space-between", alignItems: "center",
                        }}>
                            <span style={{ fontSize: "9px", color: t.sub, opacity: 0.6 }}>{label}</span>
                            <span style={{ fontSize: "10px", fontWeight: 800, color: roleColor, fontFamily: "monospace" }}>{val}</span>
                        </div>
                    ))}
                </div>
            </Panel>

            {/* ── Missions ── */}
            <Panel delay={0.16} accent={allDone ? "#FFD600" : undefined}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "14px" }}>
                    <SectionLabel text="Missions" />
                    <span style={{
                        fontSize: "9px", fontWeight: 900, fontFamily: "monospace",
                        color: allDone ? "#FFD600" : t.sub,
                        background: allDone ? "rgba(255,214,0,0.12)" : "rgba(255,255,255,0.05)",
                        border: `1px solid ${allDone ? "rgba(255,214,0,0.3)" : "rgba(255,255,255,0.08)"}`,
                        padding: "2px 7px", borderRadius: "99px",
                    }}>
                        {completedCount} / {MISSIONS.length}
                    </span>
                </div>

                {/* ミッションプログレス */}
                <div style={{ height: "3px", borderRadius: "99px", background: "rgba(255,255,255,0.05)", overflow: "hidden", marginBottom: "14px" }}>
                    <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${(completedCount / MISSIONS.length) * 100}%` }}
                        transition={{ duration: 1, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
                        style={{
                            height: "100%", borderRadius: "99px",
                            background: allDone
                                ? "linear-gradient(90deg, #FFD600, #FFD60088)"
                                : "linear-gradient(90deg, rgba(255,255,255,0.3), rgba(255,255,255,0.1))",
                        }}
                    />
                </div>

                {MISSIONS.map(({ label, done }, i) => (
                    <motion.div
                        key={label}
                        initial={{ opacity: 0, x: 8 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.35, delay: 0.2 + i * 0.05 }}
                        style={{
                            display: "flex", alignItems: "center", gap: "10px",
                            marginBottom: i < MISSIONS.length - 1 ? "8px" : "0",
                            padding: "7px 8px", borderRadius: "9px",
                            background: done ? "rgba(255,255,255,0.02)" : "transparent",
                        }}
                    >
                        {/* チェックアイコン */}
                        <div style={{
                            width: "18px", height: "18px", borderRadius: "50%", flexShrink: 0,
                            background: done ? `${roleColor}20` : "rgba(255,255,255,0.04)",
                            border: `1.5px solid ${done ? roleColor : "rgba(255,255,255,0.1)"}`,
                            display: "flex", alignItems: "center", justifyContent: "center",
                            boxShadow: done ? `0 0 6px ${roleColor}40` : "none",
                            transition: "all 0.3s",
                        }}>
                            <AnimatePresence>
                                {done && (
                                    <motion.svg
                                        initial={{ scale: 0, opacity: 0 }}
                                        animate={{ scale: 1, opacity: 1 }}
                                        width="9" height="9" fill="none" viewBox="0 0 24 24"
                                        stroke={roleColor} strokeWidth={3.5}
                                    >
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                    </motion.svg>
                                )}
                            </AnimatePresence>
                        </div>
                        <span style={{
                            fontSize: "11px",
                            color: done ? t.sub : t.text,
                            opacity: done ? 0.45 : 1,
                            textDecoration: done ? "line-through" : "none",
                            flex: 1,
                        }}>
                            {label}
                        </span>
                        {!done && (
                            <span style={{ fontSize: "8px", color: t.sub, opacity: 0.3, fontFamily: "monospace" }}>→</span>
                        )}
                    </motion.div>
                ))}

                {/* 全完了ボーナス表示 */}
                {allDone && (
                    <motion.div
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        style={{
                            marginTop: "12px", padding: "10px 12px", borderRadius: "10px",
                            background: "rgba(255,214,0,0.08)", border: "1px solid rgba(255,214,0,0.25)",
                            display: "flex", alignItems: "center", gap: "8px",
                        }}
                    >
                        <span style={{ fontSize: "14px" }}>🏆</span>
                        <div>
                            <p style={{ fontSize: "10px", fontWeight: 800, color: "#FFD600", margin: 0 }}>全ミッション完了！</p>
                            <p style={{ fontSize: "9px", color: t.sub, margin: "2px 0 0", opacity: 0.6 }}>+500pt ボーナス付与済み</p>
                        </div>
                    </motion.div>
                )}
            </Panel>

            {/* ── Account ── */}
            <Panel delay={0.24}>
                <SectionLabel text="Account" />
                {[
                    { k: "表示名", v: profile.displayName },
                    { k: "ID", v: `@${profile.slug}`, mono: true },
                    { k: "Role", v: ROLE_LABEL[profile.role], color: roleColor },
                    { k: "Mail", v: profile.email },
                    { k: "登録日", v: new Date(profile.createdAt).toLocaleDateString("ja-JP", { month: "short", day: "numeric" }) },
                ].map(({ k, v, mono, color }, i) => (
                    <div key={k} style={{
                        display: "flex", justifyContent: "space-between", alignItems: "center",
                        padding: "7px 0",
                        borderBottom: `1px solid rgba(255,255,255,0.05)`,
                    }}>
                        <span style={{ fontSize: "9px", color: t.sub, opacity: 0.5, fontFamily: "monospace", textTransform: "uppercase", letterSpacing: "0.08em" }}>{k}</span>
                        <span style={{
                            fontSize: "10px",
                            fontFamily: mono ? "monospace" : "inherit",
                            color: color ?? t.text,
                            maxWidth: "130px",
                            overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                            textAlign: "right",
                            fontWeight: color ? 700 : 400,
                        }}>
                            {v}
                        </span>
                    </div>
                ))}
            </Panel>

        </div>
    );
}