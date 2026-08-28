"use client";

// components/career/CareerShowcase.tsx
// キャリアプロフィール共通ビューア（Skills前面型）。
// ダッシュボード Profile と 公開プロフィール Career の両方で使う単一ソース。
// デザインは lib/design/tokens.ts（design-system/MASTER.md）に従う:
//   - mono マイクロラベル / FONT 系 / 4px グリッド / INTERACTION カードレシピ
//   - スキルはメッセージの主役（レベル進行バー + ハイライト金）
//   - 全アニメーションは useReducedMotion でフォールバック
// カスタムテーマ（ダッシュボード / 公開プロフィール）は palette で注入する。

import { useReducedMotion, motion } from "framer-motion";
import type { CareerStat, CareerEpisode, CareerSkill } from "@/lib/supabase/career-profiles";
import { FONT, COLOR, INTERACTION } from "@/lib/design/tokens";
import { IconTrophy, IconCheck } from "@/lib/design/icons";

export interface CareerShowcasePalette {
    surface: string;
    border: string;
    text: string;
    sub: string;
    roleColor: string;
}

interface CareerShowcaseProps {
    roleColor: string;
    palette: CareerShowcasePalette;
    stats?: CareerStat[];
    episodes?: CareerEpisode[];
    skills?: CareerSkill[];
    maxSkills?: number;
}

const label = (color: string): React.CSSProperties => ({
    margin: "0 0 12px",
    fontSize: 10,
    fontWeight: 800,
    letterSpacing: "0.22em",
    textTransform: "uppercase",
    color,
    fontFamily: FONT.mono,
});

function statColor(color: CareerStat["color"], roleColor: string): string {
    if (color === "gold") return COLOR.gold;
    if (color === "role") return roleColor;
    return "inherit";
}

