"use client";

import { useState, useEffect, type MouseEvent } from "react";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { FoundingMemberBadge, EarlyPartnerBadge } from "@/components/ui/FoundingMemberBadge";
import type { LatestCheerItem, ProfileData } from "@/features/profile/types";
import QRCode from "qrcode";
import { DashboardView } from "@/app/(app)/dashboard/DashboardClient";

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

async function buildStoriesCanvas(profile: ProfileData, rl: string): Promise<HTMLCanvasElement> {
    const W = 1080;
    const H = 1920;
    const bg1 = ROLE_GRADIENT[profile.role] ?? "#1a1a2e";
    const isFounding = profile.isFoundingMember ?? false;

    const canvas = document.createElement("canvas");
    canvas.width = W;
    canvas.height = H;
    const ctx = canvas.getContext("2d")!;

    function roundedRect(x: number, y: number, w: number, h: number, r: number) {
        ctx.beginPath();
        ctx.moveTo(x + r, y);
        ctx.lineTo(x + w - r, y);
        ctx.quadraticCurveTo(x + w, y, x + w, y + r);
        ctx.lineTo(x + w, y + h - r);
        ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
        ctx.lineTo(x + r, y + h);
        ctx.quadraticCurveTo(x, y + h, x, y + h - r);
        ctx.lineTo(x, y + r);
        ctx.quadraticCurveTo(x, y, x + r, y);
        ctx.closePath();
    }

    function loadImg(src: string): Promise<HTMLImageElement> {
        return new Promise((resolve, reject) => {
            const img = new Image();
            img.crossOrigin = "anonymous";
            img.onload = () => resolve(img);
            img.onerror = reject;
            img.src = src;
        });
    }

    let profileImg: HTMLImageElement | null = null;
    if (profile.profileImageUrl) {
        try { profileImg = await loadImg(profile.profileImageUrl); } catch { profileImg = null; }
    }

    if (profileImg) {
        const scale = Math.max(W / profileImg.width, H / profileImg.height);
        const dw = profileImg.width * scale;
        const dh = profileImg.height * scale;
        ctx.drawImage(profileImg, (W - dw) / 2, (H - dh) / 2, dw, dh);
    } else {
        const bgGrad = ctx.createLinearGradient(0, 0, W * 0.6, H);
        bgGrad.addColorStop(0, bg1);
        bgGrad.addColorStop(0.5, "#08080e");
        bgGrad.addColorStop(1, "#030305");
        ctx.fillStyle = bgGrad;
        ctx.fillRect(0, 0, W, H);
        const glow = ctx.createRadialGradient(W * 0.75, H * 0.28, 0, W * 0.75, H * 0.28, 700);
        glow.addColorStop(0, rl + "30");
        glow.addColorStop(1, "transparent");
        ctx.fillStyle = glow;
        ctx.fillRect(0, 0, W, H);
    }

    const topGrad = ctx.createLinearGradient(0, 0, 0, H * 0.35);
    topGrad.addColorStop(0, "rgba(0,0,0,0.82)");
    topGrad.addColorStop(1, "rgba(0,0,0,0)");
    ctx.fillStyle = topGrad;
    ctx.fillRect(0, 0, W, H * 0.35);

    const bottomGrad = ctx.createLinearGradient(0, H * 0.42, 0, H);
    bottomGrad.addColorStop(0, "rgba(0,0,0,0)");
    bottomGrad.addColorStop(0.25, "rgba(0,0,0,0.75)");
    bottomGrad.addColorStop(1, "rgba(0,0,0,0.97)");
    ctx.fillStyle = bottomGrad;
    ctx.fillRect(0, H * 0.42, W, H * 0.58);

    const roleAccent = ctx.createLinearGradient(0, H * 0.75, 0, H);
    roleAccent.addColorStop(0, "transparent");
    roleAccent.addColorStop(1, rl + "28");
    ctx.fillStyle = roleAccent;
    ctx.fillRect(0, H * 0.75, W, H * 0.25);

    // 3. 上部ロゴ
    ctx.textAlign = "center";
    ctx.fillStyle = "rgba(255,255,255,0.5)";
    ctx.font = "700 26px -apple-system, BlinkMacSystemFont, 'SF Pro Display', sans-serif";
    ctx.fillText("VIZION CONNECTION", W / 2, 96);
    ctx.strokeStyle = "rgba(255,255,255,0.1)";
    ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(W / 2 - 180, 112); ctx.lineTo(W / 2 + 180, 112); ctx.stroke();

    // 4. コンテンツ
    const X = 80;
    let y = Math.round(H * 0.56);

    // バッジ（Canvas直描画）
    const badgeLabel = isFounding ? "⬡  FOUNDING MEMBER" : "EARLY PARTNER";
    const badgeColor = isFounding ? "#FFD600" : "#7ab8ff";
    ctx.font = "700 24px 'SF Mono', 'Fira Code', monospace";
    const bPad = 20;
    const bW = ctx.measureText(badgeLabel).width + bPad * 2;
    const bH = 44;
    roundedRect(X, y, bW, bH, 5);
    ctx.fillStyle = badgeColor + "18"; ctx.fill();
    ctx.strokeStyle = badgeColor + "55"; ctx.lineWidth = 1.5;
    roundedRect(X, y, bW, bH, 5); ctx.stroke();
    ctx.textAlign = "left";
    ctx.fillStyle = badgeColor;
    ctx.fillText(badgeLabel, X + bPad, y + 30);
    y += bH + 28;

    // 表示名（自動縮小）
    let nameSize = 96;
    ctx.font = `900 ${nameSize}px -apple-system, BlinkMacSystemFont, 'SF Pro Display', sans-serif`;
    while (ctx.measureText(profile.displayName).width > W - X * 2 && nameSize > 52) {
        nameSize -= 4;
        ctx.font = `900 ${nameSize}px -apple-system, BlinkMacSystemFont, 'SF Pro Display', sans-serif`;
    }
    ctx.fillStyle = "#ffffff";
    ctx.shadowColor = "rgba(0,0,0,0.8)"; ctx.shadowBlur = 16;
    ctx.fillText(profile.displayName, X, y + Math.round(nameSize * 0.82));
    ctx.shadowBlur = 0;
    y += nameSize + 16;

    // ロール
    ctx.font = "700 34px -apple-system, BlinkMacSystemFont, sans-serif";
    ctx.fillStyle = rl;
    ctx.fillText(ROLE_LABEL[profile.role] ?? profile.role, X, y);
    y += 46;

    // スポーツ
    if (profile.sport) {
        ctx.font = "400 30px -apple-system, BlinkMacSystemFont, sans-serif";
        ctx.fillStyle = "rgba(255,255,255,0.55)";
        ctx.fillText(profile.sport, X, y);
        y += 40;
    }

    // 地域
    if (profile.region) {
        ctx.font = "400 26px -apple-system, BlinkMacSystemFont, sans-serif";
        ctx.fillStyle = "rgba(255,255,255,0.38)";
        ctx.fillText(profile.region + (profile.prefecture ? ` / ${profile.prefecture}` : ""), X, y);
        y += 38;
    }

    y += 20;

    // Cheer数
    const cheerCount = profile.cheerCount ?? 0;
    ctx.font = "900 56px 'SF Mono', monospace";
    ctx.fillStyle = "#FFD600";
    ctx.fillText(String(cheerCount), X, y);
    const numW = ctx.measureText(String(cheerCount)).width;
    ctx.font = "500 26px -apple-system, sans-serif";
    ctx.fillStyle = "rgba(255,255,255,0.4)";
    ctx.fillText(" Cheer", X + numW + 8, y - 4);
    y += 68;

    // 仕切り線
    ctx.strokeStyle = "rgba(255,255,255,0.14)"; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(X, y); ctx.lineTo(W - X, y); ctx.stroke();
    y += 44;

    // 招待テキスト
    ctx.font = "500 30px -apple-system, BlinkMacSystemFont, sans-serif";
    ctx.fillStyle = "rgba(255,255,255,0.45)";
    ctx.fillText("一緒にはじめよう", X, y);
    y += 46;

    // 招待URL
    ctx.font = "700 32px 'SF Mono', 'Fira Code', monospace";
    ctx.fillStyle = rl;
    ctx.fillText(`vizion-connection.jp/r/${profile.slug}`, X, y);
    y += 54;

    // QRコード
    const qrDataUrl = await QRCode.toDataURL(
        `https://vizion-connection.jp/r/${profile.slug}`,
        { width: 200, margin: 2, color: { dark: "#ffffff", light: "#00000000" } }
    );
    await new Promise<void>((resolve) => {
        const qrImg = new Image();
        qrImg.onload = () => {
            const qrSize = 160;
            roundedRect(X, y, qrSize + 16, qrSize + 16, 12);
            ctx.fillStyle = "rgba(255,255,255,0.06)"; ctx.fill();
            ctx.drawImage(qrImg, X + 8, y + 8, qrSize, qrSize);
            resolve();
        };
        qrImg.onerror = () => resolve();
        qrImg.src = qrDataUrl;
    });

    // 最下部
    ctx.textAlign = "center";
    ctx.font = "600 22px 'SF Mono', monospace";
    ctx.fillStyle = "rgba(255,255,255,0.18)";
    ctx.fillText(profile.serialId ?? "", W / 2, H - 64);
    ctx.font = "400 20px -apple-system, sans-serif";
    ctx.fillStyle = "rgba(255,255,255,0.1)";
    ctx.fillText("Beyond the Limit, Connect the Trust.", W / 2, H - 36);

    return canvas;
}

