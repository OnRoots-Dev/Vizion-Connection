"use client";

// dashboard/views/HomeView.tsx
// WORLD ENTRANCE — 自分の管理画面ではなく「世界で今何が起きているか」を最前面に出す。
// 情報階層（上→下）:
//   1. AROUND YOU          … 地域 + 集計値 + 今起きていること
//   2. MOMENTS · JUST NOW  … 世界のMoment 横スクロール
//   3. NEARBY · VIZ MAP    … Map プレビュー（Viz Map への導線）
//   4. PROFILE CARD        … 自分の実績・紹介（控えめ）
//   5. YOUR WORLD · LIVE   … Cheer / Connection / Together の通知サマリー
//   6. YOUR ACTIVITY       … 自分の次の予定（控えめ）
//   7. JOURNEY · THIS WEEK … 週間進捗バー（控えめ）
// 既存コンポーネント・API を最大限再利用し、機能は追加しない。

import { useCallback, useEffect, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import type { ProfileData } from "@/features/profile/types";
import type { DashboardView, ThemeColors } from "@/app/(app)/dashboard/types";
import { ProfileCardSection } from "@/app/(app)/dashboard/components/ProfileCard";
import { LiveInfoCard, type LiveInfoItem } from "../components/LiveInfoCard";
import { MomentCard } from "../components/core/MomentCard";
import type { MomentFeedItem } from "@/features/moment/types";
import type { ConnectionListItem } from "@/features/connection/types";
import { apiGet } from "@/lib/api/core-client";
import { LiveWorldCarousel } from "../components/LiveWorldCarousel";

const SECTION_LABEL: React.CSSProperties = {
    margin: 0,
    fontFamily: "'Space Mono', monospace",
    fontSize: 9,
    fontWeight: 700,
    letterSpacing: "0.2em",
    textTransform: "uppercase",
    color: "rgba(255,255,255,0.32)",
};

const ACCENT = "#C8E800";

const ROLE_RETURN: Record<string, { label: string; reason: string }> = {
    Athlete: { label: "ATHLETE", reason: "明日もActivityを重ねると、JOURNEYが伸び、誰かのCheerが届きます。" },
    Trainer: { label: "TRAINER", reason: "選手のActivityが増えると、あなたの指導が地図とタイムラインに現れます。" },
    Crew: { label: "CREW", reason: "推しのMomentが増えるたび、CheerとTogetherで参加できます。" },
    Business: { label: "BUSINESS", reason: "街のActivityが増えるたび、あなたのPresenceが地図で見つけられます。" },
};

export function HomeView({ profile, referralUrl, referralCount, t, roleColor, setView, isDesktop }: {
    profile: ProfileData;
    referralUrl: string;
    referralCount: number;
    t: ThemeColors;
    roleColor: string;
    setView: (v: DashboardView) => void;
    isDesktop: boolean;
}) {
    const reduce = useReducedMotion();
    const region = profile.prefecture || profile.region || "JAPAN";

    // ── 1. AROUND YOU: 世界のMoment（公開 = scope:all） ──
    const [worldMoments, setWorldMoments] = useState<MomentFeedItem[]>([]);
    const [momentsLoading, setMomentsLoading] = useState(true);
    // ── 5. SOCIAL: Cheer / Connection / Together サマリー ──
    const [social, setSocial] = useState<LiveInfoItem[]>([]);
    const [socialLoading, setSocialLoading] = useState(true);
    const [journeyActivities, setJourneyActivities] = useState<{
        status: string; starts_at: string; title: string | null; type: string;
    }[]>([]);

    const goProfile = () => setView("profile");

    const loadWorld = useCallback(async () => {
        setMomentsLoading(true);
        try {
            const data = await apiGet<{ success: boolean; items: MomentFeedItem[] }>("/api/moments?scope=all&limit=12");
            setWorldMoments(data.items ?? []);
        } catch {
            setWorldMoments([]);
        } finally {
            setMomentsLoading(false);
        }
    }, []);

    const loadSocial = useCallback(async () => {
        setSocialLoading(true);
        const items: LiveInfoItem[] = [];
        const fetchJson = async (url: string) => {
            const response = await fetch(url, { cache: "no-store" });
            return response.json() as Promise<unknown>;
        };
        const [cheerResult, connectionResult] = await Promise.allSettled([
            fetchJson("/api/cheer/received"),
            fetchJson("/api/connections"),
        ]);

        if (cheerResult.status === "fulfilled") {
            const cheerJson = cheerResult.value as { cheers?: unknown[]; items?: unknown[] };
            const cheers = cheerJson?.cheers ?? cheerJson?.items ?? [];
            if (Array.isArray(cheers) && cheers.length > 0) {
                const c = cheers[0] as { fromDisplayName?: string };
                items.push({ type: "cheer", text: `${c.fromDisplayName ?? "誰か"}があなたにCheerしました`, href: "/dashboard?view=cheer" });
            }
        }
        if (connectionResult.status === "fulfilled") {
            const connJson = connectionResult.value as { connections?: ConnectionListItem[] };
            const conns = connJson?.connections ?? [];
            const pending = (Array.isArray(conns) ? conns : []).find((c) => c.status === "pending" && c.direction === "incoming");
            if (pending?.counterpart) {
                items.push({ type: "connection", text: `${pending.counterpart.display_name ?? pending.counterpart.slug}からConnection申請が届いています`, href: "/dashboard?view=moments" });
            }
        }
        setSocial(items.slice(0, 3));
        setSocialLoading(false);
    }, []);

    // ── 4/6. YOUR ACTIVITY + JOURNEY: 今週の活動（/api/journey/weekly） ──
    const loadJourney = useCallback(async () => {
        try {
            const data = await apiGet<{ success: boolean; activities?: { status: string; starts_at: string; title: string | null; type: string }[] }>("/api/journey/weekly");
            setJourneyActivities(data.activities ?? []);
        } catch {
            setJourneyActivities([]);
        }
    }, []);

    useEffect(() => {
        void loadWorld();
        void loadSocial();
        void loadJourney();
    }, [loadWorld, loadSocial, loadJourney]);

    const completed = journeyActivities.filter((a) => a.status === "completed").length;
    const total = journeyActivities.length;
    const pct = total > 0 ? Math.round((completed / total) * 100) : 0;

    // 次の予定（未完了で直近のもの）を最優先に
    const upcoming = journeyActivities
        .filter((a) => a.status !== "cancelled")
        .sort((a, b) => new Date(a.starts_at).getTime() - new Date(b.starts_at).getTime())
        .slice(0, 2);

    const right: React.CSSProperties | undefined = isDesktop ? { gridColumn: 2 } : undefined;
    const rail: React.CSSProperties | undefined = isDesktop ? { gridColumn: 1, gridRow: "1 / span 6" } : undefined;

    const isDay0 = total === 0 && !momentsLoading && journeyActivities.length === 0;
    return (
        <div style={{ display: "grid", gap: 20, alignItems: "start", gridTemplateColumns: isDesktop ? "minmax(240px, 268px) minmax(0, 1fr)" : "minmax(0, 1fr)" }}>
            {isDay0 ? (
                <section aria-label="DAY 0" style={{ gridColumn: isDesktop ? "1 / span 2" : undefined, borderRadius: 16, border: `1px solid ${roleColor}28`, background: `linear-gradient(135deg, ${roleColor}12, #111118)`, padding: "16px 18px", display: "flex", flexWrap: "wrap", gap: 14, alignItems: "center" }}>
                    <div style={{ flex: 1, minWidth: 220 }}>
                        <p style={{ margin: 0, fontFamily: "'Space Mono', monospace", fontSize: 9, letterSpacing: "0.2em", textTransform: "uppercase", color: roleColor, fontWeight: 800 }}>DAY 0 — Vizionに入った</p>
                        <p style={{ margin: "6px 0 0", fontSize: 14, fontWeight: 900, color: "#f0f0f5", lineHeight: 1.4 }}>Identity → Place → First Activity</p>
                        <p style={{ margin: "6px 0 0", fontSize: 12, color: "rgba(255,255,255,0.55)", lineHeight: 1.7 }}>アカウントを作ったのではなく、世界に入りました。まずは<span style={{ color: "#f0f0f5", fontWeight: 700 }}>場所</span>を選んで<span style={{ color: roleColor, fontWeight: 800 }}>最初のActivity</span>を記録しましょう。それが地図とプロフィールに現れます。</p>
                    </div>
                    <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                        <button type="button" onClick={() => setView("activities")} style={{ background: roleColor, color: "#0B0B0F", border: "none", borderRadius: 10, padding: "11px 16px", fontSize: 12, fontWeight: 900, cursor: "pointer" }}>最初のActivityをつくる →</button>
                        <button type="button" onClick={() => setView("viz_map")} style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.12)", color: "#f0f0f5", borderRadius: 10, padding: "11px 14px", fontSize: 12, fontWeight: 700, cursor: "pointer" }}>Viz Mapで場所を見る</button>
                    </div>
                </section>
            ) : null}
            {/* ═══ 1. AROUND YOU ═══ */}
            <section aria-label="Around you" style={{ display: "flex", flexDirection: "column", gap: 12, ...right }}>
                <motion.div initial={reduce ? { opacity: 1 } : { opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke={ACCENT} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                            <circle cx="12" cy="10" r="3" />
                        </svg>
                        <p style={SECTION_LABEL}>AROUND YOU</p>
                        <span style={{ fontSize: 9, fontWeight: 600, letterSpacing: "0.12em", fontFamily: "'Space Mono', monospace", color: "rgba(255,255,255,0.35)", textTransform: "uppercase", marginLeft: "auto" }}>{region}</span>
                    </div>
                </motion.div>

                {/* Activity summary - narrative, not KPI cards */}
                <motion.div initial={reduce ? { opacity: 1 } : { opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.05 }}
                    style={{ background: "#111118", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 14, padding: "14px 16px" }}>
                    <p style={{ margin: 0, fontSize: 13, lineHeight: 1.8, color: "rgba(255,255,255,0.65)" }}>
                        {worldMoments.length > 0 && (
                            <span>世界で{worldMoments.length}件のMomentが共有されています</span>
                        )}
                        {worldMoments.length === 0 && total === 0 && referralCount === 0 && (
                            <span>世界で活動を始めましょう</span>
                        )}
                        {total > 0 && (
                            <span style={{ marginLeft: worldMoments.length > 0 ? 8 : 0 }}>
                                今週は{total}件の予定
                            </span>
                        )}
                        {referralCount > 0 && (
                            <span style={{ marginLeft: (worldMoments.length > 0 || total > 0) ? 8 : 0 }}>
                                {referralCount}人の招待者
                            </span>
                        )}
                    </p>
                </motion.div>

                {/* 今起きていること（Live Rotation） */}
                <RegionActivityCardNative profile={profile} region={region} />
            </section>

            {/* ═══ 2. MOMENTS ═══（世界のMoment 横スクロール） */}
            <section aria-label="Moments" style={{ display: "flex", flexDirection: "column", gap: 10, ...right }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <p style={{ ...SECTION_LABEL, color: "rgba(255,255,255,0.4)" }}>MOMENTS · JUST NOW</p>
                    <button type="button" onClick={() => setView("moments")} style={{ marginLeft: "auto", background: "none", border: "none", cursor: "pointer", fontSize: 10, fontWeight: 800, letterSpacing: "0.08em", color: ACCENT, textTransform: "uppercase" }}>見る →</button>
                </div>
                {momentsLoading ? (
                    <div style={{ display: "flex", gap: 12, overflow: "hidden" }}>
                        {[0, 1, 2].map((i) => (
                            <div key={i} style={{ width: 300, flexShrink: 0, height: 190, borderRadius: 16, background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }} />
                        ))}
                    </div>
                ) : worldMoments.length === 0 ? (
                    <p style={{ margin: 0, fontSize: 12, color: "rgba(255,255,255,0.45)", padding: "12px 2px" }}>世界で共有されたMomentがまだありません。あなたのActivityから最初の1件を投稿してみましょう。</p>
                ) : (
                    <div style={{ display: "flex", gap: 12, overflowX: "auto", paddingBottom: 4, scrollbarWidth: "thin" }}>
                        {worldMoments.map((item) => {
                            const isNew = (() => {
                                try {
                                    const d = new Date(item.moment.created_at).getTime();
                                    return Date.now() - d < 24 * 60 * 60 * 1000;
                                } catch { return false; }
                            })();
                            return (
                                <div key={item.moment.id} style={{ width: 300, flexShrink: 0, position: "relative" }}>
                                    {isNew ? <span style={{ position: "absolute", top: 8, right: 8, zIndex: 2, fontSize: 9, fontWeight: 900, letterSpacing: "0.08em", background: "#C8E800", color: "#0B0B0F", borderRadius: 999, padding: "3px 7px" }}>NEW</span> : null}
                                    <MomentCard item={item} viewerId={Number(profile.id) || null} roleColor={roleColor} t={t} />
                                </div>
                            );
                        })}
                    </div>
                )}
            </section>

            {/* ═══ 3. YOUR ACTIVITY (retention: yesterday→today) ═══ */}
            <section aria-label="Your activity" style={{ display: "flex", flexDirection: "column", gap: 10, ...right }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <p style={{ ...SECTION_LABEL, color: "rgba(255,255,255,0.4)" }}>YOUR ACTIVITY</p>
                    <button type="button" onClick={() => setView("activities")} style={{ marginLeft: "auto", background: "none", border: "none", cursor: "pointer", fontSize: 10, fontWeight: 800, letterSpacing: "0.08em", color: ACCENT, textTransform: "uppercase" }}>全て →</button>
                </div>
                {upcoming.length > 0 ? (
                    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                        {upcoming.map((a, i) => (
                            <button key={i} type="button" onClick={() => setView("activities")} style={{ display: "flex", alignItems: "center", gap: 12, background: "#111118", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 12, padding: "10px 14px", cursor: "pointer", textAlign: "left", color: "#f0f0f5" }}>
                                <span style={{ fontSize: 16, fontWeight: 800, color: roleColor, fontVariantNumeric: "tabular-nums", minWidth: 26 }}>
                                    {new Date(a.starts_at).getDate()}
                                </span>
                                <span style={{ flex: 1, fontSize: 13, fontWeight: 700, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                                    {a.title ?? a.type}
                                </span>
                                <span style={{ fontSize: 9, fontWeight: 800, letterSpacing: "0.08em", color: a.status === "planned" ? "rgba(255,255,255,0.4)" : ACCENT, textTransform: "uppercase" }}>{a.status}</span>
                            </button>
                        ))}
                    </div>
                ) : (
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, background: "#111118", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 12, padding: "12px 14px" }}>
                        <p style={{ margin: 0, fontSize: 12, color: "rgba(255,255,255,0.45)", lineHeight: 1.6 }}>まだ予定がありません。地図で近くのActivityを見つけましょう</p>
                        <button type="button" onClick={() => setView("viz_map")} style={{ flexShrink: 0, background: ACCENT, color: "#0B0B0F", border: "none", borderRadius: 10, padding: "8px 12px", fontSize: 11, fontWeight: 800, cursor: "pointer" }}>地図で探す</button>
                    </div>
                )}
            </section>

            {/* ═══ 4. YOUR WORLD · LIVE (PEOPLE) ═══ */}
            <section aria-label="Social" style={{ display: "flex", flexDirection: "column", gap: 10, ...right }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <p style={{ ...SECTION_LABEL, color: "rgba(255,255,255,0.4)" }}>YOUR WORLD · LIVE</p>
                    <button type="button" onClick={() => setView("moments")} style={{ marginLeft: "auto", background: "none", border: "none", cursor: "pointer", fontSize: 10, fontWeight: 800, letterSpacing: "0.08em", color: ACCENT, textTransform: "uppercase" }}>繋がる →</button>
                </div>
                {socialLoading ? (
                    <div style={{ height: 200, borderRadius: 20, background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }} />
                ) : social.length > 0 ? (
                    <LiveWorldCarousel items={social} />
                ) : (
                    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 14, textAlign: "center", border: "1px dashed rgba(255,255,255,0.18)", borderRadius: 16, padding: "28px 18px" }}>
                        <div style={{ display: "grid", placeItems: "center", width: 40, height: 40, borderRadius: 12, background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.06)" }}>
                            <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.4)" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
                                <circle cx="12" cy="12" r="10" />
                                <path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
                            </svg>
                        </div>
                        <p style={{ margin: 0, fontSize: 12, color: "rgba(255,255,255,0.45)", lineHeight: 1.7 }}>まだ反応がありません。世界を探索してみましょう</p>
                        <div style={{ display: "flex", gap: 10, flexWrap: "wrap", justifyContent: "center" }}>
                            <button type="button" onClick={() => setView("viz_map")} className="vz-btn" style={{ background: ACCENT, color: "#0B0B0F", border: "none", borderRadius: 10, padding: "9px 14px", fontSize: 11, fontWeight: 800, cursor: "pointer" }}>地図で探す</button>
                            <button type="button" onClick={() => setView("activities")} className="vz-btn" style={{ background: "none", border: "1px solid rgba(255,255,255,0.15)", borderRadius: 10, padding: "9px 14px", fontSize: 11, fontWeight: 800, color: "#f0f0f5", cursor: "pointer" }}>Activityを見る</button>
                        </div>
                    </div>
                )}
            </section>

            {/* ═══ 5. NEARBY · PLACE (living world entry) ═══ */}
            <section aria-label="Nearby" style={{ display: "flex", flexDirection: "column", gap: 10, ...right }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <p style={{ ...SECTION_LABEL, color: "rgba(255,255,255,0.4)" }}>NEARBY · VIZ MAP</p>
                    <button type="button" onClick={() => setView("viz_map")} style={{ marginLeft: "auto", background: "none", border: "none", cursor: "pointer", fontSize: 10, fontWeight: 800, letterSpacing: "0.08em", color: ACCENT, textTransform: "uppercase" }}>探す →</button>
                </div>
                <button type="button" onClick={() => setView("viz_map")} aria-label="Viz Map を開く"
                    style={{
                        position: "relative", display: "flex", alignItems: "flex-end", justifyContent: "flex-start",
                        height: 120, borderRadius: 16, overflow: "hidden", cursor: "pointer", border: "1px solid rgba(255,255,255,0.08)",
                        padding: "14px 16px", background: "linear-gradient(135deg, #111118 0%, #0B0B0F 55%, #16161c 100%)", textAlign: "left", color: "#f0f0f5",
                    }}>
                    <div aria-hidden style={{ position: "absolute", inset: 0, opacity: 0.5, backgroundImage: "radial-gradient(circle at 20% 30%, rgba(200,232,0,0.18), transparent 34%), radial-gradient(circle at 76% 60%, rgba(200,232,0,0.12), transparent 30%), radial-gradient(circle at 48% 86%, rgba(200,232,0,0.1), transparent 26%)", pointerEvents: "none" }} />
                    <div aria-hidden style={{ position: "absolute", right: 20, top: "50%", transform: "translateY(-50%)", width: 10, height: 10, borderRadius: "50%", background: ACCENT, boxShadow: "0 0 0 6px rgba(200,232,0,0.12), 0 0 18px rgba(200,232,0,0.5)" }} />
                    <div aria-hidden style={{ position: "absolute", right: 42, top: 30, width: 7, height: 7, borderRadius: "50%", background: "rgba(255,255,255,0.35)" }} />
                    <div aria-hidden style={{ position: "absolute", right: 92, bottom: 28, width: 8, height: 8, borderRadius: "50%", background: "rgba(255,255,255,0.25)" }} />
                    <span style={{ position: "relative", fontSize: 12, fontWeight: 800, letterSpacing: "0.06em", color: "#f0f0f5", textTransform: "uppercase" }}>世界中で今行われている場所を見る</span>
                </button>
            </section>

            {/* ═══ 6. PROFILE CARD (identity anchor, desktop rail) ═══ */}
            <div style={rail}>
                <ProfileCardSection profile={profile} t={t} roleColor={roleColor} setView={goProfile} referralUrl={referralUrl} referralCount={referralCount} />
            </div>

            {/* ═══ 7. JOURNEY · THIS WEEK ═══ — narrative ledger, not KPI bar */}
            <section aria-label="Journey" style={{ display: "flex", flexDirection: "column", gap: 10, ...right }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <p style={{ ...SECTION_LABEL, color: "rgba(255,255,255,0.4)" }}>JOURNEY · THIS WEEK</p>
                    <button type="button" onClick={() => setView("activities")} style={{ marginLeft: "auto", background: "none", border: "none", cursor: "pointer", fontSize: 10, fontWeight: 800, letterSpacing: "0.08em", color: ACCENT, textTransform: "uppercase" }}>振り返る →</button>
                </div>
                <div style={{ background: "#111118", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 14, padding: "14px 16px" }}>
                    {total === 0 ? (
                        <p style={{ margin: 0, fontSize: 12, color: "rgba(255,255,255,0.45)", lineHeight: 1.7 }}>今週はまだ記録がありません。ひとつのActivityから始めましょう。</p>
                    ) : (
                        <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
                            <p style={{ margin: "0 0 10px", fontSize: 12, color: "rgba(255,255,255,0.5)", lineHeight: 1.7 }}>
                                今週は{total}件の予定、{completed}件が完了。{completed > 0 ? "積み重ねが見えてきている。" : "これから積み上げていく。"}
                            </p>
                            <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                                {journeyActivities.slice(0, 7).map((a, idx) => (
                                    <span key={idx} title={a.title ?? a.type} style={{ flex: 1, height: 6, borderRadius: 999, background: a.status === "completed" ? ACCENT : a.status === "planned" ? "rgba(255,255,255,0.14)" : "rgba(255,255,255,0.06)", boxShadow: a.status === "completed" ? "0 0 8px rgba(200,232,0,0.35)" : "none" }} />
                                ))}
                                {Array.from({ length: Math.max(0, 7 - journeyActivities.length) }).map((_, idx) => (
                                    <span key={`empty-${idx}`} style={{ flex: 1, height: 6, borderRadius: 999, background: "rgba(255,255,255,0.04)", border: "1px dashed rgba(255,255,255,0.08)" }} />
                                ))}
                            </div>
                            <p style={{ margin: "8px 0 0", fontSize: 10, fontFamily: "'Space Mono', monospace", letterSpacing: "0.08em", textTransform: "uppercase", color: "rgba(255,255,255,0.25)" }}>DAY 0 から続くタイムライン</p>
                        </div>
                    )}
                </div>
            </section>

            {/* ROLE-specific return reason — same world, different lens */}
            <section aria-label="Return reason" style={{ display: "flex", flexDirection: "column", gap: 8, ...right }}>
                <p style={{ ...SECTION_LABEL, color: "rgba(255,255,255,0.25)" }}>{ROLE_RETURN[profile.role]?.label ?? "VIZION"} · 明日また開く理由</p>
                <div style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 12, padding: "12px 14px" }}>
                    <p style={{ margin: 0, fontSize: 12, color: "rgba(255,255,255,0.55)", lineHeight: 1.7 }}>{ROLE_RETURN[profile.role]?.reason ?? "世界で何かが起きているから、また見に来る。"}</p>
                </div>
            </section>

            {/* Revisit without notification — world itself is the reason */}
            <section aria-label="World is moving" style={{ display: "flex", alignItems: "center", gap: 10, ...right, background: "rgba(200,232,0,0.04)", border: "1px solid rgba(200,232,0,0.1)", borderRadius: 12, padding: "12px 14px" }}>
                <span style={{ width: 8, height: 8, borderRadius: "50%", background: ACCENT, boxShadow: "0 0 8px rgba(200,232,0,0.45)", flexShrink: 0 }} />
                <p style={{ margin: 0, fontSize: 11, color: "rgba(255,255,255,0.6)", lineHeight: 1.6, flex: 1 }}>通知がなくても世界は動いている。VIZ MAPとMomentsを覗くと、昨日と違う場所と人が見つかります。</p>
                <button type="button" onClick={() => setView("viz_map")} style={{ background: "none", border: "1px solid rgba(255,255,255,0.12)", color: "rgba(255,255,255,0.7)", borderRadius: 8, padding: "6px 10px", fontSize: 10, fontWeight: 800, cursor: "pointer", whiteSpace: "nowrap" }}>世界を見る</button>
            </section>
        </div>
    );
}

// ── AROUND YOU の「今起きていること」─ 地域Moment回転（既存 RegionActivityCard のロジックを inline 化して再利用）
function RegionActivityCardNative({ profile, region }: { profile: ProfileData; region: string }) {
    void profile;
    const [items, setItems] = useState<LiveInfoItem[]>([]);
    const [loading, setLoading] = useState(true);

    const loadRegion = useCallback(async () => {
        setLoading(true);
        const list: LiveInfoItem[] = [];
        try {
            const momRes = await fetch("/api/moments?scope=all&limit=4", { cache: "no-store" });
            const momJson = await momRes.json() as { items?: MomentFeedItem[] };
            const moments = momJson?.items ?? [];
            if (Array.isArray(moments) && moments.length > 0) {
                for (const m of moments.slice(0, 3)) {
                    const placeName = m?.place?.prefecture || m?.place?.name || region;
                    const who = m?.author?.display_name ?? m?.author?.slug ?? "誰か";
                    list.push({ type: "moment", text: `${who}@${placeName}：${m.moment.body?.slice(0, 40) || "新しいMoment"}`, href: "/dashboard?view=moments" });
                }
            }
        } catch {}
        setItems(list.slice(0, 4));
        setLoading(false);
    }, [region]);

    useEffect(() => {
        void loadRegion();
    }, [loadRegion]);

    if (loading && items.length === 0) {
        return (
            <div style={{ display: "flex", gap: 8 }}>
                {[0, 1].map((i) => <div key={i} style={{ flex: 1, height: 48, borderRadius: 12, background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }} />)}
            </div>
        );
    }
    if (items.length === 0) return null;

    // 2行に分けてライブ回転（LiveInfoCard を並べて1行目=最新）
    return (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            <LiveInfoCard items={items} loading={false} />
        </div>
    );
}
