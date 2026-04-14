"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import type { AdItem } from "@/lib/ads-shared";
import { isLocalPlan } from "@/lib/ads-shared";
import type { NewsPost, NewsTopic } from "@/lib/news";
import { NEWS_TOPIC_LABEL } from "@/lib/news";
import AdCard from "@/components/AdCard";

type RecommendedUser = {
    slug: string;
    displayName: string;
    role: string;
    avatarUrl?: string | null;
    sport?: string | null;
    region?: string | null;
};

const CATEGORY_ITEMS: Array<{ key: NewsTopic; label: string }> = [
    { key: "all", label: "すべて" },
    { key: "featured", label: "注目" },
    { key: "athlete", label: "アスリート" },
    { key: "trainer", label: "トレーナー" },
    { key: "business", label: "ビジネス" },
    { key: "event", label: "イベント" },
    { key: "update", label: "アップデート" },
];

function excerpt(text: string, limit = 96) {
    return text.replace(/\s+/g, " ").trim().slice(0, limit);
}

function primaryImage(post: NewsPost) {
    return post.imageUrl ?? post.galleryImages[0] ?? null;
}

function roleColor(role: string) {
    if (role === "Athlete") return "bg-rose-50 text-rose-700 border-rose-200";
    if (role === "Trainer") return "bg-emerald-50 text-emerald-700 border-emerald-200";
    if (role === "Business") return "bg-blue-50 text-blue-700 border-blue-200";
    return "bg-slate-100 text-slate-700 border-slate-200";
}