export function ProfileCardSection({
    profile,
    t,
    roleColor,
    setView,
}: {
    profile: ProfileData;
    t: ThemeColors;
    roleColor?: string;
    setView?: (view: DashboardView) => void;
}) {
    const [isFlipped, setIsFlipped] = useState(false);
    const [qrDataUrl, setQrDataUrl] = useState<string>("");
    useEffect(() => {
        QRCode.toDataURL(
            `https://vizion-connection.jp/u/${profile.slug}`,
            { width: 88, margin: 1, color: { dark: "#111111", light: "#f0f0f0" } }
        ).then(setQrDataUrl).catch(() => { });
    }, [profile.slug]);

    const [generated, setGenerated] = useState(false);
    const [showScan, setShowScan] = useState(false);
    const [cheerModalOpen, setCheerModalOpen] = useState(false);

    useEffect(() => {
        const t1 = setTimeout(() => setShowScan(true), 300);
        const t2 = setTimeout(() => { setShowScan(false); setGenerated(true); }, 1400);
        return () => { clearTimeout(t1); clearTimeout(t2); };
    }, [profile.slug]);

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

    const rl = roleColor ?? (ROLE_COLOR[profile.role] ?? "#a78bfa");
    const bg1 = ROLE_GRADIENT[profile.role] ?? "#1a1a2e";
    const initials = profile.displayName.split(" ").map((w: string) => w[0]).join("").slice(0, 2).toUpperCase();
    const vzId = profile.serialId ?? "VZ-2026-000001";
    const cheerCount = profile.cheerCount ?? 0;
    const latestCheers = profile.latestCheers ?? [];
    const latestCheer = latestCheers[0];
    const joinDate = new Date(profile.createdAt).toLocaleDateString("ja-JP", { year: "numeric", month: "short", day: "numeric" });
    const isFounding = profile.isFoundingMember ?? false;

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
            style={{ borderRadius: 16, padding: 20, background: t.surface, border: `1px solid ${t.border}` }}
        >
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
                <p style={{ fontSize: 9, fontWeight: 800, letterSpacing: "0.2em", textTransform: "uppercase", color: t.sub, margin: 0, opacity: 0.6 }}>Profile Card</p>
                <div style={{ display: "flex", gap: 6 }}>
                    <span style={{ fontSize: 9, padding: "3px 8px", borderRadius: 20, background: `${rl}15`, color: rl, border: `1px solid ${rl}30`, fontWeight: 700 }}>{ROLE_LABEL[profile.role]}</span>
                    {setView ? (
                        <button onClick={() => setView("profile")} style={{ display: "flex", alignItems: "center", gap: 4, padding: "3px 9px", borderRadius: 20, background: `${rl}12`, border: `1px solid ${rl}30`, color: rl, fontSize: 9, fontWeight: 800, cursor: "pointer" }}>
                            <svg width={10} height={10} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" /></svg>
                            プロフィール表示
                        </button>
                    ) : (
                        <a href={`/u/${profile.slug}`} style={{ display: "flex", alignItems: "center", gap: 4, padding: "3px 9px", borderRadius: 20, background: `${rl}12`, border: `1px solid ${rl}30`, color: rl, fontSize: 9, fontWeight: 800, textDecoration: "none" }}>
                            <svg width={10} height={10} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" /></svg>
                            公開ページ
                        </a>
                    )}
                </div>
            </div>

            <div style={{ perspective: "1200px", width: "100%", aspectRatio: "400/240", maxWidth: 440, margin: "0 auto" }}>
                <div style={{ position: "relative", width: "100%", height: "100%" }}>
                    <motion.div
                        onMouseMove={onMove} onMouseLeave={onLeave}
                        onClick={e => {
                            if (!generated) return;
                            if ((e.target as HTMLElement).closest("a,button")) return;
                            setIsFlipped(f => !f);
                        }}
                        animate={{ opacity: generated ? 1 : 0.15, filter: generated ? "brightness(1)" : "brightness(0.3) saturate(0.3)" }}
                        transition={{ duration: 0.6, ease: "easeOut" }}
                        style={{ rotateX, rotateY, transformStyle: "preserve-3d", WebkitTransformStyle: "preserve-3d", width: "100%", height: "100%", cursor: generated ? "pointer" : "default", WebkitTapHighlightColor: "transparent" }}
                    >
                        <motion.div
                            animate={{ rotateY: isFlipped ? 180 : 0 }}
                            transition={{ duration: 1.0, ease: [0.68, 0, 0.32, 1] }}
                            style={{ transformStyle: "preserve-3d", WebkitTransformStyle: "preserve-3d", width: "100%", height: "100%", position: "relative", WebkitTransform: isFlipped ? "rotateY(180deg)" : "rotateY(0deg)", transform: isFlipped ? "rotateY(180deg)" : "rotateY(0deg)" }}
                        >
                            {/* FRONT */}
                            <div style={faceBase}>
                                <div style={{ position: "absolute", inset: 0, background: `linear-gradient(145deg, ${bg1} 0%, color-mix(in srgb, ${bg1} 40%, #000) 60%, #060606 100%)` }} />
                                <div style={{ position: "absolute", top: "-15%", right: "25%", width: 200, height: 200, background: `radial-gradient(circle, ${rl}25, transparent 70%)`, pointerEvents: "none" }} />
                                <div style={{ position: "absolute", inset: 0, background: "linear-gradient(128deg,rgba(255,255,255,0.07) 0%,rgba(255,255,255,0.02) 30%,transparent 55%)", borderRadius: 14, pointerEvents: "none" }} />
                                {profile.profileImageUrl ? (
                                    <img src={profile.profileImageUrl} alt={profile.displayName} style={{ position: "absolute", top: 0, bottom: 0, right: 0, width: "62%", height: "100%", objectFit: "cover", objectPosition: "center top", pointerEvents: "none", ...photoMask }} />
                                ) : (
                                    <div style={{ position: "absolute", top: 0, bottom: 0, right: 0, width: "62%", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "monospace", fontSize: 80, fontWeight: 900, color: "rgba(255,255,255,0.05)", pointerEvents: "none", userSelect: "none", ...photoMask }}>{initials}</div>
                                )}
                                <div style={{ position: "absolute", bottom: 8, right: 10, zIndex: 5, fontFamily: "monospace", fontSize: 5, letterSpacing: "0.2em", textTransform: "uppercase", color: "rgba(255,255,255,0.06)", pointerEvents: "none", whiteSpace: "nowrap" }}>VIZION CONNECTION · PROOF OF EXISTENCE</div>
                                <div style={{ position: "absolute", inset: 0, zIndex: 6, display: "flex", flexDirection: "column", justifyContent: "space-between", padding: "14px 0 12px 14px", width: "85%" }}>
                                    <div style={{ display: "flex", flexDirection: "column", gap: 5, alignItems: "flex-start" }}>
                                        <div style={{ display: "inline-flex" }}>{isFounding ? <FoundingMemberBadge /> : <EarlyPartnerBadge />}</div>
                                        <span style={{ fontFamily: "monospace", fontSize: 8.5, letterSpacing: "0.06em", color: "rgba(255,255,255,0.5)" }}>{profile.region || "N/A"} / {profile.prefecture || "N/A"}</span>
                                    </div>
                                    <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
                                        <div style={{ fontFamily: "monospace", fontSize: 7, fontWeight: 700, letterSpacing: "0.22em", textTransform: "uppercase", color: "rgba(255,255,255,0.38)" }}>{ROLE_LABEL[profile.role]}</div>
                                        <div style={{ fontSize: 15, fontWeight: 900, color: "#fff", lineHeight: 1.05, letterSpacing: "-0.01em", whiteSpace: "nowrap", textShadow: "0 1px 0 rgba(255,255,255,0.5),0 -1px 0 rgba(0,0,0,0.75),0 2px 5px rgba(0,0,0,0.55)" }}>{profile.displayName}</div>
                                        {profile.sport && <div style={{ fontFamily: "monospace", fontSize: 9, letterSpacing: "0.02em", color: "rgba(255,255,255,0.45)", whiteSpace: "nowrap" }}>{profile.sport}</div>}
                                        <div style={{ display: "flex", alignItems: "center", gap: 4, marginTop: 3 }}>
                                            <span style={{ fontSize: 9, color: "#FFD600" }}>★</span>
                                            <span style={{ fontFamily: "monospace", fontSize: 7, letterSpacing: "0.1em", color: "rgba(255,255,255,0.3)" }}>Cheer</span>
                                            <span style={{ fontFamily: "monospace", fontSize: 13, fontWeight: 900, lineHeight: 1, color: "#FFD600" }}>{cheerCount}</span>
                                        </div>
                                        {latestCheer ? (
                                            <button
                                                type="button"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    setCheerModalOpen(true);
                                                }}
                                                style={{ marginTop: 5, padding: "4px 7px", borderRadius: 6, background: "rgba(0,0,0,0.35)", border: "1px solid rgba(255,255,255,0.15)", color: "rgba(255,255,255,0.78)", fontSize: 8, lineHeight: 1.25, maxWidth: 170, textAlign: "left", cursor: "pointer" }}
                                            >
                                                "{latestCheer.comment}" - @{latestCheer.fromSlug}
                                            </button>
                                        ) : (
                                            <span style={{ marginTop: 5, fontSize: 8, color: "rgba(255,255,255,0.35)" }}>コメント付きCheerはまだありません</span>
                                        )}
                                    </div>
                                    <div>
                                        <div style={{ fontFamily: "monospace", fontSize: 10, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: "rgba(255,255,255,0.4)", whiteSpace: "nowrap", textShadow: "0 1px 0 rgba(255,255,255,0.3),0 -1px 0 rgba(0,0,0,0.6)" }}>{vzId}</div>
                                        <div style={{ marginTop: 4, display: "flex", alignItems: "center", gap: 4, fontFamily: "monospace", fontSize: 6, letterSpacing: "0.14em", textTransform: "uppercase", color: "rgba(255,255,255,0.18)" }}>
                                            <span style={{ display: "inline-block", width: 16, height: 1, background: "rgba(255,255,255,0.2)" }} />TAP TO SEE PROFILE
                                        </div>
                                    </div>
                                </div>
                                <div style={{ position: "absolute", bottom: 10, right: 10, zIndex: 7 }}>
                                    <img src="/images/Vizion_Connection_logo-wt.png" alt="Logo" style={{ height: 38, width: "auto", opacity: 0.55, mixBlendMode: "lighten" }} />
                                </div>
                            </div>

                            {/* BACK */}
                            <div style={{ ...faceBase, transform: "rotateY(180deg)", WebkitTransform: "rotateY(180deg)", background: `linear-gradient(145deg, ${bg1} 0%, #000 100%)` }}>
                                <div style={{ position: "absolute", inset: 0, background: "linear-gradient(128deg,rgba(255,255,255,0.07) 0%,rgba(255,255,255,0.02) 30%,transparent 55%)", borderRadius: 14, pointerEvents: "none" }} />
                                {profile.profileImageUrl ? (
                                    <img src={profile.profileImageUrl} alt="" style={{ position: "absolute", top: 0, right: 0, bottom: 0, width: "60%", height: "100%", objectFit: "cover", objectPosition: "center top", pointerEvents: "none", opacity: 0.7, ...photoMaskSoft }} />
                                ) : (
                                    <div style={{ position: "absolute", right: 0, top: 0, width: "60%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "monospace", fontSize: 60, fontWeight: 700, color: "rgba(255,255,255,0.04)", pointerEvents: "none", userSelect: "none", ...photoMaskSoft }}>{initials}</div>
                                )}
                                <div style={{ position: "absolute", inset: 0, zIndex: 30, display: "flex", flexDirection: "column", justifyContent: "space-between", padding: "13px 12px 14px" }}>
                                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", pointerEvents: "none" }}>
                                        <img src="/images/Vizion_Connection_logo-wt.png" alt="Logo" style={{ height: 30, width: "auto", opacity: 0.6, mixBlendMode: "lighten" }} />
                                        <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
                                            <span style={{ width: 5, height: 5, borderRadius: "50%", background: rl, boxShadow: `0 0 5px ${rl}`, flexShrink: 0, display: "inline-block" }} />
                                            <span style={{ fontFamily: "monospace", fontSize: 7, fontWeight: 700, letterSpacing: "0.18em", textTransform: "uppercase", color: "rgba(255,255,255,0.45)" }}>{ROLE_LABEL[profile.role]}</span>
                                        </div>
                                        <span style={{ fontFamily: "monospace", fontSize: 5.5, letterSpacing: "0.16em", textTransform: "uppercase", color: "rgba(255,255,255,0.18)" }}>Official Card</span>
                                    </div>
                                    <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center", gap: 2, pointerEvents: "none" }}>
                                        <div style={{ fontSize: 20, fontWeight: 900, color: "rgba(255,255,255,0.88)", lineHeight: 1.1, letterSpacing: "-0.01em", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{profile.displayName}</div>
                                        <div style={{ fontFamily: "monospace", fontSize: 10, color: "rgba(255,255,255,0.35)" }}>@{profile.slug}{profile.region ? ` · ${profile.region}` : ""}</div>
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

            <ShareMenu profile={profile} t={t} rl={rl} />

            {cheerModalOpen && (
                <CheerCommentsModal
                    roleColor={rl}
                    items={latestCheers}
                    onClose={() => setCheerModalOpen(false)}
                />
            )}

            <p style={{ fontSize: 9, fontFamily: "monospace", textAlign: "center", letterSpacing: "0.1em", marginTop: 8, marginBottom: 0, opacity: 0.25, color: t.sub }}>
                {vzId} · {joinDate}
            </p>
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
        <div style={{ position: "fixed", inset: 0, zIndex: 80, display: "grid", placeItems: "center", background: "rgba(0,0,0,0.7)", padding: 16 }}>
            <div style={{ width: "min(540px, 100%)", maxHeight: "80vh", overflowY: "auto", borderRadius: 16, border: `1px solid ${roleColor}55`, background: "#0b0b13", boxShadow: `0 16px 60px rgba(0,0,0,0.6), 0 0 0 1px ${roleColor}25` }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 16px", borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
                    <p style={{ margin: 0, fontSize: 13, fontWeight: 900, color: "#fff" }}>Latest Cheer</p>
                    <button type="button" onClick={onClose} style={{ border: "1px solid rgba(255,255,255,0.16)", background: "rgba(255,255,255,0.06)", color: "#fff", borderRadius: 8, fontSize: 12, fontWeight: 700, padding: "6px 10px", cursor: "pointer" }}>閉じる</button>
                </div>
                <div style={{ padding: 12, display: "flex", flexDirection: "column", gap: 8 }}>
                    {items.length === 0 ? (
                        <p style={{ margin: 0, fontSize: 13, color: "rgba(255,255,255,0.5)" }}>コメント付きCheerはまだありません。</p>
                    ) : (
                        items.map((item) => (
                            <div key={item.id} style={{ borderRadius: 12, border: "1px solid rgba(255,255,255,0.1)", background: "rgba(255,255,255,0.03)", padding: "10px 12px" }}>
                                <p style={{ margin: 0, color: "rgba(255,255,255,0.85)", fontSize: 13, lineHeight: 1.6 }}>"{item.comment}"</p>
                                <p style={{ margin: "6px 0 0", fontSize: 11, color: roleColor, fontFamily: "monospace" }}>- @{item.fromSlug}</p>
                            </div>
                        ))
                    )}
                </div>
            </div>
            <button type="button" onClick={onClose} aria-label="close" style={{ position: "fixed", inset: 0, zIndex: -1, border: "none", background: "transparent" }} />
        </div>
    );
}

// ── シェアメニュー ─────────────────────────────────────────────────────────────
function ShareMenu({ profile, t, rl }: { profile: ProfileData; t: ThemeColors; rl: string }) {
    const [open, setOpen] = useState(false);
    const [copied, setCopied] = useState(false);
    const [storiesLoading, setStoriesLoading] = useState(false);

    const url = typeof window !== "undefined" ? `${window.location.origin}/u/${profile.slug}` : `/u/${profile.slug}`;

    async function handleCopyUrl() {
        try { await navigator.clipboard.writeText(url); } catch {
            const el = document.createElement("textarea");
            el.value = url; document.body.appendChild(el); el.select();
            document.execCommand("copy"); document.body.removeChild(el);
        }
        setCopied(true);
        setTimeout(() => { setCopied(false); setOpen(false); }, 1800);
    }

    function handleX() {
        const roleLabel: Record<string, string> = { Athlete: "アスリート", Trainer: "トレーナー", Members: "メンバー", Business: "ビジネス" };
        const role = roleLabel[profile.role] ?? profile.role;
        const sport = profile.sport ? ` · ${profile.sport}` : "";
        const cheer = (profile.cheerCount ?? 0).toLocaleString();
        const text = `${profile.displayName}（${role}${sport}）さんのVizion Connectionプロフィール 🔥\n⭐ Cheer ${cheer}\n\nスポーツの新しいつながりを、ここから。\n#VizionConnection`;
        window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`, "_blank", "width=600,height=500,noopener");
        setOpen(false);
    }

    // ← Strava方式 — プロフィール写真フル背景 + Canvas直描画 + Web Share API
    async function handleStories() {
        setStoriesLoading(true);
        try {
            const storiesCanvas = await buildStoriesCanvas(profile, rl);
            const blob = await new Promise<Blob>((resolve, reject) =>
                storiesCanvas.toBlob(b => b ? resolve(b) : reject(new Error("toBlob failed")), "image/png")
            );
            const file = new File([blob], `vizion-${profile.slug}.png`, { type: "image/png" });

            // Web Share API（iOS/Androidのネイティブシェアシートを直接起動）
            if (navigator.canShare?.({ files: [file] })) {
                await navigator.share({
                    files: [file],
                    title: `${profile.displayName} | Vizion Connection`,
                    text: `一緒にはじめよう → vizion-connection.jp/r/${profile.slug}`,
                });
            } else {
                // フォールバック：ダウンロード
                const objUrl = URL.createObjectURL(blob);
                const a = document.createElement("a");
                a.href = objUrl;
                a.download = `vizion-stories-${profile.slug}.png`;
                document.body.appendChild(a); a.click(); document.body.removeChild(a);
                setTimeout(() => URL.revokeObjectURL(objUrl), 1000);
            }
        } catch (err: unknown) {
            if (err instanceof Error && err.name === "AbortError") return; // キャンセル
            console.error("[handleStories]", err);
            window.open(`${window.location.origin}/api/og/${profile.slug}?format=stories`, "_blank");
        } finally {
            setStoriesLoading(false);
            setOpen(false);
        }
    }

    async function handleNativeShare() {
        if (navigator.share) {
            try { await navigator.share({ title: `${profile.displayName} | Vizion Connection`, url }); } catch { /* cancel */ }
        } else {
            await handleCopyUrl();
        }
        setOpen(false);
    }

    const menuItems = [
        {
            label: "Xに投稿", sub: "OG画像付きでツイート",
            icon: <svg viewBox="0 0 24 24" width={14} height={14} fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.746l7.73-8.835L1.254 2.25H8.08l4.253 5.622zm-1.161 17.52h1.833L7.084 4.126H5.117z" /></svg>,
            color: "#ffffff", bg: "rgba(255,255,255,0.06)", border: "rgba(255,255,255,0.1)", onClick: handleX, loading: false,
        },
        {
            label: "Instagram Stories", sub: "写真をフル背景にしたカードを投稿",
            icon: <svg viewBox="0 0 24 24" width={14} height={14} fill="currentColor"><path d="M7.8 2h8.4C19.4 2 22 4.6 22 7.8v8.4a5.8 5.8 0 01-5.8 5.8H7.8C4.6 22 2 19.4 2 16.2V7.8A5.8 5.8 0 017.8 2zm-.2 2A3.6 3.6 0 004 7.6v8.8C4 18.39 5.61 20 7.6 20h8.8a3.6 3.6 0 003.6-3.6V7.6C20 5.61 18.39 4 16.4 4H7.6zm9.65 1.5a1.25 1.25 0 110 2.5 1.25 1.25 0 010-2.5zM12 7a5 5 0 110 10A5 5 0 0112 7zm0 2a3 3 0 100 6 3 3 0 000-6z" /></svg>,
            color: "#e1306c", bg: "linear-gradient(135deg,rgba(240,148,51,.1),rgba(188,24,136,.1))", border: "rgba(225,48,108,0.2)", onClick: handleStories, loading: storiesLoading,
        },
        {
            label: copied ? "コピーしました ✓" : "URLをコピー", sub: "プロフィールURLをコピー",
            icon: <svg width={14} height={14} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M13.19 8.688a4.5 4.5 0 011.242 7.244l-4.5 4.5a4.5 4.5 0 01-6.364-6.364l1.757-1.757m13.35-.622l1.757-1.757a4.5 4.5 0 00-6.364-6.364l-4.5 4.5a4.5 4.5 0 001.242 7.244" /></svg>,
            color: copied ? "#32D278" : "rgba(255,255,255,0.55)", bg: copied ? "rgba(50,210,120,0.08)" : "rgba(255,255,255,0.04)", border: copied ? "rgba(50,210,120,0.25)" : "rgba(255,255,255,0.08)", onClick: handleCopyUrl, loading: false,
        },
        {
            label: "その他のアプリでシェア", sub: "Web Share API / LINEなど",
            icon: <svg width={14} height={14} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M7.217 10.907a2.25 2.25 0 100 2.186m0-2.186c.18.324.283.696.283 1.093s-.103.77-.283 1.093m0-2.186l9.566-5.314m-9.566 7.5l9.566 5.314m0 0a2.25 2.25 0 103.935 2.186 2.25 2.25 0 00-3.935-2.186zm0-12.814a2.25 2.25 0 103.933-2.185 2.25 2.25 0 00-3.933 2.185z" /></svg>,
            color: "rgba(255,255,255,0.4)", bg: "rgba(255,255,255,0.03)", border: "rgba(255,255,255,0.07)", onClick: handleNativeShare, loading: false,
        },
    ];

    return (
        <div style={{ marginTop: 14, position: "relative" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8 }}>
                <p style={{ fontSize: 11, color: t.sub, opacity: 0.45, margin: 0 }}>タップ / クリックで裏返す</p>
                <button
                    onClick={() => setOpen(v => !v)}
                    style={{ display: "flex", alignItems: "center", gap: 6, padding: "7px 14px", borderRadius: 10, background: open ? `${rl}18` : "rgba(255,255,255,0.06)", border: `1px solid ${open ? rl + "40" : "rgba(255,255,255,0.1)"}`, color: open ? rl : "rgba(255,255,255,0.6)", fontSize: 12, fontWeight: 700, cursor: "pointer", transition: "all 0.18s" }}
                >
                    <svg width={13} height={13} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M7.217 10.907a2.25 2.25 0 100 2.186m0-2.186c.18.324.283.696.283 1.093s-.103.77-.283 1.093m0-2.186l9.566-5.314m-9.566 7.5l9.566 5.314m0 0a2.25 2.25 0 103.935 2.186 2.25 2.25 0 00-3.935-2.186zm0-12.814a2.25 2.25 0 103.933-2.185 2.25 2.25 0 00-3.933 2.185z" /></svg>
                    シェア
                    <svg width={10} height={10} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5} style={{ transform: open ? "rotate(180deg)" : "rotate(0deg)", transition: "transform 0.2s" }}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                    </svg>
                </button>
            </div>

            {open && (
                <>
                    <div style={{ position: "fixed", inset: 0, zIndex: 40 }} onClick={() => setOpen(false)} />
                    <div style={{ position: "absolute", right: 0, bottom: "calc(100% + 8px)", width: 260, zIndex: 50, background: "#0f0f1c", border: `1px solid ${rl}30`, borderRadius: 14, boxShadow: `0 8px 40px rgba(0,0,0,0.7), 0 0 0 1px ${rl}15`, overflow: "hidden", animation: "shareMenuIn 0.18s cubic-bezier(0.16,1,0.3,1)" }}>
                        <style>{`@keyframes shareMenuIn { from{opacity:0;transform:translateY(8px) scale(0.97)} to{opacity:1;transform:translateY(0) scale(1)} }`}</style>
                        <div style={{ padding: "11px 14px 9px", borderBottom: `1px solid ${rl}18` }}>
                            <p style={{ margin: 0, fontSize: 9, fontWeight: 800, letterSpacing: "0.2em", textTransform: "uppercase", color: "rgba(255,255,255,0.25)", fontFamily: "monospace" }}>Share Card</p>
                        </div>
                        <div style={{ padding: "6px" }}>
                            {menuItems.map((item) => (
                                <button key={item.label} onClick={item.onClick} disabled={item.loading}
                                    style={{ width: "100%", display: "flex", alignItems: "center", gap: 10, padding: "10px 12px", borderRadius: 9, marginBottom: 4, background: item.bg, border: `1px solid ${item.border}`, color: item.color, cursor: item.loading ? "wait" : "pointer", textAlign: "left", transition: "filter 0.15s" }}
                                >
                                    <span style={{ flexShrink: 0, width: 20, display: "flex", justifyContent: "center" }}>
                                        {item.loading
                                            ? <svg width={14} height={14} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} style={{ animation: "spin .8s linear infinite" }}><path strokeLinecap="round" strokeLinejoin="round" d="M4 12a8 8 0 018-8v8H4z" /></svg>
                                            : item.icon}
                                    </span>
                                    <span style={{ flex: 1 }}>
                                        <span style={{ display: "block", fontSize: 12, fontWeight: 700, lineHeight: 1.3 }}>{item.label}</span>
                                        <span style={{ display: "block", fontSize: 10, opacity: 0.45, marginTop: 1 }}>{item.sub}</span>
                                    </span>
                                </button>
                            ))}
                        </div>
                    </div>
                </>
            )}
            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
    );
}
