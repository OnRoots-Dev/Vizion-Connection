"use client";

import { useCallback, useEffect, useState } from "react";
import type { DashboardView, ThemeColors } from "@/app/(app)/dashboard/types";
import { SectionCard, SLabel, ViewHeader, ViewLoader } from "@/app/(app)/dashboard/components/ui";

type NotificationItem = {
    id: number;
    type: "cheer_received" | "business_checkout_submitted" | "mission_reward_granted";
    title: string;
    body: string;
    actorSlug: string | null;
    linkUrl: string | null;
    createdAt: string;
    isRead: boolean;
};

type NotificationsResponse = {
    success: boolean;
    error?: string;
    items?: NotificationItem[];
    page?: number;
    hasMore?: boolean;
};

const TYPE_LABEL: Record<NotificationItem["type"], string> = {
    cheer_received: "Cheer",
    business_checkout_submitted: "Business",
    mission_reward_granted: "Mission",
};

function formatDate(value: string) {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "-";
    return date.toLocaleString("ja-JP", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
    });
}

export function ActionHistoryView({
    t,
    roleColor,
    onBack,
    setView,
}: {
    t: ThemeColors;
    roleColor: string;
    onBack: () => void;
    setView: (view: DashboardView) => void;
}) {
    const [items, setItems] = useState<NotificationItem[]>([]);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(false);
    const [loading, setLoading] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const loadPage = useCallback(async (nextPage: number, append: boolean) => {
        const res = await fetch(`/api/notifications?page=${nextPage}&limit=20`, { cache: "no-store" });
        const json = (await res.json().catch(() => ({}))) as NotificationsResponse;
        if (!res.ok || !json.success) {
            throw new Error(typeof json.error === "string" ? json.error : "履歴の取得に失敗しました");
        }

        const nextItems = json.items ?? [];
        setItems((prev) => (append ? [...prev, ...nextItems] : nextItems));
        setPage(json.page ?? nextPage);
        setHasMore(Boolean(json.hasMore));
    }, []);

    useEffect(() => {
        let active = true;
        setLoading(true);
        setError(null);
        loadPage(1, false)
            .catch((err) => {
                if (active) setError(err instanceof Error ? err.message : "履歴の取得に失敗しました");
            })
            .finally(() => {
                if (active) setLoading(false);
            });
        return () => {
            active = false;
        };
    }, [loadPage]);

    async function handleLoadMore() {
        if (!hasMore || loadingMore) return;
        setLoadingMore(true);
        setError(null);
        try {
            await loadPage(page + 1, true);
        } catch (err) {
            setError(err instanceof Error ? err.message : "履歴の取得に失敗しました");
        } finally {
            setLoadingMore(false);
        }
    }

    if (loading) {
        return (
            <>
                <ViewHeader title="Action History" sub="アクション履歴" onBack={onBack} t={t} roleColor={roleColor} />
                <ViewLoader t={t} />
            </>
        );
    }

    return (
        <div style={{ display: "grid", gap: 12 }}>
            <ViewHeader title="Action History" sub="アクション履歴" onBack={onBack} t={t} roleColor={roleColor} />

            <SectionCard t={t} accentColor={roleColor}>
                <SLabel text="Timeline" color={roleColor} />
                <p style={{ margin: 0, fontSize: 12, color: t.sub, lineHeight: 1.7 }}>
                    このアカウントに紐づく通知や進行状況を、時系列でまとめて確認できます。
                </p>
            </SectionCard>

            {error ? (
                <SectionCard t={t}>
                    <p style={{ margin: 0, fontSize: 12, color: "#ff9b9b" }}>{error}</p>
                </SectionCard>
            ) : null}

            {items.length === 0 ? (
                <SectionCard t={t}>
                    <p style={{ margin: 0, fontSize: 12, color: t.sub }}>まだ履歴がありません。</p>
                </SectionCard>
            ) : (
                <div style={{ display: "grid", gap: 8 }}>
                    {items.map((item) => (
                        <SectionCard key={item.id} t={t} accentColor={item.isRead ? undefined : roleColor}>
                            <div style={{ display: "grid", gap: 8 }}>
                                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8, flexWrap: "wrap" }}>
                                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                                        <span style={{ fontSize: 10, fontFamily: "monospace", color: item.isRead ? t.sub : roleColor }}>
                                            {TYPE_LABEL[item.type]}
                                        </span>
                                        {!item.isRead ? (
                                            <span style={{ padding: "2px 6px", borderRadius: 999, border: `1px solid ${roleColor}44`, color: roleColor, fontSize: 9, fontWeight: 900 }}>
                                                NEW
                                            </span>
                                        ) : null}
                                    </div>
                                    <span style={{ fontSize: 10, color: t.sub }}>{formatDate(item.createdAt)}</span>
                                </div>

                                <div style={{ display: "grid", gap: 4 }}>
                                    <p style={{ margin: 0, fontSize: 13, fontWeight: 800, color: t.text }}>{item.title}</p>
                                    {item.body ? <p style={{ margin: 0, fontSize: 11, color: t.sub, lineHeight: 1.7 }}>{item.body}</p> : null}
                                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8, flexWrap: "wrap" }}>
                                        <span style={{ fontSize: 10, color: t.sub }}>
                                            {item.actorSlug ? `from @${item.actorSlug}` : "system"}
                                        </span>
                                        {item.linkUrl ? (
                                            <button
                                                type="button"
                                                onClick={() => setView("notifications")}
                                                style={{ border: "none", background: "transparent", color: roleColor, fontSize: 11, fontWeight: 900, cursor: "pointer", padding: 0 }}
                                            >
                                                通知一覧で開く →
                                            </button>
                                        ) : null}
                                    </div>
                                </div>
                            </div>
                        </SectionCard>
                    ))}
                </div>
            )}

            {hasMore ? (
                <button
                    type="button"
                    onClick={() => void handleLoadMore()}
                    disabled={loadingMore}
                    style={{ borderRadius: 12, border: `1px solid ${t.border}`, background: "transparent", color: t.text, fontSize: 12, fontWeight: 800, padding: "10px 12px", cursor: loadingMore ? "wait" : "pointer" }}
                >
                    {loadingMore ? "読み込み中..." : "さらに読み込む"}
                </button>
            ) : null}
        </div>
    );
}
