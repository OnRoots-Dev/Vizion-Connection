"use client";

import { useSyncExternalStore } from "react";
import { THEME_MAP, type Theme, type ThemeColors } from "../../types";

// localStorage "vz-theme" を購読してテーマと配色を返す共有フック。
// DashboardClient と同じキー・既定値（light）を使い、グローバル AppShell の
// BottomNav 配色をダッシュボードと一致させる。
export function useVzTheme(): { theme: Theme; t: ThemeColors } {
    const theme = useSyncExternalStore<Theme>(
        (listener) => {
            const onStorage = (event: StorageEvent) => {
                if (event.key === "vz-theme") listener();
            };
            window.addEventListener("storage", onStorage);
            return () => window.removeEventListener("storage", onStorage);
        },
        () => {
            const saved = localStorage.getItem("vz-theme") as Theme | null;
            return saved && THEME_MAP[saved] ? saved : "light";
        },
        () => "light",
    );

    return { theme, t: THEME_MAP[theme] };
}
