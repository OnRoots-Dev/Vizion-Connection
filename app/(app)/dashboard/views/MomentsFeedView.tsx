"use client";

// dashboard/views/MomentsFeedView.tsx
// 公開Momentフィード。「誰が / 何をした / どこで」が一目で分かることを最優先。
// Connectionはフィード単位で一括取得し、カードへ状態を渡す（N+1回避）。

import { useCallback, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { ViewHeader, ViewLoader } from "../components/ui";
import { MomentCard } from "../components/core/MomentCard";
import { ConnectionButton } from "../components/core/ConnectionButton";
import { LoadingSkeleton, FeedEmptyState, FeedErrorState } from "../components/feed";
import { apiGet, ApiError } from "@/lib/api/core-client";
import type { MomentFeedItem } from "@/features/moment/types";
import type { ConnectionListItem } from "@/features/connection/types";
import type { ThemeColors, DashboardView } from "../types";
import { SponsoredAdCard, type PublicAd } from "./SponsoredFeed";

/** Momentフィードに広告を挿入する間隔（何件の通常Momentごとに1件広告を挟むか）。 */
const AD_INSERT_INTERVAL = 3;
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
    const searchParams = useSearchParams();
    const [loading, setLoading] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);
    const [error, setError] = useState("");
    const [items, setItems] = useState<MomentFeedItem[]>([]);
    const [connections, setConnections] = useState<ConnectionListItem[]>([]);
    const [scope, setScope] = useState<"mine" | "connections">("mine");
    const [highlightMomentId, setHighlightMomentId] = useState<string | null>(null);
    const [ads, setAds] = useState<PublicAd[]>([]);
    const [desktop, setDesktop] = useState(false);

    // デスクトップのみ右側補助ナビ（左右レール構成）。モバイルでは表示しない。
    useEffect(() => {
        const mq = window.matchMedia("(min-width: 1280px)");
        const check = () => setDesktop(mq.matches);
        check();
        mq.addEventListener("change", check);
        return () => mq.removeEventListener("change", check);
    }, []);

    // 広告はフィードとは独立に1回だけ取得（挿入位置はMoment件数に基づいて決める）
    useEffect(() => {
        let cancelled = false;
        fetch("/api/business-monetize/public?mode=ads", { cache: "no-store" })
            .then((res) => res.json().catch(() => ({})))
            .then((json) => { if (!cancelled && json?.success) setAds((json.ads as PublicAd[]) ?? []); })
            .catch(() => { if (!cancelled) setAds([]); });
        return () => { cancelled = true; };
    }, []);

    // クエリパラメータからmomentIdを取得してハイライト
    useEffect(() => {
        const momentId = searchParams.get("momentId");
        if (momentId) {
            setHighlightMomentId(momentId);
        }
    }, [searchParams]);

    const loadConnections = useCallback(async () => {
        try {
            const data = await apiGet<{ success: boolean; connections: ConnectionListItem[] }>("/api/connections");
            setConnections(data.connections ?? []);
        } catch {
            /* connection取得失敗はフィード表示を妨げない */
        }
    }, []);

    const load = useCallback(
        async (before?: string, nextScope = scope) => {
            if (before) setLoadingMore(true);
            else setLoading(true);
            setError("");
            try {
                const params = new URLSearchParams({ scope: nextScope, limit: "20" });
                if (before) params.set("before", before);
                const q = `?${params}`;
                const data = await apiGet<{ success: boolean; items: MomentFeedItem[] }>(`/api/moments${q}`);
                setItems((prev) => (before ? [...prev, ...(data.items ?? [])] : data.items ?? []));
            } catch (e) {
                setError(e instanceof ApiError ? e.message : "読み込みに失敗しました");
            } finally {
                setLoading(false);
                setLoadingMore(false);
            }
        },
        [scope],
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
        <div style={{ display: "flex", gap: 24, alignItems: "flex-start" }}>
            <div style={{ display: "flex", flexDirection: "column", gap: 16, flex: 1, minWidth: 0 }}>
            <ViewHeader title="Moments" sub="今伝えたいことを、Activityとともに共有" onBack={onBack} t={t} roleColor={roleColor} />
            <div role="tablist" aria-label="Moment表示" style={{ display: "flex", gap: 8 }}>
                {(["mine", "connections"] as const).map((tab) => <button key={tab} type="button" role="tab" aria-selected={scope === tab} onClick={() => { if (scope !== tab) setScope(tab); }} style={{ flex: 1, minHeight: 40, borderRadius: 10, border: scope === tab ? "none" : "1px solid rgba(255,255,255,0.14)", background: scope === tab ? roleColor : "rgba(255,255,255,0.05)", color: scope === tab ? "#050508" : "rgba(255,255,255,0.7)", fontWeight: 800, fontSize: 12, cursor: "pointer" }}>{tab === "mine" ? "MY MOMENTS" : "CONNECTIONS"}</button>)}
            </div>

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
                    title={scope === "mine" ? "まだMomentがありません" : "ConnectionのMomentはまだありません"}
                    description={scope === "mine" ? "Activityから、今伝えたいことをMomentとして共有しましょう。" : "Connectionすると、その人のMomentがここに表示されます。"}
                />
            ) : (
                <>
                    {items.map((item, i) => {
                        const showAd = ads.length > 0 && (i + 1) % AD_INSERT_INTERVAL === 0;
                        const ad = showAd ? ads[Math.floor(i / AD_INSERT_INTERVAL) % ads.length] : null;
                        return (
                            <div key={item.moment.id} style={{ display: "contents" }}>
                                {ad ? <SponsoredAdCard ad={ad} /> : null}
                                <MomentCard
                                    item={item}
                                    viewerId={Number.isFinite(viewerId) ? viewerId : null}
                                    roleColor={roleColor}
                                    t={t}
                                    connection={connectionFor(item.moment.user_id)}
                                    onConnectionChanged={loadConnections}
                                    highlight={item.moment.id === highlightMomentId}
                                />
                            </div>
                        );
                    })}
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

            {desktop && defineMomentsSideRail(roleColor, t)}
        </div>
    );
}

