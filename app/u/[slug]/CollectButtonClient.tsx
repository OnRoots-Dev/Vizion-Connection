// app/(app)/u/[slug]/CollectButtonClient.tsx
"use client";

import { useState, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { dispatchPublicProfileEngagement } from "./engagement-events";

interface Props {
    slug: string;
    initialCollectorCount: number;
    roleColor: string;
    isOwn: boolean;
    viewerSlug: string | null;
    fullWidth?: boolean;
}

export default function CollectButtonClient({ slug, initialCollectorCount, roleColor: rl, isOwn, viewerSlug, fullWidth = false }: Props) {
    const [collected, setCollected] = useState(false);
    const [count, setCount] = useState(initialCollectorCount);
    const [loading, setLoading] = useState(false);
    const [collectBurst, setCollectBurst] = useState(0);
    useEffect(() => {
        if (!collectBurst) return;
        const t = window.setTimeout(() => setCollectBurst(0), 700);
        return () => window.clearTimeout(t);
    }, [collectBurst]);
    useEffect(() => {
        setCount(initialCollectorCount);
    }, [initialCollectorCount]);

    // 初期状態取得
    useEffect(() => {
        if (!viewerSlug || isOwn) return;
        fetch(`/api/collect?targetSlug=${slug}`)
            .then(r => r.json())
            .then(d => setCollected(d.collected ?? false))
            .catch(() => { });
    }, [slug, viewerSlug, isOwn]);

    async function handleCollect() {
        if (isOwn) return;
        if (!viewerSlug) {
            window.location.href = `/login?redirect=/u/${slug}`;
            return;
        }
        if (loading) return;
        setLoading(true);
        try {
            const action = collected ? "uncollect" : "collect";
            const res = await fetch("/api/collect", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ targetSlug: slug, action }),
            });
            const data = await res.json();
            if (data.ok) {
                setCollected(data.collected);
                setCount((current) => {
                    const nextCount = data.collected ? current + 1 : Math.max(0, current - 1);
                    dispatchPublicProfileEngagement({ slug, collectorCount: nextCount, collected: data.collected });
                    return nextCount;
                });
                setCollectBurst((n) => n + 1);
            }
        } catch { /* ignore */ }
        finally { setLoading(false); }
    }

    if (isOwn) return null;

    return (
        <div style={{ display: "flex", alignItems: "center", gap: 10, width: "100%" }}>
            <motion.button
                onClick={handleCollect}
                disabled={loading}
                whileTap={{ scale: 0.98 }}
                style={{
                    display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 8,
                    padding: fullWidth ? "14px 18px" : "13px 18px", borderRadius: 18,
                    background: collected
                        ? `linear-gradient(135deg, ${rl}28, rgba(255,255,255,0.06))`
                        : "linear-gradient(180deg, rgba(255,255,255,0.08), rgba(255,255,255,0.03))",
                    border: `1px solid ${collected ? rl + "55" : "rgba(255,255,255,0.12)"}`,
                    color: collected ? "#fff" : "rgba(255,255,255,0.88)",
                    fontSize: 12, fontWeight: 800, cursor: loading ? "wait" : "pointer",
                    transition: "all 0.18s",
                    boxShadow: collected ? `0 16px 38px ${rl}24, inset 0 1px 0 rgba(255,255,255,0.12)` : "inset 0 1px 0 rgba(255,255,255,0.06)",
                    width: fullWidth ? "100%" : "auto",
                    position: "relative",
                    overflow: "hidden",
                }}
                onMouseEnter={e => {
                    if (!collected) {
                        (e.currentTarget as HTMLButtonElement).style.background = `linear-gradient(135deg, ${rl}18, rgba(255,255,255,0.05))`;
                        (e.currentTarget as HTMLButtonElement).style.borderColor = `${rl}30`;
                        (e.currentTarget as HTMLButtonElement).style.color = "#fff";
                    }
                }}
                onMouseLeave={e => {
                    if (!collected) {
                        (e.currentTarget as HTMLButtonElement).style.background = "linear-gradient(180deg, rgba(255,255,255,0.08), rgba(255,255,255,0.03))";
                        (e.currentTarget as HTMLButtonElement).style.borderColor = "rgba(255,255,255,0.12)";
                        (e.currentTarget as HTMLButtonElement).style.color = "rgba(255,255,255,0.88)";
                    }
                }}
            >
                {!collected ? (
                    <span
                        style={{
                            position: "absolute",
                            inset: 0,
                            background: "linear-gradient(120deg, transparent 25%, rgba(255,255,255,0.18) 50%, transparent 78%)",
                            transform: "translateX(-120%)",
                            animation: loading ? "none" : "collectShine 3s ease-in-out infinite",
                        }}
                    />
                ) : null}
                {/* カードアイコン */}
                <svg width={14} height={14} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                </svg>
                {loading ? "..." : collected ? "✦ Collected" : "✦ カードをコレクト"}
                <span
                    style={{
                        marginLeft: 4,
                        padding: "4px 9px",
                        borderRadius: 999,
                        background: collected ? "rgba(5,5,8,0.26)" : `${rl}18`,
                        color: collected ? "#fff" : rl,
                        fontFamily: "monospace",
                        fontSize: 11,
                        fontWeight: 900,
                        lineHeight: 1,
                    }}
                >
                    {count.toLocaleString()}
                </span>

                <AnimatePresence>
                    {collectBurst ? (
                        <motion.span
                            key={`collect-${collectBurst}`}
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: [0, 0.8, 0], scale: [0.95, 1.06, 1.0] }}
                            transition={{ duration: 0.65, ease: "easeOut" }}
                            style={{ position: "absolute", inset: 0, borderRadius: 12, pointerEvents: "none", boxShadow: `0 0 0 1px ${rl}35, 0 0 26px ${rl}22` }}
                        />
                    ) : null}
                </AnimatePresence>
            </motion.button>
            <style>{`
                @keyframes collectShine {
                    0%, 100% { transform: translateX(-120%); opacity: 0; }
                    18% { opacity: 0.9; }
                    60% { transform: translateX(120%); opacity: 0; }
                }
            `}</style>

            {/* コレクト数 */}
            {!fullWidth && count > 0 && (
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 1 }}>
                    <span style={{ fontSize: 15, fontWeight: 900, color: rl, fontFamily: "monospace", lineHeight: 1 }}>{count}</span>
                    <span style={{ fontSize: 8, fontFamily: "monospace", letterSpacing: "0.18em", textTransform: "uppercase", color: "rgba(255,255,255,0.25)" }}>COLLECTED</span>
                </div>
            )}
        </div>
    );
}
