"use client";

import { useState } from "react";
import { motion } from "framer-motion";
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
const ROLE_LABEL: Record<string, string> = {
    Athlete: "Athlete", Trainer: "Trainer", Members: "Members", Business: "Business",
};

interface ThemeColors { bg: string; surface: string; border: string; text: string; sub: string; }

const REFERRAL_LIMIT = 30;
const POINTS_PER_REFERRAL = 500;

// ── サンプルバナー（後でAPIから差し替え） ──
const SAMPLE_BANNERS = [
    { id: "1", company: "Sports Lab Tokyo", text: "アスリート向け栄養管理サービス開始", cta: "詳細を見る", color: "#3C8CFF" },
    { id: "2", company: "MOVE Performance", text: "トップアスリートのトレーニング動画公開中", cta: "今すぐ見る", color: "#32D278" },
];

// ── サンプルメンバー（後でAPIから差し替え） ──
const SAMPLE_MEMBERS = [
    { name: "Kenji Yamada", slug: "kenji", role: "Athlete", initial: "K" },
    { name: "Saki Mori", slug: "saki", role: "Trainer", initial: "S" },
    { name: "Ryo Nakamura", slug: "ryo", role: "Athlete", initial: "R" },
    { name: "Hana Ito", slug: "hana", role: "Members", initial: "H" },
    { name: "Taro Suzuki", slug: "taro", role: "Business", initial: "T" },
    { name: "Miku Tanaka", slug: "miku", role: "Trainer", initial: "M" },
];

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
    const banner = SAMPLE_BANNERS[0];

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
    }

    const card = (children: React.ReactNode, delay = 0, id?: string) => (
        <motion.div
            id={id}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay, ease: [0.16, 1, 0.3, 1] }}
            style={{ borderRadius: "16px", padding: "20px", background: t.surface, border: `1px solid ${t.border}`, overflow: "hidden" }}
        >
            {children}
        </motion.div>
    );

    const sectionLabel = (text: string) => (
        <p style={{ fontSize: "9px", fontWeight: 800, letterSpacing: "0.2em", textTransform: "uppercase", color: t.sub, margin: "0 0 14px", opacity: 0.6 }}>{text}</p>
    );

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
                    } catch { /* 失敗しても画面は戻す */ }
                    setView("home");
                }}
            />
        );
    }
    if (view === "settings") {
        return (
            <SettingsClient
                user={profile as unknown as UserRecord}
                onBack={() => setView("home")}
            />
        );
    }

    return (
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>

            {/* ── Wide Ad Banner (Profile Card上) ── */}
            <div style={{
                width: "100%",
                borderRadius: "10px",
                overflow: "hidden",
                border: `1px solid ${t.border}`,
                background: t.surface,
                marginBottom: "12px",
                minHeight: "72px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                position: "relative",
            }}>
                {/* 広告プレースホルダー */}
                <div style={{
                    position: "absolute",
                    inset: 0,
                    background: "linear-gradient(90deg, rgba(255,255,255,0.01) 0%, rgba(255,255,255,0.03) 50%, rgba(255,255,255,0.01) 100%)",
                }} />
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "4px", opacity: 0.25 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                        <div style={{ width: "20px", height: "1px", background: t.sub }} />
                        <span style={{ fontSize: "9px", fontFamily: "monospace", fontWeight: 700, letterSpacing: "0.2em", textTransform: "uppercase", color: t.sub }}>
                            Business AD AREA
                        </span>
                        <div style={{ width: "20px", height: "1px", background: t.sub }} />
                    </div>
                    <span style={{ fontSize: "8px", color: t.sub, letterSpacing: "0.08em" }}>728 × 90</span>
                </div>
            </div>

            {/* ① My Profile Card */}
            <ProfileCardSection profile={profile} t={t} />

            {/* ② Public Profile + Early Badge */}
            {card(<>
                {sectionLabel("Public Profile")}
                <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
                    {/* URL + copy */}
                    <div style={{ flex: 1, minWidth: "180px", display: "flex", alignItems: "center", gap: "8px", padding: "10px 12px", borderRadius: "10px", background: `rgba(255,255,255,0.04)`, border: `1px solid ${t.border}` }}>
                        <svg width="13" height="13" fill="none" viewBox="0 0 24 24" stroke={t.sub} strokeWidth={1.75} style={{ flexShrink: 0 }}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M13.19 8.688a4.5 4.5 0 011.242 7.244l-4.5 4.5a4.5 4.5 0 01-6.364-6.364l1.757-1.757m13.35-.622l1.757-1.757a4.5 4.5 0 00-6.364-6.364l-4.5 4.5a4.5 4.5 0 001.242 7.244" />
                        </svg>
                        <p style={{ flex: 1, fontSize: "11px", fontFamily: "monospace", color: t.sub, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", margin: 0 }}>
                            {`/u/${profile.slug}`}
                        </p>
                        <button onClick={handleCopy} style={{ flexShrink: 0, padding: "4px 10px", borderRadius: "7px", fontSize: "11px", fontWeight: 700, border: "none", cursor: "pointer", background: copied ? "rgba(50,210,120,0.15)" : roleColor, color: copied ? "#32D278" : "#000", transition: "all 0.2s" }}>
                            {copied ? "✓" : "コピー"}
                        </button>
                    </div>
                    {/* Open profile button */}
                    <Link href={`/u/${profile.slug}`} style={{ flexShrink: 0, display: "flex", alignItems: "center", gap: "6px", padding: "10px 14px", borderRadius: "10px", background: `${roleColor}12`, border: `1px solid ${roleColor}28`, color: roleColor, fontSize: "12px", fontWeight: 600 }}>
                        <svg width="13" height="13" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
                        </svg>
                        プロフィールを開く
                    </Link>
                </div>

                <div style={{ marginTop: "12px", display: "flex", alignItems: "center", gap: "10px", padding: "10px 14px", borderRadius: "10px", background: "rgba(251,191,36,0.06)", border: "1px solid rgba(251,191,36,0.2)" }}>
                    <span style={{ fontSize: "16px" }}>🏅</span>
                    <div>
                        <p style={{ fontSize: "11px", fontWeight: 800, color: "#fbbf24", margin: 0, letterSpacing: "0.05em" }}>
                            {profile.isFoundingMember ? "FOUNDING MEMBER" : "EARLY MEMBER"}
                        </p>
                        <p style={{ fontSize: "10px", color: "rgba(251,191,36,0.6)", margin: 0 }}>
                            先行登録 — {new Date(profile.createdAt).toLocaleDateString("ja-JP", { year: "numeric", month: "short", day: "numeric" })}
                        </p>
                    </div>
                    <div style={{ marginLeft: "auto", fontSize: "18px", fontWeight: 900, color: "rgba(251,191,36,0.4)", fontFamily: "monospace" }}>
                        {profile.serialId ? `#${profile.serialId}` : "#----"}
                    </div>
                </div>
            </>, 0.1)}

            {/* ── Wide Ad Banner (Profile Card上) ── */}
            <div style={{
                width: "100%",
                borderRadius: "10px",
                overflow: "hidden",
                border: `1px solid ${t.border}`,
                background: t.surface,
                marginBottom: "12px",
                minHeight: "72px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                position: "relative",
            }}>
                {/* 広告プレースホルダー */}
                <div style={{
                    position: "absolute",
                    inset: 0,
                    background: "linear-gradient(90deg, rgba(255,255,255,0.01) 0%, rgba(255,255,255,0.03) 50%, rgba(255,255,255,0.01) 100%)",
                }} />
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "4px", opacity: 0.25 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                        <div style={{ width: "20px", height: "1px", background: t.sub }} />
                        <span style={{ fontSize: "9px", fontFamily: "monospace", fontWeight: 700, letterSpacing: "0.2em", textTransform: "uppercase", color: t.sub }}>
                            Business AD AREA--
                        </span>
                        <div style={{ width: "20px", height: "1px", background: t.sub }} />
                    </div>
                    <span style={{ fontSize: "8px", color: t.sub, letterSpacing: "0.08em" }}>728 × 90</span>
                </div>
            </div>

            {/* ③ Referral — compact */}
            {card(<>
                {sectionLabel("Referral")}
                <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "12px", minWidth: 0 }}>
                    <div style={{ flex: 1, minWidth: 0, display: "flex", alignItems: "center", gap: "8px", padding: "9px 12px", borderRadius: "10px", background: "rgba(255,255,255,0.04)", border: `1px solid ${t.border}`, overflow: "hidden" }}>
                        <p style={{ flex: 1, fontSize: "11px", fontFamily: "monospace", color: t.sub, margin: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", minWidth: 0 }}>
                            {referralUrl}
                        </p>
                    </div>
                    <button onClick={handleCopy} style={{ flexShrink: 0, padding: "9px 14px", borderRadius: "10px", fontSize: "12px", fontWeight: 700, border: "none", cursor: "pointer", background: copied ? "rgba(50,210,120,0.12)" : "rgba(167,139,250,1)", color: copied ? "#32D278" : "#000", transition: "all 0.2s", whiteSpace: "nowrap" }}>
                        {copied ? "✓" : "コピー"}
                    </button>
                </div>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "6px" }}>
                    <span style={{ fontSize: "11px", color: t.sub }}>{referralCount} / {REFERRAL_LIMIT} 人招待済み · 双方に {POINTS_PER_REFERRAL}pt</span>
                    <span style={{ fontSize: "11px", fontWeight: 700, color: "#a78bfa" }}>残り {REFERRAL_LIMIT - referralCount} 人</span>
                </div>
                <div style={{ height: "5px", borderRadius: "99px", background: `rgba(255,255,255,0.07)`, overflow: "hidden" }}>
                    <motion.div style={{ height: "100%", borderRadius: "99px", background: "linear-gradient(90deg, #7c3aed, #a78bfa)" }}
                        initial={{ width: 0 }} animate={{ width: `${progress}%` }} transition={{ duration: 1, delay: 0.4 }} />
                </div>
            </>, 0.2, "referral")}

            {/* ④ Members Discover */}
            {card(<>
                {sectionLabel("Discovery")}
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "12px", padding: "12px 0" }}>
                    <div style={{ width: "40px", height: "40px", borderRadius: "12px", background: "rgba(255,255,255,0.05)", border: `1px solid ${t.border}`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                        <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="rgba(255,255,255,0.25)" strokeWidth={1.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
                        </svg>
                    </div>
                    <div style={{ textAlign: "center" }}>
                        <p style={{ fontSize: "13px", fontWeight: 700, color: t.text, margin: "0 0 4px" }}>Members Discovery</p>
                        <p style={{ fontSize: "11px", color: t.sub, opacity: 0.6, margin: 0, lineHeight: 1.6 }}>
                            他のメンバーを探す機能は近日公開予定です
                        </p>
                    </div>
                    <div style={{ padding: "4px 12px", borderRadius: "20px", background: "rgba(255,255,255,0.04)", border: `1px solid ${t.border}` }}>
                        <span style={{ fontSize: "10px", fontWeight: 700, color: "rgba(255,255,255,0.2)", letterSpacing: "0.15em", textTransform: "uppercase" }}>3/14 (土) 12:00公開予定</span>
                    </div>
                </div>
            </>, 0.25)}

            {/* ── Middle Banner ── */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.28 }}
                style={{ borderRadius: "12px", padding: "14px 16px", background: `rgba(60,140,255,0.06)`, border: "1px solid rgba(60,140,255,0.18)", display: "flex", alignItems: "center", gap: "12px" }}
            >
                <div style={{ flex: 1 }}>
                    <span style={{ fontSize: "9px", fontWeight: 700, color: "#3C8CFF", letterSpacing: "0.1em", textTransform: "uppercase" }}>Sponsor · VIZION PARTNER</span>
                    <p style={{ fontSize: "12px", color: t.text, margin: "3px 0 0", fontWeight: 500 }}>広告掲載のお問い合わせはこちら</p>
                </div>
                <Link href="/business" style={{ flexShrink: 0, padding: "6px 14px", borderRadius: "8px", fontSize: "11px", fontWeight: 700, border: "1px solid rgba(60,140,255,0.3)", background: "rgba(60,140,255,0.1)", color: "#3C8CFF", whiteSpace: "nowrap" }}>
                    詳細を見る
                </Link>
            </motion.div>
            {card(<>
                {sectionLabel("Roadmap")}

                {/* 先行登録フェーズ */}
                <div style={{ marginBottom: "16px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "10px" }}>
                        <div style={{ width: "6px", height: "6px", borderRadius: "50%", background: roleColor }} />
                        <span style={{ fontSize: "10px", fontWeight: 800, color: roleColor, letterSpacing: "0.12em", textTransform: "uppercase", fontFamily: "monospace" }}>
                            先行登録フェーズ
                        </span>
                    </div>

                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "6px" }}>
                        {[
                            "Vizionプロフィールカード",
                            "公開プロフィールURL",
                            "Cheer（応援）",
                            "ユーザーDiscovery",
                            "招待リンク",
                            "Businessスポンサー"
                        ].map(item => (
                            <div key={item} style={{ display: "flex", alignItems: "center", gap: "7px", padding: "8px 10px", borderRadius: "9px", background: `${roleColor}08`, border: `1px solid ${roleColor}20` }}>
                                <svg width="10" height="10" fill="none" viewBox="0 0 24 24" stroke={roleColor} strokeWidth={3}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                </svg>
                                <span style={{ fontSize: "11px", color: "rgba(255,255,255,0.6)" }}>{item}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* β版 */}
                <div style={{ marginBottom: "16px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "10px" }}>
                        <div style={{ width: "6px", height: "6px", borderRadius: "50%", background: "rgba(255,255,255,0.2)" }} />
                        <span style={{ fontSize: "10px", fontWeight: 800, color: "rgba(255,255,255,0.3)", letterSpacing: "0.12em", textTransform: "uppercase", fontFamily: "monospace" }}>
                            β版
                        </span>
                    </div>

                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "6px" }}>
                        {[
                            "Discovery拡張検索",
                            "フォロー / Synergy",
                            "Signal投稿",
                            "Cheer通知",
                            "スキルタグ",
                            "Businessページ"
                        ].map(item => (
                            <div key={item} style={{ display: "flex", alignItems: "center", gap: "7px", padding: "8px 10px", borderRadius: "9px", background: "rgba(255,255,255,0.03)", border: `1px solid ${t.border}` }}>
                                <div style={{ width: "6px", height: "6px", borderRadius: "50%", background: "rgba(255,255,255,0.15)" }} />
                                <span style={{ fontSize: "11px", color: t.sub, opacity: 0.6 }}>{item}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* 正式版 */}
                <div style={{ marginBottom: "16px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "10px" }}>
                        <div style={{ width: "6px", height: "6px", borderRadius: "50%", background: "rgba(255,255,255,0.15)" }} />
                        <span style={{ fontSize: "10px", fontWeight: 800, color: "rgba(255,255,255,0.25)", letterSpacing: "0.12em", textTransform: "uppercase", fontFamily: "monospace" }}>
                            正式版
                        </span>
                    </div>

                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "6px" }}>
                        {[
                            "VZ Boost pt",
                            "Athlete Vote",
                            "Trust Score",
                            "AI Discovery",
                            "Athlete×Trainerマッチング",
                            "スポンサー案件投稿"
                        ].map(item => (
                            <div key={item} style={{ display: "flex", alignItems: "center", gap: "7px", padding: "8px 10px", borderRadius: "9px", background: "rgba(255,255,255,0.02)", border: `1px solid rgba(255,255,255,0.05)` }}>
                                <div style={{ width: "6px", height: "6px", borderRadius: "50%", background: "rgba(255,255,255,0.1)" }} />
                                <span style={{ fontSize: "11px", color: t.sub, opacity: 0.45 }}>{item}</span>
                            </div>
                        ))}
                    </div>
                </div>

                <div>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "10px" }}>
                        <div style={{ width: "6px", height: "6px", borderRadius: "50%", background: "rgba(255,255,255,0.08)" }} />
                        <span style={{ fontSize: "10px", fontWeight: 800, color: "rgba(255,255,255,0.18)", letterSpacing: "0.12em", textTransform: "uppercase", fontFamily: "monospace" }}>
                            追実装
                        </span>
                    </div>

                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "6px" }}>
                        {[
                            "VZ Market",
                            "Athlete支援",
                            "イベント作成",
                            "コミュニティ機能",
                            "VZ MAP",
                            "プロフィールAnalytics"
                        ].map(item => (
                            <div key={item} style={{ display: "flex", alignItems: "center", gap: "7px", padding: "8px 10px", borderRadius: "9px", background: "rgba(255,255,255,0.015)", border: `1px solid rgba(255,255,255,0.03)` }}>
                                <div style={{ width: "6px", height: "6px", borderRadius: "50%", background: "rgba(255,255,255,0.06)" }} />
                                <span style={{ fontSize: "11px", color: t.sub, opacity: 0.3 }}>{item}</span>
                            </div>
                        ))}
                    </div>
                </div>

            </>, 0.35)}

            {/* Business CTA */}
            {profile.role === "Business" && (
                <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
                    style={{ borderRadius: "16px", padding: "20px", background: "rgba(60,140,255,0.05)", border: "1px solid rgba(60,140,255,0.2)" }}>
                    <p style={{ fontSize: "14px", fontWeight: 700, color: "#3C8CFF", margin: "0 0 6px" }}>先行ポジションを確保する</p>
                    <p style={{ fontSize: "12px", color: t.sub, lineHeight: 1.7, margin: "0 0 14px" }}>本日23:59締切。Vizion Connection の最初期スポンサーとして参加できます。</p>
                    <Link href="/business/checkout" style={{ display: "inline-flex", alignItems: "center", gap: "6px", padding: "9px 18px", borderRadius: "10px", background: "#3C8CFF", color: "#000", fontSize: "12px", fontWeight: 700 }}>
                        先行ポジションを見る
                        <svg width="13" height="13" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                        </svg>
                    </Link>
                </motion.div>
            )}
        </div>
    );
}