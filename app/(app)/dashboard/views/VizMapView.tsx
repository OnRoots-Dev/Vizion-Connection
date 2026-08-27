"use client";

import Link from "next/link";
import { createPortal } from "react-dom";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Search, SlidersHorizontal, X } from "lucide-react";
import { GestureSheet } from "@/components/ui/GestureSheet";
import { MapCanvas, type MapBBox, type MapPoint } from "../components/core/MapCanvas";
import { PIN_COLOR, PIN_COLOR_LABEL, type PinCategory } from "../components/core/mapTypes";
import { apiGet, ApiError } from "@/lib/api/core-client";
import type { MapActivityItem } from "@/features/activity/server/map";
import type { ThemeColors } from "../types";

const FILTERS: PinCategory[] = ["activity", "moment", "athlete", "trainer", "crew"];
const PERSISTENT: PinCategory[] = ["business", "event"];
const ROLE_CATEGORY: Record<string, PinCategory> = { Athlete: "athlete", Trainer: "trainer", Crew: "crew", Business: "business" };

function categoryOf(item: MapActivityItem): PinCategory {
    if (item.entity_type === "moment") return "moment";
    if (item.type === "event") return "event";
    return "activity";
}
function viewportKey(b: MapBBox, zoom: number) { return [zoom.toFixed(0), b.minLat.toFixed(3), b.maxLat.toFixed(3), b.minLng.toFixed(3), b.maxLng.toFixed(3)].join(":"); }

