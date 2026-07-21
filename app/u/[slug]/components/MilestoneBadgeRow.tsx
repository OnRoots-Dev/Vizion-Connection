// app/u/[slug]/components/MilestoneBadgeRow.tsx
// ③ マイルストーンバッジ — portfolio_milestones の達成状況。
// variant="compact": 常時表示用の帯（達成サマリー＋バッジアイコン列）＋「詳細」展開で進捗グリッド
// variant="full":    ポートフォリオ用（グリッドを常時展開）
// 達成済みはネオン発光＋チェックマーク（形状でも区別 = 色覚多様性対応）＋初回シャインスイープ。
"use client";

import { motion, useReducedMotion } from "framer-motion";
import { MOTION, INTERACTION } from "@/lib/design/tokens";
import { IconBond, IconCheck, IconCheer, IconJourney, IconStreak } from "@/lib/design/icons";
import { VP, VP_DISPLAY_FONT, VP_MONO_FONT, vpSectionTitle } from "../profile-theme";
import Expandable from "./Expandable";

export type MilestoneRecord = {
    id: string;
    milestoneType: string;
    achievedAt: string;
};

export type MilestoneProgress = {
    cheerCount: number;
    streakDays: number;
    journeyCount: number;
    bondCount: number;
};

type BadgeDef = {
    type: string;
    label: string;
    labelJa: string;
    target: number;
    current: (p: MilestoneProgress) => number;
    icon: (size: number) => React.ReactNode;
};

// アイコンは lib/design/icons.tsx の辞書に従う（Cheer=星 / Streak=炎 / Journey=レイヤー / Bond=⊹スパーク）
const BADGES: BadgeDef[] = [
    {
        type: "cheers_received_100",
        label: "CHEER 100",
        labelJa: "Cheer 100回",
        target: 100,
        current: (p) => p.cheerCount,
        icon: (size) => <IconCheer size={size} />,
    },
    {
        type: "journey_streak_30",
        label: "STREAK 30",
        labelJa: "30日継続",
        target: 30,
        current: (p) => p.streakDays,
        icon: (size) => <IconStreak size={size} />,
    },
    {
        type: "journeys_posted_50",
        label: "JOURNEY 50",
        labelJa: "記録 50件",
        target: 50,
        current: (p) => p.journeyCount,
        icon: (size) => <IconJourney size={size} />,
    },
    {
        type: "bond_50",
        label: "BOND 50",
        labelJa: "Bond 50人",
        target: 50,
        current: (p) => p.bondCount,
        icon: (size) => <IconBond size={size} />,
    },
];

function achievedDateLabel(iso: string): string {
    return new Intl.DateTimeFormat("ja-JP", { timeZone: "Asia/Tokyo", year: "numeric", month: "short", day: "numeric" }).format(new Date(iso));
}

// 達成バッジのアイコン円（チェックマーク重ね＋シャインスイープ付き）
function BadgeIcon({
    def,
    achieved,
    size = 44,
}: {
    def: BadgeDef;
    achieved: boolean;
    size?: number;
}) {
    const reduceMotion = useReducedMotion();
    return (
        <span
            style={{
                position: "relative",
                width: size,
                height: size,
                borderRadius: "50%",
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                color: achieved ? VP.neon : VP.faint,
                background: achieved ? "rgba(200,232,0,0.12)" : "rgba(255,255,255,0.04)",
                border: `1px solid ${achieved ? VP.neonBorder : VP.border}`,
                boxShadow: achieved ? VP.glowStrong : "none",
                overflow: "hidden",
                flexShrink: 0,
            }}
        >
            {def.icon(Math.round(size * 0.5))}
            {/* 達成の形状識別 — チェックマークバッジ */}
            {achieved ? (
                <span
                    style={{
                        position: "absolute",
                        right: -1,
                        bottom: -1,
                        width: Math.round(size * 0.42),
                        height: Math.round(size * 0.42),
                        borderRadius: "50%",
                        background: VP.neon,
                        color: "#0A0C10",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        border: `2px solid ${VP.bg}`,
                    }}
                    aria-hidden
                >
                    <IconCheck size={Math.round(size * 0.24)} />
                </span>
            ) : null}
            {/* 初回ビューのシャインスイープ（達成済みのみ） */}
            {achieved && !reduceMotion ? (
                <motion.span
                    aria-hidden
                    initial={{ x: "-150%" }}
                    whileInView={{ x: "150%" }}
                    viewport={{ once: true, margin: "-30px" }}
                    transition={{ duration: 0.9, delay: 0.5, ease: "easeInOut" }}
                    style={{
                        position: "absolute",
                        inset: 0,
                        background: "linear-gradient(115deg, transparent 30%, rgba(255,255,255,0.45) 50%, transparent 70%)",
                    }}
                />
            ) : null}
        </span>
    );
}

