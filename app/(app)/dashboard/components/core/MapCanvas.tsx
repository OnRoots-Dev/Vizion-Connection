"use client";

// Viz Map rendering core. Mapbox GL JS is kept client-only because it needs window.
import { useCallback, useEffect, useRef, useState } from "react";
import { useReducedMotion } from "framer-motion";
import "mapbox-gl/dist/mapbox-gl.css";
import { COLOR } from "@/lib/design/tokens";
import { CLUSTER_COLOR } from "./mapTypes";
import type { MapBBox, PinCategory } from "./mapTypes";

export interface MapPoint {
    id: string;
    latitude: number;
    longitude: number;
    label: string;
    kind?: string;
    /** カテゴリ別Pin色（Filterと統一） */
    category?: PinCategory;
    color?: string;
    size?: number;
    /** ピン下部に出すタイムラベル（例: "2h前" / "本日 18:00"）。無い場合は非表示。 */
    timeLabel?: string;
}

interface Props {
    points: MapPoint[];
    selectedId?: string | null;
    /** Search result selection only: pan the existing map without recreating it. */
    focusPoint?: Pick<MapPoint, "latitude" | "longitude"> | null;
    /** 初期表示中心（座標）。永続化された直前位置があればそちらを優先する。 */
    initialCenter?: [number, number];
    onSelect?: (id: string) => void;
    onClusterSelect?: (points: MapPoint[]) => void;
    onClearSelection?: () => void;
    onViewportChange?: (bbox: MapBBox, zoom: number) => void;
    loading?: boolean;
}

const TOKYO_STATION: [number, number] = [139.7671, 35.6812];
/** 東京付近で画面幅に半径 5〜10km が収まるズーム（スマホ〜デスクトップの中間）。 */
const INITIAL_ZOOM = 12.25;
const LAST_LOCATION_KEY = "viz-map:last-location:v1";
const GEO_TIMEOUT_MS = 4000;

function nearlySameCenter(a: { lng: number; lat: number }, b: [number, number], epsilon = 0.002) {
    return Math.abs(a.lng - b[0]) < epsilon && Math.abs(a.lat - b[1]) < epsilon;
}

function getBrowserLocation(): Promise<[number, number] | null> {
    return new Promise((resolve) => {
        if (typeof navigator === "undefined" || !navigator.geolocation) {
            resolve(null);
            return;
        }
        let settled = false;
        const finish = (value: [number, number] | null) => {
            if (settled) return;
            settled = true;
            resolve(value);
        };
        const timer = window.setTimeout(() => finish(null), GEO_TIMEOUT_MS);
        navigator.geolocation.getCurrentPosition(
            (position) => {
                window.clearTimeout(timer);
                finish([position.coords.longitude, position.coords.latitude]);
            },
            () => {
                window.clearTimeout(timer);
                finish(null);
            },
            { enableHighAccuracy: false, timeout: GEO_TIMEOUT_MS - 400, maximumAge: 300000 },
        );
    });
}

function addSdfPinImages(map: import("mapbox-gl").Map) {
    const size = 64;
    const camp = document.createElement("canvas");
    camp.width = size;
    camp.height = size;
    const campCtx = camp.getContext("2d");
    if (!campCtx) return;
    const cx = size / 2;
    const cy = size * 0.38;
    const r = size * 0.26;
    campCtx.beginPath();
    campCtx.arc(cx, cy, r, Math.PI * 0.82, Math.PI * 0.18, false);
    campCtx.lineTo(cx, size * 0.92);
    campCtx.closePath();
    campCtx.fillStyle = "#fff";
    campCtx.fill();
    if (!map.hasImage("viz-pin-camp")) {
        map.addImage("viz-pin-camp", campCtx.getImageData(0, 0, size, size), { pixelRatio: 2, sdf: true });
    }
}

function markerGlyph(kind?: string): string {
    switch (kind) {
        case "activity": return "◉";
        case "moment": return "◌";
        case "athlete": return "△";
        case "trainer": return "▣";
        case "crew": return "◆";
        case "business": return "■";
        case "event": return "◇";
        case "place": return "⌂";
        case "person": return "●";
        case "training": return "△";
        case "practice": return "◌";
        case "match": return "★";
        case "competition": return "◆";
        default: return "•";
    }
}

