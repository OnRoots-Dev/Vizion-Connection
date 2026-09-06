"use client";

import { useRef, useState, useEffect, type MouseEvent } from "react";
import { motion, useMotionValue, useReducedMotion, useSpring, useTransform } from "framer-motion";
import { FoundingMemberBadge, EarlyPartnerBadge } from "@/components/ui/FoundingMemberBadge";
import SpotlightCard from "@/components/SpotlightCard";
import { IconCheer } from "@/lib/design/icons";
import { ROLE_COLOR } from "@/lib/design/tokens";
import QRCode from "qrcode";
import NextImage from "next/image";
import type { ProfileData, LatestCheerItem } from "@/features/profile/types";
import type { UserRole } from "@/features/auth/types";
import type { DashboardView, ThemeColors } from "../types";
import { CardHeader } from "./ui";
import SponsorBadge from "@/components/SponsorBadge";
import { calcDayCount } from "@/lib/day-count";

const ROLE_GRADIENT: Record<string, string> = {
    Athlete: "#2D0000", Trainer: "#082a06", Crew: "#1A0F00", Business: "#000A24",
};
const ROLE_LABEL: Record<string, string> = {
    Athlete: "ATHLETE", Trainer: "TRAINER", Crew: "CREW", Business: "BUSINESS", Admin: "ADMIN",
};

const X_PATH = "M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.746l7.73-8.835L1.254 2.25H8.08l4.253 5.622zm-1.161 17.52h1.833L7.084 4.126H5.117z";
const IG_PATH = "M7.8 2h8.4C19.4 2 22 4.6 22 7.8v8.4a5.8 5.8 0 01-5.8 5.8H7.8C4.6 22 2 19.4 2 16.2V7.8A5.8 5.8 0 017.8 2zm-.2 2A3.6 3.6 0 004 7.6v8.8C4 18.39 5.61 20 7.6 20h8.8a3.6 3.6 0 003.6-3.6V7.6C20 5.61 18.39 4 16.4 4H7.6zm9.65 1.5a1.25 1.25 0 110 2.5 1.25 1.25 0 010-2.5zM12 7a5 5 0 110 10A5 5 0 0112 7zm0 2a3 3 0 100 6 3 3 0 000-6z";
const TK_PATH = "M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1V9.01a6.3 6.3 0 00-.79-.05 6.34 6.34 0 00-6.34 6.34 6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.33-6.34V8.69a8.18 8.18 0 004.78 1.52V6.77a4.85 4.85 0 01-1.01-.08z";