export function VizMapView({ t, onBack }: { t: ThemeColors; roleColor: string; onBack: () => void }) {
    void t;
    const cache = useRef(new Map<string, MapActivityItem[]>());
    const timer = useRef<number | null>(null);
    const [items, setItems] = useState<MapActivityItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [selectedId, setSelectedId] = useState<string | null>(null);
    const [selectedPerson, setSelectedPerson] = useState<MapActivityItem | null>(null);
    const [focusPoint, setFocusPoint] = useState<MapPoint | null>(null);
    const [sheetSnap, setSheetSnap] = useState<"peek" | "half">("peek");
    const [filterOpen, setFilterOpen] = useState(false);
    const [regionOpen, setRegionOpen] = useState(false);
    const [search, setSearch] = useState("");
    const [activeFilters, setActiveFilters] = useState<Set<PinCategory>>(() => new Set(FILTERS));
    const [mounted, setMounted] = useState(false);
    const selected = items.find((item) => item.id === selectedId) ?? null;

    useEffect(() => { setMounted(true); }, []);
    useEffect(() => { if (!mounted) return; const previous = document.body.style.overflow; document.body.style.overflow = "hidden"; return () => { document.body.style.overflow = previous; }; }, [mounted]);
    const load = useCallback(async (bbox: MapBBox, zoom: number) => {
        if (bbox.maxLat - bbox.minLat > 30 || bbox.maxLng - bbox.minLng > 40) return;
        const key = viewportKey(bbox, zoom); const cached = cache.current.get(key);
        if (cached) { setItems(cached); setLoading(false); return; }
        setLoading(true); setError("");
        try {
            const query = new URLSearchParams({ min_lat: bbox.minLat.toFixed(5), max_lat: bbox.maxLat.toFixed(5), min_lng: bbox.minLng.toFixed(5), max_lng: bbox.maxLng.toFixed(5), type: "all" });
            const data = await apiGet<{ success: boolean; items: MapActivityItem[] }>(`/api/viz-map?${query}`);
            cache.current.set(key, data.items ?? []); setItems(data.items ?? []);
        } catch (cause) { setError(cause instanceof ApiError ? cause.message : "Viz Mapを読み込めませんでした"); } finally { setLoading(false); }
    }, []);
    const handleViewport = useCallback((bbox: MapBBox, zoom: number) => { if (timer.current) window.clearTimeout(timer.current); timer.current = window.setTimeout(() => void load(bbox, zoom), 400); }, [load]);
    useEffect(() => () => { if (timer.current) window.clearTimeout(timer.current); }, []);

    const points = useMemo(() => {
        const content = items.filter((item) => { const category = categoryOf(item); return PERSISTENT.includes(category) || activeFilters.has(category); });
        const people = new Map<string, MapActivityItem>();
        for (const item of items) { const role = ROLE_CATEGORY[item.author_role ?? ""]; if (role && (PERSISTENT.includes(role) || activeFilters.has(role)) && !people.has(`${role}:${item.user_id}`)) people.set(`${role}:${item.user_id}`, item); }
        return [...content.map((item) => ({ id: item.id, latitude: item.place.latitude, longitude: item.place.longitude, label: item.title ?? PIN_COLOR_LABEL[categoryOf(item)], kind: item.entity_type, category: categoryOf(item), color: PIN_COLOR[categoryOf(item)] })), ...[...people].map(([key, item]) => { const category = ROLE_CATEGORY[item.author_role ?? ""]!; return { id: `person:${key}`, latitude: item.place.latitude, longitude: item.place.longitude, label: item.author_name ?? PIN_COLOR_LABEL[category], kind: "person", category, color: PIN_COLOR[category] }; })];
    }, [items, activeFilters]);
    const searchResults = useMemo(() => { const q = search.trim().toLocaleLowerCase("ja-JP"); if (!q) return []; return items.filter((item) => [item.title, item.description, item.author_name, item.place.name, item.place.prefecture].some((value) => value?.toLocaleLowerCase("ja-JP").includes(q))).slice(0, 6); }, [items, search]);
    const counts = useMemo(() => Object.fromEntries([...FILTERS, ...PERSISTENT].map((category) => [category, items.filter((item) => categoryOf(item) === category || ROLE_CATEGORY[item.author_role ?? ""] === category).length])), [items]);
    const choose = (item: MapActivityItem) => { setSearch(""); setFocusPoint({ id: item.id, latitude: item.place.latitude, longitude: item.place.longitude, label: item.title ?? "", color: PIN_COLOR[categoryOf(item)] }); setSheetSnap("peek"); setSelectedId(item.id); };
    const toggle = (category: PinCategory) => setActiveFilters((current) => { const next = new Set(current); if (next.has(category)) next.delete(category); else next.add(category); return next; });
    if (!mounted) return null;

    return createPortal(<section className="fixed inset-0 z-50 bg-[#09090f]" aria-label="Viz Map">
        <MapCanvas points={points} selectedId={selectedId} focusPoint={focusPoint} loading={loading} onViewportChange={handleViewport} onSelect={(id) => { if (id.startsWith("person:")) { const userId = Number(id.split(":").at(-1)); const person = items.find((item) => item.user_id === userId); if (person) { setSelectedId(null); setSelectedPerson(person); } return; } setSelectedPerson(null); setSheetSnap("peek"); setSelectedId(id); }} onClearSelection={() => { setSelectedId(null); setSelectedPerson(null); }} />
        <header className="pointer-events-none absolute inset-x-0 top-0 z-10 flex items-start justify-between gap-2 p-4">
            <button type="button" onClick={onBack} className="pointer-events-auto grid h-11 w-11 place-items-center rounded-xl border border-white/15 bg-black/70 text-lg text-white backdrop-blur" aria-label="戻る">‹</button>
            <div className="pointer-events-auto relative w-full max-w-md"><label className="flex h-11 items-center gap-2 rounded-xl border border-white/15 bg-black/75 px-3 text-white backdrop-blur"><Search className="h-4 w-4 text-white/55" /><input value={search} onChange={(event) => setSearch(event.target.value)} className="min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-white/45" placeholder="人・Activity・Moment・場所を探す" aria-label="Viz Mapを検索" />{search ? <button type="button" onClick={() => setSearch("")} aria-label="検索をクリア"><X className="h-4 w-4" /></button> : null}</label>{searchResults.length ? <div className="absolute mt-2 w-full overflow-hidden rounded-xl border border-white/10 bg-[#12121a]/95 shadow-xl">{searchResults.map((item) => <button key={item.id} type="button" onClick={() => choose(item)} className="flex w-full items-center gap-3 border-b border-white/8 px-3 py-3 text-left last:border-0 hover:bg-white/5"><span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: PIN_COLOR[categoryOf(item)] }} /><span className="min-w-0"><span className="block truncate text-sm text-white">{item.title || PIN_COLOR_LABEL[categoryOf(item)]}</span><span className="block truncate text-[11px] text-white/50">{item.author_name ?? "Vizion Member"} · {item.place.name}</span></span></button>)}</div> : null}</div>
            <div className="pointer-events-auto flex gap-2"><button type="button" onClick={() => setRegionOpen(true)} className="hidden min-h-11 rounded-xl border border-white/15 bg-black/70 px-3 text-xs font-bold text-white backdrop-blur sm:inline-flex">Explore</button><button type="button" onClick={() => setFilterOpen(true)} className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-white/15 bg-black/70 px-3 text-xs font-bold text-white backdrop-blur" aria-label="表示を絞り込む"><SlidersHorizontal className="h-4 w-4" />Filter</button></div>
        </header>
        {!loading && !error && points.length === 0 ? <p className="pointer-events-none absolute inset-x-0 bottom-[29%] z-10 text-center text-sm text-white/55">このエリアには表示できる情報がありません</p> : null}{error ? <p role="alert" className="absolute inset-x-6 top-20 z-10 rounded-xl border border-red-400/30 bg-black/75 p-3 text-center text-xs text-red-200">{error}</p> : null}
        <GestureSheet open={Boolean(selected || selectedPerson)} onClose={() => { setSelectedId(null); setSelectedPerson(null); }} snapHeights={["25dvh", "52dvh"]} snap={sheetSnap} onSnapChange={setSheetSnap} className="px-5 pb-[max(20px,env(safe-area-inset-bottom))]">{selected ? <ContentSheet item={selected} expanded={sheetSnap === "half"} onExpand={() => setSheetSnap("half")} /> : selectedPerson ? <PersonSheet item={selectedPerson} /> : null}</GestureSheet>
        <GestureSheet open={filterOpen} onClose={() => setFilterOpen(false)} className="px-5 pb-[max(20px,env(safe-area-inset-bottom))]"><div className="mx-auto w-full max-w-xl py-3"><p className="mb-2 font-mono text-[11px] tracking-[.18em] text-white/55">SHOW ON MAP</p>{FILTERS.map((category) => <FilterRow key={category} category={category} enabled={activeFilters.has(category)} count={counts[category] as number} onClick={() => toggle(category)} />)}<p className="mb-2 mt-6 font-mono text-[10px] tracking-[.16em] text-white/40">ALWAYS ON</p>{PERSISTENT.map((category) => <FilterRow key={category} category={category} enabled count={counts[category] as number} />)}</div></GestureSheet>
        <GestureSheet open={regionOpen} onClose={() => setRegionOpen(false)} className="px-5 pb-[max(20px,env(safe-area-inset-bottom))]"><div className="mx-auto w-full max-w-xl py-3 text-white"><p className="font-mono text-[11px] tracking-[.18em] text-white/55">THIS AREA</p><h2 className="mt-2 text-xl font-extrabold">いま地図に見えていること</h2><p className="mt-1 text-sm text-white/60">{items[0]?.place.prefecture ?? "この地域"}で起きているスポーツのつながりを探索できます。</p><div className="mt-5 grid grid-cols-2 gap-2">{["activity", "moment", "athlete", "trainer", "crew", "business", "event"].map((category) => <div key={category} className="rounded-xl border border-white/10 bg-white/[.03] p-3"><span className="inline-block h-2 w-2 rounded-full" style={{ backgroundColor: PIN_COLOR[category as PinCategory] }} /><p className="mt-2 text-xs text-white/55">{PIN_COLOR_LABEL[category as PinCategory]}</p><p className="text-lg font-bold">{counts[category] as number}</p></div>)}</div></div></GestureSheet>
    </section>, document.body);
}

