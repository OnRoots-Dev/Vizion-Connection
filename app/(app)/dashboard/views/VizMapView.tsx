"use client";

import Link from "next/link";
import { createPortal } from "react-dom";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Search, SlidersHorizontal, X } from "lucide-react";
import { GestureSheet } from "@/components/ui/GestureSheet";
import { CommentsSheet } from "../components/core/CommentsSheet";
import { CommentButton } from "../components/feed/actions";
import { MapCanvas, type MapBBox, type MapPoint } from "../components/core/MapCanvas";
import { PIN_COLOR, PIN_COLOR_LABEL, type PinCategory } from "../components/core/mapTypes";
import { BusinessAdBanner } from "./BusinessAdBanner";
import { apiGet, ApiError } from "@/lib/api/core-client";
import type { MapActivityItem } from "@/features/activity/server/map";
import type { ThemeColors } from "../types";
import { PLAN_PIN_SIZE, planHasSpotlight } from "@/features/business-monetize/constants";
import type { BusinessMonetizePlan } from "@/features/business-monetize/types";

const FILTERS: PinCategory[] = ["activity", "moment", "athlete", "trainer", "crew"];
const PERSISTENT: PinCategory[] = ["business", "event"];
const ROLE_CATEGORY: Record<string, PinCategory> = { Athlete: "athlete", Trainer: "trainer", Crew: "crew", Business: "business" };
const BUSINESS_PIN_SIZE: Record<string, number> = { roots: 13, signal: 15, presence: 17, legacy: 19 };

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
    if (item.type === "event") return "event";
    return "activity";
}
function viewportKey(b: MapBBox, zoom: number) { return [zoom.toFixed(0), b.minLat.toFixed(3), b.maxLat.toFixed(3), b.minLng.toFixed(3), b.maxLng.toFixed(3)].join(":"); }

