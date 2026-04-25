import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { supabaseServer } from "@/lib/supabase/server";
import { requireAdminProfile } from "@/lib/auth/require-admin-session";

function toJapaneseDbError(message: string) {
    const match = message.match(/column\s+ads\.([a-zA-Z0-9_]+)\s+does\s+not\s+exist/i);
    if (match?.[1]) {
        return `adsテーブルに「${match[1]}」列が存在しません。データベースのマイグレーションを適用してください。`;
    }
    return message;
}

const patchSchema = z
    .object({
        status: z.enum(["pending", "approved", "rejected"]).optional(),
        isActive: z.boolean().optional(),
        position: z.number().int().min(1).max(99).optional(),
    })
    .strict();

export async function PATCH(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
    try {
        await requireAdminProfile();
        const { id } = await ctx.params;

        const parsed = patchSchema.safeParse(await req.json());
        if (!parsed.success) {
            return NextResponse.json({ error: "入力内容が不正です" }, { status: 400 });
        }

        const patch: Record<string, unknown> = {};
        if (parsed.data.status !== undefined) patch.status = parsed.data.status;
        if (parsed.data.isActive !== undefined) patch.is_active = parsed.data.isActive;
        if (parsed.data.position !== undefined) patch.position = parsed.data.position;

        if (Object.keys(patch).length === 0) {
            return NextResponse.json({ error: "No changes" }, { status: 400 });
        }

        if (parsed.data.status === "approved") {
            patch.reviewed_at = new Date().toISOString();
            patch.reviewed_by = "admin";
        }
        if (parsed.data.status === "rejected") {
            patch.reviewed_at = new Date().toISOString();
            patch.reviewed_by = "admin";
            patch.is_active = false;
        }

        const updateBase = supabaseServer
            .from("ads")
            .update(patch)
            .eq("id", id);

        let data: unknown = null;
        let updateError: { message: string } | null = null;

        {
            const result = await updateBase
                .select("id, business_id, headline, body_text, image_url, link_url, is_active, status, ad_scope, region, prefecture, sport_category, starts_at, ends_at, created_at, position")
                .single();
            data = (result as { data: unknown }).data ?? null;
            updateError = (result as { error: { message: string } | null }).error ?? null;
        }

        if (updateError?.message && (updateError.message.includes("column ads.ad_scope does not exist") || updateError.message.includes("column ads.status does not exist") || updateError.message.includes("column ads.position does not exist"))) {
            const result = await updateBase
                .select("id, business_id, headline, body_text, image_url, link_url, is_active, region, prefecture, sport_category, starts_at, ends_at, created_at")
                .single();
            data = (result as { data: unknown }).data ?? null;
            updateError = (result as { error: { message: string } | null }).error ?? null;
        }

        if (updateError?.message && updateError.message.includes("column ads.prefecture does not exist")) {
            const result = await updateBase
                .select("id, business_id, headline, body_text, image_url, link_url, is_active, region, sport_category, starts_at, ends_at, created_at")
                .single();
            data = (result as { data: unknown }).data ?? null;
            updateError = (result as { error: { message: string } | null }).error ?? null;
        }

        if (updateError || !data) {
            return NextResponse.json({ error: toJapaneseDbError(updateError?.message ?? "Failed") }, { status: 500 });
        }

        return NextResponse.json({ ad: data });
    } catch (error) {
        const message = error instanceof Error ? error.message : "UNKNOWN";
        const status = message === "UNAUTHORIZED" ? 401 : message === "FORBIDDEN" ? 403 : 500;
        return NextResponse.json({ error: status === 500 ? "Server error" : message }, { status });
    }
}
