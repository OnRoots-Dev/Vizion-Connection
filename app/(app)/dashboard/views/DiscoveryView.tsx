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
    profile_image_url?: string | null;
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

function getUserLocation(user: DiscoveryUser) {
    return [formatLocationLabel(user.region), user.prefecture ? formatLocationLabel(user.prefecture) : null]
        .filter((value, index, arr) => value && (index == 0 || value !== arr[0]))
        .join(" / ");
}

function getCardBackground(user: DiscoveryUser, color: string) {
    const overlays = [
        `linear-gradient(180deg, rgba(5,10,20,0.18) 0%, rgba(5,10,20,0.72) 55%, rgba(5,10,20,0.94) 100%)`,
        `linear-gradient(135deg, ${color}55 0%, rgba(8,12,22,0.18) 40%, rgba(8,12,22,0.88) 100%)`,
    ];

    if (user.profile_image_url) {
        return `${overlays.join(",")}, url(${user.profile_image_url})`;
    }

    return `linear-gradient(145deg, ${color}40, rgba(13,17,27,0.96) 60%, rgba(7,10,18,1) 100%)`;
}

function ProfileAvatar({ user, color, size = 48 }: { user: DiscoveryUser; color: string; size?: number }) {
    return (
        <div style={{ width: size, height: size, borderRadius: "50%", overflow: "hidden", background: `${color}25`, border: `1px solid ${color}55`, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 900, color: color, flexShrink: 0, boxShadow: `0 10px 24px ${color}30` }}>
            {user.avatar_url ? <img src={user.avatar_url} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : user.display_name?.[0]?.toUpperCase()}
        </div>
    );
}