function BadgeGrid({
    milestones,
    progress,
}: {
    milestones: MilestoneRecord[];
    progress: MilestoneProgress;
}) {
    const reduceMotion = useReducedMotion();
    const achievedMap = new Map(milestones.map((m) => [m.milestoneType, m]));

    return (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: 8 }}>
            {BADGES.map((badge, index) => {
                const achieved = achievedMap.get(badge.type);
                const current = Math.min(badge.current(progress), badge.target);
                const ratio = badge.target > 0 ? current / badge.target : 0;
                return (
                    <motion.div
                        key={badge.type}
                        initial={reduceMotion ? false : { opacity: 0, y: 20, scale: 0.9 }}
                        whileInView={{ opacity: 1, y: 0, scale: 1 }}
                        viewport={{ once: true, margin: "-30px" }}
                        transition={{ ...MOTION.pop, delay: reduceMotion ? 0 : index * 0.05 }}
                        style={{
                            position: "relative",
                            padding: "16px 12px",
                            borderRadius: INTERACTION.radius.card,
                            textAlign: "center",
                            background: achieved ? VP.neonFaint : "rgba(255,255,255,0.02)",
                            border: `1px solid ${achieved ? VP.neonBorder : VP.border}`,
                            boxShadow: achieved ? VP.glow : INTERACTION.hover.shadow.rest,
                        }}
                    >
                        <div style={{ display: "flex", justifyContent: "center", marginBottom: 8 }}>
                            <BadgeIcon def={badge} achieved={Boolean(achieved)} />
                        </div>
                        <p
                            style={{
                                margin: 0,
                                fontSize: 15,
                                letterSpacing: "0.08em",
                                fontFamily: VP_DISPLAY_FONT,
                                color: achieved ? VP.neon : "rgba(255,255,255,0.75)",
                                textShadow: achieved ? VP.textGlow : "none",
                            }}
                        >
                            {badge.label}
                        </p>
                        <p style={{ margin: "2px 0 0", fontSize: 10, color: VP.sub }}>{badge.labelJa}</p>

                        {achieved ? (
                            <p style={{ margin: "8px 0 0", fontSize: 9, letterSpacing: "0.12em", color: VP.neonSoft, fontFamily: VP_MONO_FONT }}>
                                {achievedDateLabel(achieved.achievedAt)} 達成
                            </p>
                        ) : (
                            <div style={{ marginTop: 8 }}>
                                <div
                                    role="progressbar"
                                    aria-valuemin={0}
                                    aria-valuemax={badge.target}
                                    aria-valuenow={current}
                                    aria-label={`${badge.labelJa} の進捗`}
                                    style={{ height: 4, borderRadius: 999, background: "rgba(255,255,255,0.08)", overflow: "hidden" }}
                                >
                                    <motion.div
                                        initial={reduceMotion ? false : { scaleX: 0 }}
                                        whileInView={{ scaleX: 1 }}
                                        viewport={{ once: true }}
                                        transition={{ ...MOTION.slide, delay: reduceMotion ? 0 : 0.15 + index * 0.05 }}
                                        style={{
                                            width: `${Math.round(ratio * 100)}%`,
                                            height: "100%",
                                            borderRadius: 999,
                                            transformOrigin: "left",
                                            background: `linear-gradient(90deg, ${VP.neon}, rgba(200,232,0,0.35))`,
                                        }}
                                    />
                                </div>
                                <p style={{ margin: "6px 0 0", fontSize: 10, color: VP.faint, fontFamily: VP_MONO_FONT, fontVariantNumeric: "tabular-nums" }}>
                                    {current.toLocaleString()} / {badge.target.toLocaleString()}
                                </p>
                            </div>
                        )}
                    </motion.div>
                );
            })}
        </div>
    );
}

export default function MilestoneBadgeRow({
    milestones,
    progress,
    variant = "full",
}: {
    milestones: MilestoneRecord[];
    progress: MilestoneProgress;
    variant?: "compact" | "full";
}) {
    const achievedCount = new Set(milestones.map((m) => m.milestoneType)).size;

    if (variant === "full") {
        return (
            <section aria-label="マイルストーン">
                <h2 style={vpSectionTitle}>Milestones</h2>
                <BadgeGrid milestones={milestones} progress={progress} />
            </section>
        );
    }

    // compact: バッジアイコン帯は常時表示（preview）、進捗グリッドは展開で開示
    const achievedTypes = new Set(milestones.map((m) => m.milestoneType));
    return (
        <Expandable
            title="Milestones"
            summary={`${achievedCount} / ${BADGES.length} 達成`}
            preview={
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }} aria-hidden>
                    {BADGES.map((badge) => (
                        <BadgeIcon key={badge.type} def={badge} achieved={achievedTypes.has(badge.type)} size={36} />
                    ))}
                </div>
            }
        >
            <BadgeGrid milestones={milestones} progress={progress} />
        </Expandable>
    );
}
