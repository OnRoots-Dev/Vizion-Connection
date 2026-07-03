// app/u/[slug]/BondButtonClient.tsx
// Bond CTA。押下は MOTION.press、成立の瞬間は POP スケール＋ネオンリング衝撃波で
// 「観客席に入った」達成感を演出する（reduced-motion 時は状態変化のみ）。
"use client";

import { useState, useEffect } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { MOTION, TAP_SCALE } from "@/lib/design/tokens";
import { IconBond } from "@/lib/design/icons";

interface Props {
    slug: string;
    roleColor: string;
    isOwn: boolean;
    viewerSlug: string | null;
    initialBonded?: boolean;
    fullWidth?: boolean;
}

export default function BondButtonClient({ slug, roleColor: rl, isOwn, viewerSlug, initialBonded = false, fullWidth = false }: Props) {
    const [bonded, setBonded] = useState(initialBonded);
    const [loading, setLoading] = useState(false);
    const [errorMsg, setErrorMsg] = useState("");
    const [celebrate, setCelebrate] = useState(0);
    const reduceMotion = useReducedMotion();

    useEffect(() => {
        if (!viewerSlug || isOwn || initialBonded) return;
        fetch(`/api/bond?targetSlug=${slug}`)
            .then((r) => r.json())
            .then((d) => setBonded(Boolean(d.bonded)))
            .catch(() => {});
    }, [slug, viewerSlug, isOwn, initialBonded]);

    async function handleBond() {
        if (isOwn || bonded || loading) return;
        if (!viewerSlug) {
            window.location.href = `/login?redirect=/u/${slug}`;
            return;
        }
        setLoading(true);
        setErrorMsg("");
        try {
            const res = await fetch("/api/bond", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ targetSlug: slug }),
            });
            const data: { success: boolean; error?: string } = await res.json();
            if (data.success) {
                setBonded(true);
                setCelebrate((n) => n + 1);
            } else {
                setErrorMsg(data.error ?? "Bondできませんでした");
            }
        } catch {
            setErrorMsg("通信エラーが発生しました");
        } finally {
            setLoading(false);
        }
    }

    if (isOwn) return null;

    return (
        <div style={{ display: "flex", flexDirection: "column", gap: 4, width: fullWidth ? "100%" : "auto" }}>
            <motion.button
                type="button"
                onClick={handleBond}
                disabled={bonded || loading}
                whileTap={bonded || reduceMotion ? undefined : { scale: TAP_SCALE }}
                whileHover={bonded || reduceMotion ? undefined : { scale: 1.02 }}
                animate={celebrate && !reduceMotion ? { scale: [1, 1.06, 1] } : undefined}
                transition={celebrate ? MOTION.pop : MOTION.press}
                style={{
                    position: "relative",
                    display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 8,
                    minHeight: 48, padding: "12px 16px", borderRadius: 16,
                    background: bonded
                        ? `linear-gradient(135deg, ${rl}28, rgba(255,255,255,0.06))`
                        : "linear-gradient(180deg, rgba(255,255,255,0.08), rgba(255,255,255,0.03))",
                    border: `1px solid ${bonded ? `${rl}55` : "rgba(255,255,255,0.12)"}`,
                    color: bonded ? "#fff" : "rgba(255,255,255,0.88)",
                    fontSize: 13, fontWeight: 800, cursor: bonded ? "default" : loading ? "wait" : "pointer",
                    width: fullWidth ? "100%" : "auto",
                    overflow: "visible",
                }}
            >
                <span aria-hidden style={{ display: "inline-flex", color: bonded ? rl : "currentColor" }}>
                    <IconBond size={14} />
                </span>
                {loading ? "..." : bonded ? "Bond済み · 観客席に入りました" : "Bondする"}

                {/* 成立の瞬間のネオンリング衝撃波 */}
                <AnimatePresence>
                    {celebrate && !reduceMotion ? (
                        <motion.span
                            key={`ring-${celebrate}`}
                            initial={{ opacity: 0.9, scale: 0.7 }}
                            animate={{ opacity: 0, scale: 1.6 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.7, ease: "easeOut" }}
                            style={{
                                position: "absolute",
                                inset: 0,
                                borderRadius: 16,
                                border: `2px solid ${rl}`,
                                boxShadow: `0 0 24px ${rl}66`,
                                pointerEvents: "none",
                            }}
                            aria-hidden
                        />
                    ) : null}
                </AnimatePresence>
            </motion.button>
            {errorMsg ? (
                <p role="alert" style={{ margin: 0, fontSize: 11, color: "rgba(255,120,120,0.9)", textAlign: "center" }}>{errorMsg}</p>
            ) : null}
        </div>
    );
}
