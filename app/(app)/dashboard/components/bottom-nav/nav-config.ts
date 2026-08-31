// ─────────────────────────────────────────────────────────────────────────────
// bottom-nav/nav-config.ts
// Bottom Navigation: 6項目構成（中央 Pulse を強調）
// Home / Journey / Pulse(中央・/pulse へ) / Discovery / Notifications / Hub
// この定義が Sidebar(デスクトップ) と BottomNav(モバイル) の単一ソース。
// ─────────────────────────────────────────────────────────────────────────────

import type { DashboardView } from "../../types";

/** 遷移先: Dashboard SPA 内ビュー or フルページルート */
export type NavTarget =
    | { kind: "view"; view: DashboardView }
    | { kind: "route"; href: string };

export interface NavItem {
    id: string;
    label: string;
    /** SVG path の d 属性（24x24 viewBox / stroke ベース） */
    icon: string;
    target: NavTarget;
}


const ICONS = {
    home: "m2.25 12 8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75",
    activities: "M9 6.75V15m6-6v8.25M3.75 3.75h16.5a1.5 1.5 0 011.5 1.5v13.5a1.5 1.5 0 01-1.5 1.5H3.75a1.5 1.5 0 01-1.5-1.5V5.25a1.5 1.5 0 011.5-1.5z",
    moments: "M6.75 6.75v10.5a1.5 1.5 0 001.5 1.5h7.5a1.5 1.5 0 001.5-1.5V6.75a1.5 1.5 0 00-1.5-1.5h-7.5a1.5 1.5 0 00-1.5 1.5zM9.75 12l1.5 1.5L15 9",
    journey: "M6 12h.008v.008H6V12zm.75-4.5a3 3 0 113 3 3 3 0 01-3-3zm9 3a3 3 0 11-3 3 3 3 0 013-3zm-6 4.5h.008v.008H9.75v-.008zm8.25 3h.008v.008H18v-.008zM18 12a6 6 0 10-12 0c0 3.314 2.686 6 6 6s6-2.686 6-6z",
    map: "M15 10.5a3 3 0 11-6 0 3 3 0 016 0z M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z",
    schedule: "M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5",
    settings: "M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.431l-1.003.827c-.293.24-.438.613-.431.992a6.759 6.759 0 010 .255c-.007.378.138.75.43.99l1.005.828c.424.35.534.954.26 1.43l-1.298 2.247a1.125 1.125 0 01-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.57 6.57 0 01-.22.128c-.331.183-.581.495-.644.869l-.213 1.28c-.09.543-.56.941-1.11.941h-2.594c-.55 0-1.02-.398-1.11-.94l-.213-1.281z M15 12a3 3 0 11-6 0 3 3 0 016 0z",
} as const;

/**
 * Bottom Bar に常時表示する共通項目。
 * MVPスコープ（config/mvp-scope.ts）準拠:
 * Home / Activities / Moments / Journey / Viz Map / Schedule / Settings
 */
export function getPrimaryItems(): NavItem[] {
    return [
        { id: "home",       label: "Home",      icon: ICONS.home,      target: { kind: "view", view: "home" } },
        { id: "activities", label: "Activity",  icon: ICONS.activities, target: { kind: "view", view: "activities" } },
        { id: "moments",    label: "Moments",   icon: ICONS.moments,   target: { kind: "view", view: "moments" } },
        { id: "journey",    label: "Journey",   icon: ICONS.journey,   target: { kind: "view", view: "journey" } },
        { id: "viz_map",    label: "Viz Map",   icon: ICONS.map,       target: { kind: "view", view: "viz_map" } },
        { id: "schedule",   label: "Schedule",  icon: ICONS.schedule,  target: { kind: "route", href: "/schedule" } },
        { id: "settings",   label: "Settings",  icon: ICONS.settings,  target: { kind: "view", view: "settings" } },
    ];
}


