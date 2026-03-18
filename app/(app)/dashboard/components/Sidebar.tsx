"use client";

// ─────────────────────────────────────────────────────────────────────────────
// components/Sidebar.tsx
// ─────────────────────────────────────────────────────────────────────────────

import { motion } from "framer-motion";
import type { ProfileData } from "@/features/profile/types";
import type { Theme, DashboardView, ThemeColors } from "../DashboardClient";

const ROLE_COLOR: Record<string, string> = {
    Athlete: "#FF5050", Trainer: "#32D278", Members: "#FFC81E", Business: "#3C8CFF",
};
const ROLE_LABEL: Record<string, string> = {
    Athlete: "ATHLETE", Trainer: "TRAINER", Members: "MEMBERS", Business: "BUSINESS",
};

interface Props {
    profile: ProfileData;
    view: DashboardView;
    setView: (v: DashboardView) => void;
    theme: Theme;
    setTheme: (t: Theme) => void;
    t: ThemeColors;
    onLogout: () => void;
    onClose: () => void;
}

// ナビ定義（Businessロールのみ追加グループが現れる）
function buildNavGroups(role: string): { group: string; items: { id: DashboardView; label: string; icon: string }[] }[] {
    const base = [
        {
            group: "メイン",
            items: [
                { id: "home" as DashboardView, label: "ダッシュボード", icon: "M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" },
                { id: "card" as DashboardView, label: "プロフィールカード", icon: "M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" },
                { id: "cheer" as DashboardView, label: "Cheer ★", icon: "M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z" },
                { id: "referral" as DashboardView, label: "招待リンク", icon: "M13.19 8.688a4.5 4.5 0 011.242 7.244l-4.5 4.5a4.5 4.5 0 01-6.364-6.364l1.757-1.757m13.35-.622l1.757-1.757a4.5 4.5 0 00-6.364-6.364l-4.5 4.5a4.5 4.5 0 001.242 7.244" },
                { id: "missions" as DashboardView, label: "ミッション", icon: "M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" },
            ],
        },
        {
            group: "探索",
            items: [
                { id: "discovery" as DashboardView, label: "Discovery", icon: "M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" },
                { id: "roadmap" as DashboardView, label: "ロードマップ", icon: "M9 6.75V15m6-6v8.25m.503 3.498l4.875-2.437c.381-.19.622-.58.622-1.006V4.82c0-.836-.88-1.38-1.628-1.006l-3.869 1.934c-.317.159-.69.159-1.006 0L9.503 3.252a1.125 1.125 0 00-1.006 0L3.622 5.689C3.24 5.88 3 6.27 3 6.695V19.18c0 .836.88 1.38 1.628 1.006l3.869-1.934c.317-.159.69-.159 1.006 0l4.994 2.497c.317.158.69.158 1.006 0z" },
            ],
        },
    ];

    if (role === "Business") {
        base.push({
            group: "ビジネス",
            items: [
                { id: "business" as DashboardView, label: "Businessページ", icon: "M3.75 21h16.5M4.5 3h15M5.25 3v18m13.5-18v18M9 6.75h1.5m-1.5 3h1.5m-1.5 3h1.5m3-6H15m-1.5 3H15m-1.5 3H15M9 21v-3.375c0-.621.504-1.125 1.125-1.125h3.75c.621 0 1.125.504 1.125 1.125V21" },
                { id: "business-checkout" as DashboardView, label: "先行ポジション", icon: "M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3m-3.75 3h15a2.25 2.25 0 002.25-2.25V6.75A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25v10.5A2.25 2.25 0 004.5 19.5z" },
            ],
        });
    }

    return base;
}

