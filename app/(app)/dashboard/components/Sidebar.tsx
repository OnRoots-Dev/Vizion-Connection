"use client";

import { motion } from "framer-motion";
import { useEffect, useMemo, useState, type CSSProperties } from "react";
import { usePathname } from "next/navigation";
import type { ProfileData } from "@/features/profile/types";
import type { Theme, DashboardView, ThemeColors } from "../DashboardClient";
import { getPlanFeatures } from "@/features/business/plan-features";
import { supabaseBrowser } from "@/lib/supabase/browser";
import { PulseIndicator } from "./ui";
import { computeStreak } from "@/lib/pulse-stats";
import Image from "next/image";
import Link from "next/link";


const ROLE_COLOR: Record<string, string> = {
    Athlete: "#FF5050", Trainer: "#32D278", Crew: "#FFC81E", Business: "#3C8CFF",
};
const ROLE_LABEL: Record<string, string> = {
    Athlete: "ATHLETE", Trainer: "TRAINER", Crew: "CREW", Business: "BUSINESS", Admin: "ADMIN",
};

function getHubMenuLabel(role: string) {
    if (role === "Business") return "Business Hub";
    if (role === "Admin") return "Admin Hub";
    return "My Hub";
}

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
    setTheme: (t: Theme) => void;
    t: ThemeColors;
    onLogout: () => void;
    onClose: () => void;
}

