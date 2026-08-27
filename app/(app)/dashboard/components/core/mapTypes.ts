// dashboard/components/core/mapTypes.ts — MapCanvas 共有型（SSR安全）
export interface MapBBox {
    minLat: number;
    maxLat: number;
    minLng: number;
    maxLng: number;
}

// ── Pin カテゴリ（Filter と Pin の視覚ルールを統一） ──────────────────────────
export type PinCategory =
    | "activity"
    | "moment"
    | "athlete"
    | "trainer"
    | "crew"
    | "business"
    | "event";

// 1カテゴリ1カラー。Business は専用カラー（Moment blue とは分離）。
export const PIN_COLOR: Record<PinCategory, string> = {
    activity: "#A78BFA",
    moment: "#3C8CFF",
    athlete: "#FF5050",
    trainer: "#30DE1D",
    crew: "#FFC81E",
    business: "#00BFA5",
    event: "#FF8C00",
};

export const PIN_COLOR_LABEL: Record<PinCategory, string> = {
    activity: "Activity",
    moment: "Moment",
    athlete: "Athlete",
    trainer: "Trainer",
    crew: "Crew",
    business: "Business",
    event: "Event",
};
