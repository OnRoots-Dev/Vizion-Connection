"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { ProfileData } from "@/features/profile/types";
import { ProfileCardSection } from "./components/ProfileCard";
import { EditProfileClient } from "./edit/EditProfileClient";
import type { UserRecord } from "@/features/auth/types";
import { DashboardProfileView } from "./components/DashboardProfileView";

// ─── 型定義 ───────────────────────────────────────────────────────────────────
export type Theme = "dark" | "dim" | "light";
export type DashboardView =
    | "home"
    | "card"
    | "profile"
    | "referral"
    | "discovery"
    | "roadmap"
    | "cheer"
    | "business"
    | "business-checkout"
    | "edit"
    | "settings"
    | "missions";

export interface ThemeColors {
    bg: string;
    surface: string;
    border: string;
    text: string;
    sub: string;
}

const THEME_MAP: Record<Theme, ThemeColors> = {
    dark: { bg: "#0B0B0F", surface: "rgba(255,255,255,0.03)", border: "rgba(255,255,255,0.07)", text: "#FFFFFF", sub: "rgba(255,255,255,0.45)" },
    dim: { bg: "#13131A", surface: "rgba(255,255,255,0.04)", border: "rgba(255,255,255,0.09)", text: "#F0F0F8", sub: "rgba(255,255,255,0.5)" },
    light: { bg: "#F5F5F7", surface: "rgba(0,0,0,0.03)", border: "rgba(0,0,0,0.08)", text: "#111111", sub: "rgba(0,0,0,0.45)" },
};

const ROLE_COLOR: Record<string, string> = {
    Athlete: "#FF5050", Trainer: "#32D278", Members: "#FFC81E", Business: "#3C8CFF",
};

