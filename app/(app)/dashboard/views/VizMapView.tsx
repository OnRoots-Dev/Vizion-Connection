"use client";

// dashboard/views/VizMapView.tsx
// Discovery体験の中心。Map（仮描画→将来Mapbox）+ Nearbyリストを一体で提示。
// private / connections はAPIが絶対に返さない設計（P0契約）。

import { useCallback, useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ViewHeader } from "../components/ui";
import { MapCanvas, kindColor, type MapBBox } from "../components/core/MapCanvas";
import { apiGet, ApiError } from "@/lib/api/core-client";
import type { MapActivityItem } from "@/features/activity/server/map";
import type { ThemeColors } from "../types";

const REGIONS: { label: string; bbox: MapBBox }[] = [
    { label: "東京", bbox: { minLat: 35.3, maxLat: 36.0, minLng: 139.2, maxLng: 140.3 } },
    { label: "大阪", bbox: { minLat: 34.3, maxLat: 34.9, minLng: 135.2, maxLng: 135.8 } },
    { label: "名古屋", bbox: { minLat: 34.9, maxLat: 35.4, minLng: 136.6, maxLng: 137.1 } },
    { label: "福岡", bbox: { minLat: 33.4, maxLat: 33.8, minLng: 130.1, maxLng: 130.7 } },
    { label: "札幌", bbox: { minLat: 42.9, maxLat: 43.3, minLng: 141.1, maxLng: 141.6 } },
];

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
    const [bbox, setBbox] = useState<MapBBox>(REGIONS[0].bbox);
    const [regionLabel, setRegionLabel] = useState(REGIONS[0].label);
    const [items, setItems] = useState<MapActivityItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [selectedId, setSelectedId] = useState<string | null>(null);

    const load = useCallback(async (b: MapBBox) => {
        setLoading(true);
        setError("");
        try {
            const q = `min_lat=${b.minLat}&max_lat=${b.maxLat}&min_lng=${b.minLng}&max_lng=${b.maxLng}`;
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
        void load(bbox);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const points = useMemo(
        () =>
            items.map((a) => ({
                id: a.id,
                latitude: a.place.latitude,
                longitude: a.place.longitude,
                label: a.title ?? `${a.type} @ ${a.place.name}`,
                kind: a.type,
            })),
        [items],
    );

    const selected = items.find((a) => a.id === selectedId) ?? null;

    return (
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <ViewHeader title="Viz Map" sub="近くの活動とMomentを発見する" onBack={onBack} t={t} roleColor={roleColor} />

            {/* 地域クイック選択（Mapbox導入までの手動viewport） */}
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

            <MapCanvas
                bbox={bbox}
                points={points}
                selectedId={selectedId}
                onSelect={setSelectedId}
                loading={loading && items.length === 0}
            />

            {error ? (
                <div role="alert" style={{ padding: "12px 16px", borderRadius: 12, fontSize: 13, background: "rgba(255,59,48,0.1)", border: "1px solid rgba(255,59,48,0.3)", color: "#ff8a84" }}>
                    {error}
                    <button type="button" onClick={() => void load(bbox)} style={{ marginLeft: 10, background: "none", border: "none", color: "#fff", fontSize: 12, textDecoration: "underline", cursor: "pointer" }}>
                        再試行
                    </button>
                </div>
            ) : null}

            {/* Nearby Activities（Discovery本体） */}
            <div style={{ display: "flex", alignItems: "baseline", gap: 8 }}>
                <h3 style={{ margin: 0, fontSize: 15, fontWeight: 800, color: "#f0f0f5" }}>Nearby</h3>
                <span style={{ fontSize: 11, color: "rgba(255,255,255,0.4)" }}>
                    {regionLabel} · 公開Activity {items.length}件
                </span>
            </div>

            {!loading && !error && items.length === 0 ? (
                <div style={{ textAlign: "center", padding: "28px 16px", borderRadius: 14, border: "1px dashed rgba(255,255,255,0.16)", color: "rgba(255,255,255,0.45)", fontSize: 13 }}>
                    このエリアではまだ公開Activityがありません。
                    <br />
                    別の地域を見るか、自分の活動をMapに残しましょう。
                </div>
            ) : (
                <AnimatePresence initial={false}>
                    {items.map((a) => (
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
                            onClick={() => setSelectedId(selectedId === a.id ? null : a.id)}
                            style={{
                                textAlign: "left", cursor: "pointer",
                                background: selectedId === a.id ? "rgba(200,232,0,0.07)" : "#111118",
                                border: selectedId === a.id ? "1px solid rgba(200,232,0,0.45)" : "1px solid rgba(255,255,255,0.08)",
                                borderRadius: 14, padding: "12px 14px",
                                display: "flex", flexDirection: "column", gap: 5,
                            }}
                        >
                            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                                <span aria-hidden style={{ width: 10, height: 10, borderRadius: "50% 50% 50% 4px", transform: "rotate(45deg)", background: kindColor(a.type), flexShrink: 0 }} />
                                <span style={{ fontSize: 10, fontWeight: 800, fontFamily: "'Space Mono', monospace", letterSpacing: "0.08em", color: "rgba(255,255,255,0.5)", textTransform: "uppercase" }}>
                                    {a.type}
                                </span>
                                <span style={{ marginLeft: "auto", fontSize: 10, color: "rgba(255,255,255,0.35)" }}>
                                    {new Date(a.starts_at).toLocaleString("ja-JP", { month: "numeric", day: "numeric", hour: "2-digit", minute: "2-digit" })}
                                </span>
                            </div>
                            {a.title ? <div style={{ fontSize: 14, fontWeight: 800, color: "#f0f0f5" }}>{a.title}</div> : null}
                            <div style={{ fontSize: 11, color: "rgba(255,255,255,0.5)" }}>
                                📍 {a.place.name}（{a.place.prefecture}）
                                {a.place.precision === "approximate" ? " · おおよその位置" : ""}
                            </div>
                        </motion.button>
                    ))}
                </AnimatePresence>
            )}

            {/* 選択中マーカーの詳細（Bottom Sheet相当のインライン詳細） */}
            <AnimatePresence>
                {selected ? (
                    <motion.section
                        key="detail"
                        initial={reduce ? false : { opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 20 }}
                        transition={{ type: "spring", stiffness: 380, damping: 38 }}
                        aria-label="選択した場所の詳細"
                        style={{
                            position: "sticky", bottom: 8,
                            background: "#15151e",
                            border: "1px solid rgba(200,232,0,0.35)",
                            borderRadius: 16,
                            padding: "14px 16px",
                            boxShadow: "0 18px 44px rgba(0,0,0,0.55)",
                            display: "flex", flexDirection: "column", gap: 6,
                        }}
                    >
                        <div style={{ fontSize: 10, fontFamily: "'Space Mono', monospace", letterSpacing: "0.14em", color: "rgba(200,232,0,0.8)", fontWeight: 700 }}>
                            PLACE DETAIL
                        </div>
                        <div style={{ fontSize: 16, fontWeight: 800, color: "#f0f0f5" }}>
                            {selected.place.name}
                        </div>
                        <div style={{ fontSize: 12, color: "rgba(255,255,255,0.55)" }}>
                            {selected.place.prefecture} · {selected.type}
                            {selected.title ? ` · ${selected.title}` : ""}
                        </div>
                    </motion.section>
                ) : null}
            </AnimatePresence>
        </div>
    );
}