export function Sidebar({ profile, view, setView, notificationUnreadCount, theme, setTheme, t, onLogout, onClose }: Props) {
    const pathname = usePathname();
    const roleColor = ROLE_COLOR[profile.role] ?? "#a78bfa";
    const [openSubmenu, setOpenSubmenu] = useState<string | null>(null);
    const hubMenuLabel = getHubMenuLabel(profile.role);
    const nestedSurface = theme === "light" ? "rgba(17,17,17,0.03)" : "rgba(255,255,255,0.02)";
    const themeChipSurface = theme === "light" ? "rgba(17,17,17,0.04)" : "rgba(255,255,255,0.04)";

    const isPaidPlan = Boolean(profile.sponsorPlan);
    const planLabel = getPlanFeatures(profile.sponsorPlan ?? null)?.badgeLabel ?? null;

    // PULSE（連続記録日数）— 自分の Journey 投稿日から算出
    const [pulseDays, setPulseDays] = useState(0);
    useEffect(() => {
        let cancelled = false;
        void supabaseBrowser
            .from("journeys")
            .select("created_at")
            .eq("user_slug", profile.slug)
            .order("created_at", { ascending: false })
            .limit(120)
            .then(({ data }) => {
                if (cancelled || !data) return;
                setPulseDays(computeStreak(data.map((r) => String(r.created_at))));
            });
        return () => {
            cancelled = true;
        };
    }, [profile.slug]);

    const navSections = useMemo<NavSection[]>(() => {
        const sections: NavSection[] = [
            {
                group: "PULSE",
                items: [
                    { type: "item", id: "home", label: "Dashboard", icon: "M2.25 12l8.954-8.955a1.126 1.126 0 011.591 0L21.75 12M4.5 9.75v10.5a.75.75 0 00.75.75h4.5v-6h4.5v6h4.5a.75.75 0 00.75-.75V9.75" },
                    { type: "external", id: "pulse", label: "Pulse", href: "/pulse", tag: "CORE", icon: "M3.75 12h2.25l1.5 6 3-13.5 3 9 1.5-3h4.5" },
                    { type: "item", id: "timeline", label: "Timeline", tag: "NEW", icon: "M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" },
                    { type: "item", id: "journey", label: "Journey", icon: "M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h10.5" },
                    { type: "item", id: "cheer", label: "Cheer", badge: "cheer_total", icon: "M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z" },
                    { type: "item", id: "discovery", label: "Discovery", icon: "M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" },
                    { type: "item", id: "portfolio", label: "Portfolio", icon: "M20.25 14.15v4.073a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25v-4.072M16.5 9.75l-4.5 4.5-4.5-4.5M12 3v11.25" },
                    { type: "item", id: "hub", label: hubMenuLabel, icon: "M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z" },
                ],
            },
            {
                group: "MORE",
                items: [
                    { type: "item", id: "missions", label: "Missions", icon: "M3 3v1.5M3 21v-6m0 0l2.77-.693a9 9 0 016.208.682l.108.054a9 9 0 006.086.71l3.114-.732a48.524 48.524 0 01-.005-10.499l-3.11.732a9 9 0 01-6.085-.711l-.108-.054a9 9 0 00-6.208-.682L3 4.5M3 15V4.5" },
                    { type: "item", id: "referral", label: "Referral", icon: "M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" },
                    { type: "item", id: "voicelab", label: "Voice Lab", icon: "M9.75 3.104v5.714a2.25 2.25 0 01-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 014.5 0m0 0v5.714c0 .597.237 1.17.659 1.591L19.8 15.3M14.25 3.104c.251.023.501.05.75.082M19.8 15.3l-1.57.393A9.065 9.065 0 0112 15a9.065 9.065 0 00-6.23-.693L5 14.5m14.8.8l1.402 1.402c1.232 1.232.65 3.318-1.067 3.611A48.309 48.309 0 0112 21a48.25 48.25 0 01-8.135-.687c-1.718-.293-2.3-2.379-1.067-3.61L5 14.5" },
                    { type: "item", id: "news", label: "News", icon: "M12 7.5h1.5m-1.5 3h1.5m-7.5 3h7.5m-7.5 3h7.5m3-9h3.375c.621 0 1.125.504 1.125 1.125V18a2.25 2.25 0 01-2.25 2.25M16.5 7.5V18a2.25 2.25 0 002.25 2.25M16.5 7.5V4.875c0-.621-.504-1.125-1.125-1.125H4.125C3.504 3.75 3 4.254 3 4.875V18a2.25 2.25 0 002.25 2.25h13.5M6 7.5h3v3H6v-3z" },
                    { type: "item", id: "notifications", label: "Notifications", badge: "notifications", icon: "M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0018 9.75v-.7V9A6 6 0 006 9v.05.7a8.967 8.967 0 00-2.312 6.022 23.848 23.848 0 005.454 1.31m5.715 0a24.255 24.255 0 01-5.715 0m5.715 0a3 3 0 11-5.715 0" },
                ],
            },
            {
                group: "ACCOUNT",
                items: [
                    { type: "item", id: "settings", label: "Settings", icon: "M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.431l-1.003.827c-.293.24-.438.613-.431.992a6.759 6.759 0 010 .255c-.007.378.138.75.43.99l1.005.828c.424.35.534.954.26 1.43l-1.298 2.247a1.125 1.125 0 01-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.57 6.57 0 01-.22.128c-.331.183-.581.495-.644.869l-.213 1.28c-.09.543-.56.941-1.11.941h-2.594c-.55 0-1.02-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 01-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 01-1.369-.49l-1.297-2.247a1.125 1.125 0 01.26-1.431l1.004-.827c.292-.24.437-.613.43-.992a6.932 6.932 0 010-.255c.007-.378-.138-.75-.43-.99l-1.004-.828a1.125 1.125 0 01-.26-1.43l1.297-2.247a1.125 1.125 0 011.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.087.22-.128.332-.183.582-.495.644-.869l.214-1.281z M15 12a3 3 0 11-6 0 3 3 0 016 0z" },
                    {
                        type: "action",
                        id: "logout",
                        label: "LOG OUT",
                        icon: "M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9",
                        onClick: onLogout,
                        tone: "danger",
                    },
                ],
            },
        ];

        return sections;
    }, [onLogout, hubMenuLabel]);
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
                        src={theme === "light" ? "/images/Vizion_Connection_logo-bk.png" : "/images/Vizion_Connection_logo-wt.png"}
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

            <div className="px-[10px] pt-[10px]">
                <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                    className="flex items-center gap-[9px] rounded-[12px] px-3 py-[10px]"
                    style={{ background: `${roleColor}10`, border: `1px solid ${roleColor}25` }}
                >
                    <div className="relative h-9 w-9 shrink-0">
                        <span className="pointer-events-none absolute inset-0 rounded-full" style={{ border: "1px solid var(--vc-accent)", animation: "vcRing 2s ease-out infinite" }} />
                        <span className="pointer-events-none absolute inset-0 rounded-full" style={{ border: "1px solid var(--vc-accent)", animation: "vcRing 2s ease-out 1s infinite" }} />
                        <div className="relative flex h-9 w-9 items-center justify-center overflow-hidden rounded-full border-2 text-[13px] font-black" style={{ background: `${roleColor}20`, borderColor: `${roleColor}50`, color: roleColor, boxShadow: `0 0 10px ${roleColor}20` }}>
                            {profile.avatarUrl
                                ? <Image src={profile.avatarUrl} alt={profile.displayName} width={36} height={36} className="h-full w-full object-cover" />
                                : profile.displayName[0].toUpperCase()
                            }
                        </div>
                    </div>
                    <div className="min-w-0 flex-1">
                        <p className="m-0 truncate text-[12px] font-bold" style={{ color: t.text }}>{profile.displayName}</p>
                        <p className="mb-0 mt-px font-mono text-[9px] opacity-60" style={{ color: t.sub }}>@{profile.slug}</p>
                        <div className="mt-1"><PulseIndicator days={pulseDays} size="sm" /></div>
                    </div>
                    <span className="shrink-0 rounded-[4px] border px-[6px] py-[2px] font-mono text-[7px] font-black uppercase tracking-[0.08em]" style={{ background: `${roleColor}22`, color: roleColor, borderColor: `${roleColor}35` }}>
                        {ROLE_LABEL[profile.role] ?? profile.role}
                    </span>
                </motion.div>

                {(profile.role === "Business" || profile.role === "Crew" || profile.role === "Trainer" || profile.role === "Athlete" || profile.role === "Admin") && (
                    <motion.button
                        initial={{ opacity: 0, y: 4 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="mt-2 flex w-full items-center gap-2 rounded-[10px] px-3 py-[9px] text-left"
                        onClick={() => { setView("hub"); onClose(); }}
                        style={{
                            border: `1px solid ${roleColor}59`,
                            background: `linear-gradient(135deg, ${roleColor}1f, ${roleColor}0f)`,
                            cursor: "pointer",
                        }}
                    >
                        <span className="text-[14px]">⚡</span>
                        <div className="flex-1">
                            <p className="m-0 text-[10px] font-extrabold" style={{ color: roleColor }}>
                                {profile.role === "Business"
                                    ? isPaidPlan
                                        ? `現在のプラン: ${planLabel ?? "契約中"}`
                                        : "有料プランにアップグレード"
                                    : hubMenuLabel}
                            </p>
                            <p className="mb-0 mt-px font-mono text-[8px]" style={{ color: t.sub, opacity: theme === "light" ? 0.82 : 0.65 }}>
                                {profile.role === "Business"
                                    ? isPaidPlan
                                        ? "現在のHub体験を利用中"
                                        : "Hubから役割に合った価値を育てる"
                                    : "役割に応じたHubを開く"}
                            </p>
                        </div>
                        <svg width={12} height={12} fill="none" viewBox="0 0 24 24" stroke={roleColor} strokeWidth={2.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                        </svg>
                    </motion.button>
                )}
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

            <div className="sticky bottom-0 p-[10px]" style={{ background: "#09090f", borderTop: "1px solid rgba(255,255,255,0.08)", paddingBottom: "calc(10px + env(safe-area-inset-bottom) + 72px)" }}>
                <p style={{ marginBottom: 6, padding: "0 8px", fontFamily: "'Space Mono', monospace", fontSize: 10, fontWeight: 600, letterSpacing: "0.18em", textTransform: "uppercase", color: "rgba(255,255,255,0.28)" }}>Theme</p>
                <div className="mb-[10px] flex gap-1">
                    {([ ["dark", "🌑", "Dark"], ["dim", "🌒", "Dim"], ["light", "☀️", "Light"] ] as const).map(([val, emoji, lbl]) => (
                        <button
                            key={val} onClick={() => setTheme(val)} title={lbl}
                            className="flex-1 cursor-pointer rounded-[8px] border-none px-1 py-[6px] text-[12px] transition-all duration-200"
                            style={{ background: theme === val ? `${roleColor}20` : themeChipSurface, color: theme === val ? roleColor : t.sub, fontWeight: theme === val ? 700 : 400, outline: theme === val ? `1px solid ${roleColor}40` : "none" }}
                        >
                            {emoji}
                        </button>
                    ))}
                </div>

                <div className="mx-0.5 mb-2 h-px" style={{ background: t.border }} />
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
