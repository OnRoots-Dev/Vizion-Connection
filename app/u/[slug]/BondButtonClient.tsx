// app/u/[slug]/BondButtonClient.tsx
"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";

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
        <div style={{ display: "flex", flexDirection: "column", gap: 6, width: fullWidth ? "100%" : "auto" }}>
            <motion.button
                type="button"
                onClick={handleBond}
                disabled={bonded || loading}
                whileTap={{ scale: 0.98 }}
                style={{
                    display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 8,
                    padding: "13px 18px", borderRadius: 18,
                    background: bonded
                        ? `linear-gradient(135deg, ${rl}28, rgba(255,255,255,0.06))`
                        : "linear-gradient(180deg, rgba(255,255,255,0.08), rgba(255,255,255,0.03))",
                    border: `1px solid ${bonded ? `${rl}55` : "rgba(255,255,255,0.12)"}`,
                    color: bonded ? "#fff" : "rgba(255,255,255,0.88)",
                    fontSize: 13, fontWeight: 800, cursor: bonded ? "default" : loading ? "wait" : "pointer",
                    transition: "all 0.18s",
                    width: fullWidth ? "100%" : "auto",
                }}
            >
                <span aria-hidden style={{ fontSize: 14 }}>⊹</span>
                {loading ? "..." : bonded ? "Bond済み" : "Bondする"}
            </motion.button>
            {errorMsg ? (
                <p style={{ margin: 0, fontSize: 11, color: "rgba(255,80,80,0.7)", textAlign: "center" }}>{errorMsg}</p>
            ) : null}
        </div>
    );
}
