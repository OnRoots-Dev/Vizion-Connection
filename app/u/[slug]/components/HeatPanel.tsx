// app/u/[slug]/components/HeatPanel.tsx
// ② 熱量パネル — 初見で伝える「熱量」の1メッセージに集中する。
// 構成: Cheer 大型カウントアップ（主役・リアルタイム追従＋更新フラッシュ）
//     ＋ 最新コメントハイライト1件 ＋ 支援企業（最大3件＋残数）。
// Bond 数は NetworkCard に一本化（重複表示しない）。
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, useReducedMotion } from "framer-motion";
import { MOTION, INTERACTION } from "@/lib/design/tokens";
import { PUBLIC_PROFILE_ENGAGEMENT_EVENT, type PublicProfileEngagementDetail } from "../engagement-events";
import { VP, VP_DISPLAY_FONT, VP_MONO_FONT, vpSectionTitle, vpCardHover } from "../profile-theme";
import NeonCountUp from "./NeonCountUp";

export type HeatSponsor = {
    slug: string;
    displayName: string;
    avatarUrl: string | null;
    planId: string;
};

export type HeatComment = {
    id: string;
    comment: string;
    fromName: string;
};

const PLAN_LABEL: Record<string, string> = {
    roots: "Roots",
    roots_plus: "Roots+",
    signal: "Signal",
    presence: "Presence",
    legacy: "Legacy",
};

const SPONSOR_DISPLAY_MAX = 3;

