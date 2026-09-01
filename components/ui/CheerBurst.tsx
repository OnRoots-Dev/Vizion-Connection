"use client";

// 共通Cheer演出（星パーティクル放射＋リング衝撃波）。
// プロフィール / フィード の Cheer ボタン両方で同じ演出を使い、サーフェス間で雰囲気を揃える。
// trigger が増えるたびに burst を再実行し、0 に戻ると exit アニメーションで消える。
// 常時は pointerEvents:none でボタン操作を妨げない。

import { motion, useReducedMotion, AnimatePresence } from "framer-motion";
import { IconCheer } from "@/lib/design/icons";

const PARTICLES = [0, 45, 90, 135, 180, 225, 270, 315];

export function CheerBurst({ trigger, color }: { trigger: number; color: string }) {
    const reduce = useReducedMotion();
    if (reduce || !trigger) return null;
    return (
        <AnimatePresence>
            {trigger ? (
                <motion.span
                    key={`burst-${trigger}`}
                    initial={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    style={{ position: "absolute", inset: 0, pointerEvents: "none", zIndex: 5 }}
                    aria-hidden
                >
                    <motion.span
                        initial={{ opacity: 0.9, scale: 0.7 }}
                        animate={{ opacity: 0, scale: 1.7 }}
                        transition={{ duration: 0.7, ease: "easeOut" }}
                        style={{
                            position: "absolute",
                            inset: 0,
                            borderRadius: 999,
                            border: `2px solid ${color}`,
                            boxShadow: `0 0 28px ${color}88`,
                        }}
                    />
                    {/* 遅延エコーリング — より力強い衝撃波（新演出） */}
                    <motion.span
                        initial={{ opacity: 0.6, scale: 0.7 }}
                        animate={{ opacity: 0, scale: 2.0 }}
                        transition={{ duration: 0.9, delay: 0.12, ease: "easeOut" }}
                        style={{
                            position: "absolute",
                            inset: 0,
                            borderRadius: 999,
                            border: `1.5px solid ${color}`,
                            boxShadow: `0 0 18px ${color}55`,
                        }}
                    />
                    {PARTICLES.map((deg, i) => {
                        const rad = (deg * Math.PI) / 180;
                        const dist = 46 + (i % 2) * 16;
                        return (
                            <motion.span
                                key={deg}
                                initial={{ opacity: 1, x: 0, y: 0, scale: 0.5, rotate: 0 }}
                                animate={{
                                    opacity: [1, 1, 0],
                                    x: Math.cos(rad) * dist,
                                    y: Math.sin(rad) * dist,
                                    scale: [0.5, 1.1, 0.8],
                                    rotate: deg > 180 ? -90 : 90,
                                }}
                                transition={{ duration: 0.75, delay: i * 0.02, ease: "easeOut" }}
                                style={{
                                    position: "absolute",
                                    left: "50%",
                                    top: "50%",
                                    marginLeft: -7,
                                    marginTop: -7,
                                    color: i % 2 === 0 ? color : "#FFD600",
                                    filter: `drop-shadow(0 0 6px ${color})`,
                                    display: "inline-flex",
                                }}
                            >
                                <IconCheer size={14} />
                            </motion.span>
                        );
                    })}
                </motion.span>
            ) : null}
        </AnimatePresence>
    );
}
