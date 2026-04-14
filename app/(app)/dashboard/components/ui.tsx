"use client";

// ─────────────────────────────────────────────────────────────────────────────
// dashboard/components/ui.tsx  — SectionCard / SLabel / ViewHeader
// すべてのビューコンポーネントがここからインポートする
// ─────────────────────────────────────────────────────────────────────────────

import type { ThemeColors } from "../types";

// ── カードコンテナ ────────────────────────────────────────────────────────────
export function SectionCard({
    children,
    accentColor,
    t,
}: {
    children: React.ReactNode;
    accentColor?: string;
    t: ThemeColors;
}) {
    return (
        <div
            className="vz-card-hover relative overflow-hidden rounded-2xl px-5 py-[18px]"
            style={{
                background: accentColor
                    ? `radial-gradient(circle at top right, ${accentColor}10, ${t.surface})`
                    : t.surface,
                border: `1px solid ${accentColor ? `${accentColor}22` : t.border}`,
            }}
        >
            {accentColor && (
                <div
                    className="pointer-events-none absolute -top-[30px] -right-[30px] h-[120px] w-[120px] rounded-full"
                    style={{
                        background: `radial-gradient(circle,${accentColor}15,transparent 70%)`,
                    }}
                />
            )}
            <div className="relative z-[1]">{children}</div>
        </div>
    );
}

// ── セクションラベル ──────────────────────────────────────────────────────────
export function SLabel({ text, color, size = 8 }: { text: string; color?: string; size?: number }) {
    return (
        <p
            className="mb-[14px] font-mono text-[var(--slabel-size)] font-black uppercase tracking-[0.25em]"
            style={{
                ["--slabel-size" as string]: `${size}px`,
                color: color ?? "rgba(255,255,255,0.2)",
            }}
        >
            {text}
        </p>
    );
}

// ── ビューヘッダー（戻るボタン付き） ─────────────────────────────────────────
export function ViewHeader({
    title,
    sub,
    onBack,
    t,
    roleColor,
}: {
    title: string;
    sub: string;
    onBack: () => void;
    t: ThemeColors;
    roleColor: string;
}) {
    return (
        <div className="mb-1 flex items-center gap-3">
            <button
                onClick={onBack}
                className="vz-btn h-9 w-9 cursor-pointer rounded-full"
                style={{
                    background: t.surface,
                    border: `1px solid ${t.border}`,
                    color: t.sub,
                }}
            >
                ←
            </button>
            <div>
                <h2 className="m-0 text-[28px] font-black" style={{ color: t.text }}>{title}</h2>
                <p className="m-0 text-[10px]" style={{ color: t.sub }}>{sub}</p>
            </div>
        </div>
    );
}

// ── ローディングスピナー ──────────────────────────────────────────────────────
export function ViewLoader({ t }: { t: ThemeColors }) {
    return (
        <div
            className="flex h-[200px] items-center justify-center text-[12px]"
            style={{
                color: t.sub,
            }}
        >
            読み込み中...
        </div>
    );
}
