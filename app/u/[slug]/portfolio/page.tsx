// app/u/[slug]/portfolio/page.tsx
// 公開Portfolio = 過去から現在までの活動証明（is_public=true のJourneyのみ）。
// /u/[slug] は公開Profile（現在の自分）。本ページはその Portfolio 面を担う独立ルート。
// 世界観はプロフィールと共通（profile-theme.ts）— ネオン #C8E800 × ダーク × スプリング。

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
import { calcDayCount, getJstDateKey } from "@/lib/day-count";
import { computeStreak, computeLongestStreak } from "@/lib/pulse-stats";
import { getMilestonesForUser } from "@/lib/supabase/portfolio-milestones";
import NeonCountUp from "../components/NeonCountUp";
import MilestoneBadgeRow from "../components/MilestoneBadgeRow";
import TimelineStack, { type TimelineEntry } from "../components/TimelineStack";
import { IconArrowRight, IconCheer, IconJourney, IconStreak, IconTrophy } from "@/lib/design/icons";
import {
    VP,
    VP_BODY_FONT,
    VP_DISPLAY_FONT,
    VP_MONO_FONT,
    VP_ROLE_COLOR,
    VP_ROLE_LABEL,
} from "../profile-theme";

export const dynamic = "force-dynamic";

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

function diffJstDays(fromKey: string, toKey: string): number {
    const from = new Date(`${fromKey}T00:00:00+09:00`).getTime();
    const to = new Date(`${toKey}T00:00:00+09:00`).getTime();
    return Math.round((to - from) / 86400000);
}
function fullDate(iso: string): string {
    return new Intl.DateTimeFormat("ja-JP", { timeZone: "Asia/Tokyo", year: "numeric", month: "long", day: "numeric" }).format(new Date(iso));
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

// SVGアイコン付き統計チップ（絵文字は使わない）
function StatChip({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
    return (
        <span style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "6px 12px", minHeight: 32, borderRadius: 999, border: `1px solid ${VP.border}`, background: "rgba(255,255,255,0.03)" }}>
            <span style={{ display: "inline-flex", color: VP.neon }} aria-hidden>{icon}</span>
            <span style={{ fontSize: 10, color: VP.sub }}>{label}</span>
            <span style={{ fontSize: 13, fontWeight: 900, color: VP.neonSoft, fontFamily: VP_MONO_FONT, fontVariantNumeric: "tabular-nums" }}>{value}</span>
        </span>
    );
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
    const roleColor = VP_ROLE_COLOR[profile.role] ?? VP.neon;

    // 公開Journey + day0 + マイルストーン + Bond数を並列取得（非公開はサーバ外へ出さない）
    const [journeysRes, userMetaRes, milestones, bondCount] = await Promise.all([
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
        getMilestonesForUser(slug),
        supabaseServer
            .from("user_follows")
            .select("*", { count: "exact", head: true })
            .eq("target_slug", slug)
            .then(({ count }) => count ?? 0),
    ]);

    const journeys = (journeysRes.data ?? []) as PublicJourney[];
    const day0Date = (userMetaRes.data?.day0_date as string | null) ?? null;
    const day0Declaration = (userMetaRes.data?.day0_declaration as string | null) ?? null;

    const oldestIso = journeys.length ? journeys[journeys.length - 1].created_at : null;
    const basisKey = day0Date ? getJstDateKey(new Date(day0Date)) : oldestIso ? getJstDateKey(new Date(oldestIso)) : null;
    const dayCount = calcDayCount(day0Date, oldestIso) ?? 0;
    const journeyIsoDates = journeys.map((j) => j.created_at);
    const currentStreak = computeStreak(journeyIsoDates);
    const longestStreak = computeLongestStreak(journeyIsoDates);
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

    const timelineEntries: TimelineEntry[] = journeys.map((j) => ({
        id: j.id,
        content: j.content,
        conditionScore: j.condition_score,
        imageUrl: j.image_url,
        videoUrl: j.video_url,
        tags: j.tags,
        cheerCount: j.cheer_count ?? 0,
        createdAt: j.created_at,
        dayNo: basisKey ? Math.max(0, diffJstDays(basisKey, getJstDateKey(new Date(j.created_at)))) : null,
    }));

    const initials = profile.displayName.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase();
    const referralUrl = `${env.NEXT_PUBLIC_BASE_URL}/register?ref=${slug}`;
    const gaugeR = 30;
    const gaugeC = 2 * Math.PI * gaugeR;
    const gaugeOffset = gaugeC - (completion / 100) * gaugeC;

    return (
        <div style={{ minHeight: "100vh", background: VP.bg, color: VP.text, overflowX: "hidden", fontFamily: VP_BODY_FONT }}>
            <style>{`
                *,*::before,*::after{box-sizing:border-box;}
                a{text-decoration:none;color:inherit;}
                a,button{touch-action:manipulation;}
                a:focus-visible,button:focus-visible{outline:2px solid ${VP.neon};outline-offset:3px;border-radius:6px;}
                .vp-grid-bg{position:fixed;inset:0;pointer-events:none;z-index:0;
                    background-image:linear-gradient(rgba(200,232,0,0.025) 1px,transparent 1px),linear-gradient(90deg,rgba(200,232,0,0.025) 1px,transparent 1px);
                    background-size:56px 56px;}
                @media (prefers-reduced-motion: reduce){
                    *,*::before,*::after{animation-duration:.01ms !important;animation-iteration-count:1 !important;transition-duration:.01ms !important;}
                }
            `}</style>

            <div className="vp-grid-bg" aria-hidden />

            {/* Header */}
            <header style={{ position: "sticky", top: 0, zIndex: 40, borderBottom: `1px solid ${VP.border}`, background: "rgba(5,6,8,0.84)", backdropFilter: "blur(24px)", WebkitBackdropFilter: "blur(24px)" }}>
                <div style={{ maxWidth: 620, margin: "0 auto", padding: "0 18px", height: 64, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <Link href="/" aria-label="Vizion Connection トップへ">
                        <Image src="/images/vizion-connection-logo-6-cropped.png" alt="Vizion Connection" width={200} height={40} priority style={{ height: 34, width: "auto", opacity: 0.95 }} />
                    </Link>
                    {/* Profile / Portfolio 切替 */}
                    <ProfilePortfolioNav slug={slug} active="portfolio" accent={VP.neon} />
                </div>
            </header>

            <main style={{ maxWidth: 620, margin: "0 auto", padding: "18px 16px 80px", position: "relative", zIndex: 1 }}>
                {/* ── HERO ── */}
                <section style={{ position: "relative", borderRadius: 20, border: `1px solid ${VP.neonBorder}`, background: `linear-gradient(160deg, ${VP.neonFaint}, rgba(11,14,18,0.92))`, padding: 20, overflow: "hidden", boxShadow: VP.glow }}>
                    <div aria-hidden style={{ position: "absolute", top: "-30%", right: "-10%", width: 240, height: 240, background: "radial-gradient(circle, rgba(200,232,0,0.14), transparent 68%)", pointerEvents: "none" }} />

                    <div style={{ position: "relative", display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
                        <div style={{ width: 52, height: 52, borderRadius: "50%", overflow: "hidden", border: `2px solid ${VP.neon}`, background: VP.surface2, flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", boxShadow: VP.glowStrong }}>
                            {profile.avatarUrl ? (
                                <Image src={profile.avatarUrl} alt={profile.displayName} width={52} height={52} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                            ) : (
                                <span style={{ fontSize: 18, fontWeight: 900, color: VP.neonSoft, fontFamily: VP_MONO_FONT }}>{initials}</span>
                            )}
                        </div>
                        <div style={{ minWidth: 0 }}>
                            <p style={{ margin: 0, fontSize: 9, fontFamily: VP_MONO_FONT, letterSpacing: "0.22em", color: roleColor }}>{VP_ROLE_LABEL[profile.role]}</p>
                            <h1 style={{ margin: "2px 0 0", fontSize: 22, fontWeight: 900, color: VP.text, lineHeight: 1.1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{profile.displayName}</h1>
                            <p style={{ margin: "2px 0 0", fontSize: 11, fontFamily: VP_MONO_FONT, color: VP.faint }}>@{slug}</p>
                        </div>
                    </div>

                    <div style={{ position: "relative", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16, flexWrap: "wrap" }}>
                        <div>
                            <p style={{ margin: 0, fontSize: 9, fontFamily: VP_MONO_FONT, letterSpacing: "0.22em", textTransform: "uppercase", color: VP.neon }}>Growth Trajectory</p>
                            <div style={{ display: "flex", alignItems: "baseline", gap: 8, marginTop: 2 }}>
                                <span style={{ fontSize: 13, fontWeight: 800, color: VP.sub }}>DAY</span>
                                <span style={{ fontFamily: VP_DISPLAY_FONT, fontSize: 56, lineHeight: 1, color: VP.neon, textShadow: VP.textGlow }}>
                                    <NeonCountUp value={dayCount} />
                                </span>
                            </div>
                            {since ? (
                                <p style={{ margin: "4px 0 0", fontSize: 11, color: VP.sub }}>Since <span style={{ color: VP.text, fontWeight: 700 }}>{fullDate(since)}</span></p>
                            ) : null}
                        </div>

                        {/* 完成度ゲージ */}
                        <div style={{ position: "relative", width: 80, height: 80, flexShrink: 0 }}>
                            <svg width={80} height={80} viewBox="0 0 80 80" style={{ transform: "rotate(-90deg)" }} role="img" aria-label={`Portfolio完成度 ${completion}%`}>
                                <circle cx={40} cy={40} r={gaugeR} fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth={6} />
                                <circle cx={40} cy={40} r={gaugeR} fill="none" stroke={VP.neon} strokeWidth={6} strokeLinecap="round" strokeDasharray={gaugeC} strokeDashoffset={gaugeOffset} style={{ filter: "drop-shadow(0 0 6px rgba(200,232,0,0.5))" }} />
                            </svg>
                            <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
                                <span style={{ fontFamily: VP_DISPLAY_FONT, fontSize: 22, lineHeight: 1, color: VP.text }}>{completion}%</span>
                                <span style={{ fontSize: 7, color: VP.faint, letterSpacing: "0.08em", fontFamily: VP_MONO_FONT }}>COMPLETE</span>
                            </div>
                        </div>
                    </div>

                    {/* 継続日数チップ（アイコン辞書に統一: Streak=炎 / 最長=トロフィー / 記録=レイヤー / Cheer=星） */}
                    <div style={{ position: "relative", display: "flex", gap: 8, flexWrap: "wrap", marginTop: 14 }}>
                        <StatChip icon={<IconStreak size={12} />} label="継続" value={`${currentStreak}日`} />
                        <StatChip icon={<IconTrophy size={12} />} label="最長" value={`${longestStreak}日`} />
                        <StatChip icon={<IconJourney size={12} />} label="記録" value={`${journeys.length}`} />
                        {totalCheer > 0 ? (
                            <StatChip icon={<IconCheer size={12} style={{ color: "#FFD600" }} />} label="Cheer" value={`${totalCheer}`} />
                        ) : null}
                    </div>

                    {/* 共有 */}
                    <div style={{ position: "relative", marginTop: 16 }}>
                        <PortfolioShareButton
                            url={`${env.NEXT_PUBLIC_BASE_URL}/u/${slug}/portfolio`}
                            title={`${profile.displayName} の歩み | Vizion Portfolio`}
                            text={`${profile.displayName} の歩み 🔥\nDAY ${dayCount} ・ 継続 ${currentStreak}日 ・ Journey ${journeys.length}件\nPortfolio完成度 ${completion}%`}
                            accent={VP.neon}
                            storiesUrl={`/api/og/${slug}/portfolio?format=stories`}
                        />
                    </div>
                </section>

                {/* ── MILESTONES ── */}
                <section style={{ marginTop: 24 }}>
                    <MilestoneBadgeRow
                        milestones={milestones}
                        progress={{
                            cheerCount: profile.cheerCount ?? 0,
                            streakDays: currentStreak,
                            journeyCount: journeys.length,
                            bondCount,
                        }}
                    />
                </section>

                {/* ── STORY（積み重ねタイムライン） ── */}
                <section style={{ marginTop: 24 }}>
                    <TimelineStack
                        entries={timelineEntries}
                        mode="full"
                        title="Story"
                        day0={{ date: since, declaration: day0Declaration }}
                    />
                </section>

                {/* ── CTA ── */}
                <section style={{ marginTop: 24, position: "relative", borderRadius: 18, padding: "26px 20px", background: `linear-gradient(135deg, ${VP.neonFaint}, rgba(5,6,8,0.6))`, border: `1px solid ${VP.neonBorder}`, textAlign: "center", overflow: "hidden" }}>
                    <span aria-hidden style={{ position: "absolute", top: 0, left: "10%", right: "10%", height: 1, background: `linear-gradient(90deg, transparent, ${VP.neon}88, transparent)` }} />
                    <p style={{ margin: "0 0 10px", fontSize: 9, fontFamily: VP_MONO_FONT, letterSpacing: "0.28em", textTransform: "uppercase", color: VP.faint }}>INVITE</p>
                    <p style={{ margin: "0 0 18px", fontSize: 14, color: VP.sub, lineHeight: 1.7 }}>
                        <span style={{ color: VP.text, fontWeight: 800 }}>{profile.displayName}</span> の歩みに共感したら<br />Vizion Connection で自分の軌跡を始めよう
                    </p>
                    <a href={referralUrl} style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "13px 28px", minHeight: 48, borderRadius: 12, background: VP.neon, color: "#0A0C10", fontSize: 13, fontWeight: 800, boxShadow: VP.glow }}>
                        無料で登録する
                        <IconArrowRight size={13} />
                    </a>
                </section>
            </main>
        </div>
    );
}
