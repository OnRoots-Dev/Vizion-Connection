// app/(app)/u/[slug]/page.tsx

import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getPublicProfileBySlug } from "@/features/profile/server/get-profile-by-slug";
import { env } from "@/lib/env";
import type { UserRole } from "@/features/auth/types";
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
import PublicProfileTabs from "./PublicProfileTabs";
import BondAudience from "./BondAudience";
import { supabaseServer } from "@/lib/supabase/server";
import { CATEGORY_CONFIG } from "@/types/schedule";
import PublicProfileCountValue from "./PublicProfileCountValue";
import Image from "next/image";
import Link from "next/link";
import ShareButtonClient from "@/components/profile/ShareButtonClient";
import { ProfilePortfolioNav } from "./ProfilePortfolioNav";

function _jstKey(d: Date): string {
    return new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Tokyo", year: "numeric", month: "2-digit", day: "2-digit" }).format(d);
}
function _shiftDate(d: Date, n: number): Date {
    const r = new Date(d); r.setDate(r.getDate() + n); return r;
}
function computePublicStreak(rows: Array<{ created_at: string }>): number {
    const days = new Set(rows.map(r => _jstKey(new Date(r.created_at))));
    const today = _jstKey(new Date());
    const yesterday = _jstKey(_shiftDate(new Date(), -1));
    if (!days.has(today) && !days.has(yesterday)) return 0;
    let count = 0;
    let cursor = days.has(today) ? new Date() : _shiftDate(new Date(), -1);
    while (days.has(_jstKey(cursor))) { count++; cursor = _shiftDate(cursor, -1); }
    return count;
}

const ROLE_COLOR: Record<UserRole, string> = {
    Athlete: "#FF5050", Trainer: "#32D278", Crew: "#B8860B", Business: "#1B3A8C",
    Admin: "#7C3AED",
};
const ROLE_GRADIENT: Record<UserRole, string> = {
    Athlete: "#3D0000", Trainer: "#002211", Crew: "#221500", Business: "#000D30",
    Admin: "#1F0F2E",
};
const ROLE_LABEL: Record<UserRole, string> = {
    Athlete: "ATHLETE", Trainer: "TRAINER", Crew: "CREW", Business: "BUSINESS",
    Admin: "ADMIN",
};
const ROLE_LABEL_JA: Record<UserRole, string> = {
    Athlete: "アスリート", Trainer: "トレーナー", Crew: "クルー", Business: "ビジネス",
    Admin: "管理",
};
const PUBLIC_PROFILE_FONT = "var(--font-noto), 'Hiragino Sans', 'Yu Gothic', sans-serif";
const PUBLIC_PROFILE_CONDENSED_FONT = "'Arial Narrow', 'Helvetica Neue', var(--font-noto), sans-serif";
const X_PATH = "M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.746l7.73-8.835L1.254 2.25H8.08l4.253 5.622zm-1.161 17.52h1.833L7.084 4.126H5.117z";
const IG_PATH = "M7.8 2h8.4C19.4 2 22 4.6 22 7.8v8.4a5.8 5.8 0 01-5.8 5.8H7.8C4.6 22 2 19.4 2 16.2V7.8A5.8 5.8 0 017.8 2zm-.2 2A3.6 3.6 0 004 7.6v8.8C4 18.39 5.61 20 7.6 20h8.8a3.6 3.6 0 003.6-3.6V7.6C20 5.61 18.39 4 16.4 4H7.6zm9.65 1.5a1.25 1.25 0 110 2.5 1.25 1.25 0 010-2.5zM12 7a5 5 0 110 10A5 5 0 0112 7zm0 2a3 3 0 100 6 3 3 0 000-6z";
const TK_PATH = "M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1V9.01a6.3 6.3 0 00-.79-.05 6.34 6.34 0 00-6.34 6.34 6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.33-6.34V8.69a8.18 8.18 0 004.78 1.52V6.77a4.85 4.85 0 01-1.01-.08z";

