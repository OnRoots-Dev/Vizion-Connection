"use client";

// フルスクリーンMap。DashboardClientのview切替はframer-motionのtransformを伴うため、
// transform付き祖先の中で position:fixed を使うと包含ブロックが崩れる（全画面にならない）。
// → createPortal で document.body 直下に描画して回避する。
import { createPortal } from "react-dom";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { GestureSheet } from "@/components/ui/GestureSheet";
import { MapCanvas, type MapBBox } from "../components/core/MapCanvas";
import { PIN_COLOR, type PinCategory } from "../components/core/mapTypes";
import { apiGet, ApiError } from "@/lib/api/core-client";
import type { MapActivityItem } from "@/features/activity/server/map";
import type { ActivityType } from "@/features/activity/types";
import type { ThemeColors } from "../types";

const FILTERABLE_TYPES: ActivityType[] = ["training", "practice", "match", "competition", "event", "other"];
const TYPE_LABELS: Record<string, string> = { training: "Training", practice: "Practice", match: "Match", competition: "Competition", event: "Event", other: "Other" };

// ActivityType → Pinカテゴリ（FilterとPinの色統一）
const TYPE_CATEGORY: Record<string, PinCategory> = {
    training: "activity", practice: "activity", match: "activity",
    competition: "activity", event: "event", other: "activity",
};

function viewportKey(b: MapBBox, zoom: number) {
    return [zoom.toFixed(0), b.minLat.toFixed(3), b.maxLat.toFixed(3), b.minLng.toFixed(3), b.maxLng.toFixed(3)].join(":");
}

export function VizMapView({ t, onBack }: { t: ThemeColors; roleColor: string; onBack: () => void }) {
    void t;
    const reduce = useReducedMotion();
    const cache = useRef(new Map<string, MapActivityItem[]>());
    const timer = useRef<number | null>(null);
    const [items, setItems] = useState<MapActivityItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [selectedId, setSelectedId] = useState<string | null>(null);
    const [sheetSnap, setSheetSnap] = useState<"peek" | "half">("peek");
    const [filterOpen, setFilterOpen] = useState(false);
    const [typeFilter, setTypeFilter] = useState<ActivityType | null>(null);
    const [mounted, setMounted] = useState(false);
    const selected = items.find((item) => item.id === selectedId) ?? null;

    useEffect(() => { setMounted(true); }, []);

    // 全画面表示中は背景（dashboard）のスクロールを止める
    useEffect(() => {
        if (!mounted) return;
        const previousOverflow = document.body.style.overflow;
        document.body.style.overflow = "hidden";
        return () => { document.body.style.overflow = previousOverflow; };
    }, [mounted]);

    const load = useCallback(async (bbox: MapBBox, zoom: number) => {
        if (bbox.maxLat - bbox.minLat > 30 || bbox.maxLng - bbox.minLng > 40) return;
        const key = viewportKey(bbox, zoom);
        const cached = cache.current.get(key);
        if (cached) { setItems(cached); setLoading(false); return; }
        setLoading(true); setError("");
        try {
            const query = new URLSearchParams({ min_lat: bbox.minLat.toFixed(5), max_lat: bbox.maxLat.toFixed(5), min_lng: bbox.minLng.toFixed(5), max_lng: bbox.maxLng.toFixed(5) });
            const data = await apiGet<{ success: boolean; items: MapActivityItem[] }>(`/api/viz-map?${query}`);
            const next = data.items ?? [];
            cache.current.set(key, next);
            setItems(next);
        } catch (cause) { setError(cause instanceof ApiError ? cause.message : "Activityを読み込めませんでした"); }
        finally { setLoading(false); }
    }, []);

    const handleViewport = useCallback((bbox: MapBBox, zoom: number) => {
        if (timer.current) window.clearTimeout(timer.current);
        timer.current = window.setTimeout(() => void load(bbox, zoom), 400);
    }, [load]);
    useEffect(() => () => { if (timer.current) window.clearTimeout(timer.current); }, []);

    const points = useMemo(() => items.filter((item) => !typeFilter || item.type === typeFilter).map((item) => {
        const cat = TYPE_CATEGORY[item.type] ?? "activity";
        return { id: item.id, latitude: item.place.latitude, longitude: item.place.longitude, label: item.title ?? TYPE_LABELS[item.type] ?? "Activity", kind: item.type, category: cat, color: PIN_COLOR[cat] };
    }), [items, typeFilter]);
    const activeCount = typeFilter ? 1 : 0;

    if (!mounted) return null;

    return createPortal(
        <section className="fixed inset-0 z-50 bg-[#09090f]" aria-label="Viz Map">
            <MapCanvas points={points} selectedId={selectedId} loading={loading} onViewportChange={handleViewport} onSelect={(id) => { setSheetSnap("peek"); setSelectedId(id); }} onClearSelection={() => setSelectedId(null)} />
            <header className="absolute inset-x-0 top-0 z-10 flex items-center justify-between p-4 pointer-events-none">
                <button type="button" onClick={onBack} className="pointer-events-auto grid h-11 w-11 place-items-center rounded-xl border border-white/15 bg-black/70 text-lg text-white backdrop-blur" aria-label="戻る">‹</button>
                <button type="button" onClick={() => setFilterOpen(true)} className="pointer-events-auto inline-flex min-h-11 items-center gap-2 rounded-xl border border-white/15 bg-black/70 px-4 text-xs font-bold text-white backdrop-blur" aria-label="Activity Typeを絞り込む">Filter{activeCount ? <span className="grid h-4 min-w-4 place-items-center rounded-full bg-[color:var(--vc-accent)] px-1 text-[9px] text-black">{activeCount}</span> : null}</button>
            </header>
            {!loading && !error && points.length === 0 ? <p className="pointer-events-none absolute inset-x-0 bottom-[29%] z-10 text-center text-sm text-white/55">このエリアにはActivityがありません</p> : null}
            {error ? <p role="alert" className="absolute inset-x-6 top-20 z-10 rounded-xl border border-red-400/30 bg-black/75 p-3 text-center text-xs text-red-200">{error}</p> : null}

            <GestureSheet open={Boolean(selected)} onClose={() => setSelectedId(null)} snapHeights={["25dvh", "52dvh"]} snap={sheetSnap} onSnapChange={setSheetSnap} className="px-5 pb-[max(20px,env(safe-area-inset-bottom))]" >
                {selected ? <ActivitySheet activity={selected} expanded={sheetSnap === "half"} onExpand={() => setSheetSnap("half")} /> : null}
            </GestureSheet>
            <GestureSheet open={filterOpen} onClose={() => setFilterOpen(false)} className="px-5 pb-[max(20px,env(safe-area-inset-bottom))]">
                <div className="mx-auto w-full max-w-xl py-3"><p className="mb-4 font-mono text-[11px] tracking-[.18em] text-white/55">ACTIVITY TYPE</p>{[null, ...FILTERABLE_TYPES].map((type) => <motion.button key={type ?? "all"} type="button" onClick={() => { setTypeFilter(type); setFilterOpen(false); }} whileTap={reduce ? undefined : { scale: 0.97 }} className="flex w-full items-center gap-3 border-b border-white/10 py-4 text-left text-sm text-white"><span className={typeFilter === type ? "grid h-5 w-5 place-items-center rounded-full bg-[color:var(--vc-accent)] text-xs text-black" : "h-5 w-5 rounded-full border border-white/40"}>{typeFilter === type ? "✓" : ""}</span>{type ? TYPE_LABELS[type] : "All"}</motion.button>)}</div>
            </GestureSheet>
        </section>,
        document.body,
    );
}

