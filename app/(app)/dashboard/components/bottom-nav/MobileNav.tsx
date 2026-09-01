"use client";

// dashboard/components/bottom-nav/MobileNav.tsx
// WORLD 最適化モバイルナビ — 5項目固定（中央 CREATE 持ち上げ）。
//   HOME / MOMENT / CREATE(中央+) / MAP / YOU
// 中央 CREATE は ActionSheet を開き、既存の活動導線へ遷移（機能は追加しない）。

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { DashboardView, ThemeColors } from "../../types";

const ACCENT = "#C8E800";

const ITEMS: { id: string; label: string; view: DashboardView; icon: string }[] = [
    {
        id: "home", label: "HOME", view: "home",
        icon: "M3 10.5 12 3l9 7.5M5 8.5V21h5v-6h4v6h5V8.5",
    },
    {
        id: "moments", label: "MOMENT", view: "moments",
        icon: "M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2zM12 17a4 4 0 1 0 0-8 4 4 0 0 0 0 8z",
    },
    {
        id: "map", label: "MAP", view: "viz_map",
        icon: "M9 20l-6-3V4l6 3m0 13 6-3M9 20V7m6 10 6-3V4l-6 3m0 10V7m-6 0 6-3",
    },
    {
        id: "profile", label: "YOU", view: "profile",
        icon: "M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z",
    },
];

const CREATE_ACTIONS: { label: string; desc: string; view: DashboardView; icon: string }[] = [
    {
        label: "Activityを記録", desc: "練習・試合を記録する",
        view: "activities",
        icon: "M6 3v12m0-6h6a3 3 0 0 0 0-6H6zm12 18v-9m0 0V6m0 6a0 0 0 0 1 0 0",
    },
    {
        label: "Momentを投稿", desc: "「今」を世界に共有する",
        view: "moments",
        icon: "M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2zM12 17a4 4 0 1 0 0-8 4 4 0 0 0 0 8z",
    },
    {
        label: "募集Activity", desc: "一緒にやる人を募る",
        view: "activities",
        icon: "M16 11V7a4 4 0 0 0-8 0v4M5 9h14l1 12H4L5 9z",
    },
];

