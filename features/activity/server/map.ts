// features/activity/server/map.ts
// Viz Map 用の公開 Activity 取得（bbox 検索）。
// private / connections は決して返さない。所有者プロフィールが非公開・削除済みのものも除外。
import { supabaseServer } from "@/lib/supabase/server";
import { prefectureCenter } from "@/features/place/prefecture-centers";

export interface MapActivityItem {
    id: string;
    type: string;
    title: string | null;
    description: string | null;
    tags: string[];
    starts_at: string;
    status: string;
    user_id: number;
    author_slug: string | null;
    author_name: string | null;
    author_role: "Athlete" | "Trainer" | "Crew" | "Business" | "Admin" | null;
    author_avatar_url: string | null;
    author_sponsor_plan: "roots" | "signal" | "presence" | "legacy" | null;
    /** Activity / 親Activityから位置を引き継いだ公開Moment / 直近アクティブな公開ユーザー。 */
    entity_type: "activity" | "moment" | "person";
    image_url?: string | null;
    comment_count?: number;
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
    options: { limit?: number } = {},
): Promise<MapActivityItem[]> {
    const limit = Math.min(Math.max(options.limit ?? 200, 1), 500);
    // コールドスタート対策（M2）：時間軸表示範囲を「直近24時間に完了」+
    // 「今後48時間に予定」に拡張する。見込時間で絞るため行数は自己制限される
    // （未完了の古い status=planned や古い completed は自然に除外される）。
    const now = Date.now();
    const windowStart = new Date(now - 24 * 3600 * 1000).toISOString();
    const windowEnd = new Date(now + 48 * 3600 * 1000).toISOString();

    const { data, error } = await supabaseServer
        .from("activities")
        .select(
            `id,type,title,description,tags,starts_at,created_at,status,place_id,user_id,
             place:places!inner(id,name,prefecture,latitude,longitude,precision,place_type),
             owner:users!inner(slug,display_name,avatar_url,role,sponsor_plan,is_public,is_deleted)`,
        )
        .eq("visibility", "public")
        .in("status", ["planned", "completed"]) // 中止はMapに載せない
        .gte("starts_at", windowStart)
        .lte("starts_at", windowEnd)
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
        tags: string[] | null;
        starts_at: string;
        created_at: string;
        status: string;
        user_id: number;
        place_id: string | null;
        place: MapActivityItem["place"] | null;
        owner: { slug: string; display_name: string | null; avatar_url: string | null; role: MapActivityItem["author_role"]; sponsor_plan: MapActivityItem["author_sponsor_plan"]; is_public: boolean; is_deleted: boolean } | null;
    };

    return ((data ?? []) as unknown as Row[])
        .filter((row) => row.place && row.owner && row.owner.is_public && !row.owner.is_deleted)
        .map((row) => ({
            id: row.id,
            type: row.type,
            title: row.title,
            description: row.description,
            tags: row.tags ?? [],
            starts_at: row.starts_at,
            status: row.status,
            user_id: row.user_id,
            author_slug: row.owner!.slug,
            author_name: row.owner!.display_name,
            author_role: row.owner!.role,
            author_avatar_url: row.owner!.avatar_url,
            author_sponsor_plan: row.owner!.sponsor_plan,
            entity_type: "activity",
            place: row.place as NonNullable<Row["place"]>,
        }));
}

