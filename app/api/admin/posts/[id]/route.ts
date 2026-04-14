import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { supabaseServer } from "@/lib/supabase/server";
import { requireAdminProfile } from "@/lib/auth/require-admin-session";

const updateSchema = z
    .object({
        title: z.string().trim().min(1).max(200).optional(),
        category: z.enum(["interview", "news", "announcement", "sports", "event"]).optional(),
        body: z.string().trim().min(1).optional(),
        publishedAt: z.string().trim().min(1).optional(),
        isPublished: z.boolean().optional(),
        galleryImageUrl: z.string().trim().url().nullable().optional(),
    })
    .strict();

export async function GET(_req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
    try {
        await requireAdminProfile();
        const { id } = await ctx.params;

        const { data, error } = await supabaseServer
            .from("news_posts")
            .select("id, title, category, body, author, published_at, is_published, gallery_image_urls, created_at")
            .eq("id", id)
            .maybeSingle();

        if (error) {
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        if (!data) {
            return NextResponse.json({ error: "Not found" }, { status: 404 });
        }

        return NextResponse.json({ post: data });
    } catch (error) {
        const message = error instanceof Error ? error.message : "UNKNOWN";
        const status = message === "UNAUTHORIZED" ? 401 : message === "FORBIDDEN" ? 403 : 500;
        return NextResponse.json({ error: status === 500 ? "Server error" : message }, { status });
    }
}

export async function PATCH(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
    try {
        await requireAdminProfile();
        const { id } = await ctx.params;

        const parsed = updateSchema.safeParse(await req.json());
        if (!parsed.success) {
            return NextResponse.json({ error: "入力内容が不正です" }, { status: 400 });
        }

        const patch: Record<string, unknown> = {};
        if (parsed.data.title !== undefined) patch.title = parsed.data.title;
        if (parsed.data.category !== undefined) patch.category = parsed.data.category;
        if (parsed.data.body !== undefined) patch.body = parsed.data.body;
        if (parsed.data.publishedAt !== undefined) patch.published_at = parsed.data.publishedAt;
        if (parsed.data.isPublished !== undefined) patch.is_published = parsed.data.isPublished;
        if (parsed.data.galleryImageUrl !== undefined) {
            patch.gallery_image_urls = parsed.data.galleryImageUrl ? [parsed.data.galleryImageUrl] : [];
        }

        const { data, error } = await supabaseServer
            .from("news_posts")
            .update(patch)
            .eq("id", id)
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

export async function DELETE(_req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
    try {
        await requireAdminProfile();
        const { id } = await ctx.params;

        const { error } = await supabaseServer.from("news_posts").delete().eq("id", id);
        if (error) {
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        const message = error instanceof Error ? error.message : "UNKNOWN";
        const status = message === "UNAUTHORIZED" ? 401 : message === "FORBIDDEN" ? 403 : 500;
        return NextResponse.json({ error: status === 500 ? "Server error" : message }, { status });
    }
}
