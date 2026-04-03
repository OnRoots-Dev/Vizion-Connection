"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sidebar } from "./components/Sidebar";
import { DashboardProfileView } from "./components/DashboardProfileView";
import { THEME_MAP, ROLE_COLOR } from "./types";
import type { Theme, DashboardView, ThemeColors } from "./types";
import type { ProfileData } from "@/features/profile/types";
import { HomeView } from "./views/HomeView";
import { CardView } from "./views/CardView";
import { EditView } from "./views/EditView";
import { CheerView } from "./views/CheerView";
import { CareerSPAWrapper } from "./views/CareerSPAWrapper";
import { DiscoveryView } from "./views/DiscoveryView";
import { ReferralView } from "./views/ReferralView";
import { MissionsView } from "./views/MissionsView";
import { RoadmapView } from "./views/RoadmapView";
import { BusinessView } from "./views/BusinessView";
import { SettingsView } from "./views/SettingsView";
import type { AdItem } from "@/lib/ads-shared";
import { NewsView } from "./views/NewsView";
import { VoiceLabView } from "./views/VoiceLabView";
import { NotificationsView } from "./views/NotificationsView";

export type { Theme, DashboardView, ThemeColors } from "./types";
const NOTIFICATION_POLL_MS = 5 * 60 * 1000;

