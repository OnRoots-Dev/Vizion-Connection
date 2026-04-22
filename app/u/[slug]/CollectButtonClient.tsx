// app/(app)/u/[slug]/CollectButtonClient.tsx
"use client";

import { useState, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";

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
                setCount(c => data.collected ? c + 1 : Math.max(0, c - 1));
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
                    padding: "11px 22px", borderRadius: 12,
                    background: collected ? `${rl}18` : "rgba(255,255,255,0.06)",
                    border: `1.5px solid ${collected ? rl + "45" : "rgba(255,255,255,0.12)"}`,
                    color: collected ? rl : "rgba(255,255,255,0.65)",
                    fontSize: 12, fontWeight: 700, cursor: loading ? "wait" : "pointer",
                    transition: "all 0.18s",
                    boxShadow: collected ? `0 0 20px ${rl}18` : "none",
                    width: fullWidth ? "100%" : "auto",
                    position: "relative",
                    overflow: "hidden",
                }}
                onMouseEnter={e => {
                    if (!collected) {
                        (e.currentTarget as HTMLButtonElement).style.background = `${rl}10`;
                        (e.currentTarget as HTMLButtonElement).style.borderColor = `${rl}30`;
                        (e.currentTarget as HTMLButtonElement).style.color = rl;
                    }
                }}
                onMouseLeave={e => {
                    if (!collected) {
                        (e.currentTarget as HTMLButtonElement).style.background = "rgba(255,255,255,0.06)";
                        (e.currentTarget as HTMLButtonElement).style.borderColor = "rgba(255,255,255,0.12)";
                        (e.currentTarget as HTMLButtonElement).style.color = "rgba(255,255,255,0.65)";
                    }
                }}
            >
                {/* カードアイコン */}
                <svg width={14} height={14} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                </svg>
                {loading ? "..." : collected ? "✦ Collected" : "✦ カードをコレクト"}

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