/** Public Moments inherit the location of their public parent Activity. */
export async function listPublicMapMoments(activityItems: MapActivityItem[], limit = 200): Promise<MapActivityItem[]> {
    const activityIds = activityItems.map((item) => item.id);
    if (activityIds.length === 0) return [];

    const byActivity = new Map(activityItems.map((item) => [item.id, item]));
    const { data, error } = await supabaseServer
        .from("moments")
        .select("id,activity_id,body,image_url,comment_count,created_at,user_id,owner:users!inner(slug,display_name,avatar_url,role,sponsor_plan,is_public,is_deleted)")
        .eq("visibility", "public")
        .in("activity_id", activityIds)
        .order("created_at", { ascending: false })
        .limit(Math.min(Math.max(limit, 1), 500));

    if (error) {
        console.error("[listPublicMapMoments]", error);
        return [];
    }

    type Row = {
        id: string; activity_id: string; body: string; image_url: string | null; comment_count: number; created_at: string; user_id: number;
        owner: { slug: string; display_name: string | null; avatar_url: string | null; role: MapActivityItem["author_role"]; sponsor_plan: MapActivityItem["author_sponsor_plan"]; is_public: boolean; is_deleted: boolean } | null;
    };
    return ((data ?? []) as unknown as Row[]).flatMap((row) => {
        const activity = byActivity.get(row.activity_id);
        if (!activity || !row.owner || !row.owner.is_public || row.owner.is_deleted) return [];
        return [{
            ...activity,
            id: row.id,
            type: "moment",
            title: row.body.trim().slice(0, 72) || "Moment",
            description: row.body,
            starts_at: row.created_at,
            user_id: row.user_id,
            author_slug: row.owner.slug,
            author_name: row.owner.display_name,
            author_role: row.owner.role,
            author_avatar_url: row.owner.avatar_url,
            author_sponsor_plan: row.owner.sponsor_plan,
            entity_type: "moment" as const,
            image_url: row.image_url,
            comment_count: row.comment_count,
        }];
    });
}

/**
 * 直近アクティブ（ログイン/活動実績）な公開ユーザーのプロフィールPin。
 * users は座標を持たないため、公開 `prefecture` の県庁所在地座標に近似配置する
 * （precision: "approximate"）。Activity が0件のエリアでも地図を寂しくしない。
 */
export async function listRecentPublicPeople(
    bbox: BBox,
    options: { limit?: number; days?: number } = {},
): Promise<MapActivityItem[]> {
    const limit = Math.min(Math.max(options.limit ?? 80, 1), 150);
    const days = options.days ?? 30;
    const since = new Date(Date.now() - days * 24 * 3600 * 1000).toISOString();

    const { data, error } = await supabaseServer
        .from("users")
        .select("id,slug,display_name,avatar_url,role,sponsor_plan,is_public,is_deleted,prefecture,last_login_at")
        .in("role", ["Athlete", "Trainer", "Crew"])
        .eq("is_public", true)
        .eq("is_deleted", false)
        .not("prefecture", "is", null)
        .gte("last_login_at", since)
        .order("last_login_at", { ascending: false })
        .limit(limit);

    if (error) {
        console.error("[listRecentPublicPeople]", error);
        return [];
    }

    type Row = {
        id: number;
        slug: string;
        display_name: string | null;
        avatar_url: string | null;
        role: MapActivityItem["author_role"];
        sponsor_plan: MapActivityItem["author_sponsor_plan"];
        is_public: boolean;
        is_deleted: boolean;
        prefecture: string | null;
        last_login_at: string | null;
    };

    const now = new Date().toISOString();
    const items: MapActivityItem[] = [];
    for (const row of (data ?? []) as unknown as Row[]) {
        const center = prefectureCenter(row.prefecture);
        if (!center) continue;
        if (center[1] < bbox.minLat || center[1] > bbox.maxLat || center[0] < bbox.minLng || center[0] > bbox.maxLng) continue;
        items.push({
            id: `recent-person:${row.id}`,
            type: row.role ?? "Athlete",
            title: null,
            description: null,
            tags: [],
            starts_at: row.last_login_at ?? now,
            status: "planned",
            user_id: row.id,
            author_slug: row.slug,
            author_name: row.display_name,
            author_role: row.role,
            author_avatar_url: row.avatar_url,
            author_sponsor_plan: row.sponsor_plan,
            entity_type: "person",
            place: {
                id: `pref:${row.prefecture!}`,
                name: row.prefecture!,
                prefecture: row.prefecture!,
                latitude: center[1],
                longitude: center[0],
                precision: "approximate",
                place_type: "other",
            },
        });
        if (items.length >= limit) break;
    }
    return items;
}
