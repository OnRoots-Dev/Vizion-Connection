"use client";

// dashboard/components/core/MapCanvas.tsx
// Viz Map の抽象キャンバス。Mapbox GL JS 導入時に置き換える単一ポイント。
// 契約: bbox + items(lat/lng) を受け、marker選択イベントを出すだけ。
// 現実装は equirectangular 投影の静面マップ（本番仕様ではなく仮描画）。

import { useMemo } from "react";
import { motion, useReducedMotion } from "framer-motion";

export interface MapPoint {
    id: string;
    latitude: number;
    longitude: number;
    label: string;
    kind?: string;
}

export interface MapBBox {
    minLat: number;
    maxLat: number;
    minLng: number;
    maxLng: number;
}

const ROLE_KIND_COLORS: Record<string, string> = {
    practice: "#C8E800",
    training: "#7DD3FC",
    match: "#FFD600",
    competition: "#FFD600",
    event: "#F0ABFC",
    coaching: "#86EFAC",
    session: "#86EFAC",
    workshop: "#FDBA74",
    watching: "#A5B4FC",
    supporting: "#F9A8D4",
    participation: "#A5B4FC",
    other: "#E5E7EB",
};

export function kindColor(kind?: string): string {
    return ROLE_KIND_COLORS[kind ?? "other"] ?? "#C8E800";
}

export function MapCanvas({
    bbox,
    points,
    selectedId,
    onSelect,
    loading,
}: {
    bbox: MapBBox;
    points: MapPoint[];
    selectedId?: string | null;
    onSelect?: (id: string) => void;
    loading?: boolean;
}) {
    const reduce = useReducedMotion();

    const projected = useMemo(() => {
        const spanLat = Math.max(bbox.maxLat - bbox.minLat, 1e-6);
        const spanLng = Math.max(bbox.maxLng - bbox.minLng, 1e-6);
        return points.map((p) => ({
            ...p,
            xPct: ((p.longitude - bbox.minLng) / spanLng) * 100,
            yPct: ((bbox.maxLat - p.latitude) / spanLat) * 100,
        }));
    }, [bbox, points]);

    return (
        <div
            role="application"
            aria-label="Viz Map"
            style={{
                position: "relative", width: "100%", aspectRatio: "4 / 3",
                borderRadius: 16, overflow: "hidden",
                background:
                    "radial-gradient(120% 90% at 30% 10%, rgba(200,232,0,0.06), transparent 55%)," +
                    "repeating-linear-gradient(0deg, rgba(255,255,255,0.03) 0 1px, transparent 1px 44px)," +
                    "repeating-linear-gradient(90deg, rgba(255,255,255,0.03) 0 1px, transparent 1px 44px)," +
                    "#0c0c14",
                border: "1px solid rgba(255,255,255,0.09)",
            }}
        >
            {/* 経緯線グリッド上に marker を配置（Mapbox差し替えポイント） */}
            {projected.map((p) => {
                const active = p.id === selectedId;
                return (
                    <motion.button
                        key={p.id}
                        type="button"
                        aria-label={`${p.label} の場所`}
                        title={p.label}
                        onClick={() => onSelect?.(p.id)}
                        initial={reduce ? false : { scale: 0, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        whileTap={reduce ? undefined : { scale: 0.85 }}
                        transition={{ type: "spring", stiffness: 500, damping: 28 }}
                        style={{
                            position: "absolute",
                            left: `calc(${Math.min(Math.max(p.xPct, 2), 98)}% - 12px)`,
                            top: `calc(${Math.min(Math.max(p.yPct, 3), 96)}% - 12px)`,
                            width: 24, height: 24,
                            borderRadius: "50% 50% 50% 4px",
                            transform: "rotate(45deg)",
                            border: active ? "2px solid #ffffff" : `1px solid ${kindColor(p.kind)}66`,
                            background: active ? kindColor(p.kind) : `${kindColor(p.kind)}2e`,
                            boxShadow: active
                                ? `0 0 0 5px ${kindColor(p.kind)}33, 0 6px 16px rgba(0,0,0,0.5)`
                                : "0 4px 10px rgba(0,0,0,0.4)",
                            cursor: "pointer",
                            zIndex: active ? 2 : 1,
                        }}
                    />
                );
            })}

            {/* zoomヒント（Mapbox導入までの操作ガイド） */}
            <div
                aria-hidden
                style={{
                    position: "absolute", right: 8, bottom: 8,
                    fontSize: 9, fontFamily: "'Space Mono', monospace",
                    color: "rgba(255,255,255,0.35)", letterSpacing: "0.08em",
                }}
            >
                VIZ MAP · PREVIEW
            </div>

            {loading ? (
                <div
                    style={{
                        position: "absolute", inset: 0, display: "flex",
                        alignItems: "center", justifyContent: "center",
                        background: "rgba(5,5,10,0.45)", fontSize: 12,
                        color: "rgba(255,255,255,0.75)",
                    }}
                >
                    読み込み中...
                </div>
            ) : null}
        </div>
    );
}
