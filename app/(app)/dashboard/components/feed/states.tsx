"use client";

// dashboard/components/feed/states.tsx
// Moment / Activity 共通: Loading スケルトン / Empty / Error 状態。

import { motion } from "framer-motion";

const SURFACE = "#111118";
const BORDER = "rgba(255,255,255,0.08)";

function skeletonBlock(style: React.CSSProperties): React.CSSProperties {
    return {
        background: "rgba(255,255,255,0.07)",
        borderRadius: 8,
        ...style,
    };
}

/** フィードカードのスケルトン。ロード中にちらつかせず、落ち着いた骨組みを表示。 */
export function LoadingSkeleton({ media = true }: { media?: boolean }) {
    return (
        <div aria-hidden style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {[1, 2].map((i) => (
                <div
                    key={i}
                    style={{
                        background: SURFACE,
                        border: `1px solid ${BORDER}`,
                        borderRadius: 16,
                        padding: "14px 16px",
                        display: "flex",
                        flexDirection: "column",
                        gap: 12,
                    }}
                >
                    {/* header */}
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <span style={{ width: 36, height: 36, borderRadius: "50%", ...skeletonBlock({}) } as React.CSSProperties} />
                        <span
                            style={{
                                flex: 1,
                                display: "flex",
                                flexDirection: "column",
                                gap: 6,
                                ...skeletonBlock({ height: 30 }),
                            }}
                        />
                    </div>
                    {/* body */}
                    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                        <span style={{ width: "100%", height: 10, ...skeletonBlock({}) } as React.CSSProperties} />
                        <span style={{ width: "78%", height: 10, ...skeletonBlock({}) } as React.CSSProperties} />
                    </div>
                    {/* media */}
                    {media ? (
                        <span style={{ width: "100%", height: 200, borderRadius: 12, ...skeletonBlock({}) } as React.CSSProperties} />
                    ) : null}
                    {/* actions */}
                    <div style={{ display: "flex", gap: 8 }}>
                        <span style={{ width: 70, height: 34, borderRadius: 999, ...skeletonBlock({}) } as React.CSSProperties} />
                        <span style={{ width: 70, height: 34, borderRadius: 999, ...skeletonBlock({}) } as React.CSSProperties} />
                    </div>
                </div>
            ))}
        </div>
    );
}

/** 空状態。 */
export function FeedEmptyState({
    title,
    description,
    action,
}: {
    title: string;
    description?: string;
    action?: React.ReactNode;
}) {
    return (
        <div
            style={{
                textAlign: "center",
                padding: "44px 20px",
                border: `1px dashed ${BORDER}`,
                borderRadius: 16,
                background: "rgba(255,255,255,0.02)",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 10,
            }}
        >
            <div
                style={{
                    width: 44,
                    height: 44,
                    borderRadius: "50%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    background: "rgba(255,255,255,0.05)",
                }}
            >
                <SparkGlyph size={20} />
            </div>
            <div style={{ fontSize: 14, fontWeight: 800, color: "rgba(255,255,255,0.8)" }}>{title}</div>
            {description ? (
                <div style={{ fontSize: 12, lineHeight: 1.7, color: "rgba(255,255,255,0.45)", maxWidth: "36ch" }}>
                    {description}
                </div>
            ) : null}
            {action ? <div style={{ marginTop: 4 }}>{action}</div> : null}
        </div>
    );
}

/** エラー状態。再試行ボタン付き。 */
export function FeedErrorState({
    message,
    onRetry,
}: {
    message: string;
    onRetry: () => void;
}) {
    return (
        <motion.div
            role="alert"
            style={{
                padding: "14px 16px",
                borderRadius: 14,
                fontSize: 13,
                background: "rgba(255,59,48,0.1)",
                border: "1px solid rgba(255,59,48,0.3)",
                color: "#ff8a84",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                gap: 8,
            }}
        >
            <span style={{ lineHeight: 1.5 }}>{message}</span>
            <button
                type="button"
                onClick={onRetry}
                style={{
                    background: "none",
                    border: "none",
                    color: "#fff",
                    fontSize: 12,
                    fontWeight: 700,
                    textDecoration: "underline",
                    cursor: "pointer",
                    whiteSpace: "nowrap",
                    flexShrink: 0,
                }}
            >
                再試行
            </button>
        </motion.div>
    );
}

function SparkGlyph({ size }: { size: number }) {
    return (
        <svg
            width={size}
            height={size}
            viewBox="0 0 24 24"
            fill="none"
            stroke="rgba(255,255,255,0.5)"
            strokeWidth={1.8}
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden
        >
            <path d="M12 3l1.9 5.1L19 10l-5.1 1.9L12 17l-1.9-5.1L5 10l5.1-1.9L12 3z" />
        </svg>
    );
}
