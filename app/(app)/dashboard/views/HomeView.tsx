"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import type { ProfileData } from "@/features/profile/types";
import type { DashboardView, ThemeColors } from "@/app/(app)/dashboard/types";
import { ProfileCardSection } from "@/app/(app)/dashboard/components/ProfileCard";
import { SectionCard, SLabel } from "@/app/(app)/dashboard/components/ui";
import type { AdItem } from "@/lib/ads-shared";
import { isLocalPlan } from "@/lib/ads-shared";
import AdCard, { AD_SIZE_MAP } from "@/components/AdCard";
import { DailyLogCard } from "@/components/DailyLog/DailyLogCard";
import { getPlanFeatures } from "@/features/business/plan-features";
import { CollectionCarousel, type CollectionCardItem } from "@/components/collections/CollectionCarousel";

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
    sport?: string | null;
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
    const sponsorPlanLabel = getPlanFeatures(profile.sponsorPlan ?? null)?.badgeLabel ?? null;
    const titleBaseStyle = {
        fontSize: 8,
        fontWeight: 900,
        letterSpacing: "0.22em",
        textTransform: "uppercase" as const,
        margin: "0 0 6px",
        fontFamily: "monospace",
        opacity: 0.75,
    };
    const detailBaseStyle = {
        display: "inline-flex",
        alignItems: "center",
        gap: 4,
        padding: "4px 10px",
        borderRadius: 20,
        fontSize: 9,
        fontWeight: 800,
        fontFamily: "monospace",
        letterSpacing: "0.08em",
        cursor: "pointer",
        border: "none",
    };

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
            .then((d) => (Array.isArray(d.cards) ? d.cards.slice(0, 8) : []) as CollectedCard[])
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

            <ProfileCardSection profile={profile} t={t} roleColor={roleColor} setView={setView} />

            {featuredNewsTop.length > 0 && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.14 }}>
                    <SectionCard t={t} accentColor="#FFD600">
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
                            <SLabel text="Featured News" color="#FFD600" />
                            <button onClick={() => setView("news")} style={{ ...detailBaseStyle, background: "rgba(255,214,0,0.08)", outline: "1px solid rgba(255,214,0,0.2)", color: "#FFD600" }}>
                                News Rooms →
                            </button>
                        </div>
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

            <DailyLogCard t={t} roleColor={roleColor} />

            <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.16 }}>
                <SectionCard t={t} accentColor={roleColor}>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
                        <SLabel text="Collection" color={roleColor} />
                        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                            <span style={{ fontSize: 10, color: t.sub }}>{collectedCards.length} cards</span>
                            <button onClick={() => setView("collections" as DashboardView)} style={{ ...detailBaseStyle, background: `${roleColor}16`, outline: `1px solid ${roleColor}25`, color: roleColor }}>
                                一覧 →
                            </button>
                        </div>
                    </div>
                    {collectedCards.length === 0 ? (
                        <p style={{ margin: 0, fontSize: 12, color: t.sub }}>コレクションはまだありません。公開プロフィールでカードをコレクトするとここに表示されます。</p>
                    ) : (
                        <CollectionCarousel cards={collectedCards} t={t} roleColor={roleColor} compact onOpenProfile={onOpenProfile} />
                    )}
                </SectionCard>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
                style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 12 }}>
                <button onClick={() => setView("cheer")} className="vz-btn vz-card-hover" style={{ width: "100%", padding: "18px 20px", borderRadius: 16, background: `radial-gradient(circle at top right, ${roleColor}15, rgba(255,255,255,0.02))`, border: `1px solid ${roleColor}25`, cursor: "pointer", textAlign: "left", position: "relative", overflow: "hidden" }}>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
                        <p style={{ ...titleBaseStyle, color: roleColor, marginBottom: 0 }}>Cheer</p>
                        <span style={{ ...detailBaseStyle, background: `${roleColor}18`, outline: `1px solid ${roleColor}35`, color: roleColor }}>詳細 →</span>
                    </div>
                    <div style={{ display: "flex", alignItems: "baseline", gap: 5 }}>
                        <span style={{ fontSize: 40, fontWeight: 900, color: "#FFD600", lineHeight: 1, fontFamily: "monospace" }}>{profile.cheerCount ?? 0}</span>
                        <span style={{ fontSize: 12, color: t.sub }}>★ 応援数</span>
                    </div>
                    <p style={{ fontSize: 10, color: t.sub, margin: "6px 0 0", opacity: 0.45 }}>プロフィールを広めてCheerを集めよう</p>
                </button>

                <SectionCard accentColor="#FFD600" t={t}>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
                        <p style={{ ...titleBaseStyle, color: "#FFD600", marginBottom: 0 }}>Referral</p>
                        <button onClick={() => setView("referral")} style={{ ...detailBaseStyle, background: "rgba(255,214,0,0.1)", outline: "1px solid rgba(255,214,0,0.28)", color: "#FFD600" }}>詳細 →</button>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
                        <div style={{ display: "flex", alignItems: "baseline", gap: 5 }}>
                            <span style={{ fontSize: 28, fontWeight: 900, color: "#FFD600", fontFamily: "monospace", lineHeight: 1 }}>{referralCount}</span>
                            <span style={{ fontSize: 11, color: t.sub }}>/ {REFERRAL_LIMIT} 人</span>
                        </div>
                        <div style={{ textAlign: "right" }}>
                            <p style={{ fontSize: 8, color: t.sub, opacity: 0.4, margin: 0, fontFamily: "monospace" }}>獲得ポイント</p>
                            <p style={{ fontSize: 13, fontWeight: 900, color: "#FFD600", margin: 0, fontFamily: "monospace" }}>+{(referralCount * 500).toLocaleString()}pt</p>
                        </div>
                    </div>
                    <div style={{ height: 4, borderRadius: 99, background: "rgba(255,255,255,0.06)", overflow: "hidden", marginBottom: 12 }}>
                        <motion.div initial={{ width: 0 }} animate={{ width: `${progress}%` }} transition={{ duration: 1.2, delay: 0.4, ease: [0.16, 1, 0.3, 1] }} style={{ height: "100%", borderRadius: 99, background: "linear-gradient(90deg,#FFD600,#FFD60066)", boxShadow: "0 0 8px rgba(255,214,0,0.4)" }} />
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "9px 11px", borderRadius: 10, background: "rgba(255,214,0,0.05)", border: "1px solid rgba(255,214,0,0.18)" }}>
                        <span style={{ flex: 1, fontSize: 10, fontFamily: "monospace", color: "rgba(255,214,0,0.55)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{referralUrl}</span>
                        <button onClick={handleCopy} className="vz-btn" style={{ flexShrink: 0, padding: "5px 11px", borderRadius: 7, background: copied ? "rgba(255,214,0,0.18)" : "rgba(255,214,0,0.1)", border: "1px solid rgba(255,214,0,0.3)", color: "#FFD600", fontSize: 10, fontWeight: 800, cursor: "pointer" }}>
                            {copied ? "✓" : "Copy"}
                        </button>
                    </div>
                    <p style={{ fontSize: 9, color: t.sub, opacity: 0.35, margin: "7px 0 0", fontFamily: "monospace" }}>1人招待ごとに 500pt 付与</p>
                </SectionCard>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
                <SectionCard t={t} accentColor={roleColor}>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
                        <SLabel text="Discovery" />
                        <button onClick={() => setView("discovery")} style={{ ...detailBaseStyle, background: `${roleColor}16`, outline: `1px solid ${roleColor}28`, color: roleColor }}>
                            詳細 →
                        </button>
                    </div>
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
                                            display: "grid",
                                            gridTemplateColumns: "1fr auto",
                                            gap: 10,
                                            alignItems: "center",
                                            width: "100%",
                                            padding: "12px 14px",
                                            borderRadius: 14,
                                            border: `1px solid ${previewRoleColor}22`,
                                            background: `linear-gradient(135deg, ${previewRoleColor}14, rgba(255,255,255,0.02))`,
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
                                                    {user.region ?? "地域未設定"}{user.sport ? ` · ${user.sport}` : ""}
                                                </span>
                                            </div>
                                            <p style={{ margin: "0 0 3px", fontSize: 13, fontWeight: 800, color: t.text }}>{user.display_name}</p>
                                            <p style={{ margin: 0, fontSize: 10, color: "#FFD600", fontFamily: "monospace" }}>★ {user.cheer_count ?? 0}</p>
                                        </div>
                                        <span style={{ fontSize: 10, color: t.sub }}>見る →</span>
                                    </button>
                                );
                            })}
                        </div>
                    )}
                </SectionCard>
            </motion.div>

            {profile.role === "Business" && (
                <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
                    {profile.sponsorPlan ? (
                        <div style={{ borderRadius: 16, padding: "20px", background: "rgba(60,140,255,0.06)", border: "1px solid rgba(60,140,255,0.22)", position: "relative", overflow: "hidden" }}>
                            <div style={{ position: "absolute", top: -20, right: -20, width: 100, height: 100, borderRadius: "50%", background: "radial-gradient(circle,rgba(60,140,255,0.15),transparent 70%)", pointerEvents: "none" }} />
                            <p style={{ fontSize: 9, fontWeight: 800, letterSpacing: "0.15em", textTransform: "uppercase", color: "#3C8CFF", margin: "0 0 5px", fontFamily: "monospace" }}>Business Hub</p>
                            <p style={{ fontSize: 14, fontWeight: 700, color: t.text, margin: "0 0 4px" }}>現在のプラン: {sponsorPlanLabel ?? "契約中"}</p>
                            <p style={{ fontSize: 11, color: t.sub, lineHeight: 1.7, margin: "0 0 14px", opacity: 0.7 }}>掲載中の広告や効果測定レポートを確認できます。</p>
                            <button onClick={() => setView("business")} className="vz-btn" style={{ padding: "8px 16px", borderRadius: 9, background: "rgba(60,140,255,0.15)", border: "1px solid rgba(60,140,255,0.3)", color: "#3C8CFF", fontSize: 11, fontWeight: 700, cursor: "pointer" }}>
                                Business Hubへ →
                            </button>
                        </div>
                    ) : (
                        <div style={{ borderRadius: 16, padding: "20px", background: "linear-gradient(135deg, rgba(60,140,255,0.08), rgba(60,140,255,0.03))", border: "1px solid rgba(60,140,255,0.28)", position: "relative", overflow: "hidden" }}>
                            <div style={{ position: "absolute", top: -20, right: -20, width: 120, height: 120, borderRadius: "50%", background: "radial-gradient(circle,rgba(60,140,255,0.18),transparent 70%)", pointerEvents: "none" }} />
                            <span style={{ display: "inline-block", fontSize: 7, fontWeight: 900, padding: "2px 8px", borderRadius: 4, background: "rgba(255,255,255,0.08)", color: t.sub, border: "1px solid rgba(255,255,255,0.12)", fontFamily: "monospace", letterSpacing: "0.12em", marginBottom: 8 }}>FREE PLAN</span>
                            <p style={{ fontSize: 15, fontWeight: 800, color: t.text, margin: "0 0 6px" }}>有料プランにアップグレード</p>
                            <p style={{ fontSize: 11, color: t.sub, lineHeight: 1.7, margin: "0 0 14px", opacity: 0.7 }}>広告掲載・効果測定・アスリートマッチングなどの機能が利用可能になります。</p>
                            <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 14 }}>
                                {["広告掲載", "効果測定", "アスリートマッチング", "企業ページ"].map((f) => (
                                    <span key={f} style={{ fontSize: 10, padding: "3px 10px", borderRadius: 20, background: "rgba(60,140,255,0.1)", border: "1px solid rgba(60,140,255,0.2)", color: "#3C8CFF" }}>{f}</span>
                                ))}
                            </div>
                            <button onClick={() => setView("business")} className="vz-btn" style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "10px 20px", borderRadius: 10, background: "#3C8CFF", color: "#000", fontSize: 12, fontWeight: 800, cursor: "pointer", border: "none" }}>
                                ⚡ アップグレードする
                                <svg width={12} height={12} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" /></svg>
                            </button>
                        </div>
                    )}
                </motion.div>
            )}

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
