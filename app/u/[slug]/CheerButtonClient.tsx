"use client";

import { useState, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { dispatchPublicProfileEngagement } from "./engagement-events";

interface Props {
    slug: string;
    initialCheerCount: number;
    roleColor: string;
    isOwn: boolean;
}

export default function CheerButtonClient({ slug, initialCheerCount, roleColor, isOwn }: Props) {
    const [cheerCount, setCheerCount] = useState(initialCheerCount);
    const [cheered, setCheered] = useState(false);
    const [loading, setLoading] = useState(false);
    const [errorMsg, setErrorMsg] = useState("");
    const [comment, setComment] = useState("");
    const [notesBurst, setNotesBurst] = useState(0);
    useEffect(() => {
        if (!notesBurst) return;
        const t = window.setTimeout(() => setNotesBurst(0), 900);
        return () => window.clearTimeout(t);
    }, [notesBurst]);
    useEffect(() => {
        setCheerCount(initialCheerCount);
    }, [initialCheerCount]);

    async function handleCheer() {
        if (cheered || loading || isOwn) return;
        setLoading(true);
        setErrorMsg("");
        try {
            const res = await fetch("/api/cheer", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ toSlug: slug, comment: comment.trim() || undefined }),
            });

            const data: { success: boolean; cheerCount?: number; error?: string } = await res.json();
            if (data.success && data.cheerCount !== undefined) {
                setCheerCount(data.cheerCount);
                setCheered(true);
                setComment("");
                setNotesBurst((n) => n + 1);
                dispatchPublicProfileEngagement({ slug, cheerCount: data.cheerCount });
            } else {
                setErrorMsg(data.error ?? "Cheerできませんでした");
            }
        } catch {
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
                fontSize: "13px", color: "rgba(255,255,255,0.2)", fontWeight: 600,
                textAlign: "center", letterSpacing: "0.03em",
            }}>
                自分のプロフィールにはCheerできません
            </div>
        );
    }

    return (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value.slice(0, 120))}
                placeholder="応援コメント（任意）"
                style={{
                    width: "100%",
                    minHeight: 74,
                    resize: "vertical",
                    borderRadius: 18,
                    padding: "12px 14px",
                    background: "linear-gradient(180deg, rgba(255,255,255,0.08), rgba(255,255,255,0.03))",
                    border: "1px solid rgba(255,255,255,0.12)",
                    boxShadow: "inset 0 1px 0 rgba(255,255,255,0.05)",
                    color: "rgba(255,255,255,0.92)",
                    fontSize: 12,
                    lineHeight: 1.5,
                    outline: "none",
                }}
                disabled={cheered || loading}
            />
            <div style={{ fontSize: 10, color: "rgba(255,255,255,0.4)", textAlign: "right" }}>{comment.length}/120</div>
            <motion.button
                onClick={handleCheer}
                disabled={cheered || loading}
                whileTap={{ scale: 0.98 }}
                style={{
                    width: "100%", padding: "15px 16px",
                    borderRadius: "18px",
                    fontSize: "14px", fontWeight: 900, cursor: cheered ? "default" : "pointer",
                    display: "flex", alignItems: "center", justifyContent: "center", gap: "8px",
                    transition: "all 0.25s",
                    letterSpacing: "0.02em",
                    position: "relative",
                    overflow: "hidden",
                    ...(cheered
                        ? {
                            background: `linear-gradient(135deg, ${roleColor}26, rgba(255,255,255,0.08))`,
                            color: "#fff",
                            border: `1px solid ${roleColor}55`,
                            boxShadow: `0 14px 34px ${roleColor}22, inset 0 1px 0 rgba(255,255,255,0.12)`,
                        }
                        : {
                            background: `linear-gradient(135deg, ${roleColor} 0%, #ffffff 180%)`,
                            color: "#050508",
                            border: "1px solid rgba(255,255,255,0.22)",
                            boxShadow: `0 18px 40px ${roleColor}30, inset 0 1px 0 rgba(255,255,255,0.45)`,
                        }),
                }}
            >
                {!cheered ? (
                    <span
                        style={{
                            position: "absolute",
                            inset: 0,
                            background: "linear-gradient(120deg, transparent 20%, rgba(255,255,255,0.26) 50%, transparent 80%)",
                            transform: "translateX(-120%)",
                            animation: loading ? "none" : "cheerShine 2.8s ease-in-out infinite",
                        }}
                    />
                ) : null}
                {loading ? (
                    <>
                        <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
                            style={{ animation: "spin 1s linear infinite" }}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M4 12a8 8 0 018-8v8H4z" />
                        </svg>
                        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
                        送信中...
                    </>
                ) : cheered ? (
                    <>
                        <svg width="15" height="15" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                        Cheer しました！ · {cheerCount.toLocaleString()}
                    </>
                ) : (
                    <>
                        <span style={{ fontSize: "15px" }}>★</span>
                        +1 Cheer を送る
                        <span
                            style={{
                                marginLeft: 4,
                                padding: "4px 9px",
                                borderRadius: 999,
                                background: "rgba(5,5,8,0.18)",
                                fontFamily: "monospace",
                                fontSize: 11,
                                color: "#050508",
                            }}
                        >
                            {cheerCount.toLocaleString()}
                        </span>
                    </>
                )}
                <AnimatePresence>
                    {notesBurst ? (
                        <motion.div
                            key={`notes-${notesBurst}`}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            style={{ position: "absolute", inset: 0, pointerEvents: "none" }}
                        >
                            {[0, 1, 2].map((i) => (
                                <motion.span
                                    key={i}
                                    initial={{ opacity: 0, x: 0, y: 0, scale: 0.8 }}
                                    animate={{ opacity: [0, 1, 0], x: 26 + i * 8, y: -18 - i * 10, scale: 1.08 }}
                                    transition={{ duration: 0.85, delay: i * 0.06, ease: "easeOut" }}
                                    style={{ position: "absolute", left: "50%", top: "50%", color: "rgba(255,255,255,0.9)" }}
                                >
                                    ♪
                                </motion.span>
                            ))}
                        </motion.div>
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
                <p style={{ textAlign: "center", fontSize: "11px", color: "rgba(255,80,80,0.7)", marginTop: "6px" }}>
                    {errorMsg}
                </p>
            )}
        </div>
    );
}
