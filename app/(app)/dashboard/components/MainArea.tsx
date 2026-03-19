"use client";

// ─────────────────────────────────────────────────────────────────────────────
// MainArea.tsx
// DashboardClient の各ビューを描画するメインエリア。
// home / edit / cheer / referral / missions / business / settings
// ─────────────────────────────────────────────────────────────────────────────

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { ProfileData } from "@/features/profile/types";
import type { DashboardView, ThemeColors } from "../DashboardClient";
import { ProfileCardSection } from "./ProfileCard";

// ────────────────────────────────────────────────────────────────
// 共有スタイルユーティリティ
// ────────────────────────────────────────────────────────────────
export function SectionCard({
    children,
    accentColor,
    t,
}: {
    children: React.ReactNode;
    accentColor?: string;
    t: ThemeColors;
}) {
    return (
        <div
            style={{
                padding: "18px 20px",
                borderRadius: 16,
                background: accentColor
                    ? `radial-gradient(circle at top right, ${accentColor}10, rgba(255,255,255,0.02))`
                    : "rgba(255,255,255,0.025)",
                border: `1px solid ${accentColor ? `${accentColor}22` : "rgba(255,255,255,0.07)"}`,
                position: "relative",
                overflow: "hidden",
                transition: "border-color 0.2s, box-shadow 0.2s",
            }}
        >
            {accentColor && (
                <div
                    style={{
                        position: "absolute",
                        top: -30, right: -30,
                        width: 120, height: 120,
                        borderRadius: "50%",
                        background: `radial-gradient(circle, ${accentColor}15, transparent 70%)`,
                        pointerEvents: "none",
                    }}
                />
            )}
            <div style={{ position: "relative", zIndex: 1 }}>{children}</div>
        </div>
    );
}

export function SLabel({ text, color }: { text: string; color?: string }) {
    return (
        <p
            style={{
                fontSize: 8,
                fontWeight: 900,
                letterSpacing: "0.25em",
                textTransform: "uppercase",
                color: color ?? "rgba(255,255,255,0.2)",
                margin: "0 0 14px",
                fontFamily: "monospace",
            }}
        >
            {text}
        </p>
    );
}

export function ViewHeader({
    title,
    sub,
    onBack,
    t,
}: {
    title: string;
    sub: string;
    onBack: () => void;
    t: ThemeColors;
}) {
    return (
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 4 }}>
            <button
                onClick={onBack}
                style={{
                    width: 36, height: 36,
                    borderRadius: "50%",
                    background: "rgba(255,255,255,0.04)",
                    border: "1px solid rgba(255,255,255,0.09)",
                    color: t.sub,
                    cursor: "pointer",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    flexShrink: 0,
                    transition: "all 0.2s",
                }}
            >
                <svg width={16} height={16} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
                </svg>
            </button>
            <div>
                <h2
                    className="font-display"
                    style={{
                        fontSize: "clamp(24px,4vw,40px)",
                        fontWeight: 900,
                        color: t.text,
                        margin: 0,
                        lineHeight: 1,
                        textTransform: "uppercase",
                        letterSpacing: "-0.01em",
                    }}
                >
                    {title}
                </h2>
                <p style={{ fontSize: 10, color: t.sub, margin: "2px 0 0", opacity: 0.5 }}>{sub}</p>
            </div>
        </div>
    );
}

