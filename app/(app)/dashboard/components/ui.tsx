"use client";

// ─────────────────────────────────────────────────────────────────────────────
// dashboard/components/ui.tsx  — SectionCard / SLabel / ViewHeader / Buttons
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
            className="relative overflow-hidden"
            style={{
                background: "#111118",
                border: "1px solid rgba(255,255,255,0.08)",
                borderRadius: 12,
                padding: "20px 24px",
            }}
        >
            {accentColor && (
                <div
                    className="pointer-events-none absolute -top-[30px] -right-[30px] h-[120px] w-[120px] rounded-full"
                    style={{
                        background: `radial-gradient(circle,${accentColor}12,transparent 70%)`,
                    }}
                />
            )}
            <div className="relative z-[1]">{children}</div>
        </div>
    );
}

// ── セクションラベル ──────────────────────────────────────────────────────────
export function SLabel({ text, color, size }: { text: string; color?: string; size?: number }) {
    return (
        <p
            style={{
                fontFamily: "'Space Mono', 'SF Mono', 'Fira Code', monospace",
                fontSize: size ?? 10,
                fontWeight: 600,
                letterSpacing: "0.18em",
                textTransform: "uppercase",
                color: color ?? "rgba(255,255,255,0.28)",
                marginBottom: 12,
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
    t?: ThemeColors;
}) {
    const style: React.CSSProperties = {
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        gap: 4,
        minHeight: 30,
        padding: "6px 11px",
        borderRadius: 999,
        fontSize: 10,
        fontWeight: 800,
        fontFamily: "'Space Mono', 'SF Mono', 'Fira Code', monospace",
        letterSpacing: "0.08em",
        background: `${color}14`,
        outline: `1px solid ${color}26`,
        color,
        textDecoration: "none",
        border: "none",
        cursor: "pointer",
        whiteSpace: "nowrap",
    };

    if (href) {
        return <a href={href} style={style}>{children}</a>;
    }

    return <button type="button" onClick={onClick} style={style}>{children}</button>;
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
                    style={{
                        fontSize: 22,
                        fontWeight: 800,
                        color: "#f0f0f5",
                        margin: 0,
                        lineHeight: 1.02,
                        letterSpacing: "-0.01em",
                        textTransform: "uppercase" as const,
                    }}
                >
                    {title}
                </div>
                {meta ? <div style={{ marginTop: 4 }}>{meta}</div> : null}
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
                style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    width: 40,
                    height: 40,
                    borderRadius: 8,
                    border: "1px solid rgba(255,255,255,0.16)",
                    background: "transparent",
                    cursor: "pointer",
                }}
            >
                <svg width={16} height={16} fill="none" viewBox="0 0 24 24" stroke="rgba(255,255,255,0.55)" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
                </svg>
            </button>
            <div>
                <h2 style={{ margin: 0, fontSize: 22, fontWeight: 800, color: "#f0f0f5", letterSpacing: "-0.01em" }}>{title}</h2>
                <p style={{ margin: 0, fontSize: 11, color: "rgba(255,255,255,0.4)" }}>{sub}</p>
            </div>
        </div>
    );
}

// ── ローディングスピナー ──────────────────────────────────────────────────────
export function ViewLoader({ t }: { t: ThemeColors }) {
    return (
        <div
            className="flex h-[200px] items-center justify-center"
            style={{
                color: "rgba(255,255,255,0.4)",
                fontSize: 12,
            }}
        >
            読み込み中...
        </div>
    );
}

// ── ボタン群 ──────────────────────────────────────────────────────────────────
export function PrimaryButton({ children, onClick, disabled, style }: {
    children: React.ReactNode;
    onClick?: () => void;
    disabled?: boolean;
    style?: React.CSSProperties;
}) {
    return (
        <button
            type="button"
            onClick={onClick}
            disabled={disabled}
            style={{
                background: "#a78bfa",
                color: "#000000",
                borderRadius: 8,
                padding: "11px 20px",
                fontSize: 13,
                fontWeight: 700,
                border: "none",
                boxShadow: "0 0 20px rgba(167,139,250,0.3)",
                cursor: disabled ? "not-allowed" : "pointer",
                opacity: disabled ? 0.45 : 1,
                ...style,
            }}
        >
            {children}
        </button>
    );
}

export function SecondaryButton({ children, onClick, disabled, style }: {
    children: React.ReactNode;
    onClick?: () => void;
    disabled?: boolean;
    style?: React.CSSProperties;
}) {
    return (
        <button
            type="button"
            onClick={onClick}
            disabled={disabled}
            style={{
                background: "transparent",
                border: "1px solid rgba(255,255,255,0.16)",
                color: "rgba(255,255,255,0.6)",
                borderRadius: 8,
                padding: "10px 20px",
                fontSize: 13,
                fontWeight: 500,
                cursor: disabled ? "not-allowed" : "pointer",
                ...style,
            }}
        >
            {children}
        </button>
    );
}

export function DangerButton({ children, onClick, disabled, style }: {
    children: React.ReactNode;
    onClick?: () => void;
    disabled?: boolean;
    style?: React.CSSProperties;
}) {
    return (
        <button
            type="button"
            onClick={onClick}
            disabled={disabled}
            style={{
                background: "rgba(255,59,48,0.12)",
                border: "1px solid rgba(255,59,48,0.3)",
                color: "#ff3b30",
                borderRadius: 8,
                padding: "10px 20px",
                fontSize: 13,
                fontWeight: 500,
                cursor: disabled ? "not-allowed" : "pointer",
                ...style,
            }}
        >
            {children}
        </button>
    );
}
