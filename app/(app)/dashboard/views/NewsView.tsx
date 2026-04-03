"use client";

import { useEffect, useState } from "react";
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
};

const CATEGORY_LABEL: Record<NewsPost["category"], string> = {
    announce: "お知らせ",
    column: "コラム",
    interview: "インタビュー",
};

export function NewsView({
    t,
    roleColor,
    setView,
    ads,
}: {
    t: ThemeColors;
    roleColor: string;
    setView: (v: DashboardView) => void;
    ads: AdItem[];
}) {
    const [posts, setPosts] = useState<NewsPost[]>([]);
    const [loading, setLoading] = useState(true);
    const nationalAd = ads.find((ad) => !isLocalPlan(ad.plan)) ?? null;
    const localAd = ads.find((ad) => isLocalPlan(ad.plan)) ?? null;

    useEffect(() => {
        setLoading(true);
        fetch("/api/news/posts")
            .then((r) => r.json())
            .then((d) => setPosts(d.posts ?? []))
            .catch(() => setPosts([]))
            .finally(() => setLoading(false));
    }, []);

    return (
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <ViewHeader title="News Rooms" sub="最新ニュース" onBack={() => setView("home")} t={t} roleColor={roleColor} />
            <div
                style={{
                    display: "grid",
                    gridTemplateRows: "auto minmax(280px, 1fr) auto",
                    gap: 10,
                    height: "min(78vh, calc(100vh - 180px))",
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
                    <SLabel text="Latest Posts" color={roleColor} />
                    <div style={{ maxHeight: "100%", overflowY: "auto", paddingRight: 4 }}>
                        {loading ? (
                            <p style={{ margin: 0, color: t.sub, fontSize: 12 }}>読み込み中...</p>
                        ) : posts.length === 0 ? (
                            <p style={{ margin: 0, color: t.sub, fontSize: 12 }}>公開中のニュースはまだありません。</p>
                        ) : (
                            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                                {posts.map((post) => (
                                    <article key={post.id} style={{ borderRadius: 12, border: `1px solid ${t.border}`, background: "rgba(255,255,255,0.02)", padding: "12px 14px" }}>
                                        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8, marginBottom: 6 }}>
                                            <span style={{ fontSize: 10, fontWeight: 800, color: roleColor }}>{CATEGORY_LABEL[post.category]}</span>
                                            <span style={{ fontSize: 10, color: t.sub }}>{new Date(post.publishedAt).toLocaleString("ja-JP")}</span>
                                        </div>
                                        <p style={{ margin: "0 0 4px", fontSize: 14, fontWeight: 800, color: t.text }}>{post.title}</p>
                                        <p style={{ margin: 0, fontSize: 12, color: t.sub, lineHeight: 1.7, whiteSpace: "pre-wrap" }}>{post.body}</p>
                                    </article>
                                ))}
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