export function MapCanvas({ points, selectedId, focusPoint, initialCenter, onSelect, onClusterSelect, onClearSelection, onViewportChange, loading }: Props) {
    const containerRef = useRef<HTMLDivElement | null>(null);
    const mapRef = useRef<import("mapbox-gl").Map | null>(null);
    const dataRef = useRef<{ points: MapPoint[]; selectedId?: string | null }>({ points, selectedId });
    const selectRef = useRef(onSelect);
    const clusterSelectRef = useRef(onClusterSelect);
    const clearRef = useRef(onClearSelection);
    const viewportRef = useRef(onViewportChange);
    const resizeObserverRef = useRef<ResizeObserver | null>(null);
    // 直前の選択ID。変化した時だけパルス演出を行う（データ更新のたびに全ピンが点滅するのを防ぐ）。
    const prevSelectedRef = useRef<string>("");
    // 募集中Activity Pinの常時パルスを駆動するタイマー（Mapboxのpaint遷移で呼吸させる）。
    const pulseTimerRef = useRef<number | null>(null);
    const pulsePhaseRef = useRef(false);
    const reduceMotion = useReducedMotion();
    const [ready, setReady] = useState(false);
    const token = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;

    dataRef.current = { points, selectedId };
    selectRef.current = onSelect;
    clusterSelectRef.current = onClusterSelect;
    clearRef.current = onClearSelection;
    viewportRef.current = onViewportChange;

    const emitViewport = useCallback(() => {
        const map = mapRef.current;
        if (!map) return;
        const b = map.getBounds();
        if (!b) return;
        const center = map.getCenter();
        try {
            localStorage.setItem(LAST_LOCATION_KEY, JSON.stringify({ lng: center.lng, lat: center.lat, zoom: map.getZoom() }));
        } catch { /* storage is an optional fallback */ }
        viewportRef.current?.({ minLat: b.getSouth(), maxLat: b.getNorth(), minLng: b.getWest(), maxLng: b.getEast() }, map.getZoom());
    }, []);

    useEffect(() => {
        if (!token || !containerRef.current || mapRef.current) return;
        let cancelled = false;
        (async () => {
            const mapboxgl = (await import("mapbox-gl")).default;
            if (cancelled) return;
            mapboxgl.accessToken = token;
            const fallbackCenter = initialCenter ?? TOKYO_STATION;
            const initialCenterValue = fallbackCenter;
            const initialZoom = INITIAL_ZOOM;

            const map = new mapboxgl.Map({
                container: containerRef.current!,
                style: "mapbox://styles/mapbox/light-v11",
                center: initialCenterValue,
                zoom: initialZoom,
                attributionControl: true,
            });
            map.addControl(new mapboxgl.NavigationControl({ showCompass: false }), "bottom-right");
            map.dragRotate.disable();
            map.touchZoomRotate.disableRotation();

            map.on("load", () => {
                // Keep the base map calm and legible; overlays carry the brand contrast.
                for (const layer of map.getStyle().layers ?? []) {
                    const sourceLayer = layer["source-layer"] ?? "";
                    if (layer.type === "fill-extrusion") map.setLayoutProperty(layer.id, "visibility", "none");
                    if (sourceLayer === "poi_label" || layer.id.includes("poi-label")) map.setLayoutProperty(layer.id, "visibility", "none");
                    if (layer.type === "fill" && (layer.id.includes("water") || sourceLayer === "water")) {
                        map.setPaintProperty(layer.id, "fill-color", "#b9e0e4");
                    }
                    // Set map labels to Japanese
                    if (layer.type === "symbol" && (sourceLayer === "place_label" || sourceLayer === "road_label" || sourceLayer === "waterway_label" || sourceLayer === "natural_label" || sourceLayer === "poi_label")) {
                        map.setLayoutProperty(layer.id, "text-field", ["coalesce", ["get", "name_ja"], ["get", "name"]]);
                    }
                }

                addSdfPinImages(map);
                map.addSource("viz-points", {
                    type: "geojson",
                    data: { type: "FeatureCollection", features: [] },
                    cluster: true,
                    clusterRadius: 56,
                    clusterMaxZoom: 16,
                });
                const source = "viz-points";
                const unclustered = ["!", ["has", "point_count"]] as const;
                const unclusteredCircle = ["all", unclustered, ["!=", ["get", "shape"], "camp"]];
                const unclusteredCamp = ["all", unclustered, ["==", ["get", "shape"], "camp"]];
                map.addLayer({ id: "viz-cluster-large", type: "circle", source, filter: [">=", ["get", "point_count"], 50], paint: { "circle-color": ["coalesce", ["get", "dominant_color"], CLUSTER_COLOR], "circle-radius": 26, "circle-stroke-width": 2, "circle-stroke-color": COLOR.accent, "circle-opacity": 0.98, "circle-radius-transition": { duration: 150 } } });
                map.addLayer({ id: "viz-cluster-medium", type: "circle", source, filter: ["all", [">=", ["get", "point_count"], 2], ["<", ["get", "point_count"], 50]], paint: { "circle-color": ["coalesce", ["get", "dominant_color"], CLUSTER_COLOR], "circle-radius": 18, "circle-stroke-width": 2, "circle-stroke-color": COLOR.accent, "circle-opacity": 0.98, "circle-radius-transition": { duration: 150 } } });
                map.addLayer({ id: "viz-cluster-count", type: "symbol", source, filter: ["has", "point_count"], layout: { "text-field": ["get", "point_count_abbreviated"], "text-font": ["DIN Offc Pro Medium", "Arial Unicode MS Bold"], "text-size": 12, "text-allow-overlap": true }, paint: { "text-color": COLOR.text } });
                map.addLayer({ id: "viz-cluster-type", type: "symbol", source, filter: ["has", "point_count"], layout: { "text-field": ["coalesce", ["get", "dominant_short"], ""], "text-font": ["DIN Offc Pro Medium", "Arial Unicode MS Bold"], "text-size": 8, "text-allow-overlap": true, "text-offset": [0, 1.3] }, paint: { "text-color": COLOR.text } });
                map.addLayer({ id: "viz-activity-ring", type: "circle", source, filter: unclusteredCircle, paint: { "circle-color": "rgba(200,232,0,0)", "circle-radius": ["case", ["==", ["get", "id"], ""], 0, 0], "circle-stroke-color": COLOR.text, "circle-stroke-width": 1.5, "circle-opacity": 0, "circle-radius-transition": { duration: 150 }, "circle-opacity-transition": { duration: 150 } } });
                map.addLayer({ id: "viz-activity-pulse", type: "circle", source, filter: ["all", unclusteredCircle, ["==", ["get", "category"], "activity"]], paint: { "circle-color": ["get", "pc"], "circle-radius": 14, "circle-opacity": 0.24, "circle-stroke-color": COLOR.text, "circle-stroke-width": 1, "circle-radius-transition": { duration: 1400 }, "circle-opacity-transition": { duration: 1400 } } });
                map.addLayer({ id: "viz-activity-circle", type: "circle", source, filter: unclusteredCircle, paint: { "circle-color": ["coalesce", ["get", "pc"], COLOR.accent], "circle-radius": ["coalesce", ["get", "ps"], 10], "circle-stroke-width": 2, "circle-stroke-color": COLOR.text, "circle-radius-transition": { duration: 150 } } });
                map.addLayer({ id: "viz-activity-icon", type: "symbol", source, filter: unclusteredCircle, layout: { "text-field": ["get", "glyph"], "text-font": ["Arial Unicode MS Regular"], "text-size": 14, "text-allow-overlap": true }, paint: { "text-color": COLOR.bg } });
                map.addLayer({
                    id: "viz-camp-pin",
                    type: "symbol",
                    source,
                    filter: unclusteredCamp,
                    layout: {
                        "icon-image": "viz-pin-camp",
                        "icon-size": 0.9,
                        "icon-anchor": "bottom",
                        "icon-allow-overlap": true,
                    },
                    paint: {
                        "icon-color": ["coalesce", ["get", "pc"], COLOR.gold],
                        "icon-halo-color": COLOR.text,
                        "icon-halo-width": 1.2,
                    },
                });
                map.addLayer({ id: "viz-activity-timelabel", type: "symbol", source, filter: ["all", ["has", "tlabel"], ["!=", ["get", "tlabel"], ""]], layout: { "text-field": ["get", "tlabel"], "text-font": ["DIN Offc Pro Medium", "Arial Unicode MS Bold"], "text-size": 10, "text-allow-overlap": false, "text-offset": [0, 1.8], "text-anchor": "top", "text-letter-spacing": 0.02 }, paint: { "text-color": COLOR.text, "text-halo-color": "rgba(5,5,8,0.9)", "text-halo-width": 1.8, "text-halo-blur": 0.5 } });

                const expandCluster = (e: import("mapbox-gl").MapLayerMouseEvent) => {
                    const feature = map.queryRenderedFeatures(e.point, { layers: ["viz-cluster-large", "viz-cluster-medium"] })[0] as unknown as { properties?: { cluster_id?: number }; geometry?: { type: string; coordinates: [number, number] } } | undefined;
                    if (!feature || feature.properties?.cluster_id == null) return;
                    const src = map.getSource(source) as import("mapbox-gl").GeoJSONSource & { getClusterExpansionZoom: (id: number, cb: (error: Error | null, zoom: number) => void) => void; getClusterLeaves: (id: number, limit: number, offset: number, cb: (error: Error | null, leaves: Array<{ properties?: { id?: string; kind?: string; category?: string } }>) => void) => void; };
                    src.getClusterLeaves(Number(feature.properties.cluster_id), 200, 0, (_error, leaves) => {
                        const clusterPoints = (leaves ?? [])
                            .map((leaf) => {
                                const id = String(leaf.properties?.id ?? "");
                                return dataRef.current.points.find((point) => point.id === id) ?? null;
                            })
                            .filter((point): point is MapPoint => Boolean(point));
                        if (clusterPoints.length > 0) clusterSelectRef.current?.(clusterPoints);
                    });
                    src.getClusterExpansionZoom(Number(feature.properties.cluster_id), (_error, zoom) => {
                        map.easeTo({ center: feature.geometry?.type === "Point" ? feature.geometry.coordinates : map.getCenter(), zoom: zoom ?? map.getZoom(), duration: 420, essential: true });
                    });
                };
                map.on("click", "viz-cluster-large", expandCluster);
                map.on("click", "viz-cluster-medium", expandCluster);
                const selectFromFeature = (e: import("mapbox-gl").MapLayerMouseEvent) => {
                    const id = (e.features?.[0] as unknown as { properties?: { id?: string } } | undefined)?.properties?.id;
                    if (id) selectRef.current?.(id);
                };
                map.on("click", "viz-activity-circle", selectFromFeature);
                map.on("click", "viz-camp-pin", selectFromFeature);
                map.on("click", (e) => {
                    const hit = map.queryRenderedFeatures(e.point, { layers: ["viz-cluster-large", "viz-cluster-medium", "viz-activity-circle", "viz-camp-pin"] });
                    if (hit.length === 0) clearRef.current?.();
                });
                for (const layer of ["viz-cluster-large", "viz-cluster-medium", "viz-activity-circle", "viz-camp-pin"]) {
                    map.on("mouseenter", layer, () => { map.getCanvas().style.cursor = "pointer"; });
                    map.on("mouseleave", layer, () => { map.getCanvas().style.cursor = ""; });
                }
                setReady(true);
                emitViewport();
                void getBrowserLocation().then((geo) => {
                    if (cancelled || !geo || mapRef.current !== map) return;
                    if (!nearlySameCenter(map.getCenter(), fallbackCenter)) return;
                    map.flyTo({ center: geo, zoom: INITIAL_ZOOM, duration: 700, essential: true });
                });
            });
            map.on("moveend", emitViewport);
            mapRef.current = map;

            // コンテナサイズ変化（マウント時のレイアウト確定・回転・シート開閉）に追従。
            // Mapboxは自動でコンテナのリサイズを検知しないため明示的に resize() を呼ぶ。
            if (containerRef.current && typeof ResizeObserver !== "undefined") {
                const observer = new ResizeObserver(() => {
                    mapRef.current?.resize();
                });
                observer.observe(containerRef.current);
                resizeObserverRef.current = observer;
            }
        })();
        return () => {
            cancelled = true;
            resizeObserverRef.current?.disconnect();
            resizeObserverRef.current = null;
            mapRef.current?.remove();
            mapRef.current = null;
            setReady(false);
        };
    }, [emitViewport, token]);

    // 募集中Activity Pinの常時パルス。Mapboxのpaint遷移(1400ms)に合わせて
    // circle-radius / circle-opacity を交互に切り替えて「呼吸」させる。
    // 選択パルスと違い、ここは地図上で再帰的に存在を知らせるための常時アニメ。
    // データの setData は行わない（パフォーマンス維持）。
    useEffect(() => {
        if (!ready || reduceMotion) return;
        const map = mapRef.current;
        if (!map) return;
        const apply = (phase: boolean) => {
            map.setPaintProperty("viz-activity-pulse", "circle-radius", phase ? 24 : 14);
            map.setPaintProperty("viz-activity-pulse", "circle-opacity", phase ? 0.05 : 0.24);
        };
        apply(pulsePhaseRef.current);
        pulseTimerRef.current = window.setInterval(() => {
            pulsePhaseRef.current = !pulsePhaseRef.current;
            apply(pulsePhaseRef.current);
        }, 1400);
        return () => {
            if (pulseTimerRef.current !== null) { window.clearInterval(pulseTimerRef.current); pulseTimerRef.current = null; }
        };
    }, [ready, reduceMotion]);

    const syncData = useCallback(() => {
        const map = mapRef.current;
        const src = map?.getSource("viz-points") as import("mapbox-gl").GeoJSONSource | undefined;
        if (!map || !src) return;
        const features = dataRef.current.points.map((point) => {
            const kind = point.kind ?? point.category ?? "activity";
            const category = point.category ?? kind;
            const isCamp = category === "place" || kind === "place";
            return {
                type: "Feature" as const,
                geometry: { type: "Point" as const, coordinates: [point.longitude, point.latitude] },
                properties: {
                    id: point.id,
                    label: point.label,
                    kind,
                    category,
                    shape: isCamp ? "camp" : "circle",
                    dominant_color: point.color ?? CLUSTER_COLOR,
                    dominant_short: isCamp ? "CAMP" : String(category).slice(0, 3).toUpperCase(),
                    pc: point.color ?? COLOR.accent,
                    ps: point.size ?? 10,
                    glyph: markerGlyph(kind),
                    tlabel: point.timeLabel ?? "",
                },
            };
        });
        src.setData({ type: "FeatureCollection", features } as any);
        const selected = dataRef.current.selectedId ?? "";
        const selectionChanged = prevSelectedRef.current !== selected;
        prevSelectedRef.current = selected;
        if (map.getLayer("viz-activity-ring")) {
            map.setPaintProperty("viz-activity-ring", "circle-radius", ["case", ["==", ["get", "id"], selected], 17, 0]);
            map.setPaintProperty("viz-activity-ring", "circle-opacity", ["case", ["==", ["get", "id"], selected], 1, 0]);
        }
        if (map.getLayer("viz-camp-pin")) {
            map.setLayoutProperty("viz-camp-pin", "icon-size", ["case", ["==", ["get", "id"], selected], 1.12, 0.9]);
        }
        if (selectionChanged && selected) {
            // A single restrained pulse communicates selection without turning the map into a feed.
            window.setTimeout(() => {
                if (mapRef.current !== map || dataRef.current.selectedId !== selected) return;
                map.setPaintProperty("viz-activity-ring", "circle-radius", ["case", ["==", ["get", "id"], selected], 13, 0]);
            }, 170);
        }
    }, []);

    useEffect(() => { syncData(); }, [points, selectedId, ready, syncData]);

    useEffect(() => {
        if (!focusPoint || !mapRef.current) return;
        mapRef.current.easeTo({ center: [focusPoint.longitude, focusPoint.latitude], zoom: Math.max(mapRef.current.getZoom(), 14), duration: 360, essential: true });
    }, [focusPoint]);

    if (!token) return <div role="alert" className="flex h-full min-h-[420px] items-center justify-center bg-[#111118] p-6 text-center text-sm text-white/60">NEXT_PUBLIC_MAPBOX_TOKEN が未設定のためViz Mapを表示できません。</div>;

    void loading;
    return <div className="relative h-full w-full overflow-hidden bg-[#0c0c14]"><div ref={containerRef} role="application" aria-label="Viz Map" className="h-full w-full" /></div>;
}

export type { MapBBox };
