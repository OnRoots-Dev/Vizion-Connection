"use client";

import { motion } from "framer-motion";
import { useMemo, useState, type CSSProperties } from "react";
import type { ProfileData } from "@/features/profile/types";
import type { Theme, DashboardView, ThemeColors } from "../DashboardClient";
import { getPlanFeatures } from "@/features/business/plan-features";

const ROLE_COLOR: Record<string, string> = {
    Athlete: "#FF5050", Trainer: "#32D278", Members: "#FFC81E", Business: "#3C8CFF",
};
const ROLE_LABEL: Record<string, string> = {
    Athlete: "ATHLETE", Trainer: "TRAINER", Members: "MEMBERS", Business: "BUSINESS",
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
    badge?: "notifications";
};

type NavSubmenu = {
    type: "submenu";
    id: string;
    label: string;
    icon: string;
    items: NavLeaf[];
};

type NavEntry = NavLeaf | NavSubmenu;

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
    const roleColor = ROLE_COLOR[profile.role] ?? "#a78bfa";
    const [openSubmenu, setOpenSubmenu] = useState<string | null>(null);
    const hubMenuLabel = getHubMenuLabel(profile.role);

    const isPaidPlan = Boolean(profile.sponsorPlan);
    const planLabel = getPlanFeatures(profile.sponsorPlan ?? null)?.badgeLabel ?? null;

    const navSections = useMemo<NavSection[]>(() => {
        const sections: NavSection[] = [
            {
                group: "CORE",
                items: [
                    { type: "item", id: "home", label: "Dashboard", icon: "M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" },
                    { type: "item", id: "notifications", label: "Notifications", icon: "M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0018 9.75v-.7V9A6 6 0 006 9v.05.7a8.967 8.967 0 00-2.312 6.022 23.848 23.848 0 005.454 1.31m5.715 0a24.255 24.255 0 01-5.715 0m5.715 0a3 3 0 11-5.715 0", badge: "notifications" },
                ],
            },
            {
                group: "PROFILE",
                items: [
                    { type: "item", id: "profile", label: "Profile", icon: "M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" },
                    { type: "item", id: "journey", label: "My Journey", icon: "M3.75 6.75h16.5m-16.5 5.25h10.5m-10.5 5.25h16.5" },
                    { type: "item", id: "schedule", label: "Schedule", icon: "M8.25 3.75V6m7.5-2.25V6M3.75 8.25h16.5M5.25 5.25h13.5A1.5 1.5 0 0120.25 6.75v11.25a1.5 1.5 0 01-1.5 1.5H5.25a1.5 1.5 0 01-1.5-1.5V6.75a1.5 1.5 0 011.5-1.5z" },
                    { type: "item", id: "collections", label: "Collection", icon: "M3 7.5A2.25 2.25 0 015.25 5.25h13.5A2.25 2.25 0 0121 7.5v9a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 16.5v-9zM7.5 9.75h9m-9 3h6" },
                    { type: "item", id: "cheer", label: "Cheer", icon: "M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z" },
                ],
            },
            {
                group: "COMMUNITY",
                items: [
                    {
                        type: "submenu",
                        id: "community",
                        label: "Community",
                        icon: "M18 18.72a9.094 9.094 0 003.742-.479 3 3 0 00-4.682-3.11m.94 3.59a5.996 5.996 0 00-1.94-.596m0 0a5.995 5.995 0 00-1.94.596m3.88 0a5.995 5.995 0 01-3.88 0m0 0a3 3 0 00-4.682 3.11A9.094 9.094 0 006 18.72m12 0a9 9 0 10-12 0",
                        items: [
                            { type: "item", id: "discovery", label: "Discovery", icon: "M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" },
                            { type: "item", id: "news", label: "News Rooms", icon: "M19.5 4.5h-15a2.25 2.25 0 00-2.25 2.25v10.5A2.25 2.25 0 004.5 19.5h15a2.25 2.25 0 002.25-2.25V6.75A2.25 2.25 0 0019.5 4.5zM6.75 8.25h10.5m-10.5 3h10.5m-10.5 3h6" },
                            { type: "item", id: "voicelab", label: "Voice Lab", icon: "M7.5 3.75h9a3 3 0 013 3v9a3 3 0 01-3 3h-9a3 3 0 01-3-3v-9a3 3 0 013-3zm3 4.5h3m-4.5 4.5h6m-6 4.5h4.5" },
                            { type: "item", id: "roadmap", label: "Roadmap", icon: "M3.75 3v17.25m0 0H21m-13.5-3.75v3.75m5.25-7.5v7.5m5.25-11.25v11.25" },
                        ],
                    },
                ],
            },
            {
                group: "CHALLENGE",
                items: [
                    {
                        type: "submenu",
                        id: "challenge",
                        label: "Challenge",
                        icon: "M12 6v6l4 2.5M21 12a9 9 0 11-18 0 9 9 0 0118 0z",
                        items: [
                            { type: "item", id: "missions", label: "Missions", icon: "M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" },
                            { type: "item", id: "referral", label: "Referral", icon: "M13.19 8.688a4.5 4.5 0 011.242 7.244l-4.5 4.5a4.5 4.5 0 01-6.364-6.364l1.757-1.757m13.35-.622l1.757-1.757a4.5 4.5 0 00-6.364-6.364l-4.5 4.5a4.5 4.5 0 001.242 7.244" },
                        ],
                    },
                ],
            },
        ];

        return sections;
    }, [profile.role]);

    const isSubmenuOpen = (submenuId: string) => openSubmenu === submenuId;

    const itemStyle = (active: boolean): CSSProperties => ({
        background: active ? `${roleColor}15` : "transparent",
        color: active ? roleColor : t.sub,
        fontWeight: active ? 700 : 500,
        border: active ? `1px solid ${roleColor}30` : "1px solid transparent",
        cursor: "pointer",
        opacity: active ? 1 : 0.76,
        transition: "all 0.15s ease",
    });

    function renderLeaf(item: NavLeaf, nested = false) {
        const active = view === item.id;
        return (
            <button
                key={item.id}
                onClick={() => { setView(item.id); onClose(); }}
                className={`${NAV_ITEM_BASE} ${nested ? "mb-1 pl-[18px]" : ""}`}
                style={{
                    ...itemStyle(active),
                    background: active ? `${roleColor}18` : nested ? "rgba(255,255,255,0.02)" : "transparent",
                    border: active ? `1px solid ${roleColor}30` : nested ? `1px solid ${t.border}` : "1px solid transparent",
                }}
            >
                {active && (
                    <div className="absolute bottom-[25%] left-0 top-[25%] w-0.5 rounded-[99px]" style={{ background: roleColor, boxShadow: `0 0 6px ${roleColor}` }} />
                )}
                <svg width={14} height={14} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={active ? 2.2 : 1.75}>
                    <path strokeLinecap="round" strokeLinejoin="round" d={item.icon} />
                </svg>
                <span>{item.label}</span>
                {item.badge === "notifications" && notificationUnreadCount > 0 && (
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
            </button>
        );
    }

    function renderEntry(entry: NavEntry) {
        if (entry.type === "item") {
            return renderLeaf(entry);
        }

        const childActive = entry.items.some((item) => item.id === view);
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
                        <div className="absolute bottom-[25%] left-0 top-[25%] w-0.5 rounded-[99px]" style={{ background: roleColor, boxShadow: `0 0 6px ${roleColor}` }} />
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
                <img src={theme === "light" ? "/images/Vizion_Connection_logo-bk.png" : "/images/Vizion_Connection_logo-wt.png"} alt="Vizion Connection" className="h-[44px] w-auto" />
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
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-full border-2 text-[13px] font-black" style={{ background: `${roleColor}20`, borderColor: `${roleColor}50`, color: roleColor, boxShadow: `0 0 10px ${roleColor}20` }}>
                        {profile.avatarUrl
                            ? <img src={profile.avatarUrl} alt={profile.displayName} className="h-full w-full object-cover" />
                            : profile.displayName[0].toUpperCase()
                        }
                    </div>
                    <div className="min-w-0 flex-1">
                        <p className="m-0 truncate text-[12px] font-bold" style={{ color: t.text }}>{profile.displayName}</p>
                        <p className="mb-0 mt-px font-mono text-[9px] opacity-60" style={{ color: t.sub }}>@{profile.slug}</p>
                    </div>
                    <span className="shrink-0 rounded-[4px] border px-[6px] py-[2px] font-mono text-[7px] font-black uppercase tracking-[0.08em]" style={{ background: `${roleColor}22`, color: roleColor, borderColor: `${roleColor}35` }}>
                        {ROLE_LABEL[profile.role] ?? profile.role}
                    </span>
                </motion.div>

                {(profile.role === "Business" || profile.role === "Members" || profile.role === "Trainer" || profile.role === "Athlete" || profile.role === "Admin") && (
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
                            <p className="mb-0 mt-px font-mono text-[8px]" style={{ color: "rgba(255,255,255,0.35)" }}>
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

            <nav className="flex-1 overflow-y-auto px-[10px] pt-[10px]">
                {navSections.map(({ group, items }) => (
                    <motion.div
                        key={group}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="mb-4"
                    >
                        <p className="mb-1 px-[10px] font-mono text-[8px] font-black uppercase tracking-[0.22em] opacity-35" style={{ color: t.sub }}>
                            {group}
                        </p>
                        {items.map((entry) => renderEntry(entry))}
                    </motion.div>
                ))}
            </nav>

            <div className="p-[10px]" style={{ borderTop: `1px solid ${t.border}` }}>
                <p className="mb-[6px] px-2 font-mono text-[8px] font-black uppercase tracking-[0.2em] opacity-30" style={{ color: t.sub }}>Theme</p>
                <div className="mb-[10px] flex gap-1">
                    {([ ["dark", "🌑", "Dark"], ["dim", "🌒", "Dim"], ["light", "☀️", "Light"] ] as const).map(([val, emoji, lbl]) => (
                        <button
                            key={val} onClick={() => setTheme(val)} title={lbl}
                            className="flex-1 cursor-pointer rounded-[8px] border-none px-1 py-[6px] text-[12px] transition-all duration-200"
                            style={{ background: theme === val ? `${roleColor}20` : "rgba(255,255,255,0.04)", color: theme === val ? roleColor : t.sub, fontWeight: theme === val ? 700 : 400, outline: theme === val ? `1px solid ${roleColor}40` : "none" }}
                        >
                            {emoji}
                        </button>
                    ))}
                </div>

                <div className="mx-0.5 mb-2 h-px" style={{ background: t.border }} />

                <a href={`/u/${profile.slug}`} target="_blank" rel="noopener noreferrer" className="mb-0.5 flex items-center gap-[9px] rounded-[9px] px-[10px] py-2 text-[12px] no-underline transition-all duration-150" style={{ color: t.sub, opacity: 0.7 }}>
                    <svg width={13} height={13} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
                    </svg>
                    公開プロフィール
                </a>

                <button onClick={() => { setView("edit"); onClose(); }} className="mb-0.5 flex w-full cursor-pointer items-center gap-[9px] rounded-[9px] bg-transparent px-[10px] py-2 text-left text-[12px] font-semibold transition-all duration-150" style={{ border: `1px solid ${t.border}`, color: t.sub }}>
                    <svg width={13} height={13} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931z" />
                    </svg>
                    プロフィール編集
                </button>

                <button onClick={() => { setView("settings"); onClose(); }} className="mb-[6px] flex w-full cursor-pointer items-center gap-[9px] rounded-[9px] bg-transparent px-[10px] py-2 text-left text-[12px] font-semibold transition-all duration-150" style={{ border: `1px solid ${t.border}`, color: t.sub }}>
                    <svg width={13} height={13} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.431l-1.003.827c-.293.24-.438.613-.431.992a6.759 6.759 0 010 .255c-.007.378.138.75.43.99l1.005.828c.424.35.534.954.26 1.43l-1.298 2.247a1.125 1.125 0 01-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.57 6.57 0 01-.22.128c-.331.183-.581.495-.644.869l-.213 1.28c-.09.543-.56.941-1.11.941h-2.594c-.55 0-1.02-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 01-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 01-1.369-.49l-1.297-2.247a1.125 1.125 0 01.26-1.431l1.004-.827c.292-.24.437-.613.43-.992a6.932 6.932 0 010-.255c.007-.378-.138-.75-.43-.99l-1.004-.828a1.125 1.125 0 01-.26-1.43l1.297-2.247a1.125 1.125 0 011.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.087.22-.128.332-.183.582-.495.644-.869l.214-1.281z" />
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    アカウント設定
                </button>

                <div className="mx-0.5 mb-[6px] h-px" style={{ background: t.border }} />

                <button onClick={onLogout} className="flex w-full cursor-pointer items-center gap-[9px] rounded-[9px] border-none bg-transparent px-[10px] py-2 text-[12px] transition-colors duration-150" style={{ color: "rgba(255,80,80,0.5)" }}>
                    <svg width={13} height={13} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9" />
                    </svg>
                    ログアウト
                </button>
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
            <div className="rounded-[12px] border p-[6px]" style={{ borderColor: t.border, background: `linear-gradient(180deg, ${roleColor}08, rgba(255,255,255,0.01))` }}>
                {children}
            </div>
        </motion.div>
    );
}
