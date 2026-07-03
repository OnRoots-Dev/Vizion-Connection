// app/u/[slug]/profile-theme.ts
// 公開プロフィール／ポートフォリオのテーマ層。
// 値はすべて lib/design/tokens.ts（単一ソース）から参照する — ここで独自の色・数値を定義しない。
// 世界観: スポーティ・ダイナミック × ゲーミフィケーション（ミニマル高級感 × サイバー）

import type { UserRole } from "@/features/auth/types";
import { COLOR, GLOW, FONT, MOTION, ROLE_COLOR } from "@/lib/design/tokens";

export const VP = {
    // Surfaces
    bg: COLOR.bg,
    surface: COLOR.surface,
    surface2: COLOR.elevated,
    border: COLOR.border,
    borderStrong: COLOR.borderStrong,

    // Text
    text: COLOR.text,
    sub: COLOR.textSecondary,
    faint: COLOR.textTertiary,       // 読ませる最小コントラスト（AA準拠）
    decorative: COLOR.decorative,    // 装飾専用 — テキストに使わない

    // Neon (brand)
    neon: COLOR.accent,
    neonSoft: COLOR.accentSoft,
    neonDim: COLOR.accentDim,
    neonBorder: COLOR.accentBorder,
    neonFaint: COLOR.accentFaint,
    glow: GLOW.soft,
    glowStrong: GLOW.strong,
    textGlow: GLOW.text,

    // Semantic
    gold: COLOR.gold,
    green: COLOR.green,
} as const;

export const VP_DISPLAY_FONT = FONT.display;
export const VP_MONO_FONT = FONT.mono;
export const VP_BODY_FONT = FONT.body;

// 役割色（サブ識別子）
export const VP_ROLE_COLOR: Record<UserRole, string> = ROLE_COLOR;

export const VP_ROLE_LABEL: Record<UserRole, string> = {
    Athlete: "ATHLETE",
    Trainer: "TRAINER",
    Crew: "CREW",
    Business: "BUSINESS",
    Admin: "ADMIN",
};

export const VP_ROLE_LABEL_JA: Record<UserRole, string> = {
    Athlete: "アスリート",
    Trainer: "トレーナー",
    Crew: "クルー",
    Business: "ビジネス",
    Admin: "管理",
};

// モーショントークン（lib/design/tokens.ts の3種に統一）
export const VP_MOTION = MOTION;
// 後方互換エイリアス（既存コンポーネント用）
export const VP_SPRING = MOTION.pop;
export const VP_SPRING_SOFT = MOTION.slide;

// セクション見出し共通スタイル
export const vpSectionTitle = {
    margin: "0 0 16px",
    fontSize: 11,
    fontWeight: 800,
    letterSpacing: "0.24em",
    textTransform: "uppercase" as const,
    color: VP.neon,
    fontFamily: VP_MONO_FONT,
};

// パネル共通スタイル
export const vpPanel = {
    background: VP.surface,
    border: `1px solid ${VP.border}`,
    borderRadius: 16,
};
