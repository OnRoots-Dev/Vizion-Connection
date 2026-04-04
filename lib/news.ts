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
    imageUrl: string | null;
    viewCount: number;
}

export const NEWS_CATEGORY_LABEL: Record<NewsCategory, string> = {
    announce: "お知らせ",
    column: "コラム",
    interview: "インタビュー",
};

const NEWS_SELECT_WITH_MEDIA = "id, category, title, body, author, published_at, is_published, image_url, view_count";
const NEWS_SELECT_LEGACY = "id, category, title, body, author, published_at, is_published";

function normalizeNewsPost(row: Record<string, unknown>): NewsPost {
    return {
        id: String(row.id),
        category: row.category as NewsCategory,
        title: String(row.title),
        body: String(row.body),
        author: String(row.author ?? "運営"),
        publishedAt: String(row.published_at),
        isPublished: Boolean(row.is_published),
        imageUrl: typeof row.image_url === "string" && row.image_url.length > 0 ? row.image_url : null,
        viewCount: typeof row.view_count === "number" ? row.view_count : Number(row.view_count ?? 0),
    };
}

async function fetchPublishedNewsRows() {
    const withMedia = await supabaseServer
        .from("news_posts")
        .select(NEWS_SELECT_WITH_MEDIA)
        .eq("is_published", true)
        .order("published_at", { ascending: false });

    if (!withMedia.error) {
        return withMedia.data ?? [];
    }

    const legacy = await supabaseServer
        .from("news_posts")
        .select(NEWS_SELECT_LEGACY)
        .eq("is_published", true)
        .order("published_at", { ascending: false });

    if (legacy.error) {
        throw legacy.error;
    }

    return legacy.data ?? [];
}

export async function getNewsPosts(): Promise<NewsPost[]> {
    try {
        const data = await fetchPublishedNewsRows();
        return data.map((row) => normalizeNewsPost(row as Record<string, unknown>));
    } catch (err) {
        console.error("[getNewsPosts]", err);
        return [];
    }
}

export async function getNewsPostById(id: string): Promise<NewsPost | null> {
    try {
        const withMedia = await supabaseServer
            .from("news_posts")
            .select(NEWS_SELECT_WITH_MEDIA)
            .eq("id", id)
            .eq("is_published", true)
            .maybeSingle();

        if (!withMedia.error && withMedia.data) {
            return normalizeNewsPost(withMedia.data as Record<string, unknown>);
        }

        const legacy = await supabaseServer
            .from("news_posts")
            .select(NEWS_SELECT_LEGACY)
            .eq("id", id)
            .eq("is_published", true)
            .maybeSingle();

        if (legacy.error || !legacy.data) {
            if (legacy.error) console.error("[getNewsPostById]", legacy.error);
            return null;
        }

        return normalizeNewsPost(legacy.data as Record<string, unknown>);
    } catch (err) {
        console.error("[getNewsPostById]", err);
        return null;
    }
}

export async function incrementNewsPostView(id: string): Promise<void> {
    try {
        const { data, error } = await supabaseServer
            .from("news_posts")
            .select("view_count")
            .eq("id", id)
            .maybeSingle();

        if (error || !data) {
            return;
        }

        const nextCount = Number(data.view_count ?? 0) + 1;
        await supabaseServer.from("news_posts").update({ view_count: nextCount }).eq("id", id);
    } catch (err) {
        console.error("[incrementNewsPostView]", err);
    }
}

export async function getFeaturedNewsPost(): Promise<NewsPost | null> {
    const posts = await getFeaturedNewsPosts(1);
    return posts[0] ?? null;
}

export async function getFeaturedNewsPosts(limit = 5): Promise<NewsPost[]> {
    const posts = await getNewsPosts();
    if (posts.length === 0) return [];

    return [...posts]
        .sort((a, b) => {
            if (b.viewCount !== a.viewCount) return b.viewCount - a.viewCount;
            return new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime();
        })
        .slice(0, Math.max(1, limit));
}