export default function HeatPanel({
    slug,
    initialCheerCount,
    sponsors,
    comments,
    planBadge,
}: {
    slug: string;
    initialCheerCount: number;
    sponsors: HeatSponsor[];
    comments: HeatComment[];
    planBadge?: React.ReactNode;
}) {
    const [cheerCount, setCheerCount] = useState(initialCheerCount);
    const [flash, setFlash] = useState(0);
    const reduceMotion = useReducedMotion();

    useEffect(() => {
        const handleUpdate = (event: Event) => {
            const detail = (event as CustomEvent<PublicProfileEngagementDetail>).detail;
            if (!detail || detail.slug !== slug) return;
            if (typeof detail.cheerCount === "number" && detail.cheerCount !== cheerCount) {
                setCheerCount(detail.cheerCount);
                setFlash((n) => n + 1);
            }
        };
        window.addEventListener(PUBLIC_PROFILE_ENGAGEMENT_EVENT, handleUpdate as EventListener);
        return () => window.removeEventListener(PUBLIC_PROFILE_ENGAGEMENT_EVENT, handleUpdate as EventListener);
    }, [slug, cheerCount]);

    const shownSponsors = sponsors.slice(0, SPONSOR_DISPLAY_MAX);
    const restSponsors = sponsors.length - shownSponsors.length;
    const highlight = comments[0] ?? null;

    return (
        <motion.section
            initial={reduceMotion ? false : { opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-40px" }}
            transition={MOTION.pop}
            aria-label="熱量"
        >
            <h2 style={vpSectionTitle}>Heat</h2>

            {/* Cheer — 主役数値。リアルタイム更新時はネオンフラッシュ */}
            <motion.div
                key={`flash-${flash}`}
                animate={flash && !reduceMotion ? { boxShadow: [VP.glow, VP.glowStrong, VP.glow] } : undefined}
                transition={{ duration: 0.7, ease: "easeOut" }}
                whileHover={reduceMotion ? undefined : vpCardHover}
                style={{
                    padding: "24px 16px",
                    borderRadius: INTERACTION.radius.card,
                    background: VP.neonFaint,
                    border: `1px solid ${VP.neonBorder}`,
                    boxShadow: VP.glow,
                    textAlign: "center",
                }}
            >
                <p
                    style={{
                        margin: "0 0 4px",
                        fontSize: 9,
                        letterSpacing: "0.26em",
                        textTransform: "uppercase",
                        color: VP.neonSoft,
                        fontFamily: VP_MONO_FONT,
                    }}
                >
                    Cheer
                </p>
                <p
                    style={{
                        margin: 0,
                        fontSize: 52,
                        lineHeight: 1,
                        fontFamily: VP_DISPLAY_FONT,
                        color: VP.neon,
                        textShadow: VP.textGlow,
                    }}
                >
                    <NeonCountUp value={cheerCount} />
                </p>
                <p style={{ margin: "6px 0 0", fontSize: 11, color: VP.sub }}>集まった応援の数</p>
            </motion.div>

            {/* 最新コメントハイライト（1件のみ — 情報を絞る） */}
            {highlight ? (
                <figure
                    style={{
                        margin: "12px 0 0",
                        position: "relative",
                        padding: "12px 16px 12px 20px",
                        borderRadius: 12,
                        background: "rgba(255,255,255,0.025)",
                        border: `1px solid ${VP.border}`,
                        overflow: "hidden",
                    }}
                >
                    <span
                        aria-hidden
                        style={{
                            position: "absolute",
                            left: 0,
                            top: "16%",
                            bottom: "16%",
                            width: 3,
                            borderRadius: "0 3px 3px 0",
                            background: `linear-gradient(to bottom, transparent, ${VP.neon}, transparent)`,
                        }}
                    />
                    <blockquote style={{ margin: 0, fontSize: 13, lineHeight: 1.75, color: "rgba(255,255,255,0.85)" }}>
                        {highlight.comment}
                    </blockquote>
                    <figcaption
                        style={{
                            marginTop: 4,
                            fontSize: 10,
                            letterSpacing: "0.08em",
                            color: VP.faint,
                            fontFamily: VP_MONO_FONT,
                        }}
                    >
                        — {highlight.fromName}
                    </figcaption>
                </figure>
            ) : null}

            {/* 支援企業（最大3件＋残数） */}
            <div style={{ marginTop: 12 }}>
                <p
                    style={{
                        margin: "0 0 8px",
                        fontSize: 9,
                        letterSpacing: "0.26em",
                        textTransform: "uppercase",
                        color: VP.faint,
                        fontFamily: VP_MONO_FONT,
                    }}
                >
                    Supported by
                </p>
                {shownSponsors.length > 0 ? (
                    <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
                        {shownSponsors.map((s) => (
                            <Link
                                key={s.slug}
                                href={`/u/${s.slug}`}
                                style={{
                                    display: "inline-flex",
                                    alignItems: "center",
                                    gap: 8,
                                    padding: "8px 16px 8px 8px",
                                    minHeight: 44,
                                    borderRadius: 999,
                                    border: `1px solid ${VP.neonBorder}`,
                                    background: VP.neonFaint,
                                    color: VP.text,
                                    cursor: "pointer",
                                }}
                            >
                                <span
                                    style={{
                                        width: 28,
                                        height: 28,
                                        borderRadius: "50%",
                                        overflow: "hidden",
                                        background: VP.surface2,
                                        border: `1px solid ${VP.border}`,
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        flexShrink: 0,
                                    }}
                                >
                                    {s.avatarUrl ? (
                                        <Image src={s.avatarUrl} alt="" width={28} height={28} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                                    ) : (
                                        <span style={{ fontSize: 11, fontWeight: 900, color: VP.neonSoft, fontFamily: VP_MONO_FONT }}>
                                            {s.displayName.slice(0, 1).toUpperCase()}
                                        </span>
                                    )}
                                </span>
                                <span style={{ fontSize: 12, fontWeight: 800 }}>{s.displayName}</span>
                                <span
                                    style={{
                                        fontSize: 9,
                                        fontWeight: 800,
                                        letterSpacing: "0.1em",
                                        textTransform: "uppercase",
                                        color: VP.neonSoft,
                                        fontFamily: VP_MONO_FONT,
                                    }}
                                >
                                    {PLAN_LABEL[s.planId] ?? s.planId}
                                </span>
                            </Link>
                        ))}
                        {restSponsors > 0 ? (
                            <span style={{ fontSize: 11, color: VP.faint, fontFamily: VP_MONO_FONT }}>+{restSponsors}社</span>
                        ) : null}
                    </div>
                ) : (
                    <div
                        style={{
                            borderRadius: 12,
                            border: `1px dashed ${VP.neonBorder}`,
                            background: VP.neonFaint,
                            padding: "12px 16px",
                        }}
                    >
                        <p style={{ margin: "0 0 4px", fontSize: 10, letterSpacing: "0.2em", textTransform: "uppercase", color: VP.neonSoft, fontFamily: VP_MONO_FONT }}>
                            Sponsor Slot
                        </p>
                        <p style={{ margin: 0, fontSize: 12, color: VP.sub }}>支援企業を募集中 — この枠があなたの企業ロゴになります</p>
                    </div>
                )}
                {planBadge ? <div style={{ marginTop: 8 }}>{planBadge}</div> : null}
            </div>
        </motion.section>
    );
}