export function CareerShowcase({
    roleColor,
    palette,
    stats = [],
    episodes = [],
    skills = [],
    maxSkills = 8,
}: CareerShowcaseProps) {
    const reduce = useReducedMotion();
    const p = palette;
    const cardEnter = INTERACTION.transition.cardEnter;
    const transReduced = INTERACTION.transition.reduced;

    const visibleStats = stats.filter((s) => s?.label || s?.value);
    const visibleSkills = skills.slice(0, maxSkills);

    return (
        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
            {visibleStats.length > 0 ? (
                <section aria-label="ハイライト">
                    <p style={{ ...label(p.sub), color: `${roleColor}dd` }}>
                        <IconTrophy size={12} style={{ verticalAlign: "-2px", marginRight: 6 }} />
                        Highlights
                    </p>
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: 10 }}>
                        {visibleStats.map((stat, index) => (
                            <motion.div
                                key={`${stat.label}-${index}`}
                                initial={reduce ? false : { opacity: 0, y: 8 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={reduce ? transReduced : { ...cardEnter, delay: index * 0.04 }}
                                style={{
                                    borderRadius: INTERACTION.radius.card,
                                    border: `1px solid ${p.border}`,
                                    background: p.surface,
                                    boxShadow: INTERACTION.hover.shadow.rest,
                                    padding: "16px 18px",
                                    position: "relative",
                                    overflow: "hidden",
                                }}
                            >
                                {index === 0 ? (
                                    <span
                                        aria-hidden
                                        style={{ position: "absolute", top: 0, left: 0, right: 0, height: 2, background: `linear-gradient(90deg, ${roleColor}, transparent 80%)` }}
                                    />
                                ) : null}
                                <p style={{ margin: "0 0 8px", fontSize: 9, letterSpacing: "0.16em", textTransform: "uppercase", color: p.sub, fontFamily: FONT.mono }}>{stat.label}</p>
                                <p style={{ margin: 0, fontSize: 26, fontWeight: 900, lineHeight: 1, color: statColor(stat.color, roleColor), fontVariantNumeric: "tabular-nums" }}>
                                    {stat.value || "-"}
                                </p>
                            </motion.div>
                        ))}
                    </div>
                </section>
            ) : null}

            {episodes.length > 0 ? (
                <section aria-label="キャリア履歴">
                    <p style={label(p.sub)}>Career History</p>
                    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                        {episodes.map((ep, i) => (
                            <motion.div
                                key={ep.id ?? i}
                                initial={reduce ? false : { opacity: 0, x: -8 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={reduce ? transReduced : { ...cardEnter, delay: i * 0.04 }}
                                style={{ display: "flex", gap: 12, padding: "14px 16px", borderRadius: INTERACTION.radius.card, border: `1px solid ${p.border}`, background: p.surface }}
                            >
                                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4, flexShrink: 0 }}>
                                    <div style={{ width: 22, height: 22, borderRadius: "50%", background: `${roleColor}18`, border: `1px solid ${roleColor}30`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 9, fontWeight: 900, color: roleColor, fontFamily: FONT.mono }}>
                                        {i + 1}
                                    </div>
                                    {i < episodes.length - 1 ? <div style={{ width: 1, flex: 1, background: p.border }} /> : null}
                                </div>
                                <div style={{ flex: 1, minWidth: 0 }}>
                                    <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 3 }}>
                                        <p style={{ margin: 0, fontSize: 13, fontWeight: 800, color: p.text }}>{ep.role}</p>
                                        {ep.isCurrent ? <span style={{ fontSize: 8, padding: "1px 6px", borderRadius: 999, background: `${roleColor}18`, color: roleColor, letterSpacing: "0.1em", fontFamily: FONT.mono }}>NOW</span> : null}
                                    </div>
                                    {ep.org ? <p style={{ margin: "0 0 4px", fontSize: 11, color: p.sub }}>{ep.org} {ep.period ? <span style={{ opacity: 0.7 }}>· {ep.period}</span> : null}</p> : null}
                                    {ep.desc ? <p style={{ margin: "6px 0 0", fontSize: 12, color: p.sub, lineHeight: 1.8, whiteSpace: "pre-wrap" }}>{ep.desc}</p> : null}
                                    {ep.tags?.length ? (
                                        <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginTop: 8 }}>
                                            {ep.tags.map((tag) => (
                                                <span key={tag} style={{ padding: "4px 9px", borderRadius: 999, border: `1px solid ${p.border}`, background: "rgba(255,255,255,0.02)", fontSize: 10, color: p.sub }}>{tag}</span>
                                            ))}
                                        </div>
                                    ) : null}
                                    {ep.milestone ? (
                                        <p style={{ display: "inline-flex", alignItems: "center", gap: 5, fontSize: 11, color: roleColor, margin: "8px 0 0", padding: "4px 9px", borderRadius: 8, background: `${roleColor}0e`, border: `1px solid ${roleColor}20`, fontWeight: 700 }}>
                                            <IconCheck size={11} /> {ep.milestone}
                                        </p>
                                    ) : null}
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </section>
            ) : null}

            {visibleSkills.length > 0 ? (
                <section aria-label="スキル">
                    <p style={{ ...label(p.sub), color: COLOR.gold }}>
                        <IconCheck size={12} style={{ verticalAlign: "-2px", marginRight: 6 }} />
                        Skills
                    </p>
                    <div style={{ display: "grid", gap: 14, gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))" }}>
                        {visibleSkills.map((skill, index) => {
                            const lvl = Math.max(0, Math.min(100, skill.level));
                            return (
                                <motion.div
                                    key={skill.name}
                                    initial={reduce ? false : { opacity: 0, y: 8 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={reduce ? transReduced : { ...cardEnter, delay: index * 0.03 }}
                                    style={{
                                        borderRadius: INTERACTION.radius.card,
                                        border: `1px solid ${skill.isHighlight ? `${roleColor}2e` : p.border}`,
                                        background: skill.isHighlight ? `${roleColor}0a` : p.surface,
                                        padding: "14px 16px",
                                    }}
                                >
                                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 12, marginBottom: 9 }}>
                                        <span style={{ fontSize: 12.5, fontWeight: skill.isHighlight ? 900 : 700, color: skill.isHighlight ? roleColor : p.text }}>
                                            {skill.name}
                                        </span>
                                        <span style={{ fontSize: 11, fontFamily: FONT.mono, color: p.sub, fontVariantNumeric: "tabular-nums" }}>{skill.level}</span>
                                    </div>
                                    <div style={{ height: 6, borderRadius: 999, background: p.border, overflow: "hidden" }}>
                                        <motion.div
                                            initial={reduce ? { width: `${lvl}%` } : { width: 0 }}
                                            animate={{ width: `${lvl}%` }}
                                            transition={reduce ? { duration: 0 } : { duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                                            style={{
                                                height: "100%",
                                                borderRadius: 999,
                                                background: skill.isHighlight
                                                    ? `linear-gradient(90deg, ${COLOR.gold}, rgba(255,214,0,0.4))`
                                                    : `linear-gradient(90deg, ${roleColor}, ${roleColor}40)`,
                                            }}
                                        />
                                    </div>
                                </motion.div>
                            );
                        })}
                    </div>
                </section>
            ) : null}
        </div>
    );
}
