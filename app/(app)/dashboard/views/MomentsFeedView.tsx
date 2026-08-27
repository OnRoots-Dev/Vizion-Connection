"use client";

// dashboard/views/MomentsFeedView.tsx
// 公開Momentフィード。「誰が / 何をした / どこで」が一目で分かることを最優先。
// Connectionはフィード単位で一括取得し、カードへ状態を渡す（N+1回避）。

import { useCallback, useEffect, useState } from "react";
import { ViewHeader, ViewLoader } from "../components/ui";
import { MomentCard } from "../components/core/MomentCard";
import { ConnectionButton } from "../components/core/ConnectionButton";
import { LoadingSkeleton, FeedEmptyState, FeedErrorState } from "../components/feed";
import { apiGet, ApiError } from "@/lib/api/core-client";
import type { MomentFeedItem } from "@/features/moment/types";
import type { ConnectionListItem } from "@/features/connection/types";
import type { ThemeColors } from "../types";

export function MomentsFeedView({
    profile,
    t,
    roleColor,
    onBack,
}: {
    profile: { id: string | number; slug: string };
    t: ThemeColors;
    roleColor: string;
    onBack: () => void;
}) {
    const viewerId = Number(profile.id);
    const [loading, setLoading] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);
    const [error, setError] = useState("");
    const [items, setItems] = useState<MomentFeedItem[]>([]);
    const [connections, setConnections] = useState<ConnectionListItem[]>([]);

    const loadConnections = useCallback(async () => {
        try {
            const data = await apiGet<{ success: boolean; connections: ConnectionListItem[] }>("/api/connections");
            setConnections(data.connections ?? []);
        } catch {
            /* connection取得失敗はフィード表示を妨げない */
        }
    }, []);

    const load = useCallback(
        async (before?: string) => {
            if (before) setLoadingMore(true);
            else setLoading(true);
            setError("");
            try {
                const q = before ? `?before=${encodeURIComponent(before)}&limit=20` : "?limit=20";
                const data = await apiGet<{ success: boolean; items: MomentFeedItem[] }>(`/api/moments${q}`);
                setItems((prev) => (before ? [...prev, ...(data.items ?? [])] : data.items ?? []));
            } catch (e) {
                setError(e instanceof ApiError ? e.message : "読み込みに失敗しました");
            } finally {
                setLoading(false);
                setLoadingMore(false);
            }
        },
        [],
    );

    useEffect(() => {
        void load();
        void loadConnections();
    }, [load, loadConnections]);

    /** author user_id → connection state/id のマップ */
    function connectionFor(userId: number): { state: "none" | "outgoing" | "incoming" | "accepted"; id: string | null } {
        const row = connections.find((c) => c.counterpart?.id === userId);
        if (!row) return { state: "none", id: null };
        if (row.status === "accepted") return { state: "accepted", id: row.id };
        return { state: row.direction === "outgoing" ? "outgoing" : "incoming", id: row.id };
    }

    const oldest = items.length > 0 ? items[items.length - 1].moment.created_at : null;
    const incomingPending = connections.filter((c) => c.status === "pending" && c.direction === "incoming");

    return (
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <ViewHeader title="Moments" sub="活動から生まれた発見のタイムライン" onBack={onBack} t={t} roleColor={roleColor} />

            {/* Connection申請（承認待ち） */}
            {incomingPending.length > 0 ? (
                <section
                    aria-label="Connection申請"
                    style={{
                        background: "rgba(200,232,0,0.05)", border: "1px solid rgba(200,232,0,0.3)",
                        borderRadius: 14, padding: "12px 14px", display: "flex", flexDirection: "column", gap: 8,
                    }}
                >
                    <div style={{ fontSize: 10, fontWeight: 800, fontFamily: "'Space Mono', monospace", letterSpacing: "0.14em", color: "#C8E800" }}>
                        CONNECTION REQUESTS
                    </div>
                    {incomingPending.map((c) => (
                        <div key={c.id} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                            <span style={{ fontSize: 13, fontWeight: 700, color: "#f0f0f5", flex: 1, minWidth: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                                {c.counterpart?.display_name ?? c.counterpart?.slug ?? "ユーザー"}
                            </span>
                            <ConnectionButton
                                targetSlug={c.counterpart?.slug ?? ""}
                                state="incoming"
                                connectionId={c.id}
                                onChanged={loadConnections}
                                compact
                            />
                        </div>
                    ))}
                </section>
            ) : null}

            {error ? (
                <FeedErrorState message={error} onRetry={() => void load()} />
            ) : null}

            {loading ? (
                <LoadingSkeleton media />
            ) : !error && items.length === 0 ? (
                <FeedEmptyState
                    title="まだ公開されたMomentがありません"
                    description="Activityを作って、最初のMomentを公開してみましょう。"
                />
            ) : (
                <>
                    {items.map((item) => (
                        <MomentCard
                            key={item.moment.id}
                            item={item}
                            viewerId={Number.isFinite(viewerId) ? viewerId : null}
                            roleColor={roleColor}
                            t={t}
                            connection={connectionFor(item.moment.user_id)}
                            onConnectionChanged={loadConnections}
                        />
                    ))}
                    {oldest ? (
                        loadingMore ? (
                            <ViewLoader t={t} />
                        ) : (
                            <button
                                type="button"
                                onClick={() => void load(oldest)}
                                style={{
                                    minHeight: 44, borderRadius: 12, fontSize: 13, fontWeight: 700,
                                    background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.14)",
                                    color: "rgba(255,255,255,0.7)", cursor: "pointer",
                                }}
                            >
                                さらに読み込む
                            </button>
                        )
                    ) : null}
                </>
            )}
        </div>
    );
}
