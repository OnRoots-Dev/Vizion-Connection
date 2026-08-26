"use client";

// components/ui/chip.tsx — filter toggle chip（Design System v2）
// 選択状態のみアクセントを使用する。装飾用途には使わない。

import { useState } from "react";
import { motion } from "framer-motion";

export interface ChipProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    selected?: boolean;
}

const baseStyle: React.CSSProperties = {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    minHeight: 36,
    padding: "6px 14px",
    borderRadius: 999,
    fontSize: 12,
    fontWeight: 700,
    letterSpacing: "0.01em",
    cursor: "pointer",
    transition: "border-color var(--vc-dur-fast) var(--vc-ease-out), background-color var(--vc-dur-fast) var(--vc-ease-out), color var(--vc-dur-fast) var(--vc-ease-out)",
};

export function Chip({ selected = false, disabled, children, style, onFocus, onBlur, ...rest }: ChipProps) {
    const [focused, setFocused] = useState(false);
    // framer-motion と名前が衝突する DOM ハンドラは除外してから spread する
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { onAnimationStart, onDragStart, onDragEnd, onDrag, ...buttonProps } = rest;
    return (
        <motion.button
            type="button"
            whileTap={disabled ? undefined : { scale: 0.96 }}
            disabled={disabled}
            aria-pressed={selected}
            {...buttonProps}
            onFocus={(e) => { setFocused(true); onFocus?.(e); }}
            onBlur={(e) => { setFocused(false); onBlur?.(e); }}
            style={{
                ...baseStyle,
                ...style,
                background: selected ? "var(--vc-accent)" : focused ? "rgba(255,255,255,0.08)" : "rgba(255,255,255,0.04)",
                border: `1px solid ${selected ? "var(--vc-accent)" : focused ? "var(--vc-border-active)" : "var(--vc-border)"}`,
                color: selected ? "var(--on-accent)" : "var(--vc-text-secondary)",
                outline: focused ? "none" : undefined,
                boxShadow: focused ? "var(--vc-focus-ring)" : "none",
            }}
        >
            {children}
        </motion.button>
    );
}
