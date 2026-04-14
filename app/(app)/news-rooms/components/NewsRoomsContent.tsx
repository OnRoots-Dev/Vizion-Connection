"use client";

import { useEffect, useMemo, useRef, useState, useSyncExternalStore } from "react";
import type { UnifiedArticle } from "@/lib/news/types";
import NewsCard from "@/app/(app)/news-rooms/components/NewsCard";
import NewsCardSkeleton from "@/app/(app)/news-rooms/components/NewsCardSkeleton";
import ArticleSheet from "@/app/(app)/news-rooms/components/ArticleSheet";
import AdCard from "@/app/(app)/news-rooms/components/AdCard";

type NewsRoomAd = {
    id: string;
    headline: string;
    image_url?: string;
    link_url: string;
    sponsor?: string;
    business_id?: number;
    position?: number;
};

function mergeAdsIntoArticles(params: {
    articles: UnifiedArticle[];
    ads: NewsRoomAd[];
}): Array<{ type: "news"; key: string; item: UnifiedArticle } | { type: "ad"; key: string; item: NewsRoomAd }> {
    const { articles, ads } = params;
    if (ads.length === 0) return articles.map((item) => ({ type: "news" as const, key: `n:${item.id}`, item }));

    const out: Array<
        | { type: "news"; key: string; item: UnifiedArticle }
        | { type: "ad"; key: string; item: NewsRoomAd }
    > = [];
    const adList = [...ads];
    const interval = 5;
    let adIndex = 0;

    for (let i = 0; i < articles.length; i += 1) {
        const item = articles[i];
        if (item) out.push({ type: "news", key: `n:${item.id}`, item });

        const isInsertPoint = (i + 1) % interval === 0;
        const ad = adList[adIndex];
        if (isInsertPoint && ad) {
            out.push({ type: "ad", key: `a:${ad.id}`, item: ad });
            adIndex += 1;
        }
    }

    return out;
}

function getDateLabelSnapshot(): string {
    const WEEKDAYS = ["日", "月", "火", "水", "木", "金", "土"];
    const d = new Date();
    return `${d.getFullYear()}年${d.getMonth() + 1}月${d.getDate()}日（${WEEKDAYS[d.getDay()]}）`;
}