// ════════════════════════════════════════════════════════════════
// HOME VIEW
// ════════════════════════════════════════════════════════════════
export function HomeView({
    profile,
    referralUrl,
    referralCount,
    t,
    roleColor,
    setView,
    onProfileUpdate,
}: {
    profile: ProfileData;
    referralUrl: string;
    referralCount: number;
    t: ThemeColors;
    roleColor: string;
    setView: (v: DashboardView) => void;
    onProfileUpdate: (p: ProfileData) => void;
}) {
    const REFERRAL_LIMIT = 30;
    const progress = Math.min((referralCount / REFERRAL_LIMIT) * 100, 100);
    const [copied, setCopied] = useState(false);

    async function handleCopy() {
        try { await navigator.clipboard.writeText(referralUrl); } catch { }
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
        await fetch("/api/share/complete", { method: "POST" });
    }

    return (
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>

            {/* ── ページヘッダー ── */}
            <div style={{ paddingBottom: 8 }}>
                <motion.p
                    initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
                    style={{ fontSize: 9, fontWeight: 900, letterSpacing: "0.35em", textTransform: "uppercase", color: t.sub, opacity: 0.5, margin: "0 0 6px", fontFamily: "monospace" }}
                >
                    Vizion Connection
                </motion.p>
                <motion.div
                    initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.05 }}
                    style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}
                >
                    <h1
                        className="font-display"
                        style={{ fontSize: "clamp(32px,5vw,56px)", fontWeight: 900, color: t.text, margin: 0, lineHeight: 1, textTransform: "uppercase" }}
                    >
                        Dashboard
                    </h1>
                    {/* ロールバッジ */}
                    <div style={{ display: "flex", alignItems: "center", gap: 6, paddingBottom: 4 }}>
                        <span style={{
                            fontSize: 11, fontWeight: 900, fontFamily: "monospace",
                            letterSpacing: "0.12em", textTransform: "uppercase",
                            padding: "4px 10px", borderRadius: 6,
                            background: `${roleColor}18`,
                            border: `1px solid ${roleColor}40`,
                            color: roleColor,
                            lineHeight: 1,
                        }}>
                            {profile.role}
                        </span>
                        <span style={{
                            fontSize: 11, fontWeight: 900, fontFamily: "monospace",
                            letterSpacing: "0.12em", textTransform: "uppercase",
                            padding: "4px 10px", borderRadius: 6,
                            background: "rgba(255,255,255,0.05)",
                            border: "1px solid rgba(255,255,255,0.12)",
                            color: "rgba(255,255,255,0.4)",
                            lineHeight: 1,
                        }}>
                            BASE
                        </span>
                    </div>
                </motion.div>
            </div>

            {/* ── Ad Banner ── */}
            <motion.div
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.08 }}
                style={{ borderRadius: 10, border: `1px solid ${t.border}`, background: t.surface, minHeight: 56, display: "flex", alignItems: "center", justifyContent: "center" }}
            >
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 2, opacity: 0.18 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <div style={{ width: 20, height: 1, background: "rgba(255,255,255,0.4)" }} />
                        <span style={{ fontSize: 8, fontFamily: "monospace", fontWeight: 700, letterSpacing: "0.22em", textTransform: "uppercase", color: t.sub }}>Business AD Area</span>
                        <div style={{ width: 20, height: 1, background: "rgba(255,255,255,0.4)" }} />
                    </div>
                    <span style={{ fontSize: 7, color: t.sub, letterSpacing: "0.1em", fontFamily: "monospace" }}>728 × 56</span>
                </div>
            </motion.div>

            {/* ── プロフィールカード ── */}
            <motion.div
                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.13, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                style={{ position: "relative" }}
            >
                {/* 外側グロー */}
                <div style={{ position: "absolute", inset: -1, borderRadius: 20, background: `radial-gradient(ellipse at 60% 0%, ${roleColor}18, transparent 65%)`, pointerEvents: "none", zIndex: 0 }} />
                {/* 浮遊アニメーション */}
                <motion.div
                    animate={{ y: [0, -5, 0] }}
                    transition={{ duration: 4.5, repeat: Infinity, ease: "easeInOut" }}
                    style={{
                        position: "relative", zIndex: 1,
                        borderRadius: 18,
                        boxShadow: `0 20px 60px rgba(0,0,0,0.4), 0 0 0 1px ${roleColor}12, 0 4px 20px ${roleColor}10`,
                    }}
                >
                    <ProfileCardSection profile={profile} t={t} roleColor={roleColor} setView={setView} />
                </motion.div>
            </motion.div>

            {/* ── Cheer + 公開URL（2カラム） ── */}
            <motion.div
                initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.18 }}
                style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}
            >
                {/* Cheer */}
                <button
                    onClick={() => setView("cheer")}
                    style={{
                        padding: "18px 16px", borderRadius: 16, cursor: "pointer", textAlign: "left",
                        background: `radial-gradient(circle at top right, ${roleColor}15, rgba(255,255,255,0.02))`,
                        border: `1px solid ${roleColor}25`,
                        position: "relative", overflow: "hidden",
                        transition: "border-color 0.2s, box-shadow 0.2s",
                    }}
                >
                    <p style={{ fontSize: 8, fontWeight: 900, letterSpacing: "0.22em", textTransform: "uppercase", color: roleColor, margin: "0 0 6px", fontFamily: "monospace", opacity: 0.7 }}>Cheer</p>
                    <div style={{ display: "flex", alignItems: "baseline", gap: 5 }}>
                        <span style={{ fontSize: 34, fontWeight: 900, color: "#FFD600", lineHeight: 1, fontFamily: "monospace" }}>{profile.cheerCount ?? 0}</span>
                        <span style={{ fontSize: 10, color: t.sub }}>★</span>
                    </div>
                    <p style={{ fontSize: 10, color: t.sub, margin: "4px 0 0", opacity: 0.55 }}>応援数</p>
                    <div style={{ position: "absolute", bottom: 10, right: 12, fontSize: 9, color: roleColor, opacity: 0.45, fontFamily: "monospace", letterSpacing: "0.08em" }}>詳細 →</div>
                </button>

                {/* Public URL */}
                <div
                    style={{
                        padding: "18px 16px", borderRadius: 16,
                        background: t.surface, border: `1px solid ${t.border}`,
                        transition: "border-color 0.2s",
                    }}
                >
                    <p style={{ fontSize: 8, fontWeight: 900, letterSpacing: "0.22em", textTransform: "uppercase", color: t.sub, margin: "0 0 8px", fontFamily: "monospace", opacity: 0.5 }}>Public URL</p>
                    <p style={{ fontSize: 10, fontFamily: "monospace", color: t.sub, margin: "0 0 10px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", opacity: 0.6 }}>
                        /u/{profile.slug}
                    </p>
                    <button
                        onClick={handleCopy}
                        style={{
                            width: "100%", padding: "7px 10px", borderRadius: 9,
                            background: copied ? `${roleColor}18` : `${roleColor}10`,
                            border: `1px solid ${copied ? roleColor + "50" : roleColor + "30"}`,
                            color: copied ? roleColor : t.sub,
                            fontSize: 10, fontWeight: 700, cursor: "pointer",
                            transition: "all 0.2s",
                        }}
                    >
                        {copied ? "✓ Copied!" : "URLをコピー"}
                    </button>
                </div>
            </motion.div>

            {/* ── 招待リンク ── */}
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.23 }}>
                <SectionCard accentColor="#FFD600" t={t}>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
                        <SLabel text="Referral" color="#FFD600" />
                        <button onClick={() => setView("referral")} style={{ fontSize: 9, color: "#FFD600", opacity: 0.55, background: "none", border: "none", cursor: "pointer", fontFamily: "monospace" }}>詳細 →</button>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
                        <div style={{ display: "flex", alignItems: "baseline", gap: 5 }}>
                            <span style={{ fontSize: 28, fontWeight: 900, color: "#FFD600", fontFamily: "monospace", lineHeight: 1 }}>{referralCount}</span>
                            <span style={{ fontSize: 11, color: t.sub }}>/ {REFERRAL_LIMIT} 人</span>
                        </div>
                        <div style={{ textAlign: "right" }}>
                            <p style={{ fontSize: 8, color: t.sub, opacity: 0.4, margin: 0, fontFamily: "monospace" }}>獲得ポイント</p>
                            <p style={{ fontSize: 13, fontWeight: 900, color: "#FFD600", margin: 0, fontFamily: "monospace" }}>+{(referralCount * 500).toLocaleString()}pt</p>
                        </div>
                    </div>
                    <div style={{ height: 4, borderRadius: 99, background: "rgba(255,255,255,0.06)", overflow: "hidden", marginBottom: 12 }}>
                        <motion.div
                            initial={{ width: 0 }} animate={{ width: `${progress}%` }}
                            transition={{ duration: 1.2, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
                            style={{ height: "100%", borderRadius: 99, background: "linear-gradient(90deg,#FFD600,#FFD60066)", boxShadow: "0 0 8px rgba(255,214,0,0.4)" }}
                        />
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "9px 11px", borderRadius: 10, background: "rgba(255,214,0,0.05)", border: "1px solid rgba(255,214,0,0.18)" }}>
                        <span style={{ flex: 1, fontSize: 10, fontFamily: "monospace", color: "rgba(255,214,0,0.55)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{referralUrl}</span>
                        <button
                            onClick={handleCopy}
                            style={{ flexShrink: 0, padding: "5px 11px", borderRadius: 7, background: copied ? "rgba(255,214,0,0.18)" : "rgba(255,214,0,0.1)", border: "1px solid rgba(255,214,0,0.3)", color: "#FFD600", fontSize: 10, fontWeight: 800, cursor: "pointer", transition: "all 0.2s" }}
                        >
                            {copied ? "✓" : "Copy"}
                        </button>
                    </div>
                    <p style={{ fontSize: 9, color: t.sub, opacity: 0.35, margin: "7px 0 0", fontFamily: "monospace" }}>1人招待ごとに 500pt 付与</p>
                </SectionCard>
            </motion.div>

            {/* ── Discovery ── */}
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.28 }}>
                <SectionCard t={t}>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
                        <SLabel text="Discovery" />
                        <span style={{ fontSize: 9, color: t.sub, opacity: 0.4, fontFamily: "monospace" }}>3/20 (金・祝) 12:00 解放</span>
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", padding: "24px 0", gap: 8 }}>
                        <motion.p
                            animate={{ opacity: [0.4, 1, 0.4] }} transition={{ duration: 2.4, repeat: Infinity }}
                            style={{ fontSize: 9, fontWeight: 900, fontFamily: "monospace", letterSpacing: "0.3em", textTransform: "uppercase", color: "rgba(255,255,255,0.25)", margin: 0 }}
                        >
                            COMING SOON
                        </motion.p>
                        <p style={{ fontSize: 11, color: t.sub, opacity: 0.4, margin: 0 }}>3月16日（月）正午に解放予定</p>
                    </div>
                </SectionCard>
            </motion.div>

            {/* ── Roadmap mini ── */}
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.33 }}>
                <SectionCard t={t}>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
                        <SLabel text="Roadmap" />
                        <button onClick={() => setView("roadmap")} style={{ fontSize: 9, color: t.sub, opacity: 0.45, background: "none", border: "none", cursor: "pointer", fontFamily: "monospace" }}>詳細 →</button>
                    </div>
                    <RoadmapMini roleColor={roleColor} t={t} />
                </SectionCard>
            </motion.div>

            {/* ── Business CTA（Businessロールのみ） ── */}
            {profile.role === "Business" && (
                <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.38 }}>
                    <div
                        style={{ borderRadius: 16, padding: "20px", background: "rgba(60,140,255,0.06)", border: "1px solid rgba(60,140,255,0.22)", position: "relative", overflow: "hidden" }}
                    >
                        <div style={{ position: "absolute", top: -20, right: -20, width: 100, height: 100, borderRadius: "50%", background: "radial-gradient(circle,rgba(60,140,255,0.15),transparent 70%)", pointerEvents: "none" }} />
                        <p style={{ fontSize: 9, fontWeight: 800, letterSpacing: "0.15em", textTransform: "uppercase", color: "#3C8CFF", margin: "0 0 5px", fontFamily: "monospace" }}>For Business</p>
                        <p style={{ fontSize: 14, fontWeight: 700, color: t.text, margin: "0 0 5px" }}>先行ポジションを確保する</p>
                        <p style={{ fontSize: 12, color: t.sub, lineHeight: 1.7, margin: "0 0 14px", opacity: 0.7 }}>本日23:59締切。Vizion Connection 最初期スポンサーとして参加できます。</p>
                        <button
                            onClick={() => setView("business-checkout")}
                            style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "9px 18px", borderRadius: 10, background: "#3C8CFF", color: "#000", fontSize: 12, fontWeight: 800, cursor: "pointer", border: "none", transition: "filter 0.2s" }}
                        >
                            先行ポジションを見る
                            <svg width={12} height={12} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" /></svg>
                        </button>
                    </div>
                </motion.div>
            )}

            {/* ── Vizion Partner 広告バナー ── */}
            <motion.div
                initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.43 }}
                style={{ borderRadius: 14, padding: "14px 16px", background: "rgba(60,140,255,0.04)", border: "1px solid rgba(60,140,255,0.15)", display: "flex", alignItems: "center", gap: 12 }}
            >
                <div style={{ flex: 1 }}>
                    <span style={{ fontSize: 8, fontWeight: 700, color: "#3C8CFF", letterSpacing: "0.12em", textTransform: "uppercase", fontFamily: "monospace" }}>Vizion Partner</span>
                    <p style={{ fontSize: 12, color: t.text, margin: "4px 0 0", fontWeight: 500 }}>広告掲載のお問い合わせはこちら</p>
                </div>
                <button
                    onClick={() => setView("business")}
                    style={{ flexShrink: 0, padding: "7px 14px", borderRadius: 9, fontSize: 11, fontWeight: 700, border: "1px solid rgba(60,140,255,0.3)", background: "rgba(60,140,255,0.1)", color: "#3C8CFF", cursor: "pointer", whiteSpace: "nowrap", transition: "all 0.2s" }}
                >
                    詳細を見る
                </button>
            </motion.div>

        </div>
    );
}

