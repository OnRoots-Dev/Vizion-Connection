import { supabaseServer } from "@/lib/supabase/server";

export type NewsCategory = "announce" | "column" | "interview";
export type NewsAuthorRole = "運営" | "Athlete" | "Trainer" | "Business";
export type NewsTopic = "all" | "featured" | "athlete" | "trainer" | "business" | "event" | "update";

export interface NewsPost {
    id: string;
    category: NewsCategory;
    topic: NewsTopic;
    title: string;
    summary: string;
    body: string;
    author: string;
    authorRole: NewsAuthorRole;
    publishedAt: string;
    isPublished: boolean;
    imageUrl: string | null;
    galleryImages: string[];
    videoUrl: string | null;
    viewCount: number;
    commentCount: number;
    cheerCount: number;
}

export interface NewsComment {
    id: string;
    postId: string;
    userSlug: string | null;
    authorName: string;
    authorRole: string | null;
    avatarUrl: string | null;
    body: string;
    createdAt: string;
}

export const NEWS_CATEGORY_LABEL: Record<NewsCategory, string> = {
    announce: "お知らせ",
    column: "コラム",
    interview: "インタビュー",
};

export const NEWS_TOPIC_LABEL: Record<NewsTopic, string> = {
    all: "すべて",
    featured: "注目",
    athlete: "アスリート",
    trainer: "トレーナー",
    business: "ビジネス",
    event: "イベント",
    update: "アップデート",
};

const NEWS_SELECT_EXTENDED = "id, category, topic, title, summary, body, author, author_role, published_at, is_published, image_url, gallery_image_urls, video_url, view_count, comment_count, cheer_count";
const NEWS_SELECT_WITH_MEDIA = "id, category, title, body, author, published_at, is_published, image_url, view_count";
const NEWS_SELECT_LEGACY = "id, category, title, body, author, published_at, is_published";
const COMMENT_SELECT = "id, post_id, user_slug, author_name, author_role, avatar_url, body, created_at";

function parseStringArray(value: unknown): string[] {
    if (Array.isArray(value)) {
        return value.filter((item): item is string => typeof item === "string" && item.trim().length > 0);
    }

    if (typeof value === "string" && value.trim().length > 0) {
        try {
            const parsed = JSON.parse(value);
            return Array.isArray(parsed)
                ? parsed.filter((item): item is string => typeof item === "string" && item.trim().length > 0)
                : [];
        } catch {
            return [];
        }
    }

    return [];
}

function excerpt(text: string, limit = 110) {
    return text.replace(/\s+/g, " ").trim().slice(0, limit);
}

function inferAuthorRole(row: Record<string, unknown>): NewsAuthorRole {
    const raw = String(row.author_role ?? "").trim();
    if (raw === "Athlete" || raw === "Trainer" || raw === "Business" || raw === "運営") {
        return raw;
    }

    const author = String(row.author ?? "").toLowerCase();
    if (author.includes("athlete")) return "Athlete";
    if (author.includes("trainer")) return "Trainer";
    if (author.includes("business")) return "Business";
    return "運営";
}

function inferTopic(row: Record<string, unknown>, authorRole: NewsAuthorRole): NewsTopic {
    const raw = String(row.topic ?? "").trim().toLowerCase();
    if (["featured", "athlete", "trainer", "business", "event", "update"].includes(raw)) {
        return raw as NewsTopic;
    }

    if (authorRole === "Athlete") return "athlete";
    if (authorRole === "Trainer") return "trainer";
    if (authorRole === "Business") return "business";

    const category = String(row.category ?? "");
    if (category === "announce") return "update";
    return "all";
}