export function VizMapView({ t, onBack }: { t: ThemeColors; roleColor: string; onBack: () => void }) {
    void t;
    const cache = useRef(new Map<string, MapActivityItem[]>());
    const pending = useRef(new Map<string, Promise<MapActivityItem[]>>());
    const timer = useRef<number | null>(null);
    const [items, setItems] = useState<MapActivityItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [selectedId, setSelectedId] = useState<string | null>(null);
    const [selectedPerson, setSelectedPerson] = useState<MapActivityItem | null>(null);
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
        const key = viewportKey(bbox, zoom); const cached = cache.current.get(key);
        if (cached) { setItems(cached); setLoading(false); return; }
        setLoading(true); setError("");
        try {
            let request = pending.current.get(key);
            if (!request) {
                const query = new URLSearchParams({ min_lat: bbox.minLat.toFixed(5), max_lat: bbox.maxLat.toFixed(5), min_lng: bbox.minLng.toFixed(5), max_lng: bbox.maxLng.toFixed(5), type: "all" });
                request = apiGet<{ success: boolean; items: MapActivityItem[] }>(`/api/viz-map?${query}`).then((data) => data.items ?? []);
                pending.current.set(key, request);
                void request.finally(() => pending.current.delete(key)).catch(() => undefined);
            }
            const nextItems = await request;
            cache.current.set(key, nextItems); setItems(nextItems);
        } catch (cause) { setError(cause instanceof ApiError ? cause.message : "Viz Mapを読み込めませんでした"); } finally { setLoading(false); }
    }, []);
    const handleViewport = useCallback((bbox: MapBBox, zoom: number) => { if (timer.current) window.clearTimeout(timer.current); timer.current = window.setTimeout(() => void load(bbox, zoom), 400); }, [load]);
    useEffect(() => () => { if (timer.current) window.clearTimeout(timer.current); }, []);

    const points = useMemo(() => {
        const content = items.filter((item) => { const category = categoryOf(item); return PERSISTENT.includes(category) || activeFilters.has(category); });
        const people = new Map<string, MapActivityItem>();
        for (const item of items) { const role = ROLE_CATEGORY[item.author_role ?? ""]; if (role && (PERSISTENT.includes(role) || activeFilters.has(role)) && !people.has(`${role}:${item.user_id}`)) people.set(`${role}:${item.user_id}`, item); }
        return [...content.map((item) => ({ id: item.id, latitude: item.place.latitude, longitude: item.place.longitude, label: item.title ?? PIN_COLOR_LABEL[categoryOf(item)], kind: item.entity_type, category: categoryOf(item), color: PIN_COLOR[categoryOf(item)] })), ...[...people].map(([key, item]) => { const category = ROLE_CATEGORY[item.author_role ?? ""]!; return { id: `person:${key}`, latitude: item.place.latitude, longitude: item.place.longitude, label: item.author_name ?? PIN_COLOR_LABEL[category], kind: "person", category, color: PIN_COLOR[category], size: category === "business" ? BUSINESS_PIN_SIZE[item.author_sponsor_plan ?? ""] ?? 12 : 10 }; }), ...monetizePins.map((pin): MapPoint => ({ id: `monetize:${pin.slug}:${pin.latitude}:${pin.longitude}`, latitude: pin.latitude, longitude: pin.longitude, label: pin.displayName || pin.locationName, kind: "business", category: "business", color: PIN_COLOR.business, size: PLAN_PIN_SIZE[pin.plan] ?? PLAN_PIN_SIZE.LOCAL }))];
    }, [items, activeFilters, monetizePins]);
    const searchResults = useMemo(() => { const q = search.trim().toLocaleLowerCase("ja-JP").replace(/^#/, ""); if (!q) return []; return items.filter((item) => [item.title, item.description, item.author_name, item.place.name, item.place.prefecture, ...(item.tags ?? [])].some((value) => value?.toLocaleLowerCase("ja-JP").includes(q))).slice(0, 6); }, [items, search]);
    const counts = useMemo(() => Object.fromEntries([...FILTERS, ...PERSISTENT].map((category) => [category, items.filter((item) => categoryOf(item) === category || ROLE_CATEGORY[item.author_role ?? ""] === category).length])), [items]);
    const choose = (item: MapActivityItem) => { setSearch(""); setFocusPoint({ id: item.id, latitude: item.place.latitude, longitude: item.place.longitude, label: item.title ?? "", color: PIN_COLOR[categoryOf(item)] }); setSheetSnap("peek"); setSelectedId(item.id); };
    const toggle = (category: PinCategory) => setActiveFilters((current) => { const next = new Set(current); if (next.has(category)) next.delete(category); else next.add(category); return next; });
    if (!mounted) return null;

    return createPortal(<section className="fixed inset-0 z-50 bg-[#09090f]" aria-label="Viz Map">
        <MapCanvas points={points} selectedId={selectedId} focusPoint={focusPoint} loading={loading} onViewportChange={handleViewport} onSelect={(id) => { if (id.startsWith("person:")) { const userId = Number(id.split(":").at(-1)); const person = items.find((item) => item.user_id === userId); if (person) { setSelectedId(null); setSelectedPerson(person); } return; } if (id.startsWith("monetize:")) { const match = monetizePins.find((pin) => `monetize:${pin.slug}:${pin.latitude}:${pin.longitude}` === id); if (match) { setSelectedId(null); setSelectedMonetize(match); setSheetSnap("peek"); } return; } setSelectedPerson(null); setSelectedMonetize(null); setSheetSnap("peek"); setSelectedId(id); }} onClearSelection={() => { setSelectedId(null); setSelectedPerson(null); setSelectedMonetize(null); }} />
        <header className="pointer-events-none absolute inset-x-0 top-0 z-10 flex items-start justify-between gap-2 p-4">
            <button type="button" onClick={onBack} className="pointer-events-auto grid h-11 w-11 place-items-center rounded-xl border border-black/10 bg-white/95 text-lg text-[#111] shadow-sm backdrop-blur" aria-label="戻る">‹</button>
            <div className="pointer-events-auto relative w-full max-w-md"><label className="flex h-11 items-center gap-2 rounded-xl border border-black/10 bg-white px-3 text-[#111] shadow-lg"><Search className="h-4 w-4 text-black/50" /><input value={search} onChange={(event) => setSearch(event.target.value)} className="min-w-0 flex-1 bg-transparent text-sm text-black outline-none placeholder:text-black/45" placeholder="人・Activity・Moment・場所・Tagを探す" aria-label="Viz Mapを検索" />{search ? <button type="button" onClick={() => setSearch("")} aria-label="検索をクリア"><X className="h-4 w-4" /></button> : null}</label>{searchResults.length ? <div className="absolute mt-2 w-full overflow-hidden rounded-xl border border-black/10 bg-white shadow-xl">{searchResults.map((item) => <button key={item.id} type="button" onClick={() => choose(item)} className="flex w-full items-center gap-3 border-b border-black/8 px-3 py-3 text-left last:border-0 hover:bg-black/[.03]"><span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: PIN_COLOR[categoryOf(item)] }} /><span className="min-w-0"><span className="block truncate text-sm text-black">{item.title || PIN_COLOR_LABEL[categoryOf(item)]}</span><span className="block truncate text-[11px] text-black/50">{item.author_name ?? "Vizion Member"} · {item.place.name}</span></span></button>)}</div> : null}</div>
            <div className="pointer-events-auto relative"><button type="button" onClick={() => setFilterOpen((open) => !open)} className="grid h-11 w-11 place-items-center rounded-xl border border-black/10 bg-white/95 text-[#111] shadow-sm" aria-label="表示を絞り込む"><SlidersHorizontal className="h-4 w-4" /></button>{filterOpen ? <div className="absolute right-0 mt-2 w-60 rounded-xl border border-black/10 bg-white p-3 shadow-xl"><p className="mb-2 text-[10px] font-bold tracking-[.12em] text-black/45">SHOW ON MAP</p>{FILTERS.map((category) => <FilterRow key={category} category={category} enabled={activeFilters.has(category)} count={counts[category] as number} onClick={() => toggle(category)} />)}<p className="mb-1 mt-3 text-[10px] font-bold tracking-[.12em] text-black/40">ALWAYS ON · Business / Event</p></div> : null}</div>
        </header>
        {loading ? <div role="status" className="absolute left-1/2 top-[80px] -translate-x-1/2 z-10 rounded-full border border-black/10 bg-white/95 px-3 py-1 font-mono text-[10px] font-bold text-black/60 shadow-sm">Loading</div> : null}
        {!loading && !error && points.length === 0 ? <p className="pointer-events-none absolute inset-x-0 bottom-[29%] z-10 text-center text-sm text-white/55">{items.length ? "選択中のFilterに一致する情報がありません" : "このエリアには表示できる情報がありません"}</p> : null}{error ? <p role="alert" className="absolute inset-x-6 top-20 z-10 rounded-xl border border-red-400/30 bg-black/75 p-3 text-center text-xs text-red-200">{error}</p> : null}
        <div className="absolute left-4 top-20 z-10 rounded-xl border border-black/10 bg-white/92 px-3 py-2 shadow-sm backdrop-blur"><p className="m-0 text-[10px] font-bold tracking-[.14em] text-black/45">{items[0]?.place.prefecture?.toUpperCase() ?? "CURRENT AREA"}</p><p className="m-0 mt-1 text-xs font-semibold text-black/70">{counts.activity as number} Activities · {counts.moment as number} Moments · {counts.athlete as number + counts.trainer as number + counts.crew as number} People</p></div>
        <div className="absolute left-4 top-[148px] z-10"><BusinessAdBanner compact /></div>
        <div className="absolute bottom-6 right-4 z-10"><button type="button" onClick={() => setCreateOpen((open) => !open)} className="inline-flex min-h-11 items-center rounded-xl bg-[#111] px-4 text-xs font-bold text-white shadow-lg">＋ Create</button>{createOpen ? <div className="absolute bottom-13 right-0 flex w-40 flex-col overflow-hidden rounded-xl border border-black/10 bg-white shadow-xl"><Link href="/dashboard?view=activities" className="px-4 py-3 text-sm font-bold text-black hover:bg-black/[.03]">Activity</Link><Link href="/dashboard?view=moments" className="border-t border-black/10 px-4 py-3 text-sm font-bold text-black hover:bg-black/[.03]">Moment</Link></div> : null}</div>
        <GestureSheet open={Boolean(selected || selectedPerson || selectedMonetize)} onClose={() => { setSelectedId(null); setSelectedPerson(null); setSelectedMonetize(null); }} side={desktopDetails ? "right" : "bottom"} snapHeights={desktopDetails ? undefined : ["25dvh", "52dvh"]} snap={sheetSnap} onSnapChange={setSheetSnap} className="px-5 pb-[max(20px,env(safe-area-inset-bottom))]">{selected ? <ContentSheet item={selected} expanded={desktopDetails || sheetSnap === "half"} onExpand={() => setSheetSnap("half")} onComments={() => setCommentMomentId(selected.entity_type === "moment" ? selected.id : null)} /> : selectedPerson ? <PersonSheet item={selectedPerson} /> : selectedMonetize ? <MonetizeSheet pin={selectedMonetize} /> : null}</GestureSheet>
        <CommentsSheet open={Boolean(commentMomentId)} momentId={commentMomentId ?? ""} viewerId={null} t={t} onClose={() => setCommentMomentId(null)} />
    </section>, document.body);
}

