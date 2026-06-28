// app/u/[slug]/portfolio/page.tsx
// 公開Portfolio = 過去から現在までの活動証明（is_public=true のJourneyのみ）。
// /u/[slug] は公開Profile（現在の自分）。本ページはその Portfolio 面を担う独立ルート。

import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { getPublicProfileBySlug } from "@/features/profile/server/get-profile-by-slug";
import { getSupabaseProfile } from "@/lib/auth/session";
import { supabaseServer } from "@/lib/supabase/server";
import PrivateProfilePage from "@/components/ui/PrivateProfilePage";
import { ProfilePortfolioNav } from "../ProfilePortfolioNav";
import { PortfolioShareButton } from "./PortfolioShareButton";
import { env } from "@/lib/env";
import type { UserRole } from "@/features/auth/types";
import { calcDayCount, getJstDateKey } from "@/lib/day-count";
import { getConditionMeta } from "@/components/DailyLog/journey";

export const dynamic = "force-dynamic";

const ROLE_COLOR: Record<UserRole, string> = {
    Athlete: "#FF5050", Trainer: "#32D278", Crew: "#FFC81E", Business: "#3C8CFF", Admin: "#7C3AED",
};
const ROLE_LABEL: Record<UserRole, string> = {
    Athlete: "ATHLETE", Trainer: "TRAINER", Crew: "CREW", Business: "BUSINESS", Admin: "ADMIN",
};
const CONDITION_COLOR: Record<number, string> = { 1: "#FF5050", 2: "#FF8A3C", 3: "#FFC81E", 4: "#7FD15B", 5: "#32D278" };

interface PublicJourney {
    id: string;
    content: string;
    condition_score: number | null;
    image_url: string | null;
    video_url: string | null;
    tags: string[] | null;
    cheer_count: number;
    created_at: string;
}

// ─── 日付ユーティリティ（JST） ────────────────────────────────────────────────
function diffJstDays(fromKey: string, toKey: string): number {
    const from = new Date(`${fromKey}T00:00:00+09:00`).getTime();
    const to = new Date(`${toKey}T00:00:00+09:00`).getTime();
    return Math.round((to - from) / 86400000);
}
function shiftDate(d: Date, n: number): Date {
    const r = new Date(d);
    r.setDate(r.getDate() + n);
    return r;
}
function formatJa(iso: string): string {
    return new Intl.DateTimeFormat("ja-JP", { timeZone: "Asia/Tokyo", month: "2-digit", day: "2-digit" }).format(new Date(iso));
}
function monthLabel(iso: string): string {
    return new Intl.DateTimeFormat("ja-JP", { timeZone: "Asia/Tokyo", year: "numeric", month: "long" }).format(new Date(iso));
}
function fullDate(iso: string): string {
    return new Intl.DateTimeFormat("ja-JP", { timeZone: "Asia/Tokyo", year: "numeric", month: "long", day: "numeric" }).format(new Date(iso));
}
function computeStreaks(rows: PublicJourney[]): { current: number; longest: number } {
    const days = new Set(rows.map((r) => getJstDateKey(new Date(r.created_at))));
    if (days.size === 0) return { current: 0, longest: 0 };
    const today = getJstDateKey(new Date());
    const yesterday = getJstDateKey(shiftDate(new Date(), -1));
    let current = 0;
    if (days.has(today) || days.has(yesterday)) {
        let cursor = days.has(today) ? new Date() : shiftDate(new Date(), -1);
        while (days.has(getJstDateKey(cursor))) {
            current += 1;
            cursor = shiftDate(cursor, -1);
        }
    }
    const sorted = [...days].sort();
    let longest = 0;
    let run = 0;
    let prev: string | null = null;
    for (const key of sorted) {
        if (prev && diffJstDays(prev, key) === 1) run += 1;
        else run = 1;
        longest = Math.max(longest, run);
        prev = key;
    }
    return { current, longest };
}

interface Props {
    params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { slug } = await params;
    const result = await getPublicProfileBySlug(slug);
    if (!result.success) {
        return { title: "Portfolio | Vizion Connection", robots: { index: false, follow: false } };
    }
    const { displayName } = result.data;
    return {
        title: `${displayName} の歩み | Portfolio`,
        description: `${displayName} の活動の軌跡。DAY 0 から積み上げた継続と成長の記録。`,
        openGraph: {
            title: `${displayName} の歩み | Vizion Connection`,
            description: "DAY 0 から積み上げた活動の軌跡。",
            images: [`${env.NEXT_PUBLIC_BASE_URL}/api/og/${slug}/portfolio`],
        },
        twitter: { card: "summary_large_image", images: [`${env.NEXT_PUBLIC_BASE_URL}/api/og/${slug}/portfolio`] },
    };
}