// ════════════════════════════════════════════════════════════════
// ROADMAP MINI（ホーム内埋め込み用）
// ════════════════════════════════════════════════════════════════
function RoadmapMini({ roleColor, t }: { roleColor: string; t: ThemeColors }) {
    const phases = [
        { label: "先行登録", status: "current", color: "#FFD600", items: ["プロフィールカード", "公開URL", "Cheer", "招待リンク"] },
        { label: "β版", status: "upcoming", color: "#3282FF", items: ["Discovery拡張", "Signal投稿", "Cheer通知"] },
        { label: "正式版", status: "future", color: "#FF4646", items: ["Trust Score", "AI Discovery", "VZ Market"] },
    ];

    return (
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {phases.map((p, pi) => (
                <div key={p.label}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                        {p.status === "current" ? (
                            <motion.div animate={{ opacity: [1, 0.4, 1] }} transition={{ duration: 2, repeat: Infinity }}
                                style={{ width: 6, height: 6, borderRadius: "50%", background: p.color, boxShadow: `0 0 5px ${p.color}`, flexShrink: 0 }} />
                        ) : (
                            <div style={{ width: 6, height: 6, borderRadius: "50%", background: p.color, opacity: 0.3, flexShrink: 0 }} />
                        )}
                        <span style={{ fontSize: 9, fontWeight: 900, fontFamily: "monospace", letterSpacing: "0.12em", textTransform: "uppercase", color: p.status === "current" ? p.color : t.sub, opacity: p.status === "future" ? 0.4 : 1 }}>
                            {p.label}
                        </span>
                        {p.status === "current" && (
                            <span style={{ fontSize: 7, fontWeight: 900, fontFamily: "monospace", padding: "1px 6px", borderRadius: 3, background: `${p.color}18`, color: p.color, border: `1px solid ${p.color}35`, letterSpacing: "0.1em" }}>NOW</span>
                        )}
                    </div>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 5 }}>
                        {p.items.map(item => (
                            <div key={item} style={{ display: "flex", alignItems: "center", gap: 6, padding: "5px 8px", borderRadius: 8, background: p.status === "current" ? `${p.color}08` : "rgba(255,255,255,0.02)", border: `1px solid ${p.status === "current" ? `${p.color}20` : "rgba(255,255,255,0.05)"}`, opacity: p.status === "future" ? 0.45 : 1 }}>
                                {p.status === "current"
                                    ? <svg width={8} height={8} fill="none" viewBox="0 0 24 24" stroke={p.color} strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                                    : <div style={{ width: 4, height: 4, borderRadius: "50%", background: t.sub, opacity: 0.3, flexShrink: 0 }} />
                                }
                                <span style={{ fontSize: 10, color: p.status === "current" ? t.text : t.sub, opacity: p.status === "current" ? 0.75 : 0.5 }}>{item}</span>
                            </div>
                        ))}
                    </div>
                    {pi < phases.length - 1 && (
                        <div style={{ height: 1, background: `linear-gradient(90deg, ${p.color}20, transparent)`, marginTop: 12 }} />
                    )}
                </div>
            ))}
        </div>
    );
}