function FilterRow({ category, enabled, count, onClick }: { category: PinCategory; enabled: boolean; count: number; onClick?: () => void }) { return <button type="button" disabled={!onClick} onClick={onClick} className="flex w-full items-center gap-3 border-b border-white/10 py-4 text-left text-sm text-white disabled:cursor-default"><span className="h-3 w-3 rounded-full" style={{ backgroundColor: PIN_COLOR[category] }} /><span className="flex-1">{PIN_COLOR_LABEL[category]}</span><span className="text-xs text-white/45">{count}</span>{onClick ? <span className={enabled ? "grid h-5 w-5 place-items-center rounded-full bg-[color:var(--vc-accent)] text-xs text-black" : "h-5 w-5 rounded-full border border-white/40"}>{enabled ? "✓" : ""}</span> : <span className="text-[10px] text-white/40">表示中</span>}</button>; }
function ContentSheet({ item, expanded, onExpand }: { item: MapActivityItem; expanded: boolean; onExpand: () => void }) { const category = categoryOf(item); return <div className="mx-auto flex w-full max-w-xl flex-col gap-3 py-2 text-white"><div className="flex items-center justify-between gap-3"><span className="rounded-full px-2 py-1 font-mono text-[10px] tracking-[.08em] text-black" style={{ backgroundColor: PIN_COLOR[category] }}>{PIN_COLOR_LABEL[category]}</span><time className="text-xs text-white/55">{new Date(item.starts_at).toLocaleString("ja-JP", { month: "numeric", day: "numeric", hour: "2-digit", minute: "2-digit" })}</time></div><h2 className="m-0 text-lg font-extrabold">{item.title || PIN_COLOR_LABEL[category]}</h2><p className="m-0 text-sm text-white/70">{item.place.name} · {item.place.prefecture}</p>{expanded ? <div className="border-t border-white/10 pt-3 text-sm text-white/70"><p className="m-0">Creator: {item.author_name ?? "Vizion Member"}</p>{item.description ? <p className="m-0 mt-2 leading-6 text-white/65">{item.description}</p> : null}{item.author_slug ? <Link href={`/u/${item.author_slug}`} className="mt-4 inline-flex min-h-10 items-center rounded-xl border border-white/20 px-4 text-sm font-bold text-white">Vizion IDを見る</Link> : null}</div> : <button type="button" onClick={onExpand} className="mt-1 min-h-10 self-start rounded-xl bg-[color:var(--vc-accent)] px-4 text-sm font-bold text-black">詳細を見る</button>}</div>; }
function PersonSheet({ item }: { item: MapActivityItem }) { const category = ROLE_CATEGORY[item.author_role ?? ""] ?? "athlete"; return <div className="mx-auto flex w-full max-w-xl flex-col gap-3 py-2 text-white"><span className="w-fit rounded-full px-2 py-1 font-mono text-[10px] tracking-[.08em] text-black" style={{ backgroundColor: PIN_COLOR[category] }}>{PIN_COLOR_LABEL[category]}</span><h2 className="m-0 text-lg font-extrabold">{item.author_name ?? "Vizion Member"}</h2><p className="m-0 text-sm text-white/65">{item.place.prefecture}で活動中</p>{item.author_slug ? <Link href={`/u/${item.author_slug}`} className="mt-3 inline-flex min-h-10 w-fit items-center rounded-xl border border-white/20 px-4 text-sm font-bold text-white">Vizion IDを見る</Link> : null}</div>; }