function roleColorForLink(_role: UserRole, fallback: string) {
    return fallback;
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
        description: `${displayName} は Vizion Connection の ${ROLE_LABEL_JA[role]} です。`,
        openGraph: {
            title: `${displayName} | Vizion Connection`,
            description: `${ROLE_LABEL_JA[role]} として活動中`,
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
    const [collectorCount, rawCareerProfile, ads, publicSchedules, journeyCount, bondCount, journeyDates] = await Promise.all([
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
    ]);
    const streakDays = computePublicStreak(journeyDates);
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
    const careerProfile = rawCareerProfile && (isOwn || rawCareerProfile.visibility === "public") ? rawCareerProfile : null;
    const regionalAd = ads.find((ad) => ad.adScope === "regional" || isLocalPlan(ad.plan)) ?? null;

    const referralUrl = `${env.NEXT_PUBLIC_BASE_URL}/register?ref=${slug}`;
    const joinedAt = new Date(profile.createdAt).toLocaleDateString("ja-JP", { year: "numeric", month: "short", day: "numeric" });
    const rl = ROLE_COLOR[profile.role];
    const bg1 = ROLE_GRADIENT[profile.role];
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
    const cardTheme = { bg: "#07070e", surface: "#0d0d1a", border: "rgba(255,255,255,0.08)", text: "#ffffff", sub: "rgba(255,255,255,0.45)" };
    const publicCareerLabel = profile.role === "Athlete"
        ? "Career"
        : profile.role === "Trainer"
            ? "Expertise"
            : profile.role === "Business"
                ? "Portfolio"
                : "Community";

    const isAthlete = profile.role === "Athlete";
    const createdAt = new Date(profile.createdAt);
    const monthsActive = Math.max(
        1,
        (new Date().getFullYear() - createdAt.getFullYear()) * 12 + (new Date().getMonth() - createdAt.getMonth()) + 1,
    );
    const profileUrl = `${env.NEXT_PUBLIC_BASE_URL}/u/${slug}`;

    if (isAthlete) {
        const displayNameParts = profile.displayName.split(/\s+/).filter(Boolean);
        const nameFirst = displayNameParts.length >= 2 ? displayNameParts.slice(0, -1).join(" ") : "";
        const nameLast = displayNameParts.length >= 2 ? displayNameParts.at(-1) ?? profile.displayName : profile.displayName;

        const athleteEyebrow = ["Athlete", profile.sportsCategory, profile.sport].filter(Boolean).join(" · ");
        const athleteBio = careerProfile?.bio_career || profile.bio || "";
        const activeStatus = careerProfile?.tagline ? "現役・調整中" : "現役";
        const recruitStatus = profile.sponsorPlan ? "スポンサー" : "スポンサー募集中";

        const photoUrl = profile.profileImageUrl || profile.avatarUrl || profile.bannerUrl || null;
        const nextSchedule = publicSchedules[0] ?? null;
        const nextScheduleDate = nextSchedule?.start_at
            ? new Date(nextSchedule.start_at).toLocaleDateString("ja-JP", { month: "numeric", day: "numeric" })
            : null;
        const nextEventLabel = nextScheduleDate ? `次戦 ${nextScheduleDate}` : "次戦 未設定";

        return (
            <div style={{ minHeight: "100vh", background: "#080c14", color: "#fff", fontFamily: PUBLIC_PROFILE_FONT }}>
                <PublicProfileRealtime slug={slug} />
                <style>{`
                    :root{
                      --accent:${rl};
                      --accent-soft: color-mix(in srgb, ${rl} 70%, #ffffff);
                      --accent-weak: color-mix(in srgb, ${rl} 24%, transparent);
                      --accent-border: color-mix(in srgb, ${rl} 45%, transparent);
                      --green:#10b981;
                      --gold:#f59e0b;
                      --navy:#080c14;
                      --navy2:#0c1020;
                      --navy3:#111528;
                      --g1:#8896b3;
                      --g2:#4a5578;
                    }
                    *, *::before, *::after{ box-sizing:border-box; }
                    a{ color:inherit; text-decoration:none; }
                    .a-header{
                      position:sticky;
                      top:0;
                      z-index:60;
                      border-bottom:1px solid rgba(255,255,255,0.08);
                      background:rgba(8,12,20,.86);
                      backdrop-filter: blur(22px);
                      -webkit-backdrop-filter: blur(22px);
                    }
                    .a-header-inner{
                      max-width: 980px;
                      margin: 0 auto;
                      padding: 0 20px;
                      height: 72px;
                      display:flex;
                      align-items:center;
                      justify-content:center;
                    }
                    .a-subnav{
                      display:flex;
                      align-items:center;
                      justify-content:center;
                      gap: 8px;
                      padding: 0 14px 14px;
                      flex-wrap: wrap;
                      border-top: 1px solid rgba(255,255,255,0.05);
                    }
                    .a-nav-item{
                      padding:7px 12px;
                      font-size:10px;
                      font-weight:800;
                      letter-spacing:.16em;
                      text-transform:uppercase;
                      color:rgba(255,255,255,0.45);
                      cursor:pointer;
                      border-radius: 999px;
                      transition: color .15s, background .15s, border-color .15s;
                      border: 1px solid rgba(255,255,255,0.08);
                      background: rgba(255,255,255,0.03);
                    }
                    .a-nav-item:hover{ color:#fff; border-color: var(--accent-border); background: var(--accent-weak); }
                    .a-nav-item.act{ color:#fff; border-color: var(--accent-border); background: var(--accent-weak); }
                    .a-hero{ display:grid; grid-template-columns:1fr 1fr; min-height:calc(100vh - 52px); }
                    .a-hero-l{
                      padding:56px;
                      display:flex;
                      flex-direction:column;
                      justify-content:center;
                      background:linear-gradient(105deg,var(--navy) 55%,rgba(8,12,20,.8) 100%);
                    }
                    .a-eyebrow-text{
                      font-size:12px;
                      font-weight:700;
                      letter-spacing:.22em;
                      text-transform:uppercase;
                      color:var(--accent-soft);
                    }
                    .a-name-first{
                      font-family: ${PUBLIC_PROFILE_CONDENSED_FONT};
                      font-size:48px;
                      color:var(--g1);
                      letter-spacing:.01em;
                      margin-top: 12px;
                    }
                    .a-name-last{
                      font-family: var(--font-bebas), BebasNeue, sans-serif;
                      font-size:120px;
                      line-height:.9;
                      margin-top: 2px;
                    }
                    .a-catch{
                      margin-top:16px;
                      padding-left:12px;
                      border-left:2px solid var(--accent);
                      color:var(--g1);
                      font-weight: 700;
                      letter-spacing: .02em;
                    }
                    .a-bio{
                      margin-top:20px;
                      line-height:1.8;
                      color:var(--g1);
                      max-width:500px;
                      white-space: pre-wrap;
                    }
                    .a-status-row{ display:flex; gap:8px; flex-wrap:wrap; margin-top:20px; }
                    .a-status{
                      padding:6px 12px;
                      border-radius:4px;
                      font-size:10px;
                      font-weight:700;
                      letter-spacing:.12em;
                      text-transform:uppercase;
                    }
                    .s-active{ background:rgba(16,185,129,.12); border:1px solid rgba(16,185,129,.3); color:var(--green); }
                    .s-recruit{ background: var(--accent-weak); border:1px solid var(--accent-border); color:var(--accent-soft); }
                    .s-event{ background:rgba(245,158,11,.1); border:1px solid rgba(245,158,11,.25); color:var(--gold); }
                    .a-stats{ display:grid; grid-template-columns:repeat(4,1fr); gap:1px; margin-top:28px; background: var(--accent-weak); }
                    .a-stat{ background:var(--navy2); padding:20px; text-align:center; }
                    .a-stat-num{ font-family: var(--font-bebas), BebasNeue, sans-serif; font-size:42px; }
                    .a-stat-label{ font-size:10px; letter-spacing:.14em; text-transform:uppercase; color:var(--g2); margin-top: 4px; }
                    .a-btns{ display:flex; gap:10px; margin-top:28px; flex-wrap: wrap; }
                    .a-btn-p{ padding:14px 24px; background:var(--accent); border:1px solid var(--accent-border); color:#fff; font-weight:700; cursor:pointer; }
                    .a-btn-cheer{ padding:14px 24px; background:transparent; border:1px solid rgba(245,158,11,.3); color:var(--gold); cursor:pointer; }
                    .a-btn-g{ padding:14px 24px; background:transparent; border:1px solid rgba(255,255,255,.1); color:#fff; cursor:pointer; }
                    .a-btn-p,.a-btn-cheer,.a-btn-g{ border-radius: 12px; transition: filter .15s, transform .15s; }
                    .a-btn-p:hover,.a-btn-cheer:hover,.a-btn-g:hover{ filter: brightness(1.08); transform: translateY(-1px); }
                    .a-hero-r{ display:flex; align-items:center; justify-content:center; background:linear-gradient(150deg,var(--navy3),#0f1830 100%); }
                    .a-photo-mock{ width:70%; height:80%; position: relative; display:flex; align-items:center; justify-content:center; border:1px solid var(--accent-border); color:var(--accent-weak); font-family: var(--font-bebas), BebasNeue, sans-serif; letter-spacing:.4em; overflow:hidden; border-radius: 18px; }
                    .a-photo-mock img{ width:100%; height:100%; object-fit:cover; filter:saturate(1.05) contrast(1.05); opacity:.92; }
                    .a-photo-overlay{ position:absolute; inset:0; background: linear-gradient(180deg, rgba(8,12,20,0.08), rgba(8,12,20,0.78)); }
                    .a-section{ padding: 30px 56px 56px; }
                    .a-section h2{ margin: 0 0 14px; font-size: 12px; font-weight: 800; letter-spacing: .22em; text-transform: uppercase; color: var(--accent-soft); }
                    .a-panel{ background: rgba(12,16,32,0.65); border: 1px solid rgba(255,255,255,0.08); border-radius: 16px; padding: 18px; }
                    @media (max-width:900px){
                      .a-header-inner{ padding: 0 16px; }
                      .a-hero{ grid-template-columns:1fr; }
                      .a-hero-l{ padding: 32px 18px; }
                      .a-name-last{ font-size:72px; }
                      .a-stats{ grid-template-columns:repeat(2,1fr); }
                      .a-hero-r{ padding: 22px 0 34px; }
                      .a-photo-mock{ width: 86%; height: 360px; }
                      .a-section{ padding: 20px 18px 44px; }
                    }
                `}</style>

                <header className="a-header">
                    <div className="a-header-inner" style={{ justifyContent: "space-between", gap: 12 }}>
                        <Image
                            src="/images/Vizion_Connection_logo-wt.png"
                            alt="Vizion Connection"
                            width={230}
                            height={46}
                            priority
                            style={{ height: 40, width: "auto", opacity: 0.95 }}
                        />
                        <ProfilePortfolioNav slug={slug} active="profile" accent={rl} />
                    </div>
                    <nav className="a-subnav">
                        <a className="a-nav-item act" href="#overview">Overview</a>
                        {careerProfile?.stats?.length ? <a className="a-nav-item" href="#performance">Performance</a> : null}
                        <a className="a-nav-item" href="#career">Career</a>
                        <a className="a-nav-item" href="#skills">Skills</a>
                        <a className="a-nav-item" href="#gallery">Gallery</a>
                        <a className="a-nav-item" href="#sns">SNS</a>
                        <a className="a-nav-item" href="#cheer">Cheer</a>
                        <a className="a-nav-item" href="#bond">Bond</a>
                        <a className="a-nav-item" href="#offer">Offer</a>
                        <a className="a-nav-item" href="#share">Share</a>
                    </nav>
                </header>

                <section id="overview" className="a-hero" style={{ scrollMarginTop: 60 }}>
                    <div className="a-hero-l">
                        <div className="a-eyebrow-text">{athleteEyebrow}</div>
                        {nameFirst ? <div className="a-name-first">{nameFirst}</div> : null}
                        <div className="a-name-last">{nameLast}</div>

                        {profile.claim?.trim() ? (
                            <div className="a-catch">&quot;{profile.claim.trim()}&quot;</div>
                        ) : (
                            <div className="a-catch">&quot;速さは、嘘をつかない。&quot;</div>
                        )}

                        {athleteBio ? <div className="a-bio">{athleteBio}</div> : null}

                        <div className="a-status-row">
                            <div className="a-status s-active">{activeStatus}</div>
                            <div className="a-status s-recruit">{recruitStatus}</div>
                            <div className="a-status s-event">{nextEventLabel}</div>
                        </div>

                        <div className="a-stats">
                            <div className="a-stat">
                                <div className="a-stat-num">
                                    <PublicProfileCountValue slug={slug} initialValue={profile.cheerCount ?? 0} field="cheerCount" />
                                </div>
                                <div className="a-stat-label">Cheer</div>
                            </div>
                            <div className="a-stat">
                                <div className="a-stat-num">
                                    <PublicProfileCountValue slug={slug} initialValue={collectorCount} field="collectorCount" />
                                </div>
                                <div className="a-stat-label">Supporters</div>
                            </div>
                            <div className="a-stat">
                                <div className="a-stat-num">{profile.sponsorPlan ? "1" : "0"}</div>
                                <div className="a-stat-label">Business Cheer</div>
                            </div>
                            <div className="a-stat">
                                <div className="a-stat-num">{monthsActive}</div>
                                <div className="a-stat-label">継続月</div>
                            </div>
                        </div>

                        <div className="a-btns">
                            <Link className="a-btn-p" href={`/r/${slug}`}>Offer を送る</Link>
                            <a className="a-btn-cheer" href="#cheer">🔥 Cheer する</a>
                            <a className="a-btn-g" href="#share">シェア</a>
                        </div>
                    </div>

                    <div className="a-hero-r">
                        <div className="a-photo-mock">
                            {photoUrl ? (
                                <>
                                    <Image
                                        src={photoUrl}
                                        alt={profile.displayName}
                                        fill
                                        sizes="(min-width: 900px) 45vw, 86vw"
                                        priority
                                        style={{ objectFit: "cover", objectPosition: "center top" }}
                                    />
                                    <div className="a-photo-overlay" />
                                </>
                            ) : (
                                "ATHLETE PHOTO"
                            )}
                        </div>
                    </div>
                </section>

                {careerProfile?.stats?.length ? (
                    <div className="a-section" id="performance" style={{ scrollMarginTop: 60, paddingTop: 10 }}>
                        <h2>Performance</h2>
                        <div className="a-panel">
                            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: 10 }}>
                                {careerProfile.stats
                                    .filter((s) => s?.label || s?.value)
                                    .map((stat, i) => (
                                        <div
                                            key={`${stat.label ?? "stat"}-${i}`}
                                            style={{
                                                padding: "14px 16px",
                                                borderRadius: 14,
                                                background: "rgba(255,255,255,0.03)",
                                                border: "1px solid rgba(255,255,255,0.06)",
                                            }}
                                        >
                                            <div style={{ fontSize: 9, fontFamily: "monospace", letterSpacing: "0.16em", textTransform: "uppercase", color: "rgba(255,255,255,0.26)", marginBottom: 6 }}>
                                                {stat.label || "-"}
                                            </div>
                                            <div style={{ fontSize: 24, fontWeight: 900, lineHeight: 1, color: stat.color === "gold" ? "#FFD600" : stat.color === "role" ? rl : "rgba(255,255,255,0.88)" }}>
                                                {stat.value || "-"}
                                            </div>
                                        </div>
                                    ))}
                            </div>
                        </div>
                    </div>
                ) : null}

                <div className="a-section" id="career" style={{ scrollMarginTop: 60 }}>
                    <h2>Career</h2>
                    <div className="a-panel">
                        <CareerSection
                            roleColor={rl}
                            bio={profile.bio}
                            sport={profile.sport}
                            region={profile.region}
                            prefecture={profile.prefecture}
                            joinedAt={joinedAt}
                            roleLabel={ROLE_LABEL[profile.role]}
                            cheerCount={profile.cheerCount ?? 0}
                            isPublic={profile.isPublic}
                            slug={slug}
                            careerProfile={careerProfile}
                        />
                    </div>
                </div>

                <div className="a-section" id="skills" style={{ scrollMarginTop: 60 }}>
                    <h2>Skills</h2>
                    <div className="a-panel">
                        {careerProfile?.skills?.length ? (
                            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                                {careerProfile.skills.map((sk) => (
                                    <div key={sk.name} style={{ display: "grid", gridTemplateColumns: "minmax(0,1fr) auto", gap: 10, alignItems: "center" }}>
                                        <div style={{ minWidth: 0 }}>
                                            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                                                <span style={{ fontSize: 13, fontWeight: 700, color: "rgba(255,255,255,0.86)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{sk.name}</span>
                                                {sk.isHighlight ? <span style={{ fontSize: 10, color: "#FFD600", fontWeight: 900 }}>★</span> : null}
                                            </div>
                                            <div style={{ height: 4, borderRadius: 999, background: "rgba(255,255,255,0.08)", overflow: "hidden" }}>
                                                <div style={{ width: `${sk.level}%`, height: "100%", borderRadius: 999, background: sk.isHighlight ? "linear-gradient(90deg, #FFD600, rgba(255,214,0,0.25))" : `linear-gradient(90deg, ${rl}, ${rl}45)` }} />
                                            </div>
                                        </div>
                                        <div style={{ fontFamily: "monospace", fontSize: 12, color: "rgba(255,255,255,0.5)", fontWeight: 800 }}>{sk.level}</div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p style={{ margin: 0, color: "rgba(255,255,255,0.55)", fontSize: 13 }}>スキルはまだ登録されていません</p>
                        )}
                    </div>
                </div>

                <div className="a-section" id="gallery" style={{ scrollMarginTop: 60 }}>
                    <h2>Gallery</h2>
                    <div className="a-panel">
                        <p style={{ margin: 0, color: "rgba(255,255,255,0.55)", fontSize: 13 }}>ギャラリーは準備中です</p>
                    </div>
                </div>

                <div className="a-section" id="sns" style={{ scrollMarginTop: 60 }}>
                    <h2>SNS</h2>
                    <div className="a-panel">
                        {snsLinks.length ? (
                            <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                                {snsLinks.map((s) => (
                                    <a key={s.label} href={s.href!} target="_blank" rel="noopener noreferrer"
                                        style={{ padding: "10px 12px", borderRadius: 12, background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", color: "rgba(255,255,255,0.78)", fontSize: 12, fontWeight: 700 }}>
                                        {s.label}
                                    </a>
                                ))}
                            </div>
                        ) : (
                            <p style={{ margin: 0, color: "rgba(255,255,255,0.55)", fontSize: 13 }}>SNSリンクは未設定です</p>
                        )}
                    </div>
                </div>

                <div className="a-section" id="cheer" style={{ scrollMarginTop: 60 }}>
                    <h2>Cheer</h2>
                    <div className="a-panel">
                        <CheerButtonClient slug={profile.slug} initialCheerCount={profile.cheerCount ?? 0} roleColor={rl} isOwn={isOwn} />
                    </div>
                </div>

                <div className="a-section" id="bond" style={{ scrollMarginTop: 60 }}>
                    <h2>Bond</h2>
                    <BondAudience bondCount={bondCount} isBonded={isBonded} />
                </div>

                <div className="a-section" id="offer" style={{ scrollMarginTop: 60 }}>
                    <h2>Offer</h2>
                    <div className="a-panel" style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                        <Link href={`/r/${slug}`} className="a-btn-p" style={{ display: "inline-flex", justifyContent: "center" }}>Offer を送る</Link>
                        <CollectButtonClient slug={profile.slug} initialCollectorCount={collectorCount} roleColor={rl} isOwn={isOwn} viewerSlug={viewerSlug} fullWidth />
                    </div>
                </div>

                <div className="a-section" id="share" style={{ scrollMarginTop: 60, paddingTop: 10 }}>
                    <h2>Share</h2>
                    <div className="a-panel">
                        <ShareButtonClient profileUrl={profileUrl} referralUrl={referralUrl} displayName={profile.displayName} roleColor={rl} slug={slug} />
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div style={{ minHeight: "100vh", background: "#07070e", color: "#fff", overflowX: "hidden" }}>
            <PublicProfileRealtime slug={slug} />
            <style>{`
                *, *::before, *::after { box-sizing: border-box; }
                a { text-decoration: none; }
                body { margin: 0; }
                @keyframes _fadeUp   { from{opacity:0;transform:translateY(32px)} to{opacity:1;transform:translateY(0)} }
                @keyframes _fadeIn   { from{opacity:0} to{opacity:1} }
                @keyframes _scaleIn  { from{opacity:0;transform:scale(0.88)} to{opacity:1;transform:scale(1)} }
                @keyframes _slideX   { from{transform:scaleX(0)} to{transform:scaleX(1)} }
                @keyframes _ticker   { from{transform:translateX(0)} to{transform:translateX(-50%)} }
                @keyframes _glowPop  { 0%{box-shadow:0 0 0 0 ${rl}60} 70%{box-shadow:0 0 0 18px transparent} 100%{box-shadow:0 0 0 0 transparent} }
                @keyframes _float    { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-5px)} }
                .u1{animation:_fadeUp .75s cubic-bezier(.16,1,.3,1) .05s both}
                .u2{animation:_fadeUp .75s cubic-bezier(.16,1,.3,1) .14s both}
                .u3{animation:_fadeUp .75s cubic-bezier(.16,1,.3,1) .23s both}
                .u4{animation:_fadeUp .75s cubic-bezier(.16,1,.3,1) .32s both}
                .u5{animation:_fadeUp .75s cubic-bezier(.16,1,.3,1) .41s both}
                .u6{animation:_fadeUp .75s cubic-bezier(.16,1,.3,1) .50s both}
                .u7{animation:_fadeUp .75s cubic-bezier(.16,1,.3,1) .60s both}
                .fi{animation:_fadeIn .9s ease .08s both}
                .rline{display:block;height:2px;border-radius:2px;transform-origin:left;animation:_slideX .9s cubic-bezier(.16,1,.3,1) .25s both}
                .float{animation:_float 3.8s ease-in-out infinite}
                .tkwrap{overflow:hidden;padding:9px 0;border-top:1px solid rgba(255,255,255,0.045);border-bottom:1px solid rgba(255,255,255,0.045);white-space:nowrap;}
                .tkinner{display:inline-flex;gap:56px;animation:_ticker 32s linear infinite;}
                .tkitem{font-family:monospace;font-size:9.5px;letter-spacing:.28em;text-transform:uppercase;color:rgba(255,255,255,.09);flex-shrink:0;}
                .sc{transition:transform .18s ease,background .18s ease;}
                .sc:hover{transform:translateY(-2px);background:rgba(255,255,255,.055) !important;}
                .snsb{transition:transform .15s,opacity .15s;}
                .snsb:hover{transform:translateY(-2px);opacity:.85;}
                .cheerb button{transition:all .2s;}
                .cheerb button:not(:disabled):hover{filter:brightness(1.12);transform:translateY(-1px);}
                .ctabtn{transition:filter .18s,transform .18s;display:inline-flex;align-items:center;}
                .ctabtn:hover{filter:brightness(1.1);transform:translateY(-1px);}
                .noise::after{content:'';position:absolute;inset:0;pointer-events:none;z-index:1;background-image:url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.04'/%3E%3C/svg%3E");background-size:180px 180px;opacity:.45;mix-blend-mode:overlay;}
            `}</style>

            {/* Ambient BG */}
            <div style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 0, overflow: "hidden" }}>
                <div style={{ position: "absolute", top: "-15%", left: "50%", transform: "translateX(-50%)", width: "900px", height: "600px", background: `radial-gradient(ellipse 55% 55% at 50% 50%, ${rl}22 0%, transparent 70%)`, filter: "blur(1px)" }} />
                <div style={{ position: "absolute", top: 0, left: 0, width: "300px", height: "300px", background: `radial-gradient(circle, ${bg1} 0%, transparent 70%)`, opacity: .6 }} />
                <div style={{ position: "absolute", top: 0, right: 0, width: "300px", height: "300px", background: `radial-gradient(circle, ${bg1} 0%, transparent 70%)`, opacity: .4 }} />
                <div style={{ position: "absolute", inset: 0, backgroundImage: `repeating-linear-gradient(135deg, ${rl}06 0px, ${rl}06 1px, transparent 1px, transparent 60px)` }} />
            </div>

            {/* Header */}
            <header className="fi" style={{ position: "sticky", top: 0, zIndex: 40, borderBottom: "1px solid rgba(255,255,255,0.08)", background: "rgba(7,7,14,0.82)", backdropFilter: "blur(28px)", WebkitBackdropFilter: "blur(28px)" }}>
                <div style={{ maxWidth: "980px", margin: "0 auto", padding: "0 20px", height: 76, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
                    <Image
                        src="/images/Vizion_Connection_logo-wt.png"
                        alt="Vizion Connection"
                        width={230}
                        height={46}
                        priority
                        style={{ height: 46, width: "auto", opacity: 0.95 }}
                    />
                    <ProfilePortfolioNav slug={slug} active="profile" accent={rl} />
                </div>
            </header>

            <main style={{ maxWidth: "980px", margin: "0 auto", position: "relative", zIndex: 1, paddingBottom: 100 }}>

                {/* HERO */}
                <div className="noise" style={{ position: "relative", minHeight: 420, overflow: "hidden", borderRadius: 20, border: "1px solid rgba(255,255,255,0.08)", background: "#0d0d1a" }}>
                    {profile.profileImageUrl ? (
                        <Image
                            src={profile.profileImageUrl}
                            alt=""
                            fill
                            sizes="(min-width: 980px) 980px, 100vw"
                            priority
                            style={{ objectFit: "cover", objectPosition: "center top", opacity: 0.38, filter: "saturate(1.2) contrast(1.05)" }}
                        />
                    ) : (
                        <div style={{ position: "absolute", inset: 0, background: `linear-gradient(145deg, ${bg1} 0%, #050508 100%)` }}>
                            <div style={{ position: "absolute", inset: 0, fontSize: "22vw", fontWeight: 900, color: `${rl}07`, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "monospace", userSelect: "none" }}>{initials}</div>
                        </div>
                    )}
                    <div style={{ position: "absolute", inset: 0, background: `linear-gradient(to top, #07070e 0%, rgba(7,7,14,.62) 40%, rgba(7,7,14,.08) 100%)` }} />
                    <div style={{ position: "absolute", inset: 0, background: `linear-gradient(to right, rgba(7,7,14,.78) 0%, rgba(7,7,14,.1) 55%, transparent 100%)` }} />
                    <div style={{ position: "absolute", inset: 0, background: `linear-gradient(155deg, ${bg1}70 0%, transparent 55%)` }} />
                    <div style={{ position: "absolute", top: "-20%", right: "-5%", width: 340, height: 340, background: `radial-gradient(circle, ${rl}22, transparent 68%)`, pointerEvents: "none" }} />
                    <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: 1, background: `linear-gradient(90deg, ${rl}70, transparent 60%)` }} />

                    <div style={{ position: "relative", zIndex: 2, padding: "40px 24px 32px" }}>
                        <div className="u1" style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 20 }}>
                            {profile.isFoundingMember ? <FoundingMemberBadge /> : <EarlyPartnerBadge />}
                            {serialDisplay && <span style={{ fontSize: 10, fontFamily: "monospace", color: "rgba(255,255,255,.22)", background: "rgba(255,255,255,.04)", border: "1px solid rgba(255,255,255,.08)", padding: "2px 8px", borderRadius: 4 }}>{serialDisplay}</span>}
                            {foundingDisplay && <span style={{ fontSize: 10, fontFamily: "monospace", color: "rgba(255,255,255,.22)", background: "rgba(255,255,255,.04)", border: "1px solid rgba(255,255,255,.08)", padding: "2px 8px", borderRadius: 4 }}>{foundingDisplay}</span>}
                        </div>
                        <div className="u1" style={{ display: "flex", alignItems: "center", gap: 9, marginBottom: 10 }}>
                            <span className="rline" style={{ width: 28, background: rl }} />
                            <span style={{ fontSize: 10, fontFamily: "monospace", fontWeight: 800, letterSpacing: ".32em", textTransform: "uppercase", color: `${rl}dd` }}>
                                {ROLE_LABEL[profile.role]}
                                {profile.sportsCategory ? ` · ${profile.sportsCategory}` : ""}
                                {profile.sport ? ` · ${profile.sport}` : ""}
                                {profile.stance ? ` · ${profile.stance}` : ""}
                            </span>
                        </div>
                        <div className="u2" style={{ display: "flex", alignItems: "flex-end", gap: 10, flexWrap: "wrap", marginBottom: 8 }}>
                            <h1 className="font-display" style={{ fontSize: "clamp(44px,10vw,66px)", fontWeight: 400, color: "#fff", margin: 0, lineHeight: .92, letterSpacing: "-.01em", textShadow: `0 0 40px ${rl}30, 0 2px 20px rgba(0,0,0,.7)` }}>
                                {profile.displayName}
                            </h1>
                            {profile.verified && (
                                <span style={{ display: "inline-flex", alignItems: "center", gap: 4, padding: "3px 9px 3px 5px", borderRadius: 20, background: `${rl}20`, border: `1px solid ${rl}55`, color: rl, fontSize: 9.5, fontWeight: 800, letterSpacing: ".1em", marginBottom: 6 }}>
                                    <svg width={10} height={10} viewBox="0 0 24 24" fill={rl}><path fillRule="evenodd" d="M8.603 3.799A4.49 4.49 0 0112 2.25c1.357 0 2.573.6 3.397 1.549a4.49 4.49 0 013.498 1.307 4.491 4.491 0 011.307 3.497A4.49 4.49 0 0121.75 12a4.49 4.49 0 01-1.549 3.397 4.491 4.491 0 01-1.307 3.497 4.491 4.491 0 01-3.497 1.307A4.49 4.49 0 0112 21.75a4.49 4.49 0 01-3.397-1.549 4.491 4.491 0 01-3.497-1.307 4.491 4.491 0 01-1.307-3.497A4.49 4.49 0 012.25 12c0-1.357.6-2.573 1.549-3.397a4.491 4.491 0 011.307-3.497 4.49 4.49 0 013.497-1.307zm7.007 6.387a.75.75 0 10-1.22-.872l-3.236 4.53L9.53 12.22a.75.75 0 00-1.06 1.06l2.25 2.25a.75.75 0 001.14-.094l3.75-5.25z" clipRule="evenodd" /></svg>
                                    VERIFIED
                                </span>
                            )}
                        </div>
                        {profile.claim?.trim() ? (
                            <div className="u2" style={{ marginBottom: 14, maxWidth: 560 }}>
                                <div style={{ position: "relative", padding: "14px 16px", borderRadius: 16, background: `${rl}10`, border: `1px solid ${rl}25`, overflow: "hidden" }}>
                                    <div style={{ position: "absolute", top: 6, right: 12, fontFamily: "monospace", fontSize: 28, fontWeight: 900, color: `${rl}22`, userSelect: "none" }}>&quot;</div>
                                    <p style={{ margin: 0, fontSize: 15, lineHeight: 1.75, color: "rgba(255,255,255,.82)", fontWeight: 800 }}>
                                        &quot;{profile.claim.trim()}&quot;
                                    </p>
                                </div>
                            </div>
                        ) : null}
                        {careerProfile?.tagline && (
                            <div className="u2" style={{ marginBottom: 14, maxWidth: 560 }}>
                                <p style={{ margin: 0, fontSize: 15, lineHeight: 1.7, color: "rgba(255,255,255,.74)", fontWeight: 700 }}>
                                    {careerProfile.tagline}
                                </p>
                            </div>
                        )}
                        <div className="u2" style={{ marginBottom: 10 }}>
                            <SponsorBadge plan={profile.sponsorPlan} prominent />
                        </div>
                        <div className="u2" style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 24 }}>
                            <span style={{ fontSize: 12, fontFamily: "monospace", color: "rgba(255,255,255,.32)", letterSpacing: ".04em" }}>@{profile.slug}</span>
                            {profile.region && <><span style={{ width: 3, height: 3, borderRadius: "50%", background: "rgba(255,255,255,.18)", display: "inline-block" }} /><span style={{ fontSize: 12, fontFamily: "monospace", color: "rgba(255,255,255,.32)" }}>{profile.region}</span></>}
                        </div>
                        <div className="u3" style={{ display: "flex", alignItems: "center", gap: 14, flexWrap: "wrap" }}>
                          <div style={{ position: "relative", width: 58, height: 58, flexShrink: 0 }}>
                            {/* Pulse 波動リング（アバター後ろ） */}
                            {[0, 0.8, 1.6].map((delay, i) => (
                                <span
                                    key={i}
                                    aria-hidden
                                    style={{
                                        position: "absolute",
                                        inset: 0,
                                        borderRadius: "50%",
                                        border: `1.5px solid ${rl}`,
                                        animation: `vcRing 2.4s ease-out ${delay}s infinite`,
                                        pointerEvents: "none",
                                    }}
                                />
                            ))}
                            <div className="float" style={{ position: "relative", zIndex: 1, width: 58, height: 58, borderRadius: "50%", overflow: "hidden", border: `2.5px solid ${rl}`, background: `linear-gradient(145deg, ${bg1}, #111)`, flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", boxShadow: `0 0 0 4px ${rl}18, 0 0 30px ${rl}45`, animation: "_glowPop 3s ease-in-out infinite, _float 3.8s ease-in-out infinite" }}>
                                {profile.avatarUrl ? (
                                    <Image
                                        src={profile.avatarUrl}
                                        alt={profile.displayName}
                                        width={58}
                                        height={58}
                                        style={{ width: "100%", height: "100%", objectFit: "cover" }}
                                    />
                                ) : (
                                    <span style={{ fontSize: 20, fontWeight: 900, color: `${rl}dd`, fontFamily: "monospace" }}>{initials}</span>
                                )}
                            </div>
                          </div>
                            <div style={{ display: "flex", flexDirection: "column", gap: 1 }}>
                                <span style={{ fontSize: 8.5, fontFamily: "monospace", letterSpacing: ".22em", textTransform: "uppercase", color: "rgba(255,210,0,.45)" }}>CHEER</span>
                                <span style={{ fontSize: 36, fontWeight: 900, color: "#FFD600", fontFamily: "monospace", lineHeight: 1, letterSpacing: "-.025em", textShadow: "0 0 24px rgba(255,214,0,.5)" }}>
                                    <PublicProfileCountValue slug={slug} initialValue={profile.cheerCount ?? 0} field="cheerCount" />
                                </span>
                            </div>
                            {/* コレクト数 */}
                            <div style={{ display: "flex", flexDirection: "column", gap: 1 }}>
                                <span style={{ fontSize: 8.5, fontFamily: "monospace", letterSpacing: ".22em", textTransform: "uppercase", color: `${rl}88` }}>COLLECTED</span>
                                <span style={{ fontSize: 28, fontWeight: 900, color: rl, fontFamily: "monospace", lineHeight: 1 }}>
                                    <PublicProfileCountValue slug={slug} initialValue={collectorCount} field="collectorCount" />
                                </span>
                            </div>
                            {snsLinks.length > 0 && (
                                <div style={{ display: "flex", gap: 7, marginLeft: "auto" }}>
                                    {snsLinks.map(s => (
                                        <a key={s.label} href={s.href!} target="_blank" rel="noopener noreferrer" className="snsb"
                                            style={{ width: 38, height: 38, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", background: `${rl}18`, border: `1px solid ${rl}35`, color: rl }}>
                                            <svg viewBox="0 0 24 24" width={13} height={13} fill="currentColor"><path d={s.path} /></svg>
                                        </a>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* TICKER */}
                <div className="tkwrap fi">
                    <div className="tkinner">
                        {Array.from({ length: 10 }).map((_, i) => (
                            <span key={i} className="tkitem">{profile.displayName} · {ROLE_LABEL[profile.role]} · VIZION CONNECTION ·</span>
                        ))}
                    </div>
                </div>

                <div className="u3" style={{ padding: "18px 20px 0" }}>
                    <div style={{ display: "grid", gap: 10, gridTemplateColumns: "repeat(auto-fit, minmax(170px, 1fr))" }}>
                        <div style={{ borderRadius: 18, border: "1px solid rgba(255,255,255,0.08)", background: "rgba(255,255,255,0.025)", padding: "14px 16px" }}>
                            <p style={{ margin: "0 0 8px", fontSize: 8, fontFamily: "monospace", letterSpacing: ".22em", textTransform: "uppercase", color: "rgba(255,255,255,0.35)" }}>Cheer</p>
                            <p style={{ margin: 0, fontSize: 22, fontWeight: 900, color: "#FFD600", lineHeight: 1.3, wordBreak: "break-word" }}>
                                <PublicProfileCountValue slug={slug} initialValue={profile.cheerCount ?? 0} field="cheerCount" />
                            </p>
                            <p style={{ margin: "6px 0 0", fontSize: 11, color: "rgba(255,255,255,0.45)" }}>リアクション</p>
                        </div>
                        <div style={{ borderRadius: 18, border: "1px solid rgba(255,255,255,0.08)", background: "rgba(255,255,255,0.025)", padding: "14px 16px" }}>
                            <p style={{ margin: "0 0 8px", fontSize: 8, fontFamily: "monospace", letterSpacing: ".22em", textTransform: "uppercase", color: "rgba(255,255,255,0.35)" }}>Collect</p>
                            <p style={{ margin: 0, fontSize: 22, fontWeight: 900, color: rl, lineHeight: 1.3, wordBreak: "break-word" }}>
                                <PublicProfileCountValue slug={slug} initialValue={collectorCount} field="collectorCount" />
                            </p>
                            <p style={{ margin: "6px 0 0", fontSize: 11, color: "rgba(255,255,255,0.45)" }}>コレクション数</p>
                        </div>
                        <div style={{ borderRadius: 18, border: "1px solid rgba(255,255,255,0.08)", background: "rgba(255,255,255,0.025)", padding: "14px 16px" }}>
                            <p style={{ margin: "0 0 8px", fontSize: 8, fontFamily: "monospace", letterSpacing: ".22em", textTransform: "uppercase", color: "rgba(255,255,255,0.35)" }}>Career</p>
                            <p style={{ margin: 0, fontSize: 15, fontWeight: 900, color: "#FFFFFF", lineHeight: 1.3, wordBreak: "break-word" }}>{careerProfile?.tagline ?? "Profile Ready"}</p>
                            <p style={{ margin: "6px 0 0", fontSize: 11, color: "rgba(255,255,255,0.45)" }}>{careerProfile ? "キャリアタグライン" : "公開プロフィール"}</p>
                        </div>
                        <div style={{ borderRadius: 18, border: "1px solid rgba(255,255,255,0.08)", background: "rgba(255,255,255,0.025)", padding: "14px 16px" }}>
                            <p style={{ margin: "0 0 8px", fontSize: 8, fontFamily: "monospace", letterSpacing: ".22em", textTransform: "uppercase", color: "rgba(255,255,255,0.35)" }}>Link</p>
                            <p style={{ margin: 0, fontSize: 22, fontWeight: 900, color: roleColorForLink(profile.role, rl), lineHeight: 1.3, wordBreak: "break-word" }}>@{profile.slug}</p>
                            <p style={{ margin: "6px 0 0", fontSize: 11, color: "rgba(255,255,255,0.45)" }}>共有しやすいURL</p>
                        </div>
                    </div>
                </div>

                <div style={{ padding: "24px 20px 0", display: "flex", flexDirection: "column", gap: 14 }}>
                    <PublicProfileTabs
                        roleColor={rl}
                        careerLabel={publicCareerLabel}
                        pulseStats={{
                            journeyCount,
                            streakDays,
                            cheerCount: profile.cheerCount ?? 0,
                            bondCount,
                        }}
                        profilePanel={
                            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                                {profile.bio && (
                                    <div style={{ position: "relative", padding: "18px 20px", borderRadius: 16, background: "rgba(255,255,255,.025)", border: "1px solid rgba(255,255,255,.07)", overflow: "hidden" }}>
                                        <div style={{ position: "absolute", left: 0, top: "18%", bottom: "18%", width: 3, borderRadius: "0 3px 3px 0", background: `linear-gradient(to bottom, transparent, ${rl}cc, transparent)` }} />
                                        <div style={{ position: "absolute", top: 8, right: 14, fontFamily: "monospace", fontSize: 28, fontWeight: 900, color: "rgba(255,255,255,.03)", userSelect: "none" }}>&quot;</div>
                                        <p style={{ fontSize: 14, color: "rgba(255,255,255,.65)", lineHeight: 1.85, margin: 0, paddingLeft: 6 }}>{profile.bio}</p>
                                    </div>
                                )}
                                {careerProfile?.stats?.length ? (
                                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: 10 }}>
                                        {careerProfile.stats.filter((stat) => stat?.label || stat?.value).slice(0, 3).map((stat, index) => {
                                            const statColor = stat.color === "gold" ? "#FFD600" : stat.color === "role" ? rl : "#FFFFFF";
                                            return (
                                                <div key={`${stat.label}-${index}`} style={{ padding: "14px 16px", borderRadius: 16, background: "rgba(255,255,255,.025)", border: "1px solid rgba(255,255,255,.07)" }}>
                                                    <p style={{ margin: "0 0 6px", fontSize: 9, fontFamily: "monospace", letterSpacing: ".18em", textTransform: "uppercase", color: "rgba(255,255,255,.36)" }}>{stat.label}</p>
                                                    <p style={{ margin: 0, fontSize: 28, fontWeight: 900, lineHeight: 1, color: statColor }}>{stat.value || "-"}</p>
                                                </div>
                                            );
                                        })}
                                    </div>
                                ) : null}
                                <div className="cheerb">
                                    <CheerButtonClient slug={profile.slug} initialCheerCount={profile.cheerCount ?? 0} roleColor={rl} isOwn={isOwn} />
                                </div>
                                <CollectButtonClient slug={profile.slug} initialCollectorCount={collectorCount} roleColor={rl} isOwn={isOwn} viewerSlug={viewerSlug} fullWidth />
                                <div id="card" style={{ scrollMarginTop: 80 }}>
                                    <ProfileCardSection
                                        profile={profile as unknown as ProfileData}
                                        t={cardTheme}
                                        roleColor={rl}
                                        preloadQr
                                        mode="public"
                                    />
                                </div>
                            </div>
                        }
                        careerPanel={
                            <CareerSection roleColor={rl} bio={profile.bio} sport={profile.sport} region={profile.region} prefecture={profile.prefecture} joinedAt={joinedAt} roleLabel={ROLE_LABEL[profile.role]} cheerCount={profile.cheerCount ?? 0} isPublic={profile.isPublic} slug={slug} careerProfile={careerProfile} />
                        }
                        schedulePanel={
                            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                                {publicSchedules.length === 0 ? (
                                    <p style={{ margin: 0, fontSize: 13, color: "rgba(255,255,255,.55)" }}>公開中の予定はありません</p>
                                ) : (
                                    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                                        {publicSchedules.map((s: any) => {
                                            const cfg = CATEGORY_CONFIG[s.category as keyof typeof CATEGORY_CONFIG] ?? CATEGORY_CONFIG.other;
                                            return (
                                                <div
                                                    key={s.id}
                                                    style={{
                                                        padding: "12px 14px",
                                                        borderRadius: 14,
                                                        border: "1px solid rgba(255,255,255,0.08)",
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
                                                        <p style={{ margin: 0, fontSize: 11, color: "rgba(255,255,255,.45)", fontFamily: "monospace", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                                                            {new Date(s.start_at).toLocaleString("ja-JP")}{s.end_at ? ` - ${new Date(s.end_at).toLocaleString("ja-JP")}` : ""}
                                                            {s.location ? ` · ${s.location}` : ""}
                                                        </p>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>
                        }
                    />
                    <div className="u5">
                        <BondAudience bondCount={bondCount} isBonded={isBonded} />
                    </div>
                    {regionalAd && (
                        <div className="u7">
                            <p style={{ margin: "0 0 8px", fontSize: 10, letterSpacing: ".18em", fontFamily: "monospace", textTransform: "uppercase", color: "rgba(255,255,255,0.38)" }}>あなたの地域のスポンサー</p>
                            <AdCard ad={regionalAd} size="medium" />
                        </div>
                    )}
                    {!regionalAd && (
                        <div className="u7" style={{ borderRadius: 14, border: "1px dashed rgba(255,214,0,0.28)", background: "rgba(255,214,0,0.04)", padding: "12px 14px" }}>
                            <p style={{ margin: "0 0 3px", fontSize: 10, letterSpacing: ".18em", fontFamily: "monospace", textTransform: "uppercase", color: "rgba(255,214,0,0.7)" }}>SPONSOR SLOT</p>
                            <p style={{ margin: 0, fontSize: 12, color: "rgba(255,255,255,0.45)" }}>あなたの地域のスポンサー広告枠（空き枠）</p>
                        </div>
                    )}
                    <div className="u7" style={{ position: "relative", borderRadius: 20, padding: "32px 24px", background: `linear-gradient(135deg, ${bg1} 0%, rgba(8,8,15,.6) 100%)`, border: `1px solid ${rl}22`, textAlign: "center", overflow: "hidden" }}>
                        <div style={{ position: "absolute", top: "-50%", right: "-10%", width: 240, height: 240, background: `radial-gradient(circle, ${rl}18, transparent 68%)`, pointerEvents: "none" }} />
                        <div style={{ position: "absolute", top: 0, left: "10%", right: "10%", height: 1, background: `linear-gradient(90deg, transparent, ${rl}60, transparent)` }} />
                        <p style={{ position: "relative", zIndex: 1, fontSize: 9, fontFamily: "monospace", letterSpacing: ".28em", textTransform: "uppercase", color: "rgba(255,255,255,.28)", margin: "0 0 10px" }}>INVITE</p>
                        <p style={{ position: "relative", zIndex: 1, fontSize: 15, color: "rgba(255,255,255,.5)", margin: "0 0 22px", lineHeight: 1.75 }}>
                            <span style={{ color: "#fff", fontWeight: 800 }}>{profile.displayName}</span> の紹介で<br />Vizion Connection に参加しませんか？
                        </p>
                        <a href={referralUrl} className="ctabtn" style={{ position: "relative", zIndex: 1, gap: 8, padding: "14px 32px", borderRadius: 14, background: rl, color: "#000", fontSize: 13, fontWeight: 800 }}>
                            先行登録する（無料）
                            <svg width={13} height={13} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" /></svg>
                        </a>
                        <p style={{ position: "relative", zIndex: 1, fontSize: 10, color: "rgba(255,255,255,.18)", margin: "14px 0 0" }}>完全無料 · いつでも退会可</p>
                    </div>
                </div>
            </main>
        </div>
    );
}