// ─── ダッシュボードクライアント ────────────────────────────────────────────────
export default function DashboardClient({
    profile: initialProfile,
    referralUrl,
    referralCount: initialReferralCount,
}: {
    profile: ProfileData;
    referralUrl: string;
    referralCount: number;
}) {
    const [profile, setProfile] = useState<ProfileData>(initialProfile);
    const [referralCount, setReferralCount] = useState(initialReferralCount);
    const [theme, setTheme] = useState<Theme>("dark");
    const [view, setView] = useState<DashboardView>("home");
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [isMobile, setIsMobile] = useState(false);

    const t = THEME_MAP[theme];
    const roleColor = ROLE_COLOR[profile.role] ?? "#a78bfa";

    useEffect(() => {
        const check = () => setIsMobile(window.innerWidth < 1024);
        check();
        window.addEventListener("resize", check);
        return () => window.removeEventListener("resize", check);
    }, []);

    // テーマをlocalStorageに保存
    useEffect(() => {
        const saved = localStorage.getItem("vz-theme") as Theme | null;
        if (saved && THEME_MAP[saved]) setTheme(saved);
    }, []);
    useEffect(() => {
        localStorage.setItem("vz-theme", theme);
    }, [theme]);

    const handleLogout = useCallback(async () => {
        // 正しいログアウト API を叩き、セッション Cookie を削除してからログインページへ戻す
        await fetch("/api/logout", { method: "POST" });
        window.location.href = "/login";
    }, []);

    const handleProfileUpdate = useCallback((updated: ProfileData) => {
        setProfile(updated);
        setView("home");
    }, []);

    // ─── Lazy-load view components ──────────────────────────────────────────
    const renderView = () => {
        switch (view) {
            case "home":
                return (
                    <HomeView
                        profile={profile}
                        referralUrl={referralUrl}
                        referralCount={referralCount}
                        t={t}
                        roleColor={roleColor}
                        setView={setView}
                        onProfileUpdate={handleProfileUpdate}
                    />
                );
            case "card":
                return (
                    <CardView
                        profile={profile}
                        t={t}
                        roleColor={roleColor}
                        setView={setView}
                    />
                );
            case "profile":
                return (
                    <DashboardProfileView
                        profile={profile}
                        t={t}
                        roleColor={roleColor}
                        onBack={() => setView("home")}
                    />
                );
            case "edit":
                return (
                    <EditView
                        profile={profile}
                        t={t}
                        roleColor={roleColor}
                        onBack={() => setView("home")}
                        onSave={handleProfileUpdate}
                    />
                );
            case "cheer":
                return <CheerView profile={profile} t={t} roleColor={roleColor} setView={setView} />;
            case "business":
                return <BusinessView profile={profile} t={t} roleColor={roleColor} setView={setView} />;
            case "referral":
                return (
                    <ReferralView
                        profile={profile}
                        referralUrl={referralUrl}
                        referralCount={referralCount}
                        t={t}
                        roleColor={roleColor}
                        setView={setView}
                    />
                );
            case "settings":
                return <SettingsView profile={profile} t={t} roleColor={roleColor} onBack={() => setView("home")} onLogout={handleLogout} />;
            case "missions":
                return <MissionsView profile={profile} referralCount={referralCount} t={t} roleColor={roleColor} setView={setView} />;
            case "roadmap":
                return <RoadmapView t={t} roleColor={roleColor} setView={setView} />;
            default:
                return null;
        }
    };

    return (
        <>
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Noto+Sans+JP:wght@300;400;600;700;900&display=swap');
                .font-display { font-family: 'Bebas Neue', 'Noto Sans JP', sans-serif !important; }
                .font-body    { font-family: 'Noto Sans JP', sans-serif !important; }
                .font-mono    { font-family: 'SF Mono', 'Fira Code', monospace !important; }
                * { box-sizing: border-box; }
                html { scroll-behavior: smooth; }
                ::-webkit-scrollbar { width: 4px; }
                ::-webkit-scrollbar-track { background: transparent; }
                ::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 99px; }
                .vz-nav-item { transition: all 0.15s ease; }
                .vz-nav-item:hover { opacity: 1 !important; }
                .vz-btn { transition: all 0.2s ease; cursor: pointer; }
                .vz-btn:hover { filter: brightness(1.15); }
                .vz-card-hover { transition: border-color 0.2s, box-shadow 0.2s; }
                .vz-card-hover:hover { border-color: rgba(255,255,255,0.12) !important; box-shadow: 0 4px 24px rgba(0,0,0,0.3) !important; }
            `}</style>

            <div style={{
                minHeight: "100vh",
                background: t.bg,
                color: t.text,
                fontFamily: "'Noto Sans JP', sans-serif",
                transition: "background 0.3s, color 0.3s",
            }}>
                {/* ── モバイルオーバーレイ ── */}
                <AnimatePresence>
                    {sidebarOpen && isMobile && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setSidebarOpen(false)}
                            style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.7)", zIndex: 40, backdropFilter: "blur(4px)" }}
                        />
                    )}
                </AnimatePresence>

                {/* ── レイアウト ── */}
                <div style={{ display: "flex", minHeight: "100vh" }}>

                    {/* ── サイドバー ── */}
                    <AnimatePresence>
                        {(!isMobile || sidebarOpen) && (
                            <motion.aside
                                key="sidebar"
                                initial={isMobile ? { x: -280 } : { x: 0 }}
                                animate={{ x: 0 }}
                                exit={isMobile ? { x: -280 } : { x: 0 }}
                                transition={{ type: "spring", damping: 28, stiffness: 300 }}
                                style={{
                                    width: 220,
                                    flexShrink: 0,
                                    position: isMobile ? "fixed" : "sticky",
                                    top: 0,
                                    left: 0,
                                    height: "100vh",
                                    zIndex: isMobile ? 50 : 10,
                                    borderRight: `1px solid ${t.border}`,
                                    background: t.bg,
                                    display: "flex",
                                    flexDirection: "column",
                                    overflowY: "auto",
                                }}
                            >
                                <DashboardSidebar
                                    profile={profile}
                                    view={view}
                                    setView={(v) => { setView(v); setSidebarOpen(false); }}
                                    theme={theme}
                                    setTheme={setTheme}
                                    t={t}
                                    roleColor={roleColor}
                                    onLogout={handleLogout}
                                    onClose={() => setSidebarOpen(false)}
                                />
                            </motion.aside>
                        )}
                    </AnimatePresence>

                    {/* ── メインコンテンツ ── */}
                    <main style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column" }}>

                        {/* モバイルヘッダー */}
                        {isMobile && (
                            <div style={{
                                display: "flex", alignItems: "center", justifyContent: "space-between",
                                padding: "12px 16px",
                                borderBottom: `1px solid ${t.border}`,
                                position: "sticky", top: 0, zIndex: 30,
                                background: t.bg,
                                backdropFilter: "blur(12px)",
                            }}>
                                <button onClick={() => setSidebarOpen(true)} style={{ background: "none", border: "none", color: t.text, cursor: "pointer", padding: 4 }}>
                                    <svg width={20} height={20} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
                                    </svg>
                                </button>
                                <img src="/images/Vizion_Connection_logo-wt.png" alt="Vizion" style={{ height: 32, width: "auto" }} />
                                <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
                                    <motion.div animate={{ opacity: [1, 0.3, 1] }} transition={{ duration: 2, repeat: Infinity }}
                                        style={{ width: 6, height: 6, borderRadius: "50%", background: roleColor }} />
                                    <span style={{ fontSize: 9, fontFamily: "monospace", fontWeight: 700, letterSpacing: "0.12em", color: roleColor, textTransform: "uppercase" }}>Live</span>
                                </div>
                            </div>
                        )}

                        {/* ビューコンテンツ */}
                        <div style={{ flex: 1, maxWidth: 860, width: "100%", margin: "0 auto", padding: isMobile ? "16px 12px" : "24px 32px" }}>
                            <AnimatePresence mode="wait">
                                <motion.div
                                    key={view}
                                    initial={{ opacity: 0, y: 16 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -8 }}
                                    transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                                >
                                    {renderView()}
                                </motion.div>
                            </AnimatePresence>
                        </div>
                    </main>

                    {/* ── 右パネル（デスクトップのみ） ── */}
                    {!isMobile && (
                        <aside style={{
                            width: 240,
                            flexShrink: 0,
                            position: "sticky",
                            top: 0,
                            height: "100vh",
                            overflowY: "auto",
                            borderLeft: `1px solid ${t.border}`,
                        }}>
                            <RightSidePanel
                                profile={profile}
                                referralCount={referralCount}
                                t={t}
                                roleColor={roleColor}
                                setView={setView}
                            />
                        </aside>
                    )}
                </div>
            </div>
        </>
    );
}

// ════════════════════════════════════════════════════════════════════════════
// SIDEBAR
// ════════════════════════════════════════════════════════════════════════════
function DashboardSidebar({ profile, view, setView, theme, setTheme, t, roleColor, onLogout, onClose }: {
    profile: ProfileData;
    view: DashboardView;
    setView: (v: DashboardView) => void;
    theme: Theme;
    setTheme: (t: Theme) => void;
    t: ThemeColors;
    roleColor: string;
    onLogout: () => void;
    onClose: () => void;
}) {
    const ROLE_LABEL: Record<string, string> = { Athlete: "ATHLETE", Trainer: "TRAINER", Members: "MEMBERS", Business: "BUSINESS" };

    const navGroups = [
        {
            group: "メイン",
            items: [
                { id: "home" as DashboardView, label: "ダッシュボード", icon: "M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" },
                { id: "profile" as DashboardView, label: "プロフィール", icon: "M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" },
                { id: "cheer" as DashboardView, label: "Cheer", icon: "M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z" },
                { id: "referral" as DashboardView, label: "招待リンク", icon: "M13.19 8.688a4.5 4.5 0 011.242 7.244l-4.5 4.5a4.5 4.5 0 01-6.364-6.364l1.757-1.757m13.35-.622l1.757-1.757a4.5 4.5 0 00-6.364-6.364l-4.5 4.5a4.5 4.5 0 001.242 7.244" },
                { id: "missions" as DashboardView, label: "ミッション", icon: "M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" },
            ],
        },
        {
            group: "コミュニティ",
            items: [
                { id: "discovery" as DashboardView, label: "Discovery", icon: "M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" },
                { id: "roadmap" as DashboardView, label: "ロードマップ", icon: "M9 6.75V15m6-6v8.25m.503 3.498l4.875-2.437c.381-.19.622-.58.622-1.006V4.82c0-.836-.88-1.38-1.628-1.006l-3.869 1.934c-.317.159-.69.159-1.006 0L9.503 3.252a1.125 1.125 0 00-1.006 0L3.622 5.689C3.24 5.88 3 6.27 3 6.695V19.18c0 .836.88 1.38 1.628 1.006l3.869-1.934c.317-.159.69-.159 1.006 0l4.994 2.497c.317.158.69.158 1.006 0z" },
            ],
        },
        ...(profile.role === "Business" ? [{
            group: "ビジネス",
            items: [
                { id: "business" as DashboardView, label: "Businessページ", icon: "M3.75 21h16.5M4.5 3h15M5.25 3v18m13.5-18v18M9 6.75h1.5m-1.5 3h1.5m-1.5 3h1.5m3-6H15m-1.5 3H15m-1.5 3H15M9 21v-3.375c0-.621.504-1.125 1.125-1.125h3.75c.621 0 1.125.504 1.125 1.125V21" },
                { id: "business-checkout" as DashboardView, label: "先行ポジション", icon: "M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3m-3.75 3h15a2.25 2.25 0 002.25-2.25V6.75A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25v10.5A2.25 2.25 0 004.5 19.5z" },
            ],
        }] : []),
    ];

    return (
        <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
            {/* ロゴ */}
            <div style={{ padding: "16px 14px 12px", borderBottom: `1px solid ${t.border}` }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <img src="/images/Vizion_Connection_logo-wt.png" alt="Vizion" style={{ height: 34, width: "auto" }} />
                    <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
                        <motion.div animate={{ opacity: [1, 0.3, 1] }} transition={{ duration: 2, repeat: Infinity }}
                            style={{ width: 5, height: 5, borderRadius: "50%", background: roleColor }} />
                        <span style={{ fontSize: 7, fontFamily: "monospace", fontWeight: 700, letterSpacing: "0.15em", color: roleColor, textTransform: "uppercase" }}>
                            Pre-Register
                        </span>
                    </div>
                </div>
            </div>

            {/* ユーザーカード */}
            <div style={{ padding: "10px 10px 0" }}>
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }}
                    style={{
                        padding: "10px 12px", borderRadius: 12,
                        background: `${roleColor}10`, border: `1px solid ${roleColor}25`,
                        display: "flex", alignItems: "center", gap: 9,
                    }}
                >
                    <div style={{
                        width: 36, height: 36, borderRadius: "50%", flexShrink: 0,
                        background: `${roleColor}20`, border: `2px solid ${roleColor}50`,
                        display: "flex", alignItems: "center", justifyContent: "center",
                        fontSize: 13, fontWeight: 900, color: roleColor, overflow: "hidden",
                    }}>
                        {profile.avatarUrl
                            ? <img src={profile.avatarUrl} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                            : profile.displayName[0].toUpperCase()
                        }
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                        <p style={{ fontSize: 12, fontWeight: 700, color: t.text, margin: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                            {profile.displayName}
                        </p>
                        <p style={{ fontSize: 9, fontFamily: "monospace", color: t.sub, margin: "1px 0 0", opacity: 0.6 }}>@{profile.slug}</p>
                    </div>
                    <span style={{ fontSize: 7, fontWeight: 900, padding: "2px 6px", borderRadius: 4, background: `${roleColor}22`, color: roleColor, border: `1px solid ${roleColor}35`, flexShrink: 0, letterSpacing: "0.08em", textTransform: "uppercase", fontFamily: "monospace" }}>
                        {ROLE_LABEL[profile.role] ?? profile.role}
                    </span>
                </motion.div>
            </div>

            {/* ナビ */}
            <nav style={{ flex: 1, overflowY: "auto", padding: "8px" }}>
                {navGroups.map(({ group, items }, gi) => (
                    <div key={group} style={{ marginBottom: 20 }}>
                        <p style={{ fontSize: 8, fontWeight: 900, letterSpacing: "0.22em", textTransform: "uppercase", color: t.sub, opacity: 0.35, padding: "0 8px", marginBottom: 4, fontFamily: "monospace" }}>
                            {group}
                        </p>
                        {items.map(({ id, label, icon }) => {
                            const active = view === id;
                            return (
                                <button key={id} onClick={() => setView(id)} className="vz-nav-item" style={{
                                    display: "flex", alignItems: "center", gap: 9,
                                    padding: "9px 10px", borderRadius: 10, marginBottom: 2,
                                    width: "100%", textAlign: "left",
                                    background: active ? `${roleColor}15` : "transparent",
                                    color: active ? roleColor : t.sub,
                                    fontSize: 12, fontWeight: active ? 700 : 500,
                                    border: active ? `1px solid ${roleColor}30` : "1px solid transparent",
                                    cursor: "pointer",
                                    opacity: active ? 1 : 0.7,
                                    position: "relative",
                                }}>
                                    {active && <div style={{ position: "absolute", left: 0, top: "25%", bottom: "25%", width: 2, borderRadius: 99, background: roleColor, boxShadow: `0 0 6px ${roleColor}` }} />}
                                    <svg width={14} height={14} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={active ? 2.2 : 1.75}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d={icon} />
                                    </svg>
                                    {label}
                                </button>
                            );
                        })}
                    </div>
                ))}
            </nav>

            {/* フッター */}
            <div style={{ padding: 10, borderTop: `1px solid ${t.border}` }}>
                {/* テーマ */}
                <p style={{ fontSize: 8, fontWeight: 900, letterSpacing: "0.2em", textTransform: "uppercase", color: t.sub, opacity: 0.3, padding: "0 8px", marginBottom: 6, fontFamily: "monospace" }}>Theme</p>
                <div style={{ display: "flex", gap: 4, marginBottom: 10 }}>
                    {([["dark", "🌑", "Dark"], ["dim", "🌒", "Dim"], ["light", "☀️", "Light"]] as const).map(([val, emoji, lbl]) => (
                        <button key={val} onClick={() => setTheme(val)} title={lbl} className="vz-btn" style={{
                            flex: 1, padding: "6px 4px", borderRadius: 8, border: "none",
                            cursor: "pointer", fontSize: 12,
                            background: theme === val ? `${roleColor}20` : "rgba(255,255,255,0.04)",
                            color: theme === val ? roleColor : t.sub,
                            fontWeight: theme === val ? 700 : 400,
                            outline: theme === val ? `1px solid ${roleColor}40` : "none",
                        }}>
                            {emoji}
                        </button>
                    ))}
                </div>
                <div style={{ height: 1, background: t.border, margin: "0 2px 8px" }} />
                <button onClick={() => setView("edit")} className="vz-btn" style={{ display: "flex", alignItems: "center", gap: 9, padding: "8px 10px", borderRadius: 9, border: `1px solid ${t.border}`, color: t.sub, fontSize: 12, fontWeight: 600, marginBottom: 2, background: "none", cursor: "pointer", width: "100%", textAlign: "left" }}>
                    <svg width={13} height={13} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931z" /></svg>
                    プロフィール編集
                </button>
                <button onClick={() => setView("settings")} className="vz-btn" style={{ display: "flex", alignItems: "center", gap: 9, padding: "8px 10px", borderRadius: 9, border: `1px solid ${t.border}`, color: t.sub, fontSize: 12, fontWeight: 600, marginBottom: 6, background: "none", cursor: "pointer", width: "100%", textAlign: "left" }}>
                    <svg width={13} height={13} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.431l-1.003.827c-.293.24-.438.613-.431.992a6.759 6.759 0 010 .255c-.007.378.138.75.43.99l1.005.828c.424.35.534.954.26 1.43l-1.298 2.247a1.125 1.125 0 01-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.57 6.57 0 01-.22.128c-.331.183-.581.495-.644.869l-.213 1.28c-.09.543-.56.941-1.11.941h-2.594c-.55 0-1.02-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 01-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 01-1.369-.49l-1.297-2.247a1.125 1.125 0 01.26-1.431l1.004-.827c.292-.24.437-.613.43-.992a6.932 6.932 0 010-.255c.007-.378-.138-.75-.43-.99l-1.004-.828a1.125 1.125 0 01-.26-1.43l1.297-2.247a1.125 1.125 0 011.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.087.22-.128.332-.183.582-.495.644-.869l.214-1.281z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                    設定
                </button>
                <div style={{ height: 1, background: t.border, margin: "0 2px 6px" }} />
                <button onClick={onLogout} className="vz-btn" style={{ display: "flex", alignItems: "center", gap: 9, width: "100%", padding: "8px 10px", borderRadius: 9, background: "none", border: "none", cursor: "pointer", color: "rgba(255,80,80,0.5)", fontSize: 12 }}>
                    <svg width={13} height={13} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9" /></svg>
                    ログアウト
                </button>
            </div>
        </div>
    );
}

// ════════════════════════════════════════════════════════════════════════════
// RIGHT PANEL
// ════════════════════════════════════════════════════════════════════════════
function RightSidePanel({ profile, referralCount, t, roleColor, setView }: {
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
    const completedCount = MISSIONS.filter(m => m.done).length;
    const allDone = completedCount === MISSIONS.length;

    return (
        <div style={{ padding: "16px 12px" }}>
            {/* Vizion Points */}
            <div style={{ marginBottom: 12 }}>
                <p style={{ fontSize: 8, fontWeight: 900, letterSpacing: "0.25em", textTransform: "uppercase", color: t.sub, margin: "0 0 12px", fontFamily: "monospace", opacity: 0.5 }}>Vizion Points</p>
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }}
                    style={{ padding: "16px", borderRadius: 14, background: "rgba(255,255,255,0.025)", border: `1px solid ${roleColor}20` }}
                >
                    <div style={{ display: "flex", alignItems: "baseline", gap: 5, marginBottom: 3 }}>
                        <span style={{ fontSize: 30, fontWeight: 900, color: roleColor, lineHeight: 1, fontFamily: "monospace" }}>{profile.points.toLocaleString()}</span>
                        <span style={{ fontSize: 11, color: t.sub }}>pt</span>
                    </div>
                    <p style={{ fontSize: 9, color: t.sub, margin: "0 0 10px", opacity: 0.5, fontFamily: "monospace" }}>/ {maxPoints.toLocaleString()} pt MAX</p>
                    <div style={{ height: 4, borderRadius: 99, background: "rgba(255,255,255,0.06)", overflow: "hidden" }}>
                        <motion.div initial={{ width: 0 }} animate={{ width: `${ptPct}%` }} transition={{ duration: 1.2, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
                            style={{ height: "100%", borderRadius: 99, background: `linear-gradient(90deg, ${roleColor}, ${roleColor}88)`, boxShadow: `0 0 8px ${roleColor}60` }} />
                    </div>
                </motion.div>
            </div>

            {/* Missions */}
            <div style={{ marginBottom: 12 }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
                    <p style={{ fontSize: 8, fontWeight: 900, letterSpacing: "0.25em", textTransform: "uppercase", color: t.sub, margin: 0, fontFamily: "monospace", opacity: 0.5 }}>Missions</p>
                    <span style={{ fontSize: 9, fontWeight: 900, fontFamily: "monospace", color: allDone ? "#FFD600" : t.sub, background: allDone ? "rgba(255,214,0,0.1)" : "rgba(255,255,255,0.04)", border: `1px solid ${allDone ? "rgba(255,214,0,0.25)" : "rgba(255,255,255,0.07)"}`, padding: "2px 7px", borderRadius: 99 }}>
                        {completedCount}/{MISSIONS.length}
                    </span>
                </div>
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.15 }}
                    style={{ padding: "12px 14px", borderRadius: 14, background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)" }}
                >
                    {/* ミッションバー */}
                    <div style={{ height: 3, borderRadius: 99, background: "rgba(255,255,255,0.05)", overflow: "hidden", marginBottom: 12 }}>
                        <motion.div initial={{ width: 0 }} animate={{ width: `${(completedCount / MISSIONS.length) * 100}%` }} transition={{ duration: 1, delay: 0.5 }}
                            style={{ height: "100%", borderRadius: 99, background: allDone ? "linear-gradient(90deg,#FFD600,#FFD60088)" : "linear-gradient(90deg,rgba(255,255,255,0.3),rgba(255,255,255,0.1))" }} />
                    </div>
                    {MISSIONS.map(({ label, done }, i) => (
                        <div key={label} style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: i < MISSIONS.length - 1 ? 7 : 0 }}>
                            <div style={{ width: 16, height: 16, borderRadius: "50%", flexShrink: 0, background: done ? `${roleColor}20` : "rgba(255,255,255,0.04)", border: `1.5px solid ${done ? roleColor : "rgba(255,255,255,0.1)"}`, display: "flex", alignItems: "center", justifyContent: "center", boxShadow: done ? `0 0 5px ${roleColor}40` : "none" }}>
                                {done && <svg width={8} height={8} fill="none" viewBox="0 0 24 24" stroke={roleColor} strokeWidth={3.5}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>}
                            </div>
                            <span style={{ fontSize: 11, color: done ? t.sub : t.text, opacity: done ? 0.4 : 1, textDecoration: done ? "line-through" : "none", flex: 1 }}>{label}</span>
                        </div>
                    ))}
                    {allDone && (
                        <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
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

            {/* Quick nav */}
            <button onClick={() => setView("missions")} className="vz-btn"
                style={{ width: "100%", padding: "9px 14px", borderRadius: 10, background: `${roleColor}10`, border: `1px solid ${roleColor}25`, color: roleColor, fontSize: 11, fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}
            >
                <svg width={12} height={12} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                ミッション詳細
            </button>
        </div>
    );
}

// ════════════════════════════════════════════════════════════════════════════
// HOME VIEW — ロードマップデザイン統一版
// ════════════════════════════════════════════════════════════════════════════
function HomeView({ profile, referralUrl, referralCount, t, roleColor, setView, onProfileUpdate }: {
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
            <div style={{ position: "relative", overflow: "hidden", paddingBottom: 8 }}>
                <motion.p initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
                    style={{ fontSize: 9, fontWeight: 900, letterSpacing: "0.35em", textTransform: "uppercase", color: t.sub, opacity: 0.5, margin: "0 0 4px", fontFamily: "monospace" }}>
                    Vizion Connection Dashboard
                </motion.p>
                <motion.h1 initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.05 }}
                    className="font-display"
                    style={{ fontSize: "clamp(32px,5vw,56px)", fontWeight: 900, color: t.text, margin: 0, lineHeight: 1, letterSpacing: "-0.01em", textTransform: "uppercase" }}>

                    <span style={{ color: roleColor }}>
                        {profile.role}
                    </span>
                    / BASE
                </motion.h1>

            </div>

            {/* ── Ad Banner ── */}
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }}
                style={{ borderRadius: 10, overflow: "hidden", border: `1px solid ${t.border}`, background: t.surface, minHeight: 56, display: "flex", alignItems: "center", justifyContent: "center" }}
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

            <ProfileCardSection
                profile={profile}
                t={t}
                roleColor={roleColor}
                setView={setView}
            />

            {/* ── Cheer ＋ 公開URLカード（2カラム） ── */}
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
                style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                {/* Cheer */}
                <button onClick={() => setView("cheer")} className="vz-btn vz-card-hover" style={{
                    padding: "18px 16px", borderRadius: 16,
                    background: `radial-gradient(circle at top right, ${roleColor}15, rgba(255,255,255,0.02))`,
                    border: `1px solid ${roleColor}25`,
                    cursor: "pointer", textAlign: "left",
                    position: "relative", overflow: "hidden",
                }}>
                    <p style={{ fontSize: 8, fontWeight: 900, letterSpacing: "0.22em", textTransform: "uppercase", color: roleColor, margin: "0 0 6px", fontFamily: "monospace", opacity: 0.7 }}>Cheer</p>
                    <div style={{ display: "flex", alignItems: "baseline", gap: 5 }}>
                        <span style={{ fontSize: 34, fontWeight: 900, color: "#FFD600", lineHeight: 1, fontFamily: "monospace" }}>{profile.cheerCount ?? 0}</span>
                        <span style={{ fontSize: 10, color: t.sub }}>★</span>
                    </div>
                    <p style={{ fontSize: 10, color: t.sub, margin: "4px 0 0", opacity: 0.6 }}>応援数</p>
                    <div style={{ position: "absolute", bottom: 10, right: 12, fontSize: 9, color: roleColor, opacity: 0.5, fontFamily: "monospace", letterSpacing: "0.08em" }}>詳細 →</div>
                </button>

                {/* Public URL */}
                <div className="vz-card-hover" style={{ padding: "18px 16px", borderRadius: 16, background: t.surface, border: `1px solid ${t.border}` }}>
                    <p style={{ fontSize: 8, fontWeight: 900, letterSpacing: "0.22em", textTransform: "uppercase", color: t.sub, margin: "0 0 8px", fontFamily: "monospace", opacity: 0.5 }}>Public URL</p>
                    <p style={{ fontSize: 10, fontFamily: "monospace", color: t.sub, margin: "0 0 10px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", opacity: 0.6 }}>
                        /u/{profile.slug}
                    </p>
                    <button onClick={handleCopy} className="vz-btn" style={{
                        width: "100%", padding: "7px 10px", borderRadius: 9,
                        background: copied ? `${roleColor}18` : `${roleColor}10`,
                        border: `1px solid ${copied ? roleColor + "50" : roleColor + "30"}`,
                        color: copied ? roleColor : t.sub,
                        fontSize: 10, fontWeight: 700, cursor: "pointer",
                    }}>
                        {copied ? "✓ Copied!" : "URLをコピー"}
                    </button>
                </div>
            </motion.div>

            {/* ── 招待リンク ── */}
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}>
                <SectionCard accentColor="#FFD600" t={t}>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
                        <SLabel text="Referral" color="#FFD600" />
                        <button onClick={() => setView("referral")} style={{ fontSize: 9, color: "#FFD600", opacity: 0.6, background: "none", border: "none", cursor: "pointer", fontFamily: "monospace" }}>詳細 →</button>
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
                        <motion.div initial={{ width: 0 }} animate={{ width: `${progress}%` }} transition={{ duration: 1.2, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
                            style={{ height: "100%", borderRadius: 99, background: "linear-gradient(90deg,#FFD600,#FFD60066)", boxShadow: "0 0 8px rgba(255,214,0,0.4)" }} />
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "9px 11px", borderRadius: 10, background: "rgba(255,214,0,0.05)", border: "1px solid rgba(255,214,0,0.18)" }}>
                        <span style={{ flex: 1, fontSize: 10, fontFamily: "monospace", color: "rgba(255,214,0,0.55)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{referralUrl}</span>
                        <button onClick={handleCopy} className="vz-btn" style={{ flexShrink: 0, padding: "5px 11px", borderRadius: 7, background: copied ? "rgba(255,214,0,0.18)" : "rgba(255,214,0,0.1)", border: "1px solid rgba(255,214,0,0.3)", color: "#FFD600", fontSize: 10, fontWeight: 800, cursor: "pointer" }}>
                            {copied ? "✓" : "Copy"}
                        </button>
                    </div>
                    <p style={{ fontSize: 9, color: t.sub, opacity: 0.35, margin: "7px 0 0", fontFamily: "monospace" }}>1人招待ごとに 500pt 付与</p>
                </SectionCard>
            </motion.div>

            {/* ── Discovery ── */}
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
                <SectionCard t={t}>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
                        <SLabel text="Discovery" />
                        <span style={{ fontSize: 9, color: t.sub, opacity: 0.4, fontFamily: "monospace" }}>3/20 (金・祝) 12:00 解放</span>
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "24px 0", gap: 8 }}>
                        <motion.p animate={{ opacity: [0.4, 1, 0.4] }} transition={{ duration: 2.4, repeat: Infinity }}
                            style={{ fontSize: 9, fontWeight: 900, fontFamily: "monospace", letterSpacing: "0.3em", textTransform: "uppercase", color: "rgba(255,255,255,0.25)", margin: 0 }}>
                            COMING SOON
                        </motion.p>
                        <p style={{ fontSize: 11, color: t.sub, opacity: 0.4, margin: 0 }}>3月16日（月）正午に解放予定</p>
                    </div>
                </SectionCard>
            </motion.div>

            {/* ── Roadmap mini ── */}
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}>
                <SectionCard t={t}>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
                        <SLabel text="Roadmap" />
                        <button onClick={() => setView("roadmap")} style={{ fontSize: 9, color: t.sub, opacity: 0.5, background: "none", border: "none", cursor: "pointer", fontFamily: "monospace" }}>詳細 →</button>
                    </div>
                    <RoadmapMini roleColor={roleColor} t={t} />
                </SectionCard>
            </motion.div>

            {/* ── Business Sponsor CTA ── */}
            {profile.role === "Business" && (
                <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
                    <div style={{ borderRadius: 16, padding: "20px", background: "rgba(60,140,255,0.06)", border: "1px solid rgba(60,140,255,0.22)", position: "relative", overflow: "hidden" }}>
                        <div style={{ position: "absolute", top: -20, right: -20, width: 100, height: 100, borderRadius: "50%", background: "radial-gradient(circle,rgba(60,140,255,0.15),transparent 70%)", pointerEvents: "none" }} />
                        <p style={{ fontSize: 9, fontWeight: 800, letterSpacing: "0.15em", textTransform: "uppercase", color: "#3C8CFF", margin: "0 0 5px", fontFamily: "monospace" }}>For Business</p>
                        <p style={{ fontSize: 14, fontWeight: 700, color: t.text, margin: "0 0 5px" }}>先行ポジションを確保する</p>
                        <p style={{ fontSize: 12, color: t.sub, lineHeight: 1.7, margin: "0 0 14px", opacity: 0.7 }}>本日23:59締切。Vizion Connection 最初期スポンサーとして参加できます。</p>
                        <button onClick={() => setView("business-checkout")} className="vz-btn" style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "9px 18px", borderRadius: 10, background: "#3C8CFF", color: "#000", fontSize: 12, fontWeight: 800, cursor: "pointer", border: "none" }}>
                            先行ポジションを見る
                            <svg width={12} height={12} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" /></svg>
                        </button>
                    </div>
                </motion.div>
            )}
        </div>
    );
}

// ════════════════════════════════════════════════════════════════════════════
// FLOATING PROFILE CARD — 浮遊感のあるカードセクション
// ════════════════════════════════════════════════════════════════════════════
function FloatingProfileCard({ profile, t, roleColor, setView }: {
    profile: ProfileData;
    t: ThemeColors;
    roleColor: string;
    setView: (v: DashboardView) => void;
}) {
    const ROLE_LABEL: Record<string, string> = { Athlete: "ATHLETE", Trainer: "TRAINER", Members: "MEMBERS", Business: "BUSINESS" };
    const isFounding = profile.isFoundingMember ?? false;
    const vzId = profile.serialId ?? "";

    return (
        <div style={{ position: "relative" }}>
            {/* 浮遊光源 */}
            <div style={{ position: "absolute", inset: -1, borderRadius: 22, background: `radial-gradient(ellipse at 60% 0%, ${roleColor}20, transparent 60%)`, pointerEvents: "none", zIndex: 0 }} />
            <motion.div
                animate={{ y: [0, -4, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                style={{
                    position: "relative", zIndex: 1,
                    borderRadius: 20,
                    padding: "20px",
                    background: `linear-gradient(145deg, #0B0B0F 0%, color-mix(in srgb, ${roleColor}08 0%, #0B0B0F) 100%)`,
                    border: `1px solid ${roleColor}25`,
                    boxShadow: `0 20px 60px rgba(0,0,0,0.5), 0 0 0 1px ${roleColor}18, 0 4px 24px ${roleColor}15`,
                    overflow: "hidden",
                }}
            >
                {/* 背景グロー */}
                <div style={{ position: "absolute", top: -40, right: -20, width: 200, height: 200, borderRadius: "50%", background: `radial-gradient(circle,${roleColor}20,transparent 70%)`, pointerEvents: "none" }} />

                {/* ヘッダー */}
                <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 16, position: "relative", zIndex: 1 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                        {/* アバター */}
                        <div style={{ position: "relative" }}>
                            <div style={{ width: 52, height: 52, borderRadius: "50%", overflow: "hidden", background: `${roleColor}20`, border: `2px solid ${roleColor}50`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, fontWeight: 900, color: roleColor, boxShadow: `0 0 16px ${roleColor}30` }}>
                                {profile.avatarUrl
                                    ? <img src={profile.avatarUrl} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                                    : profile.displayName[0].toUpperCase()
                                }
                            </div>
                            {/* Founding バッジドット */}
                            {isFounding && (
                                <div style={{ position: "absolute", bottom: 0, right: 0, width: 14, height: 14, borderRadius: "50%", background: "#FFD600", border: `2px solid #0B0B0F`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                                    <svg width={7} height={7} fill="none" viewBox="0 0 24 24" stroke="#000" strokeWidth={3.5}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                                </div>
                            )}
                        </div>
                        <div>
                            <div style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 3 }}>
                                {isFounding ? (
                                    <span style={{ fontSize: 7, fontWeight: 900, padding: "2px 8px", borderRadius: 3, background: "rgba(255,214,0,0.15)", color: "#FFD600", border: "1px solid rgba(255,214,0,0.3)", letterSpacing: "0.1em", textTransform: "uppercase", fontFamily: "monospace" }}>⬡ Founding Member</span>
                                ) : (
                                    <span style={{ fontSize: 7, fontWeight: 900, padding: "2px 8px", borderRadius: 3, background: "rgba(255,255,255,0.06)", color: "rgba(255,255,255,0.5)", border: "1px solid rgba(255,255,255,0.1)", letterSpacing: "0.1em", textTransform: "uppercase", fontFamily: "monospace" }}>Early Member</span>
                                )}
                                <span style={{ fontSize: 7, fontWeight: 900, padding: "2px 8px", borderRadius: 3, background: `${roleColor}20`, color: roleColor, border: `1px solid ${roleColor}35`, letterSpacing: "0.1em", textTransform: "uppercase", fontFamily: "monospace" }}>
                                    {ROLE_LABEL[profile.role] ?? profile.role}
                                </span>
                            </div>
                            <h2 style={{ fontSize: 18, fontWeight: 900, color: "#fff", margin: 0, lineHeight: 1.1 }}>{profile.displayName}</h2>
                            <p style={{ fontSize: 10, fontFamily: "monospace", color: t.sub, margin: "2px 0 0", opacity: 0.6 }}>@{profile.slug}{profile.region ? ` · ${profile.region}` : ""}</p>
                        </div>
                    </div>

                    {/* Cheer数 */}
                    <div style={{ textAlign: "right" }}>
                        <p style={{ fontSize: 8, fontFamily: "monospace", color: t.sub, opacity: 0.4, margin: "0 0 2px", textTransform: "uppercase", letterSpacing: "0.1em" }}>Cheer</p>
                        <div style={{ display: "flex", alignItems: "center", gap: 4, justifyContent: "flex-end" }}>
                            <span style={{ fontSize: 9, color: "#FFD600" }}>★</span>
                            <span style={{ fontSize: 22, fontWeight: 900, color: "#FFD600", fontFamily: "monospace", lineHeight: 1 }}>{profile.cheerCount ?? 0}</span>
                        </div>
                    </div>
                </div>

                {/* Bio */}
                {profile.bio && (
                    <p style={{ fontSize: 12, color: t.sub, lineHeight: 1.65, margin: "0 0 14px", opacity: 0.65, position: "relative", zIndex: 1 }}>{profile.bio}</p>
                )}

                {/* スポーツ・セパレーター */}
                <div style={{ height: 1, background: `linear-gradient(90deg, ${roleColor}30, transparent)`, margin: "12px 0", position: "relative", zIndex: 1 }} />

                {/* フッター */}
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", position: "relative", zIndex: 1 }}>
                    <div>
                        <p style={{ fontSize: 8, fontFamily: "monospace", color: t.sub, opacity: 0.3, margin: "0 0 2px", letterSpacing: "0.12em", textTransform: "uppercase" }}>Member ID</p>
                        <p style={{ fontSize: 11, fontFamily: "monospace", color: t.sub, opacity: 0.5, margin: 0, fontWeight: 700 }}>{vzId}</p>
                    </div>
                    <div style={{ display: "flex", gap: 8 }}>
                        <button onClick={() => setView("card")} className="vz-btn" style={{ display: "flex", alignItems: "center", gap: 5, padding: "7px 13px", borderRadius: 9, background: `${roleColor}12`, border: `1px solid ${roleColor}30`, color: roleColor, fontSize: 11, fontWeight: 700, cursor: "pointer" }}>
                            <svg width={12} height={12} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" /></svg>
                            カードを見る
                        </button>
                        <button onClick={() => setView("edit")} className="vz-btn" style={{ display: "flex", alignItems: "center", gap: 5, padding: "7px 13px", borderRadius: 9, background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", color: t.sub, fontSize: 11, fontWeight: 600, cursor: "pointer" }}>
                            <svg width={12} height={12} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931z" /></svg>
                            編集
                        </button>
                    </div>
                </div>
            </motion.div>
        </div>
    );
}

