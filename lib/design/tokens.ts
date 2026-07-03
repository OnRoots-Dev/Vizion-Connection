// lib/design/tokens.ts
// Vizion Connection デザイントークン — プロジェクト全体の単一ソース。
// globals.css の --vc-* CSS変数と同値を保つこと（変更時は必ず両方を更新する）。
// ルールの明文化は design-system/MASTER.md を参照。

import type { UserRole } from "@/features/auth/types";

// ── カラー ────────────────────────────────────────────────────────────────
export const COLOR = {
    // Surfaces（--vc-bg-base / --vc-bg-surface / --vc-bg-elevated と同値）
    bg: "#09090f",
    surface: "#111118",
    elevated: "#1a1a24",
    border: "rgba(255,255,255,0.08)",
    borderStrong: "rgba(255,255,255,0.16)",

    // Text（--vc-text-* と同値。tertiary は「読ませる最小コントラスト」= AA 4.5:1 を担保）
    text: "#f0f0f5",
    textSecondary: "rgba(255,255,255,0.62)",
    textTertiary: "rgba(255,255,255,0.55)",
    // decorative は装飾専用（テキストに使わない — AA未達のため）
    decorative: "rgba(255,255,255,0.38)",

    // Neon accent（--vc-accent 系と同値）
    accent: "#C8E800",
    accentSoft: "#DDF24E",
    accentDim: "rgba(200,232,0,0.14)",
    accentBorder: "rgba(200,232,0,0.38)",
    accentFaint: "rgba(200,232,0,0.07)",

    // Semantic
    gold: "#FFD600",
    green: "#10B981",
    danger: "#FF5050",
} as const;

// グロー3段階
export const GLOW = {
    soft: "0 0 24px rgba(200,232,0,0.35)",
    strong: "0 0 12px rgba(200,232,0,0.55), 0 0 40px rgba(200,232,0,0.25)",
    text: "0 0 18px rgba(200,232,0,0.45)",
} as const;

// ── 役割色（サブ識別子。--vc-athlete 等と同値） ─────────────────────────────
export const ROLE_COLOR: Record<UserRole, string> = {
    Athlete: "#FF5050",
    Trainer: "#32D278",
    Crew: "#FFC81E",
    Business: "#3C8CFF",
    Admin: "#7C3AED",
};

// ── タイポグラフィ ───────────────────────────────────────────────────────
export const FONT = {
    display: "var(--font-bebas), 'Bebas Neue', sans-serif", // 大型数字・見出し（ゲームHUD）
    mono: "'Space Mono', ui-monospace, monospace",           // ラベル・計器
    body: "var(--font-noto), 'Hiragino Sans', 'Yu Gothic', sans-serif",
} as const;

// タイプスケール（px）— これ以外のサイズを新規に作らない
export const TYPE = {
    displayXl: "clamp(64px, 11vw, 118px)", // ヒーローネーム
    displayLg: 52,  // 主役数値（Cheer / DAY）
    displayMd: 36,  // 副数値（Bond 等）
    heading: 22,    // ページ内見出し
    body: 14,
    bodySm: 13,
    label: 11,      // mono ラベル
    labelSm: 10,    // mono マイクロラベル（textTertiary 以上の色を使うこと）
    labelXs: 9,     // 大文字トラッキングラベル専用
} as const;

// ── 余白（4pxグリッド。これ以外の値を使わない） ──────────────────────────
export const SPACE = {
    xs: 4,
    sm: 8,
    md: 12,
    lg: 16,
    xl: 24,
    xxl: 32,
    xxxl: 48,
} as const;

// ── 角丸（--vc-radius = md） ─────────────────────────────────────────────
export const RADIUS = {
    sm: 8,
    md: 12,   // ボタン・チップ・入力
    lg: 16,   // カード・パネル
    pill: 999,
} as const;

// ── モーショントークン（全アニメーションはこの3種のリズムを使う） ─────────
// PRESS: 押下・即応（tap 0.96 → 復帰）
// POP:   入場・報酬（軽いオーバーシュートで「跳ねる」）
// SLIDE: 開閉・レイアウト遷移（滑らかに追従）
export const MOTION = {
    press: { type: "spring", stiffness: 600, damping: 30 },
    pop: { type: "spring", stiffness: 300, damping: 14 },
    slide: { type: "spring", stiffness: 260, damping: 24 },
} as const;

export const TAP_SCALE = 0.96;
export const HOVER_SCALE = 1.02;

// 最小タップ領域（Apple HIG）
export const MIN_TAP = 44;
