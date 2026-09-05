"use client";

import { motion } from "framer-motion";
import { useMemo, useState, type CSSProperties } from "react";
import { usePathname } from "next/navigation";
import type { ProfileData } from "@/features/profile/types";
import type { Theme, DashboardView, ThemeColors } from "../DashboardClient";
import Image from "next/image";
import Link from "next/link";
import { ROLE_COLOR } from "@/lib/design/tokens";

const ROLE_LABEL: Record<string, string> = {
    Athlete: "ATHLETE", Trainer: "TRAINER", Crew: "CREW", Business: "BUSINESS", Admin: "ADMIN",
};

const NAV_ITEM_BASE = "vz-nav-item relative mb-0.5 flex w-full items-center gap-[9px] rounded-[10px] px-[10px] py-[9px] text-left text-[12px] no-underline transition-all duration-150 ease-in";

type NavLeaf = {
    type: "item";
    id: DashboardView;
    label: string;
    icon: string;
    badge?: "notifications" | "cheer_total";
    tag?: string;
};

type NavActionLeaf = {
    type: "action";
    id: string;
    label: string;
    icon: string;
    onClick: () => void;
    tone?: "default" | "danger";
};

type NavExternalLeaf = {
    type: "external";
    id: string;
    label: string;
    icon: string;
    href: string;
    tag?: string;
};

type NavSubmenu = {
    type: "submenu";
    id: string;
    label: string;
    icon: string;
    items: Array<NavLeaf | NavActionLeaf | NavExternalLeaf>;
};

type NavEntry = NavLeaf | NavExternalLeaf | NavSubmenu | NavActionLeaf;

type NavSection = {
    group: string;
    items: NavEntry[];
};

interface Props {
    profile: ProfileData;
    view: DashboardView;
    setView: (v: DashboardView) => void;
    notificationUnreadCount: number;
    theme: Theme;
    t: ThemeColors;
    onLogout: () => void;
    onClose: () => void;
}