// ════════════════════════════════════════════════════════════════
// CHEER VIEW
// ════════════════════════════════════════════════════════════════
export function CheerView({ profile, t, roleColor, setView }: {
    profile: ProfileData; t: ThemeColors; roleColor: string; setView: (v: DashboardView) => void;
}) {
    const cheerCount = profile.cheerCount ?? 0;

    return (
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <ViewHeader title="Cheer" sub="あなたへの応援" onBack={() => setView("home")} t={t} />

            {/* 大きな数字 */}
            <motion.div
                initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                style={{ padding: "40px 0", textAlign: "center" }}
            >
                <motion.div animate={{ scale: [1, 1.03, 1] }} transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}>
                    <div style={{ fontSize: 9, fontWeight: 900, letterSpacing: "0.4em", textTransform: "uppercase", color: "#FFD600", opacity: 0.6, fontFamily: "monospace", marginBottom: 8 }}>TOTAL CHEER</div>
                    <div className="font-display" style={{ fontSize: 88, color: "#FFD600", lineHeight: 1, textShadow: "0 0 40px rgba(255,214,0,0.35)" }}>
                        {cheerCount}
                    </div>
                    <div style={{ display: "flex", justifyContent: "center", gap: 4, marginTop: 10 }}>
                        {Array.from({ length: Math.min(cheerCount, 10) }).map((_, i) => (
                            <motion.span key={i} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} style={{ fontSize: 14, color: "#FFD600" }}>★</motion.span>
                        ))}
                    </div>
                </motion.div>
            </motion.div>

            {/* 仕組み説明 */}
            <SectionCard t={t}>
                <SLabel text="Cheerとは" />
                <p style={{ fontSize: 12, color: t.sub, lineHeight: 1.8, opacity: 0.7, margin: "0 0 14px" }}>
                    他のメンバーがあなたのプロフィールページでCheerボタンを押すと、カウントが増えます。
                    Cheerは信頼スコア（Trust Score）の基礎指標になります。
                </p>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                    {[
                        { label: "プロフィール公開", desc: "公開URLを広める", icon: "🔗" },
                        { label: "SNSシェア", desc: "フォロワーにアピール", icon: "📢" },
                        { label: "Beta版解放", desc: "Discoveryで発見", icon: "🔍" },
                        { label: "Trust Score", desc: "将来の信頼資産に", icon: "⚡" },
                    ].map(({ label, desc, icon }) => (
                        <div key={label} style={{ padding: "12px", borderRadius: 12, background: "rgba(255,255,255,0.02)", border: `1px solid ${t.border}` }}>
                            <span style={{ fontSize: 18, display: "block", marginBottom: 5 }}>{icon}</span>
                            <p style={{ fontSize: 11, fontWeight: 700, color: t.text, margin: "0 0 3px" }}>{label}</p>
                            <p style={{ fontSize: 10, color: t.sub, margin: 0, opacity: 0.55 }}>{desc}</p>
                        </div>
                    ))}
                </div>
            </SectionCard>

            {/* 公開ページCTA */}
            <SectionCard accentColor={roleColor} t={t}>
                <SLabel text="Cheerを増やす" color={roleColor} />
                <p style={{ fontSize: 12, color: t.sub, margin: "0 0 14px", opacity: 0.65 }}>
                    公開プロフィールを広めてCheerを集めましょう。
                </p>
                <a
                    href={`/u/${profile.slug}`} target="_blank" rel="noopener noreferrer"
                    style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "9px 18px", borderRadius: 10, background: `${roleColor}18`, border: `1px solid ${roleColor}35`, color: roleColor, fontSize: 12, fontWeight: 700, textDecoration: "none", transition: "filter 0.2s" }}
                >
                    <svg width={13} height={13} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" /></svg>
                    公開プロフィールを開く
                </a>
            </SectionCard>
        </div>
    );
}

