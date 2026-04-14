import { NextResponse } from "next/server";
import { getNewsPosts } from "@/lib/news";
import type { UnifiedArticle } from "@/lib/news/types";

export async function GET() {
    const posts = await getNewsPosts();

    const articles: UnifiedArticle[] = posts
        .filter((post) => post.isPublished)
        .sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime())
        .map((post) => ({
            id: post.id,
            sourceType: "internal",
            category: post.category,
            title: post.title,
            body: post.body,
            source: post.author?.trim().length ? post.author : "運営",
            imageUrl: post.galleryImages?.[0] ?? undefined,
            publishedAt: post.publishedAt,
        }));

    return NextResponse.json(articles);
}
