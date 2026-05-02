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
import { cookies } from "next/headers";
import { verifySession } from "@/lib/auth/session";
import { SESSION_COOKIE_NAME } from "@/lib/auth/cookies";
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
import { supabaseServer } from "@/lib/supabase/server";
import { CATEGORY_CONFIG } from "@/types/schedule";
import PublicProfileCountValue from "./PublicProfileCountValue";
import Image from "next/image";

const ROLE_COLOR: Record<UserRole, string> = {
    Athlete: "#FF5050", Trainer: "#32D278", Members: "#B8860B", Business: "#1B3A8C",
    Admin: "#7C3AED",
};
const ROLE_GRADIENT: Record<UserRole, string> = {
    Athlete: "#3D0000", Trainer: "#002211", Members: "#221500", Business: "#000D30",
    Admin: "#1F0F2E",
};
const ROLE_LABEL: Record<UserRole, string> = {
    Athlete: "ATHLETE", Trainer: "TRAINER", Members: "MEMBERS", Business: "BUSINESS",
    Admin: "ADMIN",
};
const ROLE_LABEL_JA: Record<UserRole, string> = {
    Athlete: "アスリート", Trainer: "トレーナー", Members: "メンバー", Business: "ビジネス",
    Admin: "管理",
};
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
    const cookieStore = await cookies();
    const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;
    const session = token ? verifySession(token) : null;
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
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const [collectorCount, rawCareerProfile, ads, publicSchedules] = await Promise.all([
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
    ]);
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
                <div style={{ maxWidth: "980px", margin: "0 auto", padding: "0 20px", height: 76, display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <Image
                        src="/images/Vizion_Connection_logo-wt.png"
                        alt="Vizion Connection"
                        width={230}
                        height={46}
                        priority
                        style={{ height: 46, width: "auto", opacity: 0.95 }}
                    />
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
                            <div className="float" style={{ width: 58, height: 58, borderRadius: "50%", overflow: "hidden", border: `2.5px solid ${rl}`, background: `linear-gradient(145deg, ${bg1}, #111)`, flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", boxShadow: `0 0 0 4px ${rl}18, 0 0 30px ${rl}45`, animation: "_glowPop 3s ease-in-out infinite, _float 3.8s ease-in-out infinite" }}>
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
