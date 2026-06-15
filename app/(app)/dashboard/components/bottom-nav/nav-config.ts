// ─────────────────────────────────────────────────────────────────────────────
// bottom-nav/nav-config.ts
// Bottom Navigation の遷移定義。役割（role）ごとに項目を差し替え可能な設計。
// 共通導線 = 全ロール共通。Role Hub は profile.role に応じて DashboardClient 側で
// "hub" ビューが解決される（AthleteHub / TrainerHub / MemberHub / BusinessHub）。
// 将来 Role 専用クイックアクションを追加する場合は getFanItems(role) を拡張する。
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

/** "My Hub" のラベルは役割で変わる */
function hubLabel(role: Role): string {
    switch (role) {
        case "Athlete":
            return "Athlete";
        case "Trainer":
            return "Trainer";
        case "Crew":
            return "Crew";
        case "Business":
            return "Business";
        case "Admin":
            return "Admin";
        default:
            return "My Hub";
    }
}

// アイコン（Heroicons 系の path d）
const ICONS = {
    dashboard:
        "m2.25 12 8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75",
    activity: "M3.75 12h3l2.25-6 4.5 12 2.25-6h4.5",
    timeline: "M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5",
    hub: "M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z",
    pulse: "M3.75 12h2.25m13.5 0h2.25m-15.75 0a6.75 6.75 0 1113.5 0",
    // Profile = 自己紹介 / Vizion Card / Career / 基本情報（人物アイコン）
    profile:
        "M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z",
    // Portfolio = Journey履歴 / 活動記録 / 成長軌跡 / 実績（バーチャート＝成長の可視化）
    portfolio:
        "M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z",
    cheer:
        "M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z",
} as const;

/**
 * Bottom Bar に常時表示する 4 つの共通導線（中央 Pulse を除く）。
 * 左2 + [Pulse] + 右2 のレイアウト。
 */
export function getPrimaryItems(role: Role): NavItem[] {
    return [
        { id: "dashboard", label: "Home", icon: ICONS.dashboard, target: { kind: "view", view: "home" } },
        { id: "activity", label: "Activity", icon: ICONS.activity, target: { kind: "view", view: "journey" } },
        { id: "timeline", label: "Timeline", icon: ICONS.timeline, target: { kind: "route", href: "/timeline" } },
        { id: "hub", label: hubLabel(role), icon: ICONS.hub, target: { kind: "view", view: "hub" } },
    ];
}

/**
 * 中央 Pulse ボタンから展開する Fan のクイックアクション。
 * 先頭が最上段（ヒーロー）。Role 専用アクションはここに追加して拡張する。
 *
 * 責務分離（将来分離可能な構造）:
 *   - Profile   → "profile" ビュー（自己紹介 / Vizion Card / Career / 基本情報）
 *   - Portfolio → "portfolio" ビュー（Journey履歴 / 活動記録 / 成長軌跡 / 実績）
 * 現状 Portfolio は Journey 系ビューを暫定共用。専用 PortfolioView 追加時は
 * DashboardClient の switch("portfolio") を差し替えるだけで分離が完了する。
 */
export function getFanItems(role: Role): NavItem[] {
    const base: NavItem[] = [
        { id: "pulse", label: "Pulse", icon: ICONS.pulse, target: { kind: "route", href: "/pulse" } },
        { id: "profile", label: "Profile", icon: ICONS.profile, target: { kind: "view", view: "profile" } },
        { id: "portfolio", label: "Portfolio", icon: ICONS.portfolio, target: { kind: "view", view: "portfolio" } },
        { id: "cheer", label: "Cheer", icon: ICONS.cheer, target: { kind: "view", view: "cheer" } },
    ];

    // Role 専用クイックアクションの追加ポイント（将来拡張）
    switch (role) {
        // 例: case "Business": base.push({ id: "ads", label: "Ads", icon: ICONS.hub, target: { kind: "view", view: "business" } }); break;
        default:
            return base;
    }
}
