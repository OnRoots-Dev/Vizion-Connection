"use client";

import Image from "next/image";
import Link from "next/link";
import { createPortal } from "react-dom";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Search, SlidersHorizontal, X } from "lucide-react";
import { GestureSheet } from "@/components/ui/GestureSheet";
import { SheetReveal } from "@/components/ui/SheetReveal";
import { useToast } from "@/components/ui/toast";
import { CommentsSheet } from "../components/core/CommentsSheet";
import { CommentButton } from "../components/feed/actions";
import { MapCanvas, type MapBBox, type MapPoint } from "../components/core/MapCanvas";
import { PIN_COLOR, PIN_COLOR_LABEL, type PinCategory } from "../components/core/mapTypes";
import { BusinessAdBanner } from "./BusinessAdBanner";
import { apiGet, ApiError } from "@/lib/api/core-client";
import type { MapActivityItem } from "@/features/activity/server/map";
import type { MapPlacePoi } from "@/features/place/server/places";
import { prefectureCenter } from "@/features/place/prefecture-centers";
import type { ThemeColors } from "../types";
import { PLAN_PIN_SIZE, planHasSpotlight } from "@/features/business-monetize/constants";
import type { BusinessMonetizePlan } from "@/features/business-monetize/types";

const FILTERS: PinCategory[] = ["activity", "moment", "athlete", "trainer", "crew"];
const PERSISTENT: PinCategory[] = ["business", "event", "place"];
const ROLE_CATEGORY: Record<string, PinCategory> = { Athlete: "athlete", Trainer: "trainer", Crew: "crew", Business: "business" };
const BUSINESS_PIN_SIZE: Record<string, number> = { roots: 13, signal: 15, presence: 17, legacy: 19 };
const PLACE_TYPE_LABEL: Record<string, string> = { facility: "施設", park: "公園", school: "学校", stadium: "スタジアム", gym: "ジム", outdoor: "アウトドア", other: "その他" };
const ORGANIC_CATEGORIES: PinCategory[] = ["activity", "moment", "athlete", "trainer", "crew", "event"];

/** クラスタシート用の汎用エントリ（Activity/Moment/Person/Placeを横断する）。 */
type SheetEntry = { id: string; title: string; category: PinCategory; authorSlug?: string | null };

type MonetizePin = {
    slug: string;
    displayName: string;
    plan: BusinessMonetizePlan;
    latitude: number;
    longitude: number;
    locationName: string;
    prefecture: string;
};

function categoryOf(item: MapActivityItem): PinCategory {
    if (item.entity_type === "moment") return "moment";
    if (item.entity_type === "person") return ROLE_CATEGORY[item.author_role ?? ""] ?? "athlete";
    if (item.type === "event") return "event";
    return "activity";
}
function viewportKey(b: MapBBox, zoom: number) { return [zoom.toFixed(0), b.minLat.toFixed(3), b.maxLat.toFixed(3), b.minLng.toFixed(3), b.maxLng.toFixed(3)].join(":"); }
function pad2(n: number) { return String(n).padStart(2, "0"); }
/** Pinに出すタイムラベル。直前アクティブ / 直近の完了 / 今後48時間の予定を見せる。 */
function timeLabelFor(item: MapActivityItem): string {
    const elapsedMin = Math.round((Date.now() - new Date(item.starts_at).getTime()) / 60000); // 正=過去 負=未来
    if (item.entity_type === "person") {
        const days = Math.max(0, Math.round(elapsedMin / 1440));
        return days < 1 ? "今日アクティブ" : `${days}日前`;
    }
    if (elapsedMin <= 0) {
        const hours = Math.round(-elapsedMin / 60);
        const dt = new Date(item.starts_at);
        if (hours < 24) return `本日 ${dt.getHours()}:${pad2(dt.getMinutes())}`;
        if (hours < 48) return `明日 ${dt.getHours()}:${pad2(dt.getMinutes())}`;
        return `${dt.getMonth() + 1}/${dt.getDate()} ${dt.getHours()}:${pad2(dt.getMinutes())}`;
    }
    const hours = Math.round(elapsedMin / 60);
    if (hours < 24) return `${Math.max(1, hours)}h前`;
    return `${Math.max(1, Math.round(hours / 24))}日前`;
}

