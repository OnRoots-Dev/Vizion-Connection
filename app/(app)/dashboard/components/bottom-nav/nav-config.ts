// ─────────────────────────────────────────────────────────────────────────────
// bottom-nav/nav-config.ts
// Bottom Navigation: 5項目フラット構成
// Home / Journey / Discovery / Notifications / Hub
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

type Role = string;

function hubLabel(role: Role): string {
    switch (role) {
        case "Athlete": return "Athlete";
        case "Trainer": return "Trainer";
        case "Crew":    return "Crew";
        case "Business": return "Business";
        case "Admin":   return "Admin";
        default:        return "My Hub";
    }
}

const ICONS = {
    home: "m2.25 12 8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75",
    journey: "M3.75 12h3l2.25-6 4.5 12 2.25-6h4.5",
    discovery: "M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z",
    notifications: "M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0",
    hub: "M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z",
} as const;

/**
 * Bottom Bar に常時表示する 5 つの共通導線。
 * Home / Journey / Discovery / Notifications / Hub
 */
export function getPrimaryItems(role: Role): NavItem[] {
    return [
        { id: "home",          label: "Home",          icon: ICONS.home,          target: { kind: "view",  view: "home" } },
        { id: "journey",       label: "Journey",       icon: ICONS.journey,       target: { kind: "view",  view: "journey" } },
        { id: "discovery",     label: "Discovery",     icon: ICONS.discovery,     target: { kind: "view",  view: "discovery" } },
        { id: "notifications", label: "Notif",         icon: ICONS.notifications, target: { kind: "view",  view: "notifications" } },
        { id: "hub",           label: hubLabel(role),  icon: ICONS.hub,           target: { kind: "view",  view: "hub" } },
    ];
}
