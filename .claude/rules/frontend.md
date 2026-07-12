---
description: フロントエンド（UI・テーマ・スタイリング）の規則
paths:
  - "app/**"
  - "components/**"
  - "design-system/**"
---

# フロントエンド規則

## スタイリング
- Tailwind v4（`globals.css` で `@import "tailwindcss"`）。設定はCSSファースト。
- ベースコンポーネントは shadcn/ui（`components/ui/`）。
- アニメーションは Framer Motion に統一。
- ダークデザインシステムのトークンは `--vc-*` CSSカスタムプロパティ。
- フォント: `--font-bebas`（Bebas Neue、見出し）/ `--font-noto`（Noto Sans JP、本文・日本語ファースト）。
- パスエイリアス: `@/` = リポジトリルート。

## ロールカラー（ハードコードせずこの定義を参照）
| ロール | 色 |
|---|---|
| Athlete | `#FF5050` |
| Trainer | `#32D278` |
| Crew | `#FFC81E` |
| Business | `#3C8CFF` |

## ダッシュボードのテーマ
- 3テーマ: `dark | dim | light`。動的な色（境界・背景・文字）は props の `t`（`ThemeColors`）経由で受ける。
- **ダッシュボード配下のコンポーネントで色をハードコードしない** — `t.bg` / `t.border` / `t.text` / `t.sub` 等を使う。

## ダッシュボードSPAパターン
- `/dashboard` は単一ページSPA。ビュー切替はURLを変えず `DashboardView` union（`app/(app)/dashboard/types.ts`）+ `Sidebar` の `setView()` で行う。
- 新ビュー追加時: types.ts の union → `DashboardClient` の switch → Sidebar の3点を揃える。
- `/pulse` と `/timeline` はSPA外の独立フルページルート。

## スポンサープラン
`roots | signal | presence | legacy`（`ProfileData.sponsorPlan`。`roots_plus` は2026-06-30に廃止済み）