export function Sidebar({ profile, view, setView, notificationUnreadCount, theme, t, onLogout, onClose }: Props) {
    const pathname = usePathname();
    const roleColor = ROLE_COLOR[profile.role] ?? "#a78bfa";
    const [openSubmenu, setOpenSubmenu] = useState<string | null>(null);
    const [accountMenuOpen, setAccountMenuOpen] = useState(false);
    const nestedSurface = theme === "light" ? "rgba(17,17,17,0.03)" : "rgba(255,255,255,0.02)";

    const navSections = useMemo<NavSection[]>(() => {
        const sections: NavSection[] = [
            {
                group: "WORLD",
                items: [
                    { type: "item", id: "home", label: "Dashboard", icon: "M2.25 12l8.954-8.955a1.126 1.126 0 011.591 0L21.75 12M4.5 9.75v10.5a.75.75 0 00.75.75h4.5v-6h4.5v6h4.5a.75.75 0 00.75-.75V9.75" },
                    { type: "item", id: "moments", label: "Moments", icon: "M6.75 6.75v10.5a1.5 1.5 0 001.5 1.5h7.5a1.5 1.5 0 001.5-1.5V6.75a1.5 1.5 0 00-1.5-1.5h-7.5a1.5 1.5 0 00-1.5 1.5zM9.75 12l1.5 1.5L15 9" },
                    { type: "item", id: "notifications", label: "Notifications", icon: "M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0", badge: "notifications" },
                    // MVP外のため封印（config/mvp-scope.ts）: pulse, timeline
                ],
            },
            {
                group: "ACTIVITY",
                items: [
                    { type: "item", id: "activities", label: "Activities", icon: "M9 6.75V15m6-6v8.25M3.75 3.75h16.5a1.5 1.5 0 011.5 1.5v13.5a1.5 1.5 0 01-1.5 1.5H3.75a1.5 1.5 0 01-1.5-1.5V5.25a1.5 1.5 0 011.5-1.5z" },
                ],
            },
            {
                group: "PEOPLE",
                items: [
                    { type: "item", id: "profile", label: "Profile", icon: "M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21c-2.676 0-5.216-.584-7.499-1.632z" },
                    { type: "external", id: "schedule", label: "Schedule", icon: "M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5", href: "/schedule" },
                ],
            },
            {
                group: "MAP",
                items: [
                    // MY Journeyは非表示（ダッシュボード上は表示させない）
                    { type: "item", id: "viz_map", label: "Viz Map", icon: "M15 10.5a3 3 0 11-6 0 3 3 0 016 0z M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" },
                ],
            },
            // MVP外のため封印: discovery, hub（役割ハブ）
            ...(profile.role === "Business" || profile.role === "Admin"
                ? [{
                    group: "BUSINESS",
                    items: [{ type: "item" as const, id: "monetize" as const, label: "Business Hub", icon: "M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.31M21 12a9 9 0 11-18 0 9 9 0 0118 0z" }],
                } as NavSection]
                : []),
        ];

        return sections;
    }, [profile.role]);
    const isSubmenuOpen = (submenuId: string) => openSubmenu === submenuId;

    const itemStyle = (active: boolean): CSSProperties => ({
        background: active ? "rgba(167,139,250,0.1)" : "transparent",
        color: active ? roleColor : t.sub,
        fontWeight: active ? 700 : 500,
        borderTopWidth: 1,
        borderRightWidth: 1,
        borderBottomWidth: 1,
        borderLeftWidth: active ? 2 : 1,
        borderStyle: "solid",
        borderColor: "transparent",
        cursor: "pointer",
        opacity: active ? 1 : 0.76,
        transition: "all 0.15s ease",
        borderRadius: active ? 0 : 10,
    });

    function renderLeaf(item: NavLeaf | NavActionLeaf | NavExternalLeaf, nested = false) {
        const active = item.type === "external" ? pathname === item.href : item.type === "item" && view === item.id;
        const leafStyle: CSSProperties = {
            ...itemStyle(active),
            background: active ? `${roleColor}18` : nested ? nestedSurface : "transparent",
            borderTopColor: active ? `${roleColor}30` : nested ? t.border : "transparent",
            borderRightColor: active ? `${roleColor}30` : nested ? t.border : "transparent",
            borderBottomColor: active ? `${roleColor}30` : nested ? t.border : "transparent",
            borderLeftColor: active ? roleColor : nested ? t.border : "transparent",
            color: item.type === "action" && item.tone === "danger" ? "#FF5050" : active ? roleColor : t.sub,
            opacity: item.type === "action" ? 1 : active ? 1 : 0.76,
        };

        if (item.type === "external") {
            return (
                <Link
                    key={item.id}
                    href={item.href}
                    prefetch
                    onClick={onClose}
                    className={`${NAV_ITEM_BASE} ${nested ? "mb-1 pl-[18px]" : ""}`}
                    style={leafStyle}
                >
                    {active && (
                        <div className="absolute bottom-[25%] left-0 top-[25%] w-[2px] rounded-[99px]" style={{ background: roleColor }} />
                    )}
                    <svg width={14} height={14} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={active ? 2.2 : 1.75}>
                        <path strokeLinecap="round" strokeLinejoin="round" d={item.icon} />
                    </svg>
                    <span>{item.label}</span>
                    {item.tag && (
                        <span
                            className="ml-auto inline-flex items-center justify-center rounded-[4px] px-[5px] py-[2px] font-mono text-[8px] font-black uppercase leading-none tracking-[0.1em]"
                            style={{ background: "rgba(167,139,250,0.18)", color: "var(--vc-accent)", border: "1px solid rgba(167,139,250,0.35)" }}
                        >
                            {item.tag}
                        </span>
                    )}
                </Link>
            );
        }

        return (
            <button
                key={item.id}
                onClick={() => {
                    if (item.type === "item") {
                        setView(item.id);
                    } else {
                        item.onClick();
                    }
                    onClose();
                }}
                className={`${NAV_ITEM_BASE} ${nested ? "mb-1 pl-[18px]" : ""}`}
                style={leafStyle}
            >
                {active && (
                    <div className="absolute bottom-[25%] left-0 top-[25%] w-[2px] rounded-[99px]" style={{ background: roleColor }} />
                )}
                <svg width={14} height={14} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={active ? 2.2 : 1.75}>
                    <path strokeLinecap="round" strokeLinejoin="round" d={item.icon} />
                </svg>
                <span>{item.label}</span>
                {item.type === "item" && item.tag && (
                    <span
                        className="ml-auto inline-flex items-center justify-center rounded-[4px] px-[5px] py-[2px] font-mono text-[8px] font-black uppercase leading-none tracking-[0.1em]"
                        style={{ background: "rgba(167,139,250,0.18)", color: "var(--vc-accent)", border: "1px solid rgba(167,139,250,0.35)" }}
                    >
                        {item.tag}
                    </span>
                )}
                {item.type === "item" && item.badge === "notifications" && notificationUnreadCount > 0 && (
                    <span
                        className="ml-auto inline-flex h-4 min-w-4 items-center justify-center rounded-[999px] px-[5px] text-[9px] font-black leading-none"
                        style={{
                            background: roleColor,
                            color: "#0B0B0F",
                        }}
                    >
                        {notificationUnreadCount > 99 ? "99+" : notificationUnreadCount}
                    </span>
                )}
                {item.type === "item" && item.badge === "cheer_total" && (
                    <span
                        className="ml-auto inline-flex items-center justify-center rounded-[999px] px-[6px] py-[2px] text-[9px] font-black leading-none"
                        style={{
                            background: "rgba(255,214,0,0.12)",
                            color: "#FFD600",
                            border: "1px solid rgba(255,214,0,0.2)",
                        }}
                    >
                        {profile.cheerCount ?? 0}
                    </span>
                )}
            </button>
        );
    }
    function renderEntry(entry: NavEntry) {
        if (entry.type === "item" || entry.type === "external" || entry.type === "action") {
            return renderLeaf(entry);
        }

        const childActive = entry.items.some((item) => item.type === "external" ? pathname === item.href : item.type === "item" && item.id === view);
        const open = childActive || isSubmenuOpen(entry.id);

        return (
            <div
                key={entry.id}
                className="relative mb-0.5"
            >
                <button
                    type="button"
                    onClick={() => setOpenSubmenu((current) => (current === entry.id ? null : entry.id))}
                    className={NAV_ITEM_BASE}
                    style={itemStyle(childActive || open)}
                >
                    {(childActive || open) && (
                        <div className="absolute bottom-[25%] left-0 top-[25%] w-[2px] rounded-[99px]" style={{ background: roleColor }} />
                    )}
                    <svg width={14} height={14} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={childActive || open ? 2.2 : 1.75}>
                        <path strokeLinecap="round" strokeLinejoin="round" d={entry.icon} />
                    </svg>
                    <span>{entry.label}</span>
                    <svg width={12} height={12} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} className="ml-auto transition-transform duration-200" style={{ transform: open ? "rotate(180deg)" : "rotate(0deg)" }}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25L12 15.75 4.5 8.25" />
                    </svg>
                </button>

                <AnimateSubmenu open={open} roleColor={roleColor} t={t}>
                    {entry.items.map((item) => renderLeaf(item, true))}
                </AnimateSubmenu>
            </div>
        );
    }

    return (
        <div className="flex h-full flex-col" style={{ background: t.bg, borderRight: `1px solid ${t.border}` }}>
            <div className="flex items-center justify-between gap-3 border-b px-[14px] pb-3 pt-4" style={{ borderBottomColor: t.border }}>
                <div className="flex items-center gap-2">
                    <Image
                        src={theme === "light" ? "/images/Vizion_Connection_logo-bk.png" : "/images/vizion-connection-logo-6-cropped.png"}
                        alt="Vizion Connection"
                        width={220}
                        height={44}
                        priority
                        className="h-[44px] w-auto"
                    />
                </div>

                <div className="flex items-center gap-2" style={{ padding: "4px 0" }}>
                    <motion.div
                        animate={profile.isPublic ? { opacity: [1, 0.3, 1] } : { opacity: 0.45 }}
                        transition={profile.isPublic ? { duration: 2, repeat: Infinity } : undefined}
                        style={{ width: 6, height: 6, borderRadius: "50%", background: profile.isPublic ? roleColor : t.sub }}
                    />
                    <span
                        style={{
                            fontSize: 9,
                            fontFamily: "monospace",
                            fontWeight: 800,
                            letterSpacing: "0.12em",
                            color: profile.isPublic ? roleColor : t.sub,
                            textTransform: "uppercase",
                            whiteSpace: "nowrap",
                        }}
                    >
                        {profile.isPublic ? "Live" : "Private"}
                    </span>
                </div>
            </div>

            <nav className="flex-1 overflow-y-auto px-[10px] pt-[10px] pb-[120px]">
                {navSections.map(({ group, items }) => (
                    <motion.div
                        key={group}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="mb-4"
                    >
                        <p style={{ marginBottom: 8, padding: "0 10px", fontFamily: "'Space Mono', monospace", fontSize: 10, fontWeight: 600, letterSpacing: "0.18em", textTransform: "uppercase", color: "rgba(255,255,255,0.28)" }}>
                            {group}
                        </p>
                        {items.map((entry) => renderEntry(entry))}
                    </motion.div>
                ))}
            </nav>

            {/* アカウントカード — サイドバー下部に固定。Pulse（連続記録）表示なし。 */}
            <div className="relative mt-auto border-t px-[10px] pb-4 pt-3" style={{ borderColor: t.border }}>
                <motion.button
                    type="button"
                    onClick={() => setAccountMenuOpen((v) => !v)}
                    className="flex w-full items-center gap-[9px] rounded-[12px] px-3 py-[10px] text-left transition-colors"
                    style={{ background: `${roleColor}10`, border: `1px solid ${roleColor}25` }}
                    aria-expanded={accountMenuOpen}
                >
                    <div className="h-9 w-9 shrink-0 overflow-hidden rounded-full border-2 text-[13px] font-black" style={{ background: `${roleColor}20`, borderColor: `${roleColor}50`, color: roleColor }}>
                        {profile.avatarUrl
                            ? <Image src={profile.avatarUrl} alt={profile.displayName} width={36} height={36} className="h-full w-full object-cover" />
                            : (profile.displayName || profile.slug || "?")[0].toUpperCase()
                        }
                    </div>
                    <div className="min-w-0 flex-1">
                        <p className="m-0 truncate text-[12px] font-bold" style={{ color: t.text }}>{profile.displayName}</p>
                        <p className="mb-0 mt-px font-mono text-[9px] opacity-60" style={{ color: t.sub }}>@{profile.slug}</p>
                    </div>
                    <span className="shrink-0 rounded-[4px] border px-[6px] py-[2px] font-mono text-[7px] font-black uppercase tracking-[0.08em]" style={{ background: `${roleColor}22`, color: roleColor, borderColor: `${roleColor}35` }}>
                        {ROLE_LABEL[profile.role] ?? profile.role}
                    </span>
                    <svg width={12} height={12} fill="none" viewBox="0 0 24 24" stroke={t.sub} strokeWidth={2} className="shrink-0 transition-transform" style={{ transform: accountMenuOpen ? "rotate(180deg)" : "none" }}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25L12 15.75 4.5 8.25" />
                    </svg>
                </motion.button>

                {accountMenuOpen && (
                    <div className="mt-2 overflow-hidden rounded-[12px] border" style={{ borderColor: t.border, background: nestedSurface }}>
                        <button
                            type="button"
                            onClick={() => { setView("settings"); setAccountMenuOpen(false); onClose(); }}
                            className="flex w-full items-center gap-2 px-3 py-2.5 text-left text-[12px]"
                            style={{ color: t.text, borderBottom: `1px solid ${t.border}` }}
                            onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(255,255,255,0.05)")}
                            onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                        >
                            <svg width={14} height={14} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.431l-1.003.827c-.293.24-.438.613-.431.992a6.759 6.759 0 010 .255c-.007.378.138.75.43.99l1.005.828c.424.35.534.954.26 1.43l-1.298 2.247a1.125 1.125 0 01-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.57 6.57 0 01-.22.128c-.331.183-.581.495-.644.869l-.213 1.28c-.09.543-.56.941-1.11.941h-2.594c-.55 0-1.02-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 01-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 01-1.369-.49l-1.297-2.247a1.125 1.125 0 01.26-1.431l1.004-.827c.292-.24.437-.613.43-.992a6.932 6.932 0 010-.255c.007-.378-.138-.75-.43-.99l-1.004-.828a1.125 1.125 0 01-.26-1.43l1.297-2.247a1.125 1.125 0 011.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.087.22-.128.332-.183.582-.495.644-.869l.214-1.281z M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                            Settings
                        </button>
                        <Link
                            href="/contact"
                            onClick={() => setAccountMenuOpen(false)}
                            className="flex w-full items-center gap-2 px-3 py-2.5 text-left text-[12px] no-underline"
                            style={{ color: t.text, borderBottom: `1px solid ${t.border}` }}
                            onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(255,255,255,0.05)")}
                            onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                        >
                            <svg width={14} height={14} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9 5.25h.008v.008H12v-.008z" />
                            </svg>
                            Help
                        </Link>
                        <button
                            type="button"
                            onClick={() => { setAccountMenuOpen(false); onLogout(); }}
                            className="flex w-full items-center gap-2 px-3 py-2.5 text-left text-[12px]"
                            style={{ color: "#FF5050" }}
                            onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(255,80,80,0.08)")}
                            onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                        >
                            <svg width={14} height={14} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9" />
                            </svg>
                            ログアウト
                        </button>
                    </div>
                )}

                {/* Business有料プランのUpgrade入口（未購入のBusinessロールのみ）。 */}
                {profile.role === "Business" && !profile.sponsorPlan && (
                    <motion.button
                        initial={{ opacity: 0, y: 4 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="mt-2 flex w-full items-center gap-2 rounded-[10px] px-3 py-[9px] text-left"
                        onClick={() => { window.location.assign("/dashboard/business/checkout"); onClose(); }}
                        style={{
                            border: `1px solid ${roleColor}59`,
                            background: `linear-gradient(135deg, ${roleColor}1f, ${roleColor}0f)`,
                            cursor: "pointer",
                        }}
                    >
                        <span className="text-[14px]">⚡</span>
                        <div className="flex-1">
                            <p className="m-0 text-[10px] font-extrabold" style={{ color: roleColor }}>
                                有料プランにアップグレード
                            </p>
                            <p className="mb-0 mt-px font-mono text-[8px]" style={{ color: t.sub, opacity: theme === "light" ? 0.82 : 0.65 }}>
                                Business Partner Program
                            </p>
                        </div>
                        <svg width={12} height={12} fill="none" viewBox="0 0 24 24" stroke={roleColor} strokeWidth={2.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                        </svg>
                    </motion.button>
                )}
            </div>
        </div>
    );
}

function AnimateSubmenu({ open, roleColor, t, children }: { open: boolean; roleColor: string; t: ThemeColors; children: React.ReactNode }) {
    return (
        <motion.div
            initial={false}
            animate={{
                height: open ? "auto" : 0,
                opacity: open ? 1 : 0,
                marginTop: open ? 4 : 0,
            }}
            transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
            className="overflow-hidden"
        >
            <div className="rounded-[12px] border p-[6px]" style={{ borderColor: t.border, background: `linear-gradient(180deg, ${roleColor}08, ${t.surface})` }}>
                {children}
            </div>
        </motion.div>
    );
}

