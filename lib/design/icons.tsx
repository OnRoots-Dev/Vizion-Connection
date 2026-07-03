// lib/design/icons.tsx
// アイコン辞書 — 「同じ機能には同じアイコン」を全画面で強制するための単一ソース。
// 対応表（design-system/MASTER.md にも記載）:
//   Cheer   = IconCheer  （塗り星。色は原則 gold #FFD600）
//   Streak  = IconStreak （炎・線画）
//   Journey = IconJourney（レイヤー・線画。「記録の積み重ね」）
//   Bond    = IconBond   （⊹形の4点スパーク・塗り。ブランドグリフのSVG化）
//   最長記録 = IconTrophy（トロフィー・線画）
// 線画アイコンは stroke 2px / 24 viewBox で統一。絵文字・テキストグリフをアイコンに使わない。

import type { CSSProperties } from "react";

export type IconProps = {
    size?: number;
    style?: CSSProperties;
    className?: string;
    "aria-hidden"?: boolean;
    "aria-label"?: string;
};

function strokeProps(size: number) {
    return {
        width: size,
        height: size,
        viewBox: "0 0 24 24",
        fill: "none" as const,
        stroke: "currentColor",
        strokeWidth: 2,
        strokeLinecap: "round" as const,
        strokeLinejoin: "round" as const,
    };
}

// Cheer — 塗り星（既存プロダクトの ★ 表現を SVG 化）
export function IconCheer({ size = 16, style, className, ...aria }: IconProps) {
    return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" style={style} className={className} aria-hidden={aria["aria-hidden"] ?? true} aria-label={aria["aria-label"]}>
            <path d="M12 2l2.9 6.26 6.6 1.04-4.9 4.5 1.3 6.7L12 17.3l-5.9 3.2 1.3-6.7-4.9-4.5 6.6-1.04L12 2z" />
        </svg>
    );
}

// Streak（継続） — 炎
export function IconStreak({ size = 16, style, className, ...aria }: IconProps) {
    return (
        <svg {...strokeProps(size)} style={style} className={className} aria-hidden={aria["aria-hidden"] ?? true} aria-label={aria["aria-label"]}>
            <path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z" />
        </svg>
    );
}

// Journey（記録） — レイヤー
export function IconJourney({ size = 16, style, className, ...aria }: IconProps) {
    return (
        <svg {...strokeProps(size)} style={style} className={className} aria-hidden={aria["aria-hidden"] ?? true} aria-label={aria["aria-label"]}>
            <polygon points="12 2 22 8.5 12 15 2 8.5 12 2" />
            <polyline points="2 15.5 12 22 22 15.5" />
        </svg>
    );
}

// Bond — ⊹形の4点スパーク（塗り）。BondButton / BondAudience / Milestone / dashboard 共通。
export function IconBond({ size = 16, style, className, ...aria }: IconProps) {
    return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" style={style} className={className} aria-hidden={aria["aria-hidden"] ?? true} aria-label={aria["aria-label"]}>
            <path d="M12 2c.55 4.55 2.9 6.9 7.45 7.45.73.09.73 1.01 0 1.1C14.9 11.1 12.55 13.45 12 18c-.55-4.55-2.9-6.9-7.45-7.45-.73-.09-.73-1.01 0-1.1C9.1 8.9 11.45 6.55 12 2z" />
            <circle cx="12" cy="21" r="1.3" stroke="none" />
        </svg>
    );
}

// 最長記録 — トロフィー
export function IconTrophy({ size = 16, style, className, ...aria }: IconProps) {
    return (
        <svg {...strokeProps(size)} style={style} className={className} aria-hidden={aria["aria-hidden"] ?? true} aria-label={aria["aria-label"]}>
            <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6" />
            <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18" />
            <path d="M4 22h16" />
            <path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22" />
            <path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22" />
            <path d="M18 2H6v7a6 6 0 0 0 12 0V2Z" />
        </svg>
    );
}

// 達成チェック（マイルストーン等の「達成済み」形状識別用）
export function IconCheck({ size = 16, style, className, ...aria }: IconProps) {
    return (
        <svg {...strokeProps(size)} strokeWidth={3} style={style} className={className} aria-hidden={aria["aria-hidden"] ?? true} aria-label={aria["aria-label"]}>
            <path d="M5 13l4 4L19 7" />
        </svg>
    );
}

// 開閉シェブロン（Expandable 用）
export function IconChevronDown({ size = 16, style, className, ...aria }: IconProps) {
    return (
        <svg {...strokeProps(size)} style={style} className={className} aria-hidden={aria["aria-hidden"] ?? true} aria-label={aria["aria-label"]}>
            <path d="M6 9l6 6 6-6" />
        </svg>
    );
}

// 右矢印（リンク・CTA 用）
export function IconArrowRight({ size = 13, style, className, ...aria }: IconProps) {
    return (
        <svg {...strokeProps(size)} strokeWidth={2.5} style={style} className={className} aria-hidden={aria["aria-hidden"] ?? true} aria-label={aria["aria-label"]}>
            <path d="M9 5l7 7-7 7" />
        </svg>
    );
}
