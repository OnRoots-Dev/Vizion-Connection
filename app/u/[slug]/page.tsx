import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getPublicProfileBySlug } from "@/features/profile/server/get-profile-by-slug";
import { env } from "@/lib/env";
import type { UserRole } from "@/features/auth/types";
import CheerButtonClient from "./CheerButtonClient";
import ShareButtonClient from "./ShareButtonClient";
import { FoundingMemberBadge, EarlyPartnerBadge } from "@/components/ui/FoundingMemberBadge";
import { Footer } from "@/components/layout/Footer";
import PrivateProfilePage from "@/components/ui/PrivateProfilePage";
import { cookies } from "next/headers";
import { verifySession } from "@/lib/auth/session";
import { SESSION_COOKIE_NAME } from "@/lib/auth/cookies";

const ROLE_COLOR: Record<UserRole, string> = {
    Athlete: "#C1272D", Trainer: "#1A7A4A", Members: "#B8860B", Business: "#1B3A8C",
};
const ROLE_GRADIENT: Record<UserRole, string> = {
    Athlete: "#2D0000", Trainer: "#001A0A", Members: "#1A0F00", Business: "#000A24",
};
const ROLE_LABEL: Record<UserRole, string> = {
    Athlete: "ATHLETE", Trainer: "TRAINER", Members: "MEMBERS", Business: "BUSINESS",
};
const ROLE_LABEL_JA: Record<UserRole, string> = {
    Athlete: "アスリート", Trainer: "トレーナー", Members: "メンバー", Business: "ビジネス",
};
const X_PATH = "M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.746l7.73-8.835L1.254 2.25H8.08l4.253 5.622zm-1.161 17.52h1.833L7.084 4.126H5.117z";
const IG_PATH = "M7.8 2h8.4C19.4 2 22 4.6 22 7.8v8.4a5.8 5.8 0 01-5.8 5.8H7.8C4.6 22 2 19.4 2 16.2V7.8A5.8 5.8 0 017.8 2zm-.2 2A3.6 3.6 0 004 7.6v8.8C4 18.39 5.61 20 7.6 20h8.8a3.6 3.6 0 003.6-3.6V7.6C20 5.61 18.39 4 16.4 4H7.6zm9.65 1.5a1.25 1.25 0 110 2.5 1.25 1.25 0 010-2.5zM12 7a5 5 0 110 10A5 5 0 0112 7zm0 2a3 3 0 100 6 3 3 0 000-6z";
const TK_PATH =  "M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1V9.01a6.3 6.3 0 00-.79-.05 6.34 6.34 0 00-6.34 6.34 6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.33-6.34V8.69a8.18 8.18 0 004.78 1.52V6.77a4.85 4.85 0 01-1.01-.08z";

interface Props { params: Promise<{ slug: string }>; }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { slug } = await params;
    const result = await getPublicProfileBySlug(slug);
    if (!result.success || !result.data.isPublic) {
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
        twitter: {
            card: "summary_large_image",
            images: [`${env.NEXT_PUBLIC_BASE_URL}/api/og/${slug}`],
        },
    };
}

