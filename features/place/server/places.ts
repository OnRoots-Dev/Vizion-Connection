// features/place/server/places.ts
import { supabaseServer } from "@/lib/supabase/server";
import type { CreatePlaceInput, PlaceRecord } from "../place";

const SELECT_COLUMNS = "id,name,prefecture,address,latitude,longitude,precision,place_type,created_by,created_at";

export async function createPlace(actorId: number, input: CreatePlaceInput): Promise<PlaceRecord> {
    const { data, error } = await supabaseServer
        .from("places")
        .insert({
            name: input.name,
            prefecture: input.prefecture,
            address: input.address ?? null,
            latitude: input.latitude,
            longitude: input.longitude,
            precision: input.precision ?? "approximate",
            place_type: input.place_type ?? "facility",
            created_by: actorId,
        })
        .select(SELECT_COLUMNS)
        .single();

    if (error || !data) {
        console.error("[createPlace]", error);
        throw new Error("場所の保存に失敗しました");
    }
    return data as unknown as PlaceRecord;
}

export interface PlaceSearchParams {
    q?: string;
    prefecture?: string;
    min_lat?: number;
    max_lat?: number;
    min_lng?: number;
    max_lng?: number;
    limit?: number;
}

export async function searchPlaces(params: PlaceSearchParams): Promise<PlaceRecord[]> {
    let query = supabaseServer.from("places").select(SELECT_COLUMNS).limit(params.limit ?? 30);

    if (params.q) {
        // ilike はエスケープして部分一致（ワイルドカード注入対策）。
        const escaped = params.q.replace(/[%_\\]/g, "\\$&");
        query = query.ilike("name", `%${escaped}%`);
    }
    if (params.prefecture) query = query.eq("prefecture", params.prefecture);
    if (params.min_lat != null && params.max_lat != null) {
        query = query.gte("latitude", params.min_lat).lte("latitude", params.max_lat);
    }
    if (params.min_lng != null && params.max_lng != null) {
        query = query.gte("longitude", params.min_lng).lte("longitude", params.max_lng);
    }

    const { data, error } = await query.order("name", { ascending: true });
    if (error) {
        console.error("[searchPlaces]", error);
        return [];
    }
    return (data ?? []) as unknown as PlaceRecord[];
}

/** Viz Map の Place POI 表示用。テスト/検証アーティファクトは載せない。 */
const MARKER_TEST_NAME = /検証|VizTest|テスト|TEST/;

export interface MapPlacePoi {
    id: string;
    name: string;
    prefecture: string;
    place_type: PlaceRecord["place_type"];
    precision: PlaceRecord["precision"];
    latitude: number;
    longitude: number;
}

export async function listMapPlacePois(
    bbox: { minLat: number; maxLat: number; minLng: number; maxLng: number },
    options: { limit?: number } = {},
): Promise<MapPlacePoi[]> {
    const limit = Math.min(Math.max(options.limit ?? 60, 1), 200);

    const { data, error } = await supabaseServer
        .from("places")
        .select("id,name,prefecture,place_type,precision,latitude,longitude")
        .gte("latitude", bbox.minLat)
        .lte("latitude", bbox.maxLat)
        .gte("longitude", bbox.minLng)
        .lte("longitude", bbox.maxLng)
        .limit(limit);

    if (error) {
        console.error("[listMapPlacePois]", error);
        return [];
    }

    return ((data ?? []) as unknown as MapPlacePoi[])
        .filter((place) => !MARKER_TEST_NAME.test(place.name))
        .slice(0, limit);
}

export async function getPlaceById(id: string): Promise<PlaceRecord | null> {
    const { data } = await supabaseServer
        .from("places")
        .select(SELECT_COLUMNS)
        .eq("id", id)
        .maybeSingle();
    return (data as unknown as PlaceRecord) ?? null;
}