export default function DashboardClient({
    profile: initialProfile,
    referralUrl,
    referralCount: initialReferralCount,
    ads,
}: {
    profile: ProfileData;
    referralUrl: string;
    referralCount: number;
    ads: AdItem[];
}) {
    const [profile, setProfile] = useState<ProfileData>(initialProfile);
    const [referralCount] = useState(initialReferralCount);
    const [theme, setTheme] = useState<Theme>("dark");
    const [view, setView] = useState<DashboardView>("home");
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [isMobile, setIsMobile] = useState(false);
    const [notificationUnreadCount, setNotificationUnreadCount] = useState(0);

    const careerCacheRef = useRef<any>(undefined);
    useEffect(() => {
        fetch("/api/career/me")
            .then((r) => r.json())
            .then((d) => {
                careerCacheRef.current = d.careerProfile ?? null;
            })
            .catch(() => {
                careerCacheRef.current = null;
            });
    }, []);

    const t = THEME_MAP[theme];
    const roleColor = ROLE_COLOR[profile.role] ?? "#a78bfa";

    useEffect(() => {
        const check = () => setIsMobile(window.innerWidth < 1024);
        check();
        window.addEventListener("resize", check);
        return () => window.removeEventListener("resize", check);
    }, []);

    useEffect(() => {
        const saved = localStorage.getItem("vz-theme") as Theme | null;
        if (saved && THEME_MAP[saved]) setTheme(saved);
    }, []);

    useEffect(() => {
        localStorage.setItem("vz-theme", theme);
    }, [theme]);

    const refreshNotificationUnread = useCallback(async () => {
        try {
            const res = await fetch("/api/notifications/unread");
            const data = await res.json() as { success?: boolean; unreadCount?: number };
            if (data.success) {
                setNotificationUnreadCount(data.unreadCount ?? 0);
            }
        } catch {
            // noop
        }
    }, []);

    useEffect(() => {
        refreshNotificationUnread();
        const onFocus = () => {
            refreshNotificationUnread();
        };
        const onVisible = () => {
            if (document.visibilityState === "visible") {
                refreshNotificationUnread();
            }
        };

        const timer = window.setInterval(() => {
            if (document.visibilityState === "visible") {
                refreshNotificationUnread();
            }
        }, NOTIFICATION_POLL_MS);

        window.addEventListener("focus", onFocus);
        document.addEventListener("visibilitychange", onVisible);
        return () => {
            window.clearInterval(timer);
            window.removeEventListener("focus", onFocus);
            document.removeEventListener("visibilitychange", onVisible);
        };
    }, [refreshNotificationUnread]);

    const handleLogout = useCallback(async () => {
        await fetch("/api/logout", { method: "POST" });
        window.location.href = "/login";
    }, []);

    const handleProfileUpdate = useCallback((updated: ProfileData) => {
        setProfile(updated);
        setView("home");
    }, []);

    const renderView = () => {
        switch (view) {
            case "home":
                return <HomeView profile={profile} referralUrl={referralUrl} referralCount={referralCount} t={t} roleColor={roleColor} setView={setView} ads={ads} />;
            case "notifications":
                return <NotificationsView t={t} roleColor={roleColor} setView={setView} onUnreadCountChange={setNotificationUnreadCount} />;
            case "card":
                return <CardView profile={profile} t={t} roleColor={roleColor} setView={setView} />;
            case "profile":
                return <DashboardProfileView profile={profile} t={t} roleColor={roleColor} onBack={() => setView("home")} careerProfile={careerCacheRef.current} />;
            case "news":
                return <NewsView t={t} roleColor={roleColor} setView={setView} ads={ads} />;
            case "voicelab":
                return <VoiceLabView t={t} roleColor={roleColor} setView={setView} ads={ads} />;
            case "edit":
                return <EditView profile={profile} t={t} roleColor={roleColor} onBack={() => setView("home")} onSave={handleProfileUpdate} />;
            case "cheer":
                return <CheerView profile={profile} t={t} roleColor={roleColor} setView={setView} />;
            case "career":
                return <CareerSPAWrapper profile={profile} t={t} roleColor={roleColor} setView={setView} careerCache={careerCacheRef.current} />;
            case "discovery":
                return <DiscoveryView profile={profile} t={t} roleColor={roleColor} setView={setView} ads={ads} />;
            case "business":
                return <BusinessView profile={profile} t={t} roleColor={roleColor} setView={setView} />;
            case "referral":
                return <ReferralView profile={profile} referralUrl={referralUrl} referralCount={referralCount} t={t} roleColor={roleColor} setView={setView} />;
            case "settings":
                return <SettingsView profile={profile} t={t} roleColor={roleColor} onBack={() => setView("home")} onLogout={handleLogout} />;
            case "missions":
                return <MissionsView profile={profile} referralCount={referralCount} t={t} roleColor={roleColor} setView={setView} onProfilePatch={(patch) => setProfile((prev) => ({ ...prev, ...patch }))} />;
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

            <div style={{ minHeight: "100vh", background: t.bg, color: t.text, fontFamily: "'Noto Sans JP', sans-serif", transition: "background 0.3s, color 0.3s" }}>
                <AnimatePresence>
                    {sidebarOpen && isMobile && (
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setSidebarOpen(false)} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.7)", zIndex: 40, backdropFilter: "blur(4px)" }} />
                    )}
                </AnimatePresence>

                <div style={{ display: "flex", minHeight: "100vh" }}>
                    <AnimatePresence>
                        {(!isMobile || sidebarOpen) && (
                            <motion.aside key="sidebar" initial={isMobile ? { x: -280 } : { x: 0 }} animate={{ x: 0 }} exit={isMobile ? { x: -280 } : { x: 0 }} transition={{ type: "spring", damping: 28, stiffness: 300 }} style={{ width: 220, flexShrink: 0, position: isMobile ? "fixed" : "sticky", top: 0, left: 0, height: "100vh", zIndex: isMobile ? 50 : 10, borderRight: `1px solid ${t.border}`, background: t.bg, display: "flex", flexDirection: "column", overflowY: "auto" }}>
                                <Sidebar
                                    profile={profile}
                                    view={view}
                                    setView={(v) => { setView(v); setSidebarOpen(false); }}
                                    notificationUnreadCount={notificationUnreadCount}
                                    theme={theme}
                                    setTheme={setTheme}
                                    t={t}
                                    onLogout={handleLogout}
                                    onClose={() => setSidebarOpen(false)}
                                />
                            </motion.aside>
                        )}
                    </AnimatePresence>

                    <main style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column" }}>
                        {isMobile && (
                            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 16px", borderBottom: `1px solid ${t.border}`, position: "sticky", top: 0, zIndex: 30, background: t.bg, backdropFilter: "blur(12px)" }}>
                                <button onClick={() => setSidebarOpen(true)} style={{ background: "none", border: "none", color: t.text, cursor: "pointer", padding: 4 }}>
                                    <svg width={20} height={20} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" /></svg>
                                </button>
                                <img src="/images/Vizion_Connection_logo-wt.png" alt="Vizion" style={{ height: 32, width: "auto" }} />
                                <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
                                    <motion.div animate={{ opacity: [1, 0.3, 1] }} transition={{ duration: 2, repeat: Infinity }} style={{ width: 6, height: 6, borderRadius: "50%", background: roleColor }} />
                                    <span style={{ fontSize: 9, fontFamily: "monospace", fontWeight: 700, letterSpacing: "0.12em", color: roleColor, textTransform: "uppercase" }}>Live</span>
                                </div>
                            </div>
                        )}

                        <div style={{ flex: 1, maxWidth: 860, width: "100%", margin: "0 auto", padding: isMobile ? "16px 12px" : "24px 32px" }}>
                            <AnimatePresence mode="wait">
                                <motion.div key={view} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}>
                                    {renderView()}
                                </motion.div>
                            </AnimatePresence>
                        </div>
                    </main>

                </div>
            </div>
        </>
    );
}


