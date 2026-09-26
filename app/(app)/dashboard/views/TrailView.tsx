"use client";

// dashboard/views/TrailView.tsx — Trail を Dashboard SPA の view として提供。
// 既存の /trail (TrailClient) の表示層を再利用し、データ取得は既存 API (/api/activities, /api/moments) をそのまま利用。
// ViewHeader で戻るボタンを他ページと統一、AppShell のハンバーグメニューはグローバルで提供。

import { useCallback, useEffect, useState } from "react";
import { ViewHeader, ViewLoader } from "../components/ui";
import { apiGet, ApiError } from "@/lib/api/core-client";
import TrailClient from "@/app/(app)/trail/TrailClient";
import type { ActivityRecord } from "@/features/activity/types";
import type { MomentFeedItem } from "@/features/moment/types";
import type { ThemeColors } from "../types";

type ActivityWithAuthor = ActivityRecord & {
    place?: { id: string; name: string; prefecture: string } | null;
    author?: { id: number; slug: string; display_name: string | null; avatar_url: string | null } | null;
};

export function TrailView({
    profile,
    t,
    roleColor,
    onBack,
}: {
    profile: { id: string | number; slug: string; role: string };
    t: ThemeColors;
    roleColor: string;
    onBack: () => void;
}) {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [activities, setActivities] = useState<ActivityWithAuthor[]>([]);
    const [moments, setMoments] = useState<MomentFeedItem[]>([]);

    const load = useCallback(async () => {
        setLoading(true);
        setError("");
        try {
            const [actData, momData] = await Promise.all([
                apiGet<{ success: boolean; activities: ActivityWithAuthor[] }>("/api/activities").catch(() => ({ success: false, activities: [] as ActivityWithAuthor[] })),
                apiGet<{ success: boolean; items: MomentFeedItem[] }>("/api/moments?scope=all&limit=20").catch(() => ({ success: false, items: [] as MomentFeedItem[] })),
            ]);
            setActivities(actData.activities ?? []);
            // /api/moments?scope=all returns {items} for public, fallback to {activities} shape if needed
            const momItems = (momData as any).items ?? (momData as any).moments ?? [];
            setMoments(momItems);
        } catch (e) {
            setError(e instanceof ApiError ? e.message : "読み込みに失敗しました");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        void load();
    }, [load]);

    if (loading) {
        return (
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                <ViewHeader title="Trail" sub="みんなの軌跡 — Activity と Moment が一つの流れに" onBack={onBack} t={t} roleColor={roleColor} />
                <ViewLoader t={t} />
            </div>
        );
    }

    if (error) {
        return (
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                <ViewHeader title="Trail" sub="みんなの軌跡" onBack={onBack} t={t} roleColor={roleColor} />
                <p role="alert" style={{ color: "#FF5C7A", fontSize: 13 }}>{error}</p>
            </div>
        );
    }

    return (
        <TrailClient
            initialActivities={activities}
            initialMoments={moments}
            viewerId={Number(profile.id)}
            viewerRole={profile.role}
            onBack={onBack}
        />
    );
}