// ════════════════════════════════════════════════════════════════════════════
// ROADMAP MINI
// ════════════════════════════════════════════════════════════════════════════
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
                        {p.status === "current"
                            ? <motion.div animate={{ opacity: [1, 0.4, 1] }} transition={{ duration: 2, repeat: Infinity }} style={{ width: 6, height: 6, borderRadius: "50%", background: p.color, boxShadow: `0 0 5px ${p.color}` }} />
                            : <div style={{ width: 6, height: 6, borderRadius: "50%", background: p.color, opacity: 0.3 }} />
                        }
                        <span style={{ fontSize: 9, fontWeight: 900, fontFamily: "monospace", letterSpacing: "0.12em", textTransform: "uppercase", color: p.status === "current" ? p.color : t.sub, opacity: p.status === "future" ? 0.4 : 1 }}>{p.label}</span>
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
                </div>
            ))}
        </div>
    );
}

// ════════════════════════════════════════════════════════════════════════════
// CHEER VIEW
// ════════════════════════════════════════════════════════════════════════════
function CheerView({ profile, t, roleColor, setView }: { profile: ProfileData; t: ThemeColors; roleColor: string; setView: (v: DashboardView) => void }) {
    const cheerCount = profile.cheerCount ?? 0;

    return (
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <ViewHeader title="Cheer" sub="あなたへの応援" onBack={() => setView("home")} t={t} roleColor={roleColor} />

            {/* 大きなCheer数 */}
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                style={{ padding: "40px 0", textAlign: "center", position: "relative" }}
            >
                <motion.div animate={{ scale: [1, 1.03, 1] }} transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}>
                    <div style={{ fontSize: 9, fontWeight: 900, letterSpacing: "0.4em", textTransform: "uppercase", color: "#FFD600", opacity: 0.6, fontFamily: "monospace", marginBottom: 8 }}>TOTAL CHEER</div>
                    <div style={{ fontSize: 80, fontWeight: 900, color: "#FFD600", lineHeight: 1, fontFamily: "monospace", textShadow: "0 0 40px rgba(255,214,0,0.4)" }}>
                        {cheerCount}
                    </div>
                    <div style={{ display: "flex", justifyContent: "center", gap: 4, marginTop: 8 }}>
                        {Array.from({ length: Math.min(cheerCount, 10) }).map((_, i) => (
                            <motion.span key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} style={{ fontSize: 16 }}>★</motion.span>
                        ))}
                    </div>
                </motion.div>
            </motion.div>

            {/* 応援の仕組み */}
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
                        { label: "Beta版解放", desc: "Discovery機能で発見", icon: "🔍" },
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

            {/* 公開URLシェアCTA */}
            <SectionCard accentColor={roleColor} t={t}>
                <SLabel text="Cheerを増やす" color={roleColor} />
                <p style={{ fontSize: 12, color: t.sub, margin: "0 0 14px", opacity: 0.65 }}>公開プロフィールを広めてCheerを集めましょう。</p>
                <a href={`/u/${profile.slug}`} target="_blank" rel="noopener noreferrer" style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "9px 18px", borderRadius: 10, background: `${roleColor}18`, border: `1px solid ${roleColor}35`, color: roleColor, fontSize: 12, fontWeight: 700, textDecoration: "none" }}>
                    <svg width={13} height={13} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" /></svg>
                    公開プロフィールを開く
                </a>
            </SectionCard>
        </div>
    );
}

