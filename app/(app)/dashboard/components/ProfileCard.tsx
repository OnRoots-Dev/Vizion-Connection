"use client";

import { useState, useEffect, type MouseEvent } from "react";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { FoundingMemberBadge, EarlyPartnerBadge } from "@/components/ui/FoundingMemberBadge";
import type { ProfileData } from "@/features/profile/types";
import QRCode from "qrcode";

const ROLE_COLOR: Record<string, string> = {
    Athlete: "#C1272D", Trainer: "#1A7A4A", Members: "#B8860B", Business: "#1B3A8C",
};
const ROLE_GRADIENT: Record<string, string> = {
    Athlete: "#2D0000", Trainer: "#001A0A", Members: "#1A0F00", Business: "#000A24",
};
const ROLE_LABEL: Record<string, string> = {
    Athlete: "ATHLETE", Trainer: "TRAINER", Members: "MEMBERS", Business: "BUSINESS",
};

const X_PATH = "M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.746l7.73-8.835L1.254 2.25H8.08l4.253 5.622zm-1.161 17.52h1.833L7.084 4.126H5.117z";
const IG_PATH = "M7.8 2h8.4C19.4 2 22 4.6 22 7.8v8.4a5.8 5.8 0 01-5.8 5.8H7.8C4.6 22 2 19.4 2 16.2V7.8A5.8 5.8 0 017.8 2zm-.2 2A3.6 3.6 0 004 7.6v8.8C4 18.39 5.61 20 7.6 20h8.8a3.6 3.6 0 003.6-3.6V7.6C20 5.61 18.39 4 16.4 4H7.6zm9.65 1.5a1.25 1.25 0 110 2.5 1.25 1.25 0 010-2.5zM12 7a5 5 0 110 10A5 5 0 0112 7zm0 2a3 3 0 100 6 3 3 0 000-6z";
const TK_PATH = "M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1V9.01a6.3 6.3 0 00-.79-.05 6.34 6.34 0 00-6.34 6.34 6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.33-6.34V8.69a8.18 8.18 0 004.78 1.52V6.77a4.85 4.85 0 01-1.01-.08z";

interface ThemeColors {
    bg: string; surface: string; border: string; text: string; sub: string;
}

function SnsIconBtn({ label, href, color, path }: {
    label: string; href?: string; color: string; path: string;
}) {
    if (!href) return null;
    return (
        <a href={href} target="_blank" rel="noopener noreferrer" title={label}
            style={{ width: 24, height: 24, borderRadius: 6, background: `${color}18`, border: `1px solid ${color}35`, display: "flex", alignItems: "center", justifyContent: "center", textDecoration: "none", flexShrink: 0 }}>
            <svg viewBox="0 0 24 24" width={11} height={11} fill={color}><path d={path} /></svg>
        </a>
    );
}

