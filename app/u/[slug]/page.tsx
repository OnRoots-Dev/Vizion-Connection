// app/u/[slug]/page.tsx
// 公開プロフィール — 全ロール統一レイアウト。
// 世界観: スポーティ・ダイナミック × ゲーミフィケーション（ミニマル高級感 × サイバー）
// ネオン #C8E800 が主役、役割色はロールタグ等のサブ識別に限定（profile-theme.ts 参照）。

import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { getPublicProfileBySlug } from "@/features/profile/server/get-profile-by-slug";
import { env } from "@/lib/env";
import CheerButtonClient from "./CheerButtonClient";
import { getCareerProfile } from "@/lib/supabase/career-profiles";
import CollectButtonClient from "./CollectButtonClient";
import { FoundingMemberBadge, EarlyPartnerBadge } from "@/components/ui/FoundingMemberBadge";
import PrivateProfilePage from "@/components/ui/PrivateProfilePage";
import { getSupabaseProfile } from "@/lib/auth/session";
import { ProfileCardSection } from "@/app/(app)/dashboard/components/ProfileCard";
import CareerSection from "./CareerSection";
import { getCollectorCount } from "@/lib/supabase/collections";
import type { ProfileData } from "@/features/profile/types";
import { getAdsForUser } from "@/lib/ads";
import { isLocalPlan } from "@/lib/ads-shared";
import AdCard from "@/components/AdCard";
import SponsorBadge from "@/components/SponsorBadge";
import PublicProfileRealtime from "./PublicProfileRealtime";
import { supabaseServer } from "@/lib/supabase/server";
import { computeStreak } from "@/lib/pulse-stats";
import { CATEGORY_CONFIG } from "@/types/schedule";
import ShareButtonClient from "@/components/profile/ShareButtonClient";
import { ProfilePortfolioNav } from "./ProfilePortfolioNav";
import { getSponsorsForUser } from "@/lib/supabase/business-sponsorships";
import { getMilestonesForUser } from "@/lib/supabase/portfolio-milestones";
import { getJstDateKey } from "@/lib/day-count";
import StatusBar from "./components/StatusBar";
import HeatPanel, { type HeatComment, type HeatSponsor } from "./components/HeatPanel";
import MilestoneBadgeRow from "./components/MilestoneBadgeRow";
import NetworkCard, { type NetworkSupporter } from "./components/NetworkCard";
import TimelineStack, { type TimelineEntry } from "./components/TimelineStack";
import Expandable from "./components/Expandable";
import { IconArrowRight } from "@/lib/design/icons";
import {
    VP,
    VP_BODY_FONT,
    VP_DISPLAY_FONT,
    VP_MONO_FONT,
    VP_ROLE_COLOR,
    VP_ROLE_LABEL,
    VP_ROLE_LABEL_JA,
    vpPanel,
    vpSectionTitle,
} from "./profile-theme";

const X_PATH = "M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.746l7.73-8.835L1.254 2.25H8.08l4.253 5.622zm-1.161 17.52h1.833L7.084 4.126H5.117z";
const IG_PATH = "M7.8 2h8.4C19.4 2 22 4.6 22 7.8v8.4a5.8 5.8 0 01-5.8 5.8H7.8C4.6 22 2 19.4 2 16.2V7.8A5.8 5.8 0 017.8 2zm-.2 2A3.6 3.6 0 004 7.6v8.8C4 18.39 5.61 20 7.6 20h8.8a3.6 3.6 0 003.6-3.6V7.6C20 5.61 18.39 4 16.4 4H7.6zm9.65 1.5a1.25 1.25 0 110 2.5 1.25 1.25 0 010-2.5zM12 7a5 5 0 110 10A5 5 0 0112 7zm0 2a3 3 0 100 6 3 3 0 000-6z";
const TK_PATH = "M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1V9.01a6.3 6.3 0 00-.79-.05 6.34 6.34 0 00-6.34 6.34 6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.33-6.34V8.69a8.18 8.18 0 004.78 1.52V6.77a4.85 4.85 0 01-1.01-.08z";

function diffJstDays(fromKey: string, toKey: string): number {
    const from = new Date(`${fromKey}T00:00:00+09:00`).getTime();
    const to = new Date(`${toKey}T00:00:00+09:00`).getTime();
    return Math.round((to - from) / 86400000);
}

