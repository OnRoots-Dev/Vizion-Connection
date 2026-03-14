"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { Theme, DashboardView } from "../DashboardClient";
import type { ProfileData } from "@/features/profile/types";

const ROLE_COLOR: Record<string, string> = {
    Athlete: "#FF5050", Trainer: "#32D278", Members: "#FFC81E", Business: "#3C8CFF",
};

interface ThemeColors { bg: string; surface: string; border: string; text: string; sub: string; }

interface Props {
    profile: ProfileData;
    onClose: () => void;
    onLogout: () => void;
    theme: Theme;
    setTheme: (t: Theme) => void;
    t: ThemeColors;
    view: DashboardView;
    setView: (view: DashboardView) => void;
}

const NAV = [
    {
        group: "Dashboard",
        items: [
            { id: "profile", href: "/dashboard", label: "My Profile", icon: "M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" },
            
        ],
    },
    {
        group: "Explore",
        items: [
            { id: "discover", href: "/discover", label: "Discovery", icon: "M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" },
        ],
    },
];

export function Sidebar({ profile, onClose, onLogout, theme, setTheme, t, view, setView }: Props) {
    const pathname = usePathname();
    const roleColor = ROLE_COLOR[profile.role] ?? "#a78bfa";

    return (
        <div style={{ display: "flex", flexDirection: "column", height: "100%", background: t.bg, borderRight: `1px solid ${t.border}` }}>

            {/* Logo */}
            <div style={{ padding: "18px 16px", borderBottom: `1px solid ${t.border}`, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <Link href="/dashboard" onClick={onClose}>
                    <img src="/images/Vizion_Connection_logo-wt.png" alt="Vizion Connection" style={{ height: "44px", width: "auto" }} />
                </Link>

            </div>

            {/* User card */}
            <div style={{ padding: "12px 10px 4px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "9px", padding: "10px 10px", borderRadius: "12px", background: `${roleColor}10`, border: `1px solid ${roleColor}28` }}>
                    <div style={{ width: "36px", height: "36px", borderRadius: "50%", flexShrink: 0, overflow: "hidden", background: `${roleColor}22`, border: `2px solid ${roleColor}50`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "13px", fontWeight: 900, color: roleColor }}>
                        {(profile.avatarUrl || profile.profileImageUrl)
                            ? <img src={profile.avatarUrl || profile.profileImageUrl} alt={profile.displayName} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                            : profile.displayName[0].toUpperCase()
                        }
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                        <p style={{ fontSize: "12px", fontWeight: 700, color: t.text, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", margin: 0 }}>
                            {profile.displayName}
                        </p>
                        <p style={{ fontSize: "10px", fontFamily: "monospace", color: t.sub, marginTop: "1px" }}>
                            @{profile.slug}
                        </p>
                    </div>
                    <span style={{ fontSize: "8px", fontWeight: 900, padding: "2px 5px", borderRadius: "4px", background: `${roleColor}20`, color: roleColor, flexShrink: 0, letterSpacing: "0.05em" }}>
                        {profile.role.toUpperCase()}
                    </span>
                </div>
            </div>

            {/* Nav */}
            <nav style={{ flex: 1, overflowY: "auto", padding: "8px 8px" }}>
                {NAV.map(({ group, items }) => (
                    <div key={group} style={{ marginBottom: "20px" }}>
                        <p style={{ fontSize: "9px", fontWeight: 800, letterSpacing: "0.18em", textTransform: "uppercase", color: t.sub, padding: "0 8px", marginBottom: "4px" }}>
                            {group}
                        </p>
                        {items.map(({ id, href, label, icon }) => {
                            const active =
                                (id === "profile" && view === "home") ||
                                (id === "edit" && view === "edit");
                            return (
                                <Link key={id} href={href} onClick={onClose} style={{
                                    display: "flex", alignItems: "center", gap: "9px",
                                    padding: "9px 9px", borderRadius: "9px", marginBottom: "1px",
                                    background: active ? `${roleColor}18` : "transparent",
                                    color: active ? roleColor : t.sub,
                                    fontSize: "12px", fontWeight: active ? 700 : 500,
                                    transition: "all 0.15s",
                                    border: active ? `1px solid ${roleColor}30` : "1px solid transparent",
                                }}>
                                    <svg width="15" height="15" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={active ? 2 : 1.75}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d={icon} />
                                    </svg>
                                    {label}
                                    {active && <span style={{ marginLeft: "auto", width: "5px", height: "5px", borderRadius: "50%", background: roleColor, flexShrink: 0 }} />}
                                </Link>
                            );
                        })}
                    </div>
                ))}
            </nav>

            {/* Theme toggle + フッターリンク */}
            <div style={{ padding: "10px", borderTop: `1px solid ${t.border}` }}>

                {/* Theme */}
                <p style={{ fontSize: "9px", fontWeight: 800, letterSpacing: "0.18em", textTransform: "uppercase", color: t.sub, padding: "0 8px", marginBottom: "8px", opacity: 0.5 }}>
                    Theme
                </p>
                <div style={{ display: "flex", gap: "4px", padding: "0 2px", marginBottom: "12px" }}>
                    {([["dark", "🌑", "Dark"], ["dim", "🌒", "Dim"], ["light", "☀️", "Light"]] as const).map(([val, emoji, lbl]) => (
                        <button key={val} onClick={() => setTheme(val)} title={lbl}
                            style={{
                                flex: 1, padding: "6px 4px", borderRadius: "8px", border: "none", cursor: "pointer", fontSize: "11px",
                                background: theme === val ? `${roleColor}25` : "rgba(255,255,255,0.05)",
                                color: theme === val ? roleColor : t.sub,
                                fontWeight: theme === val ? 700 : 400,
                                outline: theme === val ? `1px solid ${roleColor}40` : "none",
                            }}>
                            {emoji}
                        </button>
                    ))}
                </div>

                {/* 区切り */}
                <div style={{ height: "1px", background: t.border, margin: "0 2px 8px" }} />

                {/* 公開プロフィール */}
                <Link href={`/u/${profile.slug}`} onClick={onClose}
                    style={{ display: "flex", alignItems: "center", gap: "9px", padding: "8px 10px", borderRadius: "9px", color: t.sub, fontSize: "12px", marginBottom: "2px" }}>
                    <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
                    </svg>
                    公開プロフィール
                </Link>

                {/* プロフィール編集 */}
                <button onClick={() => { setView("edit"); onClose(); }}
                    style={{ display: "flex", alignItems: "center", gap: "9px", padding: "8px 10px", borderRadius: "9px", border: `1px solid ${t.border}`, color: t.sub, fontSize: "12px", fontWeight: 600, marginBottom: "2px", background: "none", cursor: "pointer", width: "100%", textAlign: "left" }}>
                    <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931z" />
                    </svg>
                    プロフィール編集
                </button>

                {/* アカウント設定 */}
                <button onClick={() => { setView("settings"); onClose(); }}
                    style={{ display: "flex", alignItems: "center", gap: "9px", padding: "8px 10px", borderRadius: "9px", border: `1px solid ${t.border}`, color: t.sub, fontSize: "12px", fontWeight: 600, marginBottom: "2px", background: "none", cursor: "pointer", width: "100%", textAlign: "left" }}>
                    <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.431l-1.003.827c-.293.24-.438.613-.431.992a6.759 6.759 0 010 .255c-.007.378.138.75.43.99l1.005.828c.424.35.534.954.26 1.43l-1.298 2.247a1.125 1.125 0 01-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.57 6.57 0 01-.22.128c-.331.183-.581.495-.644.869l-.213 1.28c-.09.543-.56.941-1.11.941h-2.594c-.55 0-1.02-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 01-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 01-1.369-.49l-1.297-2.247a1.125 1.125 0 01.26-1.431l1.004-.827c.292-.24.437-.613.43-.992a6.932 6.932 0 010-.255c.007-.378-.138-.75-.43-.99l-1.004-.828a1.125 1.125 0 01-.26-1.43l1.297-2.247a1.125 1.125 0 011.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.087.22-.128.332-.183.582-.495.644-.869l.214-1.281z" />
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    アカウント設定
                </button>

                {/* 区切り */}
                <div style={{ height: "1px", background: t.border, margin: "0 2px 6px" }} />

                {/* ログアウト */}
                <button title="ログアウト" onClick={onLogout}
                    style={{ display: "flex", alignItems: "center", gap: "9px", width: "100%", padding: "8px 10px", borderRadius: "9px", background: "none", border: "none", cursor: "pointer", color: "rgba(255,80,80,0.6)", fontSize: "12px" }}>
                    <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9" />
                    </svg>
                    ログアウト
                </button>
            </div>
        </div>
    );
}