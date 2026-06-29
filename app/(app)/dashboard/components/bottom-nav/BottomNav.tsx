"use client";

import { useCallback, useMemo } from "react";
import { usePathname, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import type { DashboardView, ThemeColors } from "../../types";
import { getPrimaryItems, type NavItem } from "./nav-config";

interface Props {
    role: string;
    view?: DashboardView;
    setView?: (v: DashboardView) => void;
    t: ThemeColors;
    theme: string;
    roleColor: string;
    notificationUnreadCount?: number;
}

// モバイル向け Bottom Navigation。5項目フラット構成。
// Home / Journey / Discovery / Notifications（未読バッジ付き） / Hub
export function BottomNav({ role, view, setView, t, theme, roleColor, notificationUnreadCount = 0 }: Props) {
    const router = useRouter();
    const pathname = usePathname();
    const items = useMemo(() => getPrimaryItems(role), [role]);
    const onDashboard = pathname === "/dashboard";

    const isActive = useCallback(
        (item: NavItem) => {
            if (item.target.kind === "route") return pathname === item.target.href;
            if (!onDashboard) return false;
            return view === item.target.view;
        },
        [pathname, view, onDashboard],
    );

    const go = useCallback(
        (item: NavItem) => {
            if (item.target.kind === "route") {
                router.push(item.target.href);
                return;
            }
            if (setView && onDashboard) {
                setView(item.target.view);
            } else {
                router.push(`/dashboard?view=${item.target.view}`);
            }
        },
        [router, setView, onDashboard],
    );

    const barBg = theme === "light" ? "rgba(245,245,247,0.78)" : "rgba(11,11,15,0.72)";

    return (
        <nav
            aria-label="メインナビゲーション"
            style={{
                position: "fixed", left: 0, right: 0, bottom: 0, zIndex: 30,
                display: "flex", alignItems: "flex-start", justifyContent: "space-around",
                height: 60, paddingBottom: "env(safe-area-inset-bottom)",
                background: barBg,
                backdropFilter: "blur(20px)", WebkitBackdropFilter: "blur(20px)",
                borderTop: `1px solid ${t.border}`,
                boxShadow: "0 -4px 24px rgba(0,0,0,0.18)",
            }}
        >
            {items.map((item) => {
                const active = isActive(item);
                const badge = item.id === "notifications" && notificationUnreadCount > 0
                    ? notificationUnreadCount
                    : 0;

                // Pulse はサービスの核。中央で一段持ち上げて常時強調表示する。
                if (item.id === "pulse") {
                    return (
                        <motion.button
                            key={item.id}
                            type="button"
                            aria-label="Pulse"
                            aria-current={active ? "page" : undefined}
                            onClick={() => go(item)}
                            whileTap={{ scale: 0.9 }}
                            transition={{ type: "spring", stiffness: 500, damping: 30 }}
                            style={{
                                flex: 1, display: "flex", flexDirection: "column",
                                alignItems: "center", justifyContent: "center", gap: 3,
                                background: "none", border: "none", cursor: "pointer",
                                padding: 0, minWidth: 0, position: "relative",
                                color: roleColor,
                            }}
                        >
                            <span
                                style={{
                                    position: "relative", display: "inline-flex",
                                    alignItems: "center", justifyContent: "center",
                                    width: 46, height: 46, marginTop: -18, borderRadius: "50%",
                                    background: "linear-gradient(150deg, var(--pulse, #C8E800), var(--electric, #C8E800))",
                                    boxShadow: `0 8px 22px var(--electric-glow, rgba(200,232,0,0.45)), 0 0 0 4px ${barBg}`,
                                    color: "#000",
                                }}
                            >
                                {active && (
                                    <motion.span
                                        aria-hidden
                                        initial={{ opacity: 0.5, scale: 1 }}
                                        animate={{ opacity: 0, scale: 1.6 }}
                                        transition={{ duration: 2, repeat: Infinity, ease: "easeOut" }}
                                        style={{ position: "absolute", inset: 0, borderRadius: "50%", border: "2px solid var(--electric, #00c2ff)" }}
                                    />
                                )}
                                <svg width={24} height={24} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.2} style={{ position: "relative" }}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d={item.icon} />
                                </svg>
                            </span>
                            <span style={{
                                fontSize: 9.5, fontWeight: 800, letterSpacing: "0.02em",
                                lineHeight: 1, marginTop: -2, color: active ? roleColor : t.sub,
                            }}>
                                Pulse
                            </span>
                        </motion.button>
                    );
                }

                return (
                    <motion.button
                        key={item.id}
                        type="button"
                        aria-label={item.label}
                        aria-current={active ? "page" : undefined}
                        onClick={() => go(item)}
                        whileTap={{ scale: 0.88 }}
                        transition={{ type: "spring", stiffness: 500, damping: 30 }}
                        style={{
                            flex: 1, display: "flex", flexDirection: "column",
                            alignItems: "center", justifyContent: "center", gap: 3,
                            background: "none", border: "none", cursor: "pointer",
                            padding: "6px 0", color: active ? roleColor : t.sub,
                            opacity: active ? 1 : 0.7, minWidth: 0, position: "relative",
                        }}
                    >
                        <span style={{ position: "relative", display: "inline-flex" }}>
                            {active && (
                                <motion.span
                                    layoutId="bottomnav-active-glow"
                                    style={{
                                        position: "absolute", inset: -6, borderRadius: 999,
                                        background: `${roleColor}1f`,
                                    }}
                                />
                            )}
                            <svg
                                width={22} height={22} viewBox="0 0 24 24"
                                fill="none" stroke="currentColor"
                                strokeWidth={active ? 2.1 : 1.7}
                                style={{ position: "relative" }}
                            >
                                <path strokeLinecap="round" strokeLinejoin="round" d={item.icon} />
                            </svg>
                            {badge > 0 && (
                                <span style={{
                                    position: "absolute", top: -4, right: -6,
                                    minWidth: 16, height: 16, borderRadius: 999,
                                    background: "#FF5050", color: "#fff",
                                    fontSize: 9, fontWeight: 800, lineHeight: "16px",
                                    textAlign: "center", padding: "0 3px",
                                    pointerEvents: "none",
                                }}>
                                    {badge > 99 ? "99+" : badge}
                                </span>
                            )}
                        </span>
                        <span style={{
                            fontSize: 9.5, fontWeight: active ? 800 : 600,
                            letterSpacing: "0.02em", lineHeight: 1,
                            maxWidth: 56, overflow: "hidden",
                            textOverflow: "ellipsis", whiteSpace: "nowrap",
                        }}>
                            {item.label}
                        </span>
                    </motion.button>
                );
            })}
        </nav>
    );
}