function hexToRgba(hex: string, alpha: number): `rgba(${number}, ${number}, ${number}, ${number})` {
    const normalized = hex.replace("#", "");
    const value = normalized.length === 3
        ? normalized.split("").map((char) => char + char).join("")
        : normalized;
    const r = parseInt(value.slice(0, 2), 16);
    const g = parseInt(value.slice(2, 4), 16);
    const b = parseInt(value.slice(4, 6), 16);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

function SnsIconBtn({ label, href, color, path }: {
    label: string; href?: string; color: string; path: string;
}) {
    if (!href) return null;
    return (
        <a href={href} target="_blank" rel="noopener noreferrer" title={label}
            className="flex h-6 w-6 shrink-0 items-center justify-center rounded-[6px] no-underline"
            style={{ background: `${color}18`, border: `1px solid ${color}35` }}>
            <svg viewBox="0 0 24 24" width={11} height={11} fill={color}><path d={path} /></svg>
        </a>
    );
}

export function ProfileCardSection({
    profile,
    t,
    roleColor,
    referralUrl,
    referralCount,
    preloadQr = false,
    introAnimation = false,
    mode = "full",
}: {
    profile: ProfileData;
    t: ThemeColors;
    roleColor?: string;
    setView?: (view: DashboardView) => void;
    referralUrl?: string;
    referralCount?: number;
    preloadQr?: boolean;
    introAnimation?: boolean;
    mode?: "full" | "public";
}) {
    const [isFlipped, setIsFlipped] = useState(false);
    const [isHovered, setIsHovered] = useState(false);
    const reduceMotion = useReducedMotion();
    const [supportsPointerSpotlight, setSupportsPointerSpotlight] = useState(false);
    const [qrDataUrl, setQrDataUrl] = useState<string>("");
    const [referralCopied, setReferralCopied] = useState(false);

    useEffect(() => {
        const mq = window.matchMedia("(hover: hover) and (pointer: fine)");
        const update = () => setSupportsPointerSpotlight(mq.matches);
        update();
        mq.addEventListener("change", update);
        return () => mq.removeEventListener("change", update);
    }, []);

    useEffect(() => {
        if (!preloadQr && !isFlipped) return;
        let active = true;
        QRCode.toDataURL(
            `https://vizion-connection.jp/u/${profile.slug}`,
            { width: 88, margin: 1, color: { dark: "#111111", light: "#f0f0f0" } }
        ).then((url) => {
            if (active) setQrDataUrl(url);
        }).catch(() => { });
        return () => { active = false; };
    }, [isFlipped, preloadQr, profile.slug]);

    const [generated, setGenerated] = useState(!introAnimation);
    const [showScan, setShowScan] = useState(false);
    const [cheerModalOpen, setCheerModalOpen] = useState(false);
    const [connectionCount, setConnectionCount] = useState(0);

    useEffect(() => {
        if (mode === "public") return;
        let active = true;
        fetch("/api/connections", { cache: "no-store" })
            .then((res) => (res.ok ? res.json() : null))
            .then((data: { success?: boolean; connections?: Array<{ status: string }> } | null) => {
                if (!active || !data?.connections) return;
                const count = data.connections.filter((c) => c.status === "accepted").length;
                setConnectionCount(count);
            })
            .catch(() => {});
        return () => {
            active = false;
        };
    }, [mode]);

    useEffect(() => {
        if (!introAnimation) return;
        const t1 = setTimeout(() => setShowScan(true), 300);
        const t2 = setTimeout(() => { setShowScan(false); setGenerated(true); }, 1400);
        return () => { clearTimeout(t1); clearTimeout(t2); };
    }, [introAnimation, profile.slug]);

    const mx = useMotionValue(0);
    const my = useMotionValue(0);
    const sx = useSpring(mx, { stiffness: 180, damping: 22, mass: 0.6 });
    const sy = useSpring(my, { stiffness: 180, damping: 22, mass: 0.6 });
    const rotateY = useTransform(sx, [-0.5, 0.5], [-12, 12]);
    const rotateX = useTransform(sy, [-0.5, 0.5], [10, -10]);

    const touchStartX = useRef<number | null>(null);
    const touchStartY = useRef<number | null>(null);
    const touchLastX = useRef<number | null>(null);
    const touchLastY = useRef<number | null>(null);
    const touchMoved = useRef(false);

    function onMove(e: MouseEvent<HTMLDivElement>) {
        if (isFlipped) return;
        setIsHovered(true);
        const r = e.currentTarget.getBoundingClientRect();
        mx.set((e.clientX - r.left) / r.width - 0.5);
        my.set((e.clientY - r.top) / r.height - 0.5);
    }
    function onLeave() { setIsHovered(false); mx.set(0); my.set(0); }

    const roleKey = profile.role as UserRole;
    const rl = roleColor ?? (ROLE_COLOR[roleKey] ?? "var(--electric)");
    const bg1 = ROLE_GRADIENT[profile.role] ?? "#1a1a2e";
    const spotlightDisabled = Boolean(reduceMotion) || !supportsPointerSpotlight;
    const spotlightColor = hexToRgba(ROLE_COLOR[roleKey] ?? rl, 0.28);
    const initials = profile.displayName.split(" ").map((w: string) => w[0]).join("").slice(0, 2).toUpperCase();
    const vzId = profile.serialId ?? "VZ-2026-000001";
    const cheerCount = profile.cheerCount ?? 0;
    const latestCheers = profile.latestCheers ?? [];
    const isFounding = profile.isFoundingMember ?? false;
    const isPublicMode = mode === "public";
    const bannerSrc = profile.bannerUrl || profile.profileImageUrl;

    const snsLinks = [
        { label: "X", href: profile.xUrl, path: X_PATH },
        { label: "Instagram", href: profile.instagram, path: IG_PATH },
        { label: "TikTok", href: profile.tiktok, path: TK_PATH },
    ].filter(s => s.href);

    const faceBase: React.CSSProperties = {
        position: "absolute", inset: 0, overflow: "hidden", borderRadius: 14,
        border: "1px solid rgba(255,255,255,0.10)",
        WebkitBackfaceVisibility: "hidden", backfaceVisibility: "hidden",
        boxShadow: "0 10px 42px rgba(0,0,0,0.65)",
        WebkitTransform: "translateZ(0)", transform: "translateZ(0)", isolation: "isolate",
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
            style={{
                borderRadius: isPublicMode ? 0 : 16,
                padding: isPublicMode ? 0 : 20,
                background: isPublicMode ? "transparent" : `linear-gradient(145deg, ${rl}12 0%, ${bg1}88 18%, ${t.surface} 100%)`,
                border: isPublicMode ? "none" : `1px solid ${rl}28`,
                boxShadow: isPublicMode
                    ? "none"
                    : isHovered
                        ? `0 18px 48px rgba(0,0,0,0.34), 0 0 0 1px ${rl}18, 0 0 42px ${rl}28, inset 0 1px 0 rgba(255,255,255,0.05)`
                        : `0 14px 40px rgba(0,0,0,0.26), inset 0 1px 0 rgba(255,255,255,0.03)`,
                transition: isPublicMode ? undefined : "box-shadow 0.22s ease, border-color 0.22s ease, transform 0.22s ease",
            }}
        >
            {!isPublicMode && (
                <div style={{ marginBottom: 12 }}>
                    <CardHeader
                        title="Profile Card"
                        color={rl}
                    />
                </div>
            )}

            <SpotlightCard
                className="border-0 bg-transparent p-0"
                spotlightColor={spotlightColor}
                disabled={spotlightDisabled}
            >
            <div style={{ perspective: "1200px", width: "100%", aspectRatio: "400/240", maxWidth: 440, margin: "0 auto" }}>
                <div style={{ position: "relative", width: "100%", height: "100%" }}>
                    <div
                        style={{
                            position: "absolute",
                            inset: "-10% -8%",
                            borderRadius: 24,
                            background: `radial-gradient(circle at 50% 50%, ${rl}20, transparent 65%)`,
                            filter: "blur(22px)",
                            opacity: isHovered ? 1 : 0.55,
                            transform: isHovered ? "scale(1.04)" : "scale(0.98)",
                            transition: "opacity 0.22s ease, transform 0.22s ease",
                            pointerEvents: "none",
                        }}
                    />
                    <motion.div
                        onMouseMove={onMove} onMouseLeave={onLeave}
                        onTouchStart={(e) => {
                            if (!generated) return;
                            if ((e.target as HTMLElement).closest("a,button")) return;
                            const t0 = e.touches[0];
                            if (!t0) return;
                            touchStartX.current = t0.clientX;
                            touchStartY.current = t0.clientY;
                            touchLastX.current = t0.clientX;
                            touchLastY.current = t0.clientY;
                            touchMoved.current = false;
                        }}
                        onTouchMove={(e) => {
                            const t0 = e.touches[0];
                            if (!t0) return;
                            if (touchStartX.current === null || touchStartY.current === null) return;
                            const dx = t0.clientX - touchStartX.current;
                            const dy = t0.clientY - touchStartY.current;
                            touchLastX.current = t0.clientX;
                            touchLastY.current = t0.clientY;
                            if (Math.abs(dx) > 8 || Math.abs(dy) > 8) touchMoved.current = true;
                        }}
                        onTouchEnd={() => {
                            if (!generated) return;
                            if (touchStartX.current === null) return;
                            const startX = touchStartX.current;
                            const startY = touchStartY.current;
                            const endX = touchLastX.current;
                            const endY = touchLastY.current;
                            touchStartX.current = null;
                            touchStartY.current = null;
                            touchLastX.current = null;
                            touchLastY.current = null;
                            if (!touchMoved.current) return;

                            if (startY === null || endX === null || endY === null) return;
                            const dx = endX - startX;
                            const dy = endY - startY;
                            const isHorizontal = Math.abs(dx) > Math.abs(dy) * 1.2;
                            if (!isHorizontal) return;
                            if (Math.abs(dx) < 40) return;
                            setIsFlipped((f) => !f);
                        }}
                        onClick={e => {
                            if (!generated) return;
                            if ((e.target as HTMLElement).closest("a,button")) return;
                            setIsFlipped(f => !f);
                        }}
                        animate={{ opacity: generated ? 1 : 0.15, filter: generated ? "brightness(1)" : "brightness(0.3) saturate(0.3)" }}
                        transition={{ duration: 0.6, ease: "easeOut" }}
                        className="v12-wrap"
                        style={{ rotateX, rotateY, transformStyle: "preserve-3d", WebkitTransformStyle: "preserve-3d", width: "100%", height: "100%", cursor: generated ? "pointer" : "default", WebkitTapHighlightColor: "transparent" }}
                    >
                        <motion.div
                            animate={{ rotateY: isFlipped ? 180 : 0 }}
                            transition={{ duration: 1.0, ease: [0.68, 0, 0.32, 1] }}
                            style={{ transformStyle: "preserve-3d", WebkitTransformStyle: "preserve-3d", width: "100%", height: "100%", position: "relative", WebkitTransform: isFlipped ? "rotateY(180deg)" : "rotateY(0deg)", transform: isFlipped ? "rotateY(180deg)" : "rotateY(0deg)" }}
                        >
                            {/* FRONT */}
                            <div className="v12-face" style={{ ...faceBase, ["--rg-val" as string]: rl }}>
                                <div style={{ position: "absolute", inset: 0, background: `linear-gradient(145deg, ${bg1} 0%, color-mix(in srgb, ${bg1} 40%, #000) 60%, #060606 100%)` }} />
                                <div style={{ position: "absolute", top: "-15%", right: "25%", width: 200, height: 200, background: `radial-gradient(circle, ${rl}22, transparent 70%)`, pointerEvents: "none" }} />
                                <div style={{ position: "absolute", top: "-12%", right: "-10%", width: 220, height: 220, background: "radial-gradient(circle, rgba(255,255,255,0.18), transparent 70%)", filter: "blur(12px)", opacity: 0.9, pointerEvents: "none" }} />
                                <div style={{ position: "absolute", inset: 0, background: "linear-gradient(128deg,rgba(255,255,255,0.10) 0%,rgba(255,255,255,0.025) 30%,transparent 55%)", borderRadius: 14, pointerEvents: "none", zIndex: 1 }} />
                                <div style={{ position: "absolute", inset: 1, borderRadius: 13, border: "1px solid rgba(255,255,255,0.04)", pointerEvents: "none", zIndex: 1 }} />
                                {bannerSrc ? (
                                    <NextImage src={bannerSrc} alt={profile.displayName} width={1} height={1} unoptimized sizes="(max-width: 768px) 62vw, 62%" style={{ position: "absolute", top: 0, bottom: 0, right: 0, width: "62%", height: "100%", objectFit: "cover", objectPosition: "center", pointerEvents: "none", zIndex: 3, ...photoMask }} />
                                ) : (
                                    <div style={{ position: "absolute", top: 0, bottom: 0, right: 0, width: "62%", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "monospace", fontSize: 80, fontWeight: 900, color: "rgba(255,255,255,0.05)", pointerEvents: "none", userSelect: "none", zIndex: 3, ...photoMask }}>{initials}</div>
                                )}
                                <div className="v12-shim" style={{ position: "absolute", inset: 0, zIndex: 10, borderRadius: 14, opacity: 0, pointerEvents: "none" }} />
                                <div style={{ position: "absolute", inset: 0, borderRadius: 14, boxShadow: isHovered ? `inset 0 0 0 1px ${rl}38, inset 0 0 30px ${rl}12, inset 0 1px 0 rgba(255,255,255,0.06)` : "inset 0 0 0 1px rgba(255,255,255,0.06), inset 0 1px 0 rgba(255,255,255,0.04)", transition: "box-shadow 0.22s ease", pointerEvents: "none", zIndex: 6 }} />
                                <div style={{ position: "absolute", bottom: 8, right: 10, zIndex: 5, fontFamily: "monospace", fontSize: 5, letterSpacing: "0.2em", textTransform: "uppercase", color: "rgba(255,255,255,0.06)", pointerEvents: "none", whiteSpace: "nowrap" }}>VIZION CONNECTION · PROOF OF EXISTENCE</div>
                                <div
                                    style={{
                                        position: "absolute",
                                        inset: 0,
                                        zIndex: 7,
                                        display: "flex",
                                        flexDirection: "column",
                                        justifyContent: "space-between",
                                        paddingTop: 16,
                                        paddingRight: 14,
                                        paddingBottom: 14,
                                        paddingLeft: 16,
                                    }}
                                >
                                    {(calcDayCount(profile.day0Date) ?? (profile as any).journeyCount ?? (profile as any).streak) != null ? (
                                        <span
                                            style={{
                                                position: "absolute",
                                                top: 10,
                                                right: 10,
                                                fontFamily: "monospace",
                                                fontWeight: 800,
                                                color: "var(--electric)",
                                                fontSize: 10,
                                                letterSpacing: "0.04em",
                                                border: "1px solid rgba(200,232,0,0.35)",
                                                background: "rgba(200,232,0,0.10)",
                                                backdropFilter: "blur(6px)",
                                                WebkitBackdropFilter: "blur(6px)",
                                                boxShadow: "0 0 14px rgba(200,232,0,0.18)",
                                                borderRadius: 6,
                                                padding: "2px 8px",
                                                pointerEvents: "none",
                                                lineHeight: 1.6,
                                            }}
                                        >
                                            DAY {calcDayCount(profile.day0Date) ?? (profile as any).journeyCount ?? (profile as any).streak}
                                        </span>
                                    ) : null}
                                    <div style={{ display: "flex", flexDirection: "column", gap: 5, alignItems: "flex-start" }}>
                                        <div style={{ display: "inline-flex" }}>{isFounding ? <FoundingMemberBadge /> : <EarlyPartnerBadge />}</div>
                                        <span style={{ fontFamily: "monospace", fontSize: 8.5, letterSpacing: "0.06em", color: "rgba(255,255,255,0.5)" }}>{profile.region || "N/A"} / {profile.prefecture || "N/A"}</span>
                                    </div>
                                    <div style={{ display: "flex", flex: 1, flexDirection: "column", justifyContent: "center", gap: 3 }}>
                                        <div style={{ fontFamily: "monospace", fontSize: 7, fontWeight: 500, letterSpacing: "0.22em", textTransform: "uppercase", color: "rgba(255,255,255,0.38)" }}>{ROLE_LABEL[profile.role]}</div>
                                        <div style={{ fontSize: "clamp(14px, 4.2vw, 18px)", fontWeight: 900, color: "#fff", lineHeight: 1.04, letterSpacing: "-0.01em", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", maxWidth: "100%", textShadow: "0 1px 0 rgba(255,255,255,0.5), 0 -1px 0 rgba(0,0,0,0.75), 0 2px 5px rgba(0,0,0,0.55), 0 0 14px rgba(255,255,255,0.05)" }}>{profile.displayName}</div>
                                        {profile.sport && <div style={{ fontFamily: "monospace", fontSize: "clamp(9px, 2.8vw, 10.5px)", letterSpacing: "0.03em", color: "rgba(255,255,255,0.52)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{profile.sport}</div>}
                                        <div style={{ display: "flex", alignItems: "center", gap: 4, marginTop: 5 }}>
                                            <span style={{ display: "inline-flex", color: "#FFD600" }} aria-hidden><IconCheer size={9} /></span>
                                            <span style={{ fontFamily: "monospace", fontSize: 7, letterSpacing: "0.12em", color: "rgba(255,255,255,0.28)" }}>Cheer</span>
                                            <span style={{ fontFamily: "monospace", fontSize: 16, fontWeight: 800, lineHeight: 1, letterSpacing: "-0.02em", color: "#FFD600" }}>{cheerCount}</span>
                                            <span style={{ width: 1, height: 12, background: "rgba(255,255,255,0.14)", margin: "0 3px" }} />
                                            <span style={{ display: "inline-flex", color: rl }} aria-hidden><svg width={9} height={9} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.6}><path strokeLinecap="round" strokeLinejoin="round" d="M7.5 21a3.25 3.25 0 003.25-3.25V15m3.25 3.25A3.25 3.25 0 007.5 21.25M13.25 6.75H4.5a2.25 2.25 0 012.25-2.25h6.5M13.25 6.75c.002-1.5 1.114-3 3.5-3 1.657 0 3 1.343 3 3 0 1.657-1.343 3-3 3-.315 0-.62-.04-.906-.116M13.25 6.75V12m-3.25 3.25a3.25 3.25 0 01-3.25-3.25V6" /></svg></span>
                                            <span style={{ fontFamily: "monospace", fontSize: 7, letterSpacing: "0.12em", color: "rgba(255,255,255,0.28)" }}>Connect</span>
                                            <span style={{ fontFamily: "monospace", fontSize: 16, fontWeight: 800, lineHeight: 1, letterSpacing: "-0.02em", color: rl }}>{connectionCount}</span>
                                        </div>
                                    </div>
                                    <div style={{ display: "flex", flexDirection: "column", gap: 4 }} />
                                </div>

                                <div
                                    style={{
                                        position: "absolute",
                                        left: 16,
                                        right: 16,
                                        bottom: 14,
                                        zIndex: 8,
                                        pointerEvents: "none",
                                    }}
                                >
                                    <div
                                        style={{
                                            display: "flex",
                                            flexDirection: "column",
                                            gap: 4,
                                            maxWidth: "60%",
                                        }}
                                    >
                                        <span style={{ fontFamily: "monospace", fontSize: 6.5, letterSpacing: "0.16em", color: "rgba(255,255,255,0.26)", textTransform: "uppercase" }}>
                                            Vizion ID
                                        </span>
                                        <span
                                            style={{
                                                display: "block",
                                                fontFamily: "monospace",
                                                fontSize: "clamp(12px, 3.0vw, 17px)",
                                                fontWeight: 950,
                                                letterSpacing: "clamp(0.06em, 0.5vw, 0.16em)",
                                                color: "rgba(180, 180, 190, 0.9)",
                                                opacity: 1,
                                                whiteSpace: "nowrap",
                                                textShadow: "0 1px 0 rgba(255,255,255,0.12), 0 -1px 0 rgba(0,0,0,0.88), 0 2px 8px rgba(0,0,0,0.42)",
                                                filter: "drop-shadow(0 0 8px rgba(0,0,0,0.18))",
                                            }}
                                        >
                                            {vzId}
                                        </span>
                                    </div>
                                </div>
                                <div style={{ position: "absolute", bottom: 10, right: 10, zIndex: 7 }}>
                                    <NextImage src="/images/Vizion_Connection_logo-bk-cropped.png" alt="Logo" width={140} height={38} style={{ height: 38, width: "auto", opacity: 0.55, mixBlendMode: "lighten" }} />
                                </div>
                            </div>

                            {/* BACK */}
                            <div className="v12-face" style={{ ...faceBase, ["--rg-val" as string]: rl, transform: "rotateY(180deg)", WebkitTransform: "rotateY(180deg)", background: `linear-gradient(145deg, ${bg1} 0%, #000 100%)` }}>
                                <div style={{ position: "absolute", inset: 0, background: "linear-gradient(128deg,rgba(255,255,255,0.10) 0%,rgba(255,255,255,0.025) 30%,transparent 55%)", borderRadius: 14, pointerEvents: "none" }} />
                                <div style={{ position: "absolute", inset: 1, borderRadius: 13, border: "1px solid rgba(255,255,255,0.04)", pointerEvents: "none" }} />
                                <div className="v12-shim" style={{ position: "absolute", inset: 0, zIndex: 10, borderRadius: 14, opacity: 0, pointerEvents: "none" }} />
                                {bannerSrc ? (
                                    <NextImage src={bannerSrc} alt="" width={1} height={1} unoptimized sizes="(max-width: 768px) 60vw, 60%" style={{ position: "absolute", top: 0, right: 0, bottom: 0, width: "60%", height: "100%", objectFit: "cover", objectPosition: "center", pointerEvents: "none", opacity: 0.7, ...photoMaskSoft }} />
                                ) : (
                                    <div style={{ position: "absolute", right: 0, top: 0, width: "60%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "monospace", fontSize: 60, fontWeight: 700, color: "rgba(255,255,255,0.04)", pointerEvents: "none", userSelect: "none", ...photoMaskSoft }}>{initials}</div>
                                )}
                                <div style={{ position: "absolute", inset: 0, zIndex: 30, display: "flex", flexDirection: "column", justifyContent: "space-between", padding: "14px 13px 16px" }}>
                                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", pointerEvents: "none" }}>
                                        <NextImage src="/images/Vizion_Connection_logo-bk-cropped.png" alt="Logo" width={120} height={30} style={{ height: 30, width: "auto", opacity: 0.6, mixBlendMode: "lighten" }} />
                                        <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
                                            <span style={{ width: 5, height: 5, borderRadius: "50%", background: rl, boxShadow: `0 0 5px ${rl}`, flexShrink: 0, display: "inline-block" }} />
                                            <span style={{ fontFamily: "monospace", fontSize: 7, fontWeight: 700, letterSpacing: "0.18em", textTransform: "uppercase", color: "rgba(255,255,255,0.45)" }}>{ROLE_LABEL[profile.role]}</span>
                                        </div>
                                        <span style={{ fontFamily: "monospace", fontSize: 5.5, letterSpacing: "0.16em", textTransform: "uppercase", color: "rgba(255,255,255,0.18)" }}>Official Card</span>
                                    </div>
                                    <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center", gap: 2, pointerEvents: "none" }}>
                                        <div style={{ fontSize: 14, fontWeight: 900, color: "rgba(255,255,255,0.88)", lineHeight: 1.08, letterSpacing: "-0.01em", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", textShadow: "0 1px 0 rgba(255,255,255,0.4), 0 -1px 0 rgba(0,0,0,0.7), 0 2px 4px rgba(0,0,0,0.5)" }}>{profile.displayName}</div>
                                        <div style={{ marginTop: 4, display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
                                            <SponsorBadge plan={profile.sponsorPlan} />
                                        </div>
                                        <div style={{ fontFamily: "monospace", fontSize: 10, color: "rgba(255,255,255,0.35)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>@{profile.slug}{profile.region ? ` · ${profile.region}` : ""}</div>
                                        {profile.sport && <div style={{ fontFamily: "monospace", fontSize: 9, letterSpacing: "0.02em", color: "rgba(255,255,255,0.45)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{profile.sport}</div>}
                                    </div>
                                    <div style={{ height: 1, background: `linear-gradient(90deg, ${rl} 0%, transparent 100%)`, opacity: 0.4, margin: "5px 0" }} />
                                    <div style={{ fontSize: 9.5, lineHeight: 1.6, color: "rgba(255,255,255,0.38)", pointerEvents: "none", minHeight: "1em" }}>{profile.bio ?? "—"}</div>
                                    <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: 8 }}>
                                        <div style={{ display: "flex", flexDirection: "column", gap: 5, zIndex: 50 }} onClick={e => e.stopPropagation()}>
                                            <span style={{ fontFamily: "monospace", fontSize: 6.5, letterSpacing: "0.14em", textTransform: "uppercase", color: "rgba(255,255,255,0.3)", pointerEvents: "none" }}>Connect</span>
                                            <div style={{ display: "flex", gap: 5 }}>
                                                {snsLinks.length > 0 ? snsLinks.map(s => <SnsIconBtn key={s.label} label={s.label} href={s.href} color={rl} path={s.path} />) : <span style={{ fontSize: 9, color: "rgba(255,255,255,0.2)" }}>—</span>}
                                            </div>
                                        </div>
                                        <div style={{ display: "flex", alignItems: "flex-end", gap: 7, pointerEvents: "none" }}>
                                            <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 2 }}>
                                                <span style={{ fontFamily: "monospace", fontSize: 5.5, letterSpacing: "0.14em", textTransform: "uppercase", color: "rgba(255,255,255,0.2)" }}>Profile URL</span>
                                                <span style={{ fontFamily: "monospace", fontSize: 7.5, color: "rgba(255,255,255,0.5)", maxWidth: 100, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>vizion-connection.jp/u/{profile.slug}</span>
                                            </div>
                                            {qrDataUrl ? (
                                                <NextImage src={qrDataUrl} alt="QR" width={44} height={44} unoptimized style={{ width: 44, height: 44, borderRadius: 3, flexShrink: 0 }} />
                                            ) : (
                                                <div style={{ width: 44, height: 44, borderRadius: 3, background: "rgba(255,255,255,0.1)", flexShrink: 0 }} />
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>

                    {showScan && (
                        <motion.div
                            initial={{ top: "-8%", opacity: 0 }}
                            animate={{ top: "108%", opacity: [0, 1, 1, 0] }}
                            transition={{ duration: 0.9, ease: "linear" }}
                            style={{ position: "absolute", left: 0, right: 0, height: "6px", zIndex: 20, pointerEvents: "none", background: `linear-gradient(to bottom, transparent, ${rl}CC, transparent)`, boxShadow: `0 0 18px 6px ${rl}66` }}
                        />
                    )}
                    {showScan && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: [0, 1, 0.6, 1] }}
                            transition={{ duration: 0.6, repeat: Infinity, repeatType: "mirror" }}
                            style={{ position: "absolute", bottom: "-26px", left: 0, right: 0, textAlign: "center", fontFamily: "monospace", fontSize: "9px", letterSpacing: "0.2em", color: rl, pointerEvents: "none", textTransform: "uppercase" }}
                        >
                            Generating Card...
                        </motion.div>
                    )}
                </div>
            </div>
            </SpotlightCard>

            {referralUrl ? (
                <div
                    style={{
                        marginTop: 12,
                        width: "100%",
                        maxWidth: 440,
                        marginLeft: "auto",
                        marginRight: "auto",
                        display: "flex",
                        flexDirection: "column",
                        gap: 10,
                        paddingTop: 12,
                        paddingRight: 12,
                        paddingBottom: 12,
                        paddingLeft: 12,
                        borderRadius: 14,
                        border: "1px solid rgba(255,214,0,0.16)",
                        background: "linear-gradient(180deg, rgba(255,255,255,0.03), rgba(255,255,255,0.01))",
                        flexWrap: "wrap",
                    }}
                >
                    <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: 10, width: "100%" }}>
                        <span style={{ fontSize: 10, fontFamily: "monospace", color: "rgba(255,255,255,0.62)", letterSpacing: "0.16em", textTransform: "uppercase", fontWeight: 900 }}>Referral</span>
                        {typeof referralCount === "number" ? (
                            <span style={{ fontSize: 11, fontFamily: "monospace", color: "rgba(255,255,255,0.85)", fontWeight: 900 }}>+{referralCount} / 30</span>
                        ) : null}
                    </div>

                    {typeof referralCount === "number" ? (
                        <div style={{ width: "100%", height: 8, borderRadius: 999, background: "rgba(255,255,255,0.08)", overflow: "hidden" }}>
                            <div style={{ height: "100%", width: `${Math.min((referralCount / 30) * 100, 100)}%`, background: "rgba(255,255,255,0.55)", borderRadius: 999 }} />
                        </div>
                    ) : null}

                    <div style={{ display: "flex", alignItems: "center", gap: 8, width: "100%" }}>
                        <span style={{ flex: 1, minWidth: 0, fontSize: 11, fontFamily: "monospace", color: "rgba(255,255,255,0.72)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{referralUrl}</span>
                        <button
                            type="button"
                            onClick={async (e) => {
                                e.stopPropagation();
                                try { await navigator.clipboard.writeText(referralUrl); } catch {}
                                setReferralCopied(true);
                                window.setTimeout(() => setReferralCopied(false), 1600);
                            }}
                            className="vz-btn"
                            style={{ flexShrink: 0, padding: "8px 10px", borderRadius: 12, background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.16)", color: "rgba(255,255,255,0.85)", fontSize: 10, fontWeight: 900, cursor: "pointer" }}
                        >
                            {referralCopied ? "✓ Copied" : "Copy"}
                        </button>
                    </div>
                </div>
            ) : null}

            {cheerModalOpen && (
                <CheerCommentsModal
                    roleColor={rl}
                    items={latestCheers}
                    onClose={() => setCheerModalOpen(false)}
                />
            )}

            {null}
        </motion.div>
    );
}

function CheerCommentsModal({
    roleColor,
    items,
    onClose,
}: {
    roleColor: string;
    items: LatestCheerItem[];
    onClose: () => void;
}) {
    return (
        <div className="fixed inset-0 z-[80] grid place-items-center bg-black/70 p-4">
            <button type="button" onClick={onClose} aria-label="close" className="fixed inset-0 z-0 border-none bg-transparent" />
            <div className="relative z-10 max-h-[80vh] w-[min(540px,100%)] overflow-y-auto rounded-[16px]" style={{ border: `1px solid ${roleColor}55`, background: "#0b0b13", boxShadow: `0 16px 60px rgba(0,0,0,0.6), 0 0 0 1px ${roleColor}25` }}>
                <div className="flex items-center justify-between border-b border-white/8 px-4 py-[14px]">
                    <p className="m-0 text-[13px] font-black text-white">Latest Cheer</p>
                    <button type="button" onClick={onClose} className="cursor-pointer rounded-[8px] px-[10px] py-[6px] text-[12px] font-bold text-white" style={{ border: "1px solid rgba(255,255,255,0.16)", background: "rgba(255,255,255,0.06)" }}>閉じる</button>
                </div>
                <div className="flex flex-col gap-2 p-3">
                    {items.length === 0 ? (
                        <p className="m-0 text-[13px]" style={{ color: "rgba(255,255,255,0.5)" }}>コメント付きCheerはまだありません。</p>
                    ) : (
                        items.map((item) => (
                            <div key={item.id} className="rounded-[12px] px-3 py-[10px]" style={{ border: "1px solid rgba(255,255,255,0.1)", background: "rgba(255,255,255,0.03)" }}>
                                <p className="m-0 text-[13px] leading-[1.6]" style={{ color: "rgba(255,255,255,0.85)" }}>&quot;{item.comment}&quot;</p>
                                <p className="mb-0 mt-[6px] font-mono text-[11px]" style={{ color: roleColor }}>- @{item.fromSlug}</p>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
}

