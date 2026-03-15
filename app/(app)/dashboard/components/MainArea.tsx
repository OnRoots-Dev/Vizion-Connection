"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import type { ProfileData } from "@/features/profile/types";
import { ProfileCardSection } from "@/app/(app)/dashboard/components/ProfileCard";
import type { DashboardView } from "../DashboardClient";
import { EditProfileClient } from "@/app/(app)/dashboard/edit/EditProfileClient";
import SettingsClient from "../setting/SettingsClient";
import type { UserRecord } from "@/features/auth/types";

const ROLE_COLOR: Record<string, string> = {
    Athlete: "#FF5050", Trainer: "#32D278", Members: "#FFC81E", Business: "#3C8CFF",
};

interface ThemeColors { bg: string; surface: string; border: string; text: string; sub: string; }

const REFERRAL_LIMIT = 30;
const POINTS_PER_REFERRAL = 500;

const SAMPLE_BANNERS = [
    { id: "1", company: "Sports Lab Tokyo", text: "アスリート向け栄養管理サービス開始", cta: "詳細を見る", color: "#3C8CFF" },
    { id: "2", company: "MOVE Performance", text: "トップアスリートのトレーニング動画公開中", cta: "今すぐ見る", color: "#32D278" },
];

const SAMPLE_MEMBERS = [
    { name: "Kenji Yamada", slug: "kenji", role: "Athlete", initial: "K" },
    { name: "Saki Mori", slug: "saki", role: "Trainer", initial: "S" },
    { name: "Ryo Nakamura", slug: "ryo", role: "Athlete", initial: "R" },
    { name: "Hana Ito", slug: "hana", role: "Members", initial: "H" },
    { name: "Taro Suzuki", slug: "taro", role: "Business", initial: "T" },
    { name: "Miku Tanaka", slug: "miku", role: "Trainer", initial: "M" },
];

const MEMBER_ROLE_COLOR: Record<string, string> = {
    Athlete: "#FF5050", Trainer: "#32D278", Members: "#FFC81E", Business: "#3C8CFF",
};

// ── セクションラベル ──────────────────────────────────────────────────────────
function SLabel({ text }: { text: string }) {
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

// ── メインカード ──────────────────────────────────────────────────────────────
function Card({ children, delay = 0, accentColor }: {
    children: React.ReactNode; delay?: number; accentColor?: string;
}) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay, ease: [0.16, 1, 0.3, 1] }}
            style={{
                borderRadius: "16px",
                padding: "20px",
                background: "rgba(255,255,255,0.025)",
                border: `1px solid ${accentColor ? `${accentColor}22` : "rgba(255,255,255,0.07)"}`,
                overflow: "hidden",
                position: "relative",
            }}
        >
            {accentColor && (
                <div style={{
                    position: "absolute", top: "-30px", right: "-30px",
                    width: "120px", height: "120px", borderRadius: "50%",
                    background: `radial-gradient(circle, ${accentColor}12, transparent 70%)`,
                    pointerEvents: "none",
                }} />
            )}
            {children}
        </motion.div>
    );
}

