import { NextRequest, NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase/server";
import { requireAdminProfile } from "@/lib/auth/require-admin-session";

export async function POST(_req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
    try {
        await requireAdminProfile();
        const { id } = await ctx.params;

        const { data: post, error: postError } = await supabaseServer
            .from("news_posts")
            .select("id, title")
            .eq("id", id)
            .maybeSingle();

        if (postError) {
            return NextResponse.json({ error: postError.message }, { status: 500 });
        }
        if (!post) {
            return NextResponse.json({ error: "Not found" }, { status: 404 });
        }

        const { data: users, error: userError } = await supabaseServer.from("users").select("slug").eq("is_deleted", false);
        if (userError) {
            return NextResponse.json({ error: userError.message }, { status: 500 });
        }

        const rows = (users ?? [])
            .map((u) => String((u as { slug?: unknown }).slug ?? "").trim())
            .filter(Boolean)
            .map((slug) => ({
                recipient_slug: slug,
                actor_slug: null,
                type: "news",
                title: String(post.title ?? ""),
                body: "運営からのお知らせが届きました",
                link_url: "/dashboard?view=news",
                payload: {},
            }));

        if (rows.length === 0) {
            return NextResponse.json({ success: true, inserted: 0 });
        }

        const { error: insertError } = await supabaseServer.from("notifications").insert(rows);
        if (insertError) {
            return NextResponse.json({ error: insertError.message }, { status: 500 });
        }

        return NextResponse.json({ success: true, inserted: rows.length });
    } catch (error) {
        const message = error instanceof Error ? error.message : "UNKNOWN";
        const status = message === "UNAUTHORIZED" ? 401 : message === "FORBIDDEN" ? 403 : 500;
        return NextResponse.json({ error: status === 500 ? "Server error" : message }, { status });
    }
}