interface Props { params: Promise<{ slug: string }>; }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { slug } = await params;
    const result = await getPublicProfileBySlug(slug);
    if (!result.success) {
        return { title: "Vizion Connection", robots: { index: false, follow: false } };
    }
    const { displayName, role } = result.data;
    return {
        title: `${displayName} (@${slug}) | Vizion Connection`,
        description: `${displayName} は Vizion Connection の ${VP_ROLE_LABEL_JA[role]} です。`,
        openGraph: {
            title: `${displayName} | Vizion Connection`,
            description: `${VP_ROLE_LABEL_JA[role]} として活動中`,
            images: [`${env.NEXT_PUBLIC_BASE_URL}/api/og/${slug}`],
        },
        twitter: { card: "summary_large_image", images: [`${env.NEXT_PUBLIC_BASE_URL}/api/og/${slug}`] },
    };
}

export default async function UserProfilePage({ params }: Props) {
    const { slug } = await params;
    const session = await getSupabaseProfile();
    const result = await getPublicProfileBySlug(slug, session?.slug ?? null);
    if (!result.success) {
        if (result.reason === "forbidden") {
            return <PrivateProfilePage displayName={slug} />;
        }
        notFound();
    }
    const isOwn = session?.slug === slug;
    const viewerSlug = session?.slug ?? null;
    if (result.data.isPublic === false && !isOwn) return <PrivateProfilePage displayName={result.data.displayName} />;

    const { data: profile } = result;
    const now = new Date();
    const today = new Date(now);
    today.setHours(0, 0, 0, 0);
    const since365 = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000).toISOString();

    const [
        collectorCount,
        rawCareerProfile,
        ads,
        publicSchedules,
        journeyCount,
        bondCount,
        journeyDates,
        sponsors,
        milestones,
        userMeta,
        previewJourneys,
        bondingCount,
        recentBondRows,
        cheerCommentRows,
    ] = await Promise.all([
        getCollectorCount(slug),
        getCareerProfile(slug),
        getAdsForUser(profile.prefecture ?? "", profile.sport ?? undefined),
        supabaseServer
            .from("schedules")
            .select("id,user_slug,title,start_at,end_at,location,description,category,is_public,created_at,updated_at")
            .eq("user_slug", slug)
            .eq("is_public", true)
            .gte("start_at", today.toISOString())
            .order("start_at", { ascending: true })
            .limit(10)
            .then(({ data }) => data ?? []),
        supabaseServer
            .from("journeys")
            .select("*", { count: "exact", head: true })
            .eq("user_slug", slug)
            .then(({ count }) => count ?? 0),
        supabaseServer
            .from("user_follows")
            .select("*", { count: "exact", head: true })
            .eq("target_slug", slug)
            .then(({ count }) => count ?? 0),
        supabaseServer
            .from("journeys")
            .select("created_at")
            .eq("user_slug", slug)
            .gte("created_at", since365)
            .then(({ data }) => (data ?? []) as Array<{ created_at: string }>),
        getSponsorsForUser(slug),
        getMilestonesForUser(slug),
        supabaseServer
            .from("users")
            .select("last_login_at, day0_date")
            .eq("slug", slug)
            .maybeSingle()
            .then(({ data }) => data as { last_login_at: string | null; day0_date: string | null } | null),
        supabaseServer
            .from("journeys")
            .select("id, content, condition_score, image_url, video_url, tags, cheer_count, created_at")
            .eq("user_slug", slug)
            .eq("is_public", true)
            .order("created_at", { ascending: false })
            .limit(3)
            .then(({ data }) => data ?? []),
        supabaseServer
            .from("user_follows")
            .select("*", { count: "exact", head: true })
            .eq("follower_slug", slug)
            .then(({ count }) => count ?? 0),
        supabaseServer
            .from("user_follows")
            .select("follower_slug, created_at")
            .eq("target_slug", slug)
            .order("created_at", { ascending: false })
            .limit(5)
            .then(({ data }) => data ?? []),
        supabaseServer
            .from("cheers")
            .select("id, comment, from_slug, created_at")
            .eq("to_slug", slug)
            .not("comment", "is", null)
            .neq("comment", "")
            .order("created_at", { ascending: false })
            .limit(1)
            .then(({ data }) => data ?? []),
    ]);

    const streakDays = computeStreak(journeyDates.map(r => r.created_at));

    // 閲覧者がこのプロフィールを Bond（観客席入り）しているか
    let isBonded = false;
    if (viewerSlug && !isOwn) {
        const { data: bondRow } = await supabaseServer
            .from("user_follows")
            .select("follower_slug")
            .eq("follower_slug", viewerSlug)
            .eq("target_slug", slug)
            .maybeSingle();
        isBonded = !!bondRow;
    }

    // 直近サポーター＋コメント投稿者のユーザー情報をまとめて取得
    const lookupSlugs = Array.from(new Set([
        ...recentBondRows.map((r) => String(r.follower_slug)),
        ...cheerCommentRows.map((r) => String(r.from_slug)),
    ]));
    const { data: lookupUsers } = lookupSlugs.length
        ? await supabaseServer
            .from("users")
            .select("slug, display_name, avatar_url")
            .in("slug", lookupSlugs)
            .eq("is_deleted", false)
            .eq("is_public", true)
        : { data: [] as Array<{ slug: string; display_name: string; avatar_url: string | null }> };
    const lookupMap = new Map((lookupUsers ?? []).map((u) => [String(u.slug), u]));

    const supporters: NetworkSupporter[] = recentBondRows
        .filter((r) => lookupMap.has(String(r.follower_slug)))
        .map((r) => {
            const u = lookupMap.get(String(r.follower_slug))!;
            return { slug: String(u.slug), displayName: String(u.display_name), avatarUrl: u.avatar_url ? String(u.avatar_url) : null };
        });

    const heatComments: HeatComment[] = cheerCommentRows.map((r) => ({
        id: String(r.id),
        comment: String(r.comment),
        fromName: lookupMap.get(String(r.from_slug))?.display_name
            ? String(lookupMap.get(String(r.from_slug))!.display_name)
            : "サポーター",
    }));

    const heatSponsors: HeatSponsor[] = sponsors.map((s) => ({
        slug: s.slug,
        displayName: s.displayName,
        avatarUrl: s.avatarUrl,
        planId: s.planId,
    }));

    // Timeline プレビュー（DAY 番号は day0 起点。day0 未設定時は日付のみ表示）
    const day0Key = userMeta?.day0_date ? getJstDateKey(new Date(userMeta.day0_date)) : null;
    const timelineEntries: TimelineEntry[] = previewJourneys.map((j) => ({
        id: String(j.id),
        content: String(j.content ?? ""),
        conditionScore: j.condition_score != null ? Number(j.condition_score) : null,
        imageUrl: j.image_url ? String(j.image_url) : null,
        videoUrl: j.video_url ? String(j.video_url) : null,
        tags: (j.tags as string[] | null) ?? null,
        cheerCount: Number(j.cheer_count ?? 0),
        createdAt: String(j.created_at),
        dayNo: day0Key ? Math.max(0, diffJstDays(day0Key, getJstDateKey(new Date(String(j.created_at))))) : null,
    }));

    // 最終活動 = ログイン or 最新Journey の新しい方
    const latestJourneyAt = previewJourneys[0]?.created_at ? String(previewJourneys[0].created_at) : null;
    const lastLoginAt = userMeta?.last_login_at ?? null;
    const lastActiveAt = [lastLoginAt, latestJourneyAt]
        .filter((v): v is string => Boolean(v))
        .sort((a, b) => new Date(b).getTime() - new Date(a).getTime())[0] ?? null;

    const careerProfile = rawCareerProfile && (isOwn || rawCareerProfile.visibility === "public") ? rawCareerProfile : null;
    const regionalAd = ads.find((ad) => ad.adScope === "regional" || isLocalPlan(ad.plan)) ?? null;

    const referralUrl = `${env.NEXT_PUBLIC_BASE_URL}/register?ref=${slug}`;
    const profileUrl = `${env.NEXT_PUBLIC_BASE_URL}/u/${slug}`;
    const joinedAt = new Date(profile.createdAt).toLocaleDateString("ja-JP", { year: "numeric", month: "short", day: "numeric" });
    const joinedLabel = new Intl.DateTimeFormat("ja-JP", { timeZone: "Asia/Tokyo", year: "numeric", month: "2-digit" }).format(new Date(profile.createdAt)).replace("/", ".");
    const roleColor = VP_ROLE_COLOR[profile.role];
    const initials = profile.displayName.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase();
    const serialDisplay = profile.serialId ? `#${String(profile.serialId).padStart(4, "0")}` : null;
    const foundingDisplay = profile.isFoundingMember && profile.foundingNumber != null
        ? `Founding Member #${String(profile.foundingNumber).padStart(4, "0")}`
        : null;
    const snsLinks = [
        { label: "X", href: profile.xUrl, path: X_PATH },
        { label: "Instagram", href: profile.instagram, path: IG_PATH },
        { label: "TikTok", href: profile.tiktok, path: TK_PATH },
    ].filter(s => s.href);
    const cardTheme = { bg: VP.bg, surface: VP.surface, border: VP.border, text: VP.text, sub: VP.sub };
    const publicCareerLabel = profile.role === "Athlete"
        ? "Career"
        : profile.role === "Trainer"
            ? "Expertise"
            : profile.role === "Business"
                ? "Portfolio"
                : "Community";

    // ヒーロー: 2カラム構図（旧Athleteレイアウトを全ロールへ継承）
    const displayNameParts = profile.displayName.split(/\s+/).filter(Boolean);
    const nameFirst = displayNameParts.length >= 2 ? displayNameParts.slice(0, -1).join(" ") : "";
    const nameLast = displayNameParts.length >= 2 ? displayNameParts.at(-1) ?? profile.displayName : profile.displayName;
    const eyebrow = [VP_ROLE_LABEL[profile.role], profile.sportsCategory, profile.sport, profile.stance].filter(Boolean).join(" · ");
    const heroBio = careerProfile?.bio_career || profile.bio || "";
    const photoUrl = profile.profileImageUrl || profile.avatarUrl || profile.bannerUrl || null;

    const nextSchedule = publicSchedules[0] ?? null;
    const nextScheduleDate = nextSchedule?.start_at
        ? new Date(nextSchedule.start_at).toLocaleDateString("ja-JP", { month: "numeric", day: "numeric" })
        : null;

    return (
        <div style={{ minHeight: "100vh", background: VP.bg, color: VP.text, overflowX: "hidden", fontFamily: VP_BODY_FONT }}>
            <PublicProfileRealtime slug={slug} />
            <style>{`
                *, *::before, *::after { box-sizing: border-box; }
                a { color: inherit; text-decoration: none; }
                a, button { touch-action: manipulation; }
                a:focus-visible, button:focus-visible { outline: 2px solid ${VP.neon}; outline-offset: 3px; border-radius: 6px; }
                .vp-hero { display: grid; grid-template-columns: 1.1fr 0.9fr; gap: 28px; align-items: center; }
                .vp-photo { position: relative; min-height: 420px; border-radius: 20px; overflow: hidden; border: 1px solid ${VP.neonBorder}; box-shadow: ${VP.glow}; }
                .vp-name-last { font-family: ${VP_DISPLAY_FONT}; font-size: clamp(64px, 11vw, 118px); line-height: .9; letter-spacing: .01em; }
                .vp-name-first { font-family: ${VP_DISPLAY_FONT}; font-size: clamp(28px, 5vw, 44px); line-height: 1; color: ${VP.sub}; letter-spacing: .04em; }
                .vp-cta { display: inline-flex; align-items: center; justify-content: center; gap: 8px; min-height: 48px; padding: 13px 24px; border-radius: 14px; font-size: 13px; font-weight: 800; cursor: pointer; transition: filter .18s, transform .18s, box-shadow .18s; }
                .vp-cta:hover { filter: brightness(1.1); transform: translateY(-1px); }
                .vp-cta-primary { background: ${VP.neon}; color: #0A0C10; box-shadow: ${VP.glow}; }
                .vp-cta-ghost { background: rgba(255,255,255,0.04); border: 1px solid ${VP.borderStrong}; color: ${VP.text}; }
                .vp-sns { width: 44px; height: 44px; border-radius: 50%; display: flex; align-items: center; justify-content: center; background: rgba(255,255,255,0.04); border: 1px solid ${VP.border}; color: ${VP.sub}; transition: transform .15s, color .15s, border-color .15s; }
                .vp-sns:hover { transform: translateY(-2px); color: ${VP.neon}; border-color: ${VP.neonBorder}; }
                .vp-grid-bg { position: fixed; inset: 0; pointer-events: none; z-index: 0;
                    background-image: linear-gradient(rgba(200,232,0,0.025) 1px, transparent 1px), linear-gradient(90deg, rgba(200,232,0,0.025) 1px, transparent 1px);
                    background-size: 56px 56px; }
                @media (max-width: 860px) {
                    .vp-hero { grid-template-columns: 1fr; gap: 18px; }
                    .vp-photo { min-height: 300px; }
                }
                @media (prefers-reduced-motion: reduce) {
                    *, *::before, *::after { animation-duration: 0.01ms !important; animation-iteration-count: 1 !important; transition-duration: 0.01ms !important; }
                }
            `}</style>

            {/* サイバーグリッド背景＋ネオングロー */}
            <div className="vp-grid-bg" aria-hidden />
            <div style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 0, overflow: "hidden" }} aria-hidden>
                <div style={{ position: "absolute", top: "-18%", left: "50%", transform: "translateX(-50%)", width: 900, height: 560, background: "radial-gradient(ellipse 55% 55% at 50% 50%, rgba(200,232,0,0.10) 0%, transparent 70%)" }} />
                <div style={{ position: "absolute", bottom: "-24%", right: "-8%", width: 520, height: 520, background: "radial-gradient(circle, rgba(200,232,0,0.06), transparent 68%)" }} />
            </div>

            {/* Header */}
            <header style={{ position: "sticky", top: 0, zIndex: 40, borderBottom: `1px solid ${VP.border}`, background: "rgba(5,6,8,0.84)", backdropFilter: "blur(24px)", WebkitBackdropFilter: "blur(24px)" }}>
                <div style={{ maxWidth: 980, margin: "0 auto", padding: "0 20px", height: 72, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
                    <Link href="/" aria-label="Vizion Connection トップへ">
                        <Image
                            src="/images/Vizion_Connection_logo-wt.png"
                            alt="Vizion Connection"
                            width={230}
                            height={46}
                            priority
                            style={{ height: 40, width: "auto", opacity: 0.95 }}
                        />
                    </Link>
                    <ProfilePortfolioNav slug={slug} active="profile" accent={VP.neon} />
                </div>
            </header>

            <main style={{ maxWidth: 980, margin: "0 auto", position: "relative", zIndex: 1, padding: "16px 20px 96px", display: "flex", flexDirection: "column", gap: 32 }}>

                {/* ① ステータスバー */}
                <StatusBar lastActiveAt={lastActiveAt} joinedLabel={joinedLabel} />

                {/* HERO（2カラム構図） */}
                <section className="vp-hero" aria-label="プロフィール">
                    <div>
                        <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap", marginBottom: 16 }}>
                            {profile.isFoundingMember ? <FoundingMemberBadge /> : <EarlyPartnerBadge />}
                            {serialDisplay && <span style={{ fontSize: 10, fontFamily: VP_MONO_FONT, color: VP.faint, background: "rgba(255,255,255,.04)", border: `1px solid ${VP.border}`, padding: "2px 8px", borderRadius: 4 }}>{serialDisplay}</span>}
                            {foundingDisplay && <span style={{ fontSize: 10, fontFamily: VP_MONO_FONT, color: VP.faint, background: "rgba(255,255,255,.04)", border: `1px solid ${VP.border}`, padding: "2px 8px", borderRadius: 4 }}>{foundingDisplay}</span>}
                        </div>

                        <p style={{ margin: 0, fontSize: 12, fontWeight: 800, letterSpacing: ".24em", textTransform: "uppercase", color: roleColor, fontFamily: VP_MONO_FONT }}>
                            {eyebrow}
                        </p>

                        {nameFirst ? <div className="vp-name-first" style={{ marginTop: 14 }}>{nameFirst}</div> : null}
                        <div style={{ display: "flex", alignItems: "flex-end", gap: 12, flexWrap: "wrap" }}>
                            <h1 className="vp-name-last" style={{ margin: "2px 0 0", color: VP.text, textShadow: "0 0 44px rgba(200,232,0,0.22)" }}>
                                {nameLast}
                            </h1>
                            {profile.verified && (
                                <span style={{ display: "inline-flex", alignItems: "center", gap: 4, padding: "3px 9px 3px 5px", borderRadius: 20, background: VP.neonDim, border: `1px solid ${VP.neonBorder}`, color: VP.neon, fontSize: 9.5, fontWeight: 800, letterSpacing: ".1em", marginBottom: 10 }}>
                                    <svg width={10} height={10} viewBox="0 0 24 24" fill={VP.neon} aria-hidden><path fillRule="evenodd" d="M8.603 3.799A4.49 4.49 0 0112 2.25c1.357 0 2.573.6 3.397 1.549a4.49 4.49 0 013.498 1.307 4.491 4.491 0 011.307 3.497A4.49 4.49 0 0121.75 12a4.49 4.49 0 01-1.549 3.397 4.491 4.491 0 01-1.307 3.497 4.491 4.491 0 01-3.497 1.307A4.49 4.49 0 0112 21.75a4.49 4.49 0 01-3.397-1.549 4.491 4.491 0 01-3.497-1.307 4.491 4.491 0 01-1.307-3.497A4.49 4.49 0 012.25 12c0-1.357.6-2.573 1.549-3.397a4.491 4.491 0 011.307-3.497 4.49 4.49 0 013.497-1.307zm7.007 6.387a.75.75 0 10-1.22-.872l-3.236 4.53L9.53 12.22a.75.75 0 00-1.06 1.06l2.25 2.25a.75.75 0 001.14-.094l3.75-5.25z" clipRule="evenodd" /></svg>
                                    VERIFIED
                                </span>
                            )}
                        </div>

                        <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 8 }}>
                            <span style={{ fontSize: 12, fontFamily: VP_MONO_FONT, color: VP.faint, letterSpacing: ".04em" }}>@{profile.slug}</span>
                            {profile.region && (
                                <>
                                    <span style={{ width: 3, height: 3, borderRadius: "50%", background: "rgba(255,255,255,.2)", display: "inline-block" }} aria-hidden />
                                    <span style={{ fontSize: 12, fontFamily: VP_MONO_FONT, color: VP.faint }}>{profile.region}</span>
                                </>
                            )}
                        </div>

                        {profile.claim?.trim() ? (
                            <p style={{ margin: "18px 0 0", paddingLeft: 14, borderLeft: `2px solid ${VP.neon}`, color: "rgba(255,255,255,0.85)", fontWeight: 700, fontSize: 15, lineHeight: 1.7, maxWidth: 520 }}>
                                &quot;{profile.claim.trim()}&quot;
                            </p>
                        ) : null}

                        {heroBio ? (
                            <p style={{ margin: "16px 0 0", lineHeight: 1.85, color: VP.sub, maxWidth: 520, whiteSpace: "pre-wrap", fontSize: 14 }}>{heroBio}</p>
                        ) : null}

                        {/* ステータスチップは2つまでに絞る（1画面1メッセージ） */}
                        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 20 }}>
                            {profile.role !== "Business" ? (
                                <span style={{ padding: "6px 12px", borderRadius: 8, fontSize: 10, fontWeight: 800, letterSpacing: ".12em", textTransform: "uppercase", background: VP.neonDim, border: `1px solid ${VP.neonBorder}`, color: VP.neonSoft, fontFamily: VP_MONO_FONT }}>
                                    {sponsors.length > 0 ? `SPONSORED ×${sponsors.length}` : "スポンサー募集中"}
                                </span>
                            ) : null}
                            {nextScheduleDate ? (
                                <span style={{ padding: "6px 12px", borderRadius: 8, fontSize: 10, fontWeight: 800, letterSpacing: ".12em", textTransform: "uppercase", background: "rgba(255,214,0,.08)", border: "1px solid rgba(255,214,0,.25)", color: VP.gold, fontFamily: VP_MONO_FONT }}>
                                    次戦 {nextScheduleDate}
                                </span>
                            ) : null}
                        </div>

                        <div style={{ display: "flex", gap: 8, marginTop: 24, flexWrap: "wrap", alignItems: "center" }}>
                            <Link className="vp-cta vp-cta-primary" href={`/r/${slug}`}>Offer を送る</Link>
                            <a className="vp-cta vp-cta-ghost" href="#cheer">Cheer する</a>
                            {snsLinks.length > 0 ? (
                                <span style={{ display: "flex", gap: 8, marginLeft: 4 }}>
                                    {snsLinks.map(s => (
                                        <a key={s.label} href={s.href!} target="_blank" rel="noopener noreferrer" className="vp-sns" aria-label={s.label}>
                                            <svg viewBox="0 0 24 24" width={14} height={14} fill="currentColor" aria-hidden><path d={s.path} /></svg>
                                        </a>
                                    ))}
                                </span>
                            ) : null}
                        </div>
                    </div>

                    <div className="vp-photo">
                        {photoUrl ? (
                            <>
                                <Image
                                    src={photoUrl}
                                    alt={profile.displayName}
                                    fill
                                    sizes="(min-width: 860px) 44vw, 92vw"
                                    priority
                                    style={{ objectFit: "cover", objectPosition: "center top", filter: "saturate(1.05) contrast(1.05)" }}
                                />
                                <div style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg, rgba(5,6,8,0.05), rgba(5,6,8,0.72))" }} aria-hidden />
                            </>
                        ) : (
                            <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", background: `linear-gradient(150deg, ${VP.surface2}, ${VP.bg})` }}>
                                <span style={{ fontFamily: VP_DISPLAY_FONT, fontSize: 120, color: VP.neonDim, letterSpacing: ".1em" }} aria-hidden>{initials}</span>
                            </div>
                        )}
                        <span aria-hidden style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: 2, background: `linear-gradient(90deg, ${VP.neon}, transparent 70%)`, boxShadow: VP.glowStrong }} />
                    </div>
                </section>

                {/* ② 熱量パネル（常時 — メッセージ1）。Bond数はNetworkに一本化 */}
                <HeatPanel
                    slug={slug}
                    initialCheerCount={profile.cheerCount ?? 0}
                    sponsors={heatSponsors}
                    comments={heatComments}
                    planBadge={profile.sponsorPlan ? <SponsorBadge plan={profile.sponsorPlan} prominent /> : null}
                />

                {/* ⑤ タイムライン（常時 — メッセージ2「積み重ね」。直近3件） */}
                <TimelineStack
                    entries={timelineEntries}
                    mode="preview"
                    viewAllHref={`/u/${slug}/portfolio`}
                />

                {/* Cheer / Collect（主要アクション — 常時） */}
                <section id="cheer" aria-label="応援" style={{ scrollMarginTop: 90 }}>
                    <h2 style={vpSectionTitle}>Cheer</h2>
                    <div style={{ ...vpPanel, padding: 16, display: "flex", flexDirection: "column", gap: 12 }}>
                        <CheerButtonClient slug={profile.slug} initialCheerCount={profile.cheerCount ?? 0} roleColor={VP.neon} isOwn={isOwn} />
                        <CollectButtonClient slug={profile.slug} initialCollectorCount={collectorCount} roleColor={VP.neon} isOwn={isOwn} viewerSlug={viewerSlug} fullWidth />
                    </div>
                </section>

                {/* ③ マイルストーン（段階的開示 — バッジ帯＋サマリーのみ常時） */}
                <MilestoneBadgeRow
                    variant="compact"
                    milestones={milestones}
                    progress={{ cheerCount: profile.cheerCount ?? 0, streakDays, journeyCount, bondCount }}
                />

                {/* ④ ネットワーク（カウント＋CTAのみ常時、観客席は展開） */}
                <NetworkCard
                    slug={slug}
                    viewerSlug={viewerSlug}
                    isOwn={isOwn}
                    initialBonded={isBonded}
                    bondCount={bondCount}
                    bondingCount={bondingCount}
                    supporters={supporters}
                />

                {/* Career（段階的開示） */}
                <Expandable title={publicCareerLabel} summary={profile.sport ?? undefined}>
                    <CareerSection
                        roleColor={VP.neon}
                        bio={profile.bio}
                        sport={profile.sport}
                        region={profile.region}
                        prefecture={profile.prefecture}
                        joinedAt={joinedAt}
                        roleLabel={VP_ROLE_LABEL[profile.role]}
                        cheerCount={profile.cheerCount ?? 0}
                        isPublic={profile.isPublic}
                        slug={slug}
                        careerProfile={careerProfile}
                    />
                </Expandable>

                {/* Schedule（段階的開示 — 直近1件はヒーローのチップで既出） */}
                {publicSchedules.length > 0 ? (
                    <Expandable title="Schedule" summary={`公開中の予定 ${publicSchedules.length}件`}>
                        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                            {publicSchedules.map((s: { id: string; title: string; start_at: string; end_at: string | null; location: string | null; category: string }) => {
                                const cfg = CATEGORY_CONFIG[s.category as keyof typeof CATEGORY_CONFIG] ?? CATEGORY_CONFIG.other;
                                return (
                                    <div
                                        key={s.id}
                                        style={{
                                            padding: "12px 16px",
                                            borderRadius: 12,
                                            border: `1px solid ${VP.border}`,
                                            background: "rgba(255,255,255,0.02)",
                                            display: "grid",
                                            gridTemplateColumns: "auto minmax(0, 1fr)",
                                            gap: 10,
                                            alignItems: "center",
                                        }}
                                    >
                                        <span style={{ fontSize: 10, fontWeight: 800, color: cfg.color, padding: "4px 8px", borderRadius: 999, background: `${cfg.color}18`, border: `1px solid ${cfg.color}25`, flexShrink: 0 }}>
                                            {cfg.label}
                                        </span>
                                        <div style={{ minWidth: 0 }}>
                                            <p style={{ margin: "0 0 2px", fontSize: 13, fontWeight: 800, color: "rgba(255,255,255,.9)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{s.title}</p>
                                            <p style={{ margin: 0, fontSize: 11, color: VP.sub, fontFamily: VP_MONO_FONT, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                                                {new Date(s.start_at).toLocaleString("ja-JP")}{s.end_at ? ` - ${new Date(s.end_at).toLocaleString("ja-JP")}` : ""}
                                                {s.location ? ` · ${s.location}` : ""}
                                            </p>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </Expandable>
                ) : null}

                {/* Card（段階的開示 — QR付きプロフィールカード） */}
                <div id="card" style={{ scrollMarginTop: 90 }}>
                    <Expandable title="Card" summary="QR付きプロフィールカード">
                        <ProfileCardSection
                            profile={profile as unknown as ProfileData}
                            t={cardTheme}
                            roleColor={roleColor}
                            preloadQr
                            mode="public"
                        />
                    </Expandable>
                </div>

                {/* Share（段階的開示） */}
                <Expandable title="Share" summary="プロフィールを共有">
                    <ShareButtonClient profileUrl={profileUrl} referralUrl={referralUrl} displayName={profile.displayName} roleColor={VP.neon} slug={slug} />
                </Expandable>

                {/* 地域スポンサー広告 */}
                {regionalAd ? (
                    <section aria-label="地域スポンサー">
                        <p style={{ margin: "0 0 8px", fontSize: 10, letterSpacing: ".18em", fontFamily: VP_MONO_FONT, textTransform: "uppercase", color: VP.faint }}>あなたの地域のスポンサー</p>
                        <AdCard ad={regionalAd} size="medium" />
                    </section>
                ) : (
                    <section aria-label="スポンサー枠" style={{ borderRadius: 14, border: `1px dashed ${VP.neonBorder}`, background: VP.neonFaint, padding: "12px 14px" }}>
                        <p style={{ margin: "0 0 3px", fontSize: 10, letterSpacing: ".18em", fontFamily: VP_MONO_FONT, textTransform: "uppercase", color: VP.neonSoft }}>SPONSOR SLOT</p>
                        <p style={{ margin: 0, fontSize: 12, color: VP.sub }}>あなたの地域のスポンサー広告枠（空き枠）</p>
                    </section>
                )}

                {/* 招待CTA */}
                <section aria-label="招待" style={{ position: "relative", borderRadius: 20, padding: "32px 24px", background: `linear-gradient(135deg, ${VP.neonFaint} 0%, rgba(5,6,8,.6) 100%)`, border: `1px solid ${VP.neonBorder}`, textAlign: "center", overflow: "hidden" }}>
                    <span aria-hidden style={{ position: "absolute", top: 0, left: "10%", right: "10%", height: 1, background: `linear-gradient(90deg, transparent, ${VP.neon}88, transparent)` }} />
                    <p style={{ position: "relative", zIndex: 1, fontSize: 9, fontFamily: VP_MONO_FONT, letterSpacing: ".28em", textTransform: "uppercase", color: VP.faint, margin: "0 0 10px" }}>INVITE</p>
                    <p style={{ position: "relative", zIndex: 1, fontSize: 15, color: VP.sub, margin: "0 0 22px", lineHeight: 1.75 }}>
                        <span style={{ color: VP.text, fontWeight: 800 }}>{profile.displayName}</span> の紹介で<br />Vizion Connection に参加しませんか？
                    </p>
                    <a href={referralUrl} className="vp-cta vp-cta-primary" style={{ position: "relative", zIndex: 1 }}>
                        無料で登録する
                        <IconArrowRight size={13} />
                    </a>
                    <p style={{ position: "relative", zIndex: 1, fontSize: 10, color: VP.faint, margin: "14px 0 0" }}>完全無料 · いつでも退会可</p>
                </section>
            </main>
        </div>
    );
}
