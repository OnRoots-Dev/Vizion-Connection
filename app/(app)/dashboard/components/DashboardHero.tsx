"use client";

// dashboard/components/DashboardHero.tsx
// トップページのHero。挨拶 + Dynamic Information Slot + Around Your Region。

import { useEffect, useState, useCallback } from "react";
import { motion, useReducedMotion } from "framer-motion";
import type { ProfileData } from "@/features/profile/types";
import type { ThemeColors } from "../types";
import { LiveInfoCard, type LiveInfoItem } from "./LiveInfoCard";
import { RegionActivityCard } from "./RegionActivityCard";

function nowGreeting(): string {
    const jstHour = new Date(Date.now() + 9 * 60 * 60 * 1000).getUTCHours();
    return jstHour < 11 ? "おはよう" : jstHour < 18 ? "こんにちは" : "こんばんは";
}

export function DashboardHero({
    profile,
    t,
    roleColor,
}: {
    profile: ProfileData;
    t: ThemeColors;
    roleColor: string;
}) {
    void t;
    const reduce = useReducedMotion();
    const heroName = profile.displayName?.trim() || profile.slug;
    const greeting = nowGreeting();

    const [myNews, setMyNews] = useState<LiveInfoItem[]>([]);
    const [myLoading, setMyLoading] = useState(true);
    const region = profile.prefecture || profile.region || "Unknown";

    const loadMyInfo = useCallback(async () => {
        setMyLoading(true);
        const items: LiveInfoItem[] = [];

        try {
            // 最新Cheer
            const cheerRes = await fetch("/api/cheer/received", { cache: "no-store" });
            const cheerJson = await cheerRes.json();
            const cheers = cheerJson?.cheers ?? cheerJson?.items ?? [];
            if (Array.isArray(cheers) && cheers.length > 0) {
                const c = cheers[0];
                items.push({
                    type: "cheer",
                    text: `${c.fromDisplayName ?? "誰か"}があなたにCheerしました`,
                    href: "/dashboard?view=cheer",
                });
            }
        } catch {}

        try {
            // 最新Connection request
            const connRes = await fetch("/api/connections", { cache: "no-store" });
            const connJson = await connRes.json();
            const conns = connJson?.connections ?? [];
            if (Array.isArray(conns)) {
                const pending = conns.find((c: { status: string; direction: string }) => c.status === "pending" && c.direction === "incoming");
                if (pending?.counterpart?.display_name) {
                    items.push({
                        type: "connection",
                        text: `${pending.counterpart.display_name}からConnection申請が届いています`,
                    });
                }
            }
        } catch {}

        setMyNews(items.slice(0, 3));
        setMyLoading(false);
    }, []);

    useEffect(() => {
        void loadMyInfo();
    }, [loadMyInfo]);

    return (
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {/* Brand row */}
            <motion.div
                initial={reduce ? { opacity: 1 } : { opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
            >
                <p
                    style={{
                        margin: "0 0 6px",
                        fontSize: 10,
                        fontWeight: 600,
                        letterSpacing: "0.18em",
                        textTransform: "uppercase",
                        color: "rgba(255,255,255,0.28)",
                        fontFamily: "'Space Mono', monospace",
                    }}
                >
                    {profile.role} · Your Sport World
                </p>
                <h1
                    className="font-display"
                    style={{
                        margin: 0,
                        fontSize: "clamp(1.8rem,5vw,3rem)",
                        fontWeight: 800,
                        color: "#f0f0f5",
                        lineHeight: 1.05,
                        letterSpacing: "-0.01em",
                    }}
                >
                    {greeting}、<span style={{ color: roleColor }}>{heroName}</span>。
                </h1>
            </motion.div>

            {/* Dynamic Information Slot */}
            {myNews.length > 0 && (
                <motion.div
                    initial={reduce ? { opacity: 1 } : { opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.05 }}
                >
                    <p
                        style={{
                            margin: "0 0 8px",
                            fontSize: 9,
                            fontWeight: 700,
                            letterSpacing: "0.18em",
                            textTransform: "uppercase",
                            color: "rgba(255,255,255,0.25)",
                            fontFamily: "'Space Mono', monospace",
                        }}
                    >
                        YOUR WORLD · LIVE
                    </p>
                    <LiveInfoCard items={myNews} loading={myLoading} />
                </motion.div>
            )}

            {/* Around Your Region */}
            <RegionActivityCard profile={profile} region={region} />
        </div>
    );
}

export { nowGreeting };
