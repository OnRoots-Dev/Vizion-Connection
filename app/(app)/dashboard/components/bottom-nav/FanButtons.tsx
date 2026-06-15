"use client";

import { motion, AnimatePresence } from "framer-motion";
import type { ThemeColors } from "../../types";
import type { NavItem } from "./nav-config";

interface Props {
    items: NavItem[];
    open: boolean;
    onSelect: (item: NavItem) => void;
    onClose: () => void;
    t: ThemeColors;
    roleColor: string;
    theme: string;
}

const RADIUS = 104;

// 中央 Pulse から上方向の円弧状に展開するクイックアクション。
// 先頭ほど中央（真上）寄り。各ボタンは円形アイコン + ラベルチップ。
export function FanButtons({ items, open, onSelect, onClose, t, roleColor, theme }: Props) {
    const surface = theme === "light" ? "rgba(255,255,255,0.92)" : "rgba(20,20,26,0.92)";

    // 真上(-90deg)を中心に左右へ等間隔で配置
    const span = Math.min(120, (items.length - 1) * 46);
    const start = -90 - span / 2;
    const step = items.length > 1 ? span / (items.length - 1) : 0;

    return (
        <AnimatePresence>
            {open && (
                <>
                    {/* 外側タップで閉じるスクリム（透明） */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        style={{ position: "fixed", inset: 0, zIndex: 31, background: "transparent" }}
                    />

                    <div
                        style={{
                            position: "absolute",
                            left: "50%",
                            bottom: 34,
                            width: 0,
                            height: 0,
                            zIndex: 33,
                        }}
                    >
                        {items.map((item, i) => {
                            const angle = (start + step * i) * (Math.PI / 180);
                            const x = Math.cos(angle) * RADIUS;
                            const y = Math.sin(angle) * RADIUS; // 上方向は負
                            return (
                                <motion.button
                                    key={item.id}
                                    type="button"
                                    aria-label={item.label}
                                    onClick={() => onSelect(item)}
                                    initial={{ opacity: 0, x: 0, y: 0, scale: 0.4 }}
                                    animate={{ opacity: 1, x, y, scale: 1 }}
                                    exit={{ opacity: 0, x: 0, y: 0, scale: 0.4 }}
                                    transition={{ type: "spring", stiffness: 420, damping: 28, delay: i * 0.035 }}
                                    whileTap={{ scale: 0.9 }}
                                    style={{
                                        position: "absolute",
                                        left: -26,
                                        top: -26,
                                        width: 52,
                                        height: 52,
                                        borderRadius: "50%",
                                        border: `1px solid ${roleColor}40`,
                                        background: surface,
                                        backdropFilter: "blur(14px)",
                                        WebkitBackdropFilter: "blur(14px)",
                                        boxShadow: "0 10px 28px rgba(0,0,0,0.32)",
                                        cursor: "pointer",
                                        display: "flex",
                                        flexDirection: "column",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        gap: 1,
                                        color: roleColor,
                                    }}
                                >
                                    <svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.9}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d={item.icon} />
                                    </svg>
                                    <span style={{ fontSize: 7.5, fontWeight: 800, letterSpacing: "0.02em", color: t.text }}>
                                        {item.label}
                                    </span>
                                </motion.button>
                            );
                        })}
                    </div>
                </>
            )}
        </AnimatePresence>
    );
}