export function ProfileCardSection({ profile, t }: { profile: ProfileData; t: ThemeColors }) {
    const [isFlipped, setIsFlipped] = useState(false);
    const [qrDataUrl, setQrDataUrl] = useState<string>("");
    useEffect(() => {
        QRCode.toDataURL(
            `https://vizion-connection.jp/u/${profile.slug}`,
            { width: 88, margin: 1, color: { dark: "#111111", light: "#f0f0f0" } }
        ).then(setQrDataUrl).catch(() => { });
    }, [profile.slug]);

    // ── 生成アニメーション（初回のみ）──
    const [generated, setGenerated] = useState(false);
    const [showScan, setShowScan] = useState(false);

    useEffect(() => {
        const t1 = setTimeout(() => setShowScan(true), 300);
        const t2 = setTimeout(() => {
            setShowScan(false);
            setGenerated(true);
        }, 1400);
        return () => { clearTimeout(t1); clearTimeout(t2); };
    }, [profile.slug]);

    // ── 3D チルト ──
    const mx = useMotionValue(0);
    const my = useMotionValue(0);
    const sx = useSpring(mx, { stiffness: 180, damping: 22, mass: 0.6 });
    const sy = useSpring(my, { stiffness: 180, damping: 22, mass: 0.6 });
    const rotateY = useTransform(sx, [-0.5, 0.5], [-12, 12]);
    const rotateX = useTransform(sy, [-0.5, 0.5], [10, -10]);

    function onMove(e: MouseEvent<HTMLDivElement>) {
        if (isFlipped) return;
        const r = e.currentTarget.getBoundingClientRect();
        mx.set((e.clientX - r.left) / r.width - 0.5);
        my.set((e.clientY - r.top) / r.height - 0.5);
    }
    function onLeave() { mx.set(0); my.set(0); }

    const rl = ROLE_COLOR[profile.role] ?? "#a78bfa";
    const bg1 = ROLE_GRADIENT[profile.role] ?? "#1a1a2e";
    const initials = profile.displayName.split(" ").map((w: string) => w[0]).join("").slice(0, 2).toUpperCase();
    const vzId = profile.serialId ?? "VZ00000-0000-00000";
    const cheerCount = profile.cheerCount ?? 0;
    const joinDate = new Date(profile.createdAt).toLocaleDateString("ja-JP", { year: "numeric", month: "short", day: "numeric" });
    const isFounding = profile.isFoundingMember ?? false;

    const snsLinks = [
        { label: "X", href: profile.xUrl, path: X_PATH },
        { label: "Instagram", href: profile.instagram, path: IG_PATH },
        { label: "TikTok", href: profile.tiktok, path: TK_PATH },
    ].filter(s => s.href);

    const faceBase: React.CSSProperties = {
        position: "absolute", inset: 0,
        overflow: "hidden",
        borderRadius: 14,
        border: "1px solid rgba(255,255,255,0.10)",
        WebkitBackfaceVisibility: "hidden",
        backfaceVisibility: "hidden",
        boxShadow: "0 10px 42px rgba(0,0,0,0.65)",
        WebkitTransform: "translateZ(0)",
        transform: "translateZ(0)",
        isolation: "isolate",
    };

    const photoMask: React.CSSProperties = {
        WebkitMaskImage: "linear-gradient(to right, transparent 0%, rgba(0,0,0,0.5) 20%, black 45%)",
        maskImage: "linear-gradient(to right, transparent 0%, rgba(0,0,0,0.5) 20%, black 45%)",
    };
    const photoMaskSoft: React.CSSProperties = {
        WebkitMaskImage: "linear-gradient(to right, transparent 0%, rgba(0,0,0,0.35) 20%, black 45%)",
        maskImage: "linear-gradient(to right, transparent 0%, rgba(0,0,0,0.35) 20%, black 45%)",
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay: 0.08, ease: [0.16, 1, 0.3, 1] }}
            style={{ borderRadius: 16, padding: 20, background: t.surface, border: `1px solid ${t.border}` }}
        >
            {/* ── Header ── */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
                <p style={{ fontSize: 9, fontWeight: 800, letterSpacing: "0.2em", textTransform: "uppercase", color: t.sub, margin: 0, opacity: 0.6 }}>
                    Profile Card
                </p>
                <div style={{ display: "flex", gap: 6 }}>
                    <span style={{ fontSize: 9, padding: "3px 8px", borderRadius: 20, background: `${rl}15`, color: rl, border: `1px solid ${rl}30`, fontWeight: 700 }}>
                        {ROLE_LABEL[profile.role]}
                    </span>
                </div>
            </div>

            {/* ── Card Stage ── */}
            <div style={{ perspective: "1200px", width: "100%", aspectRatio: "400/240", maxWidth: 440, margin: "0 auto" }}>
                {/* 生成アニメーション用ラッパー */}
                <div style={{ position: "relative", width: "100%", height: "100%" }}>

                    <motion.div
                        onMouseMove={onMove}
                        onMouseLeave={onLeave}
                        onClick={e => {
                            if (!generated) return; // 生成中はフリップ禁止
                            if ((e.target as HTMLElement).closest("a,button")) return;
                            setIsFlipped(f => !f);
                        }}
                        animate={{
                            opacity: generated ? 1 : 0.15,
                            filter: generated ? "brightness(1)" : "brightness(0.3) saturate(0.3)",
                        }}
                        transition={{ duration: 0.6, ease: "easeOut" }}
                        style={{ rotateX, rotateY, transformStyle: "preserve-3d", WebkitTransformStyle: "preserve-3d", width: "100%", height: "100%", cursor: generated ? "pointer" : "default", WebkitTapHighlightColor: "transparent" }}
                    >
                        <motion.div
                            animate={{ rotateY: isFlipped ? 180 : 0 }}
                            transition={{ duration: 1.0, ease: [0.68, 0, 0.32, 1] }}
                            style={{transformStyle: "preserve-3d", WebkitTransformStyle: "preserve-3d", width: "100%", height: "100%", position: "relative", WebkitTransform: isFlipped ? "rotateY(180deg)" : "rotateY(0deg)", transform: isFlipped ? "rotateY(180deg)" : "rotateY(0deg)" }}
                        >

                            {/* ════ FRONT ════ */}
                            <div style={faceBase}>
                                {/* BG */}
                                <div style={{ position: "absolute", inset: 0, background: `linear-gradient(145deg, ${bg1} 0%, color-mix(in srgb, ${bg1} 40%, #000) 60%, #060606 100%)` }} />
                                {/* Glow */}
                                <div style={{ position: "absolute", top: "-15%", right: "25%", width: 200, height: 200, background: `radial-gradient(circle, ${rl}25, transparent 70%)`, pointerEvents: "none" }} />
                                {/* Sheen */}
                                <div style={{ position: "absolute", inset: 0, background: "linear-gradient(128deg,rgba(255,255,255,0.07) 0%,rgba(255,255,255,0.02) 30%,transparent 55%)", borderRadius: 14, pointerEvents: "none" }} />

                                {/* Photo */}
                                {profile.profileImageUrl ? (
                                    <img src={profile.profileImageUrl} alt={profile.displayName}
                                        style={{ position: "absolute", top: 0, bottom: 0, right: 0, width: "62%", height: "100%", objectFit: "cover", objectPosition: "center top", pointerEvents: "none", ...photoMask }} />
                                ) : (
                                    <div style={{ position: "absolute", top: 0, bottom: 0, right: 0, width: "62%", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "monospace", fontSize: 80, fontWeight: 900, color: "rgba(255,255,255,0.05)", pointerEvents: "none", userSelect: "none", ...photoMask }}>
                                        {initials}
                                    </div>
                                )}

                                {/* Watermark */}
                                <div style={{ position: "absolute", bottom: 8, right: 10, zIndex: 5, fontFamily: "monospace", fontSize: 5, letterSpacing: "0.2em", textTransform: "uppercase", color: "rgba(255,255,255,0.06)", pointerEvents: "none", whiteSpace: "nowrap" }}>
                                    VIZION CONNECTION · PROOF OF EXISTENCE
                                </div>

                                {/* Left content — 42% */}
                                <div style={{ position: "absolute", inset: 0, zIndex: 6, display: "flex", flexDirection: "column", justifyContent: "space-between", padding: "14px 0 12px 14px", width: "42%" }}>
                                    {/* Top */}
                                    <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
                                        {isFounding ? <FoundingMemberBadge /> : <EarlyPartnerBadge />}
                                        <span style={{ fontFamily: "monospace", fontSize: 8.5, letterSpacing: "0.06em", color: "rgba(255,255,255,0.5)" }}>
                                            {profile.region || "N/A"} / {profile.prefecture || "N/A"}
                                        </span>
                                    </div>

                                    {/* Mid */}
                                    <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
                                        <div style={{ fontFamily: "monospace", fontSize: 7, fontWeight: 700, letterSpacing: "0.22em", textTransform: "uppercase", color: "rgba(255,255,255,0.38)" }}>
                                            {ROLE_LABEL[profile.role]}
                                        </div>
                                        <div style={{ fontSize: 15, fontWeight: 900, color: "#fff", lineHeight: 1.05, letterSpacing: "-0.01em", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", textShadow: "0 1px 0 rgba(255,255,255,0.5),0 -1px 0 rgba(0,0,0,0.75),0 2px 5px rgba(0,0,0,0.55)" }}>
                                            {profile.displayName}
                                        </div>
                                        {profile.sport && (
                                            <div style={{ fontFamily: "monospace", fontSize: 9, letterSpacing: "0.02em", color: "rgba(255,255,255,0.45)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                                                {profile.sport}
                                            </div>
                                        )}
                                        <div style={{ display: "flex", alignItems: "center", gap: 4, marginTop: 3 }}>
                                            <span style={{ fontSize: 9, color: "#FFD600" }}>★</span>
                                            <span style={{ fontFamily: "monospace", fontSize: 7, letterSpacing: "0.1em", color: "rgba(255,255,255,0.3)" }}>Cheer</span>
                                            <span style={{ fontFamily: "monospace", fontSize: 13, fontWeight: 900, lineHeight: 1, color: "#FFD600" }}>{cheerCount}</span>
                                        </div>
                                    </div>

                                    {/* Bottom: VZ ID */}
                                    <div>
                                        <div style={{ fontFamily: "monospace", fontSize: 10, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: "rgba(255,255,255,0.4)", whiteSpace: "nowrap", textShadow: "0 1px 0 rgba(255,255,255,0.3),0 -1px 0 rgba(0,0,0,0.6)" }}>
                                            {vzId}
                                        </div>
                                        <div style={{ marginTop: 4, display: "flex", alignItems: "center", gap: 4, fontFamily: "monospace", fontSize: 6, letterSpacing: "0.14em", textTransform: "uppercase", color: "rgba(255,255,255,0.18)" }}>
                                            <span style={{ display: "inline-block", width: 16, height: 1, background: "rgba(255,255,255,0.2)" }} />
                                            TAP TO SEE PROFILE
                                        </div>
                                    </div>
                                </div>

                                {/* Logo */}
                                <div style={{ position: "absolute", bottom: 10, right: 10, zIndex: 7 }}>
                                    <img src="/images/Vizion_Connection_logo-wt.png" alt="Logo"
                                        style={{ height: 38, width: "auto", opacity: 0.55, mixBlendMode: "lighten" }} />
                                </div>
                            </div>

                            {/* ════ BACK ════ */}
                            <div style={{ ...faceBase, transform: "rotateY(180deg)", WebkitTransform: "rotateY(180deg)", background: `linear-gradient(145deg, ${bg1} 0%, #000 100%)` }}>
                                <div style={{ position: "absolute", inset: 0, background: "linear-gradient(128deg,rgba(255,255,255,0.07) 0%,rgba(255,255,255,0.02) 30%,transparent 55%)", borderRadius: 14, pointerEvents: "none" }} />

                                {/* Photo */}
                                {profile.profileImageUrl ? (
                                    <img src={profile.profileImageUrl} alt="" style={{ position: "absolute", top: 0, right: 0, bottom: 0, width: "60%", height: "100%", objectFit: "cover", objectPosition: "center top", pointerEvents: "none", opacity: 0.7, ...photoMaskSoft }} />
                                ) : (
                                    <div style={{ position: "absolute", right: 0, top: 0, width: "60%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "monospace", fontSize: 60, fontWeight: 700, color: "rgba(255,255,255,0.04)", pointerEvents: "none", userSelect: "none", ...photoMaskSoft }}>
                                        {initials}
                                    </div>
                                )}

                                <div style={{ position: "absolute", inset: 0, zIndex: 30, display: "flex", flexDirection: "column", justifyContent: "space-between", padding: "13px 12px 14px" }}>
                                    {/* Top */}
                                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", pointerEvents: "none" }}>
                                        <img src="/images/Vizion_Connection_logo-wt.png" alt="Logo" style={{ height: 30, width: "auto", opacity: 0.6, mixBlendMode: "lighten" }} />
                                        <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
                                            <span style={{ width: 5, height: 5, borderRadius: "50%", background: rl, boxShadow: `0 0 5px ${rl}`, flexShrink: 0, display: "inline-block" }} />
                                            <span style={{ fontFamily: "monospace", fontSize: 7, fontWeight: 700, letterSpacing: "0.18em", textTransform: "uppercase", color: "rgba(255,255,255,0.45)" }}>
                                                {ROLE_LABEL[profile.role]}
                                            </span>
                                        </div>
                                        <span style={{ fontFamily: "monospace", fontSize: 5.5, letterSpacing: "0.16em", textTransform: "uppercase", color: "rgba(255,255,255,0.18)" }}>Official Card</span>
                                    </div>

                                    {/* Mid */}
                                    <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center", gap: 2, pointerEvents: "none" }}>
                                        <div style={{ fontSize: 20, fontWeight: 900, color: "rgba(255,255,255,0.88)", lineHeight: 1.1, letterSpacing: "-0.01em", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                                            {profile.displayName}
                                        </div>
                                        <div style={{ fontFamily: "monospace", fontSize: 10, color: "rgba(255,255,255,0.35)" }}>
                                            @{profile.slug}{profile.region ? ` · ${profile.region}` : ""}
                                        </div>
                                        {profile.sport && (
                                            <div style={{ fontFamily: "monospace", fontSize: 9, letterSpacing: "0.02em", color: "rgba(255,255,255,0.45)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                                                {profile.sport}
                                            </div>
                                        )}
                                    </div>

                                    {/* Divider */}
                                    <div style={{ height: 1, background: `linear-gradient(90deg, ${rl} 0%, transparent 100%)`, opacity: 0.4, margin: "5px 0" }} />

                                    {/* Bio */}
                                    <div style={{ fontSize: 9.5, lineHeight: 1.6, color: "rgba(255,255,255,0.38)", pointerEvents: "none", minHeight: "1em" }}>
                                        {profile.bio ?? "—"}
                                    </div>

                                    {/* Bottom: SNS + QR */}
                                    <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: 8 }}>
                                        <div style={{ display: "flex", flexDirection: "column", gap: 5, zIndex: 50 }} onClick={e => e.stopPropagation()}>
                                            <span style={{ fontFamily: "monospace", fontSize: 6.5, letterSpacing: "0.14em", textTransform: "uppercase", color: "rgba(255,255,255,0.3)", pointerEvents: "none" }}>Connect</span>
                                            <div style={{ display: "flex", gap: 5 }}>
                                                {snsLinks.length > 0
                                                    ? snsLinks.map(s => <SnsIconBtn key={s.label} label={s.label} href={s.href} color={rl} path={s.path} />)
                                                    : <span style={{ fontSize: 9, color: "rgba(255,255,255,0.2)" }}>—</span>
                                                }
                                            </div>
                                        </div>

                                        <div style={{ display: "flex", alignItems: "flex-end", gap: 7, pointerEvents: "none" }}>
                                            <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 2 }}>
                                                <span style={{ fontFamily: "monospace", fontSize: 5.5, letterSpacing: "0.14em", textTransform: "uppercase", color: "rgba(255,255,255,0.2)" }}>Profile URL</span>
                                                <span style={{ fontFamily: "monospace", fontSize: 7.5, color: "rgba(255,255,255,0.5)", maxWidth: 100, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                                                    vizionconnection.com/u/{profile.slug}
                                                </span>
                                            </div>
                                            {qrDataUrl ? (
                                                <img src={qrDataUrl} alt="QR" style={{ width: 44, height: 44, borderRadius: 3, flexShrink: 0 }} />
                                            ) : (
                                                <div style={{ width: 44, height: 44, borderRadius: 3, background: "rgba(255,255,255,0.1)", flexShrink: 0 }} />
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>

                        </motion.div>
                    </motion.div>

                    {/* ── スキャンライン（初回生成アニメーション）── */}
                    {showScan && (
                        <motion.div
                            initial={{ top: "-8%", opacity: 0 }}
                            animate={{ top: "108%", opacity: [0, 1, 1, 0] }}
                            transition={{ duration: 0.9, ease: "linear" }}
                            style={{
                                position: "absolute", left: 0, right: 0,
                                height: "6px", zIndex: 20, pointerEvents: "none",
                                background: `linear-gradient(to bottom, transparent, ${rl}CC, transparent)`,
                                boxShadow: `0 0 18px 6px ${rl}66`,
                            }}
                        />
                    )}

                    {/* ── 生成中テキスト ── */}
                    {showScan && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: [0, 1, 0.6, 1] }}
                            transition={{ duration: 0.6, repeat: Infinity, repeatType: "mirror" }}
                            style={{
                                position: "absolute", bottom: "-26px", left: 0, right: 0,
                                textAlign: "center", fontFamily: "monospace",
                                fontSize: "9px", letterSpacing: "0.2em",
                                color: rl, pointerEvents: "none",
                                textTransform: "uppercase",
                            }}
                        >
                            Generating Card...
                        </motion.div>
                    )}

                </div>
            </div>

            {/* ── Actions ── */}
            <div style={{ marginTop: 14, display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between", gap: 8 }}>
                <p style={{ fontSize: 11, color: t.sub, opacity: 0.45, margin: 0 }}>タップ / クリックで裏返す</p>
                <div style={{ display: "flex", gap: 8 }}>
                    <a href={`/card/${profile.slug}`}
                        style={{ display: "flex", alignItems: "center", gap: 5, padding: "6px 12px", borderRadius: 8, background: `${rl}12`, border: `1px solid ${rl}30`, color: rl, fontSize: 11, fontWeight: 700, textDecoration: "none" }}>
                        <svg width={12} height={12} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
                        </svg>
                        シェア用カードを確認
                    </a>
                    <button
                        onClick={() => {
                            const url = `${window.location.origin}/card/${profile.slug}`;
                            if (navigator.share) { navigator.share({ url, title: `${profile.displayName} — Vizion Connection` }); }
                            else { navigator.clipboard.writeText(url); }
                        }}
                        style={{ display: "flex", alignItems: "center", gap: 5, padding: "6px 12px", borderRadius: 8, background: "rgba(255,255,255,0.05)", border: `1px solid ${t.border}`, color: t.sub, fontSize: 11, fontWeight: 700, cursor: "pointer" }}>
                        <svg width={12} height={12} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M7.217 10.907a2.25 2.25 0 100 2.186m0-2.186c.18.324.283.696.283 1.093s-.103.77-.283 1.093m0-2.186l9.566-5.314m-9.566 7.5l9.566 5.314m0 0a2.25 2.25 0 103.935 2.186 2.25 2.25 0 00-3.935-2.186zm0-12.814a2.25 2.25 0 103.933-2.185 2.25 2.25 0 00-3.933 2.185z" />
                        </svg>
                        シェア
                    </button>
                </div>
            </div>

            <p style={{ fontSize: 9, fontFamily: "monospace", textAlign: "center", letterSpacing: "0.1em", marginTop: 8, marginBottom: 0, opacity: 0.25, color: t.sub }}>
                {vzId} · {joinDate}
            </p>
        </motion.div>
    );
}