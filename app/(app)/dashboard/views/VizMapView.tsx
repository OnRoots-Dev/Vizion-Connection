"use client";

// dashboard/views/VizMapView.tsx — Phase A (Standard Mapbox)
// 地図（dark-v11）+ Cluster + Type Filter + Nearby list + Detail BottomSheet。
// データは既存 /api/viz-map（public/planned のみ・bbox契約不変）。

import { useCallback, useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useRouter } from "next/navigation";
import { ViewHeader, PrimaryButton } from "../components/ui";
import { MapCanvas, type MapBBox } from "../components/core/MapCanvas";
import { BottomSheet } from "../components/core/BottomSheet";
import { apiGet, ApiError } from "@/lib/api/core-client";
import type { MapActivityItem } from "@/features/activity/server/map";
import type { ActivityType } from "@/features/activity/types";
import type { ThemeColors } from "../types";

const REGIONS: { label: string; bbox: MapBBox }[] = [
    { label: "東京", bbox: { minLat: 35.3, maxLat: 36.0, minLng: 139.2, maxLng: 140.3 } },
    { label: "大阪", bbox: { minLat: 34.3, maxLat: 34.9, minLng: 135.2, maxLng: 135.8 } },
    { label: "名古屋", bbox: { minLat: 34.9, maxLat: 35.4, minLng: 136.6, maxLng: 137.1 } },
    { label: "福岡", bbox: { minLat: 33.4, maxLat: 33.8, minLng: 130.1, maxLng: 130.7 } },
    { label: "札幌", bbox: { minLat: 42.9, maxLat: 43.3, minLng: 141.1, maxLng: 141.6 } },
];

const TYPE_LABELS: Record<string, string> = {
    practice: "練習", training: "トレーニング", match: "試合", competition: "大会",
    event: "イベント", coaching: "コーチング", session: "セッション", workshop: "ワークショップ",
    watching: "観戦", supporting: "サポート", participation: "参加", other: "その他",
};

const FILTERABLE_TYPES: ActivityType[] = ["practice", "training", "match", "competition", "event", "other"];

