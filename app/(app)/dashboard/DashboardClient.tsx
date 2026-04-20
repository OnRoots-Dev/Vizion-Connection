"use client";

import Image from "next/image";
import { useState, useEffect, useCallback, useRef, useSyncExternalStore } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sidebar } from "./components/Sidebar";
import { DashboardProfileView } from "./components/DashboardProfileView";
import { THEME_MAP, ROLE_COLOR } from "./types";
import type { Theme, DashboardView } from "./types";
import type { ProfileData } from "@/features/profile/types";
import { HomeView } from "./views/HomeView";
import { CardView } from "./views/CardView";
import { EditView } from "./views/EditView";
import { CheerView } from "./views/CheerView";
import { CheerGraphView } from "./views/CheerGraphView";
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
import { CollectionsView } from "./views/CollectionsView";
import { ProfilePreviewModal } from "./components/ProfilePreviewModal";
import type { CareerProfileRow } from "@/lib/supabase/career-profiles";
import { AdminPostsView } from "./views/admin/AdminPostsView";
import { OffersView } from "./views/OffersView";
import { MyJourneyView } from "./views/MyJourneyView";
import ScheduleClient from "@/app/schedule/ScheduleClient";

type DashboardNewsPost = {
    id: string;
    category: "announce" | "column" | "interview";
    title: string;
    body: string;
    author: string;
    publishedAt: string;
    imageUrl: string | null;
    viewCount: number;
};

export type { Theme, DashboardView, ThemeColors } from "./types";
const NOTIFICATION_POLL_MS = 5 * 60 * 1000;

