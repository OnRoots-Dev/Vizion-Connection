"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { BottomNav } from "./dashboard/components/bottom-nav/BottomNav";
import { useVzTheme } from "./dashboard/components/bottom-nav/useVzTheme";
import { ROLE_COLOR } from "./dashboard/types";

const APP_MENU = [
    { href: "/dashboard", label: "Dashboard", short: "Home" },
    { href: "/pulse", label: "Pulse", short: "Pulse" },
    { href: "/timeline", label: "Timeline", short: "Timeline" },
    { href: "/news-rooms", label: "News Rooms", short: "News" },
    { href: "/schedule", label: "Schedule", short: "Schedule" },
];

function AppAccordionHeader({ role, pathname }: { role: string | null; pathname: string }) {
    const [open, setOpen] = useState(false);
    const [expandedSection, setExpandedSection] = useState<string | null>("navigation");
    const roleColor = role ? ROLE_COLOR[role as keyof typeof ROLE_COLOR] ?? "#a78bfa" : "#a78bfa";

    return (
        <header
            className="sticky top-0 z-40 border-b border-white/10"
            style={{
                background: "rgba(10, 10, 12, 0.82)",
                backdropFilter: "blur(18px)",
                WebkitBackdropFilter: "blur(18px)",
            }}
        >
            <div className="mx-auto flex max-w-[1400px] items-center justify-between gap-3 px-4 py-3 sm:px-6">
                <div className="flex items-center gap-3 min-w-0">
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 bg-white/5 font-black text-[12px]" style={{ color: roleColor }}>
                        VC
                    </div>
                    <div className="min-w-0">
                        <div className="font-mono text-[9px] uppercase tracking-[0.22em] text-white/45">Vizion</div>
                        <div className="truncate text-[12px] font-bold text-white">Menu</div>
                    </div>
                </div>

                <button
                    type="button"
                    aria-label="Open app menu"
                    aria-expanded={open}
                    onClick={() => setOpen((v) => !v)}
                    className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-white transition active:scale-[0.98]"
                >
                    <span className="relative block h-4 w-4">
                        <span className={`absolute left-0 right-0 top-0 h-[2px] rounded-full bg-white transition ${open ? "translate-y-[6px] rotate-45" : ""}`} />
                        <span className={`absolute left-0 right-0 top-[6px] h-[2px] rounded-full bg-white transition ${open ? "opacity-0" : "opacity-100"}`} />
                        <span className={`absolute left-0 right-0 top-[12px] h-[2px] rounded-full bg-white transition ${open ? "-translate-y-[6px] -rotate-45" : ""}`} />
                    </span>
                </button>
            </div>

            {open && (
                <div className="border-t border-white/10 px-4 py-3 sm:px-6">
                    <div className="mx-auto max-w-[1400px] space-y-3">
                        <div className="rounded-2xl border border-white/10 bg-white/5 p-2">
                            <button
                                type="button"
                                onClick={() => setExpandedSection((v) => (v === "navigation" ? null : "navigation"))}
                                className="flex w-full items-center justify-between rounded-xl px-3 py-2 text-left text-[11px] font-bold uppercase tracking-[0.18em] text-white/70"
                            >
                                <span>Navigation</span>
                                <span className={`transition ${expandedSection === "navigation" ? "rotate-180" : ""}`}>▼</span>
                            </button>

                            {expandedSection === "navigation" && (
                                <div className="mt-2 space-y-1.5">
                                    {APP_MENU.map((item) => {
                                        const isActive = pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href));
                                        return (
                                            <Link
                                                key={item.href}
                                                href={item.href}
                                                onClick={() => setOpen(false)}
                                                className="flex items-center justify-between rounded-xl border px-3 py-2.5 text-[13px] font-medium transition"
                                                style={{
                                                    background: isActive ? `${roleColor}18` : "transparent",
                                                    borderColor: isActive ? `${roleColor}40` : "rgba(255,255,255,0.08)",
                                                    color: isActive ? roleColor : "rgba(255,255,255,0.8)",
                                                }}
                                            >
                                                <span>{item.label}</span>
                                                <span className="font-mono text-[9px] uppercase tracking-[0.12em] text-white/50">{item.short}</span>
                                            </Link>
                                        );
                                    })}
                                </div>
                            )}
                        </div>

                        <div className="rounded-2xl border border-white/10 bg-white/5 p-2">
                            <button
                                type="button"
                                onClick={() => setExpandedSection((v) => (v === "account" ? null : "account"))}
                                className="flex w-full items-center justify-between rounded-xl px-3 py-2 text-left text-[11px] font-bold uppercase tracking-[0.18em] text-white/70"
                            >
                                <span>Account</span>
                                <span className={`transition ${expandedSection === "account" ? "rotate-180" : ""}`}>▼</span>
                            </button>

                            {expandedSection === "account" && (
                                <div className="mt-2 space-y-1.5">
                                    <Link href="/dashboard" onClick={() => setOpen(false)} className="block rounded-xl border border-white/10 px-3 py-2.5 text-[13px] text-white/80">Profile</Link>
                                    <Link href="/dashboard/setting" onClick={() => setOpen(false)} className="block rounded-xl border border-white/10 px-3 py-2.5 text-[13px] text-white/80">Settings</Link>
                                    <button
                                        type="button"
                                        onClick={async () => {
                                            setOpen(false);
                                            await fetch("/api/logout", { method: "POST", credentials: "same-origin" });
                                            window.location.href = "/login";
                                        }}
                                        className="block w-full rounded-xl border border-red-500/30 bg-red-500/10 px-3 py-2.5 text-left text-[13px] text-red-300"
                                    >
                                        Logout
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </header>
    );
}

// 認証エリア（app/(app)/*）共通シェル。children の下に BottomNav をぶら下げる。
//
//   AppShell
//    ├ children
//    └ BottomNav（グローバルモード）
//
// /dashboard は DashboardClient が自前の SPA 連動 BottomNav を描画するため、
// 二重表示と SPA 挙動の破壊を避けて AppShell 側のグローバル nav は抑制する。
export function AppShell({ role, children }: { role: string | null; children: React.ReactNode }) {
    const pathname = usePathname();
    const { theme, t } = useVzTheme();
    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
        const check = () => setIsMobile(window.innerWidth < 1024);
        check();
        window.addEventListener("resize", check);
        return () => window.removeEventListener("resize", check);
    }, []);

    // /dashboard は自前 nav・未ログイン(role=null)・デスクトップでは出さない
    const showNav = Boolean(role) && isMobile && pathname !== "/dashboard";
    const showAppHeader = Boolean(role) && pathname !== "/dashboard";
    const roleColor = role ? ROLE_COLOR[role as keyof typeof ROLE_COLOR] ?? "#a78bfa" : "#a78bfa";

    return (
        <>
            {showAppHeader && <AppAccordionHeader role={role} pathname={pathname} />}
            {children}
            {showNav && (
                <>
                    {/* 固定バーに最終コンテンツが隠れないようスペーサーを差し込む */}
                    <div aria-hidden style={{ height: "calc(60px + env(safe-area-inset-bottom))" }} />
                    <BottomNav role={role as string} t={t} theme={theme} roleColor={roleColor} />
                </>
            )}
        </>
    );
}