// ════════════════════════════════════════════════════════════════
// REFERRAL VIEW
// ════════════════════════════════════════════════════════════════
export function ReferralView({ profile, referralUrl, referralCount, t, roleColor, setView }: {
    profile: ProfileData; referralUrl: string; referralCount: number;
    t: ThemeColors; roleColor: string; setView: (v: DashboardView) => void;
}) {
    const REFERRAL_LIMIT = 30;
    const POINTS_PER_REFERRAL = 500;
    const progress = Math.min((referralCount / REFERRAL_LIMIT) * 100, 100);
    const [copied, setCopied] = useState(false);

    async function handleCopy() {
        try { await navigator.clipboard.writeText(referralUrl); } catch { }
        setCopied(true);
        setTimeout(() => setCopied(false), 2500);
        await fetch("/api/share/complete", { method: "POST" });
    }

    return (
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <ViewHeader title="Referral" sub="招待で特典ゲット" onBack={() => setView("home")} t={t} />

            {/* 大きな数字カード */}
            <SectionCard accentColor="#FFD600" t={t}>
                <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", marginBottom: 14 }}>
                    <div>
                        <div style={{ display: "flex", alignItems: "baseline", gap: 6 }}>
                            <span className="font-display" style={{ fontSize: 64, color: "#FFD600", lineHeight: 1, letterSpacing: "-0.02em" }}>{referralCount}</span>
                            <span style={{ fontSize: 14, color: t.sub }}>/ {REFERRAL_LIMIT} 人</span>
                        </div>
                        <p style={{ fontSize: 11, color: t.sub, margin: "4px 0 0", opacity: 0.55 }}>招待済みメンバー</p>
                    </div>
                    <div style={{ textAlign: "right", paddingBottom: 6 }}>
                        <p style={{ fontSize: 8, fontFamily: "monospace", color: t.sub, opacity: 0.4, margin: "0 0 2px" }}>獲得ポイント</p>
                        <div style={{ display: "flex", alignItems: "baseline", gap: 3 }}>
                            <span className="font-display" style={{ fontSize: 28, color: "#FFD600" }}>+{(referralCount * POINTS_PER_REFERRAL).toLocaleString()}</span>
                            <span style={{ fontSize: 11, color: t.sub }}>pt</span>
                        </div>
                    </div>
                </div>
                <div style={{ height: 6, borderRadius: 99, background: "rgba(255,255,255,0.06)", overflow: "hidden", marginBottom: 6 }}>
                    <motion.div
                        initial={{ width: 0 }} animate={{ width: `${progress}%` }}
                        transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
                        style={{ height: "100%", borderRadius: 99, background: "linear-gradient(90deg,#FFD600,#FFD60066)", boxShadow: "0 0 10px rgba(255,214,0,0.4)" }}
                    />
                </div>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <span style={{ fontSize: 9, fontFamily: "monospace", color: "rgba(255,214,0,0.4)", letterSpacing: "0.08em" }}>0人</span>
                    <span style={{ fontSize: 9, fontFamily: "monospace", color: "rgba(255,214,0,0.4)", letterSpacing: "0.08em" }}>{REFERRAL_LIMIT}人 上限</span>
                </div>
            </SectionCard>

            {/* 招待URL */}
            <SectionCard t={t}>
                <SLabel text="招待リンク" />
                <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "12px 14px", borderRadius: 12, background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.09)", marginBottom: 12 }}>
                    <span style={{ flex: 1, fontSize: 11, fontFamily: "monospace", color: t.sub, opacity: 0.65, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{referralUrl}</span>
                    <button
                        onClick={handleCopy}
                        style={{ flexShrink: 0, padding: "7px 14px", borderRadius: 9, background: copied ? "rgba(255,214,0,0.15)" : "rgba(255,214,0,0.1)", border: `1px solid ${copied ? "rgba(255,214,0,0.4)" : "rgba(255,214,0,0.25)"}`, color: "#FFD600", fontSize: 11, fontWeight: 800, cursor: "pointer", transition: "all 0.2s" }}
                    >
                        {copied ? "✓ Copied!" : "Copy"}
                    </button>
                </div>
                <p style={{ fontSize: 10, color: t.sub, opacity: 0.4, margin: 0, fontFamily: "monospace" }}>
                    1人招待ごとに {POINTS_PER_REFERRAL}pt 付与 · 上限 {REFERRAL_LIMIT}人
                </p>
            </SectionCard>

            {/* SNSシェア */}
            <SectionCard t={t}>
                <SLabel text="SNSでシェアする" />
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                    {/* X (Twitter) */}
                    <a
                        href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(`Vizion Connectionに登録しました🔥\n#VizionConnection\n${referralUrl}`)}`}
                        target="_blank" rel="noopener noreferrer"
                        style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 16px", borderRadius: 12, background: "rgba(0,0,0,0.4)", border: "1px solid rgba(255,255,255,0.1)", textDecoration: "none", color: "#fff" }}
                    >
                        <div style={{ width: 36, height: 36, borderRadius: 10, background: "#000", border: "1px solid rgba(255,255,255,0.15)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                            <svg viewBox="0 0 24 24" width={15} height={15} fill="#fff"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.746l7.73-8.835L1.254 2.25H8.08l4.253 5.622zm-1.161 17.52h1.833L7.084 4.126H5.117z" /></svg>
                        </div>
                        <div style={{ flex: 1 }}>
                            <p style={{ fontSize: 13, fontWeight: 700, margin: 0 }}>X (Twitter)</p>
                            <p style={{ fontSize: 10, color: t.sub, margin: "1px 0 0", opacity: 0.55 }}>ツイートして招待する</p>
                        </div>
                        <svg width={13} height={13} fill="none" viewBox="0 0 24 24" stroke="rgba(255,255,255,0.25)" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" /></svg>
                    </a>

                    {/* Instagram */}
                    <a
                        href={`https://vizion-connection.jp/api/og/${profile.slug}?format=stories`}
                        target="_blank" rel="noopener noreferrer"
                        style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 16px", borderRadius: 12, background: "rgba(225,48,108,0.05)", border: "1px solid rgba(225,48,108,0.2)", textDecoration: "none", color: "#fff" }}
                    >
                        <div style={{ width: 36, height: 36, borderRadius: 10, background: "linear-gradient(45deg,#f09433,#e6683c,#dc2743,#cc2366,#bc1888)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                            <svg viewBox="0 0 24 24" width={15} height={15} fill="#fff"><path d="M7.8 2h8.4C19.4 2 22 4.6 22 7.8v8.4a5.8 5.8 0 01-5.8 5.8H7.8C4.6 22 2 19.4 2 16.2V7.8A5.8 5.8 0 017.8 2zm-.2 2A3.6 3.6 0 004 7.6v8.8C4 18.39 5.61 20 7.6 20h8.8a3.6 3.6 0 003.6-3.6V7.6C20 5.61 18.39 4 16.4 4H7.6zm9.65 1.5a1.25 1.25 0 110 2.5 1.25 1.25 0 010-2.5zM12 7a5 5 0 110 10A5 5 0 0112 7zm0 2a3 3 0 100 6 3 3 0 000-6z" /></svg>
                        </div>
                        <div style={{ flex: 1 }}>
                            <p style={{ fontSize: 13, fontWeight: 700, margin: 0 }}>Instagram Stories</p>
                            <p style={{ fontSize: 10, color: t.sub, margin: "1px 0 0", opacity: 0.55 }}>画像を長押しで保存 → Storiesに投稿</p>
                        </div>
                        <svg width={13} height={13} fill="none" viewBox="0 0 24 24" stroke="rgba(255,255,255,0.25)" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" /></svg>
                    </a>

                    {/* LINE */}
                    <a
                        href={`https://social-plugins.line.me/lineit/share?url=${encodeURIComponent(referralUrl)}`}
                        target="_blank" rel="noopener noreferrer"
                        style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 16px", borderRadius: 12, background: "rgba(6,199,85,0.05)", border: "1px solid rgba(6,199,85,0.2)", textDecoration: "none", color: "#fff" }}
                    >
                        <div style={{ width: 36, height: 36, borderRadius: 10, background: "#06C755", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                            <svg viewBox="0 0 24 24" width={15} height={15} fill="#fff"><path d="M19.365 9.863c.349 0 .63.285.63.631 0 .345-.281.63-.63.63H17.61v1.125h1.755c.349 0 .63.283.63.63 0 .344-.281.629-.63.629h-2.386c-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.63-.63h2.386c.346 0 .627.285.627.63 0 .349-.281.63-.63.63H17.61v1.125h1.755zm-3.855 3.016c0 .27-.174.51-.432.596-.064.021-.133.031-.199.031-.211 0-.391-.09-.51-.25l-2.443-3.317v2.94c0 .344-.279.629-.631.629-.346 0-.626-.285-.626-.629V8.108c0-.27.173-.51.43-.595.06-.023.136-.033.194-.033.195 0 .375.104.495.254l2.462 3.33V8.108c0-.345.282-.63.63-.63.345 0 .63.285.63.63v4.771zm-5.741 0c0 .344-.282.629-.631.629-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.63-.63.346 0 .628.285.628.63v4.771zm-2.466.629H4.917c-.345 0-.63-.285-.63-.629V8.108c0-.345.285-.63.63-.63.348 0 .63.285.63.63v4.141h1.756c.348 0 .629.283.629.63 0 .344-.282.629-.629.629M24 10.314C24 4.943 18.615.572 12 .572S0 4.943 0 10.314c0 4.811 4.27 8.842 10.035 9.608.391.082.923.258 1.058.59.12.301.079.766.038 1.08l-.164 1.02c-.045.301-.24 1.186 1.049.645 1.291-.539 6.916-4.078 9.436-6.975C23.176 14.393 24 12.458 24 10.314" /></svg>
                        </div>
                        <div style={{ flex: 1 }}>
                            <p style={{ fontSize: 13, fontWeight: 700, margin: 0 }}>LINE</p>
                            <p style={{ fontSize: 10, color: t.sub, margin: "1px 0 0", opacity: 0.55 }}>友達にシェアする</p>
                        </div>
                        <svg width={13} height={13} fill="none" viewBox="0 0 24 24" stroke="rgba(255,255,255,0.25)" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" /></svg>
                    </a>
                </div>
            </SectionCard>
        </div>
    );
}

// ════════════════════════════════════════════════════════════════
// MISSIONS VIEW
// ════════════════════════════════════════════════════════════════
export function MissionsView({ profile, referralCount, t, roleColor, setView }: {
    profile: ProfileData; referralCount: number; t: ThemeColors; roleColor: string; setView: (v: DashboardView) => void;
}) {
    const MISSIONS = [
        { label: "先行登録完了", done: true, reward: "+1000pt", desc: "Vizion Connectionへの登録" },
        { label: "メール認証完了", done: profile.verified, reward: "+200pt", desc: "メールアドレスを認証する" },
        { label: "SNSで共有", done: profile.hasShared ?? false, reward: "+300pt", desc: "プロフィールをSNSでシェア" },
        { label: "3人招待する", done: referralCount >= 3, reward: "+1500pt", desc: "招待リンクから3人を招待" },
        { label: "プロフィール編集", done: !!(profile.bio || profile.sport || profile.region), reward: "+200pt", desc: "Bio・スポーツ・地域を入力" },
    ];
    const completedCount = MISSIONS.filter(m => m.done).length;
    const allDone = completedCount === MISSIONS.length;

    return (
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <ViewHeader title="Missions" sub="特典を獲得しよう" onBack={() => setView("home")} t={t} />

            {/* 全体プログレス */}
            <SectionCard accentColor={allDone ? "#FFD600" : roleColor} t={t}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
                    <SLabel text="Progress" color={allDone ? "#FFD600" : roleColor} />
                    <span className="font-display" style={{ fontSize: 24, color: allDone ? "#FFD600" : roleColor }}>
                        {completedCount} <span style={{ fontSize: 14, opacity: 0.5 }}>/ {MISSIONS.length}</span>
                    </span>
                </div>
                <div style={{ height: 6, borderRadius: 99, background: "rgba(255,255,255,0.06)", overflow: "hidden" }}>
                    <motion.div
                        initial={{ width: 0 }} animate={{ width: `${(completedCount / MISSIONS.length) * 100}%` }}
                        transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
                        style={{ height: "100%", borderRadius: 99, background: allDone ? "linear-gradient(90deg,#FFD600,#FFD60066)" : `linear-gradient(90deg,${roleColor},${roleColor}66)`, boxShadow: allDone ? "0 0 10px rgba(255,214,0,0.4)" : `0 0 10px ${roleColor}40` }}
                    />
                </div>
                <AnimatePresence>
                    {allDone && (
                        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                            style={{ marginTop: 12, padding: "10px 14px", borderRadius: 10, background: "rgba(255,214,0,0.07)", border: "1px solid rgba(255,214,0,0.22)", display: "flex", alignItems: "center", gap: 10 }}
                        >
                            <span style={{ fontSize: 20 }}>🏆</span>
                            <p style={{ fontSize: 12, fontWeight: 800, color: "#FFD600", margin: 0 }}>全ミッション達成！ボーナス +500pt</p>
                        </motion.div>
                    )}
                </AnimatePresence>
            </SectionCard>

            {/* ミッション一覧 */}
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {MISSIONS.map(({ label, done, reward, desc }, i) => (
                    <motion.div key={label} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }}
                        style={{ display: "flex", alignItems: "center", gap: 14, padding: "16px", borderRadius: 14, background: done ? "rgba(255,255,255,0.025)" : t.surface, border: `1px solid ${done ? roleColor + "25" : t.border}`, transition: "border-color 0.3s" }}
                    >
                        <div style={{ width: 36, height: 36, borderRadius: "50%", flexShrink: 0, background: done ? `${roleColor}20` : "rgba(255,255,255,0.04)", border: `2px solid ${done ? roleColor : "rgba(255,255,255,0.1)"}`, display: "flex", alignItems: "center", justifyContent: "center", boxShadow: done ? `0 0 8px ${roleColor}40` : "none", transition: "all 0.3s" }}>
                            {done
                                ? <svg width={14} height={14} fill="none" viewBox="0 0 24 24" stroke={roleColor} strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                                : <div style={{ width: 8, height: 8, borderRadius: "50%", background: "rgba(255,255,255,0.1)" }} />
                            }
                        </div>
                        <div style={{ flex: 1 }}>
                            <p style={{ fontSize: 13, fontWeight: 700, color: done ? t.sub : t.text, margin: "0 0 3px", opacity: done ? 0.55 : 1, textDecoration: done ? "line-through" : "none" }}>{label}</p>
                            <p style={{ fontSize: 10, color: t.sub, margin: 0, opacity: 0.5 }}>{desc}</p>
                        </div>
                        <span style={{ fontSize: 12, fontWeight: 900, fontFamily: "monospace", color: done ? roleColor : t.sub, opacity: done ? 1 : 0.4, flexShrink: 0 }}>{reward}</span>
                    </motion.div>
                ))}
            </div>
        </div>
    );
}

// ════════════════════════════════════════════════════════════════
// BUSINESS VIEW
// ════════════════════════════════════════════════════════════════
export function BusinessView({ profile, t, roleColor, setView }: {
    profile: ProfileData; t: ThemeColors; roleColor: string; setView: (v: DashboardView) => void;
}) {
    const isBusinessRole = profile.role === "Business";
    const bizColor = "#3C8CFF";

    const features = [
        { icon: "📊", title: "スポンサー枠", desc: "先行登録フェーズでの広告掲載エリアを確保", available: true },
        { icon: "🎯", title: "Business AD Area", desc: "ダッシュボード上部バナーエリアへの掲載", available: true },
        { icon: "👥", title: "Businessページ", desc: "企業・チームの公開プロフィールページ（β版）", available: false },
        { icon: "🤝", title: "アスリートマッチング", desc: "スポンサー案件の投稿・マッチング機能（正式版）", available: false },
        { icon: "📈", title: "スポンサー分析", desc: "掲載効果の分析ツール（追実装）", available: false },
        { icon: "🌍", title: "グローバル接続", desc: "海外アスリートとの接続（追実装）", available: false },
    ];

    return (
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <ViewHeader title="Business" sub="Vizion Businessポータル" onBack={() => setView("home")} t={t} />

            {/* ステータスカード */}
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
                style={{ padding: "20px", borderRadius: 18, background: isBusinessRole ? "rgba(60,140,255,0.06)" : "rgba(255,255,255,0.02)", border: `1px solid ${isBusinessRole ? "rgba(60,140,255,0.22)" : t.border}`, position: "relative", overflow: "hidden" }}
            >
                <div style={{ position: "absolute", top: -20, right: -20, width: 120, height: 120, borderRadius: "50%", background: "radial-gradient(circle,rgba(60,140,255,0.15),transparent 70%)", pointerEvents: "none" }} />
                <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12 }}>
                    <div style={{ width: 44, height: 44, borderRadius: 12, background: isBusinessRole ? "rgba(60,140,255,0.15)" : "rgba(255,255,255,0.04)", border: `1px solid ${isBusinessRole ? "rgba(60,140,255,0.3)" : "rgba(255,255,255,0.08)"}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20 }}>🏢</div>
                    <div>
                        <p style={{ fontSize: 8, fontWeight: 900, fontFamily: "monospace", letterSpacing: "0.15em", textTransform: "uppercase", color: bizColor, margin: "0 0 3px", opacity: isBusinessRole ? 1 : 0.5 }}>Business Status</p>
                        <p style={{ fontSize: 14, fontWeight: 700, color: t.text, margin: 0 }}>{isBusinessRole ? "Businessアカウント" : "一般アカウント"}</p>
                    </div>
                    {isBusinessRole && (
                        <span style={{ marginLeft: "auto", fontSize: 9, fontWeight: 900, padding: "3px 10px", borderRadius: 5, background: "rgba(60,140,255,0.15)", color: bizColor, border: "1px solid rgba(60,140,255,0.3)", fontFamily: "monospace", letterSpacing: "0.08em" }}>BUSINESS</span>
                    )}
                </div>
                <p style={{ fontSize: 12, color: t.sub, lineHeight: 1.7, opacity: 0.7, margin: "0 0 14px" }}>
                    {isBusinessRole
                        ? "Vizion Connection Businessアカウントとして登録されています。先行スポンサー枠へのお申し込みが可能です。"
                        : "Businessアカウントにアップグレードすると、スポンサー枠の確保や企業ページの作成が可能になります。"
                    }
                </p>
                <button
                    onClick={() => setView("business-checkout")}
                    style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "9px 18px", borderRadius: 10, background: bizColor, color: "#000", fontSize: 12, fontWeight: 800, cursor: "pointer", border: "none", transition: "filter 0.2s" }}
                >
                    {isBusinessRole ? "先行ポジションを見る" : "Business申込みはこちら"}
                    <svg width={12} height={12} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" /></svg>
                </button>
            </motion.div>

            {/* 機能ロードマップ */}
            <SectionCard t={t}>
                <SLabel text="Businessロードマップ" />
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                    {features.map((f, i) => (
                        <motion.div key={f.title} initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 + i * 0.05 }}
                            style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 14px", borderRadius: 12, background: f.available ? "rgba(60,140,255,0.05)" : "rgba(255,255,255,0.02)", border: `1px solid ${f.available ? "rgba(60,140,255,0.15)" : "rgba(255,255,255,0.05)"}`, opacity: f.available ? 1 : 0.6 }}
                        >
                            <span style={{ fontSize: 18, flexShrink: 0 }}>{f.icon}</span>
                            <div style={{ flex: 1 }}>
                                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 2 }}>
                                    <p style={{ fontSize: 12, fontWeight: 700, color: f.available ? t.text : t.sub, margin: 0 }}>{f.title}</p>
                                    <span style={{ fontSize: 7, fontWeight: 900, padding: "1px 6px", borderRadius: 3, background: f.available ? "rgba(60,140,255,0.15)" : "rgba(255,255,255,0.04)", color: f.available ? bizColor : t.sub, border: `1px solid ${f.available ? "rgba(60,140,255,0.25)" : "rgba(255,255,255,0.08)"}`, fontFamily: "monospace", letterSpacing: "0.08em", opacity: f.available ? 1 : 0.6 }}>
                                        {f.available ? "NOW" : "SOON"}
                                    </span>
                                </div>
                                <p style={{ fontSize: 10, color: t.sub, margin: 0, opacity: 0.55 }}>{f.desc}</p>
                            </div>
                            {f.available
                                ? <svg width={14} height={14} fill="none" viewBox="0 0 24 24" stroke={bizColor} strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" /></svg>
                                : <svg width={14} height={14} fill="none" viewBox="0 0 24 24" stroke="rgba(255,255,255,0.18)" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" /></svg>
                            }
                        </motion.div>
                    ))}
                </div>
            </SectionCard>
        </div>
    );
}

// ════════════════════════════════════════════════════════════════
// EDIT VIEW（SPA内プロフィール編集）
// ════════════════════════════════════════════════════════════════
export function EditView({ profile, t, roleColor, onBack, onSave }: {
    profile: ProfileData; t: ThemeColors; roleColor: string;
    onBack: () => void; onSave: (p: ProfileData) => void;
}) {
    const [form, setForm] = useState({
        displayName: profile.displayName ?? "",
        bio: profile.bio ?? "",
        sport: profile.sport ?? "",
        region: profile.region ?? "",
        prefecture: profile.prefecture ?? "",
        xUrl: profile.xUrl ?? "",
        instagram: profile.instagram ?? "",
        tiktok: profile.tiktok ?? "",
    });
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");

    function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
        setForm(f => ({ ...f, [e.target.name]: e.target.value }));
    }

    async function handleSave() {
        setSaving(true); setError("");
        try {
            const res = await fetch("/api/profile/update", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(form),
            });
            if (!res.ok) throw new Error("保存に失敗しました");
            const data = await res.json();
            onSave(data.profile);
        } catch (e: any) {
            setError(e.message ?? "エラーが発生しました");
        } finally {
            setSaving(false);
        }
    }

    const inputStyle: React.CSSProperties = {
        width: "100%", padding: "10px 13px", borderRadius: 10,
        background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.09)",
        color: t.text, fontSize: 13, outline: "none",
        fontFamily: "'Noto Sans JP', sans-serif",
        transition: "border-color 0.2s",
    };

    return (
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <ViewHeader title="Edit Profile" sub="プロフィールを編集" onBack={onBack} t={t} />

            <SectionCard t={t}>
                <SLabel text="基本情報" />
                <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                    <div>
                        <label style={{ fontSize: 9, fontWeight: 900, letterSpacing: "0.22em", textTransform: "uppercase", color: t.sub, opacity: 0.5, marginBottom: 6, display: "block", fontFamily: "monospace" }}>表示名</label>
                        <input name="displayName" value={form.displayName} onChange={handleChange} style={inputStyle} placeholder="表示名" />
                    </div>
                    <div>
                        <label style={{ fontSize: 9, fontWeight: 900, letterSpacing: "0.22em", textTransform: "uppercase", color: t.sub, opacity: 0.5, marginBottom: 6, display: "block", fontFamily: "monospace" }}>Bio</label>
                        <textarea name="bio" value={form.bio} onChange={handleChange as any} rows={3} style={{ ...inputStyle, resize: "vertical", minHeight: 80 }} placeholder="自己紹介文" />
                    </div>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                        <div>
                            <label style={{ fontSize: 9, fontWeight: 900, letterSpacing: "0.22em", textTransform: "uppercase", color: t.sub, opacity: 0.5, marginBottom: 6, display: "block", fontFamily: "monospace" }}>スポーツ</label>
                            <input name="sport" value={form.sport} onChange={handleChange} style={inputStyle} placeholder="例: サッカー" />
                        </div>
                        <div>
                            <label style={{ fontSize: 9, fontWeight: 900, letterSpacing: "0.22em", textTransform: "uppercase", color: t.sub, opacity: 0.5, marginBottom: 6, display: "block", fontFamily: "monospace" }}>地域</label>
                            <input name="region" value={form.region} onChange={handleChange} style={inputStyle} placeholder="例: 関東" />
                        </div>
                    </div>
                    <div>
                        <label style={{ fontSize: 9, fontWeight: 900, letterSpacing: "0.22em", textTransform: "uppercase", color: t.sub, opacity: 0.5, marginBottom: 6, display: "block", fontFamily: "monospace" }}>都道府県</label>
                        <input name="prefecture" value={form.prefecture} onChange={handleChange} style={inputStyle} placeholder="例: 東京都" />
                    </div>
                </div>
            </SectionCard>

            <SectionCard t={t}>
                <SLabel text="SNSリンク" />
                <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                    {[
                        { name: "xUrl", label: "X (Twitter)", placeholder: "https://twitter.com/username" },
                        { name: "instagram", label: "Instagram", placeholder: "https://instagram.com/username" },
                        { name: "tiktok", label: "TikTok", placeholder: "https://tiktok.com/@username" },
                    ].map(({ name, label, placeholder }) => (
                        <div key={name}>
                            <label style={{ fontSize: 9, fontWeight: 900, letterSpacing: "0.22em", textTransform: "uppercase", color: t.sub, opacity: 0.5, marginBottom: 6, display: "block", fontFamily: "monospace" }}>{label}</label>
                            <input name={name} value={(form as any)[name]} onChange={handleChange} style={inputStyle} placeholder={placeholder} />
                        </div>
                    ))}
                </div>
            </SectionCard>

            {error && (
                <div style={{ padding: "10px 14px", borderRadius: 10, background: "rgba(255,80,80,0.1)", border: "1px solid rgba(255,80,80,0.25)", color: "#FF5050", fontSize: 12 }}>
                    {error}
                </div>
            )}

            <div style={{ display: "flex", gap: 10 }}>
                <button onClick={onBack} style={{ flex: 1, padding: "12px 0", borderRadius: 12, background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.09)", color: t.sub, fontSize: 13, fontWeight: 600, cursor: "pointer", transition: "all 0.2s" }}>
                    キャンセル
                </button>
                <button onClick={handleSave} disabled={saving} style={{ flex: 2, padding: "12px 0", borderRadius: 12, background: roleColor, color: "#000", fontSize: 13, fontWeight: 800, cursor: saving ? "not-allowed" : "pointer", border: "none", opacity: saving ? 0.7 : 1, transition: "opacity 0.2s, filter 0.2s" }}>
                    {saving ? "保存中..." : "保存する"}
                </button>
            </div>
        </div>
    );
}

// ════════════════════════════════════════════════════════════════
// SETTINGS VIEW
// ════════════════════════════════════════════════════════════════
export function SettingsView({ profile, t, roleColor, onBack, onLogout }: {
    profile: ProfileData; t: ThemeColors; roleColor: string; onBack: () => void; onLogout: () => void;
}) {
    const ROLE_LABEL: Record<string, string> = { Athlete: "Athlete", Trainer: "Trainer", Members: "Members", Business: "Business" };

    return (
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <ViewHeader title="Settings" sub="アカウント設定" onBack={onBack} t={t} />

            <SectionCard t={t}>
                <SLabel text="アカウント情報" />
                {[
                    { k: "表示名", v: profile.displayName },
                    { k: "ID", v: `@${profile.slug}`, mono: true },
                    { k: "Role", v: ROLE_LABEL[profile.role], color: roleColor },
                    { k: "メール", v: profile.email },
                    { k: "認証", v: profile.verified ? "✓ 認証済み" : "未認証", color: profile.verified ? "#32D278" : "#FF5050" },
                    { k: "登録日", v: new Date(profile.createdAt).toLocaleDateString("ja-JP", { year: "numeric", month: "short", day: "numeric" }) },
                ].map(({ k, v, mono, color }) => (
                    <div key={k} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "9px 0", borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                        <span style={{ fontSize: 10, color: t.sub, opacity: 0.5, fontFamily: "monospace", textTransform: "uppercase", letterSpacing: "0.08em" }}>{k}</span>
                        <span style={{ fontSize: 11, fontFamily: mono ? "monospace" : "inherit", color: color ?? t.text, maxWidth: 200, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", textAlign: "right", fontWeight: color ? 700 : 400 }}>{v}</span>
                    </div>
                ))}
            </SectionCard>

            <button onClick={onLogout} style={{ width: "100%", padding: "12px 0", borderRadius: 12, background: "rgba(255,80,80,0.08)", border: "1px solid rgba(255,80,80,0.2)", color: "#FF5050", fontSize: 13, fontWeight: 700, cursor: "pointer", transition: "all 0.2s" }}>
                ログアウト
            </button>
        </div>
    );
}