export default function NewsRoomsContent({
    title,
    dateLabelAlign = "right",
}: {
    title: string;
    dateLabelAlign?: "right" | "below";
}) {
    const feedCacheRef = useRef<
        Record<string, { type: "top"; data: Array<{ section: { label: string; keyword: string }; articles: UnifiedArticle[] }> } | { type: "single"; data: UnifiedArticle[] }>
    >({});
    const [activeCategory, setActiveCategory] = useState("top");
    const [posts, setPosts] = useState<UnifiedArticle[]>([]);
    const [postsLoading, setPostsLoading] = useState(true);
    const [feedSections, setFeedSections] = useState<Array<{ section: { label: string; keyword: string }; articles: UnifiedArticle[] }>>([]);
    const [feedLoading, setFeedLoading] = useState(true);
    const [singleFeed, setSingleFeed] = useState<UnifiedArticle[]>([]);
    const [selectedArticle, setSelectedArticle] = useState<UnifiedArticle | null>(null);
    const [ads, setAds] = useState<NewsRoomAd[]>([]);
    const [inFlightAdsCategory, setInFlightAdsCategory] = useState<string>("top");
    const [profileArea, setProfileArea] = useState<{ region?: string; prefecture?: string } | null>(null);

    const dateLabel = useSyncExternalStore(
        () => () => undefined,
        getDateLabelSnapshot,
        () => "",
    );

    const activeCategoryRef = useRef(activeCategory);
    useEffect(() => {
        activeCategoryRef.current = activeCategory;
    }, [activeCategory, profileArea]);

    useEffect(() => {
        fetch("/api/news/posts")
            .then((r) => r.json())
            .then((data) => setPosts(Array.isArray(data) ? data : []))
            .finally(() => setPostsLoading(false));
    }, []);

    useEffect(() => {
        fetch("/api/profile/save/me")
            .then((r) => r.json())
            .then((data) => {
                const p = data?.profile;
                if (!p) return;
                setProfileArea({
                    region: typeof p.region === "string" ? p.region : undefined,
                    prefecture: typeof p.prefecture === "string" ? p.prefecture : undefined,
                });
            })
            .catch(() => setProfileArea(null));
    }, []);

    const TAB_KEYWORDS: Record<string, string> = {
        sports: "スポーツ",
        healthcare: "ヘルスケア",
        sportsbusiness: "スポーツビジネス",
    };

    const fetchTopSections = async () => {
        const cached = feedCacheRef.current.top;
        if (cached?.type === "top") {
            setFeedSections(cached.data);
            setFeedLoading(false);
            return;
        }

        setFeedLoading(true);
        try {
            const res = await fetch("/api/news/feed");
            const data = await res.json();
            const next = Array.isArray(data) ? data : [];
            feedCacheRef.current.top = { type: "top", data: next };
            setFeedSections(next);
        } catch {
            setFeedSections([]);
        } finally {
            setFeedLoading(false);
        }
    };

    const fetchByKeyword = async (categoryId: string, kw: string) => {
        const cached = feedCacheRef.current[categoryId];
        if (cached?.type === "single") {
            setSingleFeed(cached.data);
            setFeedLoading(false);
            return;
        }

        setFeedLoading(true);
        try {
            const res = await fetch(`/api/news/feed?keyword=${encodeURIComponent(kw)}`);
            const data = await res.json();
            const next = Array.isArray(data) ? data : [];
            feedCacheRef.current[categoryId] = { type: "single", data: next };
            setSingleFeed(next);
        } catch {
            setSingleFeed([]);
        } finally {
            setFeedLoading(false);
        }
    };

    const fetchLocal = async () => {
        const cached = feedCacheRef.current.local;
        if (cached?.type === "single") {
            setSingleFeed(cached.data);
            setFeedLoading(false);
            return;
        }

        const prefecture = profileArea?.prefecture?.trim() ?? "";
        const region = profileArea?.region?.trim() ?? "";
        if (!prefecture && !region) {
            setSingleFeed([]);
            return;
        }

        setFeedLoading(true);
        try {
            const res = await fetch(`/api/news/local?prefecture=${encodeURIComponent(prefecture)}&region=${encodeURIComponent(region)}`);
            const json = await res.json();
            const articles = Array.isArray(json?.articles) ? json.articles : [];
            const mappedRaw: Array<UnifiedArticle | null> = articles
                .map((a: Record<string, unknown>) => {
                    const url = typeof a.url === "string" ? a.url : "";
                    const title = typeof a.title === "string" ? a.title : "";
                    const id = typeof a.id === "string" ? a.id : url;
                    const source = typeof a.source === "string" ? a.source : "News";
                    const imageUrl = typeof a.imageUrl === "string" ? a.imageUrl : undefined;
                    const publishedAt = typeof a.publishedAt === "string" ? a.publishedAt : new Date().toISOString();
                    if (!url || !title) return null;
                    return {
                        id,
                        sourceType: "rss",
                        category: "local",
                        title,
                        url,
                        source,
                        imageUrl,
                        publishedAt,
                    } satisfies UnifiedArticle;
                });

            const mapped: UnifiedArticle[] = mappedRaw
                .filter((v: UnifiedArticle | null): v is UnifiedArticle => v !== null)
                .slice(0, 20);
            feedCacheRef.current.local = { type: "single", data: mapped };
            setSingleFeed(mapped);
        } catch {
            setSingleFeed([]);
        } finally {
            setFeedLoading(false);
        }
    };

    useEffect(() => {
        if (activeCategory !== "top") return;
        fetchTopSections();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
        if (activeCategory === "top") return;
        if (activeCategory === "local") {
            fetchLocal();
            return;
        }
        const kw = TAB_KEYWORDS[activeCategory] ?? "";
        if (!kw) {
            setSingleFeed([]);
            return;
        }
        fetchByKeyword(activeCategory, kw);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [activeCategory]);

    useEffect(() => {
        if (inFlightAdsCategory !== activeCategory) return;

        const url = activeCategory === "top" ? "/api/ads" : `/api/ads?category=${activeCategory}`;
        fetch(url, { cache: "no-store" })
            .then((r) => r.json())
            .then((data) => {
                setAds(Array.isArray(data?.ads) ? data.ads : []);
            })
            .catch(() => setAds([]))
            .finally(() => setInFlightAdsCategory(""));
    }, [activeCategory, inFlightAdsCategory]);

    const CATEGORIES = useMemo(
        () => [
            { id: "top", label: "トップニュース" },
            { id: "local", label: "ローカルニュース" },
            { id: "sports", label: "スポーツ" },
            { id: "healthcare", label: "ヘルスケア" },
            { id: "sportsbusiness", label: "スポーツビジネス" },
        ],
        [],
    );

    const feedLabel = CATEGORIES.find((c) => c.id === activeCategory)?.label ?? activeCategory;
    const adsLoading = inFlightAdsCategory === activeCategory;

    const mergedFeedRows = useMemo(() => mergeAdsIntoArticles({ articles: singleFeed, ads }), [singleFeed, ads]);

    const topSectionsWithAds = useMemo(() => {
        const remaining = [...ads].sort((a, b) => (a.position ?? 3) - (b.position ?? 3));
        return feedSections.map((sec) => {
            const take = Math.min(Math.floor(sec.articles.length / 5), remaining.length);
            const secAds = take > 0 ? remaining.splice(0, take) : [];
            return {
                section: sec.section,
                rows: mergeAdsIntoArticles({ articles: sec.articles, ads: secAds }),
            };
        });
    }, [feedSections, ads]);

    const noticeRows = useMemo(() => mergeAdsIntoArticles({ articles: posts, ads }), [posts, ads]);

    return (
        <div className="space-y-4">
            <div className={dateLabelAlign === "right" ? "flex items-end justify-between gap-4" : "space-y-1"}>
                <h1 className="font-display text-4xl font-black tracking-tight">{title}</h1>
                <span className="text-sm text-muted-foreground" suppressHydrationWarning>
                    {dateLabel}
                </span>
            </div>

            <div className="flex overflow-x-auto gap-2" style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}>
                {CATEGORIES.map((c) => {
                    const active = c.id === activeCategory;
                    return (
                        <button
                            key={c.id}
                            type="button"
                            onClick={() => {
                                setInFlightAdsCategory(c.id);
                                setActiveCategory(c.id);
                            }}
                            className={`whitespace-nowrap h-9 px-3 md:px-4 text-sm rounded-full border transition-colors ${
                                active
                                    ? "border-primary bg-primary text-primary-foreground font-medium"
                                    : "border-border bg-muted/40 text-foreground hover:bg-muted/60"
                            }`}
                        >
                            {c.label}
                        </button>
                    );
                })}
            </div>

            <div className="space-y-4">
                {postsLoading ? (
                    <section className="overflow-hidden rounded-2xl border bg-card">
                        <div className="border-b px-5 py-4">
                            <p className="text-sm font-semibold text-foreground">運営からのお知らせ</p>
                        </div>
                        <div className="animate-pulse">
                            {Array.from({ length: 3 }).map((_, idx) => (
                                <div key={idx} className={idx === 2 ? "" : "border-b"}>
                                    <NewsCardSkeleton />
                                </div>
                            ))}
                        </div>
                    </section>
                ) : posts.length > 0 ? (
                    <section className="overflow-hidden rounded-2xl border bg-card">
                        <div className="border-b px-5 py-4">
                            <p className="text-sm font-semibold text-foreground">運営からのお知らせ</p>
                        </div>
                        <div>
                            {noticeRows.map((row, idx, arr) => {
                                const showDivider = idx !== arr.length - 1;
                                if (row.type === "ad") {
                                    return <AdCard key={row.key} ad={row.item} />;
                                }
                                return (
                                    <NewsCard
                                        key={row.key}
                                        article={row.item}
                                        onClick={() => setSelectedArticle(row.item)}
                                        showDivider={showDivider}
                                    />
                                );
                            })}
                        </div>
                    </section>
                ) : null}

                {feedLoading ? (
                    <section className="overflow-hidden rounded-2xl border bg-card">
                        <div className="border-b px-5 py-4">
                            <p className="text-sm font-semibold text-foreground">
                                {activeCategory === "top" ? "トップニュース" : `${feedLabel} のニュース`}
                            </p>
                        </div>
                        <div className="animate-pulse">
                            {Array.from({ length: 5 }).map((_, idx) => (
                                <div key={idx} className={idx === 4 ? "" : "border-b"}>
                                    <NewsCardSkeleton />
                                </div>
                            ))}
                        </div>
                    </section>
                ) : activeCategory === "top" && feedSections.length > 0 ? (
                    <>
                        {topSectionsWithAds.map((sec) => (
                            <section key={sec.section.keyword} className="overflow-hidden rounded-2xl border bg-card">
                                <div className="border-b px-5 py-4">
                                    <p className="text-sm font-semibold text-foreground">{sec.section.label}</p>
                                </div>
                                <div>
                                    {sec.rows.map((row, idx, arr) => {
                                        const showDivider = idx !== arr.length - 1;
                                        if (row.type === "ad") {
                                            return <AdCard key={row.key} ad={row.item} />;
                                        }
                                        return (
                                            <NewsCard
                                                key={row.key}
                                                article={row.item}
                                                onClick={() => setSelectedArticle(row.item)}
                                                showDivider={showDivider}
                                            />
                                        );
                                    })}
                                </div>
                            </section>
                        ))}
                    </>
                ) : activeCategory !== "top" && (singleFeed.length > 0 || (!adsLoading && ads.length > 0)) ? (
                    <section className="overflow-hidden rounded-2xl border bg-card">
                        <div className="border-b px-5 py-4">
                            <p className="text-sm font-semibold text-foreground">{feedLabel} のニュース</p>
                        </div>
                        <div>
                            {mergedFeedRows.map((row, idx, arr) => {
                                const showDivider = idx !== arr.length - 1;
                                if (row.type === "ad") {
                                    return <AdCard key={row.key} ad={row.item} />;
                                }
                                return <NewsCard key={row.key} article={row.item} showDivider={showDivider} />;
                            })}
                        </div>
                    </section>
                ) : null}
            </div>

            <ArticleSheet article={selectedArticle} onClose={() => setSelectedArticle(null)} />
        </div>
    );
}