function ActivitySheet({ activity, expanded, onExpand }: { activity: MapActivityItem; expanded: boolean; onExpand: () => void }) {
    return <div className="mx-auto flex w-full max-w-xl flex-col gap-3 py-2 text-white"><div className="flex items-center justify-between gap-3"><span className="rounded-full border border-[color:var(--vc-accent-border)] bg-[color:var(--vc-accent-faint)] px-2 py-1 font-mono text-[10px] tracking-[.08em] text-[color:var(--vc-accent)]">{TYPE_LABELS[activity.type] ?? activity.type}</span><time className="text-xs text-white/55">{new Date(activity.starts_at).toLocaleString("ja-JP", { month: "numeric", day: "numeric", hour: "2-digit", minute: "2-digit" })}</time></div><h2 className="m-0 text-lg font-extrabold">{activity.title ?? TYPE_LABELS[activity.type] ?? "Activity"}</h2><p className="m-0 text-sm text-white/70">{activity.place.name} · {activity.place.prefecture}</p>{expanded ? <div className="border-t border-white/10 pt-3 text-sm text-white/70"><p className="m-0">主催者: {activity.author_name ?? "Vizion Member"}</p>{activity.description ? <p className="m-0 mt-2 leading-6 text-white/65">{activity.description}</p> : null}{activity.place.precision === "approximate" ? <p className="m-0 mt-2 text-xs text-white/45">おおよその位置で表示しています</p> : null}</div> : <button type="button" onClick={onExpand} className="mt-1 min-h-10 self-start rounded-xl bg-[color:var(--vc-accent)] px-4 text-sm font-bold text-black">View Activity</button>}</div>;
}