export default async function UserProfilePage({ params }: Props) {
    const { slug } = await params;
    const result = await getPublicProfileBySlug(slug);
    if (!result.success) notFound();

    const cookieStore = await cookies();
    const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;
    const session = token ? verifySession(token) : null;
    const isOwn = session?.slug === slug;

    if (!result.data.isPublic) return <PrivateProfilePage displayName={result.data.displayName} />;

    const { data: profile } = result;
    const profileUrl = `${env.NEXT_PUBLIC_BASE_URL}/u/${slug}`;
    const referralUrl = `${env.NEXT_PUBLIC_BASE_URL}/register?ref=${slug}`;
    const joinedAt = new Date(profile.createdAt).toLocaleDateString("ja-JP", { year: "numeric", month: "short", day: "numeric" });
    const rl = ROLE_COLOR[profile.role];
    const bg1 = ROLE_GRADIENT[profile.role];
    const initials = profile.displayName.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase();
    const serialDisplay = profile.serialId ? `#${String(profile.serialId).padStart(4, "0")}` : null;
    const avatarSrc = profile.avatarUrl ?? null;
    const snsLinks = [
        { label: "X", href: profile.xUrl, path: X_PATH },
        { label: "Instagram", href: profile.instagram, path: IG_PATH },
        { label: "TikTok", href: profile.tiktok, path: TK_PATH },
    ].filter(s => s.href);

    return (
        <div style={{ minHeight: "100vh", background: "#07070e", color: "#fff" }}>
            <style>{`* { box-sizing: border-box; } a { text-decoration: none; }`}</style>

            {/* ── BG ambient ── */}
            <div style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 0, background: `radial-gradient(ellipse 70% 40% at 50% 0%, ${rl}10 0%, transparent 70%)` }} />

            {/* ── Header ── */}
            <header style={{ position: "sticky", top: 0, zIndex: 30, borderBottom: "1px solid rgba(255,255,255,0.06)", background: "rgba(7,7,14,0.92)", backdropFilter: "blur(20px)", padding: "12px 24px" }}>
                <div style={{ maxWidth: "680px", margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <a href={isOwn ? "/dashboard" : "/"} style={{ display: "flex" }}>
                        <img src="/images/Vizion_Connection_logo-wt.png" alt="Vizion Connection" style={{ height: "26px", opacity: 0.8 }} />
                    </a>
                    {isOwn ? (
                        <a href="/dashboard" style={{ display: "flex", alignItems: "center", gap: 6, padding: "7px 14px", borderRadius: "20px", background: `${rl}15`, border: `1px solid ${rl}35`, color: rl, fontSize: "12px", fontWeight: 700 }}>
                            <svg width={13} height={13} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z" />
                            </svg>
                            ダッシュボード
                        </a>
                    ) : (
                        <a href="/register" style={{ padding: "7px 16px", borderRadius: "20px", background: `${rl}15`, border: `1px solid ${rl}35`, color: rl, fontSize: "12px", fontWeight: 700 }}>
                            先行登録
                        </a>
                    )}
                </div>
            </header>

            <main style={{ maxWidth: "680px", margin: "0 auto", padding: "0 0 60px", position: "relative", zIndex: 1 }}>

                {/* ── Hero ── */}
                <div style={{ position: "relative", height: "340px", overflow: "hidden", background: `linear-gradient(145deg, ${bg1} 0%, #050505 100%)` }}>
                    {/* Glow */}
                    <div style={{ position: "absolute", top: "-30%", right: "-10%", width: "360px", height: "360px", background: `radial-gradient(circle, ${rl}28, transparent 65%)`, pointerEvents: "none" }} />
                    <div style={{ position: "absolute", bottom: "-20%", left: "-5%", width: "200px", height: "200px", background: `radial-gradient(circle, ${rl}15, transparent 65%)`, pointerEvents: "none" }} />

                    {/* 背景画像 */}
                    {profile.profileImageUrl ? (
                        <img src={profile.profileImageUrl} alt={profile.displayName}
                            style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", objectPosition: "center top", opacity: 0.5 }} />
                    ) : (
                        <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "140px", fontWeight: 900, color: `${rl}10`, fontFamily: "monospace" }}>
                            {initials}
                        </div>
                    )}

                    {/* Gradient overlay */}
                    <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, #07070e 0%, rgba(7,7,14,0.3) 55%, transparent 100%)" }} />
                    <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to right, rgba(7,7,14,0.5) 0%, transparent 60%)" }} />

                    {/* Top badges */}
                    <div style={{ position: "absolute", top: "20px", left: "24px", display: "flex", alignItems: "center", gap: "8px" }}>
                            {profile.isFoundingMember ? <FoundingMemberBadge /> : <EarlyPartnerBadge />}
                        {serialDisplay && <span style={{ fontSize: "11px", fontFamily: "monospace", color: "rgba(255,255,255,0.22)", letterSpacing: "0.08em" }}>{serialDisplay}</span>}
                    </div>

                    {/* Bottom info */}
                    <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, padding: "0 24px 28px" }}>
                        <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: "12px" }}>
                            <div style={{ display: "flex", alignItems: "flex-end", gap: "16px" }}>
                                {/* Avatar */}
                                <div style={{ width: 64, height: 64, borderRadius: "50%", overflow: "hidden", border: `2.5px solid ${rl}80`, background: `linear-gradient(145deg, ${bg1}, #111)`, flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", boxShadow: `0 0 20px ${rl}40` }}>
                                    {avatarSrc
                                        ? <img src={avatarSrc} alt={profile.displayName} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                                        : <span style={{ fontSize: "22px", fontWeight: 900, color: `${rl}90`, fontFamily: "monospace" }}>{initials}</span>
                                    }
                                </div>
                                <div style={{ paddingBottom: 4 }}>
                                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                                        <h1 style={{ fontSize: "30px", fontWeight: 900, color: "#fff", margin: 0, letterSpacing: "-0.02em", textShadow: "0 2px 16px rgba(0,0,0,0.8)" }}>
                                            {profile.displayName}
                                        </h1>
                                        {profile.verified && (
                                            <svg width={20} height={20} viewBox="0 0 24 24" fill={rl} style={{ flexShrink: 0 }}>
                                                <path fillRule="evenodd" d="M8.603 3.799A4.49 4.49 0 0112 2.25c1.357 0 2.573.6 3.397 1.549a4.49 4.49 0 013.498 1.307 4.491 4.491 0 011.307 3.497A4.49 4.49 0 0121.75 12a4.49 4.49 0 01-1.549 3.397 4.491 4.491 0 01-1.307 3.497 4.491 4.491 0 01-3.497 1.307A4.49 4.49 0 0112 21.75a4.49 4.49 0 01-3.397-1.549 4.491 4.491 0 01-3.497-1.307 4.491 4.491 0 01-1.307-3.497A4.49 4.49 0 012.25 12c0-1.357.6-2.573 1.549-3.397a4.491 4.491 0 011.307-3.497 4.49 4.49 0 013.497-1.307zm7.007 6.387a.75.75 0 10-1.22-.872l-3.236 4.53L9.53 12.22a.75.75 0 00-1.06 1.06l2.25 2.25a.75.75 0 001.14-.094l3.75-5.25z" clipRule="evenodd" />
                                            </svg>
                                        )}
                                    </div>
                                    <p style={{ fontSize: "12px", color: "rgba(255,255,255,0.4)", fontFamily: "monospace", margin: 0 }}>
                                        {ROLE_LABEL[profile.role]}{profile.sport ? ` · ${profile.sport}` : ""} · @{profile.slug}
                                    </p>
                                </div>
                            </div>
                            {/* Cheer count */}
                            <div style={{ flexShrink: 0, textAlign: "center", padding: "12px 18px", borderRadius: "14px", background: "rgba(0,0,0,0.6)", backdropFilter: "blur(10px)", border: "1px solid rgba(255,210,0,0.2)" }}>
                                <p style={{ fontSize: "24px", fontWeight: 900, color: "#FFD600", margin: 0, fontFamily: "monospace", lineHeight: 1 }}>{(profile.cheerCount ?? 0).toLocaleString()}</p>
                                <p style={{ fontSize: "8px", color: "rgba(255,210,0,0.45)", margin: "3px 0 0", letterSpacing: "0.12em", textTransform: "uppercase" }}>Cheer</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* ── Body ── */}
                <div style={{ padding: "24px 24px 0", display: "flex", flexDirection: "column", gap: "16px" }}>

                    {/* Bio */}
                    {profile.bio && (
                        <div style={{ padding: "16px 18px", borderRadius: "14px", background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}>
                            <p style={{ fontSize: "14px", color: "rgba(255,255,255,0.6)", lineHeight: 1.75, margin: 0 }}>{profile.bio}</p>
                        </div>
                    )}

                    {/* Stats grid */}
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "8px" }}>
                        {[
                            { label: "Role", value: ROLE_LABEL[profile.role], color: rl },
                            { label: "Cheer", value: (profile.cheerCount ?? 0).toLocaleString(), color: "#FFD600" },
                            { label: "参加日", value: joinedAt, color: undefined },
                            ...(profile.region ? [{ label: "Area", value: profile.region, color: undefined }] : []),
                            ...(profile.sport ? [{ label: "Sport / Job", value: profile.sport, color: undefined }] : []),
                        ].map(({ label, value, color }) => (
                            <div key={label} style={{ padding: "12px 14px", borderRadius: "12px", background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}>
                                <p style={{ fontSize: "8px", color: "rgba(255,255,255,0.22)", letterSpacing: "0.12em", textTransform: "uppercase", fontFamily: "monospace", margin: "0 0 5px" }}>{label}</p>
                                <p style={{ fontSize: "13px", fontWeight: 800, color: color ?? "rgba(255,255,255,0.65)", margin: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{value}</p>
                            </div>
                        ))}
                    </div>

                    {/* SNS */}
                    {snsLinks.length > 0 && (
                        <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                            {snsLinks.map(s => (
                                <a key={s.label} href={s.href} target="_blank" rel="noopener noreferrer"
                                    style={{ display: "flex", alignItems: "center", gap: 7, padding: "9px 16px", borderRadius: "10px", background: `${rl}10`, border: `1px solid ${rl}25`, color: rl, fontSize: "12px", fontWeight: 700 }}>
                                    <svg viewBox="0 0 24 24" width={12} height={12} fill="currentColor"><path d={s.path} /></svg>
                                    {s.label}
                                </a>
                            ))}
                        </div>
                    )}

                    {/* Cheer button */}
                    <CheerButtonClient slug={profile.slug} initialCheerCount={profile.cheerCount ?? 0} roleColor={rl} isOwn={isOwn} />

                    {/* Card link */}
                    <a href={`/card/${profile.slug}`}
                        style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 18px", borderRadius: "14px", background: `${rl}08`, border: `1px solid ${rl}22` }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                            <div style={{ width: 36, height: 36, borderRadius: 9, background: `${rl}15`, border: `1px solid ${rl}30`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                                <svg width={16} height={16} fill="none" viewBox="0 0 24 24" stroke={rl} strokeWidth={2}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3m-3.75 3h15a2.25 2.25 0 002.25-2.25V6.75A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25v10.5A2.25 2.25 0 004.5 19.5z" />
                                </svg>
                            </div>
                            <div>
                                <p style={{ fontSize: 13, fontWeight: 700, color: "#fff", margin: 0 }}>プロフィールカードを見る</p>
                                <p style={{ fontSize: 11, color: "rgba(255,255,255,0.3)", margin: "1px 0 0", fontFamily: "monospace" }}>{env.NEXT_PUBLIC_BASE_URL}/card/{profile.slug}</p>
                            </div>
                        </div>
                        <svg width={14} height={14} fill="none" viewBox="0 0 24 24" stroke={rl} strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                        </svg>
                    </a>

                    {/* Share */}
                    <div style={{ borderRadius: "14px", padding: "18px", background: "#0d0d1a", border: "1px solid rgba(255,255,255,0.07)" }}>
                        <p style={{ fontSize: "9px", fontWeight: 700, color: "rgba(255,255,255,0.25)", letterSpacing: "0.12em", textTransform: "uppercase", margin: "0 0 12px" }}>Share</p>
                        <ShareButtonClient profileUrl={profileUrl} referralUrl={referralUrl} displayName={profile.displayName} roleColor={rl} />
                    </div>

                    {/* CTA */}
                    <div style={{ borderRadius: "16px", padding: "24px 20px", background: `${rl}08`, border: `1px solid ${rl}20`, textAlign: "center" }}>
                        <p style={{ fontSize: "14px", color: "rgba(255,255,255,0.5)", margin: "0 0 16px", lineHeight: 1.75 }}>
                            <span style={{ color: "#fff", fontWeight: 700 }}>{profile.displayName}</span> の紹介で<br />Vizion Connection に参加しませんか？
                        </p>
                        <a href={referralUrl} style={{ display: "inline-flex", alignItems: "center", gap: 7, padding: "13px 28px", borderRadius: "12px", background: rl, color: "#000", fontSize: "14px", fontWeight: 800, letterSpacing: "0.03em" }}>
                            先行登録する（無料）
                            <svg width={14} height={14} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                            </svg>
                        </a>
                        <p style={{ fontSize: "10px", color: "rgba(255,255,255,0.2)", margin: "12px 0 0" }}>完全無料 · いつでも退会可</p>
                    </div>
                </div>
            </main>
            <Footer />
        </div>
    );
}