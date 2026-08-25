// features/place/types.ts + validation を1モジュールに集約（小さな参照マスタのため）。
import { z } from "zod";

export const PLACE_TYPES = [
    "facility",
    "park",
    "school",
    "stadium",
    "gym",
    "outdoor",
    "other",
] as const;
export type PlaceType = (typeof PLACE_TYPES)[number];

export interface PlaceRecord {
    id: string;
    name: string;
    prefecture: string;
    address: string | null;
    latitude: number;
    longitude: number;
    precision: "exact" | "approximate";
    place_type: PlaceType;
    created_by: number | null;
    created_at: string;
}

export const placeCreateSchema = z
    .object({
        name: z.string().trim().min(1, "場所名を入力してください").max(80, "80文字以内で入力してください"),
        prefecture: z.string().trim().min(1, "都道府県を選択してください").max(10),
        address: z.string().trim().max(200, "200文字以内で入力してください").nullable().optional(),
        latitude: z.number().min(-90).max(90),
        longitude: z.number().min(-180).max(180),
        precision: z.enum(["exact", "approximate"]).optional(),
        place_type: z.enum(PLACE_TYPES).optional(),
    })
    .strict();

export type CreatePlaceInput = z.infer<typeof placeCreateSchema>;

export const placeSearchSchema = z
    .object({
        q: z.string().trim().max(60).optional(),
        prefecture: z.string().trim().max(10).optional(),
        min_lat: z.number().min(-90).max(90).optional(),
        max_lat: z.number().min(-90).max(90).optional(),
        min_lng: z.number().min(-180).max(180).optional(),
        max_lng: z.number().min(-180).max(180).optional(),
        limit: z.coerce.number().int().min(1).max(100).optional(),
    })
    .strict();