function normalizeNewsPost(row: Record<string, unknown>): NewsPost {
    const authorRole = inferAuthorRole(row);
    return {
        id: String(row.id),
        category: row.category as NewsCategory,
        topic: inferTopic(row, authorRole),
        title: String(row.title),
        summary: typeof row.summary === "string" && row.summary.trim().length > 0 ? row.summary.trim() : excerpt(String(row.body ?? ""), 120),
        body: String(row.body),
        author: String(row.author ?? "運営"),
        authorRole,
        publishedAt: String(row.published_at),
        isPublished: Boolean(row.is_published),
        imageUrl: typeof row.image_url === "string" && row.image_url.length > 0 ? row.image_url : null,
        galleryImages: parseStringArray(row.gallery_image_urls),
        videoUrl: typeof row.video_url === "string" && row.video_url.length > 0 ? row.video_url : null,
        viewCount: typeof row.view_count === "number" ? row.view_count : Number(row.view_count ?? 0),
        commentCount: typeof row.comment_count === "number" ? row.comment_count : Number(row.comment_count ?? 0),
        cheerCount: typeof row.cheer_count === "number" ? row.cheer_count : Number(row.cheer_count ?? 0),
    };
}

function normalizeNewsComment(row: Record<string, unknown>): NewsComment {
    return {
        id: String(row.id),
        postId: String(row.post_id),
        userSlug: typeof row.user_slug === "string" && row.user_slug.length > 0 ? row.user_slug : null,
        authorName: String(row.author_name ?? "ゲスト"),
        authorRole: typeof row.author_role === "string" && row.author_role.length > 0 ? row.author_role : null,
        avatarUrl: typeof row.avatar_url === "string" && row.avatar_url.length > 0 ? row.avatar_url : null,
        body: String(row.body ?? ""),
        createdAt: String(row.created_at),
    };
}

async function fetchPublishedNewsRows() {
    const extended = await supabaseServer
        .from("news_posts")
        .select(NEWS_SELECT_EXTENDED)
        .eq("is_published", true)
        .order("published_at", { ascending: false });

    if (!extended.error) {
        return extended.data ?? [];
    }

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
        const extended = await supabaseServer
            .from("news_posts")
            .select(NEWS_SELECT_EXTENDED)
            .eq("id", id)
            .eq("is_published", true)
            .maybeSingle();

        if (!extended.error && extended.data) {
            return normalizeNewsPost(extended.data as Record<string, unknown>);
        }

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

export async function incrementNewsPostCheer(id: string): Promise<number | null> {
    try {
        const { data, error } = await supabaseServer
            .from("news_posts")
            .select("cheer_count")
            .eq("id", id)
            .maybeSingle();

        if (error || !data) {
            return null;
        }

        const nextCount = Number(data.cheer_count ?? 0) + 1;
        const { error: updateError } = await supabaseServer.from("news_posts").update({ cheer_count: nextCount }).eq("id", id);
        if (updateError) {
            console.error("[incrementNewsPostCheer]", updateError);
            return null;
        }
        return nextCount;
    } catch (err) {
        console.error("[incrementNewsPostCheer]", err);
        return null;
    }
}

export async function getNewsPostComments(postId: string): Promise<NewsComment[]> {
    try {
        const { data, error } = await supabaseServer
            .from("news_post_comments")
            .select(COMMENT_SELECT)
            .eq("post_id", postId)
            .order("created_at", { ascending: false });

        if (error) {
            console.error("[getNewsPostComments]", error);
            return [];
        }

        return (data ?? []).map((row) => normalizeNewsComment(row as Record<string, unknown>));
    } catch (error) {
        console.error("[getNewsPostComments]", error);
        return [];
    }
}

export async function createNewsPostComment(input: {
    postId: string;
    userSlug: string | null;
    authorName: string;
    authorRole?: string | null;
    avatarUrl?: string | null;
    body: string;
}): Promise<NewsComment | null> {
    try {
        const { data, error } = await supabaseServer
            .from("news_post_comments")
            .insert({
                post_id: input.postId,
                user_slug: input.userSlug,
                author_name: input.authorName,
                author_role: input.authorRole ?? null,
                avatar_url: input.avatarUrl ?? null,
                body: input.body,
            })
            .select(COMMENT_SELECT)
            .single();

        if (error || !data) {
            console.error("[createNewsPostComment]", error);
            return null;
        }

        return normalizeNewsComment(data as Record<string, unknown>);
    } catch (error) {
        console.error("[createNewsPostComment]", error);
        return null;
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
            if (b.cheerCount !== a.cheerCount) return b.cheerCount - a.cheerCount;
            if (b.commentCount !== a.commentCount) return b.commentCount - a.commentCount;
            return new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime();
        })
        .slice(0, Math.max(1, limit));
}