// ════════════════════════════════════════════════════════════════════════════
// REFERRAL VIEW
// ════════════════════════════════════════════════════════════════════════════
function ReferralView({ profile, referralUrl, referralCount, t, roleColor, setView }: {
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
            <ViewHeader title="Referral" sub="招待で特典ゲット" onBack={() => setView("home")} t={t} roleColor={roleColor} />

            {/* 大きな数字 */}
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
                        <span className="font-display" style={{ fontSize: 28, color: "#FFD600" }}>+{(referralCount * POINTS_PER_REFERRAL).toLocaleString()}</span>
                        <span style={{ fontSize: 11, color: t.sub }}>pt</span>
                    </div>
                </div>
                <div style={{ height: 6, borderRadius: 99, background: "rgba(255,255,255,0.06)", overflow: "hidden", marginBottom: 6 }}>
                    <motion.div initial={{ width: 0 }} animate={{ width: `${progress}%` }} transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
                        style={{ height: "100%", borderRadius: 99, background: "linear-gradient(90deg,#FFD600,#FFD60066)", boxShadow: "0 0 10px rgba(255,214,0,0.4)" }} />
                </div>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <span style={{ fontSize: 9, fontFamily: "monospace", color: "rgba(255,214,0,0.4)", letterSpacing: "0.08em" }}>0人</span>
                    <span style={{ fontSize: 9, fontFamily: "monospace", color: "rgba(255,214,0,0.4)", letterSpacing: "0.08em" }}>{REFERRAL_LIMIT}人上限</span>
                </div>
            </SectionCard>

            {/* 招待URL */}
            <SectionCard t={t}>
                <SLabel text="招待リンク" />
                <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "12px 14px", borderRadius: 12, background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.09)", marginBottom: 12 }}>
                    <span style={{ flex: 1, fontSize: 11, fontFamily: "monospace", color: t.sub, opacity: 0.65, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{referralUrl}</span>
                    <button onClick={handleCopy} className="vz-btn" style={{ flexShrink: 0, padding: "7px 14px", borderRadius: 9, background: copied ? "rgba(255,214,0,0.15)" : "rgba(255,214,0,0.1)", border: `1px solid ${copied ? "rgba(255,214,0,0.4)" : "rgba(255,214,0,0.25)"}`, color: "#FFD600", fontSize: 11, fontWeight: 800, cursor: "pointer" }}>
                        {copied ? "✓ Copied!" : "Copy"}
                    </button>
                </div>
                <p style={{ fontSize: 10, color: t.sub, opacity: 0.4, margin: 0, fontFamily: "monospace" }}>1人招待ごとに {POINTS_PER_REFERRAL}pt 付与 · 上限 {REFERRAL_LIMIT}人</p>
            </SectionCard>

            {/* SNSシェア */}
            <SectionCard t={t}>
                <SLabel text="SNSでシェアする" />
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                    <a
                        href="#"
                        onClick={(e) => {
                            e.preventDefault()
                            navigator.clipboard.writeText(referralUrl)
                            alert("紹介リンクをコピーしました。Instagramのストーリーやプロフィールに貼り付けてください。")
                        }}
                        style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 12,
                            padding: "12px 16px",
                            borderRadius: 12,
                            background: "rgba(225,48,108,0.05)",
                            border: "1px solid rgba(225,48,108,0.25)",
                            textDecoration: "none",
                            color: "#fff"
                        }}
                    >
                        <div
                            style={{
                                width: 36,
                                height: 36,
                                borderRadius: 10,
                                background:
                                    "linear-gradient(45deg,#f09433,#e6683c,#dc2743,#cc2366,#bc1888)",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center"
                            }}
                        >
                            <svg viewBox="0 0 24 24" width={16} height={16} fill="#fff">
                                <path d="M7.75 2h8.5A5.75 5.75 0 0 1 22 7.75v8.5A5.75 5.75 0 0 1 16.25 22h-8.5A5.75 5.75 0 0 1 2 16.25v-8.5A5.75 5.75 0 0 1 7.75 2zm8.25 2h-8a4 4 0 0 0-4 4v8a4 4 0 0 0 4 4h8a4 4 0 0 0 4-4v-8a4 4 0 0 0-4-4zm-4 3.5A4.5 4.5 0 1 1 7.5 12 4.5 4.5 0 0 1 12 7.5zm0 2A2.5 2.5 0 1 0 14.5 12 2.5 2.5 0 0 0 12 9.5zm4.75-2.38a1.12 1.12 0 1 1-1.12 1.12 1.12 1.12 0 0 1 1.12-1.12z" />
                            </svg>
                        </div>

                        <div>
                            <p style={{ fontSize: 13, fontWeight: 700, margin: 0 }}>
                                Instagram
                            </p>
                            <p style={{ fontSize: 10, color: t.sub, margin: "1px 0 0", opacity: 0.55 }}>
                                ストーリーでシェアする
                            </p>
                        </div>

                        <svg
                            width={13}
                            height={13}
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="rgba(255,255,255,0.25)"
                            strokeWidth={2}
                            style={{ marginLeft: "auto" }}
                        >
                            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                        </svg>
                    </a>
                    <a href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(`Vizion Connectionに登録しました🔥\n#VizionConnection\n${referralUrl}`)}`} target="_blank" rel="noopener noreferrer"
                        style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 16px", borderRadius: 12, background: "rgba(0,0,0,0.5)", border: "1px solid rgba(255,255,255,0.12)", textDecoration: "none", color: "#fff" }}>
                        <div style={{ width: 36, height: 36, borderRadius: 10, background: "#000", border: "1px solid rgba(255,255,255,0.15)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                            <svg viewBox="0 0 24 24" width={16} height={16} fill="#fff"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.746l7.73-8.835L1.254 2.25H8.08l4.253 5.622zm-1.161 17.52h1.833L7.084 4.126H5.117z" /></svg>
                        </div>
                        <div>
                            <p style={{ fontSize: 13, fontWeight: 700, margin: 0 }}>X (Twitter)</p>
                            <p style={{ fontSize: 10, color: t.sub, margin: "1px 0 0", opacity: 0.55 }}>ツイートして招待する</p>
                        </div>
                        <svg width={13} height={13} fill="none" viewBox="0 0 24 24" stroke="rgba(255,255,255,0.25)" strokeWidth={2} style={{ marginLeft: "auto" }}><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" /></svg>
                    </a>
                    <a href={`https://social-plugins.line.me/lineit/share?url=${encodeURIComponent(referralUrl)}`} target="_blank" rel="noopener noreferrer"
                        style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 16px", borderRadius: 12, background: "rgba(6,199,85,0.05)", border: "1px solid rgba(6,199,85,0.2)", textDecoration: "none", color: "#fff" }}>
                        <div style={{ width: 36, height: 36, borderRadius: 10, background: "#06C755", display: "flex", alignItems: "center", justifyContent: "center" }}>
                            <svg viewBox="0 0 24 24" width={16} height={16} fill="#fff"><path d="M19.365 9.863c.349 0 .63.285.63.631 0 .345-.281.63-.63.63H17.61v1.125h1.755c.349 0 .63.283.63.63 0 .344-.281.629-.63.629h-2.386c-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.63-.63h2.386c.346 0 .627.285.627.63 0 .349-.281.63-.63.63H17.61v1.125h1.755zm-3.855 3.016c0 .27-.174.51-.432.596-.064.021-.133.031-.199.031-.211 0-.391-.09-.51-.25l-2.443-3.317v2.94c0 .344-.279.629-.631.629-.346 0-.626-.285-.626-.629V8.108c0-.27.173-.51.43-.595.06-.023.136-.033.194-.033.195 0 .375.104.495.254l2.462 3.33V8.108c0-.345.282-.63.63-.63.345 0 .63.285.63.63v4.771zm-5.741 0c0 .344-.282.629-.631.629-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.63-.63.346 0 .628.285.628.63v4.771zm-2.466.629H4.917c-.345 0-.63-.285-.63-.629V8.108c0-.345.285-.63.63-.63.348 0 .63.285.63.63v4.141h1.756c.348 0 .629.283.629.63 0 .344-.282.629-.629.629M24 10.314C24 4.943 18.615.572 12 .572S0 4.943 0 10.314c0 4.811 4.27 8.842 10.035 9.608.391.082.923.258 1.058.59.12.301.079.766.038 1.08l-.164 1.02c-.045.301-.24 1.186 1.049.645 1.291-.539 6.916-4.078 9.436-6.975C23.176 14.393 24 12.458 24 10.314" /></svg>
                        </div>
                        <div>
                            <p style={{ fontSize: 13, fontWeight: 700, margin: 0 }}>LINE</p>
                            <p style={{ fontSize: 10, color: t.sub, margin: "1px 0 0", opacity: 0.55 }}>友達にシェアする</p>
                        </div>
                        <svg width={13} height={13} fill="none" viewBox="0 0 24 24" stroke="rgba(255,255,255,0.25)" strokeWidth={2} style={{ marginLeft: "auto" }}><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" /></svg>
                    </a>
                </div>
            </SectionCard>
        </div>
    );
}

