export type ArticleSource = "internal" | "rss";

export interface UnifiedArticle {
    id: string;
    sourceType: ArticleSource;
    category: string;
    title: string;
    body?: string;
    url?: string;
    source: string;
    imageUrl?: string;
    publishedAt: string;
}
