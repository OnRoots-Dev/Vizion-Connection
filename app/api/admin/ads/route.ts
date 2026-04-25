import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase/server";
import { requireAdminProfile } from "@/lib/auth/require-admin-session";

function toJapaneseDbError(message: string) {
    const match = message.match(/column\s+ads\.([a-zA-Z0-9_]+)\s+does\s+not\s+exist/i);
    if (match?.[1]) {
        return `adsテーブルに「${match[1]}」列が存在しません。データベースのマイグレーションを適用してください。`;
    }
    return message;
}

export async function GET() {
    try {
        await requireAdminProfile();

        const query = async (selectColumns: string) =>
            supabaseServer
                .from("ads")
                .select(selectColumns)
                .order("created_at", { ascending: false });

        let data: unknown[] | null = null;
        let error: { message: string } | null = null;

        {
            const result = await query(
                "id, business_id, headline, body_text, image_url, link_url, is_active, status, ad_scope, region, prefecture, sport_category, starts_at, ends_at, created_at, position",
            );
            data = (result as { data: unknown[] | null }).data ?? null;
            error = (result as { error: { message: string } | null }).error ?? null;
        }

        if (error?.message && (error.message.includes("column ads.ad_scope does not exist") || error.message.includes("column ads.status does not exist") || error.message.includes("column ads.position does not exist"))) {
            const result = await query(
                "id, business_id, headline, body_text, image_url, link_url, is_active, region, prefecture, sport_category, starts_at, ends_at, created_at",
            );
            data = (result as { data: unknown[] | null }).data ?? null;
            error = (result as { error: { message: string } | null }).error ?? null;
        }

        if (error?.message && error.message.includes("column ads.prefecture does not exist")) {
            const result = await query(
                "id, business_id, headline, body_text, image_url, link_url, is_active, region, sport_category, starts_at, ends_at, created_at",
            );
            data = (result as { data: unknown[] | null }).data ?? null;
            error = (result as { error: { message: string } | null }).error ?? null;
        }

        if (error) {
            return NextResponse.json({ error: toJapaneseDbError(error.message) }, { status: 500 });
        }

        return NextResponse.json({ ads: data ?? [] });
    } catch (error) {
        const message = error instanceof Error ? error.message : "UNKNOWN";
        const status = message === "UNAUTHORIZED" ? 401 : message === "FORBIDDEN" ? 403 : 500;
        return NextResponse.json({ error: status === 500 ? "Server error" : message }, { status });
    }
}
