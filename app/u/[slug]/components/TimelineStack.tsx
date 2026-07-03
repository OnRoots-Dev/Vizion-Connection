// app/u/[slug]/components/TimelineStack.tsx
// ⑤ タイムライン — Journey記録の履歴を「積み重ね」として見せる。
// ネオンの縦ラインに沿ってカードがスプリングで順次入場する。
// mode="preview": プロフィール用の直近ダイジェスト（月見出しなし・全件リンク付き）
// mode="full":    ポートフォリオ用の全履歴（月見出し＋DAY 0 起点ノード）
"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { MOTION } from "@/lib/design/tokens";
import { IconArrowRight, IconCheer } from "@/lib/design/icons";
import { VP, VP_DISPLAY_FONT, VP_MONO_FONT, vpSectionTitle } from "../profile-theme";

export type TimelineEntry = {
    id: string;
    content: string;
    conditionScore: number | null;
    imageUrl: string | null;
    videoUrl: string | null;
    tags: string[] | null;
    cheerCount: number;
    createdAt: string;
    dayNo: number | null;
};

const CONDITION_COLOR: Record<number, string> = { 1: "#FF5050", 2: "#FF8A3C", 3: "#FFC81E", 4: "#7FD15B", 5: "#32D278" };

function formatJa(iso: string): string {
    return new Intl.DateTimeFormat("ja-JP", { timeZone: "Asia/Tokyo", month: "2-digit", day: "2-digit" }).format(new Date(iso));
}
function monthLabel(iso: string): string {
    return new Intl.DateTimeFormat("ja-JP", { timeZone: "Asia/Tokyo", year: "numeric", month: "long" }).format(new Date(iso));
}
function fullDate(iso: string): string {
    return new Intl.DateTimeFormat("ja-JP", { timeZone: "Asia/Tokyo", year: "numeric", month: "long", day: "numeric" }).format(new Date(iso));
}

function EntryCard({ entry, index, compact }: { entry: TimelineEntry; index: number; compact: boolean }) {
    const reduceMotion = useReducedMotion();
    const condColor = entry.conditionScore ? CONDITION_COLOR[entry.conditionScore] ?? VP.neon : "rgba(255,255,255,0.2)";
    return (
        <div style={{ position: "relative", paddingLeft: 34, paddingBottom: compact ? 12 : 16 }}>
            {/* ノード — コンディションは色＋数値の両方で識別（色覚多様性対応） */}
            <span
                role={entry.conditionScore ? "img" : undefined}
                aria-label={entry.conditionScore ? `コンディション ${entry.conditionScore}/5` : undefined}
                aria-hidden={entry.conditionScore ? undefined : true}
                title={entry.conditionScore ? `コンディション ${entry.conditionScore}/5` : undefined}
                style={{
                    position: "absolute",
                    left: 4,
                    top: 8,
                    width: 16,
                    height: 16,
                    borderRadius: "50%",
                    background: condColor,
                    border: `2px solid ${VP.bg}`,
                    boxShadow: `0 0 0 4px ${condColor}22, 0 0 12px ${condColor}66`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 9,
                    fontWeight: 900,
                    color: "#0A0C10",
                    fontFamily: VP_MONO_FONT,
                    lineHeight: 1,
                }}
            >
                {entry.conditionScore ?? ""}
            </span>
            <motion.div
                initial={reduceMotion ? false : { opacity: 0, y: 22, scale: 0.97 }}
                whileInView={{ opacity: 1, y: 0, scale: 1 }}
                viewport={{ once: true, margin: "-20px" }}
                transition={{ ...MOTION.pop, delay: reduceMotion ? 0 : (index % 4) * 0.05 }}
                style={{
                    position: "relative",
                    borderRadius: 14,
                    border: `1px solid ${VP.border}`,
                    background: "rgba(255,255,255,0.02)",
                    padding: compact ? 12 : 14,
                    overflow: "hidden",
                }}
            >
                <span aria-hidden style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: 3, background: condColor, opacity: 0.85 }} />
                <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap", marginBottom: 8 }}>
                    {entry.dayNo !== null ? (
                        <span style={{ fontFamily: VP_DISPLAY_FONT, fontSize: 16, letterSpacing: "0.06em", color: VP.neon, textShadow: VP.textGlow }}>
                            DAY {entry.dayNo}
                        </span>
                    ) : null}
                    <span style={{ fontFamily: VP_MONO_FONT, fontSize: 11, color: VP.faint }}>{formatJa(entry.createdAt)}</span>
                    {entry.cheerCount > 0 ? (
                        <span style={{ display: "inline-flex", alignItems: "center", gap: 3, fontSize: 11, color: VP.gold, fontWeight: 800 }} aria-label={`Cheer ${entry.cheerCount}件`}>
                            <IconCheer size={11} />
                            {entry.cheerCount}
                        </span>
                    ) : null}
                </div>

                <p
                    style={{
                        margin: 0,
                        fontSize: 13,
                        color: "rgba(255,255,255,0.88)",
                        lineHeight: 1.8,
                        whiteSpace: "pre-wrap",
                        ...(compact
                            ? { display: "-webkit-box", WebkitLineClamp: 3, WebkitBoxOrient: "vertical" as const, overflow: "hidden" }
                            : {}),
                    }}
                >
                    {entry.content}
                </p>

                {!compact && entry.imageUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={entry.imageUrl} alt="活動画像" loading="lazy" style={{ marginTop: 10, width: "100%", maxWidth: 360, borderRadius: 10, border: `1px solid ${VP.border}` }} />
                ) : null}
                {!compact && entry.videoUrl ? (
                    <video src={entry.videoUrl} controls style={{ marginTop: 10, width: "100%", maxWidth: 360, borderRadius: 10, border: `1px solid ${VP.border}` }} />
                ) : null}

                {entry.tags?.length ? (
                    <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginTop: 10 }}>
                        {entry.tags.map((tag) => (
                            <span key={tag} style={{ padding: "3px 8px", borderRadius: 999, border: `1px solid ${VP.border}`, background: "rgba(255,255,255,0.03)", color: VP.sub, fontSize: 10, fontWeight: 700 }}>
                                {tag}
                            </span>
                        ))}
                    </div>
                ) : null}
            </motion.div>
        </div>
    );
}

