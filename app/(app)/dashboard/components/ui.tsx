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
            className="vz-card-hover"
            style={{
                padding: "18px 20px",
                borderRadius: 16,
                background: accentColor
                    ? `radial-gradient(circle at top right, ${accentColor}10, rgba(255,255,255,0.02))`
                    : "rgba(255,255,255,0.025)",
                border: `1px solid ${accentColor ? `${accentColor}22` : "rgba(255,255,255,0.07)"}`,
                position: "relative",
                overflow: "hidden",
            }}
        >
            {accentColor && (
                <div
                    style={{
                        position: "absolute", top: -30, right: -30,
                        width: 120, height: 120, borderRadius: "50%",
                        background: `radial-gradient(circle,${accentColor}15,transparent 70%)`,
                        pointerEvents: "none",
                    }}
                />
            )}
            <div style={{ position: "relative", zIndex: 1 }}>{children}</div>
        </div>
    );
}

// ── セクションラベル ──────────────────────────────────────────────────────────
export function SLabel({ text, color }: { text: string; color?: string }) {
    return (
        <p
            style={{
                fontSize: 8, fontWeight: 900, letterSpacing: "0.25em",
                textTransform: "uppercase",
                color: color ?? "rgba(255,255,255,0.2)",
                margin: "0 0 14px", fontFamily: "monospace",
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
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 4 }}>
            <button
                onClick={onBack}
                className="vz-btn"
                style={{
                    width: 36, height: 36, borderRadius: "50%",
                    background: "rgba(255,255,255,0.04)",
                    border: "1px solid rgba(255,255,255,0.09)",
                    color: t.sub,
                    cursor: "pointer",
                }}
            >
                ←
            </button>
            <div>
                <h2 style={{ fontSize: 28, fontWeight: 900, margin: 0 }}>{title}</h2>
                <p style={{ fontSize: 10, color: t.sub, margin: 0 }}>{sub}</p>
            </div>
        </div>
    );
}

// ── ローディングスピナー ──────────────────────────────────────────────────────
export function ViewLoader({ t }: { t: ThemeColors }) {
    return (
        <div
            style={{
                display: "flex", alignItems: "center", justifyContent: "center",
                height: 200, color: t.sub, fontSize: 12,
            }}
        >
            読み込み中...
        </div>
    );
}