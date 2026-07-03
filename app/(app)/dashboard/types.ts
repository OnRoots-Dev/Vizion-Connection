// ─────────────────────────────────────────────────────────────────────────────
// dashboard/types.ts  — 全ビューで共有する型・定数
// ─────────────────────────────────────────────────────────────────────────────

export type Theme = "dark" | "dim" | "light";

export type DashboardView =
    | "home"
    | "contact"
    | "notifications"
    | "hub"
    | "offers"
    | "admin_posts"
    | "admin_ads"
    | "collections"
    | "journey"
    | "timeline"
    | "portfolio"
    | "card"
    | "profile"
    | "schedule"
    | "news"
    | "voicelab"
    | "referral"
    | "career"
    | "discovery"
    | "roadmap"
    | "cheer"
    | "cheer_graph"
    | "business"
    | "edit"
    | "settings"
    | "action_history"
    | "missions"
    | "checkout";

export interface ThemeColors {
    bg: string;
    surface: string;
    border: string;
    text: string;
    sub: string;
}

export const THEME_MAP: Record<Theme, ThemeColors> = {
    // dark は globals.css の --vc-* トークンと同値（lib/design/tokens.ts 参照）
    dark: { bg: "#09090f", surface: "#111118", border: "rgba(255,255,255,0.08)", text: "#f0f0f5", sub: "rgba(255,255,255,0.62)" },
    dim: { bg: "#13131A", surface: "rgba(255,255,255,0.05)", border: "rgba(255,255,255,0.12)", text: "#F7F7FC", sub: "rgba(255,255,255,0.72)" },
    light: { bg: "#F5F5F7", surface: "rgba(255,255,255,0.82)", border: "rgba(17,17,17,0.12)", text: "#111111", sub: "rgba(17,17,17,0.68)" },
};

export const ROLE_COLOR: Record<string, string> = {
    Athlete: "#FF5050",
    Trainer: "#32D278",
    Crew: "#FFC81E",
    Business: "#3C8CFF",
};