export function MainArea({ profile, referralUrl, referralCount, t, view, setView, onProfileUpdate }: {
    profile: ProfileData;
    referralUrl: string;
    referralCount: number;
    t: ThemeColors;
    view: DashboardView;
    setView: (view: DashboardView) => void;
    onProfileUpdate?: (updated: ProfileData) => void;
}) {
    const [copied, setCopied] = useState(false);
    const roleColor = ROLE_COLOR[profile.role] ?? "#a78bfa";
    const progress = Math.min((referralCount / REFERRAL_LIMIT) * 100, 100);

    async function handleCopy() {
        try { await navigator.clipboard.writeText(referralUrl); }
        catch {
            const el = document.createElement("textarea");
            el.value = referralUrl;
            document.body.appendChild(el); el.select();
            document.execCommand("copy"); document.body.removeChild(el);
        }
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);

        await fetch("/api/share/complete", { method: "POST" });
    }

    // ── Edit / Settings ビュー ────────────────────────────────────────────────
    if (view === "edit") {
        return (
            <EditProfileClient
                user={profile as unknown as UserRecord}
                onBack={async () => {
                    try {
                        const res = await fetch("/api/profile/me");
                        if (res.ok) {
                            const data = await res.json();
                            onProfileUpdate?.(data.profile);
                        }
                    } catch { }
                    setView("home");
                }}
            />
        );
    }
    if (view === "settings") {
        return <SettingsClient user={profile as unknown as UserRecord} onBack={() => setView("home")} />;
    }

    // ── Home ビュー ───────────────────────────────────────────────────────────
    return (
        <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>

            {/* ── Ad Banner（上部） ── */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.6 }}
                style={{
                    borderRadius: "10px",
                    overflow: "hidden",
                    border: "1px solid rgba(255,255,255,0.06)",
                    background: "rgba(255,255,255,0.02)",
                    minHeight: "64px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    position: "relative",
                }}
            >
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "3px", opacity: 0.18 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                        <div style={{ width: "24px", height: "1px", background: "rgba(255,255,255,0.4)" }} />
                        <span style={{ fontSize: "8px", fontFamily: "monospace", fontWeight: 700, letterSpacing: "0.22em", textTransform: "uppercase", color: t.sub }}>
                            Business AD Area
                        </span>
                        <div style={{ width: "24px", height: "1px", background: "rgba(255,255,255,0.4)" }} />
                    </div>
                    <span style={{ fontSize: "7px", color: t.sub, letterSpacing: "0.1em", fontFamily: "monospace" }}>728 × 64</span>
                </div>
            </motion.div>

            {/* ── ① Profile Card ── */}
            <ProfileCardSection profile={profile} t={t} />

            {/* ── ② Public Profile & Founding Badge ── */}
            <Card delay={0.1} accentColor={roleColor}>
                <SLabel text="Public Profile" />
                <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>

                    {/* URL コピー */}
                    <div style={{
                        flex: 1, minWidth: "180px",
                        display: "flex", alignItems: "center", gap: "8px",
                        padding: "10px 12px",
                        borderRadius: "10px",
                        background: "rgba(255,255,255,0.04)",
                        border: "1px solid rgba(255,255,255,0.08)",
                    }}>
                        <span style={{
                            flex: 1, fontSize: "11px", fontFamily: "monospace",
                            color: t.sub, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                        }}>
                            {referralUrl.replace("https://", "")}
                        </span>
                        <button onClick={handleCopy} style={{
                            flexShrink: 0, padding: "5px 10px", borderRadius: "7px",
                            border: `1px solid ${copied ? roleColor + "50" : "rgba(255,255,255,0.1)"}`,
                            background: copied ? `${roleColor}15` : "rgba(255,255,255,0.04)",
                            color: copied ? roleColor : t.sub,
                            fontSize: "10px", fontWeight: 700, cursor: "pointer",
                            transition: "all 0.2s",
                        }}>
                            {copied ? "✓ Copied" : "Copy"}
                        </button>
                    </div>

                    {/* 公開リンク */}
                    <Link href={`/u/${profile.slug}`} style={{
                        display: "flex", alignItems: "center", gap: "6px",
                        padding: "10px 14px", borderRadius: "10px",
                        background: `${roleColor}12`, border: `1px solid ${roleColor}30`,
                        color: roleColor, fontSize: "11px", fontWeight: 700,
                        textDecoration: "none", whiteSpace: "nowrap",
                        transition: "all 0.2s",
                    }}>
                        <svg width="12" height="12" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
                        </svg>
                        公開ページを見る
                    </Link>
                </div>
            </Card>

            {/* ── ③ 招待リンク ── */}
            <Card delay={0.18} accentColor="#FFD600">
                <SLabel text="Referral" />

                {/* 進捗ヘッダー */}
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "10px" }}>
                    <div>
                        <span style={{ fontSize: "26px", fontWeight: 900, color: "#FFD600", fontFamily: "monospace", lineHeight: 1 }}>
                            {referralCount}
                        </span>
                        <span style={{ fontSize: "11px", color: t.sub, marginLeft: "5px" }}>/ {REFERRAL_LIMIT} 人</span>
                    </div>
                    <div style={{ textAlign: "right" }}>
                        <p style={{ fontSize: "8px", color: t.sub, opacity: 0.5, margin: 0, fontFamily: "monospace" }}>獲得ポイント</p>
                        <p style={{ fontSize: "13px", fontWeight: 900, color: "#FFD600", margin: 0, fontFamily: "monospace" }}>
                            +{(referralCount * POINTS_PER_REFERRAL).toLocaleString()} pt
                        </p>
                    </div>
                </div>

                {/* プログレスバー */}
                <div style={{ height: "5px", borderRadius: "99px", background: "rgba(255,255,255,0.06)", overflow: "hidden", marginBottom: "14px" }}>
                    <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${progress}%` }}
                        transition={{ duration: 1.2, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
                        style={{
                            height: "100%", borderRadius: "99px",
                            background: "linear-gradient(90deg, #FFD600, #FFD60066)",
                            boxShadow: "0 0 8px rgba(255,214,0,0.5)",
                        }}
                    />
                </div>

                {/* 招待URL */}
                <div style={{
                    display: "flex", alignItems: "center", gap: "8px",
                    padding: "10px 12px", borderRadius: "10px",
                    background: "rgba(255,214,0,0.05)",
                    border: "1px solid rgba(255,214,0,0.18)",
                }}>
                    <span style={{ flex: 1, fontSize: "10px", fontFamily: "monospace", color: "rgba(255,214,0,0.6)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {referralUrl}
                    </span>
                    <button onClick={handleCopy} style={{
                        flexShrink: 0, padding: "5px 12px", borderRadius: "7px",
                        background: copied ? "rgba(255,214,0,0.2)" : "rgba(255,214,0,0.12)",
                        border: "1px solid rgba(255,214,0,0.3)",
                        color: "#FFD600", fontSize: "10px", fontWeight: 800,
                        cursor: "pointer", transition: "all 0.2s",
                    }}>
                        {copied ? "✓ Copied!" : "Copy"}
                    </button>
                </div>

                <p style={{ fontSize: "9px", color: t.sub, opacity: 0.4, margin: "8px 0 0", fontFamily: "monospace" }}>
                    1人招待ごとに {POINTS_PER_REFERRAL}pt 付与
                </p>
            </Card>

            {/* ── ④ Discovery Preview ── */}
            <Card delay={0.25}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "14px" }}>
                    <SLabel text="Discovery" />
                    <span style={{ fontSize: "9px", color: t.sub, opacity: 0.4, fontFamily: "monospace", letterSpacing: "0.1em" }}>
                        3/16 (月) 12:00 解放
                    </span>
                </div>
                <div style={{
                    display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
                    padding: "28px 20px", borderRadius: "12px",
                    background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)",
                    gap: "8px",
                }}>
                    <motion.div
                        animate={{ opacity: [0.4, 1, 0.4] }}
                        transition={{ duration: 2.4, repeat: Infinity }}
                        style={{
                            fontSize: "9px", fontWeight: 900, fontFamily: "monospace",
                            letterSpacing: "0.3em", textTransform: "uppercase",
                            color: "rgba(255,255,255,0.25)",
                        }}
                    >
                        COMING SOON
                    </motion.div>
                    <p style={{ fontSize: "11px", color: t.sub, opacity: 0.4, margin: 0, textAlign: "center" }}>
                        3月16日（月）正午に解放予定です
                    </p>
                </div>
            </Card>

            {/* ── ⑤ Roadmap ── */}
            <Card delay={0.32}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "16px" }}>
                    <SLabel text="Roadmap" />
                    <Link href="/roadmap" style={{
                        fontSize: "9px", color: t.sub, opacity: 0.5, textDecoration: "none",
                        fontFamily: "monospace", letterSpacing: "0.1em",
                    }}>
                        詳細を見る →
                    </Link>
                </div>

                {[
                    {
                        label: "先行登録フェーズ", status: "current" as const,
                        items: ["プロフィールカード", "公開URL", "Cheer", "Discovery", "招待リンク", "Businessスポンサー"],
                        color: roleColor,
                    },
                    {
                        label: "β版", status: "upcoming" as const,
                        items: ["Discovery拡張", "フォロー", "Signal投稿", "Cheer通知"],
                        color: "#3C8CFF",
                    },
                    {
                        label: "正式版", status: "future" as const,
                        items: ["Trust Score", "AI Discovery", "VZ Market", "イベント"],
                        color: "#FF4646",
                    },
                ].map((phase, pi) => (
                    <div key={phase.label} style={{ marginBottom: pi < 2 ? "16px" : 0 }}>
                        {/* フェーズヘッダー */}
                        <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "8px" }}>
                            {phase.status === "current" ? (
                                <motion.div
                                    animate={{ opacity: [1, 0.4, 1] }}
                                    transition={{ duration: 2, repeat: Infinity }}
                                    style={{ width: "6px", height: "6px", borderRadius: "50%", background: phase.color, boxShadow: `0 0 5px ${phase.color}` }}
                                />
                            ) : (
                                <div style={{ width: "6px", height: "6px", borderRadius: "50%", background: phase.color, opacity: 0.3 }} />
                            )}
                            <span style={{
                                fontSize: "9px", fontWeight: 900, fontFamily: "monospace",
                                letterSpacing: "0.12em", textTransform: "uppercase",
                                color: phase.status === "current" ? phase.color : t.sub,
                                opacity: phase.status === "future" ? 0.4 : 1,
                            }}>
                                {phase.label}
                            </span>
                            {phase.status === "current" && (
                                <span style={{
                                    fontSize: "7px", fontWeight: 900, fontFamily: "monospace",
                                    padding: "1px 6px", borderRadius: "3px",
                                    background: `${phase.color}18`, color: phase.color,
                                    border: `1px solid ${phase.color}35`,
                                    letterSpacing: "0.1em",
                                }}>
                                    NOW
                                </span>
                            )}
                        </div>

                        {/* アイテムグリッド */}
                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "5px" }}>
                            {phase.items.map(item => (
                                <div key={item} style={{
                                    display: "flex", alignItems: "center", gap: "7px",
                                    padding: "6px 9px", borderRadius: "8px",
                                    background: phase.status === "current" ? `${phase.color}08` : "rgba(255,255,255,0.02)",
                                    border: `1px solid ${phase.status === "current" ? `${phase.color}20` : "rgba(255,255,255,0.05)"}`,
                                    opacity: phase.status === "future" ? 0.45 : 1,
                                }}>
                                    {phase.status === "current" ? (
                                        <svg width="9" height="9" fill="none" viewBox="0 0 24 24" stroke={phase.color} strokeWidth={3}>
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                        </svg>
                                    ) : (
                                        <div style={{ width: "5px", height: "5px", borderRadius: "50%", background: t.sub, opacity: 0.3, flexShrink: 0 }} />
                                    )}
                                    <span style={{ fontSize: "10px", color: phase.status === "current" ? t.text : t.sub, opacity: phase.status === "current" ? 0.75 : 0.5 }}>
                                        {item}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
            </Card>

            {/* ── ⑥ Sponsor Banner ── */}
            <motion.div
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.38 }}
                style={{
                    borderRadius: "14px", padding: "14px 16px",
                    background: "rgba(60,140,255,0.05)",
                    border: "1px solid rgba(60,140,255,0.18)",
                    display: "flex", alignItems: "center", gap: "12px",
                }}
            >
                <div style={{ flex: 1 }}>
                    <span style={{ fontSize: "8px", fontWeight: 700, color: "#3C8CFF", letterSpacing: "0.12em", textTransform: "uppercase", fontFamily: "monospace" }}>
                        Vizion Partner
                    </span>
                    <p style={{ fontSize: "12px", color: t.text, margin: "4px 0 0", fontWeight: 500 }}>
                        広告掲載のお問い合わせはこちら
                    </p>
                </div>
                <Link href="/business" style={{
                    flexShrink: 0, padding: "7px 14px", borderRadius: "9px",
                    fontSize: "11px", fontWeight: 700,
                    border: "1px solid rgba(60,140,255,0.35)",
                    background: "rgba(60,140,255,0.12)",
                    color: "#3C8CFF", whiteSpace: "nowrap",
                    textDecoration: "none", transition: "all 0.2s",
                }}>
                    詳細を見る
                </Link>
            </motion.div>

            {/* ── ⑦ Business CTA（Businessロールのみ） ── */}
            {profile.role === "Business" && (
                <motion.div
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.44 }}
                    style={{
                        borderRadius: "16px", padding: "20px",
                        background: "rgba(60,140,255,0.06)",
                        border: "1px solid rgba(60,140,255,0.22)",
                        position: "relative", overflow: "hidden",
                    }}
                >
                    <div style={{
                        position: "absolute", top: "-20px", right: "-20px",
                        width: "100px", height: "100px", borderRadius: "50%",
                        background: "radial-gradient(circle, rgba(60,140,255,0.15), transparent 70%)",
                        pointerEvents: "none",
                    }} />
                    <p style={{ fontSize: "9px", fontWeight: 800, letterSpacing: "0.15em", textTransform: "uppercase", color: "#3C8CFF", margin: "0 0 6px", fontFamily: "monospace" }}>
                        For Business
                    </p>
                    <p style={{ fontSize: "14px", fontWeight: 700, color: t.text, margin: "0 0 6px" }}>
                        先行ポジションを確保する
                    </p>
                    <p style={{ fontSize: "12px", color: t.sub, lineHeight: 1.7, margin: "0 0 14px", opacity: 0.7 }}>
                        本日23:59締切。Vizion Connection 最初期スポンサーとして参加できます。
                    </p>
                    <Link href="/business/checkout" style={{
                        display: "inline-flex", alignItems: "center", gap: "6px",
                        padding: "9px 18px", borderRadius: "10px",
                        background: "#3C8CFF", color: "#000",
                        fontSize: "12px", fontWeight: 800,
                        textDecoration: "none", transition: "all 0.2s",
                    }}>
                        先行ポジションを見る
                        <svg width="12" height="12" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                        </svg>
                    </Link>
                </motion.div>
            )}
        </div>
    );
}