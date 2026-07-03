// components/ui/CheerButton.tsx
// Cheer 送信ボタン — 「行動が報われる瞬間」の主役。
// 送信成功時: 星パーティクルの放射バースト＋リング衝撃波＋POPスケール。
// アイコンは辞書（IconCheer=塗り星）に統一。reduced-motion 時は状態変化のみ。
"use client";

import { useState, useEffect } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { MOTION, TAP_SCALE } from "@/lib/design/tokens";
import { IconCheer } from "@/lib/design/icons";

interface Props {
    slug: string;
    initialCount: number;
    roleColor: string;
    isOwn?: boolean;
    showCommentBox?: boolean;
    onCheer?: (newCount: number) => void;
}

const PARTICLES = [0, 45, 90, 135, 180, 225, 270, 315]; // 放射角（deg）

export default function CheerButton({
    slug,
    initialCount,
    roleColor,
    isOwn = false,
    showCommentBox = true,
    onCheer,
}: Props) {
    const [cheerCount, setCheerCount] = useState(initialCount);
    const [cheered, setCheered] = useState(false);
    const [loading, setLoading] = useState(false);
    const [errorMsg, setErrorMsg] = useState("");
    const [comment, setComment] = useState("");
    const [burst, setBurst] = useState(0);
    const reduceMotion = useReducedMotion();

    useEffect(() => {
        if (!burst) return;
        const t = window.setTimeout(() => setBurst(0), 1000);
        return () => window.clearTimeout(t);
    }, [burst]);

    useEffect(() => {
        setCheerCount(initialCount);
    }, [initialCount]);

    async function handleCheer() {
        if (cheered || loading || isOwn) return;
        const sentComment = comment.trim() || undefined;
        const prevCount = cheerCount;

        setErrorMsg("");
        setCheered(true);
        setCheerCount((c) => c + 1);
        setComment("");
        setBurst((n) => n + 1);
        setLoading(true);
        try {
            const res = await fetch("/api/cheer", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ toSlug: slug, comment: sentComment }),
            });
            const data: { success: boolean; cheerCount?: number; error?: string } = await res.json();
            if (data.success && data.cheerCount !== undefined) {
                setCheerCount(data.cheerCount);
                onCheer?.(data.cheerCount);
            } else {
                setCheered(false);
                setCheerCount(prevCount);
                setComment(sentComment ?? "");
                setErrorMsg(data.error ?? "Cheerできませんでした");
            }
        } catch {
            setCheered(false);
            setCheerCount(prevCount);
            setComment(sentComment ?? "");
            setErrorMsg("通信エラーが発生しました");
        } finally {
            setLoading(false);
        }
    }

    if (isOwn) {
        return (
            <div style={{
                width: "100%", padding: "13px", borderRadius: "12px",
                background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)",
                fontSize: "13px", color: "rgba(255,255,255,0.55)", fontWeight: 600,
                textAlign: "center", letterSpacing: "0.03em",
            }}>
                自分のプロフィールにはCheerできません
            </div>
        );
    }

    return (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {showCommentBox && (
                <>
                    <label htmlFor={`cheer-comment-${slug}`} style={{ position: "absolute", width: 1, height: 1, overflow: "hidden", clip: "rect(0 0 0 0)" }}>
                        応援コメント（任意）
                    </label>
                    <textarea
                        id={`cheer-comment-${slug}`}
                        value={comment}
                        onChange={(e) => setComment(e.target.value.slice(0, 120))}
                        placeholder="応援コメント（任意）"
                        style={{
                            width: "100%", minHeight: 74, resize: "vertical", borderRadius: 16,
                            padding: "12px 16px",
                            background: "linear-gradient(180deg, rgba(255,255,255,0.08), rgba(255,255,255,0.03))",
                            border: "1px solid rgba(255,255,255,0.12)",
                            boxShadow: "inset 0 1px 0 rgba(255,255,255,0.05)",
                            color: "rgba(255,255,255,0.92)", fontSize: 12, lineHeight: 1.5, outline: "none",
                        }}
                        disabled={cheered || loading}
                    />
                    <div style={{ fontSize: 10, color: "rgba(255,255,255,0.55)", textAlign: "right" }}>{comment.length}/120</div>
                </>
            )}
            <motion.button
                onClick={handleCheer}
                disabled={cheered || loading}
                whileTap={cheered || reduceMotion ? undefined : { scale: TAP_SCALE }}
                whileHover={cheered || reduceMotion ? undefined : { scale: 1.02 }}
                animate={burst && !reduceMotion ? { scale: [1, 1.06, 1] } : undefined}
                transition={burst ? MOTION.pop : MOTION.press}
                style={{
                    width: "100%", minHeight: 48, padding: "14px 16px", borderRadius: 16,
                    fontSize: "14px", fontWeight: 900, cursor: cheered ? "default" : "pointer",
                    display: "flex", alignItems: "center", justifyContent: "center", gap: "8px",
                    letterSpacing: "0.02em",
                    position: "relative", overflow: "visible",
                    ...(cheered
                        ? {
                            background: `linear-gradient(135deg, ${roleColor}26, rgba(255,255,255,0.08))`,
                            color: "#fff", border: `1px solid ${roleColor}55`,
                            boxShadow: `0 14px 34px ${roleColor}22, inset 0 1px 0 rgba(255,255,255,0.12)`,
                        }
                        : {
                            background: `linear-gradient(135deg, ${roleColor} 0%, #ffffff 180%)`,
                            color: "#050508", border: "1px solid rgba(255,255,255,0.22)",
                            boxShadow: `0 18px 40px ${roleColor}30, inset 0 1px 0 rgba(255,255,255,0.45)`,
                        }),
                }}
            >
                {/* 待機時のシャイン（誘目） */}
                {!cheered && !reduceMotion && (
                    <span aria-hidden style={{
                        position: "absolute", inset: 0, borderRadius: 16, overflow: "hidden", pointerEvents: "none",
                    }}>
                        <span style={{
                            position: "absolute", inset: 0,
                            background: "linear-gradient(120deg, transparent 20%, rgba(255,255,255,0.26) 50%, transparent 80%)",
                            transform: "translateX(-120%)",
                            animation: loading ? "none" : "cheerShine 2.8s ease-in-out infinite",
                        }} />
                    </span>
                )}
                {cheered ? (
                    <>
                        <svg width="15" height="15" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5} aria-hidden>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                        Cheer しました！ · {cheerCount.toLocaleString()}
                    </>
                ) : (
                    <>
                        <span aria-hidden style={{ display: "inline-flex" }}><IconCheer size={15} /></span>
                        +1 Cheer を送る
                        <span style={{
                            marginLeft: 4, padding: "4px 9px", borderRadius: 999,
                            background: "rgba(5,5,8,0.18)", fontFamily: "monospace",
                            fontSize: 11, color: "#050508", fontVariantNumeric: "tabular-nums",
                        }}>
                            {cheerCount.toLocaleString()}
                        </span>
                    </>
                )}

                {/* 送信成功 — 星パーティクル放射バースト＋リング衝撃波 */}
                <AnimatePresence>
                    {burst && !reduceMotion ? (
                        <motion.span
                            key={`burst-${burst}`}
                            initial={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            style={{ position: "absolute", inset: 0, pointerEvents: "none" }}
                            aria-hidden
                        >
                            <motion.span
                                initial={{ opacity: 0.9, scale: 0.7 }}
                                animate={{ opacity: 0, scale: 1.7 }}
                                transition={{ duration: 0.7, ease: "easeOut" }}
                                style={{
                                    position: "absolute", inset: 0, borderRadius: 16,
                                    border: `2px solid ${roleColor}`,
                                    boxShadow: `0 0 28px ${roleColor}88`,
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
                                            position: "absolute", left: "50%", top: "50%",
                                            marginLeft: -7, marginTop: -7,
                                            color: i % 2 === 0 ? roleColor : "#FFD600",
                                            filter: `drop-shadow(0 0 6px ${roleColor})`,
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
            </motion.button>
            <style>{`
                @keyframes cheerShine {
                    0%, 100% { transform: translateX(-120%); opacity: 0; }
                    15% { opacity: 0.95; }
                    55% { transform: translateX(120%); opacity: 0; }
                }
            `}</style>
            {errorMsg && (
                <p role="alert" style={{ textAlign: "center", fontSize: "11px", color: "rgba(255,120,120,0.9)", marginTop: "6px" }}>
                    {errorMsg}
                </p>
            )}
        </div>
    );
}
