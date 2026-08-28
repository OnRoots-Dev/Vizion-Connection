"use client";

// dashboard/components/RegionActivityCard.tsx
// AROUND YOUR REGION — ユーザーの登録地域で起きていることを
// 1つの情報を一定間隔で切り替えて表示するDynamic Content Card。

import { useEffect, useState, useCallback } from "react";
import { useReducedMotion } from "framer-motion";
import type { ProfileData } from "@/features/profile/types";
import type { ThemeColors } from "../types";
import { LiveInfoCard, type LiveInfoItem } from "./LiveInfoCard";

const ROTATION_INTERVAL_MS = 5000;

export function RegionActivityCard({
    profile,
    region,
}: {
    profile: ProfileData;
    region: string;
    t?: ThemeColors;
}) {
    void profile;
    const reduce = useReducedMotion();
    const [items, setItems] = useState<LiveInfoItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [index, setIndex] = useState(0);

    const loadRegion = useCallback(async () => {
        setLoading(true);
        const list: LiveInfoItem[] = [];

        try {
            // 最新Moment（公開のみ）
            const momRes = await fetch("/api/moments?limit=3", { cache: "no-store" });
            const momJson = await momRes.json();
            const moments = momJson?.items ?? [];
            if (Array.isArray(moments) && moments.length > 0) {
                const m = moments[0];
                const placeName = m?.place?.prefecture || m?.place?.name || region;
                list.push({
                    type: "moment",
                    text: `📸 ${placeName}で新しいMomentが共有されました`,
                    href: "/dashboard?view=moments",
                });
            }
        } catch {}

        setItems(list.slice(0, 4));
        setLoading(false);
    }, [region]);

    useEffect(() => {
        void loadRegion();
    }, [loadRegion]);

    // ローテーション
    useEffect(() => {
        if (reduce || items.length <= 1) return;
        const timer = setInterval(() => setIndex((p) => (p + 1) % items.length), ROTATION_INTERVAL_MS);
        return () => clearInterval(timer);
    }, [reduce, items.length]);

    // 表示するItem（ライブカードコンポーネントを流用）
    const displayItems = items.length > 0 ? [items[index % items.length]] : [];

    return (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <div
                style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                }}
            >
                <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="#A78BFA" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                    <circle cx="12" cy="10" r="3" />
                </svg>
                <p
                    style={{
                        margin: 0,
                        fontSize: 9,
                        fontWeight: 700,
                        letterSpacing: "0.18em",
                        textTransform: "uppercase",
                        color: "rgba(255,255,255,0.4)",
                        fontFamily: "'Space Mono', monospace",
                    }}
                >
                    AROUND YOUR REGION
                </p>
                <span
                    style={{
                        fontSize: 9,
                        fontWeight: 600,
                        letterSpacing: "0.1em",
                        color: "rgba(255,255,255,0.4)",
                        fontFamily: "'Space Mono', monospace",
                        whiteSpace: "nowrap",
                    }}
                >
                    · {region}
                </span>
            </div>

            <LiveInfoCard items={displayItems} loading={loading} />
        </div>
    );
}
