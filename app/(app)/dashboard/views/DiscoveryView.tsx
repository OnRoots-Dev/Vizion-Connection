"use client";

import { useEffect, useMemo, useState, type ReactNode } from "react";
import { motion } from "framer-motion";
import type { ProfileData } from "@/features/profile/types";
import type { DashboardView, ThemeColors } from "@/app/(app)/dashboard/types";
import { SectionCard, SLabel, ViewHeader } from "@/app/(app)/dashboard/components/ui";
import type { AdItem } from "@/lib/ads-shared";
import { isLocalPlan } from "@/lib/ads-shared";
import AdCard from "@/components/AdCard";
import SponsorBadge from "@/components/SponsorBadge";

type DiscoveryUser = {
    slug: string;
    display_name: string;
    role: string;
    avatar_url?: string | null;
    cheer_count: number;
    referral_count: number;
    region?: string | null;
    prefecture?: string | null;
    sport?: string | null;
    sponsor_plan?: string | null;
    plan_priority?: number;
    discovery_fixed?: boolean;
};

const ROLE_COLORS: Record<string, string> = {
    Athlete: "#FF5050",
    Trainer: "#32D278",
    Members: "#FFC81E",
    Business: "#3C8CFF",
};

const LOCATION_LABEL_MAP: Record<string, string> = {
    tokyo: "東京",
    osaka: "大阪",
    hokkaido: "北海道",
    fukuoka: "福岡",
    aichi: "愛知",
    kanagawa: "神奈川",
    saitama: "埼玉",
    chiba: "千葉",
    hyogo: "兵庫",
    kyoto: "京都",
    shizuoka: "静岡",
    miyagi: "宮城",
    okinawa: "沖縄",
    niigata: "新潟",
    nagano: "長野",
    gifu: "岐阜",
    gunma: "群馬",
    ibaraki: "茨城",
    tochigi: "栃木",
    nara: "奈良",
    shiga: "滋賀",
    wakayama: "和歌山",
    kagoshima: "鹿児島",
    kumamoto: "熊本",
    oita: "大分",
    miyazaki: "宮崎",
    saga: "佐賀",
    nagasaki: "長崎",
    yamanashi: "山梨",
    ishikawa: "石川",
    toyama: "富山",
    fukui: "福井",
    mie: "三重",
    okayama: "岡山",
    hiroshima: "広島",
    yamaguchi: "山口",
    ehime: "愛媛",
    kagawa: "香川",
    kochi: "高知",
    tokushima: "徳島",
    aomori: "青森",
    iwate: "岩手",
    akita: "秋田",
    yamagata: "山形",
    fukushima: "福島",
    shimane: "島根",
    tottori: "鳥取",
    北海道: "北海道",
    東北: "東北",
    関東: "関東",
    中部: "中部",
    近畿: "近畿",
    "中国・四国": "中国・四国",
    "九州・沖縄": "九州・沖縄",
};

function formatLocationLabel(value?: string | null) {
    if (!value) return "-";
    const trimmed = value.trim();
    const normalized = trimmed.toLowerCase().replace(/\s+/g, "").replace(/[-_]/g, "");
    return LOCATION_LABEL_MAP[trimmed] ?? LOCATION_LABEL_MAP[normalized] ?? trimmed;
}

