"use client";

import { useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { TYPE_CONFIG, type LiveInfoItem } from "./LiveInfoCard";

const ACCENT = "#C8E800";

export function LiveWorldCarousel({ items }: { items: LiveInfoItem[] }) {
    const reduce = useReducedMotion();
    const [active, setActive] = useState(0);

    if (items.length === 0) return null;

    const index = active % items.length;
    const item = items[index];
    const config = TYPE_CONFIG[item.type];

    function go(next: number) {
        setActive((next + items.length) % items.length);
    }

    return (
        <div style={{ position: "relative", width: "100%", maxWidth: 560, margin: "0 auto" }}>
            {/* Large showcase panel */}
            <div style={{ position: "relative", overflow: "hidden", borderRadius: 20, border: "1px solid rgba(255,255,255,0.10)", background: "rgba(255,255,255,0.02)" }}>
                <div
                    aria-hidden
                    style={{ position: "absolute", top: -90, left: "50%", transform: "translateX(-50%)", width: 420, height: 220, borderRadius: "50%", background: `${config.color}0d`, filter: "blur(80px)", pointerEvents: "none" }}
                />

                <AnimatePresence mode="wait" initial={false}>
                    <motion.div
                        key={index}
                        initial={reduce ? { opacity: 0 } : { opacity: 0, y: 14 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={reduce ? { opacity: 0 } : { opacity: 0, y: -10 }}
                        transition={{ duration: 0.4, ease: [0.25, 1, 0.5, 1] }}
                        onClick={() => {
                            if (item.href) window.location.href = item.href;
                        }}
                        style={{ position: "relative", padding: 24, cursor: item.href ? "pointer" : "default" }}
                    >
                        {/* 画像の代替ビジュアル（アイコン＋背景色ブロック） */}
                        <div style={{ position: "relative", height: 132, borderRadius: 14, overflow: "hidden", border: `1px solid ${config.color}22`, background: `linear-gradient(135deg, ${config.color}16 0%, #0d0d12 72%)` }}>
                            <span aria-hidden style={{ position: "absolute", inset: 0, display: "grid", placeItems: "center", fontFamily: "'Space Mono', monospace", fontSize: 72, fontWeight: 900, letterSpacing: "0.06em", textTransform: "uppercase", color: `${config.color}1a`, userSelect: "none" }}>{config.label}</span>
                            <div aria-hidden style={{ position: "absolute", inset: 0, display: "grid", placeItems: "center" }}>
                                <div style={{ transform: "scale(2.6)", opacity: 0.95 }}>{config.icon}</div>
                            </div>
                            <div aria-hidden style={{ position: "absolute", inset: 0, background: `radial-gradient(ellipse at 18% 0%, ${config.color}14, transparent 55%)`, pointerEvents: "none" }} />
                        </div>

                        {/* タイプリボン */}
                        <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 16 }}>
                            <span style={{ width: 6, height: 6, borderRadius: "50%", background: config.color, boxShadow: `0 0 10px ${config.color}`, flexShrink: 0 }} />
                            <span style={{ fontFamily: "'Space Mono', monospace", fontSize: 10, fontWeight: 700, letterSpacing: "0.18em", textTransform: "uppercase", color: config.color }}>{config.label}</span>
                            {item.href ? (
                                <span style={{ marginLeft: "auto", fontSize: 10, fontWeight: 800, letterSpacing: "0.08em", color: ACCENT, textTransform: "uppercase", flexShrink: 0 }}>開く →</span>
                            ) : null}
                        </div>

                        <p style={{ margin: "10px 0 0", fontSize: 13, fontWeight: 500, lineHeight: 1.6, color: "rgba(255,255,255,0.8)" }}>{item.text}</p>
                    </motion.div>
                </AnimatePresence>
            </div>

            {/* Controls: prev/next + pagination dots */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 14, marginTop: 14 }}>
                <button
                    type="button"
                    onClick={() => go(index - 1)}
                    aria-label="前の項目"
                    style={{ display: "grid", placeItems: "center", width: 34, height: 34, borderRadius: "50%", border: "1px solid rgba(255,255,255,0.12)", background: "transparent", color: "rgba(255,255,255,0.5)", cursor: "pointer" }}
                >
                    <ChevronLeft size={15} />
                </button>

                <div style={{ display: "flex", alignItems: "center", gap: 8 }} role="tablist" aria-label="表示中の項目">
                    {items.map((it, i) => {
                        const isActive = i === index;
                        return (
                            <button
                                key={i}
                                type="button"
                                role="tab"
                                aria-selected={isActive}
                                aria-label={`${i + 1}つ目を見る`}
                                onClick={() => setActive(i)}
                                style={{ width: isActive ? 26 : 8, height: 8, borderRadius: 999, border: "none", padding: 0, background: isActive ? ACCENT : "rgba(255,255,255,0.22)", boxShadow: isActive ? "0 0 12px rgba(200,232,0,0.5)" : "none", transition: "all 0.3s", cursor: "pointer" }}
                            />
                        );
                    })}
                </div>

                <button
                    type="button"
                    onClick={() => go(index + 1)}
                    aria-label="次の項目"
                    style={{ display: "grid", placeItems: "center", width: 34, height: 34, borderRadius: "50%", border: "1px solid rgba(255,255,255,0.12)", background: "transparent", color: "rgba(255,255,255,0.5)", cursor: "pointer" }}
                >
                    <ChevronRight size={15} />
                </button>
            </div>

            <p style={{ margin: "10px 0 0", textAlign: "center", fontFamily: "'Space Mono', monospace", fontSize: 10, letterSpacing: "0.2em", textTransform: "uppercase", color: "rgba(255,255,255,0.25)" }}>
                {String(index + 1).padStart(2, "0")} / {String(items.length).padStart(2, "0")}
            </p>
        </div>
    );
}