/** デスクトップ右側補助ナビ（Threads風の情報設計）。
 *  既存ナビ（左Sidebar）とは二重化せず、補助コンテンツのみ。
 *  モバイルでは非表示（matchMedia で制御）。 */
function defineMomentsSideRail(roleColor: string, t: ThemeColors) {
    const links: { id: DashboardView; label: string; sub: string; icon: string }[] = [
        { id: "home", label: "おすすめ", sub: "あなたのダッシュボード", icon: "M2.25 12l8.954-8.955a1.126 1.126 0 011.591 0L21.75 12M4.5 9.75v10.5a.75.75 0 00.75.75h4.5v-6h4.5v6h4.5a.75.75 0 00.75-.75V9.75" },
        { id: "activities", label: "アクティビティ", sub: "実際の活動・取り組み", icon: "M9 6.75V15m6-6v8.25M3.75 3.75h16.5a1.5 1.5 0 011.5 1.5v13.5a1.5 1.5 0 01-1.5 1.5H3.75a1.5 1.5 0 01-1.5-1.5V5.25a1.5 1.5 0 011.5-1.5z" },
        { id: "journey", label: "Journey", sub: "1週間の積み上げ", icon: "M6 12h.008v.008H6V12zm.75-4.5a3 3 0 113 3 3 3 0 01-3-3zm9 3a3 3 0 11-3 3 3 3 0 013-3zm-6 4.5h.008v.008H9.75v-.008zm8.25 3h.008v.008H18v-.008zM18 12a6 6 0 10-12 0c0 3.314 2.686 6 6 6s6-2.686 6-6z" },
        { id: "viz_map", label: "Neighbor", sub: "地域のアクティビティ", icon: "M15 10.5a3 3 0 11-6 0 3 3 0 016 0z M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" },
    ];

    return (
        <aside aria-label="補助ナビゲーション" style={{ width: 232, flexShrink: 0, position: "sticky", top: 16, display: "flex", flexDirection: "column", gap: 16 }}>
            <div style={{ borderRadius: 14, border: `1px solid ${t.border}`, background: t.surface, padding: 14, display: "flex", flexDirection: "column", gap: 4 }}>
                <p style={{ margin: "0 0 8px", fontFamily: "'Space Mono', monospace", fontSize: 10, fontWeight: 700, letterSpacing: "0.18em", textTransform: "uppercase", color: "rgba(255,255,255,0.35)" }}>DISCOVER</p>
                {links.map((l) => (
                    <a
                        key={l.id}
                        href={`/dashboard?view=${l.id}`}
                        style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 8px", borderRadius: 10, textDecoration: "none", color: "rgba(255,255,255,0.75)", fontWeight: 600, fontSize: 12, transition: "background 0.15s", background: "transparent" }}
                        onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(255,255,255,0.05)")}
                        onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                    >
                        <svg width={14} height={14} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                            <path strokeLinecap="round" strokeLinejoin="round" d={l.icon} />
                        </svg>
                        <span style={{ flex: 1 }}>{l.label}</span>
                        <span style={{ fontSize: 9, color: "rgba(255,255,255,0.3)" }}>{l.sub}</span>
                    </a>
                ))}
            </div>

            <div style={{ borderRadius: 14, border: `1px solid ${t.border}`, background: t.surface, padding: 14 }}>
                <p style={{ margin: "0 0 8px", fontFamily: "'Space Mono', monospace", fontSize: 10, fontWeight: 700, letterSpacing: "0.18em", textTransform: "uppercase", color: "rgba(255,255,255,0.35)" }}>TRENDING ACTIVITY</p>
                <p style={{ margin: 0, fontSize: 11, lineHeight: 1.7, color: "rgba(255,255,255,0.55)" }}>
                    ActivityやMomentを投稿すると、ここに盛り上がりが表示されます。地図（Viz Map）から地域のアクティビティも探せます。
                </p>
            </div>

            <div style={{ borderRadius: 14, border: `1px solid ${t.border}`, background: t.surface, padding: 14 }}>
                <p style={{ margin: "0 0 8px", fontFamily: "'Space Mono', monospace", fontSize: 10, fontWeight: 700, letterSpacing: "0.18em", textTransform: "uppercase", color: "rgba(255,255,255,0.35)" }}>ROUTE</p>
                <p style={{ margin: 0, fontSize: 11, lineHeight: 1.7, color: "rgba(255,255,255,0.55)" }}>
                    Moment → Activity → Cheer / Comment → Profile → Connection → Journey。あなたの活動の軌跡がここに繋がります。
                </p>
            </div>
        </aside>
    );
}