export function VizMapView({ t, initialPrefecture, onBack }: { t: ThemeColors; roleColor: string; initialPrefecture?: string | null; onBack: () => void }) {
    void t;
    const initialCenter = useMemo<[number, number] | undefined>(() => prefectureCenter(initialPrefecture) ?? undefined, [initialPrefecture]);
    const cache = useRef(new Map<string, { items: MapActivityItem[]; places: MapPlacePoi[] }>());
    const pending = useRef(new Map<string, Promise<{ items: MapActivityItem[]; places: MapPlacePoi[] }>>());
    const timer = useRef<number | null>(null);
    const [items, setItems] = useState<MapActivityItem[]>([]);
    const [places, setPlaces] = useState<MapPlacePoi[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [selectedId, setSelectedId] = useState<string | null>(null);
    const [selectedPerson, setSelectedPerson] = useState<MapActivityItem | null>(null);
    const [selectedPlace, setSelectedPlace] = useState<MapPlacePoi | null>(null);
    const [focusPoint, setFocusPoint] = useState<MapPoint | null>(null);
    const [monetizePins, setMonetizePins] = useState<MonetizePin[]>([]);
    const [selectedMonetize, setSelectedMonetize] = useState<MonetizePin | null>(null);
    const [sheetSnap, setSheetSnap] = useState<"peek" | "half">("peek");
    const [filterOpen, setFilterOpen] = useState(false);
    const [createOpen, setCreateOpen] = useState(false);
    const [search, setSearch] = useState("");
    const [activeFilters, setActiveFilters] = useState<Set<PinCategory>>(() => new Set(FILTERS));
    const [mounted, setMounted] = useState(false);
    const [desktopDetails, setDesktopDetails] = useState(false);
    const [commentMomentId, setCommentMomentId] = useState<string | null>(null);
    const [selectedCluster, setSelectedCluster] = useState<SheetEntry[]>([]);
    const toast = useToast();
    const selected = items.find((item) => item.id === selectedId) ?? null;

    useEffect(() => { setMounted(true); }, []);
    useEffect(() => {
        let cancelled = false;
        apiGet<{ success: boolean; pins: MonetizePin[] }>("/api/business-monetize/public?mode=pins")
            .then((data) => { if (!cancelled) setMonetizePins(data.pins ?? []); })
            .catch(() => { if (!cancelled) setMonetizePins([]); });
        return () => { cancelled = true; };
    }, []);
    useEffect(() => { const media = window.matchMedia("(min-width: 768px)"); const sync = () => setDesktopDetails(media.matches); sync(); media.addEventListener("change", sync); return () => media.removeEventListener("change", sync); }, []);
    useEffect(() => { if (!mounted) return; const previous = document.body.style.overflow; document.body.style.overflow = "hidden"; return () => { document.body.style.overflow = previous; }; }, [mounted]);
    const load = useCallback(async (bbox: MapBBox, zoom: number) => {
        if (bbox.maxLat - bbox.minLat > 30 || bbox.maxLng - bbox.minLng > 40) return;
        const key = viewportKey(bbox, zoom);
        const cached = cache.current.get(key);
        if (cached) { setItems(cached.items); setPlaces(cached.places); setLoading(false); return; }
        setLoading(true); setError("");
        try {
            let request = pending.current.get(key);
            if (!request) {
                const query = new URLSearchParams({ min_lat: bbox.minLat.toFixed(5), max_lat: bbox.maxLat.toFixed(5), min_lng: bbox.minLng.toFixed(5), max_lng: bbox.maxLng.toFixed(5), type: "all" });
                request = apiGet<{ success: boolean; items: MapActivityItem[]; places: MapPlacePoi[] }>(`/api/viz-map?${query}`).then((data) => ({ items: data.items ?? [], places: data.places ?? [] }));
                pending.current.set(key, request);
                void request.finally(() => pending.current.delete(key)).catch(() => undefined);
            }
            const payload = await request;
            cache.current.set(key, payload);
            setItems(payload.items);
            setPlaces(payload.places);
        } catch (cause) { setError(cause instanceof ApiError ? cause.message : "Viz Mapを読み込めませんでした"); } finally { setLoading(false); }
    }, []);
    const handleViewport = useCallback((bbox: MapBBox, zoom: number) => { if (timer.current) window.clearTimeout(timer.current); timer.current = window.setTimeout(() => void load(bbox, zoom), 400); }, [load]);
    useEffect(() => () => { if (timer.current) window.clearTimeout(timer.current); }, []);

    const points = useMemo(() => {
        const content = items.filter((item) => {
            if (item.entity_type === "person") return false; // 人物Pinはpeople側で統一出力
            const category = categoryOf(item);
            return PERSISTENT.includes(category) || activeFilters.has(category);
        });
        const people = new Map<string, MapActivityItem>();
        for (const item of items) { const role = ROLE_CATEGORY[item.author_role ?? ""]; if (role && (PERSISTENT.includes(role) || activeFilters.has(role)) && !people.has(`${role}:${item.user_id}`)) people.set(`${role}:${item.user_id}`, item); }
        return [...content.map((item) => ({ id: item.id, latitude: item.place.latitude, longitude: item.place.longitude, label: item.title ?? PIN_COLOR_LABEL[categoryOf(item)], kind: item.entity_type, category: categoryOf(item), color: PIN_COLOR[categoryOf(item)], timeLabel: timeLabelFor(item) })), ...[...people].map(([key, item]) => { const category = ROLE_CATEGORY[item.author_role ?? ""]!; return { id: `person:${key}`, latitude: item.place.latitude, longitude: item.place.longitude, label: item.author_name ?? PIN_COLOR_LABEL[category], kind: "person", category, color: PIN_COLOR[category], size: category === "business" ? BUSINESS_PIN_SIZE[item.author_sponsor_plan ?? ""] ?? 12 : 10, timeLabel: timeLabelFor(item) }; }), ...monetizePins.map((pin): MapPoint => ({ id: `monetize:${pin.slug}:${pin.latitude}:${pin.longitude}`, latitude: pin.latitude, longitude: pin.longitude, label: pin.displayName || pin.locationName, kind: "business", category: "business", color: PIN_COLOR.business, size: PLAN_PIN_SIZE[pin.plan] ?? PLAN_PIN_SIZE.LOCAL })), ...places.map((place): MapPoint => ({ id: `place:${place.id}`, latitude: place.latitude, longitude: place.longitude, label: place.name, kind: "place", category: "place", color: PIN_COLOR.place, size: 8, timeLabel: PLACE_TYPE_LABEL[place.place_type] ?? place.place_type }))];
    }, [items, activeFilters, monetizePins, places]);
    type SearchResultEntry = { kind: "item" | "place"; id: string; title: string; subtitle: string; item: MapActivityItem | null; place: MapPlacePoi | null };
    const searchResults = useMemo<SearchResultEntry[]>(() => {
        const q = search.trim().toLocaleLowerCase("ja-JP").replace(/^#/, "");
        if (!q) return [];
        const matchedItems = items.filter((item) => [item.title, item.description, item.author_name, item.place.name, item.place.prefecture, ...(item.tags ?? [])].some((value) => value?.toLocaleLowerCase("ja-JP").includes(q)));
        const matchedPlaces = places.filter((place) => place.name.toLocaleLowerCase("ja-JP").includes(q) || place.prefecture.toLocaleLowerCase("ja-JP").includes(q));
        return [
            ...matchedItems.map((item): SearchResultEntry => ({ kind: "item", id: item.id, title: item.title ?? PIN_COLOR_LABEL[categoryOf(item)], subtitle: `${item.author_name ?? "Vizion Member"} · ${item.place.name}`, item, place: null })),
            ...matchedPlaces.map((place): SearchResultEntry => ({ kind: "place", id: `place:${place.id}`, title: place.name, subtitle: `${place.prefecture} · ${PLACE_TYPE_LABEL[place.place_type] ?? place.place_type}`, item: null, place })),
        ].slice(0, 6);
    }, [items, places, search]);
    const counts = useMemo(() => Object.fromEntries([...FILTERS, ...PERSISTENT].map((category) => [category, items.filter((item) => categoryOf(item) === category || ROLE_CATEGORY[item.author_role ?? ""] === category).length])), [items]);
    const peopleCount = (counts.athlete as number) + (counts.trainer as number) + (counts.crew as number);
    const choose = (entry: SearchResultEntry) => {
        setSearch("");
        setSelectedCluster([]);
        if (entry.kind === "place") {
            const place = entry.place!;
            setSelectedId(null); setSelectedPerson(null); setSelectedMonetize(null);
            setSelectedPlace(place);
            setFocusPoint({ id: `place:${place.id}`, latitude: place.latitude, longitude: place.longitude, label: place.name, color: PIN_COLOR.place });
            setSheetSnap("peek");
            toast.show({ title: "Place on the map", description: place.name, tone: "success" });
            return;
        }
        const item = entry.item!;
        if (item.entity_type === "person") {
            setSelectedId(null); setSelectedMonetize(null); setSelectedPlace(null);
            setSelectedPerson(item);
            setFocusPoint({ id: `person:${item.user_id}`, latitude: item.place.latitude, longitude: item.place.longitude, label: item.author_name ?? "", color: PIN_COLOR[ROLE_CATEGORY[item.author_role ?? ""] ?? "athlete"] });
            setSheetSnap("peek");
            toast.show({ title: "Athlete on the map", description: item.author_name ?? "Athlete", tone: "success" });
            return;
        }
        setSelectedId(item.id);
        setSelectedPerson(null); setSelectedMonetize(null); setSelectedPlace(null);
        setFocusPoint({ id: item.id, latitude: item.place.latitude, longitude: item.place.longitude, label: item.title ?? "", color: PIN_COLOR[categoryOf(item)] });
        setSheetSnap("peek");
        toast.show({ title: "Activity on the map", description: item.title || "Location detail opened", tone: "success" });
    };
    const openCluster = useCallback((clusterPoints: MapPoint[]) => {
        const next: SheetEntry[] = [];
        for (const point of clusterPoints) {
            if (point.id.startsWith("place:")) {
                const place = places.find((p) => `place:${p.id}` === point.id);
                if (place) next.push({ id: `place:${place.id}`, title: place.name, category: "place" });
                continue;
            }
            const item = items.find((item) => item.id === point.id);
            if (item) next.push({ id: item.id, title: item.title ?? PIN_COLOR_LABEL[categoryOf(item)], category: categoryOf(item), authorSlug: item.author_slug });
        }
        if (next.length === 0) return;
        setSelectedId(null);
        setSelectedPerson(null);
        setSelectedMonetize(null);
        setSelectedPlace(null);
        setSelectedCluster(next);
        setSheetSnap("peek");
        toast.show({ title: `${next.length} items around here`, description: next.length === 1 ? "Open the item to view the detail." : "Choose a nearby item to open details.", tone: "neutral" });
    }, [items, places, toast]);
    const toggle = (category: PinCategory) => setActiveFilters((current) => { const next = new Set(current); if (next.has(category)) next.delete(category); else next.add(category); return next; });
    const openClusterEntry = useCallback((entry: SheetEntry) => {
        setSelectedCluster([]);
        setSheetSnap("peek");
        if (entry.id.startsWith("place:")) {
            const place = places.find((p) => `place:${p.id}` === entry.id);
            if (place) { setSelectedId(null); setSelectedPerson(null); setSelectedMonetize(null); setSelectedPlace(place); }
            return;
        }
        const item = items.find((item) => item.id === entry.id);
        if (item) { setSelectedId(item.id); setSelectedPerson(null); setSelectedPlace(null); setSelectedMonetize(null); }
    }, [items, places]);
    if (!mounted) return null;

    return createPortal(<section className="fixed inset-0 z-50 bg-[#09090f]" aria-label="Viz Map">
        <MapCanvas points={points} selectedId={selectedId} focusPoint={focusPoint} initialCenter={initialCenter} loading={loading} onViewportChange={handleViewport} onClusterSelect={openCluster} onSelect={(id) => { if (id.startsWith("person:")) { const userId = Number(id.split(":").at(-1)); const person = items.find((item) => item.user_id === userId); if (person) { setSelectedId(null); setSelectedCluster([]); setSelectedPlace(null); setSelectedPerson(person); } return; } if (id.startsWith("place:")) { const place = places.find((p) => `place:${p.id}` === id); if (place) { setSelectedId(null); setSelectedCluster([]); setSelectedPerson(null); setSelectedMonetize(null); setSelectedPlace(place); setSheetSnap("peek"); } return; } if (id.startsWith("monetize:")) { const match = monetizePins.find((pin) => `monetize:${pin.slug}:${pin.latitude}:${pin.longitude}` === id); if (match) { setSelectedId(null); setSelectedCluster([]); setSelectedPlace(null); setSelectedMonetize(match); setSheetSnap("peek"); } return; } setSelectedPerson(null); setSelectedMonetize(null); setSelectedPlace(null); setSelectedCluster([]); setSheetSnap("peek"); setSelectedId(id); }} onClearSelection={() => { setSelectedId(null); setSelectedPerson(null); setSelectedMonetize(null); setSelectedPlace(null); setSelectedCluster([]); }} />
        <header className="pointer-events-none absolute inset-x-0 top-0 z-10 flex items-start justify-between gap-2 p-4">
            <button type="button" onClick={onBack} className="pointer-events-auto grid h-11 w-11 place-items-center rounded-xl border border-black/10 bg-white/95 text-lg text-[#111] shadow-sm backdrop-blur" aria-label="戻る">‹</button>
            <div className="pointer-events-auto relative w-full max-w-md"><label className="flex h-11 items-center gap-2 rounded-xl border border-black/10 bg-white px-3 text-[#111] shadow-lg"><Search className="h-4 w-4 text-black/50" /><input value={search} onChange={(event) => setSearch(event.target.value)} className="min-w-0 flex-1 bg-transparent text-sm text-black outline-none placeholder:text-black/45" placeholder="人・Activity・Moment・場所・Tagを探す" aria-label="Viz Mapを検索" />{search ? <button type="button" onClick={() => setSearch("")} aria-label="検索をクリア"><X className="h-4 w-4" /></button> : null}</label>{searchResults.length ? <div className="absolute mt-2 w-full overflow-hidden rounded-xl border border-black/10 bg-white shadow-xl">{searchResults.map((entry) => <button key={entry.id} type="button" onClick={() => choose(entry)} className="flex w-full items-center gap-3 border-b border-black/8 px-3 py-3 text-left last:border-0 hover:bg-black/[.03]"><span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: entry.kind === "place" ? PIN_COLOR.place : PIN_COLOR[categoryOf(entry.item!)] }} /><span className="min-w-0"><span className="block truncate text-sm text-black">{entry.title}</span><span className="block truncate text-[11px] text-black/50">{entry.subtitle}</span></span></button>)}</div> : null}</div>
            <div className="pointer-events-auto relative"><button type="button" onClick={() => setFilterOpen((open) => !open)} className="grid h-11 w-11 place-items-center rounded-xl border border-black/10 bg-white/95 text-[#111] shadow-sm" aria-label="表示を絞り込む"><SlidersHorizontal className="h-4 w-4" /></button>{filterOpen ? <div className="absolute right-0 mt-2 w-60 rounded-xl border border-black/10 bg-white p-3 shadow-xl"><p className="mb-2 text-[10px] font-bold tracking-[.12em] text-black/45">SHOW ON MAP</p>{FILTERS.map((category) => <FilterRow key={category} category={category} enabled={activeFilters.has(category)} count={counts[category] as number} onClick={() => toggle(category)} />)}<p className="mb-1 mt-3 text-[10px] font-bold tracking-[.12em] text-black/40">ALWAYS ON · Place / Business / Event</p></div> : null}</div>
        </header>
        {loading ? <div role="status" className="absolute left-1/2 top-[80px] -translate-x-1/2 z-10 rounded-full border border-black/10 bg-white/95 px-3 py-1 font-mono text-[10px] font-bold text-black/60 shadow-sm">Loading</div> : null}
        {!loading && !error ? (items.length === 0 ? <ColdStartCta onCreate={() => { window.location.href = "/dashboard?view=activities"; }} /> : !points.some((point) => ORGANIC_CATEGORIES.includes(point.category ?? "activity")) ? <p className="pointer-events-none absolute inset-x-0 bottom-[29%] z-10 text-center text-sm text-white/55">選択中のFilterに一致する情報がありません</p> : null) : null}{error ? <p role="alert" className="absolute inset-x-6 top-20 z-10 rounded-xl border border-red-400/30 bg-black/75 p-3 text-center text-xs text-red-200">{error}</p> : null}
        <div className="absolute left-4 top-20 z-10 rounded-xl border border-black/10 bg-white/92 px-3 py-2 shadow-sm backdrop-blur"><p className="m-0 text-[10px] font-bold tracking-[.14em] text-black/45">{(items[0]?.place.prefecture ?? places[0]?.prefecture ?? "CURRENT AREA").toUpperCase()}</p><p className="m-0 mt-1 text-xs font-semibold text-black/70">{(counts.activity as number)} Activities · {(counts.moment as number)} Moments · {peopleCount} People · {places.length} Places</p></div>
        <div className="absolute left-4 top-[148px] z-10"><BusinessAdBanner compact /></div>
        <div className="absolute bottom-28 right-4 z-[60]"><button type="button" onClick={() => setCreateOpen((open) => !open)} className="inline-flex min-h-11 items-center rounded-xl bg-[#111] px-4 text-xs font-bold text-white shadow-lg">＋ Create</button>{createOpen ? <div className="absolute bottom-13 right-0 flex w-40 flex-col overflow-hidden rounded-xl border border-black/10 bg-white shadow-xl"><a href="/dashboard?view=activities" className="px-4 py-3 text-sm font-bold text-black hover:bg-black/[.03]">Activity</a><a href="/dashboard?view=moments" className="border-t border-black/10 px-4 py-3 text-sm font-bold text-black hover:bg-black/[.03]">Moment</a></div> : null}</div>
        <GestureSheet open={Boolean(selected || selectedPerson || selectedPlace || selectedMonetize || selectedCluster.length)} onClose={() => { setSelectedId(null); setSelectedPerson(null); setSelectedMonetize(null); setSelectedPlace(null); setSelectedCluster([]); }} side={desktopDetails ? "right" : "bottom"} snapHeights={desktopDetails ? undefined : ["45dvh", "62dvh"]} snap={sheetSnap} onSnapChange={setSheetSnap} className="px-5 pb-[max(20px,env(safe-area-inset-bottom))]"><SheetReveal key={selected?.id ?? selectedPerson?.id ?? (selectedPlace ? `p:${selectedPlace.id}` : selectedMonetize ? `m:${selectedMonetize.slug}` : selectedCluster.length ? `c:${selectedCluster[0].id}` : "none")}>{selected ? <MapContextHeader label={selected.entity_type === "moment" ? "Around this moment" : "Around this activity"} count={1} dominant={PIN_COLOR_LABEL[categoryOf(selected)]} /> : selectedPerson ? <MapContextHeader label="Around this person" count={1} dominant={PIN_COLOR_LABEL[ROLE_CATEGORY[selectedPerson.author_role ?? ""] ?? "athlete"]} /> : selectedPlace ? <MapContextHeader label="Around this place" count={1} dominant="Place" /> : selectedMonetize ? <MapContextHeader label="Sponsored nearby" count={1} dominant="Business" /> : selectedCluster.length ? (() => { const summary = clusterSummary(selectedCluster); return <MapContextHeader label="Around here" count={summary.total} dominant={summary.topLabel} />; })() : null}{selected ? <ContentSheet item={selected} expanded={desktopDetails || sheetSnap === "half"} onExpand={() => setSheetSnap("half")} onComments={() => setCommentMomentId(selected.entity_type === "moment" ? selected.id : null)} /> : selectedPerson ? <PersonSheet item={selectedPerson} /> : selectedPlace ? <PlaceSheet place={selectedPlace} activities={items.filter((item) => item.place.id === selectedPlace.id)} onOpen={(item) => { setSelectedPlace(null); setSelectedId(item.id); setSheetSnap("peek"); toast.show({ title: "Activity detail opened", description: item.title || "Related activity detail", tone: "success" }); }} /> : selectedMonetize ? <MonetizeSheet pin={selectedMonetize} /> : selectedCluster.length ? <ClusterSheet entries={selectedCluster} onOpen={openClusterEntry} /> : null}</SheetReveal></GestureSheet>
        <CommentsSheet open={Boolean(commentMomentId)} momentId={commentMomentId ?? ""} viewerId={null} t={t} onClose={() => setCommentMomentId(null)} />
    </section>, document.body);
}

