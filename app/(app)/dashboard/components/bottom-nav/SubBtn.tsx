"use client";

import { motion } from "framer-motion";
import type { ThemeColors } from "../../types";
import type { NavItem } from "./nav-config";

interface Props {
    item: NavItem;
    active: boolean;
    onSelect: (item: NavItem) => void;
    t: ThemeColors;
    roleColor: string;
}

// Bottom Bar 左右に並ぶ通常ナビ項目（アイコン + ラベル縦並び）。
export function SubBtn({ item, active, onSelect, t, roleColor }: Props) {
    return (
        <motion.button
            type="button"
            aria-label={item.label}
            aria-current={active ? "page" : undefined}
            onClick={() => onSelect(item)}
            whileTap={{ scale: 0.88 }}
            transition={{ type: "spring", stiffness: 500, damping: 30 }}
            style={{
                flex: 1,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                gap: 3,
                background: "none",
                border: "none",
                cursor: "pointer",
                padding: "6px 0",
                color: active ? roleColor : t.sub,
                opacity: active ? 1 : 0.7,
                minWidth: 0,
            }}
        >
            <span style={{ position: "relative", display: "inline-flex" }}>
                {active && (
                    <motion.span
                        layoutId="bottomnav-active-glow"
                        style={{
                            position: "absolute",
                            inset: -6,
                            borderRadius: 999,
                            background: `${roleColor}1f`,
                        }}
                    />
                )}
                <svg
                    width={22}
                    height={22}
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={active ? 2.1 : 1.7}
                    style={{ position: "relative" }}
                >
                    <path strokeLinecap="round" strokeLinejoin="round" d={item.icon} />
                </svg>
            </span>
            <span
                style={{
                    fontSize: 9.5,
                    fontWeight: active ? 800 : 600,
                    letterSpacing: "0.02em",
                    lineHeight: 1,
                    maxWidth: 56,
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                }}
            >
                {item.label}
            </span>
        </motion.button>
    );
}
