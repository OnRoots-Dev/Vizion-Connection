import { z } from "zod";
import { NextRequest, NextResponse } from "next/server";
import { getSupabaseProfile } from "@/lib/auth/session";
import { supabaseServer } from "@/lib/supabase/server";
import { validateCSRF } from "@/lib/security/csrf";
import { createNotification } from "@/lib/supabase/notifications";
import { bondLimiter, getIp } from "@/lib/ratelimit";

const postSchema = z.object({
    target_slug: z.string().min(1),
});

export async function POST(req: NextRequest) {
    const csrfError = validateCSRF(req);
    if (csrfError) return csrfError as unknown as NextResponse;

    const user = await getSupabaseProfile();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { success } = await bondLimiter.limit(getIp(req));
    if (!success) return NextResponse.json({ error: "しばらく時間をおいてから再度お試しください" }, { status: 429 });

    let rawBody: unknown;
    try {
        rawBody = await req.json();
    } catch {
        return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
    }

    const parsed = postSchema.safeParse(rawBody);
    if (!parsed.success) {
        return NextResponse.json({ error: "target_slug is required" }, { status: 400 });
    }

    const { target_slug } = parsed.data;

    if (target_slug === user.slug) {
        return NextResponse.json({ error: "自分自身をBondすることはできません" }, { status: 400 });
    }

    const { data: existing } = await supabaseServer
        .from("user_follows")
        .select("id")
        .eq("follower_slug", user.slug)
        .eq("target_slug", target_slug)
        .maybeSingle();

    if (existing) {
        return NextResponse.json({ error: "既にBond済みです" }, { status: 409 });
    }

    const { error: insertError } = await supabaseServer
        .from("user_follows")
        .insert({ follower_slug: user.slug, target_slug });

    if (insertError) {
        console.error("[bond/POST] insert error:", insertError);
        return NextResponse.json({ error: "Bondに失敗しました" }, { status: 500 });
    }

    // 通知送信（失敗してもエラーにしない）
    await createNotification({
        recipientSlug: target_slug,
        actorSlug: user.slug,
        type: "bond",
        title: "Bondされました",
        body: `${user.displayName}さんが観客席に入りました`,
        linkUrl: `/u/${user.slug}`,
    });

    return NextResponse.json({ following: true }, { status: 201 });
}

export async function DELETE(req: NextRequest) {
    const csrfError = validateCSRF(req);
    if (csrfError) return csrfError as unknown as NextResponse;

    const user = await getSupabaseProfile();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { success } = await bondLimiter.limit(getIp(req));
    if (!success) return NextResponse.json({ error: "しばらく時間をおいてから再度お試しください" }, { status: 429 });

    const { searchParams } = new URL(req.url);
    const target_slug = searchParams.get("target_slug");
    if (!target_slug) return NextResponse.json({ error: "target_slug is required" }, { status: 400 });

    const { error } = await supabaseServer
        .from("user_follows")
        .delete()
        .eq("follower_slug", user.slug)
        .eq("target_slug", target_slug);

    if (error) {
        console.error("[bond/DELETE] error:", error);
        return NextResponse.json({ error: "Bond解除に失敗しました" }, { status: 500 });
    }

    return NextResponse.json({ following: false });
}

export async function GET(req: NextRequest) {
    const user = await getSupabaseProfile();
    if (!user) return NextResponse.json({ following: false });

    const { searchParams } = new URL(req.url);
    const target_slug = searchParams.get("target_slug");
    if (!target_slug) return NextResponse.json({ error: "target_slug is required" }, { status: 400 });

    const { data } = await supabaseServer
        .from("user_follows")
        .select("id")
        .eq("follower_slug", user.slug)
        .eq("target_slug", target_slug)
        .maybeSingle();

    return NextResponse.json({ following: Boolean(data) });
}
