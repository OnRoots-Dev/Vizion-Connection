"use client";

// dashboard/components/feed/location.tsx
// Moment / Activity 共通: Location Link 表示。
// 場所が存在する場合「View on Viz Map」導線を表示。クリック時の遷移は呼び出し側が渡す。

import { motion, useReducedMotion } from "framer-motion";
import { TAP_SCALE } from "@/lib/design/tokens";

const MONO = "'Space Mono', 'SF Mono', monospace";

export function LocationLink({
    placeName,
    prefecture,
    onClick,
    compact = false,
}: {
    placeName?: string | null;
    prefecture?: string | null;
    onClick?: () => void;
    compact?: boolean;
}) {
    const reduce = useReducedMotion();
    if (!placeName) return null;

    return (
        <motion.button
            type="button"
            onClick={onClick}
            whileTap={reduce || !onClick ? undefined : { scale: TAP_SCALE }}
            style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 5,
                maxWidth: "100%",
                padding: "3px 9px",
                borderRadius: 999,
                fontSize: 10.5,
                fontWeight: 800,
                fontFamily: MONO,
                letterSpacing: "0.03em",
                cursor: onClick ? "pointer" : "default",
                background: "rgba(60,140,255,0.12)",
                border: "1px solid rgba(60,140,255,0.35)",
                color: "#7FB2FF",
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
            }}
            title={compact ? "View on Viz Map" : `${placeName}${prefecture ? `（${prefecture}）` : ""} → View on Viz Map`}
        >
            <PinGlyph size={10} />
            {compact ? (prefecture ?? placeName) : placeName}
            <span style={{ opacity: 0.75, fontWeight: 600 }}>→ Viz Map</span>
        </motion.button>
    );
}

function PinGlyph({ size }: { size: number }) {
    return (
        <svg
            width={size}
            height={size}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden
        >
            <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0z" />
            <circle cx="12" cy="10" r="3" />
        </svg>
    );
}
