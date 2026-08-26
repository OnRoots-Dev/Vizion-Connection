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
    Trainer: "#30de1d",
    Crew: "#FFC81E",
    Business: "#3C8CFF",
    Admin: "#7C3AED",
};

// ── タイポグラフィ ───────────────────────────────────────────────────────
export const FONT = {
    display: "var(--font-bebas), 'Bebas Neue', sans-serif", // 見出し・数値（ゲームHUD）
    mono: "var(--font-jetbrains), ui-monospace, monospace",  // ラベル・計測（JetBrains Mono / layout.tsxでロード）
    body: "var(--font-noto), 'Hiragino Sans', 'Yu Gothic', sans-serif",
} as const;

/** Status色（--vc-success/--vc-warning/--vc-danger と同一値。役割色とは意図的に分離） */
export const STATUS = {
    success: "#32D278",
    warning: "#FFB454",
    danger: "#FF5C7A",
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
// ボタン / 入力 / カードは INTERACTION.radius と同値（下記 RECIPE を正とする）
export const RADIUS = {
    sm: 8,
    md: 12,   // ボタン・チップ・入力（INTERACTION.radius.button / input）
    lg: 16,   // カード・パネル（INTERACTION.radius.card）
    xl: 28,   // auth ガラスカード・大型モーダルシェル（INTERACTION.radius.glass）
    pill: 999,
} as const;

// ── 共通インタラクションレシピ（ボタン・カード実装の単一基準） ───────────
// design-system/MASTER.md 「共通インタラクションレシピ」と同値を保つこと。
// Framer Motion / Motion の Transition 記法。

/** 押下 spring（Pressable / whileTap の正） */
export const SPRING_PRESS = {
    type: "spring",
    stiffness: 600,
    damping: 32,
    mass: 0.5,
} as const;

/** カード・小さな UI の入場（旧 springSnap） */
export const SPRING_CARD_ENTER = {
    type: "spring",
    stiffness: 520,
    damping: 40,
    mass: 0.7,
} as const;

/** 画面遷移・レイアウト追従（旧 springDefault） */
export const SPRING_PAGE = {
    type: "spring",
    stiffness: 380,
    damping: 34,
    mass: 0.9,
} as const;

/** 報酬・ポップ（軽いオーバーシュート） */
export const SPRING_POP = {
    type: "spring",
    stiffness: 300,
    damping: 14,
} as const;

/** 開閉・スライド */
export const SPRING_SLIDE = {
    type: "spring",
    stiffness: 260,
    damping: 24,
} as const;

/**
 * 共通インタラクションレシピ — 今後のボタン・カードはここを参照する。
 *
 * 1. press … 押下フィードバック
 * 2. hover … リフトアップ（Y + 影 2 段階）
 * 3. radius … 角丸（ボタン / カード / 入力 / ガラス）
 * 4. glass … 半透明素材（blur / saturate）
 * 5. transition … 用途別 spring と CSS fallback
 */
export const INTERACTION = {
    /** 1. 押下フィードバック */
    press: {
        /** whileTap / active の scale。Pressable の PRESS_SCALE と同値 */
        scale: 0.97,
        transition: SPRING_PRESS,
    },

    /** 2. ホバー時のリフトアップ */
    hover: {
        /** whileHover scale 上限 */
        scale: 1.02,
        /** Y 軸リフト（px・上方向が負） */
        y: -2,
        shadow: {
            /** 静止時 */
            rest: "0 4px 16px rgba(0,0,0,0.28)",
            /** ホバー時 */
            hover: "0 12px 32px rgba(0,0,0,0.42)",
        },
    },

    /** 3. 角丸スケール（px）。RADIUS.* と同値 */
    radius: {
        button: 12, // RADIUS.md
        input: 12,  // RADIUS.md
        card: 16,   // RADIUS.lg
        glass: 28,  // RADIUS.xl — auth ガラス / 大型モーダル
    },

    /**
     * 4. 半透明素材
     * - blurPx / saturatePct: auth ガラスカード・dashboard 浮遊パネルの共通値
     * - scrimBlurPx: モーダル背後の dim オーバーレイ
     * CSS: `blur(${blurPx}px) saturate(${saturatePct}%)`
     */
    glass: {
        blurPx: 24,
        saturatePct: 160,
        scrimBlurPx: 12,
        /** ログイン等の強フロストが必要なときのみ（既定は blurPx） */
        blurHeavyPx: 40,
    },

    /**
     * 5. トランジション（用途別）
     * Motion では `transition={INTERACTION.transition.press}` のように渡す。
     * CSS のみの箇所は `css.*` を使う。
     */
    transition: {
        /** ボタン押下・即応 */
        press: SPRING_PRESS,
        /** カード出現・小さな要素の入場 */
        cardEnter: SPRING_CARD_ENTER,
        /** 画面遷移・レイアウト */
        page: SPRING_PAGE,
        /** prefers-reduced-motion 時の短いクロスフェード */
        reduced: { type: "tween", duration: 0.2, ease: "easeOut" } as const,
        /** CSS transition 用（spring を使えない箇所） */
        css: {
            pressMs: 100,
            cardMs: 280,
            pageMs: 320,
            /** ease-out 寄り（Apple 風） */
            ease: "cubic-bezier(0.22, 1, 0.36, 1)",
        },
    },
} as const;

// ── モーショントークン（3 リズム + レシピとの対応） ─────────────────────
// PRESS → INTERACTION.press / transition.press
// POP   → 入場・報酬（軽いオーバーシュート）
// SLIDE → 開閉・レイアウト遷移
export const MOTION = {
    press: SPRING_PRESS,
    pop: SPRING_POP,
    slide: SPRING_SLIDE,
} as const;

/** @deprecated INTERACTION.press.scale を使う。互換のため残置 */
export const TAP_SCALE = INTERACTION.press.scale;
/** @deprecated INTERACTION.hover.scale を使う。互換のため残置 */
export const HOVER_SCALE = INTERACTION.hover.scale;

// 最小タップ領域（Apple HIG）
export const MIN_TAP = 44;

// ── カード面ヘルパー（角丸・影・blur を INTERACTION から解決） ──────────────

/** 不透明カード（dashboard SectionCard / 公開プロフィール パネル） */
export function cardSurfaceTokens() {
    return {
        borderRadius: INTERACTION.radius.card,
        boxShadowRest: INTERACTION.hover.shadow.rest,
        boxShadowHover: INTERACTION.hover.shadow.hover,
        hoverY: INTERACTION.hover.y,
        hoverScale: INTERACTION.hover.scale,
    } as const;
}

/**
 * Auth ガラスカード共通。
 * @param reducedTransparency prefers-reduced-transparency / reduced-motion で blur オフ
 * @param heavy ログイン等の強フロスト（blurHeavyPx）。既定は blurPx
 */
export function authGlassTokens(options?: {
    reducedTransparency?: boolean;
    heavy?: boolean;
}) {
    const g = INTERACTION.glass;
    const blurPx = options?.heavy ? g.blurHeavyPx : g.blurPx;
    const filter =
        options?.reducedTransparency
            ? "none"
            : `blur(${blurPx}px) saturate(${g.saturatePct}%)`;
    return {
        borderRadius: INTERACTION.radius.glass,
        boxShadow: INTERACTION.hover.shadow.hover,
        backdropFilter: filter,
        WebkitBackdropFilter: filter,
        blurPx,
        saturatePct: g.saturatePct,
    } as const;
}
