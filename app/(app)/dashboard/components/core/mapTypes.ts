// dashboard/components/core/mapTypes.ts — MapCanvas 共有型（SSR安全）
import { COLOR } from "@/lib/design/tokens";

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
    | "event"
    | "place";

// 1カテゴリ1カラー。Business は専用カラー（Moment blue とは分離）。
// Activity / Camp はデザイントークン。その他は色覚セーフな識別色を維持する。
// このファイルがMap PinカラーのSingle Source of Truth（変更箇所はここだけ）。
export const PIN_COLOR: Record<PinCategory, string> = {
    activity: COLOR.accent, // 円形+アイコン（Activity）
    moment: "#0072B2",
    athlete: "#E69F00",
    trainer: "#009E73",
    crew: "#CC79A7",
    business: "#00BFA5",
    event: "#6366F1",
    place: COLOR.gold, // Camp（別形状）。既存 Place POI を拠点ピンとして描く
};

// クラスター（複数Pointを集約したマーカー）専用色。
export const CLUSTER_COLOR = COLOR.bg;

export const PIN_COLOR_LABEL: Record<PinCategory, string> = {
    activity: "Activity",
    moment: "Moment",
    athlete: "Athlete",
    trainer: "Trainer",
    crew: "Crew",
    business: "Business",
    event: "Event",
    place: "Camp",
};
