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
// 色覚多様性（Okabe-Ito系・色覚セーフ配色）・軽量Map背景上のコントラスト・
// ブランド調和を考慮し、隣接カテゴリどうしが似ないように配置。
// このファイルがMap PinカラーのSingle Source of Truth（変更箇所はここだけ）。
export const PIN_COLOR: Record<PinCategory, string> = {
    activity: "#D55E00", // vermillion（Activity汎用）
    moment: "#0072B2",   // blue（Moment）
    athlete: "#E69F00",  // amber（Athlete）
    trainer: "#009E73",  // green（Trainer）
    crew: "#CC79A7",     // magenta（Crew）
    business: "#00BFA5", // teal/cyan（Business）
    event: "#6366F1",    // indigo（Event）※ユーザー指定の6種には含まれない補助色
};

// クラスター（複数Pointを集約したマーカー）専用色。
// Activity/Moment/Roleの各Pinカラーと混同しないよう、ニュートラルな深スレートにし、
// 「ここに複数の情報が集まっている」集約マーカーとして明確に区別する。
export const CLUSTER_COLOR = "#0F172A";

export const PIN_COLOR_LABEL: Record<PinCategory, string> = {
    activity: "Activity",
    moment: "Moment",
    athlete: "Athlete",
    trainer: "Trainer",
    crew: "Crew",
    business: "Business",
    event: "Event",
};
