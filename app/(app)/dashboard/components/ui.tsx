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
                border: `0.5px solid ${accentColor ? `${accentColor}14` : t.border}`,
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

export function ActionPill({
    children,
    onClick,
    href,
    color,
    t,
}: {
    children: React.ReactNode;
    onClick?: () => void;
    href?: string;
    color: string;
    t: ThemeColors;
}) {
    const style = {
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        gap: 4,
        minHeight: 30,
        padding: "6px 11px",
        borderRadius: 999,
        fontSize: 10,
        fontWeight: 800,
        fontFamily: "monospace",
        letterSpacing: "0.08em",
        background: `${color}14`,
        outline: `1px solid ${color}26`,
        color,
        textDecoration: "none",
        border: "none",
        cursor: "pointer",
        whiteSpace: "nowrap" as const,
    };

    if (href) {
        return <a href={href} style={style}>{children}</a>;
    }

    return <button type="button" onClick={onClick} style={{ ...style, color: color || t.text }}>{children}</button>;
}

export function CardHeader({
    title,
    color,
    action,
    meta,
}: {
    title: string;
    color?: string;
    action?: React.ReactNode;
    meta?: React.ReactNode;
}) {
    return (
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12, marginBottom: 12, flexWrap: "wrap" }}>
            <div style={{ minWidth: 0 }}>
                <div
                    className="font-display"
                    style={{
                        fontSize: 32,
                        fontWeight: 900,
                        color: "#B2B8BE",
                        margin: 0,
                        lineHeight: 1.02,
                        letterSpacing: "-0.012em",
                        textTransform: "uppercase",
                    }}
                >
                    {title}
                </div>
                {meta ? <div style={{ marginTop: -8 }}>{meta}</div> : null}
            </div>
            {action ? <div style={{ marginLeft: "auto" }}>{action}</div> : null}
        </div>
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
                type="button"
                aria-label="戻る"
                title="戻る"
                className="vz-btn flex h-10 w-10 items-center justify-center rounded-[12px] border"
                style={{
                    borderColor: t.border,
                    background: "rgba(255,255,255,0.05)",
                    cursor: "pointer",
                }}
            >
                <svg width={16} height={16} fill="none" viewBox="0 0 24 24" stroke={t.sub} strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
                </svg>
            </button>
            <div>
                <h2 className="font-display m-0 text-[28px] font-black" style={{ color: t.text }}>{title}</h2>
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