function FilterRow({ category, enabled, count, onClick }: { category: PinCategory; enabled: boolean; count: number; onClick?: () => void }) { return <button type="button" disabled={!onClick} onClick={onClick} className="flex w-full items-center gap-3 border-b border-black/8 py-2.5 text-left text-sm text-black disabled:cursor-default"><span className="h-3 w-3 rounded-full" style={{ backgroundColor: PIN_COLOR[category] }} /><span className="flex-1">{PIN_COLOR_LABEL[category]}</span><span className="text-xs text-black/45">{count}</span>{onClick ? <span className={enabled ? "grid h-5 w-5 place-items-center rounded-full bg-black text-xs text-white" : "h-5 w-5 rounded-full border border-black/30"}>{enabled ? "✓" : ""}</span> : null}</button>; }
function clusterSummary(entries: SheetEntry[]) {
    const grouped = new Map<string, number>();
    for (const entry of entries) {
        const label = PIN_COLOR_LABEL[entry.category] ?? "Activity";
        grouped.set(label, (grouped.get(label) ?? 0) + 1);
    }
    const [topLabel, topCount] = [...grouped.entries()].sort(([, a], [, b]) => b - a)[0] ?? ["Activity", 0];
    return { total: entries.length, topLabel, topCount, label: entries.length === 1 ? "1 nearby" : `${entries.length} nearby` };
}
function MapContextHeader({ label, count, dominant }: { label: string; count: number; dominant: string }) { return <div className="mx-auto flex w-full max-w-xl items-center justify-between border-b border-white/10 pb-2 pt-1 text-white"><div><p className="m-0 text-[10px] font-bold uppercase tracking-[.14em] text-white/55">{label}</p><p className="m-0 mt-1 text-sm font-semibold text-white">{count} nearby</p></div><div className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[.12em] text-[color:var(--vc-accent)]">{dominant}</div></div>; }
function Creator({ item }: { item: MapActivityItem }) { return <div className="flex items-center gap-3 border-t border-white/10 pt-3"><div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-full bg-white/10 text-sm font-bold">{item.author_avatar_url ? <Image src={item.author_avatar_url} alt="" fill sizes="40px" className="object-cover" unoptimized /> : <span className="flex h-full w-full items-center justify-center text-white">{(item.author_name ?? "V").slice(0, 1)}</span>}</div><div><p className="m-0 text-sm font-bold text-white">{item.author_name ?? "Vizion Member"}</p><p className="m-0 text-xs text-white/50">{item.author_role ?? "Member"} · Vizion ID</p></div></div>; }
function ContentSheet({ item, expanded, onExpand, onComments }: { item: MapActivityItem; expanded: boolean; onExpand: () => void; onComments: () => void }) { const category = categoryOf(item); return <div className="mx-auto flex w-full max-w-xl flex-col gap-3 py-2 text-white"><div className="flex items-center justify-between gap-3"><span className="rounded-full px-2 py-1 font-mono text-[10px] tracking-[.08em] text-black" style={{ backgroundColor: PIN_COLOR[category] }}>{PIN_COLOR_LABEL[category]}</span><time className="text-xs text-white/55">{new Date(item.starts_at).toLocaleString("ja-JP", { month: "numeric", day: "numeric", hour: "2-digit", minute: "2-digit" })}</time>{item.entity_type === "activity" ? <span className="rounded-full border px-2 py-1 font-mono text-[10px] tracking-[.08em]" style={{ borderColor: item.status === "completed" ? "rgba(50,210,120,0.5)" : "rgba(255,255,255,0.25)", color: item.status === "completed" ? "#32D278" : "#fff" }}>{item.status === "completed" ? "COMPLETED" : item.status === "planned" ? "RECRUITING" : (item.status ?? "ACTIVITY").toUpperCase()}</span> : null}</div><h2 className="m-0 text-lg font-extrabold">{item.title || PIN_COLOR_LABEL[category]}</h2><p className="m-0 text-sm text-white/70">{item.place.name} · {item.place.prefecture}</p>{expanded ? <div className="text-sm text-white/70"><Creator item={item} />{item.image_url ? <div className="relative mt-3 overflow-hidden rounded-xl"><Image src={item.image_url} alt={item.title || "Moment media"} width={800} height={450} className="max-h-56 w-full rounded-xl object-cover" unoptimized /></div> : null}{item.description ? <p className="m-0 mt-3 leading-6 text-white/65">{item.description}</p> : null}{item.entity_type === "moment" ? <div className="mt-3"><CommentButton count={item.comment_count ?? 0} onClick={onComments} /></div> : null}<div className="mt-4 flex flex-wrap gap-2">{item.author_slug ? <Link href={`/u/${item.author_slug}`} className="inline-flex min-h-10 items-center rounded-xl border border-white/20 px-4 text-sm font-bold text-white">View Profile</Link> : null}{item.entity_type === "activity" ? <a href={`/dashboard?view=activities&activityId=${item.id}`} className="inline-flex min-h-10 items-center rounded-xl bg-[color:var(--vc-accent)] px-4 text-sm font-bold text-black">Open Detail</a> : <button type="button" onClick={onExpand} className="inline-flex min-h-10 items-center rounded-xl bg-[color:var(--vc-accent)] px-4 text-sm font-bold text-black">Open Detail</button>}</div></div> : <div className="space-y-3 rounded-2xl border border-white/10 bg-white/5 p-3"><div className="flex items-start gap-3"><div className="grid h-10 w-10 place-items-center rounded-full border border-white/15 bg-white/5 text-xs font-bold text-white">{item.author_name?.slice(0, 1) ?? "V"}</div><div className="min-w-0 flex-1"><p className="m-0 text-sm font-bold text-white">{item.author_name ?? "Vizion Member"}</p><p className="m-0 mt-1 text-[11px] text-white/60">{item.type} · {item.place.prefecture}</p></div></div>{item.image_url ? <div className="relative h-28 overflow-hidden rounded-xl"><Image src={item.image_url} alt="Preview media" width={600} height={120} className="h-28 w-full rounded-xl object-cover" unoptimized /></div> : null}<div className="flex flex-wrap gap-2">{item.author_slug ? <Link href={`/u/${item.author_slug}`} className="inline-flex min-h-10 items-center rounded-xl border border-white/20 px-3 text-xs font-bold text-white">View Profile</Link> : null}{item.entity_type === "activity" ? <a href={`/dashboard?view=activities&activityId=${item.id}`} className="inline-flex min-h-10 items-center rounded-xl bg-[color:var(--vc-accent)] px-3 text-xs font-bold text-black">Open Detail</a> : <button type="button" onClick={onExpand} className="inline-flex min-h-10 items-center rounded-xl bg-[color:var(--vc-accent)] px-3 text-xs font-bold text-black">View Activity</button>}</div></div>}</div>; }
function PersonSheet({ item }: { item: MapActivityItem }) { const category = ROLE_CATEGORY[item.author_role ?? ""] ?? "athlete"; const business = category === "business"; const sponsored = business && Boolean(item.author_sponsor_plan); return <div className="mx-auto flex w-full max-w-xl flex-col gap-3 py-2 text-white"><span className="w-fit rounded-full px-2 py-1 font-mono text-[10px] tracking-[.08em] text-black" style={{ backgroundColor: PIN_COLOR[category] }}>{sponsored ? "BUSINESS SPOTLIGHT" : PIN_COLOR_LABEL[category]}</span><Creator item={item} />{sponsored ? <p className="m-0 text-xs font-bold text-[#00BFA5]">{item.author_sponsor_plan!.toUpperCase()} PLAN · MAP掲載中</p> : null}<p className="m-0 text-sm text-white/65">{item.place.prefecture}で活動中{item.entity_type === "person" ? <> · {timeLabelFor(item)}</> : null}</p>{item.author_slug ? <Link href={`/u/${item.author_slug}`} className="mt-3 inline-flex min-h-10 w-fit items-center rounded-xl border border-white/20 px-4 text-sm font-bold text-white">{business ? "Businessを見る" : "プロフィールを見る"}</Link> : null}</div>; }
function ClusterSheet({ entries, onOpen }: { entries: SheetEntry[]; onOpen: (entry: SheetEntry) => void }) {
    const grouped = useMemo(() => {
        const map = new Map<string, SheetEntry[]>();
        for (const entry of entries) {
            const key = PIN_COLOR_LABEL[entry.category] ?? "Activity";
            const current = map.get(key) ?? [];
            current.push(entry);
            map.set(key, current);
        }
        return [...map.entries()].sort(([, a], [, b]) => b.length - a.length);
    }, [entries]);
    const leading = grouped[0];
    const leadingLabel = leading ? leading[0] : "Activity";
    const leadingCount = leading ? leading[1].length : 0;
    const profileSlug = entries.find((entry) => entry.authorSlug)?.authorSlug;
    return <div className="mx-auto flex w-full max-w-xl flex-col gap-3 py-2 text-white"><div className="flex items-center justify-between gap-2"><div className="flex items-center gap-2"><span className="rounded-full bg-[color:var(--vc-accent)] px-2 py-1 font-mono text-[10px] font-bold tracking-[.08em] text-black">{entries.length}</span><p className="m-0 text-left text-xs font-bold uppercase tracking-[.14em] text-white/60">Nearby</p></div><span className="rounded-full border border-white/15 bg-white/5 px-2 py-1 text-[10px] font-bold uppercase tracking-[.12em] text-white/80">{leadingLabel}</span></div><p className="m-0 text-sm text-white/75">{leading ? `${leadingLabel} is strongest here · ${leadingCount} items` : "Nearby item"}</p><div className="mt-2 flex flex-col gap-2">{grouped.map(([type, group]) => <button key={type} type="button" onClick={() => onOpen(group[0])} className="flex w-full items-center justify-between rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-left"><span className="flex items-center gap-2"><span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: PIN_COLOR[group[0].category] }} /> <span className="text-sm font-semibold text-white">{type}</span></span><span className="text-sm font-bold text-[color:var(--vc-accent)]">{group.length}</span></button>)}</div><div className="flex flex-wrap gap-2">{entries.slice(0, 3).map((entry) => <button key={entry.id} type="button" onClick={() => onOpen(entry)} className="inline-flex min-h-10 items-center rounded-xl border border-white/15 bg-white/5 px-3 text-xs font-bold text-white">{entry.title}</button>)}</div>{profileSlug ? <Link href={`/u/${profileSlug}`} className="mt-2 inline-flex min-h-10 w-fit items-center rounded-xl border border-white/20 px-4 text-sm font-bold text-white">View Profile</Link> : null}</div>;
}
function MonetizeSheet({ pin }: { pin: MonetizePin }) { const spotlight = planHasSpotlight(pin.plan); return <div className="mx-auto flex w-full max-w-xl flex-col gap-3 py-2 text-white"><span className="w-fit rounded-full px-2 py-1 font-mono text-[10px] tracking-[.08em] text-black" style={{ backgroundColor: PIN_COLOR.business }}>{spotlight ? "BUSINESS SPOTLIGHT" : "SPONSORED"}</span><div className="flex items-center gap-3 border-t border-white/10 pt-3"><div className="grid h-10 w-10 shrink-0 place-items-center overflow-hidden rounded-full bg-[#00BFA5]/20 text-sm font-bold text-[#00BFA5]">B</div><div><p className="m-0 text-sm font-bold text-white">{pin.displayName || pin.slug}</p><p className="m-0 text-xs text-white/50">@{pin.slug} · Business</p></div></div><p className="m-0 text-xs font-bold text-[#00BFA5]">{pin.plan} PLAN · MAP掲載中</p><p className="m-0 text-sm text-white/65">{pin.locationName} · {pin.prefecture}</p><Link href={`/u/${pin.slug}`} className="mt-3 inline-flex min-h-10 w-fit items-center rounded-xl border border-white/20 px-4 text-sm font-bold text-white">Businessを見る</Link></div>; }
function PlaceSheet({ place, activities, onOpen }: { place: MapPlacePoi; activities: MapActivityItem[]; onOpen?: (item: MapActivityItem) => void }) {
    return <div className="mx-auto flex w-full max-w-xl flex-col gap-3 py-2 text-white"><div className="flex items-center justify-between gap-3"><span className="rounded-full px-2 py-1 font-mono text-[10px] tracking-[.08em] text-black" style={{ backgroundColor: PIN_COLOR.place }}>PLACE</span><span className="rounded-full border border-white/15 bg-white/5 px-2 py-1 font-mono text-[10px] tracking-[.08em] text-white/70">{place.precision === "exact" ? "EXACT · 詳細位置" : "APPROX · おおよその位置"}</span></div><h2 className="m-0 text-lg font-extrabold">{place.name}</h2><p className="m-0 text-sm text-white/70">{place.prefecture} · {PLACE_TYPE_LABEL[place.place_type] ?? place.place_type}</p><div className="mt-2">{activities.length ? <div className="flex flex-col gap-2">{activities.slice(0, 4).map((item) => <button key={item.id} type="button" onClick={() => onOpen?.(item)} className="flex w-full items-center justify-between gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-left"><span className="min-w-0"><span className="block truncate text-sm font-semibold text-white">{item.title || PIN_COLOR_LABEL[categoryOf(item)]}</span><span className="block truncate text-[11px] text-white/55">{item.author_name ?? "Vizion Member"} · {timeLabelFor(item)}</span></span><span className="shrink-0 rounded-full border border-white/15 px-2 py-0.5 font-mono text-[10px]" style={{ color: PIN_COLOR[categoryOf(item)] }}>{PIN_COLOR_LABEL[categoryOf(item)]}</span></button>)}</div> : <div className="rounded-xl border-2 border-dashed border-white/15 p-4 text-center text-xs leading-5 text-white/55">この場所でのActivityはまだありません。<br />ここが次のスポットになります。</div>}</div></div>;
}
function ColdStartCta({ onCreate }: { onCreate: () => void }) {
    return <div className="pointer-events-none absolute inset-x-4 bottom-[24%] z-10 flex justify-center"><div className="pointer-events-auto w-full max-w-sm rounded-2xl border-2 border-dashed border-white/25 bg-[#101018]/85 p-5 text-center text-white shadow-2xl backdrop-blur"><p className="m-0 font-mono text-[10px] font-bold tracking-[.18em] text-[color:var(--vc-accent)]">PATTERN E · COLD START</p><h2 className="m-0 mt-2 text-xl font-extrabold tracking-tight text-white">最初の一人になろう</h2><p className="m-0 mt-2 text-sm leading-6 text-white/60">このエリアにはまだActivityがありません。あなたの最初の一歩が、この地図をここから始めます。</p><button type="button" onClick={onCreate} className="mt-4 inline-flex min-h-11 w-full items-center justify-center rounded-xl bg-[var(--vc-accent)] px-4 text-sm font-bold text-black shadow-lg">＋ 最初の Activity を投稿する</button></div></div>;
}