function FilterRow({ category, enabled, count, onClick }: { category: PinCategory; enabled: boolean; count: number; onClick?: () => void }) { return <button type="button" disabled={!onClick} onClick={onClick} className="flex w-full items-center gap-3 border-b border-black/8 py-2.5 text-left text-sm text-black disabled:cursor-default"><span className="h-3 w-3 rounded-full" style={{ backgroundColor: PIN_COLOR[category] }} /><span className="flex-1">{PIN_COLOR_LABEL[category]}</span><span className="text-xs text-black/45">{count}</span>{onClick ? <span className={enabled ? "grid h-5 w-5 place-items-center rounded-full bg-black text-xs text-white" : "h-5 w-5 rounded-full border border-black/30"}>{enabled ? "✓" : ""}</span> : null}</button>; }
function Creator({ item }: { item: MapActivityItem }) { return <div className="flex items-center gap-3 border-t border-white/10 pt-3"><div className="grid h-10 w-10 shrink-0 place-items-center overflow-hidden rounded-full bg-white/10 text-sm font-bold">{item.author_avatar_url ? <img src={item.author_avatar_url} alt="" className="h-full w-full object-cover" /> : (item.author_name ?? "V").slice(0, 1)}</div><div><p className="m-0 text-sm font-bold text-white">{item.author_name ?? "Vizion Member"}</p><p className="m-0 text-xs text-white/50">{item.author_role ?? "Member"} · Vizion ID</p></div></div>; }
function ContentSheet({ item, expanded, onExpand, onComments }: { item: MapActivityItem; expanded: boolean; onExpand: () => void; onComments: () => void }) { const category = categoryOf(item); return <div className="mx-auto flex w-full max-w-xl flex-col gap-3 py-2 text-white"><div className="flex items-center justify-between gap-3"><span className="rounded-full px-2 py-1 font-mono text-[10px] tracking-[.08em] text-black" style={{ backgroundColor: PIN_COLOR[category] }}>{PIN_COLOR_LABEL[category]}</span><time className="text-xs text-white/55">{new Date(item.starts_at).toLocaleString("ja-JP", { month: "numeric", day: "numeric", hour: "2-digit", minute: "2-digit" })}</time></div><h2 className="m-0 text-lg font-extrabold">{item.title || PIN_COLOR_LABEL[category]}</h2><p className="m-0 text-sm text-white/70">{item.place.name} · {item.place.prefecture}</p>{expanded ? <div className="text-sm text-white/70"><Creator item={item} />{item.image_url ? <img src={item.image_url} alt="Moment media" className="mt-3 max-h-56 w-full rounded-xl object-cover" /> : null}{item.description ? <p className="m-0 mt-3 leading-6 text-white/65">{item.description}</p> : null}{item.entity_type === "moment" ? <div className="mt-3"><CommentButton count={item.comment_count ?? 0} onClick={onComments} /></div> : null}{item.author_slug ? <Link href={`/u/${item.author_slug}`} className="mt-4 inline-flex min-h-10 items-center rounded-xl border border-white/20 px-4 text-sm font-bold text-white">プロフィールを見る</Link> : null}</div> : <button type="button" onClick={onExpand} className="mt-1 min-h-10 self-start rounded-xl bg-[color:var(--vc-accent)] px-4 text-sm font-bold text-black">詳細を見る</button>}</div>; }
function PersonSheet({ item }: { item: MapActivityItem }) { const category = ROLE_CATEGORY[item.author_role ?? ""] ?? "athlete"; const business = category === "business"; const sponsored = business && Boolean(item.author_sponsor_plan); return <div className="mx-auto flex w-full max-w-xl flex-col gap-3 py-2 text-white"><span className="w-fit rounded-full px-2 py-1 font-mono text-[10px] tracking-[.08em] text-black" style={{ backgroundColor: PIN_COLOR[category] }}>{sponsored ? "BUSINESS SPOTLIGHT" : PIN_COLOR_LABEL[category]}</span><Creator item={item} />{sponsored ? <p className="m-0 text-xs font-bold text-[#00BFA5]">{item.author_sponsor_plan!.toUpperCase()} PLAN · MAP掲載中</p> : null}<p className="m-0 text-sm text-white/65">{item.place.prefecture}で活動中</p>{item.author_slug ? <Link href={`/u/${item.author_slug}`} className="mt-3 inline-flex min-h-10 w-fit items-center rounded-xl border border-white/20 px-4 text-sm font-bold text-white">{business ? "Businessを見る" : "プロフィールを見る"}</Link> : null}</div>; }
function MonetizeSheet({ pin }: { pin: MonetizePin }) { const spotlight = planHasSpotlight(pin.plan); return <div className="mx-auto flex w-full max-w-xl flex-col gap-3 py-2 text-white"><span className="w-fit rounded-full px-2 py-1 font-mono text-[10px] tracking-[.08em] text-black" style={{ backgroundColor: PIN_COLOR.business }}>{spotlight ? "BUSINESS SPOTLIGHT" : "BUSINESS"}</span><div className="flex items-center gap-3 border-t border-white/10 pt-3"><div className="grid h-10 w-10 shrink-0 place-items-center overflow-hidden rounded-full bg-[#00BFA5]/20 text-sm font-bold text-[#00BFA5]">B</div><div><p className="m-0 text-sm font-bold text-white">{pin.displayName || pin.slug}</p><p className="m-0 text-xs text-white/50">@{pin.slug} · Business</p></div></div><p className="m-0 text-xs font-bold text-[#00BFA5]">{pin.plan} PLAN · MAP掲載中</p><p className="m-0 text-sm text-white/65">{pin.locationName} · {pin.prefecture}</p><Link href={`/u/${pin.slug}`} className="mt-3 inline-flex min-h-10 w-fit items-center rounded-xl border border-white/20 px-4 text-sm font-bold text-white">Businessを見る</Link></div>; }