export function NewsRoomsPageClient({
    posts,
    ads,
    recommendedUsers,
}: {
    posts: NewsPost[];
    ads: AdItem[];
    recommendedUsers: RecommendedUser[];
}) {
    const [selectedCategory, setSelectedCategory] = useState<NewsTopic>("all");
    const [visibleCount, setVisibleCount] = useState(8);
    const loaderRef = useRef<HTMLDivElement | null>(null);
    const nationalAd = ads.find((ad) => !isLocalPlan(ad.plan)) ?? null;
    const localAd = ads.find((ad) => isLocalPlan(ad.plan)) ?? null;

    const featuredTop = useMemo(
        () =>
            [...posts]
                .sort((a, b) => {
                    if (b.viewCount !== a.viewCount) return b.viewCount - a.viewCount;
                    if (b.cheerCount !== a.cheerCount) return b.cheerCount - a.cheerCount;
                    return new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime();
                })
                .slice(0, 3),
        [posts],
    );

    const filteredPosts = useMemo(() => {
        if (selectedCategory === "all") return posts;
        if (selectedCategory === "featured") return featuredTop;
        return posts.filter((post) => post.topic === selectedCategory || (selectedCategory === "update" && post.category === "announce"));
    }, [featuredTop, posts, selectedCategory]);

    const visiblePosts = filteredPosts.slice(0, visibleCount);
    const trendingPosts = [...posts]
        .sort((a, b) => b.viewCount - a.viewCount || b.cheerCount - a.cheerCount)
        .slice(0, 5);
    const hotPosts = [...posts]
        .sort((a, b) => {
            const scoreA = a.commentCount * 3 + a.cheerCount * 2 + a.viewCount;
            const scoreB = b.commentCount * 3 + b.cheerCount * 2 + b.viewCount;
            return scoreB - scoreA;
        })
        .slice(0, 5);

    useEffect(() => {
        setVisibleCount(8);
    }, [selectedCategory]);

    useEffect(() => {
        if (!loaderRef.current) return;
        const target = loaderRef.current;
        const observer = new IntersectionObserver(
            (entries) => {
                const entry = entries[0];
                if (!entry?.isIntersecting) return;
                setVisibleCount((prev) => Math.min(prev + 6, filteredPosts.length));
            },
            { rootMargin: "240px 0px" },
        );

        observer.observe(target);
        return () => observer.disconnect();
    }, [filteredPosts.length]);

    return (
        <div className="grid gap-5 xl:grid-cols-[190px_minmax(0,1fr)_300px]">
            <aside className="xl:sticky xl:top-6 xl:self-start">
                <div className="rounded-[24px] border border-slate-200 bg-white p-4 shadow-[0_14px_40px_rgba(15,23,42,0.06)]">
                    <p className="mb-4 text-[11px] font-bold uppercase tracking-[0.22em] text-slate-500">Categories</p>
                    <div className="space-y-2">
                        {CATEGORY_ITEMS.map((item) => {
                            const active = selectedCategory === item.key;
                            return (
                                <button
                                    key={item.key}
                                    type="button"
                                    onClick={() => setSelectedCategory(item.key)}
                                    className={`flex w-full items-center justify-between rounded-2xl border px-4 py-3 text-left text-sm font-bold transition ${active ? "border-slate-900 bg-slate-900 text-white" : "border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100"}`}
                                >
                                    <span>{item.label}</span>
                                    <span className={`text-[11px] ${active ? "text-white/70" : "text-slate-400"}`}>
                                        {item.key === "featured" ? featuredTop.length : item.key === "all" ? posts.length : posts.filter((post) => post.topic === item.key || (item.key === "update" && post.category === "announce")).length}
                                    </span>
                                </button>
                            );
                        })}
                    </div>
                </div>
            </aside>

            <section className="space-y-4">
                {nationalAd ? (
                    <AdCard ad={nationalAd} size="medium" />
                ) : null}

                <div className="rounded-[28px] border border-slate-200 bg-white shadow-[0_18px_50px_rgba(15,23,42,0.08)]">
                    <div className="border-b border-slate-200 px-6 py-5">
                        <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-slate-500">Top Stories</p>
                        <h1 className="mt-2 text-3xl font-black text-slate-950">News Rooms</h1>
                        <p className="mt-2 text-sm leading-7 text-slate-600">一覧で理解して、気になる記事を深く読み、次の行動へつなげるニュース体験です。</p>
                    </div>
                    <div className="grid gap-4 p-4 lg:grid-cols-3">
                        {featuredTop.map((post, index) => (
                            <Link
                                key={post.id}
                                href={`/news/${post.id}`}
                                className={`${index === 0 ? "lg:col-span-2 lg:row-span-2" : ""} overflow-hidden rounded-[24px] border border-slate-200 bg-slate-50 transition hover:-translate-y-[1px] hover:bg-white hover:shadow-[0_16px_40px_rgba(15,23,42,0.08)]`}
                            >
                                {primaryImage(post) ? (
                                    <img src={primaryImage(post) ?? undefined} alt={post.title} className={`w-full object-cover ${index === 0 ? "h-[260px]" : "h-[160px]"}`} />
                                ) : (
                                    <div className={`bg-[linear-gradient(135deg,#dbeafe,#eff6ff)] ${index === 0 ? "h-[260px]" : "h-[160px]"}`} />
                                )}
                                <div className="p-5">
                                    <div className="mb-3 flex flex-wrap items-center gap-2 text-[11px]">
                                        <span className="rounded-full bg-red-600 px-3 py-1 font-bold text-white">TOP</span>
                                        <span className={`rounded-full border px-3 py-1 font-bold ${roleColor(post.authorRole)}`}>{post.authorRole}</span>
                                        <span className="text-slate-500">{NEWS_TOPIC_LABEL[post.topic]}</span>
                                    </div>
                                    <h2 className={`font-black leading-tight text-slate-950 ${index === 0 ? "text-[26px]" : "text-lg"}`}>{post.title}</h2>
                                    <p className="mt-3 text-sm leading-7 text-slate-600">{post.summary}</p>
                                </div>
                            </Link>
                        ))}
                    </div>
                </div>

                <div className="rounded-[28px] border border-slate-200 bg-white shadow-[0_18px_50px_rgba(15,23,42,0.08)]">
                    <div className="border-b border-slate-200 px-6 py-5">
                        <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-slate-500">News Feed</p>
                        <div className="mt-2 flex flex-wrap items-end justify-between gap-3">
                            <div>
                                <h2 className="text-2xl font-black text-slate-950">{CATEGORY_ITEMS.find((item) => item.key === selectedCategory)?.label ?? "すべて"}</h2>
                                <p className="mt-1 text-sm text-slate-600">{filteredPosts.length.toLocaleString()}本の記事</p>
                            </div>
                            <span className="text-xs text-slate-500">スクロールで続きを読み込む</span>
                        </div>
                    </div>

                    <div className="divide-y divide-slate-200">
                        {visiblePosts.map((post) => (
                            <Link
                                key={post.id}
                                href={`/news/${post.id}`}
                                className="grid gap-0 transition hover:bg-slate-50 sm:grid-cols-[220px_1fr]"
                            >
                                {primaryImage(post) ? (
                                    <img src={primaryImage(post) ?? undefined} alt={post.title} className="h-[170px] w-full object-cover sm:h-full" />
                                ) : (
                                    <div className="min-h-[160px] bg-[linear-gradient(135deg,#e2e8f0,#f8fafc)]" />
                                )}
                                <div className="p-5 sm:p-6">
                                    <div className="mb-3 flex flex-wrap items-center gap-2 text-[11px]">
                                        <span className={`rounded-full border px-3 py-1 font-bold ${roleColor(post.authorRole)}`}>{post.authorRole}</span>
                                        <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 font-bold text-slate-700">{NEWS_TOPIC_LABEL[post.topic]}</span>
                                    </div>
                                    <h3 className="text-[24px] font-black leading-tight text-slate-950">{post.title}</h3>
                                    <p className="mt-3 line-clamp-2 text-sm leading-7 text-slate-600">{excerpt(post.summary || post.body, 120)}</p>
                                    <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-slate-500">
                                        <span>{post.author}</span>
                                        <span>{new Date(post.publishedAt).toLocaleString("ja-JP")}</span>
                                        <span>閲覧 {post.viewCount.toLocaleString()}</span>
                                        <span>Cheer {post.cheerCount.toLocaleString()}</span>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>

                    <div ref={loaderRef} className="px-6 py-5 text-center text-sm text-slate-500">
                        {visibleCount < filteredPosts.length ? "さらに記事を読み込み中..." : "ここまでです"}
                    </div>
                </div>
            </section>

            <aside className="space-y-4 xl:sticky xl:top-6 xl:self-start">
                <section className="rounded-[24px] border border-slate-200 bg-white p-5 shadow-[0_14px_40px_rgba(15,23,42,0.06)]">
                    <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-slate-500">Trending</p>
                    <div className="mt-4 space-y-3">
                        {trendingPosts.map((post, index) => (
                            <Link key={post.id} href={`/news/${post.id}`} className="block rounded-2xl border border-slate-200 p-4 transition hover:bg-slate-50">
                                <p className="text-[11px] font-bold text-slate-400">#{index + 1}</p>
                                <p className="mt-2 text-sm font-bold leading-6 text-slate-900">{post.title}</p>
                                <p className="mt-2 text-xs text-slate-500">閲覧 {post.viewCount.toLocaleString()}</p>
                            </Link>
                        ))}
                    </div>
                </section>

                <section className="rounded-[24px] border border-slate-200 bg-white p-5 shadow-[0_14px_40px_rgba(15,23,42,0.06)]">
                    <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-slate-500">Hot</p>
                    <div className="mt-4 space-y-3">
                        {hotPosts.map((post) => (
                            <Link key={post.id} href={`/news/${post.id}`} className="block rounded-2xl border border-slate-200 p-4 transition hover:bg-slate-50">
                                <p className="text-sm font-bold leading-6 text-slate-900">{post.title}</p>
                                <div className="mt-2 flex flex-wrap gap-3 text-xs text-slate-500">
                                    <span>コメント {post.commentCount.toLocaleString()}</span>
                                    <span>Cheer {post.cheerCount.toLocaleString()}</span>
                                </div>
                            </Link>
                        ))}
                    </div>
                </section>

                <section className="rounded-[24px] border border-slate-200 bg-white p-5 shadow-[0_14px_40px_rgba(15,23,42,0.06)]">
                    <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-slate-500">おすすめユーザー</p>
                    <div className="mt-4 space-y-3">
                        {recommendedUsers.map((user) => (
                            <Link key={user.slug} href={`/u/${user.slug}`} className="flex items-center gap-3 rounded-2xl border border-slate-200 p-3 transition hover:bg-slate-50">
                                {user.avatarUrl ? (
                                    <img src={user.avatarUrl} alt={user.displayName} className="h-12 w-12 rounded-full object-cover" />
                                ) : (
                                    <div className="grid h-12 w-12 place-items-center rounded-full bg-slate-100 text-sm font-bold text-slate-500">
                                        {user.displayName.slice(0, 1)}
                                    </div>
                                )}
                                <div className="min-w-0 flex-1">
                                    <p className="truncate text-sm font-bold text-slate-900">{user.displayName}</p>
                                    <p className="truncate text-xs text-slate-500">{user.role}{user.sport ? ` · ${user.sport}` : ""}</p>
                                </div>
                                <span className="rounded-full bg-slate-900 px-3 py-1 text-[11px] font-bold text-white">見る</span>
                            </Link>
                        ))}
                    </div>
                </section>

                {localAd ? <AdCard ad={localAd} size="small" /> : null}
            </aside>
        </div>
    );
}
