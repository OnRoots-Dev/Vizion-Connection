"use client";

// dashboard/components/LiveInfoCard.tsx
// Hero内のDynamic Information Slot。
// 1つの情報を視覚的に見せ、一定間隔でローテーション。

import { useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { IconCheer } from "@/lib/design/icons";

// ── タイプ定義 ──────────────────────────────────────────────────────────────
export type LiveInfoType = "cheer" | "comment" | "connection" | "activity" | "moment" | "new_user";

interface LiveInfoItem {
    type: LiveInfoType;
    text: string;
    href?: string;
}

// ── タイプ別のスタイル ──────────────────────────────────────────────────────
const TYPE_CONFIG: Record<LiveInfoType, { icon: React.ReactNode; color: string; glow: string; label: string }> = {
    cheer: {
        icon: <IconCheer size={16} style={{ color: "#FFD600" }} />,
        color: "#FFD600",
        glow: "0 0 20px rgba(255,214,0,0.25)",
        label: "Cheer",
    },
    comment: {
        icon: (
            <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="#3C8CFF" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
            </svg>
        ),
        color: "#3C8CFF",
        glow: "0 0 20px rgba(60,140,255,0.25)",
        label: "Comment",
    },
    connection: {
        icon: (
            <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="#30DE1D" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
                <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
            </svg>
        ),
        color: "#30DE1D",
        glow: "0 0 20px rgba(48,222,29,0.25)",
        label: "Connection",
    },
    activity: {
        icon: (
            <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="#A78BFA" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
            </svg>
        ),
        color: "#A78BFA",
        glow: "0 0 20px rgba(167,139,250,0.25)",
        label: "Activity",
    },
    moment: {
        icon: (
            <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="#FF8C00" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
                <circle cx="12" cy="13" r="4" />
            </svg>
        ),
        color: "#FF8C00",
        glow: "0 0 20px rgba(255,140,0,0.25)",
        label: "Moment",
    },
    new_user: {
        icon: (
            <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="#FFC81E" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                <circle cx="9" cy="7" r="4" />
                <line x1="19" y1="8" x2="19" y2="14" />
                <line x1="22" y1="11" x2="16" y2="11" />
            </svg>
        ),
        color: "#FFC81E",
        glow: "0 0 20px rgba(255,200,30,0.25)",
        label: "New User",
    },
};

const ROTATION_INTERVAL_MS = 5000;

// ── LiveInfoCard ──────────────────────────────────────────────────────────────
export function LiveInfoCard({ items, loading }: { items: LiveInfoItem[]; loading: boolean }) {
    const reduce = useReducedMotion();
    const [index, setIndex] = useState(0);

    const rotate = useCallback(() => {
        if (items.length <= 1) return;
        setIndex((prev) => (prev + 1) % items.length);
    }, [items.length]);

    useEffect(() => {
        if (reduce || items.length <= 1) return;
        const timer = setInterval(rotate, ROTATION_INTERVAL_MS);
        return () => clearInterval(timer);
    }, [rotate, reduce, items.length]);

    if (loading) {
        return (
            <div
                style={{
                    height: 48,
                    borderRadius: 12,
                    background: "rgba(255,255,255,0.03)",
                    border: "1px solid rgba(255,255,255,0.06)",
                }}
            />
        );
    }

    if (items.length === 0) return null;

    const current = items[index] ?? items[0];
    const config = TYPE_CONFIG[current.type];

    return (
        <div
            style={{
                position: "relative",
                height: 48,
                borderRadius: 12,
                background: "rgba(255,255,255,0.03)",
                border: `1px solid ${config.color}20`,
                overflow: "hidden",
                cursor: current.href ? "pointer" : "default",
            }}
            onClick={() => {
                if (current.href) window.location.href = current.href;
            }}
        >
            <AnimatePresence mode="wait">
                <motion.div
                    key={`${current.type}-${index}`}
                    initial={reduce ? { opacity: 1 } : { opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={reduce ? { opacity: 0 } : { opacity: 0, y: -8 }}
                    transition={{ duration: 0.3 }}
                    style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 10,
                        padding: "0 16px",
                        height: "100%",
                    }}
                >
                    {/* Icon */}
                    <div
                        style={{
                            display: "grid",
                            placeItems: "center",
                            width: 28,
                            height: 28,
                            borderRadius: 8,
                            background: `${config.color}15`,
                            flexShrink: 0,
                        }}
                    >
                        {config.icon}
                    </div>

                    {/* Text */}
                    <span
                        style={{
                            fontSize: 13,
                            fontWeight: 500,
                            color: "rgba(255,255,255,0.8)",
                            lineHeight: 1.4,
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap",
                        }}
                    >
                        {current.text}
                    </span>

                    {/* Type label */}
                    <span
                        style={{
                            marginLeft: "auto",
                            fontSize: 9,
                            fontWeight: 700,
                            letterSpacing: "0.1em",
                            textTransform: "uppercase",
                            color: config.color,
                            opacity: 0.6,
                            flexShrink: 0,
                        }}
                    >
                        {config.label}
                    </span>
                </motion.div>
            </AnimatePresence>

            {/* Subtle glow */}
            <div
                aria-hidden
                style={{
                    position: "absolute",
                    inset: 0,
                    background: `radial-gradient(ellipse at 10% 50%, ${config.color}08, transparent 60%)`,
                    pointerEvents: "none",
                }}
            />
        </div>
    );
}

export type { LiveInfoItem };