export function Sidebar({ profile, view, setView, theme, setTheme, t, onLogout, onClose }: Props) {
    const roleColor = ROLE_COLOR[profile.role] ?? "#a78bfa";
    const navGroups = buildNavGroups(profile.role);

    return (
        <div style={{ display: "flex", flexDirection: "column", height: "100%", background: t.bg, borderRight: `1px solid ${t.border}` }}>

            {/* ── ロゴ ── */}
            <div style={{ padding: "16px 14px 12px", borderBottom: `1px solid ${t.border}`, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <img src="/images/Vizion_Connection_logo-wt.png" alt="Vizion Connection" style={{ height: 34, width: "auto" }} />
                <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
                    <motion.div
                        animate={{ opacity: [1, 0.3, 1] }}
                        transition={{ duration: 2, repeat: Infinity }}
                        style={{ width: 5, height: 5, borderRadius: "50%", background: roleColor }}
                    />
                    <span style={{ fontSize: 7, fontFamily: "monospace", fontWeight: 700, letterSpacing: "0.15em", textTransform: "uppercase", color: roleColor }}>
                        Pre-Register
                    </span>
                </div>
            </div>

            {/* ── ユーザーカード ── */}
            <div style={{ padding: "10px 10px 0" }}>
                <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                    style={{ display: "flex", alignItems: "center", gap: 9, padding: "10px 12px", borderRadius: 12, background: `${roleColor}10`, border: `1px solid ${roleColor}25` }}
                >
                    {/* アバター */}
                    <div style={{ width: 36, height: 36, borderRadius: "50%", flexShrink: 0, background: `${roleColor}20`, border: `2px solid ${roleColor}50`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 900, color: roleColor, overflow: "hidden", boxShadow: `0 0 10px ${roleColor}20` }}>
                        {profile.avatarUrl
                            ? <img src={profile.avatarUrl} alt={profile.displayName} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                            : profile.displayName[0].toUpperCase()
                        }
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                        <p style={{ fontSize: 12, fontWeight: 700, color: t.text, margin: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{profile.displayName}</p>
                        <p style={{ fontSize: 9, fontFamily: "monospace", color: t.sub, margin: "1px 0 0", opacity: 0.6 }}>@{profile.slug}</p>
                    </div>
                    <span style={{ fontSize: 7, fontWeight: 900, padding: "2px 6px", borderRadius: 4, background: `${roleColor}22`, color: roleColor, border: `1px solid ${roleColor}35`, flexShrink: 0, letterSpacing: "0.08em", textTransform: "uppercase", fontFamily: "monospace" }}>
                        {ROLE_LABEL[profile.role] ?? profile.role}
                    </span>
                </motion.div>
            </div>

            {/* ── ナビゲーション ── */}
            <nav style={{ flex: 1, overflowY: "auto", padding: "8px 8px" }}>
                {navGroups.map(({ group, items }, gi) => (
                    <motion.div
                        key={group}
                        initial={{ opacity: 0, x: -8 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.4, delay: 0.08 + gi * 0.06 }}
                        style={{ marginBottom: 20 }}
                    >
                        <p style={{ fontSize: 8, fontWeight: 900, letterSpacing: "0.22em", textTransform: "uppercase", color: t.sub, opacity: 0.35, padding: "0 10px", marginBottom: 4, fontFamily: "monospace" }}>
                            {group}
                        </p>
                        {items.map(({ id, label, icon }) => {
                            const active = view === id;
                            return (
                                <button
                                    key={id}
                                    onClick={() => { setView(id); onClose(); }}
                                    style={{
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
                                        transition: "all 0.15s ease",
                                    }}
                                >
                                    {active && (
                                        <div style={{ position: "absolute", left: 0, top: "25%", bottom: "25%", width: 2, borderRadius: 99, background: roleColor, boxShadow: `0 0 6px ${roleColor}` }} />
                                    )}
                                    <svg width={14} height={14} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={active ? 2.2 : 1.75}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d={icon} />
                                    </svg>
                                    {label}
                                </button>
                            );
                        })}
                    </motion.div>
                ))}
            </nav>

            {/* ── フッター ── */}
            <div style={{ padding: "10px", borderTop: `1px solid ${t.border}` }}>

                {/* テーマ切り替え */}
                <p style={{ fontSize: 8, fontWeight: 900, letterSpacing: "0.2em", textTransform: "uppercase", color: t.sub, opacity: 0.3, padding: "0 8px", marginBottom: 6, fontFamily: "monospace" }}>Theme</p>
                <div style={{ display: "flex", gap: 4, marginBottom: 10 }}>
                    {([["dark", "🌑", "Dark"], ["dim", "🌒", "Dim"], ["light", "☀️", "Light"]] as const).map(([val, emoji, lbl]) => (
                        <button
                            key={val} onClick={() => setTheme(val)} title={lbl}
                            style={{ flex: 1, padding: "6px 4px", borderRadius: 8, border: "none", cursor: "pointer", fontSize: 12, background: theme === val ? `${roleColor}20` : "rgba(255,255,255,0.04)", color: theme === val ? roleColor : t.sub, fontWeight: theme === val ? 700 : 400, outline: theme === val ? `1px solid ${roleColor}40` : "none", transition: "all 0.2s" }}
                        >
                            {emoji}
                        </button>
                    ))}
                </div>

                <div style={{ height: 1, background: t.border, margin: "0 2px 8px" }} />

                {/* 公開プロフィール */}
                <a href={`/u/${profile.slug}`} target="_blank" rel="noopener noreferrer" style={{ display: "flex", alignItems: "center", gap: 9, padding: "8px 10px", borderRadius: 9, color: t.sub, fontSize: 12, marginBottom: 2, transition: "all 0.15s", textDecoration: "none", opacity: 0.7 }}>
                    <svg width={13} height={13} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
                    </svg>
                    公開プロフィール
                </a>

                {/* プロフィール編集 */}
                <button onClick={() => { setView("edit"); onClose(); }} style={{ display: "flex", alignItems: "center", gap: 9, padding: "8px 10px", borderRadius: 9, border: `1px solid ${t.border}`, color: t.sub, fontSize: 12, fontWeight: 600, marginBottom: 2, background: "none", cursor: "pointer", width: "100%", textAlign: "left", transition: "all 0.15s" }}>
                    <svg width={13} height={13} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931z" />
                    </svg>
                    プロフィール編集
                </button>

                {/* アカウント設定 */}
                <button onClick={() => { setView("settings"); onClose(); }} style={{ display: "flex", alignItems: "center", gap: 9, padding: "8px 10px", borderRadius: 9, border: `1px solid ${t.border}`, color: t.sub, fontSize: 12, fontWeight: 600, marginBottom: 6, background: "none", cursor: "pointer", width: "100%", textAlign: "left", transition: "all 0.15s" }}>
                    <svg width={13} height={13} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.431l-1.003.827c-.293.24-.438.613-.431.992a6.759 6.759 0 010 .255c-.007.378.138.75.43.99l1.005.828c.424.35.534.954.26 1.43l-1.298 2.247a1.125 1.125 0 01-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.57 6.57 0 01-.22.128c-.331.183-.581.495-.644.869l-.213 1.28c-.09.543-.56.941-1.11.941h-2.594c-.55 0-1.02-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 01-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 01-1.369-.49l-1.297-2.247a1.125 1.125 0 01.26-1.431l1.004-.827c.292-.24.437-.613.43-.992a6.932 6.932 0 010-.255c.007-.378-.138-.75-.43-.99l-1.004-.828a1.125 1.125 0 01-.26-1.43l1.297-2.247a1.125 1.125 0 011.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.087.22-.128.332-.183.582-.495.644-.869l.214-1.281z" />
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    アカウント設定
                </button>

                <div style={{ height: 1, background: t.border, margin: "0 2px 6px" }} />

                {/* ログアウト */}
                <button onClick={onLogout} style={{ display: "flex", alignItems: "center", gap: 9, width: "100%", padding: "8px 10px", borderRadius: 9, background: "none", border: "none", cursor: "pointer", color: "rgba(255,80,80,0.5)", fontSize: 12, transition: "color 0.15s" }}>
                    <svg width={13} height={13} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9" />
                    </svg>
                    ログアウト
                </button>
            </div>
        </div>
    );
}