export default function TimelineStack({
    entries,
    mode,
    day0,
    viewAllHref,
    title = "Timeline",
}: {
    entries: TimelineEntry[];
    mode: "preview" | "full";
    day0?: { date: string | null; declaration: string | null };
    viewAllHref?: string;
    title?: string;
}) {
    const compact = mode === "preview";

    return (
        <section aria-label="活動タイムライン">
            <h2 style={vpSectionTitle}>{title}</h2>

            {entries.length === 0 ? (
                <div style={{ borderRadius: 16, border: `1px solid ${VP.border}`, background: "rgba(255,255,255,0.02)", padding: "28px 16px", textAlign: "center" }}>
                    <p style={{ margin: 0, fontSize: 13, color: VP.sub, lineHeight: 1.8 }}>まだ公開された活動記録がありません。</p>
                </div>
            ) : (
                <div style={{ position: "relative" }}>
                    {/* ネオンの縦ライン */}
                    <span
                        aria-hidden
                        style={{
                            position: "absolute",
                            left: 11,
                            top: 8,
                            bottom: 8,
                            width: 2,
                            background: `linear-gradient(${VP.neon}88, ${VP.neon}22 70%, rgba(255,255,255,0.08))`,
                        }}
                    />

                    {entries.map((entry, idx) => {
                        const prevIso = idx > 0 ? entries[idx - 1].createdAt : null;
                        const showMonth = mode === "full" && (!prevIso || monthLabel(prevIso) !== monthLabel(entry.createdAt));
                        return (
                            <div key={entry.id}>
                                {showMonth ? (
                                    <div style={{ paddingLeft: 34, margin: "6px 0 10px" }}>
                                        <span style={{ fontFamily: VP_MONO_FONT, fontSize: 11, fontWeight: 900, letterSpacing: "0.1em", color: VP.faint, textTransform: "uppercase" }}>
                                            {monthLabel(entry.createdAt)}
                                        </span>
                                    </div>
                                ) : null}
                                <EntryCard entry={entry} index={idx} compact={compact} />
                            </div>
                        );
                    })}

                    {/* DAY 0 起点ノード（full時のみ） */}
                    {mode === "full" ? (
                        <div style={{ position: "relative", paddingLeft: 34, paddingTop: 4 }}>
                            <span
                                aria-hidden
                                style={{
                                    position: "absolute",
                                    left: 2,
                                    top: 6,
                                    width: 20,
                                    height: 20,
                                    borderRadius: "50%",
                                    background: `radial-gradient(circle, ${VP.neonSoft}, ${VP.neon})`,
                                    border: `2px solid ${VP.bg}`,
                                    boxShadow: VP.glowStrong,
                                }}
                            />
                            <div style={{ borderRadius: 14, border: `1px solid ${VP.neonBorder}`, background: `linear-gradient(160deg, ${VP.neonFaint}, rgba(255,255,255,0.02))`, padding: 14 }}>
                                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: day0?.date || day0?.declaration ? 6 : 0, flexWrap: "wrap" }}>
                                    <span style={{ fontFamily: VP_DISPLAY_FONT, fontSize: 20, letterSpacing: "0.04em", color: VP.neon, textShadow: VP.textGlow }}>DAY 0</span>
                                    <span style={{ fontSize: 11, fontWeight: 800, color: VP.text }}>はじまりの記録</span>
                                    {day0?.date ? <span style={{ fontFamily: VP_MONO_FONT, fontSize: 10, color: VP.faint }}>{fullDate(day0.date)}</span> : null}
                                </div>
                                {day0?.declaration ? (
                                    <p style={{ margin: 0, fontSize: 13, color: "rgba(255,255,255,0.88)", lineHeight: 1.8, whiteSpace: "pre-wrap" }}>「{day0.declaration}」</p>
                                ) : (
                                    <p style={{ margin: 0, fontSize: 12, color: VP.sub, lineHeight: 1.7 }}>挑戦の原点。ここから全ての軌跡が始まります。</p>
                                )}
                            </div>
                        </div>
                    ) : null}
                </div>
            )}

            {mode === "preview" && viewAllHref ? (
                <Link
                    href={viewAllHref}
                    style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: 8,
                        marginTop: 4,
                        padding: "13px 16px",
                        minHeight: 44,
                        borderRadius: 14,
                        border: `1px solid ${VP.neonBorder}`,
                        background: VP.neonFaint,
                        color: VP.neonSoft,
                        fontSize: 12,
                        fontWeight: 800,
                        letterSpacing: "0.08em",
                        cursor: "pointer",
                    }}
                >
                    全ての軌跡を見る
                    <IconArrowRight size={12} />
                </Link>
            ) : null}
        </section>
    );
}
