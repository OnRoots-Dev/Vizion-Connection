"use client";

import { THEME_MAP, type Theme, type ThemeColors } from "../../types";

// テーマはダーク固定（UIからの切り替えは廃止）。
// light/dim の定義は将来の復活用に types.ts に残置。
export function useVzTheme(): { theme: Theme; t: ThemeColors } {
    const theme: Theme = "dark";
    return { theme, t: THEME_MAP[theme] };
}
