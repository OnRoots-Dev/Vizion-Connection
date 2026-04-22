"use client";

import { useState, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";

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
                    minHeight: 72,
                    resize: "vertical",
                    borderRadius: 12,
                    padding: "10px 12px",
                    background: "rgba(255,255,255,0.03)",
                    border: "1px solid rgba(255,255,255,0.11)",
                    color: "rgba(255,255,255,0.92)",
                    fontSize: 12,
                    lineHeight: 1.5,
                }}
                disabled={cheered || loading}
            />
            <div style={{ fontSize: 10, color: "rgba(255,255,255,0.4)", textAlign: "right" }}>{comment.length}/120</div>
            <motion.button
                onClick={handleCheer}
                disabled={cheered || loading}
                whileTap={{ scale: 0.98 }}
                style={{
                    width: "100%", padding: "13px",
                    borderRadius: "12px",
                    fontSize: "14px", fontWeight: 800, cursor: cheered ? "default" : "pointer",
                    display: "flex", alignItems: "center", justifyContent: "center", gap: "8px",
                    transition: "all 0.25s",
                    letterSpacing: "0.03em",
                    position: "relative",
                    overflow: "hidden",
                    ...(cheered
                        ? { background: `${roleColor}12`, color: roleColor, border: `1px solid ${roleColor}30` }
                        : { background: roleColor, color: "#000" }),
                }}
            >
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
                        <span style={{ fontSize: "14px" }}>★</span>
                        + 1 Cheer する · {cheerCount.toLocaleString()}
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
            {errorMsg && (
                <p style={{ textAlign: "center", fontSize: "11px", color: "rgba(255,80,80,0.7)", marginTop: "6px" }}>
                    {errorMsg}
                </p>
            )}
        </div>
    );
}
