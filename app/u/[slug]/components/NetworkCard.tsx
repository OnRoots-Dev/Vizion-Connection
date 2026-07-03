// app/u/[slug]/components/NetworkCard.tsx
// ④ ネットワークカード — Bond（応援している/されている）関係の可視化。
// 常時表示: 双方向カウント＋Bond CTA。観客席グリッドとサポーター列は展開で開示。
// Bond 数の表示はこのカードに一本化（HeatPanel とは重複させない）。
"use client";

import Image from "next/image";
import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { MOTION } from "@/lib/design/tokens";
import { VP, VP_DISPLAY_FONT, VP_MONO_FONT, vpSectionTitle } from "../profile-theme";
import NeonCountUp from "./NeonCountUp";
import BondAudience from "../BondAudience";
import BondButtonClient from "../BondButtonClient";
import Expandable from "./Expandable";

export type NetworkSupporter = {
    slug: string;
    displayName: string;
    avatarUrl: string | null;
};

export default function NetworkCard({
    slug,
    viewerSlug,
    isOwn,
    initialBonded,
    bondCount,
    bondingCount,
    supporters,
}: {
    slug: string;
    viewerSlug: string | null;
    isOwn: boolean;
    initialBonded: boolean;
    bondCount: number;
    bondingCount: number;
    supporters: NetworkSupporter[];
}) {
    const reduceMotion = useReducedMotion();

    return (
        <motion.section
            initial={reduceMotion ? false : { opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-40px" }}
            transition={MOTION.pop}
            aria-label="ネットワーク"
        >
            <h2 style={vpSectionTitle}>Network</h2>

            <div
                style={{
                    borderRadius: 16,
                    border: `1px solid ${VP.border}`,
                    background: VP.surface,
                    padding: 16,
                    display: "flex",
                    flexDirection: "column",
                    gap: 12,
                }}
            >
                {/* 双方向カウント（常時） */}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                    <div style={{ textAlign: "center", padding: "12px 8px", borderRadius: 12, background: "rgba(255,255,255,0.02)", border: `1px solid ${VP.border}` }}>
                        <p style={{ margin: "0 0 2px", fontSize: 9, letterSpacing: "0.2em", textTransform: "uppercase", color: VP.faint, fontFamily: VP_MONO_FONT }}>
                            応援している
                        </p>
                        <p style={{ margin: 0, fontSize: 36, lineHeight: 1.1, fontFamily: VP_DISPLAY_FONT, color: VP.text }}>
                            <NeonCountUp value={bondingCount} />
                        </p>
                    </div>
                    <div style={{ textAlign: "center", padding: "12px 8px", borderRadius: 12, background: VP.neonFaint, border: `1px solid ${VP.neonBorder}` }}>
                        <p style={{ margin: "0 0 2px", fontSize: 9, letterSpacing: "0.2em", textTransform: "uppercase", color: VP.neonSoft, fontFamily: VP_MONO_FONT }}>
                            応援されている
                        </p>
                        <p style={{ margin: 0, fontSize: 36, lineHeight: 1.1, fontFamily: VP_DISPLAY_FONT, color: VP.neon, textShadow: VP.textGlow }}>
                            <NeonCountUp value={bondCount} />
                        </p>
                    </div>
                </div>

                {/* Bond CTA（本人には非表示 = BondButtonClient 側で制御） */}
                <BondButtonClient slug={slug} roleColor={VP.neon} isOwn={isOwn} viewerSlug={viewerSlug} initialBonded={initialBonded} fullWidth />

                {/* 観客席・サポーター列は段階的開示 */}
                <Expandable title="観客席" summary={`${bondCount.toLocaleString()}人が応援中`}>
                    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                        {supporters.length > 0 ? (
                            <div style={{ display: "flex", alignItems: "center", gap: 4, flexWrap: "wrap" }}>
                                {supporters.slice(0, 5).map((s, i) => (
                                    <Link
                                        key={s.slug}
                                        href={`/u/${s.slug}`}
                                        aria-label={`${s.displayName} のプロフィール`}
                                        style={{
                                            width: 44,
                                            height: 44,
                                            display: "flex",
                                            alignItems: "center",
                                            justifyContent: "center",
                                            marginLeft: i === 0 ? 0 : -12,
                                            position: "relative",
                                            zIndex: 5 - i,
                                        }}
                                    >
                                        <span
                                            style={{
                                                width: 36,
                                                height: 36,
                                                borderRadius: "50%",
                                                overflow: "hidden",
                                                border: `2px solid ${VP.bg}`,
                                                background: VP.surface2,
                                                display: "flex",
                                                alignItems: "center",
                                                justifyContent: "center",
                                            }}
                                        >
                                            {s.avatarUrl ? (
                                                <Image src={s.avatarUrl} alt="" width={36} height={36} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                                            ) : (
                                                <span style={{ fontSize: 12, fontWeight: 900, color: VP.neonSoft, fontFamily: VP_MONO_FONT }}>
                                                    {s.displayName.slice(0, 1).toUpperCase()}
                                                </span>
                                            )}
                                        </span>
                                    </Link>
                                ))}
                                <p style={{ margin: "0 0 0 6px", fontSize: 11, color: VP.sub }}>
                                    {bondCount > 5 ? `ほか ${(bondCount - 5).toLocaleString()}人が応援中` : "が応援中"}
                                </p>
                            </div>
                        ) : null}
                        <BondAudience bondCount={bondCount} isBonded={initialBonded} accent={VP.neon} />
                    </div>
                </Expandable>
            </div>
        </motion.section>
    );
}