export function DiscoveryView({ profile, t, roleColor, setView, ads, onOpenProfile }: {
    profile: ProfileData;
    t: ThemeColors;
    roleColor: string;
    setView: (v: DashboardView) => void;
    ads: AdItem[];
    onOpenProfile?: (slug: string) => void;
}) {
    const [q, setQ] = useState("");
    const [role, setRole] = useState("");
    const [region, setRegion] = useState("");
    const [prefecture, setPrefecture] = useState("");
    const [sort, setSort] = useState<"all" | "cheer" | "referral" | "new">("all");
    const [loading, setLoading] = useState(true);
    const [users, setUsers] = useState<DiscoveryUser[]>([]);
    const [picks, setPicks] = useState<{ cheer: DiscoveryUser[]; referral: DiscoveryUser[] }>({ cheer: [], referral: [] });

    function trackDiscoveryEvent(payload: { eventType: "impression" | "detail_open" | "search"; targetSlug?: string; queryText?: string }) {
        const body = JSON.stringify({ ...payload, source: "dashboard" });
        if (typeof navigator !== "undefined" && typeof navigator.sendBeacon === "function") {
            navigator.sendBeacon("/api/discovery/track", new Blob([body], { type: "application/json" }));
            return;
        }
        fetch("/api/discovery/track", { method: "POST", headers: { "Content-Type": "application/json" }, body }).catch(() => undefined);
    }

    const localAds = ads.filter((ad) => ad.adScope === "regional" || isLocalPlan(ad.plan));
    const nationalAds = ads.filter((ad) => ad.adScope === "national" || !isLocalPlan(ad.plan));
    const heroPriority = ["title", "executive", "champion", "prime"];
    const topHero = [...nationalAds].sort((a, b) => {
        const ai = heroPriority.indexOf(a.plan);
        const bi = heroPriority.indexOf(b.plan);
        return (ai === -1 ? 99 : ai) - (bi === -1 ? 99 : bi);
    })[0];
    const mediumInline = localAds[0] ?? nationalAds[0] ?? null;
    const sideSmallAds = [...localAds, ...nationalAds].slice(0, 2);

    const query = useMemo(() => {
        const sp = new URLSearchParams();
        if (q.trim()) sp.set("q", q.trim());
        if (role) sp.set("role", role);
        if (region.trim()) sp.set("region", region.trim());
        if (prefecture.trim()) sp.set("prefecture", prefecture.trim());
        sp.set("sort", sort);
        return sp.toString();
    }, [q, role, region, prefecture, sort]);

    useEffect(() => {
        const visitKey = new Intl.DateTimeFormat("en-CA", {
            timeZone: "Asia/Tokyo",
            year: "numeric",
            month: "2-digit",
            day: "2-digit",
        }).format(new Date());
        const storageKey = `vz:discovery_visit:${visitKey}`;
        if (typeof window !== "undefined" && window.sessionStorage.getItem(storageKey) === "done") {
            return;
        }

        fetch("/api/missions/progress", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ required_action: "discovery_visit" }),
        })
            .then(() => {
                if (typeof window !== "undefined") {
                    window.sessionStorage.setItem(storageKey, "done");
                }
            })
            .catch(() => undefined);
    }, []);

    useEffect(() => {
        setLoading(true);
        fetch(`/api/discovery?${query}`)
            .then((r) => r.json())
            .then((d) => {
                setUsers(d.users ?? []);
                setPicks(d.picks ?? { cheer: [], referral: [] });
            })
            .catch(() => {
                setUsers([]);
                setPicks({ cheer: [], referral: [] });
            })
            .finally(() => setLoading(false));
    }, [query]);

    useEffect(() => {
        if (!q.trim() && !role && !region.trim() && !prefecture.trim()) return;
        trackDiscoveryEvent({ eventType: "search", queryText: query });
    }, [q, role, region, prefecture, query]);

    useEffect(() => {
        if (users.length === 0) return;
        users.slice(0, 12).forEach((user) => {
            trackDiscoveryEvent({ eventType: "impression", targetSlug: user.slug });
        });
    }, [users]);

    const sortTabs: Array<{ id: "all" | "cheer" | "referral" | "new"; label: string }> = [
        { id: "all", label: "総合レーダー" },
        { id: "cheer", label: "Cheer急上昇" },
        { id: "referral", label: "紹介加速" },
        { id: "new", label: "新着" },
    ];

    return (
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <ViewHeader title="Discovery" sub="全ユーザー探索・推しレーダー" onBack={() => setView("home")} t={t} roleColor={roleColor} />
            {topHero ? (
                <AdCard ad={topHero} size="hero" />
            ) : (
                <SectionCard t={t}>
                    <SLabel text="AD SLOT" color="#FFD600" />
                    <p style={{ margin: 0, fontSize: 11, color: t.sub, opacity: 0.5 }}>全国スポンサー広告枠（空き枠）</p>
                </SectionCard>
            )}

            <SectionCard t={t} accentColor={roleColor}>
                <SLabel text="Vizion Radar" color={roleColor} />
                <div style={{ position: "relative", borderRadius: 16, overflow: "hidden", border: `1px solid ${roleColor}25`, background: "linear-gradient(145deg, rgba(255,255,255,0.02), rgba(255,255,255,0.01))", padding: 14 }}>
                    <div style={{ position: "absolute", top: -45, right: -45, width: 160, height: 160, borderRadius: "50%", background: `radial-gradient(circle, ${roleColor}20, transparent 70%)`, pointerEvents: "none" }} />
                    <p style={{ margin: "0 0 10px", fontSize: 10, color: t.sub, opacity: 0.7 }}>検索条件を設定すると、ロール・地域・推し指標でユーザーを即抽出できます。</p>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 8 }}>
                        <label style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                            <span style={{ fontSize: 9, color: t.sub, opacity: 0.8 }}>キーワード</span>
                            <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="ユーザーID / アカウント名で検索" style={{ width: "100%", padding: "10px 12px", borderRadius: 10, border: `1px solid ${t.border}`, background: "rgba(255,255,255,0.03)", color: t.text, fontSize: 12 }} />
                        </label>
                        <label style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                            <span style={{ fontSize: 9, color: t.sub, opacity: 0.8 }}>ロール</span>
                            <select value={role} onChange={(e) => setRole(e.target.value)} style={{ width: "100%", padding: "10px 12px", borderRadius: 10, border: `1px solid ${t.border}`, background: "rgba(255,255,255,0.03)", color: t.text, fontSize: 12 }}>
                                <option value="">全ロール</option>
                                <option value="Athlete">Athlete</option>
                                <option value="Trainer">Trainer</option>
                                <option value="Members">Members</option>
                                <option value="Business">Business</option>
                            </select>
                        </label>
                        <label style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                            <span style={{ fontSize: 9, color: t.sub, opacity: 0.8 }}>地域</span>
                            <input value={region} onChange={(e) => setRegion(e.target.value)} placeholder="地域名で検索" style={{ width: "100%", padding: "10px 12px", borderRadius: 10, border: `1px solid ${t.border}`, background: "rgba(255,255,255,0.03)", color: t.text, fontSize: 12 }} />
                        </label>
                        <label style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                            <span style={{ fontSize: 9, color: t.sub, opacity: 0.8 }}>都道府県</span>
                            <input value={prefecture} onChange={(e) => setPrefecture(e.target.value)} placeholder="都道府県名で検索" style={{ width: "100%", padding: "10px 12px", borderRadius: 10, border: `1px solid ${t.border}`, background: "rgba(255,255,255,0.03)", color: t.text, fontSize: 12 }} />
                        </label>
                    </div>
                    <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                        {sortTabs.map((tab) => (
                            <button key={tab.id} onClick={() => setSort(tab.id)} style={{ padding: "6px 12px", borderRadius: 999, border: "none", cursor: "pointer", fontSize: 11, background: sort === tab.id ? `${roleColor}22` : "rgba(255,255,255,0.05)", color: sort === tab.id ? roleColor : t.sub, outline: sort === tab.id ? `1px solid ${roleColor}40` : "none" }}>
                                {tab.label}
                            </button>
                        ))}
                    </div>
                </div>
            </SectionCard>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(260px,1fr))", gap: 12 }}>
                <SectionCard t={t}>
                    <SLabel text="本日の推し / Cheer" color="#FFD600" />
                    <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
                        {picks.cheer.slice(0, 5).map((u, i) => (
                            <motion.button key={`c-${u.slug}`} type="button" onClick={() => { trackDiscoveryEvent({ eventType: "detail_open", targetSlug: u.slug }); onOpenProfile?.(u.slug); }} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }} style={{ textDecoration: "none", border: "none", background: "transparent", padding: 0, cursor: "pointer" }}>
                                <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 10px", borderRadius: 10, background: "rgba(255,214,0,0.04)", border: "1px solid rgba(255,214,0,0.2)" }}>
                                    <span style={{ fontSize: 9, fontFamily: "monospace", color: "#FFD600" }}>{String(i + 1).padStart(2, "0")}</span>
                                    <span style={{ fontSize: 11, color: t.text, flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{u.display_name}</span>
                                    <span style={{ fontSize: 10, color: "#FFD600", fontFamily: "monospace" }}>★{u.cheer_count}</span>
                                </div>
                            </motion.button>
                        ))}
                    </div>
                </SectionCard>

                <SectionCard t={t}>
                    <SLabel text="本日の推し / Referral" color={roleColor} />
                    <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
                        {picks.referral.slice(0, 5).map((u, i) => (
                            <motion.button key={`r-${u.slug}`} type="button" onClick={() => { trackDiscoveryEvent({ eventType: "detail_open", targetSlug: u.slug }); onOpenProfile?.(u.slug); }} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }} style={{ textDecoration: "none", border: "none", background: "transparent", padding: 0, cursor: "pointer" }}>
                                <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 10px", borderRadius: 10, background: `${roleColor}08`, border: `1px solid ${roleColor}25` }}>
                                    <span style={{ fontSize: 9, fontFamily: "monospace", color: roleColor }}>{String(i + 1).padStart(2, "0")}</span>
                                    <span style={{ fontSize: 11, color: t.text, flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{u.display_name}</span>
                                    <span style={{ fontSize: 10, color: roleColor, fontFamily: "monospace" }}>紹介{u.referral_count}</span>
                                </div>
                            </motion.button>
                        ))}
                    </div>
                </SectionCard>
            </div>

            <SectionCard t={t} accentColor={roleColor}>
                <SLabel text="Discovery Results" color={roleColor} />
                {loading ? (
                    <p style={{ fontSize: 12, color: t.sub, margin: 0 }}>レーダー同期中...</p>
                ) : users.length === 0 ? (
                    <p style={{ fontSize: 12, color: t.sub, margin: 0 }}>条件に一致するユーザーがいません。</p>
                ) : (
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(260px,1fr))", gap: 12 }}>
                        {users.flatMap((u, i) => {
                            const rc = ROLE_COLORS[u.role] ?? roleColor;
                            const locationLabel = [formatLocationLabel(u.region), u.prefecture ? formatLocationLabel(u.prefecture) : null].filter((value, index, arr) => value && (index === 0 || value !== arr[0])).join(" / ");
                            const nodes: ReactNode[] = [];
                            if (i > 0 && i % 8 === 0 && mediumInline) {
                                nodes.push(
                                    <div key={`ad-inline-${i}`} style={{ gridColumn: "1 / -1" }}>
                                        <AdCard ad={mediumInline} size="medium" />
                                    </div>,
                                );
                            }
                            nodes.push(
                                <motion.button key={`user-${u.slug}-${i}`} type="button" onClick={() => { trackDiscoveryEvent({ eventType: "detail_open", targetSlug: u.slug }); onOpenProfile?.(u.slug); }} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }} style={{ textDecoration: "none", border: "none", background: "transparent", padding: 0, cursor: "pointer" }}>
                                    <div style={{ position: "relative", overflow: "hidden", borderRadius: 16, padding: "14px", minHeight: 204, background: u.discovery_fixed ? `linear-gradient(155deg, ${rc}16, rgba(255,255,255,0.02))` : "linear-gradient(155deg, rgba(255,255,255,0.04), rgba(255,255,255,0.015))", border: `1px solid ${rc}40` }}>
                                        <div style={{ position: "absolute", right: -24, top: -24, width: 90, height: 90, borderRadius: "50%", background: `radial-gradient(circle, ${rc}28, transparent 70%)`, pointerEvents: "none" }} />
                                        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
                                            <div style={{ width: 44, height: 44, borderRadius: "50%", overflow: "hidden", background: `${rc}25`, border: `1px solid ${rc}40`, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 900, color: rc, flexShrink: 0 }}>
                                                {u.avatar_url ? <img src={u.avatar_url} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : u.display_name?.[0]?.toUpperCase()}
                                            </div>
                                            <div style={{ minWidth: 0, flex: 1 }}>
                                                <p style={{ margin: "0 0 3px", fontSize: 13, fontWeight: 800, color: t.text, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{u.display_name}</p>
                                                <p style={{ margin: 0, fontSize: 9, color: t.sub, opacity: 0.7 }}>ユーザーID: {u.slug}</p>
                                            </div>
                                        </div>
                                        <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 8 }}>
                                            <SponsorBadge plan={u.sponsor_plan ?? null} />
                                            {u.discovery_fixed ? (
                                                <span style={{ fontSize: 8, fontFamily: "monospace", padding: "2px 6px", borderRadius: 999, background: `${rc}20`, color: rc }}>
                                                    固定表示
                                                </span>
                                            ) : null}
                                        </div>
                                        <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 8 }}>
                                            <span style={{ fontSize: 8, fontFamily: "monospace", padding: "2px 6px", borderRadius: 999, background: `${rc}20`, color: rc }}>{u.role}</span>
                                            <span style={{ fontSize: 8, fontFamily: "monospace", padding: "2px 6px", borderRadius: 999, background: "rgba(255,255,255,0.06)", color: t.sub }}>{locationLabel || "-"}</span>
                                            {u.sport ? <span style={{ fontSize: 8, fontFamily: "monospace", padding: "2px 6px", borderRadius: 999, background: "rgba(255,255,255,0.06)", color: t.sub }}>{u.sport}</span> : null}
                                        </div>
                                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "auto" }}>
                                            <span style={{ fontSize: 10, color: "#FFD600", fontFamily: "monospace" }}>★ {u.cheer_count}</span>
                                            <span style={{ fontSize: 10, color: t.sub, opacity: 0.75, fontFamily: "monospace" }}>紹介 {u.referral_count}</span>
                                        </div>
                                        <div style={{ marginTop: 8, display: "inline-flex", alignItems: "center", gap: 5, padding: "4px 8px", borderRadius: 99, background: `${rc}18`, border: `1px solid ${rc}35`, color: rc, fontSize: 9, fontWeight: 800 }}>
                                            プロフィールを見る →
                                        </div>
                                    </div>
                                </motion.button>,
                            );
                            return nodes;
                        })}
                    </div>
                )}
                <p style={{ margin: "10px 0 0", fontSize: 10, color: t.sub, opacity: 0.55 }}>
                    将来的に、ユーザー方針・目的に合わせたパーソナライズ推薦へ拡張します。
                </p>
            </SectionCard>

            <SectionCard t={t}>
                <SLabel text="Sponsored" color="#FFD600" />
                {sideSmallAds.length > 0 ? (
                    <div style={{ display: "grid", gap: 8 }}>
                        {sideSmallAds.map((ad) => (
                            <AdCard key={ad.id} ad={ad} size="small" />
                        ))}
                    </div>
                ) : (
                    <p style={{ margin: 0, fontSize: 11, color: t.sub, opacity: 0.5 }}>サイド広告枠（空き枠）</p>
                )}
            </SectionCard>
        </div>
    );
}
