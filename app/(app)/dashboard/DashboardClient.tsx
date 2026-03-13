"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Sidebar } from "./components/Sidebar";
import { MainArea } from "./components/MainArea";
import { RightPanel } from "./components/RightPanel";
import type { ProfileData } from "@/features/profile/types";

interface Props {
    profile: ProfileData;
    referralUrl: string;
    referralCount: number;
}

export type Theme = "dark" | "dim" | "light";
export type DashboardView = "home" | "edit" | "settings";

const THEMES: Record<Theme, { bg: string; surface: string; border: string; text: string; sub: string }> = {
    dark: { bg: "#07070e", surface: "#0d0d1a", border: "rgba(255,255,255,0.07)", text: "#ffffff", sub: "rgba(255,255,255,0.45)" },
    dim: { bg: "#1a1b2e", surface: "#222336", border: "rgba(255,255,255,0.1)", text: "#e8e8f0", sub: "rgba(232,232,240,0.5)" },
    light: { bg: "#f0f2f5", surface: "#ffffff", border: "rgba(0,0,0,0.09)", text: "#0d0d1a", sub: "rgba(13,13,26,0.5)" },
};

export function DashboardClient({ profile, referralUrl, referralCount }: Props) {
    const [currentProfile, setCurrentProfile] = useState(profile);
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [rightPanelOpen, setRightPanelOpen] = useState(false);
    const [view, setView] = useState<DashboardView>("home");
    const [theme, setTheme] = useState<Theme>("dark");
    const router = useRouter();
    const t = THEMES[theme];

    async function handleLogout() {
        await fetch("/api/logout", { method: "POST" });
        router.replace("/login");
    }

    return (
        <div style={{ height: "100vh", overflow: "hidden", background: t.bg, color: t.text, display: "flex", position: "relative" }}>

            <style>{`
        * { scrollbar-width: none; -ms-overflow-style: none; box-sizing: border-box; }
        *::-webkit-scrollbar { display: none; }
        .sidebar-static { display: flex !important; }
        .right-static { display: flex !important; }
        .mobile-bar { display: none !important; }
        @media (max-width: 900px) {
          .sidebar-static { display: none !important; }
          .right-static { display: none !important; }
          .mobile-bar { display: flex !important; }
        }
        a { text-decoration: none; color: inherit; }
      `}</style>

            {/* ── Mobile overlay (left) ── */}
            {sidebarOpen && (
                <div onClick={() => setSidebarOpen(false)} style={{ position: "fixed", inset: 0, zIndex: 100, background: "rgba(0,0,0,0.75)", backdropFilter: "blur(4px)" }} />
            )}
            {/* ── Mobile overlay (right) ── */}
            {rightPanelOpen && (
                <div onClick={() => setRightPanelOpen(false)} style={{ position: "fixed", inset: 0, zIndex: 100, background: "rgba(0,0,0,0.75)", backdropFilter: "blur(4px)" }} />
            )}

            {/* ── Mobile left drawer ── */}
            <div style={{ position: "fixed", top: 0, left: 0, bottom: 0, width: "260px", zIndex: 110, transform: sidebarOpen ? "translateX(0)" : "translateX(-100%)", transition: "transform 0.28s cubic-bezier(0.4,0,0.2,1)" }}>
                <Sidebar profile={currentProfile} onClose={() => setSidebarOpen(false)} onLogout={handleLogout} theme={theme} setTheme={setTheme} t={t} view={view} setView={setView} />
            </div>

            {/* ── Mobile right drawer ── */}
            <div style={{ position: "fixed", top: 0, right: 0, bottom: 0, width: "280px", zIndex: 110, transform: rightPanelOpen ? "translateX(0)" : "translateX(100%)", transition: "transform 0.28s cubic-bezier(0.4,0,0.2,1)" }}>
                <RightPanel profile={currentProfile} referralCount={referralCount} onLogout={handleLogout} t={t} onEditProfile={() => { setView("edit"); setRightPanelOpen(false); }} />
            </div>

            {/* ── Desktop LEFT sidebar ── */}
            <div className="sidebar-static" style={{ width: "220px", flexShrink: 0, height: "100vh", overflowY: "auto", flexDirection: "column" }}>
                <Sidebar profile={currentProfile} onClose={() => setSidebarOpen(false)} onLogout={handleLogout} theme={theme} setTheme={setTheme} t={t} view={view} setView={setView} />
            </div>

            {/* ── CENTER ── */}
            <main style={{ flex: 1, overflowY: "auto", minWidth: 0, borderLeft: `1px solid ${t.border}`, borderRight: `1px solid ${t.border}` }}>

                {/* Mobile topbar */}
                <div className="mobile-bar" style={{ position: "sticky", top: 0, zIndex: 30, alignItems: "center", justifyContent: "space-between", padding: "12px 16px", background: t.bg, borderBottom: `1px solid ${t.border}`, backdropFilter: "blur(16px)" }}>
                    <button title="メニューを開く" onClick={() => setSidebarOpen(true)} style={{ padding: "7px", borderRadius: "9px", background: "rgba(255,255,255,0.07)", border: `1px solid ${t.border}`, cursor: "pointer", display: "flex" }}>
                        <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke={t.sub} strokeWidth={1.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
                        </svg>
                    </button>
                    <img src="/images/Vizion_Connection_logo-wt.png" alt="Vizion Connection" style={{ height: "26px", width: "auto" }} />
                    <button title="右パネルを開く" onClick={() => setRightPanelOpen(true)} style={{ padding: "7px", borderRadius: "9px", background: "rgba(255,255,255,0.07)", border: `1px solid ${t.border}`, cursor: "pointer", display: "flex" }}>
                        <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke={t.sub} strokeWidth={1.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
                        </svg>
                    </button>
                </div>

                <div style={{ maxWidth: "640px", margin: "0 auto", padding: "28px 20px", display: "flex", flexDirection: "column", gap: "20px" }}>
                    <MainArea profile={currentProfile} referralUrl={referralUrl} referralCount={referralCount} t={t} view={view} setView={setView} onProfileUpdate={setCurrentProfile} />
                </div>
            </main>

            {/* ── Desktop RIGHT panel ── */}
            <div className="right-static" style={{ width: "260px", flexShrink: 0, height: "100vh", overflowY: "auto", flexDirection: "column" }}>
                <RightPanel profile={currentProfile} referralCount={referralCount} onLogout={handleLogout} t={t} onEditProfile={() => { setView("edit"); setRightPanelOpen(false); }} />
            </div>
        </div>
    );
}