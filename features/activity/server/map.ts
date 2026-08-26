// features/activity/server/map.ts
// Viz Map 用の公開 Activity 取得（bbox 検索）。
// private / connections は決して返さない。所有者プロフィールが非公開・削除済みのものも除外。
import { supabaseServer } from "@/lib/supabase/server";

export interface MapActivityItem {
    id: string;
    type: string;
    title: string | null;
    description: string | null;
    starts_at: string;
    status: string;
    user_id: number;
    author_slug: string | null;
    author_name: string | null;
    place: {
        id: string;
        name: string;
        prefecture: string;
        latitude: number;
        longitude: number;
        precision: "exact" | "approximate";
        place_type: string;
    };
}

export interface BBox {
    minLat: number;
    maxLat: number;
    minLng: number;
    maxLng: number;
}

export async function listPublicMapActivities(
    bbox: BBox,
    options: { limit?: number; sinceHours?: number } = {},
): Promise<MapActivityItem[]> {
    const limit = Math.min(Math.max(options.limit ?? 200, 1), 500);
    const since = new Date(Date.now() - (options.sinceHours ?? 24 * 14) * 3600 * 1000).toISOString();

    const { data, error } = await supabaseServer
        .from("activities")
        .select(
            `id,type,title,description,starts_at,status,place_id,user_id,
             place:places!inner(id,name,prefecture,latitude,longitude,precision,place_type),
             owner:users!inner(slug,display_name,is_public,is_deleted)`,
        )
        .eq("visibility", "public")
        .eq("status", "planned") // 完了・中止はMapに載せない（段階的取得）
        .gte("starts_at", since)
        .gte("places.latitude", bbox.minLat)
        .lte("places.latitude", bbox.maxLat)
        .gte("places.longitude", bbox.minLng)
        .lte("places.longitude", bbox.maxLng)
        .limit(limit);

    if (error) {
        console.error("[listPublicMapActivities]", error);
        return [];
    }

    type Row = {
        id: string;
        type: string;
        title: string | null;
        description: string | null;
        starts_at: string;
        status: string;
        user_id: number;
        place_id: string | null;
        place: MapActivityItem["place"] | null;
        owner: { slug: string; display_name: string | null; is_public: boolean; is_deleted: boolean } | null;
    };

    return ((data ?? []) as unknown as Row[])
        .filter((row) => row.place && row.owner && row.owner.is_public && !row.owner.is_deleted)
        .map((row) => ({
            id: row.id,
            type: row.type,
            title: row.title,
            description: row.description,
            starts_at: row.starts_at,
            status: row.status,
            user_id: row.user_id,
            author_slug: row.owner!.slug,
            author_name: row.owner!.display_name,
            place: row.place as NonNullable<Row["place"]>,
        }));
}