export function VizMapView({
    t,
    roleColor,
    onBack,
}: {
    t: ThemeColors;
    roleColor: string;
    onBack: () => void;
}) {
    const reduce = useReducedMotion();
    const router = useRouter();
    const [bbox, setBbox] = useState<MapBBox>(REGIONS[0].bbox);
    const [regionLabel, setRegionLabel] = useState(REGIONS[0].label);
    const [items, setItems] = useState<MapActivityItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [selectedId, setSelectedId] = useState<string | null>(null);
    const [sheetOpen, setSheetOpen] = useState(false);
    const [typeFilter, setTypeFilter] = useState<ActivityType | null>(null);

    const load = useCallback(async (b: MapBBox) => {
        // API契約のbbox上限（lat<=30 / lng<=40）をクライアントでも担保
        if (b.maxLat - b.minLat > 30 || b.maxLng - b.minLng > 40) return;
        setLoading(true);
        setError("");
        try {
            const q = `min_lat=${b.minLat.toFixed(5)}&max_lat=${b.maxLat.toFixed(5)}&min_lng=${b.minLng.toFixed(5)}&max_lng=${b.maxLng.toFixed(5)}`;
            const data = await apiGet<{ success: boolean; items: MapActivityItem[] }>(`/api/viz-map?${q}`);
            setItems(data.items ?? []);
            setSelectedId(null);
        } catch (e) {
            setError(e instanceof ApiError ? e.message : "読み込みに失敗しました");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        void load(REGIONS[0].bbox);
    }, [load]);

    const filtered = useMemo(
        () => (typeFilter ? items.filter((a) => a.type === typeFilter) : items),
        [items, typeFilter],
    );

    const points = useMemo(
        () =>
            filtered.map((a) => ({
                id: a.id,
                latitude: a.place.latitude,
                longitude: a.place.longitude,
                label: a.title ?? `${TYPE_LABELS[a.type] ?? a.type} @ ${a.place.name}`,
                kind: a.type,
            })),
        [filtered],
    );

    const selected = filtered.find((a) => a.id === selectedId) ?? null;

    function handleViewport(b: MapBBox) {
        setRegionLabel("この範囲");
        setBbox(b);
        void load(b);
    }

    return (
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <ViewHeader title="Viz Map" sub="近くの活動を発見する" onBack={onBack} t={t} roleColor={roleColor} />

            {/* Region chips */}
            <div role="tablist" aria-label="地域を選択" style={{ display: "flex", gap: 6, overflowX: "auto", paddingBottom: 2 }}>
                {REGIONS.map((r) => (
                    <motion.button
                        key={r.label}
                        type="button"
                        role="tab"
                        aria-selected={regionLabel === r.label}
                        whileTap={reduce ? undefined : { scale: 0.94 }}
                        onClick={() => {
                            setRegionLabel(r.label);
                            setBbox(r.bbox);
                            void load(r.bbox);
                        }}
                        style={{
                            padding: "7px 13px", borderRadius: 999, fontSize: 11, fontWeight: 800,
                            whiteSpace: "nowrap", cursor: "pointer",
                            ...(regionLabel === r.label
                                ? { background: "#C8E800", color: "#000", border: "none" }
                                : {
                                      background: "rgba(255,255,255,0.05)",
                                      color: "rgba(255,255,255,0.65)",
                                      border: "1px solid rgba(255,255,255,0.14)",
                                  }),
                        }}
                    >
                        {r.label}
                    </motion.button>
                ))}
            </div>

            {/* Map */}
            <MapCanvas
                bbox={bbox}
                points={points}
                selectedId={selectedId}
                onSelect={(id) => {
                    setSelectedId(id);
                    setSheetOpen(true);
                }}
                onViewportChange={handleViewport}
                loading={loading && items.length === 0}
            />

            {/* Type Filter（Phase A: Activity Type のみ） */}
            <div role="tablist" aria-label="Activity Typeで絞り込み" style={{ display: "flex", gap: 6, overflowX: "auto", paddingBottom: 2 }}>
                {[null, ...FILTERABLE_TYPES].map((tp) => {
                    const active = typeFilter === tp;
                    const label = tp ? TYPE_LABELS[tp] : "すべて";
                    return (
                        <motion.button
                            key={label}
                            type="button"
                            role="tab"
                            aria-selected={active}
                            whileTap={reduce ? undefined : { scale: 0.94 }}
                            onClick={() => setTypeFilter(tp)}
                            style={{
                                padding: "6px 12px", borderRadius: 999, fontSize: 11, fontWeight: 800,
                                whiteSpace: "nowrap", cursor: "pointer",
                                ...(active
                                    ? { background: roleColor, color: "#000", border: `1px solid ${roleColor}` }
                                    : {
                                          background: "rgba(255,255,255,0.05)",
                                          color: "rgba(255,255,255,0.65)",
                                          border: "1px solid rgba(255,255,255,0.14)",
                                      }),
                            }}
                        >
                            {label}
                        </motion.button>
                    );
                })}
            </div>

            {error ? (
                <div role="alert" style={{ padding: "12px 16px", borderRadius: 12, fontSize: 13, background: "rgba(255,59,48,0.1)", border: "1px solid rgba(255,59,48,0.3)", color: "#ff8a84", display: "flex", gap: 10, alignItems: "center" }}>
                    <span>{error}</span>
                    <button type="button" onClick={() => void load(bbox)} style={{ background: "none", border: "none", color: "#fff", fontSize: 12, textDecoration: "underline", cursor: "pointer" }}>
                        再試行
                    </button>
                </div>
            ) : null}

            {/* Nearby list */}
            <div style={{ display: "flex", alignItems: "baseline", gap: 8 }}>
                <h3 style={{ margin: 0, fontSize: 15, fontWeight: 800, color: "#f0f0f5" }}>Nearby</h3>
                <span style={{ fontSize: 11, color: "rgba(255,255,255,0.4)" }}>
                    公開Activity {filtered.length}件{typeFilter ? ` · ${TYPE_LABELS[typeFilter]}` : ""}
                </span>
            </div>

            {!loading && !error && filtered.length === 0 ? (
                <div style={{ textAlign: "center", padding: "28px 16px", borderRadius: 14, border: "1px dashed rgba(255,255,255,0.16)", color: "rgba(255,255,255,0.45)", fontSize: 13 }}>
                    このエリアではまだ公開Activityがありません。
                    <br />
                    別の地域を見るか、自分の活動をMapに残しましょう。
                </div>
            ) : (
                <AnimatePresence initial={false}>
                    {filtered.map((a) => (
                        <motion.button
                            key={a.id}
                            type="button"
                            layout
                            initial={reduce ? false : { opacity: 0, y: 8 }}
                            animate={{
                                opacity: selectedId == null || selectedId === a.id ? 1 : 0.45,
                                y: 0,
                                scale: selectedId === a.id ? 1.01 : 1,
                            }}
                            exit={{ opacity: 0 }}
                            transition={{ type: "spring", stiffness: 340, damping: 34 }}
                            onClick={() => {
                                setSelectedId(a.id);
                                setSheetOpen(true);
                            }}
                            style={{
                                textAlign: "left", cursor: "pointer",
                                background: selectedId === a.id ? "rgba(200,232,0,0.07)" : "#111118",
                                border: selectedId === a.id ? "1px solid rgba(200,232,0,0.45)" : "1px solid rgba(255,255,255,0.08)",
                                borderRadius: 14, padding: "12px 14px",
                                display: "flex", flexDirection: "column", gap: 5,
                            }}
                        >
                            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                                <span style={{
                                    fontSize: 10, fontWeight: 800, fontFamily: "'Space Mono', monospace",
                                    letterSpacing: "0.08em", color: "rgba(255,255,255,0.5)", textTransform: "uppercase",
                                }}>
                                    {TYPE_LABELS[a.type] ?? a.type}
                                </span>
                                <span style={{ marginLeft: "auto", fontSize: 10, color: "rgba(255,255,255,0.35)" }}>
                                    {new Date(a.starts_at).toLocaleString("ja-JP", { month: "numeric", day: "numeric", hour: "2-digit", minute: "2-digit" })}
                                </span>
                            </div>
                            {a.title ? <div style={{ fontSize: 14, fontWeight: 800, color: "#f0f0f5" }}>{a.title}</div> : null}
                            <div style={{ fontSize: 11, color: "rgba(255,255,255,0.5)" }}>
                                📍 {a.place.name}（{a.place.prefecture}）
                                {a.author_name ? ` · ${a.author_name}` : ""}
                            </div>
                        </motion.button>
                    ))}
                </AnimatePresence>
            )}

            {/* Detail Bottom Sheet（Marker/Nearby選択時） */}
            <BottomSheet open={sheetOpen} onClose={() => setSheetOpen(false)} title="ACTIVITY" t={t}>
                {selected ? (
                    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                            <span
                                style={{
                                    padding: "3px 9px", borderRadius: 999, fontSize: 10, fontWeight: 800,
                                    fontFamily: "'Space Mono', monospace",
                                    background: "rgba(200,232,0,0.1)", color: "#C8E800",
                                    border: "1px solid rgba(200,232,0,0.35)",
                                }}
                            >
                                {TYPE_LABELS[selected.type] ?? selected.type}
                            </span>
                            <span style={{ marginLeft: "auto", fontSize: 11, color: "rgba(255,255,255,0.45)" }}>
                                {new Date(selected.starts_at).toLocaleString("ja-JP")}
                            </span>
                        </div>

                        <h3 style={{ margin: 0, fontSize: 18, fontWeight: 800, color: "#f0f0f5" }}>
                            {selected.title ?? TYPE_LABELS[selected.type]}
                        </h3>

                        <div style={{ display: "flex", flexDirection: "column", gap: 5, fontSize: 13, color: "rgba(255,255,255,0.7)" }}>
                            <span>📍 {selected.place.name}（{selected.place.prefecture}）</span>
                            <span style={{ fontSize: 11, color: "rgba(255,255,255,0.45)" }}>
                                {selected.place.precision === "approximate" ? "おおよその位置で表示しています" : ""}
                            </span>
                            {selected.author_name ? (
                                <span>👤 {selected.author_name}</span>
                            ) : null}
                        </div>

                        <PrimaryButton
                            onClick={() => {
                                if (!selected.author_slug) return;
                                router.push(`/u/${selected.author_slug}`);
                            }}
                        >
                            投稿者のProfileを見る
                        </PrimaryButton>
                    </div>
                ) : null}
            </BottomSheet>
        </div>
    );
}

