import { NextRequest, NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase/server";

type AdRow = {
    id: string;
    headline: string;
    image_url: string | null;
    link_url: string;
    sponsor?: string | null;
    business_id: number | null;
    is_active: boolean;
    status?: string | null;
    sport_category: string | null;
    starts_at: string | null;
    ends_at: string | null;
    position?: number | null;
};

function isActiveNow(row: Pick<AdRow, "starts_at" | "ends_at">, now: Date) {
    const startOk = !row.starts_at || new Date(row.starts_at).getTime() <= now.getTime();
    const endOk = !row.ends_at || new Date(row.ends_at).getTime() >= now.getTime();
    return startOk && endOk;
}

export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url);
    const category = searchParams.get("category")?.trim() ?? "";

    const now = new Date();

    const buildQuery = (selectColumns: string) => {
        const baseQuery = supabaseServer.from("ads").select(selectColumns).eq("is_active", true);
        return category ? baseQuery.or(`sport_category.eq.${category},sport_category.is.null`) : baseQuery;
    };

    let data: unknown[] | null = null;
    let error: { message: string } | null = null;

    {
        const result = await buildQuery(
            "id, headline, image_url, link_url, sponsor, business_id, is_active, status, sport_category, starts_at, ends_at, position",
        );
        data = (result as { data: unknown[] | null }).data ?? null;
        error = (result as { error: { message: string } | null }).error ?? null;
    }

    if (error?.message && (error.message.includes("column ads.sponsor does not exist") || error.message.includes("column ads.position does not exist") || error.message.includes("column ads.status does not exist"))) {
        const result = await buildQuery("id, headline, image_url, link_url, business_id, is_active, sport_category, starts_at, ends_at");
        data = (result as { data: unknown[] | null }).data ?? null;
        error = (result as { error: { message: string } | null }).error ?? null;
    }

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    const rows = ((data ?? []) as AdRow[])
        .filter((row) => isActiveNow(row, now))
        .filter((row) => (row.status ? String(row.status) === "approved" : true));

    const businessIds = Array.from(
        new Set(
            rows
                .map((row) => (typeof row.business_id === "number" ? row.business_id : null))
                .filter((id): id is number => typeof id === "number" && Number.isFinite(id) && id > 0),
        ),
    );

    const businessNameMap = new Map<number, string>();
    if (businessIds.length > 0) {
        const { data: users } = await supabaseServer
            .from("users")
            .select("id, display_name")
            .in("id", businessIds)
            .eq("is_deleted", false);

        for (const user of users ?? []) {
            const id = typeof user.id === "number" ? user.id : Number(user.id ?? 0);
            const name = String((user as { display_name?: unknown }).display_name ?? "").trim();
            if (id && name) businessNameMap.set(id, name);
        }
    }

    const ads = rows
        .map((row) => {
            const sponsorResolved = row.sponsor?.trim() || (row.business_id ? businessNameMap.get(row.business_id) : "") || null;
            return {
                id: String(row.id),
                headline: String(row.headline ?? ""),
                image_url: row.image_url ?? undefined,
                link_url: String(row.link_url ?? ""),
                sponsor: sponsorResolved ?? undefined,
                business_id: row.business_id ?? undefined,
                position: typeof row.position === "number" && Number.isFinite(row.position) ? row.position : 3,
            };
        })
        .filter((ad) => Boolean(ad.link_url))
        .sort((a, b) => (a.position ?? 3) - (b.position ?? 3));

    return NextResponse.json({ ads });
}
