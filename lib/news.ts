import { supabaseServer } from "@/lib/supabase/server";

export type NewsCategory = "announce" | "column" | "interview";

export interface NewsPost {
    id: string;
    category: NewsCategory;
    title: string;
    body: string;
    author: string;
    publishedAt: string;
    isPublished: boolean;
}

export const NEWS_CATEGORY_LABEL: Record<NewsCategory, string> = {
    announce: "お知らせ",
    column: "コラム",
    interview: "インタビュー",
};

export async function getNewsPosts(): Promise<NewsPost[]> {
    try {
        const { data, error } = await supabaseServer
            .from("news_posts")
            .select("id, category, title, body, author, published_at, is_published")
            .eq("is_published", true)
            .order("published_at", { ascending: false });

        if (error) {
            console.error("[getNewsPosts]", error);
            return [];
        }

        return (data ?? []).map((row) => ({
            id: String(row.id),
            category: row.category as NewsCategory,
            title: String(row.title),
            body: String(row.body),
            author: String(row.author ?? "運営"),
            publishedAt: String(row.published_at),
            isPublished: Boolean(row.is_published),
        }));
    } catch (err) {
        console.error("[getNewsPosts]", err);
        return [];
    }
}
