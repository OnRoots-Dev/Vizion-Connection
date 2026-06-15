"use client";

import { motion, AnimatePresence } from "framer-motion";
import type { ThemeColors } from "../../types";

interface Props {
    visible: boolean;
    label: string;
    t: ThemeColors;
    roleColor: string;
    theme: string;
}

// 一定時間操作がないと中央 Pulse ボタンの上にふわっと出るヒント。
// 下向き矢印付きチップ。操作で消える（表示制御は BottomNav 側）。
export function IdleHint({ visible, label, t, roleColor, theme }: Props) {
    const surface = theme === "light" ? "rgba(255,255,255,0.96)" : "rgba(22,22,28,0.96)";

    return (
        <AnimatePresence>
            {visible && (
                <motion.div
                    initial={{ opacity: 0, y: 8, scale: 0.92 }}
                    animate={{ opacity: 1, y: [0, -4, 0], scale: 1 }}
                    exit={{ opacity: 0, y: 8, scale: 0.92 }}
                    transition={{
                        opacity: { duration: 0.3 },
                        scale: { duration: 0.3 },
                        y: { duration: 1.8, repeat: Infinity, ease: "easeInOut" },
                    }}
                    style={{
                        position: "absolute",
                        left: "50%",
                        bottom: 78,
                        transform: "translateX(-50%)",
                        zIndex: 34,
                        pointerEvents: "none",
                        whiteSpace: "nowrap",
                    }}
                >
                    <div
                        style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 6,
                            padding: "8px 12px",
                            borderRadius: 999,
                            background: surface,
                            backdropFilter: "blur(14px)",
                            WebkitBackdropFilter: "blur(14px)",
                            border: `1px solid ${roleColor}40`,
                            boxShadow: "0 8px 24px rgba(0,0,0,0.3)",
                        }}
                    >
                        <span style={{ fontSize: 14, lineHeight: 1 }}>⚡</span>
                        <span style={{ fontSize: 11, fontWeight: 700, color: t.text }}>{label}</span>
                    </div>
                    {/* 下向き三角 */}
                    <div
                        style={{
                            position: "absolute",
                            left: "50%",
                            bottom: -5,
                            transform: "translateX(-50%) rotate(45deg)",
                            width: 10,
                            height: 10,
                            background: surface,
                            borderRight: `1px solid ${roleColor}40`,
                            borderBottom: `1px solid ${roleColor}40`,
                        }}
                    />
                </motion.div>
            )}
        </AnimatePresence>
    );
}
