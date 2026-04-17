"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import type { ProfileData } from "@/features/profile/types";
import type { DashboardView, ThemeColors } from "@/app/(app)/dashboard/types";
import { ProfileCardSection } from "@/app/(app)/dashboard/components/ProfileCard";
import { ActionPill, CardHeader, SectionCard, SLabel } from "@/app/(app)/dashboard/components/ui";
import type { AdItem } from "@/lib/ads-shared";
import { isLocalPlan } from "@/lib/ads-shared";
import AdCard, { AD_SIZE_MAP } from "@/components/AdCard";
import { DailyLogCard } from "@/components/DailyLog/DailyLogCard";
import { CollectionCarousel, type CollectionCardItem } from "@/components/collections/CollectionCarousel";
import { CATEGORY_CONFIG } from "@/types/schedule";
import type { Schedule } from "@/types/schedule";

type CollectedCard = CollectionCardItem;

type FeaturedNewsItem = {
    id: string;
    category: "announce" | "column" | "interview";
    title: string;
};

type DiscoveryPreviewUser = {
    slug: string;
    display_name: string;
    role: string;
    cheer_count: number;
    region?: string | null;
    prefecture?: string | null;
    sport?: string | null;
    profile_image_url?: string | null;
};

const NEWS_CATEGORY_LABEL: Record<FeaturedNewsItem["category"], string> = {
    announce: "お知らせ",
    column: "コラム",
    interview: "インタビュー",
};

let collectedCardsCache: CollectedCard[] | null = null;
let collectedCardsInFlight: Promise<CollectedCard[]> | null = null;

const ROLE_COLOR: Record<string, string> = {
    Athlete: "#C1272D",
    Trainer: "#1A7A4A",
    Members: "#B8860B",
    Business: "#1B3A8C",
};

const ROLE_LABEL: Record<string, string> = {
    Athlete: "ATHLETE",
    Trainer: "TRAINER",
    Members: "MEMBERS",
    Business: "BUSINESS",
};

