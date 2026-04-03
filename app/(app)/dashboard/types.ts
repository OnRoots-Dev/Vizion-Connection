// ─────────────────────────────────────────────────────────────────────────────
// dashboard/types.ts  — 全ビューで共有する型・定数
// ─────────────────────────────────────────────────────────────────────────────

export type Theme = "dark" | "dim" | "light";

export type DashboardView =
    | "home"
    | "notifications"
    | "card"
    | "profile"
    | "news"
    | "voicelab"
    | "referral"
    | "career"
    | "discovery"
    | "roadmap"
    | "cheer"
    | "business"
    | "edit"
    | "settings"
    | "missions";

export interface ThemeColors {
    bg: string;
    surface: string;
    border: string;
    text: string;
    sub: string;
}

export const THEME_MAP: Record<Theme, ThemeColors> = {
    dark: { bg: "#0B0B0F", surface: "rgba(255,255,255,0.03)", border: "rgba(255,255,255,0.07)", text: "#FFFFFF", sub: "rgba(255,255,255,0.45)" },
    dim: { bg: "#13131A", surface: "rgba(255,255,255,0.04)", border: "rgba(255,255,255,0.09)", text: "#F0F0F8", sub: "rgba(255,255,255,0.5)" },
    light: { bg: "#F5F5F7", surface: "rgba(0,0,0,0.03)", border: "rgba(0,0,0,0.08)", text: "#111111", sub: "rgba(0,0,0,0.45)" },
};

export const ROLE_COLOR: Record<string, string> = {
    Athlete: "#FF5050",
    Trainer: "#32D278",
    Members: "#FFC81E",
    Business: "#3C8CFF",
};
