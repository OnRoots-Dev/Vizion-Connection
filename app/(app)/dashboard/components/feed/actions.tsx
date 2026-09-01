"use client";

// dashboard/components/feed/actions.tsx
// Moment / Activity 共通: Cheer / Comment アクションボタン。
// Cheer は toggle（楽観的更新 + 失敗時ロールバック）、Comment はカウント表示のボタン。

import React from "react";
import { motion, useReducedMotion } from "framer-motion";
import { MOTION, TAP_SCALE } from "@/lib/design/tokens";
import { IconCheer } from "@/lib/design/icons";
import { CheerBurst } from "@/components/ui/CheerBurst";

/** 楽観的 Cheer トグルボタン。busy 中は押下不可。 */
export function CheerButton({
    cheered,
    count,
    disabled,
    onToggle,
    color = "#C8E800",
    size = "md",
}: {
    cheered: boolean;
    count: number;
    disabled?: boolean;
    onToggle: () => void;
    color?: string;
    size?: "md" | "lg";
}) {
    const reduce = useReducedMotion();
    const [burst, setBurst] = React.useState(0);

    React.useEffect(() => {
        if (!burst) return;
        const t = window.setTimeout(() => setBurst(0), 1000);
        return () => window.clearTimeout(t);
    }, [burst]);

    function handle() {
        if (disabled) return;
        if (!cheered) setBurst((n) => n + 1);
        onToggle();
    }

    const height = size === "lg" ? 38 : 34;

    return (
        <motion.button
            type="button"
            aria-label={cheered ? "Cheer済み" : "Cheerする"}
            aria-pressed={cheered}
            whileTap={reduce || disabled ? undefined : { scale: TAP_SCALE }}
            animate={burst && !reduce ? { scale: [1, 1.22, 1] } : undefined}
            transition={MOTION.pop}
            onClick={handle}
            disabled={disabled}
            style={{
                position: "relative",
                display: "inline-flex",
                alignItems: "center",
                gap: 5,
                minHeight: height,
                padding: `0 ${size === "lg" ? 14 : 12}px`,
                borderRadius: 999,
                fontSize: size === "lg" ? 12.5 : 12,
                fontWeight: 800,
                cursor: disabled ? "wait" : "pointer",
                border: "1px solid",
                ...(cheered
                    ? {
                          background: `linear-gradient(135deg, ${color}26, rgba(255,255,255,0.06))`,
                          color,
                          borderColor: `${color}55`,
                      }
                    : {
                          background: "rgba(255,255,255,0.05)",
                          color: "rgba(255,255,255,0.75)",
                          borderColor: "rgba(255,255,255,0.14)",
                      }),
            }}
        >
            <span style={{ display: "inline-flex" }}>
                <IconCheer size={size === "lg" ? 15 : 13} />
            </span>
            {count.toLocaleString()}

            {/* 成功フィードバックのバースト（プロフィールと共通の星＋リング演出） */}
            <CheerBurst trigger={burst} color={color} />
        </motion.button>
    );
}

/** Comment 数表示＋クリックでシート等を開くボタン。 */
export function CommentButton({
    count,
    onClick,
    size = "md",
}: {
    count: number;
    onClick: () => void;
    size?: "md" | "lg";
}) {
    const reduce = useReducedMotion();
    const height = size === "lg" ? 38 : 34;

    return (
        <motion.button
            type="button"
            aria-label={`コメント${count}件を開く`}
            whileTap={reduce ? undefined : { scale: 0.94 }}
            onClick={onClick}
            style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 5,
                minHeight: height,
                padding: `0 ${size === "lg" ? 14 : 12}px`,
                borderRadius: 999,
                fontSize: size === "lg" ? 12.5 : 12,
                fontWeight: 700,
                cursor: "pointer",
                color: "rgba(255,255,255,0.6)",
                background: "rgba(255,255,255,0.05)",
                border: "1px solid rgba(255,255,255,0.12)",
            }}
        >
            <CommentGlyph size={size === "lg" ? 15 : 13} />
            {count.toLocaleString()}
        </motion.button>
    );
}

function CommentGlyph({ size }: { size: number }) {
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
            <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
        </svg>
    );
}
