import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { supabaseServer } from "@/lib/supabase/server";
import { requireAdminProfile } from "@/lib/auth/require-admin-session";

const createSchema = z.object({
    title: z.string().trim().min(1).max(200),
    category: z.enum(["interview", "news", "announcement", "sports", "event"]),
    body: z.string().trim().min(1),
    publishedAt: z.string().trim().min(1),
    isPublished: z.boolean().optional(),
    galleryImageUrl: z.string().trim().url().optional(),
}).strict();

export async function GET() {
    try {
        await requireAdminProfile();

        const { data, error } = await supabaseServer
            .from("news_posts")
            .select("id, title, category, body, author, published_at, is_published, gallery_image_urls, created_at")
            .order("published_at", { ascending: false });

        if (error) {
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json({ posts: data ?? [] });
    } catch (error) {
        const message = error instanceof Error ? error.message : "UNKNOWN";
        const status = message === "UNAUTHORIZED" ? 401 : message === "FORBIDDEN" ? 403 : 500;
        return NextResponse.json({ error: status === 500 ? "Server error" : message }, { status });
    }
}

export async function POST(req: NextRequest) {
    try {
        await requireAdminProfile();

        const parsed = createSchema.safeParse(await req.json());
        if (!parsed.success) {
            return NextResponse.json({ error: "入力内容が不正です" }, { status: 400 });
        }

        const galleryUrls = parsed.data.galleryImageUrl ? [parsed.data.galleryImageUrl] : [];
        const { data, error } = await supabaseServer
            .from("news_posts")
            .insert({
                title: parsed.data.title,
                category: parsed.data.category,
                body: parsed.data.body,
                author: "運営",
                author_role: "運営",
                published_at: parsed.data.publishedAt,
                is_published: Boolean(parsed.data.isPublished),
                gallery_image_urls: galleryUrls,
            })
            .select("id, title, category, body, author, published_at, is_published, gallery_image_urls, created_at")
            .single();

        if (error || !data) {
            return NextResponse.json({ error: error?.message ?? "Failed" }, { status: 500 });
        }

        return NextResponse.json({ post: data });
    } catch (error) {
        const message = error instanceof Error ? error.message : "UNKNOWN";
        const status = message === "UNAUTHORIZED" ? 401 : message === "FORBIDDEN" ? 403 : 500;
        return NextResponse.json({ error: status === 500 ? "Server error" : message }, { status });
    }
}