function DiscoveryFeatureCard({
    user,
    index,
    label,
    statLabel,
    statValue,
    accentColor,
    t,
    onOpen,
}: {
    user: DiscoveryUser;
    index: number;
    label: string;
    statLabel: string;
    statValue: string;
    accentColor: string;
    t: ThemeColors;
    onOpen: () => void;
}) {
    const roleColor = ROLE_COLORS[user.role] ?? accentColor;
    const locationLabel = getUserLocation(user) || "全国";

    return (
        <motion.button
            type="button"
            onClick={onOpen}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            style={{ textDecoration: "none", border: "none", background: "transparent", padding: 0, cursor: "pointer" }}
        >
            <div style={{ position: "relative", overflow: "hidden", borderRadius: 18, minHeight: 166, padding: 14, display: "flex", flexDirection: "column", justifyContent: "space-between", backgroundImage: getCardBackground(user, roleColor), backgroundSize: "cover", backgroundPosition: "center", border: `1px solid ${roleColor}55`, boxShadow: `0 18px 38px ${roleColor}18` }}>
                <div style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg, rgba(255,255,255,0.06), transparent 24%, rgba(0,0,0,0.14) 100%)", pointerEvents: "none" }} />
                <div style={{ position: "relative", display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12 }}>
                    <div style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
                        <span style={{ minWidth: 34, textAlign: "center", padding: "5px 8px", borderRadius: 999, background: "rgba(6,10,18,0.62)", border: `1px solid ${accentColor}55`, color: accentColor, fontSize: 10, fontFamily: "monospace", fontWeight: 800 }}>
                            #{String(index + 1).padStart(2, "0")}
                        </span>
                        <span style={{ padding: "5px 9px", borderRadius: 999, background: "rgba(6,10,18,0.56)", border: `1px solid ${roleColor}44`, color: "#F7FAFC", fontSize: 10, fontWeight: 700 }}>
                            {label}
                        </span>
                    </div>
                    <SponsorBadge plan={user.sponsor_plan ?? null} />
                </div>

                <div style={{ position: "relative", display: "flex", alignItems: "flex-end", gap: 12 }}>
                    <ProfileAvatar user={user} color={roleColor} size={54} />
                    <div style={{ minWidth: 0, flex: 1 }}>
                        <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 6 }}>
                            <span style={{ fontSize: 9, padding: "3px 8px", borderRadius: 999, background: "rgba(6,10,18,0.56)", color: roleColor, border: `1px solid ${roleColor}40` }}>{user.role}</span>
                            <span style={{ fontSize: 9, padding: "3px 8px", borderRadius: 999, background: "rgba(6,10,18,0.56)", color: "rgba(255,255,255,0.76)" }}>{locationLabel}</span>
                        </div>
                        <p style={{ margin: "0 0 2px", fontSize: 15, fontWeight: 900, color: "#FFFFFF", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", textShadow: "0 2px 12px rgba(0,0,0,0.35)" }}>{user.display_name}</p>
                        <p style={{ margin: 0, fontSize: 10, color: "rgba(255,255,255,0.72)", fontFamily: "monospace", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>ID: {user.slug}</p>
                    </div>
                    <div style={{ textAlign: "right", flexShrink: 0 }}>
                        <div style={{ fontSize: 9, color: "rgba(255,255,255,0.6)", marginBottom: 3 }}>{statLabel}</div>
                        <div style={{ fontSize: 18, fontWeight: 900, color: "#FFFFFF", textShadow: "0 2px 16px rgba(0,0,0,0.4)" }}>{statValue}</div>
                    </div>
                </div>
            </div>
        </motion.button>
    );
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
    const [page, setPage] = useState(1);
    const PAGE_SIZE = 12;

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
        setPage(1);
    }, [query]);

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

    const totalPages = Math.max(1, Math.ceil(users.length / PAGE_SIZE));
    const pagedUsers = users.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

    const sortTabs: Array<{ id: "all" | "cheer" | "referral" | "new"; label: string }> = [
        { id: "all", label: "全アカウント" },
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
                    <SLabel text="AD SLOT" color="#FFD600" size={10} />
                    <p style={{ margin: 0, fontSize: 11, color: t.sub, opacity: 0.5 }}>全国スポンサー広告枠（空き枠）</p>
                </SectionCard>
            )}

            <SectionCard t={t} accentColor={roleColor}>
                <SLabel text="Vizion Radar" color={roleColor} size={10} />
                <div style={{ position: "relative", borderRadius: 16, overflow: "hidden", border: `1px solid ${roleColor}25`, background: "linear-gradient(145deg, rgba(255,255,255,0.02), rgba(255,255,255,0.01))", padding: 10 }}>
                    <div style={{ position: "absolute", top: -55, right: -55, width: 140, height: 140, borderRadius: "50%", background: `radial-gradient(circle, ${roleColor}18, transparent 70%)`, pointerEvents: "none" }} />
                    <p style={{ margin: "0 0 6px", fontSize: 9, color: t.sub, opacity: 0.7 }}>検索条件を設定すると、ロール・地域・推し指標でユーザーを即抽出できます。</p>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6, marginBottom: 6 }}>
                        <label style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                            <span style={{ fontSize: 8, color: t.sub, opacity: 0.8 }}>キーワード</span>
                            <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="ユーザーID / アカウント名で検索" style={{ width: "100%", padding: "9px 10px", borderRadius: 10, border: `1px solid ${t.border}`, background: "rgba(255,255,255,0.03)", color: t.text, fontSize: 11 }} />
                        </label>
                        <label style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                            <span style={{ fontSize: 8, color: t.sub, opacity: 0.8 }}>ロール</span>
                            <select value={role} onChange={(e) => setRole(e.target.value)} style={{ width: "100%", padding: "9px 10px", borderRadius: 10, border: `1px solid ${t.border}`, background: "rgba(255,255,255,0.03)", color: t.text, fontSize: 11 }}>
                                <option value="">全ロール</option>
                                <option value="Athlete">Athlete</option>
                                <option value="Trainer">Trainer</option>
                                <option value="Members">Members</option>
                                <option value="Business">Business</option>
                            </select>
                        </label>
                        <label style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                            <span style={{ fontSize: 8, color: t.sub, opacity: 0.8 }}>地域</span>
                            <input value={region} onChange={(e) => setRegion(e.target.value)} placeholder="地域名で検索" style={{ width: "100%", padding: "9px 10px", borderRadius: 10, border: `1px solid ${t.border}`, background: "rgba(255,255,255,0.03)", color: t.text, fontSize: 11 }} />
                        </label>
                        <label style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                            <span style={{ fontSize: 8, color: t.sub, opacity: 0.8 }}>都道府県</span>
                            <input value={prefecture} onChange={(e) => setPrefecture(e.target.value)} placeholder="都道府県名で検索" style={{ width: "100%", padding: "9px 10px", borderRadius: 10, border: `1px solid ${t.border}`, background: "rgba(255,255,255,0.03)", color: t.text, fontSize: 11 }} />
                        </label>
                    </div>
                    <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                        {sortTabs.map((tab) => (
                            <button key={tab.id} onClick={() => setSort(tab.id)} style={{ padding: "5px 10px", borderRadius: 999, border: "none", cursor: "pointer", fontSize: 10, background: sort === tab.id ? `${roleColor}22` : "rgba(255,255,255,0.05)", color: sort === tab.id ? roleColor : t.sub, outline: sort === tab.id ? `1px solid ${roleColor}40` : "none" }}>
                                {tab.label}
                            </button>
                        ))}
                    </div>
                </div>
            </SectionCard>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(280px,1fr))", gap: 12 }}>
                <SectionCard t={t}>
                    <SLabel text="本日の推し / Cheer" color="#FFD600" size={10} />
                    <div style={{ display: "grid", gap: 10 }}>
                        {picks.cheer.slice(0, 5).map((u, i) => (
                            <DiscoveryFeatureCard
                                key={`c-${u.slug}`}
                                user={u}
                                index={i}
                                label="Cheer Boost"
                                statLabel="Cheer"
                                statValue={`★ ${u.cheer_count}`}
                                accentColor="#FFD600"
                                t={t}
                                onOpen={() => {
                                    trackDiscoveryEvent({ eventType: "detail_open", targetSlug: u.slug });
                                    onOpenProfile?.(u.slug);
                                }}
                            />
                        ))}
                    </div>
                </SectionCard>

                <SectionCard t={t}>
                    <SLabel text="本日の推し / Referral" color={roleColor} size={10} />
                    <div style={{ display: "grid", gap: 10 }}>
                        {picks.referral.slice(0, 5).map((u, i) => (
                            <DiscoveryFeatureCard
                                key={`r-${u.slug}`}
                                user={u}
                                index={i}
                                label="Referral Pulse"
                                statLabel="紹介数"
                                statValue={String(u.referral_count)}
                                accentColor={roleColor}
                                t={t}
                                onOpen={() => {
                                    trackDiscoveryEvent({ eventType: "detail_open", targetSlug: u.slug });
                                    onOpenProfile?.(u.slug);
                                }}
                            />
                        ))}
                    </div>
                </SectionCard>
            </div>

            <SectionCard t={t} accentColor={roleColor}>
                <SLabel text="Discovery Results" color={roleColor} size={10} />
                {loading ? (
                    <p style={{ fontSize: 12, color: t.sub, margin: 0 }}>レーダー同期中...</p>
                ) : users.length === 0 ? (
                    <p style={{ fontSize: 12, color: t.sub, margin: 0 }}>条件に一致するユーザーがいません。</p>
                ) : (
                    <>
                        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(280px,1fr))", gap: 14 }}>
                            {pagedUsers.flatMap((u, i) => {
                                const absoluteIndex = (page - 1) * PAGE_SIZE + i;
                                const rc = ROLE_COLORS[u.role] ?? roleColor;
                                const locationLabel = getUserLocation(u) || "全国";
                                const nodes: ReactNode[] = [];
                                if (absoluteIndex > 0 && absoluteIndex % 8 === 0 && mediumInline) {
                                    nodes.push(
                                        <div key={`ad-inline-${absoluteIndex}`} style={{ gridColumn: "1 / -1" }}>
                                            <AdCard ad={mediumInline} size="medium" />
                                        </div>,
                                    );
                                }
                                nodes.push(
                                    <motion.button key={`user-${u.slug}-${absoluteIndex}`} type="button" onClick={() => { trackDiscoveryEvent({ eventType: "detail_open", targetSlug: u.slug }); onOpenProfile?.(u.slug); }} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }} style={{ textDecoration: "none", border: "none", background: "transparent", padding: 0, cursor: "pointer" }}>
                                        <div style={{ position: "relative", overflow: "hidden", borderRadius: 20, minHeight: 280, padding: 16, display: "flex", flexDirection: "column", justifyContent: "space-between", backgroundImage: getCardBackground(u, rc), backgroundSize: "cover", backgroundPosition: "center", border: `1px solid ${rc}55`, boxShadow: `0 22px 50px ${rc}18` }}>
                                            <div style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg, rgba(255,255,255,0.10) 0%, rgba(255,255,255,0.02) 18%, rgba(8,12,22,0.18) 42%, rgba(7,10,18,0.96) 100%)", pointerEvents: "none" }} />
                                            <div style={{ position: "absolute", right: -36, top: -36, width: 136, height: 136, borderRadius: "50%", background: `radial-gradient(circle, ${rc}50, transparent 68%)`, filter: "blur(2px)", pointerEvents: "none" }} />

                                            <div style={{ position: "relative", display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12 }}>
                                                <div style={{ display: "inline-flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                                                    <span style={{ padding: "5px 9px", borderRadius: 999, background: "rgba(8,12,22,0.56)", color: rc, border: `1px solid ${rc}48`, fontSize: 10, fontWeight: 800, fontFamily: "monospace" }}>{u.role}</span>
                                                    <span style={{ padding: "5px 9px", borderRadius: 999, background: "rgba(8,12,22,0.56)", color: "rgba(255,255,255,0.76)", border: "1px solid rgba(255,255,255,0.12)", fontSize: 10 }}>{locationLabel}</span>
                                                    {u.sport ? <span style={{ padding: "5px 9px", borderRadius: 999, background: "rgba(8,12,22,0.56)", color: "rgba(255,255,255,0.76)", border: "1px solid rgba(255,255,255,0.12)", fontSize: 10 }}>{u.sport}</span> : null}
                                                </div>
                                                <SponsorBadge plan={u.sponsor_plan ?? null} />
                                            </div>

                                            <div style={{ position: "relative", display: "flex", alignItems: "flex-end", gap: 14 }}>
                                                <ProfileAvatar user={u} color={rc} size={60} />
                                                <div style={{ minWidth: 0, flex: 1 }}>
                                                    <p style={{ margin: "0 0 4px", fontSize: 18, fontWeight: 900, color: "#FFFFFF", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", textShadow: "0 4px 18px rgba(0,0,0,0.42)" }}>{u.display_name}</p>
                                                    <p style={{ margin: "0 0 10px", fontSize: 10, color: "rgba(255,255,255,0.72)", fontFamily: "monospace", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>ユーザーID: {u.slug}</p>
                                                    <div style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: 8 }}>
                                                        <div style={{ padding: "10px 12px", borderRadius: 14, background: "rgba(7,10,18,0.54)", border: "1px solid rgba(255,255,255,0.1)", backdropFilter: "blur(8px)" }}>
                                                            <div style={{ fontSize: 9, color: "rgba(255,255,255,0.56)", marginBottom: 3 }}>Cheer</div>
                                                            <div style={{ fontSize: 15, fontWeight: 900, color: "#FFD600" }}>★ {u.cheer_count}</div>
                                                        </div>
                                                        <div style={{ padding: "10px 12px", borderRadius: 14, background: "rgba(7,10,18,0.54)", border: "1px solid rgba(255,255,255,0.1)", backdropFilter: "blur(8px)" }}>
                                                            <div style={{ fontSize: 9, color: "rgba(255,255,255,0.56)", marginBottom: 3 }}>紹介数</div>
                                                            <div style={{ fontSize: 15, fontWeight: 900, color: "#FFFFFF" }}>{u.referral_count}</div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>

                                            <div style={{ position: "relative", marginTop: 14, display: "flex", alignItems: "center", justifyContent: "flex-end", gap: 10 }}>
                                                <div style={{ display: "inline-flex", alignItems: "center", gap: 5, padding: "6px 10px", borderRadius: 999, background: `${rc}24`, border: `1px solid ${rc}45`, color: "#FFFFFF", fontSize: 10, fontWeight: 800, boxShadow: `0 10px 24px ${rc}18` }}>
                                                    Open Profile →
                                                </div>
                                            </div>
                                        </div>
                                    </motion.button>,
                                );
                                return nodes;
                            })}
                        </div>
                        {users.length > PAGE_SIZE ? (
                            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8, marginTop: 14 }}>
                                <span style={{ fontSize: 11, color: t.sub }}>ページ {page} / {totalPages}</span>
                                <div style={{ display: "flex", gap: 8 }}>
                                    <button
                                        type="button"
                                        onClick={() => setPage((prev) => Math.max(1, prev - 1))}
                                        disabled={page === 1}
                                        style={{ padding: "8px 12px", borderRadius: 10, border: `1px solid ${t.border}`, background: "rgba(255,255,255,0.04)", color: page === 1 ? t.sub : t.text, cursor: page === 1 ? "not-allowed" : "pointer" }}
                                    >
                                        前へ
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setPage((prev) => Math.min(totalPages, prev + 1))}
                                        disabled={page === totalPages}
                                        style={{ padding: "8px 12px", borderRadius: 10, border: `1px solid ${t.border}`, background: `${roleColor}16`, color: page === totalPages ? t.sub : roleColor, cursor: page === totalPages ? "not-allowed" : "pointer" }}
                                    >
                                        次へ
                                    </button>
                                </div>
                            </div>
                        ) : null}
                    </>
                )}
                <p style={{ margin: "10px 0 0", fontSize: 10, color: t.sub, opacity: 0.55 }}>
                    将来的に、ユーザー方針・目的に合わせたパーソナライズ推薦へ拡張します。
                </p>
            </SectionCard>

            <SectionCard t={t}>
                <SLabel text="Sponsored" color="#FFD600" size={10} />
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