export function MobileNav({ view, setView, t }: {
    view: DashboardView;
    setView: (v: DashboardView) => void;
    t: ThemeColors;
}) {
    const [createOpen, setCreateOpen] = useState(false);

    const select = (v: DashboardView) => {
        setCreateOpen(false);
        setView(v);
    };

    const isCurrent = (v: DashboardView) => view === v;

    return (
        <>
            <nav
                aria-label="メインナビゲーション"
                style={{
                    position: "fixed", left: 0, right: 0, bottom: 0, zIndex: 60,
                    display: "flex", alignItems: "flex-start", justifyContent: "space-around",
                    height: 60, paddingBottom: "env(safe-area-inset-bottom)",
                    background: "rgba(11,11,15,0.82)",
                    backdropFilter: "blur(20px)", WebkitBackdropFilter: "blur(20px)",
                    borderTop: `1px solid ${t.border}`,
                    boxShadow: "0 -4px 24px rgba(0,0,0,0.24)",
                }}
            >
                {ITEMS.map((item) => {
                    const active = isCurrent(item.view);
                    return (
                        <motion.button
                            key={item.id}
                            type="button"
                            aria-label={item.label}
                            aria-current={active ? "page" : undefined}
                            onClick={() => select(item.view)}
                            whileTap={{ scale: 0.88 }}
                            transition={{ type: "spring", stiffness: 500, damping: 30 }}
                            style={{
                                flex: 1, display: "flex", flexDirection: "column",
                                alignItems: "center", justifyContent: "center", gap: 3,
                                background: "none", border: "none", cursor: "pointer",
                                padding: "9px 0", color: active ? ACCENT : t.sub,
                                opacity: active ? 1 : 0.75, minWidth: 0, position: "relative",
                            }}
                        >
                            <span style={{ position: "relative", display: "inline-flex" }}>
                                {active && (
                                    <motion.span
                                        layoutId="mobilenav-active-glow"
                                        style={{
                                            position: "absolute", inset: -6, borderRadius: 999,
                                            background: `${ACCENT}1f`,
                                        }}
                                    />
                                )}
                                <svg width={22} height={22} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={active ? 2.1 : 1.7} strokeLinecap="round" strokeLinejoin="round" style={{ position: "relative" }}>
                                    <path d={item.icon} />
                                </svg>
                            </span>
                            <span style={{ fontSize: 9, fontWeight: active ? 800 : 600, letterSpacing: "0.05em", lineHeight: 1 }}>
                                {item.label}
                            </span>
                        </motion.button>
                    );
                })}
            </nav>

            {/* ← CREATE（中央持ち上げ） */}
            <div style={{
                position: "fixed", left: 0, right: 0, bottom: 0, zIndex: 61,
                display: "flex", justifyContent: "center", pointerEvents: "none",
                height: 60, paddingBottom: "env(safe-area-inset-bottom)",
            }}>
                <motion.button
                    type="button"
                    aria-label="Create"
                    onClick={() => setCreateOpen((o) => !o)}
                    whileTap={{ scale: 0.9 }}
                    transition={{ type: "spring", stiffness: 500, damping: 30 }}
                    style={{
                        pointerEvents: "auto",
                        width: 54, height: 54, marginBottom: 6, borderRadius: "50%",
                        background: "linear-gradient(150deg, #fff5b0, #C8E800 55%, #9fc400)",
                        boxShadow: "0 8px 26px rgba(200,232,0,0.45), 0 0 0 5px rgba(11,11,15,1)",
                        color: "#0b0b0f", display: "grid", placeItems: "center",
                        border: "none", cursor: "pointer",
                    }}
                >
                    <motion.svg
                        animate={{ rotate: createOpen ? 45 : 0 }}
                        width={26} height={26} viewBox="0 0 24 24" fill="none"
                        stroke="currentColor" strokeWidth={2.6} strokeLinecap="round"
                    >
                        <path d="M12 5v14M5 12h14" />
                    </motion.svg>
                </motion.button>
            </div>

            {/* ← ActionSheet */}
            <AnimatePresence>
                {createOpen && (
                    <>
                        <motion.div
                            key="create-backdrop"
                            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                            onClick={() => setCreateOpen(false)}
                            style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)", zIndex: 70, backdropFilter: "blur(3px)" }}
                        />
                        <motion.div
                            key="create-sheet"
                            initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }}
                            transition={{ type: "spring", stiffness: 300, damping: 32 }}
                            style={{
                                position: "fixed", left: 0, right: 0, bottom: 0, zIndex: 71,
                                background: "#0d0d13", borderTopLeftRadius: 20, borderTopRightRadius: 20,
                                borderTop: `1px solid ${t.border}`,
                                padding: "18px 16px calc(76px + env(safe-area-inset-bottom))",
                                display: "flex", flexDirection: "column", gap: 10,
                            }}
                        >
                            <p style={{ margin: 0, fontFamily: "'Space Mono', monospace", fontSize: 10, fontWeight: 700, letterSpacing: "0.18em", color: ACCENT, textTransform: "uppercase" }}>CREATE</p>
                            {CREATE_ACTIONS.map((a) => (
                                <motion.button
                                    key={a.label}
                                    type="button"
                                    whileTap={{ scale: 0.97 }}
                                    onClick={() => select(a.view)}
                                    style={{
                                        display: "flex", alignItems: "center", gap: 14,
                                        background: "#15151d", border: "1px solid rgba(255,255,255,0.09)",
                                        borderRadius: 14, padding: "14px 16px", cursor: "pointer",
                                        color: "#f0f0f5", textAlign: "left",
                                    }}
                                >
                                    <span style={{
                                        width: 40, height: 40, borderRadius: 11, flexShrink: 0,
                                        display: "grid", placeItems: "center", color: ACCENT,
                                        background: `${ACCENT}14`, border: `1px solid ${ACCENT}30`,
                                    }}>
                                        <svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.9} strokeLinecap="round" strokeLinejoin="round">
                                            <path d={a.icon} />
                                        </svg>
                                    </span>
                                    <span style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                                        <span style={{ fontSize: 14, fontWeight: 800 }}>{a.label}</span>
                                        <span style={{ fontSize: 11, color: "rgba(255,255,255,0.45)" }}>{a.desc}</span>
                                    </span>
                                    <span style={{ marginLeft: "auto", color: "rgba(255,255,255,0.35)" }}>
                                        <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><path d="M9 6l6 6-6 6" /></svg>
                                    </span>
                                </motion.button>
                            ))}
                            <p style={{ margin: "6px 2px 0", fontSize: 10, color: "rgba(255,255,255,0.4)" }}>CREATEから上へ → 記録・投稿・募集の3つの始まり方。あなたはどの「今」を作りますか？</p>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </>
    );
}
