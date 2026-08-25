// dashboard/components/core/mapTypes.ts — MapCanvas 共有型（SSR安全）
export interface MapBBox {
    minLat: number;
    maxLat: number;
    minLng: number;
    maxLng: number;
}