export default function DashboardClient({
    profile: initialProfile,
    referralUrl,
    referralCount: initialReferralCount,
    ads,
    initialView = "home",
    canManageVoiceLab,
}: {
    profile: ProfileData;
    referralUrl: string;
    referralCount: number;
    ads: AdItem[];
    initialView?: DashboardView;
    canManageVoiceLab: boolean;
}) {
    const [profile, setProfile] = useState<ProfileData>(initialProfile);
    const [referralCount] = useState(initialReferralCount);
    const [view, setView] = useState<DashboardView>(initialView);
    const [viewHistory, setViewHistory] = useState<DashboardView[]>([]);
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [isMobile, setIsMobile] = useState(false);
    const [notificationUnreadCount, setNotificationUnreadCount] = useState(0);
    const [featuredNewsTop, setFeaturedNewsTop] = useState<DashboardNewsPost[]>([]);
    const [selectedProfileSlug, setSelectedProfileSlug] = useState<string | null>(null);

    const contentRef = useRef<HTMLDivElement | null>(null);
    const [careerProfileCache, setCareerProfileCache] = useState<CareerProfileRow | null | undefined>(undefined);
    useEffect(() => {
        setProfile(initialProfile);
    }, [initialProfile]);

    useEffect(() => {
        let cancelled = false;

        Promise.all([
            fetch("/api/news/posts", { cache: "no-store" }).then((res) => res.json()).catch(() => []),
            fetch("/api/notifications/unread").then((res) => res.json()).catch(() => ({ success: false, unreadCount: 0 })),
        ]).then(([, unreadData]) => {
            if (cancelled) return;

            setFeaturedNewsTop([]);
            if (unreadData.success) {
                setNotificationUnreadCount(unreadData.unreadCount ?? 0);
            }
        });

        return () => {
            cancelled = true;
        };
    }, []);

    const getThemeSnapshot = (): Theme => {
        const saved = localStorage.getItem("vz-theme") as Theme | null;
        return saved && THEME_MAP[saved] ? saved : "dark";
    };

    const getThemeServerSnapshot = (): Theme => "dark";

    const theme = useSyncExternalStore<Theme>(
        (listener) => {
            const onStorage = (event: StorageEvent) => {
                if (event.key === "vz-theme") listener();
            };
            window.addEventListener("storage", onStorage);
            return () => window.removeEventListener("storage", onStorage);
        },
        getThemeSnapshot,
        getThemeServerSnapshot,
    );

    const setTheme = useCallback((next: Theme) => {
        if (!THEME_MAP[next]) return;
        localStorage.setItem("vz-theme", next);
        window.dispatchEvent(new StorageEvent("storage", { key: "vz-theme", newValue: next }));
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
        window.scrollTo({ top: 0, behavior: "auto" });
        contentRef.current?.scrollTo({ top: 0, behavior: "auto" });
    }, [view]);

    const refreshProfile = useCallback(async () => {
        const res = await fetch("/api/profile/save/me", { cache: "no-store" });
        if (!res.ok) {
            throw new Error("Failed to refresh profile");
        }

        const json = await res.json() as { profile?: ProfileData };
        if (json.profile) {
            setProfile(json.profile);
            return json.profile;
        }

        throw new Error("Profile payload missing");
    }, []);

    const refreshCareerProfile = useCallback(async () => {
        const res = await fetch("/api/career/me", { cache: "no-store" });
        if (!res.ok) {
            throw new Error("Failed to refresh career profile");
        }

        const json = await res.json() as { careerProfile?: CareerProfileRow | null };
        const nextCareerProfile = json.careerProfile ?? null;
        setCareerProfileCache(nextCareerProfile);
        return nextCareerProfile;
    }, []);

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

    useEffect(() => {
        const onVisible = () => {
            if (document.visibilityState === "visible") {
                refreshProfile().catch(() => undefined);
            }
        };

        document.addEventListener("visibilitychange", onVisible);
        return () => {
            document.removeEventListener("visibilitychange", onVisible);
        };
    }, [refreshProfile]);

    const handleLogout = useCallback(async () => {
        await fetch("/api/logout", { method: "POST" });
        window.location.href = "/login";
    }, []);

    const goBack = useCallback(() => {
        setViewHistory((prev) => {
            const last = prev[prev.length - 1];
            if (!last) {
                setView("home");
                return prev;
            }
            setView(last);
            return prev.slice(0, -1);
        });
    }, []);

    const handleMenuSetView = useCallback((nextView: DashboardView) => {
        setViewHistory([]);
        setView(nextView);
    }, []);

    const handleSetView = useCallback((nextView: DashboardView) => {
        if (nextView === "home") {
            setViewHistory([]);
            setView("home");
            return;
        }
        if ((nextView === "profile" || nextView === "career") && careerProfileCache === undefined) {
            refreshCareerProfile().catch(() => {
                setCareerProfileCache(null);
            });
        }
        setView((current) => {
            if (current !== nextView) {
                setViewHistory((prev) => [...prev, current]);
            }
            return nextView;
        });
    }, [careerProfileCache, goBack, refreshCareerProfile]);

    const handleProfileUpdate = useCallback(async (updated?: ProfileData) => {
        if (updated) {
            setProfile(updated);
        } else {
            await refreshProfile();
        }
        handleSetView("home");
    }, [handleSetView, refreshProfile]);

    const renderView = () => {
        switch (view) {
            case "home":
                return <HomeView profile={profile} referralUrl={referralUrl} referralCount={referralCount} t={t} roleColor={roleColor} setView={handleMenuSetView} ads={ads} featuredNewsTop={featuredNewsTop} onOpenNews={() => { handleMenuSetView("news"); }} onOpenProfile={setSelectedProfileSlug} />;
            case "collections":
                return <CollectionsView t={t} roleColor={roleColor} setView={handleSetView} onOpenProfile={setSelectedProfileSlug} />;
            case "journey":
                return <MyJourneyView t={t} roleColor={roleColor} setView={handleSetView} />;
            case "notifications":
                return <NotificationsView t={t} roleColor={roleColor} setView={handleSetView} onUnreadCountChange={setNotificationUnreadCount} />;
            case "admin_posts":
                return <AdminPostsView t={t} roleColor={roleColor} setView={handleSetView} />;
            case "card":
                return <CardView profile={profile} t={t} roleColor={roleColor} setView={handleSetView} />;
            case "profile":
                return <DashboardProfileView profile={profile} t={t} roleColor={roleColor} onBack={goBack} setView={handleSetView} careerProfile={careerProfileCache} />;
            case "schedule":
                return <ScheduleClient profile={profile} embedded onBack={goBack} t={t} roleColor={roleColor} />;
            case "news":
                return <NewsView t={t} roleColor={roleColor} setView={handleSetView} />;
            case "offers":
                return <OffersView t={t} roleColor={roleColor} setView={handleSetView} />;
            case "voicelab":
                return <VoiceLabView t={t} roleColor={roleColor} setView={handleSetView} ads={ads} canManageVoiceLab={canManageVoiceLab} />;
            case "edit":
                return <EditView profile={profile} t={t} roleColor={roleColor} onBack={goBack} onSave={handleProfileUpdate} />;
            case "cheer":
                return <CheerView profile={profile} t={t} roleColor={roleColor} setView={handleSetView} />;
            case "cheer_graph":
                return <CheerGraphView profile={profile} t={t} roleColor={roleColor} setView={handleSetView} onBack={goBack} />;
            case "career":
                return <CareerSPAWrapper profile={profile} t={t} roleColor={roleColor} setView={handleSetView} careerCache={careerProfileCache} />;
            case "discovery":
                return <DiscoveryView t={t} roleColor={roleColor} setView={handleSetView} ads={ads} onOpenProfile={setSelectedProfileSlug} />;
            case "hub":
            case "business":
                return <BusinessView profile={profile} referralUrl={referralUrl} t={t} roleColor={roleColor} setView={handleSetView} onProfilePatch={(patch) => setProfile((prev) => ({ ...prev, ...patch }))} ads={ads} canManageAdmin={canManageVoiceLab} />;
            case "referral":
                return <ReferralView profile={profile} referralUrl={referralUrl} referralCount={referralCount} t={t} roleColor={roleColor} setView={handleSetView} />;
            case "settings":
                return <SettingsView profile={profile} t={t} roleColor={roleColor} onBack={goBack} onLogout={handleLogout} onProfilePatch={(patch) => setProfile((prev) => ({ ...prev, ...patch }))} />;
            case "missions":
                return <MissionsView profile={profile} referralCount={referralCount} t={t} roleColor={roleColor} setView={handleSetView} onProfilePatch={(patch) => setProfile((prev) => ({ ...prev, ...patch }))} />;
            case "roadmap":
                return <RoadmapView t={t} roleColor={roleColor} setView={handleSetView} />;
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

            <div style={{ minHeight: "100vh", background: t.bg, color: t.text, fontFamily: "'Noto Sans JP', sans-serif", transition: "background 0.3s, color 0.3s", ["--vz-text" as string]: t.text, ["--vz-sub" as string]: t.sub, ["--vz-surface" as string]: t.surface, ["--vz-border" as string]: t.border }}>
                <ProfilePreviewModal slug={selectedProfileSlug} onClose={() => setSelectedProfileSlug(null)} />
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
                                    setView={(v) => { handleMenuSetView(v); setSidebarOpen(false); }}
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
                                <button type="button" aria-label="Open sidebar" title="Open sidebar" onClick={() => setSidebarOpen(true)} style={{ background: "none", border: "none", color: t.text, cursor: "pointer", padding: 4 }}>
                                    <svg width={20} height={20} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" /></svg>
                                </button>
                                <Image src={theme === "light" ? "/images/Vizion_Connection_logo-bk.png" : "/images/Vizion_Connection_logo-wt.png"} alt="Vizion" width={160} height={42} priority style={{ height: 42, width: "auto" }} />
                                <div style={{ width: 20 }} />
                            </div>
                        )}

                        <div ref={contentRef} style={{ flex: 1, maxWidth: 1180, width: "100%", margin: "0 auto", padding: isMobile ? "16px 12px" : "20px 20px" }}>
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