export function HomeView({ profile, referralUrl, referralCount, t, roleColor, setView, ads, featuredNewsTop, onOpenNews, onOpenProfile }: {
    profile: ProfileData;
    referralUrl: string;
    referralCount: number;
    t: ThemeColors;
    roleColor: string;
    setView: (v: DashboardView) => void;
    ads: AdItem[];
    featuredNewsTop: FeaturedNewsItem[];
    onOpenNews: (newsId: string) => void;
    onOpenProfile: (slug: string) => void;
}) {
    const REFERRAL_LIMIT = 30;
    const progress = Math.min((referralCount / REFERRAL_LIMIT) * 100, 100);
    const [copied, setCopied] = useState(false);
    const [collectedCards, setCollectedCards] = useState<CollectedCard[]>([]);
    const [discoveryPreview, setDiscoveryPreview] = useState<DiscoveryPreviewUser[]>([]);
    const [upcomingSchedules, setUpcomingSchedules] = useState<Schedule[]>([]);

    const localAds = ads.filter((ad) => isLocalPlan(ad.plan));
    const nationalAds = ads.filter((ad) => !isLocalPlan(ad.plan));
    const topHero = nationalAds.find((ad) => {
        const size = AD_SIZE_MAP[ad.plan] ?? "medium";
        return size === "hero" || size === "large";
    });
    const bottomAds = localAds.slice(0, 2);

    const fetchCollectedCardsOnce = async (): Promise<CollectedCard[]> => {
        if (collectedCardsCache) return collectedCardsCache;
        if (collectedCardsInFlight) return collectedCardsInFlight;

        collectedCardsInFlight = fetch("/api/collect/list")
            .then((r) => r.json())
            .then((d) => (Array.isArray(d.cards) ? d.cards.slice(0, 10) : []) as CollectedCard[])
            .catch(() => [] as CollectedCard[])
            .then((cards) => {
                collectedCardsCache = cards;
                return cards;
            });

        try {
            return await collectedCardsInFlight;
        } finally {
            collectedCardsInFlight = null;
        }
    };

    async function handleCopy() {
        try {
            await navigator.clipboard.writeText(referralUrl);
        } catch {}
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    }

    useEffect(() => {
        let cancelled = false;
        fetchCollectedCardsOnce().then((cards) => {
            if (!cancelled) setCollectedCards(cards);
        });
        return () => { cancelled = true; };
    }, []);

    useEffect(() => {
        let cancelled = false;
        fetch("/api/discovery?sort=all")
            .then((r) => r.json())
            .then((d) => {
                if (!cancelled) {
                    setDiscoveryPreview(Array.isArray(d.users) ? d.users.slice(0, 4) : []);
                }
            })
            .catch(() => {
                if (!cancelled) setDiscoveryPreview([]);
            });
        return () => { cancelled = true; };
    }, []);

    useEffect(() => {
        let cancelled = false;
        fetch("/api/schedules/upcoming?limit=3", { cache: "no-store" })
            .then((r) => r.json())
            .then((d) => {
                if (!cancelled) {
                    setUpcomingSchedules(Array.isArray(d.schedules) ? (d.schedules as Schedule[]) : []);
                }
            })
            .catch(() => {
                if (!cancelled) setUpcomingSchedules([]);
            });
        return () => { cancelled = true; };
    }, []);

    return (
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <div style={{ position: "relative", overflow: "hidden", paddingBottom: 8 }}>
                <motion.p initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} style={{ fontSize: 9, fontWeight: 900, letterSpacing: "0.35em", textTransform: "uppercase", color: t.sub, opacity: 0.5, margin: "0 0 4px", fontFamily: "monospace" }}>
                    Vizion Connection Dashboard
                </motion.p>
                <motion.h1 initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.05 }} className="font-display" style={{ fontSize: "clamp(32px,5vw,56px)", fontWeight: 900, color: t.text, margin: 0, lineHeight: 1, letterSpacing: "-0.01em", textTransform: "uppercase" }}>
                    <span style={{ color: roleColor }}>{profile.role}</span> / BASE
                </motion.h1>
            </div>

            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }}>
                {topHero ? (
                    <AdCard ad={topHero} />
                ) : (
                    <SectionCard t={t}>
                        <SLabel text="AD SLOT" color="#FFD600" />
                        <p style={{ margin: 0, fontSize: 11, color: t.sub, opacity: 0.5 }}>全国スポンサー広告枠（空き枠）</p>
                    </SectionCard>
                )}
            </motion.div>

            <ProfileCardSection profile={profile} t={t} roleColor={roleColor} setView={setView} referralUrl={referralUrl} referralCount={referralCount} />

            {featuredNewsTop.length > 0 && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.14 }}>
                    <SectionCard t={t} accentColor="#FFD600">
                        <CardHeader
                            title="Featured News"
                            color="#FFD600"
                            action={<ActionPill onClick={() => setView("news")} color="#FFD600" t={t}>News Rooms →</ActionPill>}
                        />
                        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                            {featuredNewsTop.slice(0, 5).map((item) => (
                                <button
                                    key={item.id}
                                    type="button"
                                    onClick={() => onOpenNews(item.id)}
                                    style={{
                                        display: "flex",
                                        alignItems: "center",
                                        gap: 10,
                                        width: "100%",
                                        padding: "10px 12px",
                                        borderRadius: 12,
                                        border: `1px solid ${t.border}`,
                                        background: "rgba(255,255,255,0.02)",
                                        color: t.text,
                                        textAlign: "left",
                                        cursor: "pointer",
                                    }}
                                >
                                    <span style={{ fontSize: 10, fontWeight: 800, color: roleColor, padding: "4px 8px", borderRadius: 999, background: `${roleColor}18`, border: `1px solid ${roleColor}25`, flexShrink: 0 }}>
                                        {NEWS_CATEGORY_LABEL[item.category]}
                                    </span>
                                    <span style={{ fontSize: 12, fontWeight: 700, color: t.text, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                                        {item.title}
                                    </span>
                                </button>
                            ))}
                        </div>
                    </SectionCard>
                </motion.div>
            )}

            <DailyLogCard t={t} roleColor={roleColor} onOpenJourney={setView} />

            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
                style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 12 }}>
                <SectionCard t={t} accentColor={roleColor}>
                    <CardHeader
                        title="Cheer"
                        color={roleColor}
                        action={<ActionPill onClick={() => setView("cheer")} color={roleColor} t={t}>詳細 →</ActionPill>}
                    />
                    <div style={{ display: "flex", alignItems: "baseline", gap: 6 }}>
                        <span style={{ fontSize: 40, fontWeight: 900, color: "#FFD600", lineHeight: 1, fontFamily: "monospace" }}>{profile.cheerCount ?? 0}</span>
                        <span style={{ fontSize: 12, color: t.sub }}>★ 応援数</span>
                    </div>
                    <p style={{ fontSize: 10, color: t.sub, margin: "6px 0 0", opacity: 0.45 }}>プロフィールを広めてCheerを集めよう</p>
                </SectionCard>

                <SectionCard t={t} accentColor={roleColor}>
                    <CardHeader
                        title="Schedule"
                        color={roleColor}
                        action={<ActionPill onClick={() => setView("schedule")} color={roleColor} t={t}>すべて見る →</ActionPill>}
                    />
                    {upcomingSchedules.length === 0 ? (
                        <p style={{ margin: 0, fontSize: 12, color: t.sub }}>直近の予定はありません。</p>
                    ) : (
                        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                            {upcomingSchedules.slice(0, 3).map((s) => {
                                const cfg = CATEGORY_CONFIG[s.category];
                                return (
                                    <button
                                        key={s.id}
                                        type="button"
                                        onClick={() => setView("schedule")}
                                        style={{
                                            display: "grid",
                                            gridTemplateColumns: "auto minmax(0, 1fr)",
                                            gap: 10,
                                            alignItems: "center",
                                            padding: "10px 12px",
                                            borderRadius: 12,
                                            border: `1px solid ${t.border}`,
                                            background: "rgba(255,255,255,0.02)",
                                            color: t.text,
                                            textDecoration: "none",
                                            textAlign: "left",
                                            cursor: "pointer",
                                        }}
                                    >
                                        <span style={{ fontSize: 10, fontWeight: 800, color: cfg.color, padding: "4px 8px", borderRadius: 999, background: `${cfg.color}18`, border: `1px solid ${cfg.color}25`, flexShrink: 0 }}>
                                            {cfg.label}
                                        </span>
                                        <div style={{ minWidth: 0 }}>
                                            <p style={{ margin: "0 0 2px", fontSize: 12, fontWeight: 800, color: t.text, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{s.title}</p>
                                            <p style={{ margin: 0, fontSize: 10, color: t.sub, fontFamily: "monospace", opacity: 0.65, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                                                {new Date(s.start_at).toLocaleString("ja-JP", { month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit" })}
                                            </p>
                                        </div>
                                    </button>
                                );
                            })}
                        </div>
                    )}
                </SectionCard>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.26 }}
                style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 12 }}>
                <SectionCard t={t} accentColor={roleColor}>
                    <CardHeader
                        title="Collection"
                        color={roleColor}
                        action={<ActionPill onClick={() => setView("collections" as DashboardView)} color={roleColor} t={t}>一覧 →</ActionPill>}
                        meta={<p style={{ margin: 0, fontSize: 10, color: t.sub }}>{collectedCards.length} cards</p>}
                    />
                    {collectedCards.length === 0 ? (
                        <p style={{ margin: 0, fontSize: 12, color: t.sub }}>コレクションはまだありません。公開プロフィールでカードをコレクトするとここに表示されます。</p>
                    ) : (
                        <CollectionCarousel cards={collectedCards} t={t} roleColor={roleColor} compact onOpenProfile={onOpenProfile} />
                    )}
                </SectionCard>

                <SectionCard t={t} accentColor={roleColor}>
                    <CardHeader
                        title="Discovery"
                        color={roleColor}
                        action={<ActionPill onClick={() => setView("discovery")} color={roleColor} t={t}>詳細 →</ActionPill>}
                    />
                    {discoveryPreview.length === 0 ? (
                        <p style={{ margin: 0, fontSize: 12, color: t.sub }}>公開プロフィールからおすすめのユーザーを表示します。</p>
                    ) : (
                        <div style={{ display: "grid", gap: 8 }}>
                            {discoveryPreview.map((user) => {
                                const previewRoleColor = ROLE_COLOR[user.role] ?? roleColor;
                                return (
                                    <button
                                        key={user.slug}
                                        type="button"
                                        onClick={() => onOpenProfile(user.slug)}
                                        style={{
                                            position: "relative",
                                            overflow: "hidden",
                                            display: "grid",
                                            gridTemplateColumns: "1fr auto",
                                            gap: 10,
                                            alignItems: "center",
                                            width: "100%",
                                            padding: "12px 14px",
                                            borderRadius: 14,
                                            border: `1px solid ${previewRoleColor}22`,
                                            background: user.profile_image_url
                                                ? `linear-gradient(135deg, rgba(10,12,18,0.76), rgba(10,12,18,0.96)), url(${user.profile_image_url}) center/cover`
                                                : `linear-gradient(135deg, ${previewRoleColor}14, rgba(255,255,255,0.02))`,
                                            color: t.text,
                                            textAlign: "left",
                                            cursor: "pointer",
                                        }}
                                    >
                                        <div style={{ minWidth: 0 }}>
                                            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6, flexWrap: "wrap" }}>
                                                <span style={{ fontSize: 10, fontWeight: 800, color: previewRoleColor, padding: "3px 8px", borderRadius: 999, background: `${previewRoleColor}18`, border: `1px solid ${previewRoleColor}25` }}>
                                                    {ROLE_LABEL[user.role] ?? user.role}
                                                </span>
                                                <span style={{ fontSize: 10, color: t.sub }}>
                                                    {[user.region, user.prefecture].filter(Boolean).join(" / ") || "地域未設定"}
                                                </span>
                                            </div>
                                            <p style={{ margin: "0 0 3px", fontSize: 13, fontWeight: 800, color: t.text }}>{user.display_name}</p>
                                            <p style={{ margin: "0 0 3px", fontSize: 10, color: t.sub }}>{user.sport || "活動情報なし"}</p>
                                            <p style={{ margin: 0, fontSize: 10, color: "#FFD600", fontFamily: "monospace" }}>Cheer {user.cheer_count ?? 0}</p>
                                        </div>
                                        <span style={{ fontSize: 10, color: "#fff", fontWeight: 800 }}>Check →</span>
                                    </button>
                                );
                            })}
                        </div>
                    )}
                </SectionCard>
            </motion.div>

            <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.45 }}
                style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 10 }}
            >
                {bottomAds.length > 0 ? (
                    bottomAds.map((ad) => (
                        <AdCard key={ad.id} ad={ad} size={AD_SIZE_MAP[ad.plan] === "small" ? "small" : "medium"} />
                    ))
                ) : (
                    <SectionCard t={t}>
                        <SLabel text="LOCAL AD SLOT" color="#FFD600" />
                        <p style={{ margin: 0, fontSize: 11, color: t.sub, opacity: 0.5 }}>地域スポンサー広告枠（空き枠）</p>
                    </SectionCard>
                )}
            </motion.div>
        </div>
    );
}
