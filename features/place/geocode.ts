// features/place/geocode.ts
// Mapbox Geocoding v6 による住所→座標の補助。
// PlacePicker（Activity場所）と Business 店舗登録（LocationGeocoder）で共有する。
// 参考: dashboard/components/core/PlacePicker.tsx の既存実装を抽出したもの。

import { PREFECTURES_BY_REGION } from "@/lib/discovery-filters";

export const ALL_PREFECTURES: readonly string[] = Object.values(PREFECTURES_BY_REGION).flat();

export interface GeocodeSuggestion {
  name: string;
  address: string;
  latitude: number;
  longitude: number;
  prefecture: string | null;
}

/** Mapbox Geocoding API v6 のレスポンスから必要な形へ絞り込む */
export function toSuggestion(feature: unknown): GeocodeSuggestion | null {
  const f = feature as {
    properties?: {
      name?: string;
      full_address?: string;
      coordinates?: { longitude?: number; latitude?: number };
      context?: { region?: { name?: string } };
    };
  } | null;
  const coords = f?.properties?.coordinates;
  if (!f?.properties || !coords || typeof coords.latitude !== "number" || typeof coords.longitude !== "number") return null;
  return {
    name: f.properties.name ?? f.properties.full_address ?? "",
    address: f.properties.full_address ?? f.properties.name ?? "",
    latitude: coords.latitude,
    longitude: coords.longitude,
    prefecture: matchPrefecture(f.properties.context?.region?.name ?? null),
  };
}

/** Geocodingのregion名（"東京都" / "Tōkyō" 等）をアプリの都道府県リストに合わせる */
export function matchPrefecture(regionName: string | null): string | null {
  if (!regionName) return null;
  const normalized = regionName.trim();
  return ALL_PREFECTURES.find((pref) => normalized.startsWith(pref.slice(0, 2))) ?? null;
}

/**
 * 住所からGeocoding候補（最大limit件・日本国内）を取得する。
 * @param signal AbortController（入力デバウンス時の中断用）
 */
export async function geocodeByAddress(
  query: string,
  signal?: AbortSignal,
  limit = 3,
): Promise<GeocodeSuggestion[]> {
  const token = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;
  if (!token || query.trim().length < 3) return [];
  const params = new URLSearchParams({
    q: query.trim(),
    access_token: token,
    limit: String(limit),
    language: "ja",
    country: "JP",
  });
  const res = await fetch(`https://api.mapbox.com/search/geocode/v6/forward?${params}`, { signal });
  if (!res.ok) throw new Error("geocode failed");
  const data = (await res.json()) as { features?: unknown[] };
  return (data.features ?? []).map(toSuggestion).filter((s): s is GeocodeSuggestion => s !== null);
}