// ════════════════════════════════════════════════════════════════════════════
// BUSINESS VIEW
// ════════════════════════════════════════════════════════════════════════════
function BusinessView({ profile, t, roleColor, setView }: { profile: ProfileData; t: ThemeColors; roleColor: string; setView: (v: DashboardView) => void }) {
    const isBusinessRole = profile.role === "Business";
    const bizColor = "#3C8CFF";

    const features = [
        { icon: "📊", title: "スポンサー枠", desc: "先行登録フェーズでの広告掲載エリアを確保できます", available: true },
        { icon: "🎯", title: "Business AD Area", desc: "ダッシュボード上部のバナーエリアへの掲載", available: true },
        { icon: "👥", title: "Businessページ", desc: "企業・チームの公開プロフィールページ（β版で解放）", available: false },
        { icon: "🤝", title: "アスリートマッチング", desc: "スポンサー案件の投稿・マッチング機能（正式版）", available: false },
        { icon: "📈", title: "スポンサー分析", desc: "掲載効果の分析ツール（追実装）", available: false },
        { icon: "🌍", title: "グローバル接続", desc: "海外アスリートとの接続（追実装）", available: false },
    ];

    return (
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <ViewHeader title="Business" sub="Vizion Businessポータル" onBack={() => setView("home")} t={t} roleColor={bizColor} />

            {/* Business ステータス */}
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
                style={{ padding: "20px", borderRadius: 18, background: isBusinessRole ? "rgba(60,140,255,0.06)" : "rgba(255,255,255,0.02)", border: `1px solid ${isBusinessRole ? "rgba(60,140,255,0.22)" : t.border}`, position: "relative", overflow: "hidden" }}
            >
                <div style={{ position: "absolute", top: -20, right: -20, width: 120, height: 120, borderRadius: "50%", background: "radial-gradient(circle,rgba(60,140,255,0.15),transparent 70%)", pointerEvents: "none" }} />
                <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12 }}>
                    <div style={{ width: 44, height: 44, borderRadius: 12, background: isBusinessRole ? "rgba(60,140,255,0.15)" : "rgba(255,255,255,0.04)", border: `1px solid ${isBusinessRole ? "rgba(60,140,255,0.3)" : "rgba(255,255,255,0.08)"}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20 }}>🏢</div>
                    <div>
                        <p style={{ fontSize: 8, fontWeight: 900, fontFamily: "monospace", letterSpacing: "0.15em", textTransform: "uppercase", color: bizColor, margin: "0 0 3px", opacity: isBusinessRole ? 1 : 0.5 }}>Business Status</p>
                        {isBusinessRole ? (
                            <p style={{ fontSize: 14, fontWeight: 700, color: t.text, margin: 0 }}>Businessアカウント</p>
                        ) : (
                            <p style={{ fontSize: 14, fontWeight: 700, color: t.sub, margin: 0 }}>一般アカウント</p>
                        )}
                    </div>
                    {isBusinessRole && (
                        <span style={{ marginLeft: "auto", fontSize: 9, fontWeight: 900, padding: "3px 10px", borderRadius: 5, background: "rgba(60,140,255,0.15)", color: bizColor, border: "1px solid rgba(60,140,255,0.3)", fontFamily: "monospace", letterSpacing: "0.08em" }}>BUSINESS</span>
                    )}
                </div>
                {isBusinessRole ? (
                    <p style={{ fontSize: 12, color: t.sub, lineHeight: 1.7, opacity: 0.7, margin: "0 0 14px" }}>
                        Vizion Connection Businessアカウントとして登録されています。先行スポンサー枠へのお申し込みが可能です。
                    </p>
                ) : (
                    <p style={{ fontSize: 12, color: t.sub, lineHeight: 1.7, opacity: 0.6, margin: "0 0 14px" }}>
                        Businessアカウントにアップグレードすると、スポンサー枠の確保や企業ページの作成が可能になります。
                    </p>
                )}
                <button onClick={() => setView("business-checkout")} className="vz-btn" style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "9px 18px", borderRadius: 10, background: bizColor, color: "#000", fontSize: 12, fontWeight: 800, cursor: "pointer", border: "none" }}>
                    {isBusinessRole ? "先行ポジションを見る" : "Business申込みはこちら"}
                    <svg width={12} height={12} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" /></svg>
                </button>
            </motion.div>

            {/* 機能リスト */}
            <SectionCard t={t}>
                <SLabel text="Businessロードマップ" />
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                    {features.map((f, i) => (
                        <motion.div key={f.title} initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 + i * 0.05 }}
                            style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 14px", borderRadius: 12, background: f.available ? "rgba(60,140,255,0.05)" : "rgba(255,255,255,0.02)", border: `1px solid ${f.available ? "rgba(60,140,255,0.15)" : "rgba(255,255,255,0.05)"}`, opacity: f.available ? 1 : 0.6 }}
                        >
                            <span style={{ fontSize: 18, flexShrink: 0 }}>{f.icon}</span>
                            <div style={{ flex: 1 }}>
                                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 2 }}>
                                    <p style={{ fontSize: 12, fontWeight: 700, color: f.available ? t.text : t.sub, margin: 0 }}>{f.title}</p>
                                    {f.available ? (
                                        <span style={{ fontSize: 7, fontWeight: 900, padding: "1px 6px", borderRadius: 3, background: "rgba(60,140,255,0.15)", color: bizColor, border: "1px solid rgba(60,140,255,0.25)", fontFamily: "monospace", letterSpacing: "0.08em" }}>NOW</span>
                                    ) : (
                                        <span style={{ fontSize: 7, fontWeight: 900, padding: "1px 6px", borderRadius: 3, background: "rgba(255,255,255,0.04)", color: t.sub, border: "1px solid rgba(255,255,255,0.08)", fontFamily: "monospace", letterSpacing: "0.08em", opacity: 0.6 }}>SOON</span>
                                    )}
                                </div>
                                <p style={{ fontSize: 10, color: t.sub, margin: 0, opacity: 0.55 }}>{f.desc}</p>
                            </div>
                            {f.available
                                ? <svg width={14} height={14} fill="none" viewBox="0 0 24 24" stroke={bizColor} strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" /></svg>
                                : <svg width={14} height={14} fill="none" viewBox="0 0 24 24" stroke="rgba(255,255,255,0.2)" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" /></svg>
                            }
                        </motion.div>
                    ))}
                </div>
            </SectionCard>
        </div>
    );
}

// ════════════════════════════════════════════════════════════════════════════
// MISSIONS VIEW
// ════════════════════════════════════════════════════════════════════════════
function MissionsView({ profile, referralCount, t, roleColor, setView }: { profile: ProfileData; referralCount: number; t: ThemeColors; roleColor: string; setView: (v: DashboardView) => void }) {
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
            <ViewHeader title="Missions" sub="特典を獲得しよう" onBack={() => setView("home")} t={t} roleColor={roleColor} />

            {/* 全体プログレス */}
            <SectionCard accentColor={allDone ? "#FFD600" : roleColor} t={t}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
                    <SLabel text="Progress" color={allDone ? "#FFD600" : roleColor} />
                    <span className="font-display" style={{ fontSize: 24, color: allDone ? "#FFD600" : roleColor }}>
                        {completedCount} <span style={{ fontSize: 14, opacity: 0.5 }}>/ {MISSIONS.length}</span>
                    </span>
                </div>
                <div style={{ height: 6, borderRadius: 99, background: "rgba(255,255,255,0.06)", overflow: "hidden" }}>
                    <motion.div initial={{ width: 0 }} animate={{ width: `${(completedCount / MISSIONS.length) * 100}%` }} transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
                        style={{ height: "100%", borderRadius: 99, background: allDone ? "linear-gradient(90deg,#FFD600,#FFD60066)" : `linear-gradient(90deg,${roleColor},${roleColor}66)`, boxShadow: allDone ? "0 0 10px rgba(255,214,0,0.4)" : `0 0 10px ${roleColor}40` }} />
                </div>
                {allDone && (
                    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} style={{ marginTop: 12, padding: "10px 14px", borderRadius: 10, background: "rgba(255,214,0,0.07)", border: "1px solid rgba(255,214,0,0.22)", display: "flex", alignItems: "center", gap: 10 }}>
                        <span style={{ fontSize: 20 }}>🏆</span>
                        <div>
                            <p style={{ fontSize: 12, fontWeight: 800, color: "#FFD600", margin: 0 }}>全ミッション達成！ボーナス +500pt</p>
                        </div>
                    </motion.div>
                )}
            </SectionCard>

            {/* ミッション一覧 */}
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {MISSIONS.map(({ label, done, reward, desc }, i) => (
                    <motion.div key={label} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }}
                        style={{ display: "flex", alignItems: "center", gap: 14, padding: "16px", borderRadius: 14, background: done ? "rgba(255,255,255,0.025)" : t.surface, border: `1px solid ${done ? roleColor + "25" : t.border}` }}
                    >
                        <div style={{ width: 36, height: 36, borderRadius: "50%", flexShrink: 0, background: done ? `${roleColor}20` : "rgba(255,255,255,0.04)", border: `2px solid ${done ? roleColor : "rgba(255,255,255,0.1)"}`, display: "flex", alignItems: "center", justifyContent: "center", boxShadow: done ? `0 0 8px ${roleColor}40` : "none", transition: "all 0.3s" }}>
                            {done
                                ? <svg width={14} height={14} fill="none" viewBox="0 0 24 24" stroke={roleColor} strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                                : <div style={{ width: 8, height: 8, borderRadius: "50%", background: "rgba(255,255,255,0.1)" }} />
                            }
                        </div>
                        <div style={{ flex: 1 }}>
                            <p style={{ fontSize: 13, fontWeight: 700, color: done ? t.sub : t.text, margin: "0 0 3px", opacity: done ? 0.6 : 1, textDecoration: done ? "line-through" : "none" }}>{label}</p>
                            <p style={{ fontSize: 10, color: t.sub, margin: 0, opacity: 0.5 }}>{desc}</p>
                        </div>
                        <div style={{ textAlign: "right", flexShrink: 0 }}>
                            <span style={{ fontSize: 12, fontWeight: 900, fontFamily: "monospace", color: done ? roleColor : t.sub, opacity: done ? 1 : 0.4 }}>{reward}</span>
                        </div>
                    </motion.div>
                ))}
            </div>
        </div>
    );
}

// ════════════════════════════════════════════════════════════════════════════
// EDIT VIEW — EditProfileClient をSPA内でラップ
// ════════════════════════════════════════════════════════════════════════════
function EditView({ profile, t: _t, roleColor: _rc, onBack, onSave }: {
    profile: ProfileData; t: ThemeColors; roleColor: string;
    onBack: () => void; onSave: (p: ProfileData) => void;
}) {
    // EditProfileClient は UserRecord 型を期待するので ProfileData をキャスト
    const userRecord = profile as unknown as UserRecord;

    return (
        <EditProfileClient
            user={userRecord}
            onBack={async () => {
                // 保存後にプロフィールを再取得してSPAに戻る
                try {
                    const res = await fetch("/api/profile/me");
                    if (res.ok) {
                        const data = await res.json();
                        onSave(data.profile);
                        return;
                    }
                } catch { }
                onBack();
            }}
        />
    );
}

// ════════════════════════════════════════════════════════════════════════════
// SETTINGS VIEW
// ════════════════════════════════════════════════════════════════════════════
function SettingsView({ profile, t, roleColor, onBack, onLogout }: {
    profile: ProfileData; t: ThemeColors; roleColor: string; onBack: () => void; onLogout: () => void;
}) {
    const ROLE_LABEL: Record<string, string> = { Athlete: "Athlete", Trainer: "Trainer", Members: "Members", Business: "Business" };

    return (
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <ViewHeader title="Settings" sub="アカウント設定" onBack={onBack} t={t} roleColor={roleColor} />

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

            <button onClick={onLogout} className="vz-btn"
                style={{ width: "100%", padding: "12px 0", borderRadius: 12, background: "rgba(255,80,80,0.08)", border: "1px solid rgba(255,80,80,0.2)", color: "#FF5050", fontSize: 13, fontWeight: 700, cursor: "pointer" }}
            >
                ログアウト
            </button>
        </div>
    );
}

// ════════════════════════════════════════════════════════════════════════════
// CARD VIEW — プロフィールカード単体表示
// ════════════════════════════════════════════════════════════════════════════
function CardView({ profile, t, roleColor, setView }: {
    profile: ProfileData; t: ThemeColors; roleColor: string; setView: (v: DashboardView) => void;
}) {
    return (
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <ViewHeader title="Profile Card" sub="あなたのVizionカード" onBack={() => setView("home")} t={t} roleColor={roleColor} />
            <ProfileCardSection profile={profile} t={t} roleColor={roleColor} setView={setView} />
        </div>
    );
}

// ════════════════════════════════════════════════════════════════════════════
// ROADMAP VIEW — ロードマップページ（doc10準拠）
// ════════════════════════════════════════════════════════════════════════════
const PHASES_DATA = [
    {
        id: "early", num: "01", label: "先行登録フェーズ", status: "current" as const,
        period: "2026 Mar –", tagline: "役割を名乗れ。信頼を刻め。",
        desc: "すべての始まり。プロフィールカードを手に入れた者が、最初の歴史を作る。",
        progress: 80,
        items: [
            { name: "Vizionプロフィールカード", done: true },
            { name: "公開プロフィールURL", done: true },
            { name: "初期メンバー番号", done: true },
            { name: "Cheer（応援）", done: true },
            { name: "プロフィール共有", done: true },
            { name: "招待リンク", done: true },
            { name: "ユーザーDiscovery（簡易）", done: false },
            { name: "Businessスポンサー枠", done: false },
            { name: "Vz Boost pt（先行付与）", done: false },
        ],
        accent: "#FFD600", accentDim: "#FFD60020", accentBorder: "#FFD60040",
    },
    {
        id: "beta", num: "02", label: "β版", status: "upcoming" as const,
        period: "2026 Q2", tagline: "つながりに、深さを。",
        desc: "Discoveryが進化し、人と人の間に意味ある接続が生まれ始める。",
        progress: 0,
        items: [
            { name: "Discovery拡張検索", done: false },
            { name: "フォロー / Synergy", done: false },
            { name: "Signal投稿（活動発信）", done: false },
            { name: "Cheer通知", done: false },
            { name: "スキルタグ", done: false },
            { name: "役割バッジ", done: false },
            { name: "Businessページ", done: false },
            { name: "スポンサー企業表示", done: false },
            { name: "プロフィールコメント", done: false },
            { name: "ユーザーランキング", done: false },
        ],
        accent: "#3282FF", accentDim: "#3282FF20", accentBorder: "#3282FF40",
    },
    {
        id: "v1", num: "03", label: "正式版 v1.0", status: "future" as const,
        period: "2026 Q3–Q4", tagline: "信頼が、経済になる。",
        desc: "スポーツに関わるすべての人が、信頼を資産として活用できるプラットフォームへ。",
        progress: 0,
        items: [
            { name: "VZ Boost pt", done: false },
            { name: "Trust Score（信頼スコア）", done: false },
            { name: "Athlete Vote", done: false },
            { name: "AI Discovery", done: false },
            { name: "Athlete × Trainer マッチング", done: false },
            { name: "スポンサー案件投稿", done: false },
            { name: "スポンサー募集", done: false },
            { name: "VZ Market（商品 / サービス）", done: false },
            { name: "Athlete支援", done: false },
            { name: "イベント作成", done: false },
            { name: "コミュニティ機能", done: false },
            { name: "VZ MAP（スポーツ施設 / 人材）", done: false },
            { name: "プロフィールAnalytics", done: false },
            { name: "ビジネス案件マッチング", done: false },
        ],
        accent: "#FF4646", accentDim: "#FF464620", accentBorder: "#FF464640",
    },
    {
        id: "extra", num: "04", label: "追実装", status: "future" as const,
        period: "2027 –", tagline: "信頼が、世界をつなぐ。",
        desc: "コミュニティの進化と共に、新しいスポーツ経済圏を広げていく。あなたと作っていく。",
        progress: 0,
        items: [
            { name: "国別コミュニティ", done: false },
            { name: "チーム / クラブページ", done: false },
            { name: "スポンサー分析ツール", done: false },
            { name: "試合 / 大会データ連携", done: false },
            { name: "NFT / デジタル証明", done: false },
            { name: "AIキャリア支援", done: false },
            { name: "グローバルスポンサー接続", done: false },
        ],
        accent: "#28D26E", accentDim: "#28D26E15", accentBorder: "#28D26E35",
    },
] as const;

function RoadmapView({ t, roleColor, setView }: { t: ThemeColors; roleColor: string; setView: (v: DashboardView) => void }) {
    return (
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <ViewHeader title="Roadmap" sub="スポーツの未来を、段階的に解放していく。" onBack={() => setView("home")} t={t} roleColor={roleColor} />

            {/* フェーズ指標バー */}
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }}
                style={{ display: "flex", alignItems: "center", gap: 12, padding: "14px 18px", borderRadius: 14, background: "rgba(255,255,255,0.025)", border: "1px solid rgba(255,255,255,0.07)" }}
            >
                {PHASES_DATA.map((p) => (
                    <div key={p.id} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 5, flex: 1 }}>
                        <div style={{ height: 4, width: "100%", borderRadius: 99, background: p.accent, opacity: p.status === "current" ? 1 : 0.2 }} />
                        <span style={{ fontSize: 8, fontFamily: "monospace", fontWeight: 700, letterSpacing: "0.15em", textTransform: "uppercase", color: p.status === "current" ? p.accent : t.sub, opacity: p.status === "current" ? 1 : 0.4 }}>{p.num}</span>
                    </div>
                ))}
            </motion.div>

            {/* フェーズカード */}
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                {PHASES_DATA.map((phase, index) => {
                    const isCurrent = phase.status === "current";
                    const isUpcoming = phase.status === "upcoming";
                    return (
                        <motion.div key={phase.id}
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6, delay: 0.1 + index * 0.08, ease: [0.16, 1, 0.3, 1] }}
                            style={{ position: "relative" }}
                        >
                            {/* コネクター */}
                            {index < PHASES_DATA.length - 1 && (
                                <div style={{ position: "absolute", left: 24, top: "100%", width: 1, height: 16, zIndex: 1, background: `linear-gradient(to bottom, ${phase.accent}, transparent)` }} />
                            )}

                            <div style={{
                                borderRadius: 18, overflow: "hidden", position: "relative",
                                background: isCurrent ? "linear-gradient(135deg, #0B0B0F 0%, #1a1500 100%)" : "rgba(255,255,255,0.025)",
                                border: `1px solid ${isCurrent ? phase.accentBorder : "rgba(255,255,255,0.08)"}`,
                                boxShadow: isCurrent ? `0 0 0 1px ${phase.accentBorder}, 0 16px 48px ${phase.accentDim}` : "none",
                            }}>
                                {/* 背景グロー */}
                                {isCurrent && (
                                    <div style={{ position: "absolute", right: -60, top: -60, width: 200, height: 200, borderRadius: "50%", background: `radial-gradient(circle, ${phase.accent}20, transparent 70%)`, pointerEvents: "none" }} />
                                )}

                                {/* ヘッダー */}
                                <div style={{ padding: "18px 20px 14px", display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12 }}>
                                    <div style={{ display: "flex", alignItems: "flex-start", gap: 14 }}>
                                        {/* 大きな番号 */}
                                        <div style={{ position: "relative", flexShrink: 0 }}>
                                            <span className="font-display" style={{
                                                fontSize: "clamp(40px,8vw,72px)", fontWeight: 900, lineHeight: 1,
                                                color: isCurrent ? phase.accent : "rgba(255,255,255,0.08)",
                                                WebkitTextStroke: isCurrent ? "0" : `1px ${phase.accent}30`,
                                                display: "block",
                                            }}>
                                                {phase.num}
                                            </span>
                                            {isCurrent && (
                                                <motion.div animate={{ scale: [1, 1.6, 1], opacity: [0.35, 0, 0.35] }} transition={{ duration: 2.5, repeat: Infinity }}
                                                    style={{ position: "absolute", inset: -8, borderRadius: "50%", background: `radial-gradient(circle, ${phase.accent}25, transparent 70%)` }} />
                                            )}
                                        </div>
                                        <div style={{ paddingTop: 4 }}>
                                            {/* ステータスバッジ */}
                                            <div style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 6 }}>
                                                {isCurrent && (
                                                    <motion.span animate={{ opacity: [1, 0.5, 1] }} transition={{ duration: 1.5, repeat: Infinity }}
                                                        style={{ display: "inline-flex", alignItems: "center", gap: 5, padding: "2px 9px", borderRadius: 99, fontSize: 9, fontWeight: 700, fontFamily: "monospace", letterSpacing: "0.12em", textTransform: "uppercase", background: `${phase.accent}20`, color: phase.accent, border: `1px solid ${phase.accent}45` }}>
                                                        <span style={{ width: 5, height: 5, borderRadius: "50%", background: phase.accent, display: "inline-block" }} />
                                                        Live Now
                                                    </motion.span>
                                                )}
                                                {isUpcoming && (
                                                    <span style={{ padding: "2px 9px", borderRadius: 99, fontSize: 9, fontWeight: 700, fontFamily: "monospace", letterSpacing: "0.12em", textTransform: "uppercase", background: "rgba(50,130,255,0.1)", color: "#3282FF", border: "1px solid rgba(50,130,255,0.25)" }}>
                                                        Coming Next
                                                    </span>
                                                )}
                                                <span style={{ fontSize: 9, fontFamily: "monospace", letterSpacing: "0.1em", textTransform: "uppercase", color: isCurrent ? phase.accent + "80" : t.sub, opacity: isCurrent ? 1 : 0.4 }}>{phase.period}</span>
                                            </div>
                                            <h3 className="font-display" style={{ fontSize: "clamp(16px,3vw,26px)", fontWeight: 900, color: isCurrent ? "#fff" : t.sub, margin: "0 0 3px", opacity: isCurrent ? 1 : 0.6 }}>
                                                {phase.label}
                                            </h3>
                                            <p style={{ fontSize: 12, fontWeight: 700, color: phase.accent, margin: 0, opacity: isCurrent ? 1 : 0.5 }}>{phase.tagline}</p>
                                        </div>
                                    </div>
                                    <p style={{ fontSize: 11, color: isCurrent ? "rgba(255,255,255,0.4)" : t.sub, opacity: isCurrent ? 1 : 0.4, maxWidth: 200, lineHeight: 1.6, flexShrink: 0, textAlign: "right" }}>
                                        {phase.desc}
                                    </p>
                                </div>

                                {/* 進捗バー（currentのみ） */}
                                {isCurrent && (
                                    <div style={{ margin: "0 20px 14px" }}>
                                        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 6 }}>
                                            <span style={{ fontSize: 9, fontFamily: "monospace", textTransform: "uppercase", letterSpacing: "0.1em", color: "rgba(255,255,255,0.25)" }}>Progress</span>
                                            <span className="font-display" style={{ fontSize: 18, color: phase.accent }}>{phase.progress}%</span>
                                        </div>
                                        <div style={{ height: 6, borderRadius: 99, background: "rgba(255,255,255,0.05)", overflow: "hidden" }}>
                                            <motion.div initial={{ width: 0 }} animate={{ width: `${phase.progress}%` }} transition={{ duration: 1.2, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
                                                style={{ height: "100%", borderRadius: 99, background: `linear-gradient(90deg, ${phase.accent}, ${phase.accent}88)` }} />
                                        </div>
                                    </div>
                                )}

                                {/* セパレーター */}
                                <div style={{ height: 1, margin: "0 20px 14px", background: isCurrent ? `linear-gradient(90deg, ${phase.accentBorder}, transparent)` : "rgba(255,255,255,0.06)" }} />

                                {/* 機能グリッド */}
                                <div style={{ padding: "0 20px 18px", display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(140px, 1fr))", gap: 7 }}>
                                    {phase.items.map((item) => (
                                        <div key={item.name} style={{
                                            display: "flex", alignItems: "center", gap: 8, padding: "7px 10px", borderRadius: 9,
                                            background: item.done ? `${phase.accent}10` : isCurrent ? "rgba(255,255,255,0.025)" : "rgba(255,255,255,0.015)",
                                            border: `1px solid ${item.done ? phase.accentBorder : isCurrent ? "rgba(255,255,255,0.06)" : "rgba(255,255,255,0.04)"}`,
                                            opacity: phase.status === "future" ? 0.55 : 1,
                                        }}>
                                            <div style={{ width: 14, height: 14, borderRadius: "50%", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", background: item.done ? phase.accent : isCurrent ? "rgba(255,255,255,0.07)" : "rgba(255,255,255,0.04)" }}>
                                                {item.done
                                                    ? <svg viewBox="0 0 12 12" width={9} height={9} fill="none"><path d="M2 6l3 3 5-5" stroke="#000" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /></svg>
                                                    : <div style={{ width: 4, height: 4, borderRadius: "50%", background: isCurrent ? "rgba(255,255,255,0.3)" : "rgba(255,255,255,0.15)" }} />
                                                }
                                            </div>
                                            <span style={{ fontSize: 10, color: item.done ? (isCurrent ? "#fff" : t.text) : isCurrent ? "rgba(255,255,255,0.4)" : t.sub, fontWeight: item.done ? 600 : 400, lineHeight: 1.3 }}>
                                                {item.name}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </motion.div>
                    );
                })}
            </div>
        </div>
    );
}

// ════════════════════════════════════════════════════════════════════════════
// SHARED UI COMPONENTS
// ════════════════════════════════════════════════════════════════════════════
function SectionCard({ children, accentColor, t }: { children: React.ReactNode; accentColor?: string; t: ThemeColors }) {
    return (
        <div className="vz-card-hover" style={{
            padding: "18px 20px", borderRadius: 16,
            background: accentColor ? `radial-gradient(circle at top right, ${accentColor}10, rgba(255,255,255,0.02))` : "rgba(255,255,255,0.025)",
            border: `1px solid ${accentColor ? `${accentColor}22` : "rgba(255,255,255,0.07)"}`,
            position: "relative", overflow: "hidden",
        }}>
            {accentColor && <div style={{ position: "absolute", top: -30, right: -30, width: 120, height: 120, borderRadius: "50%", background: `radial-gradient(circle,${accentColor}15,transparent 70%)`, pointerEvents: "none" }} />}
            <div style={{ position: "relative", zIndex: 1 }}>{children}</div>
        </div>
    );
}

function SLabel({ text, color }: { text: string; color?: string }) {
    return (
        <p style={{ fontSize: 8, fontWeight: 900, letterSpacing: "0.25em", textTransform: "uppercase", color: color ?? "rgba(255,255,255,0.2)", margin: "0 0 14px", fontFamily: "monospace" }}>
            {text}
        </p>
    );
}

function ViewHeader({ title, sub, onBack, t, roleColor }: { title: string; sub: string; onBack: () => void; t: ThemeColors; roleColor: string }) {
    return (
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 4 }}>
            <button onClick={onBack} className="vz-btn"
                style={{ width: 36, height: 36, borderRadius: "50%", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.09)", color: t.sub, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <svg width={16} height={16} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" /></svg>
            </button>
            <div>
                <h2 className="font-display" style={{ fontSize: "clamp(24px,4vw,40px)", fontWeight: 900, color: t.text, margin: 0, lineHeight: 1, textTransform: "uppercase", letterSpacing: "-0.01em" }}>{title}</h2>
                <p style={{ fontSize: 10, color: t.sub, margin: "2px 0 0", opacity: 0.5 }}>{sub}</p>
            </div>
        </div>
    );
}
