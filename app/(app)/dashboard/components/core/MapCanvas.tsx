"use client";

// dashboard/components/core/MapCanvas.tsx — Phase A (Standard Mapbox)
// mapbox://styles/mapbox/dark-v11 + native clustering。独自Style/MarkerはPhase B。
// 抽象化維持: props契約(bbox/points/selectedId/onSelect)は不変。token未設定時は案内表示。

import { useCallback, useEffect, useRef, useState } from "react";
import "mapbox-gl/dist/mapbox-gl.css";
import type { MapBBox } from "./mapTypes";

export interface MapPoint {
    id: string;
    latitude: number;
    longitude: number;
    label: string;
    kind?: string;
}

export function kindColor(kind?: string): string {
    void kind;
    // Phase A: 色は単一アクセントに限定（多色化禁止）
    return "#C8E800";
}

interface Props {
    bbox: MapBBox;
    points: MapPoint[];
    selectedId?: string | null;
    onSelect?: (id: string) => void;
    onViewportChange?: (bbox: MapBBox) => void;
    loading?: boolean;
}

const EMPTY_BBOX: MapBBox = { minLat: 0, maxLat: 0, minLng: 0, maxLng: 0 };

export function MapCanvas({ bbox, points, selectedId, onSelect, onViewportChange, loading }: Props) {
    const containerRef = useRef<HTMLDivElement | null>(null);
    const mapRef = useRef<import("mapbox-gl").Map | null>(null);
    const dataRef = useRef<{ points: MapPoint[]; selectedId?: string | null }>({ points, selectedId });
    const selectRef = useRef(onSelect);
    const viewportRef = useRef(onViewportChange);
    const [ready, setReady] = useState(false);
    const token = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;

    dataRef.current = { points, selectedId };
    selectRef.current = onSelect;
    viewportRef.current = onViewportChange;

    // init once
    useEffect(() => {
        if (!token || !containerRef.current || mapRef.current) return;
        let cancelled = false;
        (async () => {
            const mapboxgl = (await import("mapbox-gl")).default;
            if (cancelled) return;
            mapboxgl.accessToken = token;
            const map = new mapboxgl.Map({
                container: containerRef.current!,
                style: "mapbox://styles/mapbox/dark-v11",
                center: [(bbox.minLng + bbox.maxLng) / 2, (bbox.minLat + bbox.maxLat) / 2],
                zoom: 11,
                attributionControl: true,
            });
            map.addControl(new mapboxgl.NavigationControl({ showCompass: false }), "top-right");
            map.dragRotate.disable();
            map.touchZoomRotate.disableRotation();

            map.on("load", () => {
                map.addSource("viz-points", {
                    type: "geojson",
                    data: { type: "FeatureCollection", features: [] },
                    cluster: true,
                    clusterRadius: 48,
                    clusterMaxZoom: 14,
                });
                // cluster count
                map.addLayer({
                    id: "clusters-count",
                    type: "symbol",
                    source: "viz-points",
                    filter: ["has", "point_count"],
                    layout: {
                        "text-field": ["get", "point_count_abbreviated"],
                        "text-font": ["DIN Offc Pro Medium", "Arial Unicode MS Bold"],
                        "text-size": 12,
                    },
                    paint: { "text-color": "#000000" },
                });
                // cluster circle
                map.addLayer({
                    id: "clusters",
                    type: "circle",
                    source: "viz-points",
                    filter: ["has", "point_count"],
                    paint: {
                        "circle-color": "#C8E800",
                        "circle-radius": 18,
                        "circle-stroke-width": 2,
                        "circle-stroke-color": "rgba(255,255,255,0.85)",
                    },
                });
                // single point
                map.addLayer({
                    id: "single-point",
                    type: "circle",
                    source: "viz-points",
                    filter: ["!", ["has", "point_count"]],
                    paint: {
                        "circle-color": "#C8E800",
                        "circle-radius": 7,
                        "circle-stroke-width": 2.5,
                        "circle-stroke-color": "#ffffff",
                    },
                });

                map.on("click", "clusters", (e) => {
                    const f: any = map.queryRenderedFeatures(e.point, { layers: ["clusters"] })[0];
                    if (!f) return;
                    const src = map.getSource("viz-points") as any;
                    const zoom: number = src.getClusterExpansionZoom(f.properties.cluster_id);
                    map.easeTo({ center: f.geometry.coordinates, zoom });
                });
                map.on("click", "single-point", (e) => {
                    const f = e.features?.[0];
                    const id = (f as unknown as { properties?: { id?: string } })?.properties?.id;
                    if (id) selectRef.current?.(id);
                });
                map.on("mousemove", "single-point", () => { map.getCanvas().style.cursor = "pointer"; });
                map.on("mouseleave", "single-point", () => { map.getCanvas().style.cursor = ""; });

                setReady(true);
            });

            const emitViewport = () => {
                const b = map.getBounds();
        if (!b) return;
                viewportRef.current?.({
                    minLat: b.getSouth(), maxLat: b.getNorth(),
                    minLng: b.getWest(), maxLng: b.getEast(),
                });
            };
            map.on("moveend", emitViewport);
            map.once("idle", emitViewport);

            mapRef.current = map;
        })();
        return () => {
            cancelled = true;
            mapRef.current?.remove();
            mapRef.current = null;
            setReady(false);
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [token]);

    // camera follow bbox prop（地域チップ等からの移動）
    useEffect(() => {
        const map = mapRef.current;
        if (!map || !ready) return;
        const b = map.getBounds();
        if (!b) return;
        const same =
            Math.abs(b.getSouth() - bbox.minLat) < 1e-4 && Math.abs(b.getNorth() - bbox.maxLat) < 1e-4 &&
            Math.abs(b.getWest() - bbox.minLng) < 1e-4 && Math.abs(b.getEast() - bbox.maxLng) < 1e-4;
        if (same) return;
        map.fitBounds([[bbox.minLng, bbox.minLat], [bbox.maxLng, bbox.maxLat]], { padding: 40, duration: 800 });
    }, [bbox, ready]);

    // data sync
    const syncData = useCallback(() => {
        const map = mapRef.current;
        if (!map || !map.getSource("viz-points")) return;
        const src = map.getSource("viz-points") as import("mapbox-gl").GeoJSONSource;
        src.setData({
            type: "FeatureCollection",
            features: dataRef.current.points.map((p) => ({
                type: "Feature" as const,
                geometry: { type: "Point" as const, coordinates: [p.longitude, p.latitude] },
                properties: { id: p.id, label: p.label },
            })),
        } as unknown as Parameters<import("mapbox-gl").GeoJSONSource["setData"]>[0]);
        // 選択ハイライト
        if (map.getLayer("single-point")) {
            const selId = dataRef.current.selectedId;
            map.setFilter("single-point", [
                "!", ["has", "point_count"],
            ]);
            if (selId) {
                map.setPaintProperty("single-point", "circle-radius", [
                    "case", ["==", ["get", "id"], selId], 10, 7,
                ]);
            } else {
                map.setPaintProperty("single-point", "circle-radius", 7);
            }
        }
    }, []);

    useEffect(() => { syncData(); }, [points, selectedId, ready, syncData]);

    // 現在地
    function locate() {
        if (!navigator.geolocation || !mapRef.current) return;
        navigator.geolocation.getCurrentPosition((pos) => {
            mapRef.current?.easeTo({
                center: [pos.coords.longitude, pos.coords.latitude],
                zoom: 13, duration: 800,
            });
        });
    }

    if (!token) {
        return (
            <div
                role="alert"
                style={{
                    width: "100%", aspectRatio: "16 / 10", borderRadius: 16,
                    border: "1px dashed rgba(255,255,255,0.2)", background: "#111118",
                    display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
                    gap: 6, color: "rgba(255,255,255,0.55)", fontSize: 13, textAlign: "center", padding: 16,
                }}
            >
                <strong style={{ color: "#f0f0f5" }}>Viz Map は設定待ちです</strong>
                <span style={{ fontSize: 11 }}>
                    NEXT_PUBLIC_MAPBOX_TOKEN が未設定のため地図を表示できません。
                </span>
            </div>
        );
    }

    return (
        <div style={{ position: "relative" }}>
            <div ref={containerRef} role="application" aria-label="Viz Map"
                style={{ width: "100%", aspectRatio: "16 / 10", borderRadius: 16, overflow: "hidden",
                         border: "1px solid rgba(255,255,255,0.09)", background: "#0c0c14" }} />
            {/* 現在地ボタン */}
            <button
                type="button"
                aria-label="現在地へ移動"
                onClick={locate}
                disabled={!ready}
                style={{
                    position: "absolute", left: 10, bottom: 26, zIndex: 5,
                    width: 40, height: 40, borderRadius: 12, cursor: ready ? "pointer" : "wait",
                    background: "rgba(12,12,20,0.85)", border: "1px solid rgba(255,255,255,0.18)",
                    color: "#f0f0f5", fontSize: 15,
                }}
            >
                ◎
            </button>
            {loading ? (
                <div style={{
                    position: "absolute", top: 10, left: 10, zIndex: 5,
                    padding: "4px 10px", borderRadius: 999, fontSize: 10, fontWeight: 700,
                    background: "rgba(12,12,20,0.85)", border: "1px solid rgba(200,232,0,0.35)",
                    color: "#C8E800",
                }}>
                    読み込み中...
                </div>
            ) : null}
        </div>
    );
}

export type { MapBBox };
export { EMPTY_BBOX };






