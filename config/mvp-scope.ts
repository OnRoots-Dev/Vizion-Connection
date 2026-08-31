// config/mvp-scope.ts
// MVPスコープの単一ソース（02_MVP_SCOPE.md 準拠）。
// MVP: 認証 / Profile(Vizion ID) / Portfolio / Schedule / Cheer / Square checkout /
//      Activity / Moment / Place / Connection / Moment Comment / Viz Map
// 上記以外の既存機能は「封印」（削除せず、UI・導線・直接アクセスを遮断）。

import type { DashboardView } from "@/app/(app)/dashboard/types";

/** ダッシュボードSPA内で封印するビュー（ナビ非表示＋setView遮断） */
export const SEALED_DASHBOARD_VIEWS: ReadonlySet<DashboardView> = new Set([
    "timeline",
    "discovery",
    "news",
    "voicelab",
    "referral",
    "roadmap",
    "collections",
    "offers",
    "action_history",
    "missions",
    "business",
    "hub",
    "cheer_graph",
    "notifications",
    "admin_posts",
    "admin_ads",
]);

/** トップレベルルートの封印（middlewareでredirect）
 *  ※ /r/[slug] は封印しない: 紹介クリック→/register?ref= の現役入口（MVP）。
 *    Referral統計UI(/api/referral/clicks)は引き続き封印。 */
export const SEALED_TOP_LEVEL_PATHS: readonly string[] = [
    "/pulse",
    "/timeline",
    "/ranking",
    "/discovery",
    "/roadmap",
    "/voicelab",
    "/news",
    "/news-rooms",
    "/business-hub",
    "/demo",
    "/company",
    "/contact",
];

/** 封印対象の書き込み系APIプレフィックス（route handlerで403返却） */
export const SEALED_API_PREFIXES: readonly string[] = [
    "/api/bond",
    "/api/instand",
    "/api/pulse/score",
    "/api/missions",
    "/api/referral/clicks",
    "/api/daily-circuit",
];

export function isSealedDashboardView(view: DashboardView): boolean {
    return SEALED_DASHBOARD_VIEWS.has(view);
}

export function isSealedApiPath(pathname: string): boolean {
    return SEALED_API_PREFIXES.some((p) => pathname === p || pathname.startsWith(p + "/"));
}

export function findSealedTopLevelPath(pathname: string): string | null {
    for (const p of SEALED_TOP_LEVEL_PATHS) {
        if (pathname === p || pathname.startsWith(p + "/")) return p;
    }
    return null;
}
