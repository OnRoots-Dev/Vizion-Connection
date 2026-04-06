"use client";

import { useEffect, useRef, useState } from "react";
import type { DashboardView, ThemeColors } from "@/app/(app)/dashboard/types";
import { SectionCard, SLabel, ViewHeader } from "@/app/(app)/dashboard/components/ui";
import type { AdItem } from "@/lib/ads-shared";
import { isLocalPlan } from "@/lib/ads-shared";
import AdCard from "@/components/AdCard";

type NewsPost = {
    id: string;
    category: "announce" | "column" | "interview";
    title: string;
    body: string;
    author: string;
    publishedAt: string;
    imageUrl: string | null;
    viewCount: number;
};

const CATEGORY_LABEL: Record<NewsPost["category"], string> = {
    announce: "お知らせ",
    column: "コラム",
    interview: "インタビュー",
};

function excerpt(text: string) {
    return text.replace(/\s+/g, " ").trim().slice(0, 88);
}

export function NewsView({
    t,
    roleColor,
    setView,
    ads,
    selectedNewsId,
    onSelectNews,
}: {
    t: ThemeColors;
    roleColor: string;
    setView: (v: DashboardView) => void;
    ads: AdItem[];
    selectedNewsId: string | null;
    onSelectNews: (newsId: string | null) => void;
}) {
    const [posts, setPosts] = useState<NewsPost[]>([]);
    const [featured, setFeatured] = useState<NewsPost | null>(null);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const viewedIdsRef = useRef<Set<string>>(new Set());
    const nationalAd = ads.find((ad) => !isLocalPlan(ad.plan)) ?? null;
    const localAd = ads.find((ad) => isLocalPlan(ad.plan)) ?? null;

    useEffect(() => {
        setLoading(true);
        fetch("/api/news/posts")
            .then((r) => r.json())
            .then((d) => {
                setPosts(d.posts ?? []);
                setFeatured(d.featured ?? null);
            })
            .catch(() => {
                setPosts([]);
                setFeatured(null);
            })
            .finally(() => setLoading(false));
    }, []);

    useEffect(() => {
        if (!selectedNewsId) return;
        if (viewedIdsRef.current.has(selectedNewsId)) return;
        const target = posts.find((post) => post.id === selectedNewsId);
        if (!target) return;
        viewedIdsRef.current.add(selectedNewsId);

        setPosts((prev) =>
            prev.map((post) =>
                post.id === selectedNewsId
                    ? { ...post, viewCount: post.viewCount + 1 }
                    : post,
            ),
        );
        setFeatured((prev) => (prev?.id === selectedNewsId ? { ...prev, viewCount: prev.viewCount + 1 } : prev));
    }, [selectedNewsId, posts]);

    const selectedPost = selectedNewsId ? posts.find((post) => post.id === selectedNewsId) ?? null : null;
    const listCardMinWidth = featured ? 200 : 220;
    const PAGE_SIZE = 6;
    const totalPages = Math.max(1, Math.ceil(posts.length / PAGE_SIZE));
    const pagedPosts = posts.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

    useEffect(() => {
        setPage(1);
    }, [posts.length]);

    return (
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <style>{`
                .vz-news-card:hover .vz-news-card-image {
                    transform: scale(1.03);
                }
            `}</style>
            <ViewHeader title="News Rooms" sub={selectedPost ? "記事詳細" : "最新ニュース"} onBack={() => selectedPost ? onSelectNews(null) : setView("home")} t={t} roleColor={roleColor} />
            <div
                style={{
                    display: "grid",
                    gridTemplateRows: "auto minmax(0, 1fr) auto",
                    gap: 10,
                    minHeight: "min(74vh, calc(100vh - 180px))",
                }}
            >
                {nationalAd ? (
                    <AdCard ad={nationalAd} size="medium" />
                ) : (
                    <SectionCard t={t}>
                        <SLabel text="AD SLOT" color="#FFD600" />
                        <p style={{ margin: 0, fontSize: 11, color: t.sub, opacity: 0.5 }}>全国スポンサー広告枠（準備中）</p>
                    </SectionCard>
                )}

                <SectionCard t={t} accentColor={roleColor}>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8, marginBottom: 10 }}>
                        <SLabel text={selectedPost ? "Article Detail" : "Latest Posts"} color={roleColor} />
                        {selectedPost ? (
                            <button
                                type="button"
                                onClick={() => onSelectNews(null)}
                                style={{
                                    padding: "5px 10px",
                                    borderRadius: 999,
                                    border: `1px solid ${t.border}`,
                                    background: "rgba(255,255,255,0.04)",
                                    color: t.sub,
                                    fontSize: 10,
                                    fontWeight: 800,
                                    cursor: "pointer",
                                }}
                            >
                                記事一覧へ戻る
                            </button>
                        ) : null}
                    </div>
                    <div style={{ maxHeight: "100%", overflowY: "auto", paddingRight: 2 }}>
                        {loading ? (
                            <p style={{ margin: 0, color: t.sub, fontSize: 12 }}>読み込み中...</p>
                        ) : selectedPost ? (
                            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                                {selectedPost.imageUrl ? (
                                    <img src={selectedPost.imageUrl} alt={selectedPost.title} style={{ width: "100%", height: 220, objectFit: "cover", borderRadius: 14, display: "block" }} />
                                ) : null}
                                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8, flexWrap: "wrap" }}>
                                    <span style={{ fontSize: 10, fontWeight: 800, color: roleColor }}>{CATEGORY_LABEL[selectedPost.category]}</span>
                                    <span style={{ fontSize: 10, color: t.sub }}>{new Date(selectedPost.publishedAt).toLocaleString("ja-JP")}</span>
                                </div>
                                <p style={{ margin: 0, fontSize: 22, fontWeight: 900, color: t.text, lineHeight: 1.4 }}>{selectedPost.title}</p>
                                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8, color: t.sub, fontSize: 11 }}>
                                    <span>{selectedPost.author || "運営"}</span>
                                    <span>閲覧 {selectedPost.viewCount.toLocaleString()}</span>
                                </div>
                                <p style={{ margin: 0, fontSize: 13, color: t.sub, lineHeight: 1.9, whiteSpace: "pre-wrap" }}>{selectedPost.body}</p>
                            </div>
                        ) : posts.length === 0 ? (
                            <p style={{ margin: 0, color: t.sub, fontSize: 12 }}>公開中のニュースはまだありません。</p>
                        ) : (
                            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                                {featured ? (
                                    <button
                                        type="button"
                                        onClick={() => onSelectNews(featured.id)}
                                        style={{
                                            display: "grid",
                                            gridTemplateColumns: "1fr",
                                            gap: 0,
                                            overflow: "hidden",
                                            borderRadius: 20,
                                            border: "1px solid rgba(255,214,0,0.18)",
                                            background: "linear-gradient(135deg, rgba(255,214,0,0.08), rgba(255,255,255,0.03))",
                                            marginBottom: 2,
                                            padding: 0,
                                            cursor: "pointer",
                                            textAlign: "left",
                                            color: t.text,
                                        }}
                                    >
                                        {featured.imageUrl ? (
                                            <div style={{ overflow: "hidden" }}>
                                                <img src={featured.imageUrl} alt={featured.title} style={{ width: "100%", height: 200, objectFit: "cover", display: "block" }} />
                                            </div>
                                        ) : (
                                            <div style={{ height: 180, background: "linear-gradient(135deg, rgba(255,214,0,0.28), rgba(255,255,255,0.05))" }} />
                                        )}
                                        <div style={{ padding: "14px 16px" }}>
                                            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8, marginBottom: 8, flexWrap: "wrap" }}>
                                                <span style={{ fontSize: 10, fontWeight: 900, color: "#FFD600" }}>注目記事</span>
                                                <span style={{ fontSize: 10, color: t.sub }}>閲覧 {featured.viewCount.toLocaleString()}</span>
                                            </div>
                                            <p style={{ margin: "0 0 6px", fontSize: 16, fontWeight: 900, color: t.text }}>{featured.title}</p>
                                            <p style={{ margin: 0, fontSize: 12, color: t.sub, lineHeight: 1.7 }}>{excerpt(featured.body)}</p>
                                            <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 10 }}>
                                                <span
                                                    style={{
                                                        padding: "5px 10px",
                                                        borderRadius: 999,
                                                        border: "1px solid rgba(255,214,0,0.22)",
                                                        background: "rgba(255,214,0,0.08)",
                                                        color: "#FFD600",
                                                        fontSize: 10,
                                                        fontWeight: 800,
                                                    }}
                                                >
                                                    詳細を見る
                                                </span>
                                            </div>
                                        </div>
                                    </button>
                                ) : null}
                                <div
                                    style={{
                                        display: "grid",
                                        gridTemplateColumns: `repeat(auto-fit, minmax(${listCardMinWidth}px, 1fr))`,
                                        gap: 12,
                                        alignItems: "stretch",
                                    }}
                                >
                                    {pagedPosts.map((post) => (
                                        <button
                                            key={post.id}
                                            type="button"
                                            onClick={() => onSelectNews(post.id)}
                                            className="vz-news-card"
                                            style={{
                                                overflow: "hidden",
                                                borderRadius: 18,
                                                border: `1px solid ${t.border}`,
                                                background: "rgba(255,255,255,0.02)",
                                                color: t.text,
                                                textAlign: "left",
                                                cursor: "pointer",
                                                padding: 0,
                                                width: "100%",
                                                display: "flex",
                                                flexDirection: "column",
                                                minWidth: 0,
                                            }}
                                        >
                                            <div style={{ overflow: "hidden" }}>
                                                {post.imageUrl ? (
                                                    <img src={post.imageUrl} alt={post.title} className="vz-news-card-image" style={{ width: "100%", height: 148, objectFit: "cover", display: "block", transition: "transform 0.28s ease" }} />
                                                ) : (
                                                    <div className="vz-news-card-image" style={{ width: "100%", height: 148, background: "linear-gradient(135deg, rgba(255,255,255,0.12), rgba(255,255,255,0.03))", transition: "transform 0.28s ease" }} />
                                                )}
                                            </div>
                                            <div style={{ padding: "13px 13px 15px", display: "flex", flexDirection: "column", gap: 8, flex: 1 }}>
                                                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10, flexWrap: "wrap" }}>
                                                    <span style={{ fontSize: 10, fontWeight: 800, color: roleColor, padding: "3px 8px", borderRadius: 999, background: `${roleColor}18`, border: `1px solid ${roleColor}25` }}>{CATEGORY_LABEL[post.category]}</span>
                                                    <span style={{ fontSize: 10, color: t.sub }}>{new Date(post.publishedAt).toLocaleDateString("ja-JP")}</span>
                                                </div>
                                                <p style={{ margin: 0, fontSize: 15, fontWeight: 900, color: t.text, lineHeight: 1.45, display: "-webkit-box", WebkitLineClamp: 3, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
                                                    {post.title}
                                                </p>
                                                <p style={{ margin: 0, fontSize: 11, color: t.sub, lineHeight: 1.7, display: "-webkit-box", WebkitLineClamp: 3, WebkitBoxOrient: "vertical", overflow: "hidden" }}>{excerpt(post.body)}</p>
                                                <span style={{ marginTop: "auto", fontSize: 10, fontWeight: 800, color: roleColor }}>記事を読む</span>
                                            </div>
                                        </button>
                                    ))}
                                </div>
                                {posts.length > PAGE_SIZE ? (
                                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8 }}>
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
                            </div>
                        )}
                    </div>
                </SectionCard>

                {localAd ? (
                    <AdCard ad={localAd} size="small" />
                ) : (
                    <SectionCard t={t}>
                        <SLabel text="LOCAL AD SLOT" color="#FFD600" />
                        <p style={{ margin: 0, fontSize: 11, color: t.sub, opacity: 0.5 }}>地域スポンサー広告枠（準備中）</p>
                    </SectionCard>
                )}
            </div>
        </div>
    );
}