export default async function PublicPortfolioPage({ params }: Props) {
    const { slug } = await params;
    const session = await getSupabaseProfile();
    const result = await getPublicProfileBySlug(slug, session?.slug ?? null);

    if (!result.success) {
        if (result.reason === "forbidden") return <PrivateProfilePage displayName={slug} />;
        notFound();
    }

    const isOwn = session?.slug === slug;
    if (result.data.isPublic === false && !isOwn) {
        return <PrivateProfilePage displayName={result.data.displayName} />;
    }

    const profile = result.data;
    const rl = ROLE_COLOR[profile.role] ?? "#a78bfa";

    // 公開Journey + day0 を並列取得（is_public=true のみ。非公開はサーバ外へ出さない）
    const [journeysRes, userMetaRes] = await Promise.all([
        supabaseServer
            .from("journeys")
            .select("id, content, condition_score, image_url, video_url, tags, cheer_count, created_at")
            .eq("user_slug", slug)
            .eq("is_public", true)
            .order("created_at", { ascending: false })
            .limit(300),
        supabaseServer
            .from("users")
            .select("day0_date, day0_declaration")
            .eq("slug", slug)
            .single(),
    ]);

    const journeys = (journeysRes.data ?? []) as PublicJourney[];
    const day0Date = (userMetaRes.data?.day0_date as string | null) ?? null;
    const day0Declaration = (userMetaRes.data?.day0_declaration as string | null) ?? null;

    const oldestIso = journeys.length ? journeys[journeys.length - 1].created_at : null;
    const basisKey = day0Date ? getJstDateKey(new Date(day0Date)) : oldestIso ? getJstDateKey(new Date(oldestIso)) : null;
    const dayCount = calcDayCount(day0Date, oldestIso) ?? 0;
    const { current: currentStreak, longest: longestStreak } = computeStreaks(journeys);
    const totalCheer = journeys.reduce((s, j) => s + (j.cheer_count ?? 0), 0);
    const since = day0Date ?? oldestIso;

    // Portfolio 完成度（公開データから算出）
    const completionItems = [
        Boolean(day0Date),
        journeys.length >= 1,
        journeys.length >= 7,
        journeys.length >= 30,
        journeys.some((j) => j.image_url || j.video_url),
        journeys.some((j) => j.tags?.length),
        Boolean(profile.bio?.trim() || profile.claim?.trim()),
    ];
    const completion = Math.round((completionItems.filter(Boolean).length / completionItems.length) * 100);

    const initials = profile.displayName.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase();
    const referralUrl = `${env.NEXT_PUBLIC_BASE_URL}/register?ref=${slug}`;
    const gaugeR = 30;
    const gaugeC = 2 * Math.PI * gaugeR;
    const gaugeOffset = gaugeC - (completion / 100) * gaugeC;

    return (
        <div style={{ minHeight: "100vh", background: "#07070e", color: "#fff", overflowX: "hidden", fontFamily: "var(--font-noto), 'Hiragino Sans', sans-serif" }}>
            <style>{`
                *,*::before,*::after{box-sizing:border-box;}
                a{text-decoration:none;color:inherit;}
                @keyframes _fadeUp{from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:translateY(0)}}
                .pf-up{animation:_fadeUp .6s cubic-bezier(.16,1,.3,1) both;}
            `}</style>

            {/* Header */}
            <header style={{ position: "sticky", top: 0, zIndex: 40, borderBottom: "1px solid rgba(255,255,255,0.08)", background: "rgba(7,7,14,0.82)", backdropFilter: "blur(24px)", WebkitBackdropFilter: "blur(24px)" }}>
                <div style={{ maxWidth: 620, margin: "0 auto", padding: "0 18px", height: 64, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <Link href="/">
                        <Image src="/images/Vizion_Connection_logo-wt.png" alt="Vizion Connection" width={200} height={40} priority style={{ height: 34, width: "auto", opacity: 0.95 }} />
                    </Link>
                    {/* Profile / Portfolio 切替 */}
                    <ProfilePortfolioNav slug={slug} active="portfolio" accent={rl} />
                </div>
            </header>

            <main style={{ maxWidth: 620, margin: "0 auto", padding: "18px 16px 80px" }}>
                {/* ── HERO ── */}
                <section className="pf-up" style={{ position: "relative", borderRadius: 20, border: `1px solid ${rl}33`, background: `linear-gradient(160deg, ${rl}14, rgba(13,13,26,0.9))`, padding: 20, overflow: "hidden" }}>
                    <div style={{ position: "absolute", top: "-30%", right: "-10%", width: 240, height: 240, background: `radial-gradient(circle, ${rl}22, transparent 68%)`, pointerEvents: "none" }} />

                    <div style={{ position: "relative", display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
                        <div style={{ width: 52, height: 52, borderRadius: "50%", overflow: "hidden", border: `2px solid ${rl}`, background: "#111", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", boxShadow: `0 0 18px ${rl}40` }}>
                            {profile.avatarUrl ? (
                                <Image src={profile.avatarUrl} alt={profile.displayName} width={52} height={52} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                            ) : (
                                <span style={{ fontSize: 18, fontWeight: 900, color: `${rl}dd`, fontFamily: "monospace" }}>{initials}</span>
                            )}
                        </div>
                        <div style={{ minWidth: 0 }}>
                            <p style={{ margin: 0, fontSize: 9, fontFamily: "monospace", letterSpacing: "0.22em", color: `${rl}dd` }}>{ROLE_LABEL[profile.role]}</p>
                            <h1 style={{ margin: "2px 0 0", fontSize: 22, fontWeight: 900, color: "#fff", lineHeight: 1.1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{profile.displayName}</h1>
                            <p style={{ margin: "2px 0 0", fontSize: 11, fontFamily: "monospace", color: "rgba(255,255,255,0.4)" }}>@{slug}</p>
                        </div>
                    </div>

                    <div style={{ position: "relative", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16, flexWrap: "wrap" }}>
                        <div>
                            <p style={{ margin: 0, fontSize: 9, fontFamily: "monospace", letterSpacing: "0.22em", textTransform: "uppercase", color: rl }}>Growth Trajectory</p>
                            <div style={{ display: "flex", alignItems: "baseline", gap: 8, marginTop: 2 }}>
                                <span style={{ fontSize: 13, fontWeight: 800, color: "rgba(255,255,255,0.5)" }}>DAY</span>
                                <span style={{ fontFamily: "var(--font-bebas), sans-serif", fontSize: 52, lineHeight: 1, color: "#fff" }}>{dayCount}</span>
                            </div>
                            {since ? (
                                <p style={{ margin: "4px 0 0", fontSize: 11, color: "rgba(255,255,255,0.45)" }}>Since <span style={{ color: "#fff", fontWeight: 700 }}>{fullDate(since)}</span></p>
                            ) : null}
                        </div>

                        {/* 完成度ゲージ */}
                        <div style={{ position: "relative", width: 80, height: 80, flexShrink: 0 }}>
                            <svg width={80} height={80} viewBox="0 0 80 80" style={{ transform: "rotate(-90deg)" }}>
                                <circle cx={40} cy={40} r={gaugeR} fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth={6} />
                                <circle cx={40} cy={40} r={gaugeR} fill="none" stroke={rl} strokeWidth={6} strokeLinecap="round" strokeDasharray={gaugeC} strokeDashoffset={gaugeOffset} />
                            </svg>
                            <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
                                <span style={{ fontFamily: "var(--font-bebas), sans-serif", fontSize: 22, lineHeight: 1, color: "#fff" }}>{completion}%</span>
                                <span style={{ fontSize: 7, color: "rgba(255,255,255,0.4)", letterSpacing: "0.08em", fontFamily: "monospace" }}>COMPLETE</span>
                            </div>
                        </div>
                    </div>

                    {/* 継続日数チップ */}
                    <div style={{ position: "relative", display: "flex", gap: 8, flexWrap: "wrap", marginTop: 14 }}>
                        <HeroChip icon="🔥" label="継続" value={`${currentStreak}日`} rl={rl} />
                        <HeroChip icon="🏆" label="最長" value={`${longestStreak}日`} rl={rl} />
                        <HeroChip icon="📝" label="記録" value={`${journeys.length}`} rl={rl} />
                        {totalCheer > 0 ? <HeroChip icon="⭐" label="Cheer" value={`${totalCheer}`} rl={rl} /> : null}
                    </div>

                    {/* 共有 */}
                    <div style={{ position: "relative", marginTop: 16 }}>
                        <PortfolioShareButton
                            url={`${env.NEXT_PUBLIC_BASE_URL}/u/${slug}/portfolio`}
                            title={`${profile.displayName} の歩み | Vizion Portfolio`}
                            text={`${profile.displayName} の歩み 🔥\nDAY ${dayCount} ・ 継続 ${currentStreak}日 ・ Journey ${journeys.length}件\nPortfolio完成度 ${completion}%`}
                            accent={rl}
                            storiesUrl={`/api/og/${slug}/portfolio?format=stories`}
                        />
                    </div>
                </section>

                {/* ── STORY ── */}
                <section style={{ marginTop: 20 }}>
                    <h2 style={{ margin: "0 0 12px", fontSize: 11, fontWeight: 800, letterSpacing: "0.22em", textTransform: "uppercase", color: `${rl}dd` }}>Story</h2>

                    {journeys.length === 0 ? (
                        <div style={{ borderRadius: 16, border: "1px solid rgba(255,255,255,0.08)", background: "rgba(255,255,255,0.02)", padding: "28px 16px", textAlign: "center" }}>
                            <p style={{ margin: 0, fontSize: 13, color: "rgba(255,255,255,0.5)", lineHeight: 1.8 }}>まだ公開された活動記録がありません。</p>
                        </div>
                    ) : (
                        <div style={{ position: "relative" }}>
                            <div style={{ position: "absolute", left: 11, top: 8, bottom: 8, width: 2, background: `linear-gradient(${rl}66, ${rl}22 70%, rgba(255,255,255,0.08))` }} />

                            {journeys.map((entry, idx) => {
                                const prevIso = idx > 0 ? journeys[idx - 1].created_at : null;
                                const showMonth = !prevIso || monthLabel(prevIso) !== monthLabel(entry.created_at);
                                const dayKey = getJstDateKey(new Date(entry.created_at));
                                const dayNo = basisKey ? Math.max(0, diffJstDays(basisKey, dayKey)) : null;
                                const meta = getConditionMeta(entry.condition_score);
                                const condColor = entry.condition_score ? CONDITION_COLOR[entry.condition_score] ?? rl : "rgba(255,255,255,0.2)";
                                return (
                                    <div key={entry.id}>
                                        {showMonth ? (
                                            <div style={{ paddingLeft: 34, margin: "6px 0 10px" }}>
                                                <span style={{ fontFamily: "monospace", fontSize: 11, fontWeight: 900, letterSpacing: "0.1em", color: "rgba(255,255,255,0.4)", textTransform: "uppercase" }}>{monthLabel(entry.created_at)}</span>
                                            </div>
                                        ) : null}

                                        <div style={{ position: "relative", paddingLeft: 34, paddingBottom: 16 }}>
                                            <div style={{ position: "absolute", left: 4, top: 6, width: 16, height: 16, borderRadius: "50%", background: condColor, boxShadow: `0 0 0 4px ${condColor}22`, border: "2px solid #07070e" }} />

                                            <div style={{ position: "relative", borderRadius: 14, border: "1px solid rgba(255,255,255,0.08)", background: "rgba(255,255,255,0.02)", padding: 14, overflow: "hidden" }}>
                                                <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: 3, background: condColor, opacity: 0.85 }} />

                                                <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap", marginBottom: 8 }}>
                                                    {dayNo !== null ? <span style={{ fontFamily: "monospace", fontSize: 11, fontWeight: 900, color: rl, letterSpacing: "0.06em" }}>DAY {dayNo}</span> : null}
                                                    <span style={{ fontFamily: "monospace", fontSize: 11, color: "rgba(255,255,255,0.45)" }}>{formatJa(entry.created_at)}</span>
                                                    {meta ? <span style={{ fontSize: 12 }}>{meta.emoji}</span> : null}
                                                    {entry.cheer_count > 0 ? <span style={{ fontSize: 11, color: "#FFD600", fontWeight: 800 }}>★{entry.cheer_count}</span> : null}
                                                </div>

                                                <p style={{ margin: 0, fontSize: 13, color: "rgba(255,255,255,0.88)", lineHeight: 1.8, whiteSpace: "pre-wrap" }}>{entry.content}</p>

                                                {entry.image_url ? (
                                                    // eslint-disable-next-line @next/next/no-img-element
                                                    <img src={entry.image_url} alt="活動画像" style={{ marginTop: 10, width: "100%", maxWidth: 360, borderRadius: 10, border: "1px solid rgba(255,255,255,0.08)" }} />
                                                ) : null}
                                                {entry.video_url ? (
                                                    <video src={entry.video_url} controls style={{ marginTop: 10, width: "100%", maxWidth: 360, borderRadius: 10, border: "1px solid rgba(255,255,255,0.08)" }} />
                                                ) : null}

                                                {entry.tags?.length ? (
                                                    <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginTop: 10 }}>
                                                        {entry.tags.map((tag) => (
                                                            <span key={tag} style={{ padding: "3px 8px", borderRadius: 999, border: "1px solid rgba(255,255,255,0.1)", background: "rgba(255,255,255,0.03)", color: "rgba(255,255,255,0.55)", fontSize: 10, fontWeight: 700 }}>{tag}</span>
                                                        ))}
                                                    </div>
                                                ) : null}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}

                            {/* DAY 0 起点ノード */}
                            <div style={{ position: "relative", paddingLeft: 34, paddingTop: 4 }}>
                                <div style={{ position: "absolute", left: 2, top: 6, width: 20, height: 20, borderRadius: "50%", background: `radial-gradient(circle, var(--pulse), ${rl})`, boxShadow: `0 0 0 4px ${rl}22, 0 0 16px var(--pulse-glow)`, border: "2px solid #07070e" }} />
                                <div style={{ borderRadius: 14, border: `1px solid ${rl}44`, background: `linear-gradient(160deg, ${rl}14, rgba(255,255,255,0.02))`, padding: 14 }}>
                                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: since ? 6 : 0, flexWrap: "wrap" }}>
                                        <span style={{ fontFamily: "var(--font-bebas), sans-serif", fontSize: 20, letterSpacing: "0.04em", color: rl }}>DAY 0</span>
                                        <span style={{ fontSize: 11, fontWeight: 800, color: "#fff" }}>はじまりの記録</span>
                                        {since ? <span style={{ fontFamily: "monospace", fontSize: 10, color: "rgba(255,255,255,0.45)" }}>{fullDate(since)}</span> : null}
                                    </div>
                                    {day0Declaration ? (
                                        <p style={{ margin: 0, fontSize: 13, color: "rgba(255,255,255,0.88)", lineHeight: 1.8, whiteSpace: "pre-wrap" }}>「{day0Declaration}」</p>
                                    ) : (
                                        <p style={{ margin: 0, fontSize: 12, color: "rgba(255,255,255,0.5)", lineHeight: 1.7 }}>挑戦の原点。ここから全ての軌跡が始まります。</p>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}
                </section>

                {/* ── CTA ── */}
                <section style={{ marginTop: 24, position: "relative", borderRadius: 18, padding: "26px 20px", background: `linear-gradient(135deg, ${rl}1a, rgba(8,8,15,0.6))`, border: `1px solid ${rl}33`, textAlign: "center", overflow: "hidden" }}>
                    <p style={{ margin: "0 0 10px", fontSize: 9, fontFamily: "monospace", letterSpacing: "0.28em", textTransform: "uppercase", color: "rgba(255,255,255,0.3)" }}>INVITE</p>
                    <p style={{ margin: "0 0 18px", fontSize: 14, color: "rgba(255,255,255,0.55)", lineHeight: 1.7 }}>
                        <span style={{ color: "#fff", fontWeight: 800 }}>{profile.displayName}</span> の歩みに共感したら<br />Vizion Connection で自分の軌跡を始めよう
                    </p>
                    <a href={referralUrl} style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "13px 28px", borderRadius: 14, background: rl, color: "#000", fontSize: 13, fontWeight: 800 }}>
                        先行登録する（無料）
                        <svg width={13} height={13} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" /></svg>
                    </a>
                </section>
            </main>
        </div>
    );
}

function HeroChip({ icon, label, value, rl }: { icon: string; label: string; value: string; rl: string }) {
    return (
        <span style={{ display: "inline-flex", alignItems: "center", gap: 5, padding: "5px 10px", borderRadius: 999, border: "1px solid rgba(255,255,255,0.1)", background: "rgba(255,255,255,0.03)" }}>
            <span style={{ fontSize: 12 }}>{icon}</span>
            <span style={{ fontSize: 10, color: "rgba(255,255,255,0.5)" }}>{label}</span>
            <span style={{ fontSize: 12, fontWeight: 900, color: rl }}>{value}</span>
        </span>
    );
}
