// config/map-first.ts
// Round M1「Map-First化」: ログイン成功後・オンボーディング完了後の
// デフォルト遷移先を一元管理する単一ソース（仕様: vizion-connection-map-first-design-brief.md）。
// 変更箇所は LoginForm / middleware / DashboardClient(onboard完了) / dashboard/page.tsx(正規化) のみ。
// 【切り戻し】DEFAULT_DASHBOARD_VIEW を "home" に戻すだけで旧挙動（/dashboard = Home直行）に復帰する。

/** ログイン後のデフォルト Dashboard 表示（URL の view クエリ値。resolveInitialView で viz_map に正規化） */
export const DEFAULT_DASHBOARD_VIEW = "map" as const;

/** ログイン成功後・オンボーディング完了後のデフォルト遷移先 */
export const DEFAULT_DASHBOARD_PATH = `/dashboard?view=${DEFAULT_DASHBOARD_VIEW}`;