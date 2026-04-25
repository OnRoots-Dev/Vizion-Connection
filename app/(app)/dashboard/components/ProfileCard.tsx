"use client";

import { useRef, useState, useEffect, type MouseEvent } from "react";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { FoundingMemberBadge, EarlyPartnerBadge } from "@/components/ui/FoundingMemberBadge";
import QRCode from "qrcode";
import NextImage from "next/image";
import type { ProfileData, LatestCheerItem } from "@/features/profile/types";
import type { DashboardView, ThemeColors } from "../types";
import { CardHeader } from "./ui";
import SponsorBadge from "@/components/SponsorBadge";

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

    // SECTION 2: Top area (y: 80-200)
    ctx.textAlign = "center";
    ctx.fillStyle = "rgba(255,255,255,0.7)";
    ctx.font = "700 28px -apple-system, BlinkMacSystemFont, 'SF Pro Display', sans-serif";
    ctx.fillText("VIZION CONNECTION", W / 2, 108);

    // Role color horizontal line (centered)
    ctx.fillStyle = rl;
    ctx.fillRect(W / 2 - 60, 130, 120, 2);

    // SECTION 3: Center profile photo (y: 280-680)
    const cx = W / 2;
    const cy = 480;
    const r = 200;
    const ringR = 206;
    const initials = profile.displayName.split(" ").map((w: string) => w[0]).join("").slice(0, 2).toUpperCase();

    if (profileImg) {
        ctx.save();
        ctx.shadowColor = "rgba(0,0,0,0.5)";
        ctx.shadowBlur = 40;
        ctx.beginPath();
        ctx.arc(cx, cy, r, 0, Math.PI * 2);
        ctx.closePath();
        ctx.clip();

        const scale = Math.max((r * 2) / profileImg.width, (r * 2) / profileImg.height);
        const dw = profileImg.width * scale;
        const dh = profileImg.height * scale;
        ctx.drawImage(profileImg, cx - dw / 2, cy - dh / 2, dw, dh);
        ctx.restore();

        ctx.save();
        ctx.beginPath();
        ctx.arc(cx, cy, ringR, 0, Math.PI * 2);
        ctx.closePath();
        ctx.strokeStyle = rl;
        ctx.lineWidth = 6;
        ctx.stroke();
        ctx.restore();
    } else {
        ctx.save();
        ctx.shadowColor = "rgba(0,0,0,0.5)";
        ctx.shadowBlur = 40;
        ctx.beginPath();
        ctx.arc(cx, cy, r, 0, Math.PI * 2);
        ctx.closePath();
        const g = ctx.createLinearGradient(cx - r, cy - r, cx + r, cy + r);
        g.addColorStop(0, bg1);
        g.addColorStop(1, "#000000");
        ctx.fillStyle = g;
        ctx.fill();
        ctx.restore();

        ctx.save();
        ctx.beginPath();
        ctx.arc(cx, cy, ringR, 0, Math.PI * 2);
        ctx.closePath();
        ctx.strokeStyle = rl;
        ctx.lineWidth = 6;
        ctx.stroke();
        ctx.restore();

        ctx.fillStyle = "#ffffff";
        ctx.font = "900 120px -apple-system, BlinkMacSystemFont, 'SF Pro Display', sans-serif";
        ctx.fillText(initials, cx, cy + 44);
    }

    // SECTION 4: Main content (y: 720 onwards, center-aligned)
    ctx.textAlign = "center";
    const centerX = W / 2;
    let y = 720;

    // FOUNDING MEMBER badge (centered)
    const badgeLabel = isFounding ? "⬡  FOUNDING MEMBER" : "EARLY PARTNER";
    const badgeColor = isFounding ? "#FFD600" : "#7ab8ff";
    ctx.font = "700 24px 'SF Mono', 'Fira Code', monospace";
    const bPadX = 20;
    const bW = ctx.measureText(badgeLabel).width + bPadX * 2;
    const bH = 44;
    const badgeX = centerX - bW / 2;
    roundedRect(badgeX, y, bW, bH, 5);
    ctx.fillStyle = badgeColor + "18"; ctx.fill();
    ctx.strokeStyle = badgeColor + "55"; ctx.lineWidth = 1.5;
    roundedRect(badgeX, y, bW, bH, 5); ctx.stroke();
    ctx.fillStyle = badgeColor;
    ctx.fillText(badgeLabel, centerX, y + 30);
    y += bH + 28;

    // Display name (auto shrink, centered)
    let nameSize = 96;
    ctx.font = `900 ${nameSize}px -apple-system, BlinkMacSystemFont, 'SF Pro Display', sans-serif`;
    while (ctx.measureText(profile.displayName).width > W - 160 && nameSize > 52) {
        nameSize -= 4;
        ctx.font = `900 ${nameSize}px -apple-system, BlinkMacSystemFont, 'SF Pro Display', sans-serif`;
    }
    ctx.fillStyle = "#ffffff";
    ctx.shadowColor = "rgba(0,0,0,0.8)"; ctx.shadowBlur = 16;
    ctx.fillText(profile.displayName, centerX, y + Math.round(nameSize * 0.82));
    ctx.shadowBlur = 0;
    y += nameSize + 16;

    // Role label
    ctx.font = "700 34px -apple-system, BlinkMacSystemFont, sans-serif";
    ctx.fillStyle = rl;
    ctx.fillText(ROLE_LABEL[profile.role] ?? profile.role, centerX, y);
    y += 46;

    // Sport (optional)
    if (profile.sport) {
        ctx.font = "400 30px -apple-system, BlinkMacSystemFont, sans-serif";
        ctx.fillStyle = "rgba(255,255,255,0.55)";
        ctx.fillText(profile.sport, centerX, y);
        y += 40;
    }

    // Region (optional)
    if (profile.region) {
        ctx.font = "400 26px -apple-system, BlinkMacSystemFont, sans-serif";
        ctx.fillStyle = "rgba(255,255,255,0.38)";
        ctx.fillText(profile.region + (profile.prefecture ? ` / ${profile.prefecture}` : ""), centerX, y);
        y += 38;
    }

    y += 22;

    // Cheer count (centered)
    const cheerCount = profile.cheerCount ?? 0;
    ctx.font = "900 72px 'SF Mono', monospace";
    ctx.fillStyle = "#FFD600";
    ctx.fillText(String(cheerCount), centerX, y);
    y += 58;
    ctx.font = "600 26px -apple-system, BlinkMacSystemFont, sans-serif";
    ctx.fillStyle = "rgba(255,255,255,0.4)";
    ctx.fillText("Cheer", centerX, y);
    y += 44;

    // Thin divider line (centered)
    ctx.strokeStyle = "rgba(255,255,255,0.14)";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(centerX - 200, y);
    ctx.lineTo(centerX + 200, y);
    ctx.stroke();
    y += 44;

    // Invite text
    ctx.font = "500 30px -apple-system, BlinkMacSystemFont, sans-serif";
    ctx.fillStyle = "rgba(255,255,255,0.45)";
    ctx.fillText("一緒にはじめよう", centerX, y);
    y += 46;

    // Referral URL
    ctx.font = "700 32px 'SF Mono', 'Fira Code', monospace";
    ctx.fillStyle = rl;
    ctx.fillText(`vizion-connection.jp/r/${profile.slug}`, centerX, y);
    y += 40;

    // SECTION 5: Bottom area — QR code centered after 40px gap
    y += 40;
    const qrDataUrl = await QRCode.toDataURL(
        `https://vizion-connection.jp/r/${profile.slug}`,
        { width: 200, margin: 2, color: { dark: "#ffffff", light: "#00000000" } }
    );
    await new Promise<void>((resolve) => {
        const qrImg = new Image();
        qrImg.onload = () => {
            const qrSize = 160;
            const box = qrSize + 16;
            const x0 = centerX - box / 2;
            roundedRect(x0, y, box, box, 12);
            ctx.fillStyle = "rgba(255,255,255,0.06)";
            ctx.fill();
            ctx.drawImage(qrImg, centerX - qrSize / 2, y + 8, qrSize, qrSize);
            resolve();
        };
        qrImg.onerror = () => resolve();
        qrImg.src = qrDataUrl;
    });

    // Serial ID + tagline at bottom
    ctx.textAlign = "center";
    ctx.font = "600 22px 'SF Mono', monospace";
    ctx.fillStyle = "rgba(255,255,255,0.18)";
    ctx.fillText(profile.serialId ?? "", centerX, H - 64);
    ctx.font = "400 20px -apple-system, sans-serif";
    ctx.fillStyle = "rgba(255,255,255,0.1)";
    ctx.fillText("Beyond the Limit, Connect the Trust.", centerX, H - 36);

    return canvas;
}

export function ProfileCardSection({
    profile,
    t,
    roleColor,
    setView,
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
    const [qrDataUrl, setQrDataUrl] = useState<string>("");
    const [referralCopied, setReferralCopied] = useState(false);
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

    const rl = roleColor ?? (ROLE_COLOR[profile.role] ?? "#a78bfa");
    const bg1 = ROLE_GRADIENT[profile.role] ?? "#1a1a2e";
    const initials = profile.displayName.split(" ").map((w: string) => w[0]).join("").slice(0, 2).toUpperCase();
    const vzId = profile.serialId ?? "VZ-2026-000001";
    const cheerCount = profile.cheerCount ?? 0;
    const latestCheers = profile.latestCheers ?? [];
    const isFounding = profile.isFoundingMember ?? false;
    const isPublicMode = mode === "public";

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
                        action={
                            <div className="flex gap-[6px]">
                                <span className="rounded-[20px] px-2 py-[3px] text-[9px] font-bold" style={{ background: `${rl}15`, color: rl, border: `1px solid ${rl}30` }}>{ROLE_LABEL[profile.role]}</span>
                                {setView ? (
                                    <button onClick={() => setView("profile")} className="flex cursor-pointer items-center gap-1 rounded-[20px] px-[9px] py-[3px] text-[9px] font-extrabold" style={{ background: `${rl}12`, border: `1px solid ${rl}30`, color: rl }}>
                                        <svg width={10} height={10} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" /></svg>
                                        プロフィール表示
                                    </button>
                                ) : (
                                    <a href={`/u/${profile.slug}`} className="flex items-center gap-1 rounded-[20px] px-[9px] py-[3px] text-[9px] font-extrabold no-underline" style={{ background: `${rl}12`, border: `1px solid ${rl}30`, color: rl }}>
                                        <svg width={10} height={10} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" /></svg>
                                        公開ページ
                                    </a>
                                )}
                            </div>
                        }
                    />
                </div>
            )}

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
                                {profile.profileImageUrl ? (
                                    <NextImage src={profile.profileImageUrl} alt={profile.displayName} width={1} height={1} unoptimized sizes="(max-width: 768px) 62vw, 62%" style={{ position: "absolute", top: 0, bottom: 0, right: 0, width: "62%", height: "100%", objectFit: "cover", objectPosition: "center top", pointerEvents: "none", zIndex: 3, ...photoMask }} />
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
                                    <div style={{ display: "flex", flexDirection: "column", gap: 5, alignItems: "flex-start" }}>
                                        <div style={{ display: "inline-flex" }}>{isFounding ? <FoundingMemberBadge /> : <EarlyPartnerBadge />}</div>
                                        <span style={{ fontFamily: "monospace", fontSize: 8.5, letterSpacing: "0.06em", color: "rgba(255,255,255,0.5)" }}>{profile.region || "N/A"} / {profile.prefecture || "N/A"}</span>
                                    </div>
                                    <div style={{ display: "flex", flex: 1, flexDirection: "column", justifyContent: "center", gap: 3 }}>
                                        <div style={{ fontFamily: "monospace", fontSize: 7, fontWeight: 500, letterSpacing: "0.22em", textTransform: "uppercase", color: "rgba(255,255,255,0.38)" }}>{ROLE_LABEL[profile.role]}</div>
                                        <div style={{ fontSize: "clamp(14px, 4.2vw, 18px)", fontWeight: 900, color: "#fff", lineHeight: 1.04, letterSpacing: "-0.01em", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", maxWidth: "100%", textShadow: "0 1px 0 rgba(255,255,255,0.5), 0 -1px 0 rgba(0,0,0,0.75), 0 2px 5px rgba(0,0,0,0.55), 0 0 14px rgba(255,255,255,0.05)" }}>{profile.displayName}</div>
                                        {profile.sport && <div style={{ fontFamily: "monospace", fontSize: "clamp(9px, 2.8vw, 10.5px)", letterSpacing: "0.03em", color: "rgba(255,255,255,0.52)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{profile.sport}</div>}
                                        <div style={{ display: "flex", alignItems: "center", gap: 4, marginTop: 5 }}>
                                            <span style={{ fontSize: 9, color: "#FFD600" }}>★</span>
                                            <span style={{ fontFamily: "monospace", fontSize: 7, letterSpacing: "0.12em", color: "rgba(255,255,255,0.28)" }}>Cheer</span>
                                            <span style={{ fontFamily: "monospace", fontSize: 16, fontWeight: 800, lineHeight: 1, color: "#FFD600" }}>{cheerCount}</span>
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
                                            Account ID
                                        </span>
                                        <span
                                            style={{
                                                display: "block",
                                                fontFamily: "monospace",
                                                fontSize: "clamp(12px, 3.0vw, 17px)",
                                                fontWeight: 950,
                                                letterSpacing: "clamp(0.06em, 0.5vw, 0.16em)",
                                                color: "rgba(255,255,255,0.72)",
                                                whiteSpace: "nowrap",
                                                textShadow: "0 1px 0 rgba(255,255,255,0.42), 0 -1px 0 rgba(0,0,0,0.88), 0 2px 8px rgba(0,0,0,0.62)",
                                                filter: "drop-shadow(0 0 10px rgba(0,0,0,0.28))",
                                            }}
                                        >
                                            {vzId}
                                        </span>
                                    </div>
                                </div>
                                <div style={{ position: "absolute", bottom: 10, right: 10, zIndex: 7 }}>
                                    <NextImage src="/images/Vizion_Connection_logo-wt.png" alt="Logo" width={140} height={38} style={{ height: 38, width: "auto", opacity: 0.55, mixBlendMode: "lighten" }} />
                                </div>
                            </div>

                            {/* BACK */}
                            <div className="v12-face" style={{ ...faceBase, ["--rg-val" as string]: rl, transform: "rotateY(180deg)", WebkitTransform: "rotateY(180deg)", background: `linear-gradient(145deg, ${bg1} 0%, #000 100%)` }}>
                                <div style={{ position: "absolute", inset: 0, background: "linear-gradient(128deg,rgba(255,255,255,0.10) 0%,rgba(255,255,255,0.025) 30%,transparent 55%)", borderRadius: 14, pointerEvents: "none" }} />
                                <div style={{ position: "absolute", inset: 1, borderRadius: 13, border: "1px solid rgba(255,255,255,0.04)", pointerEvents: "none" }} />
                                <div className="v12-shim" style={{ position: "absolute", inset: 0, zIndex: 10, borderRadius: 14, opacity: 0, pointerEvents: "none" }} />
                                {profile.profileImageUrl ? (
                                    <NextImage src={profile.profileImageUrl} alt="" width={1} height={1} unoptimized sizes="(max-width: 768px) 60vw, 60%" style={{ position: "absolute", top: 0, right: 0, bottom: 0, width: "60%", height: "100%", objectFit: "cover", objectPosition: "center top", pointerEvents: "none", opacity: 0.7, ...photoMaskSoft }} />
                                ) : (
                                    <div style={{ position: "absolute", right: 0, top: 0, width: "60%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "monospace", fontSize: 60, fontWeight: 700, color: "rgba(255,255,255,0.04)", pointerEvents: "none", userSelect: "none", ...photoMaskSoft }}>{initials}</div>
                                )}
                                <div style={{ position: "absolute", inset: 0, zIndex: 30, display: "flex", flexDirection: "column", justifyContent: "space-between", padding: "14px 13px 16px" }}>
                                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", pointerEvents: "none" }}>
                                        <NextImage src="/images/Vizion_Connection_logo-wt.png" alt="Logo" width={120} height={30} style={{ height: 30, width: "auto", opacity: 0.6, mixBlendMode: "lighten" }} />
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

            <ShareMenu profile={profile} rl={rl} compact={isPublicMode} />

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

// ── シェアメニュー ─────────────────────────────────────────────────────────────
function ShareMenu({ profile, rl, compact = false }: { profile: ProfileData; rl: string; compact?: boolean }) {
    const [open, setOpen] = useState(false);
    const [copied, setCopied] = useState(false);
    const [storiesLoading, setStoriesLoading] = useState(false);
    const [storiesDownloaded, setStoriesDownloaded] = useState(false);

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
        const text = `${profile.displayName}（${role}${sport}）のVizion Connectionプロフィール 🔥\n⭐ Cheer ${cheer} / スポーツの信頼を、可視化する。\n#VizionConnection #スポーツ`;
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

            // Mobile: try Web Share API first (user can choose Instagram from share sheet)
            try {
                if (navigator.canShare?.({ files: [file] }) && navigator.share) {
                    await navigator.share({
                        files: [file],
                        title: `${profile.displayName} | Vizion Connection`,
                        text: `一緒にはじめよう → vizion-connection.jp/r/${profile.slug}`,
                    });
                    return;
                }
            } catch (err: unknown) {
                if (err instanceof Error && err.name === "AbortError") {
                    // fall back to download
                } else {
                    // fall back to download
                }
            }

            // Fallback: auto-download
            const objUrl = URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = objUrl;
            a.download = `vizion-stories-${profile.slug}.png`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            setTimeout(() => URL.revokeObjectURL(objUrl), 1000);

            setStoriesDownloaded(true);
            setTimeout(() => setStoriesDownloaded(false), 5000);
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
            key: "x",
            label: "Xに投稿", sub: "OG画像付きでツイート",
            icon: <svg viewBox="0 0 24 24" width={14} height={14} fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.746l7.73-8.835L1.254 2.25H8.08l4.253 5.622zm-1.161 17.52h1.833L7.084 4.126H5.117z" /></svg>,
            color: "#ffffff", bg: "rgba(255,255,255,0.06)", border: "rgba(255,255,255,0.1)", onClick: handleX, loading: false,
        },
        {
            key: "stories",
            label: storiesDownloaded ? "画像を保存しました ✓" : "Instagram Stories",
            sub: storiesDownloaded ? "Instagramアプリを開いてストーリーズに追加" : "写真をフル背景にしたカードを投稿",
            icon: <svg viewBox="0 0 24 24" width={14} height={14} fill="currentColor"><path d="M7.8 2h8.4C19.4 2 22 4.6 22 7.8v8.4a5.8 5.8 0 01-5.8 5.8H7.8C4.6 22 2 19.4 2 16.2V7.8A5.8 5.8 0 017.8 2zm-.2 2A3.6 3.6 0 004 7.6v8.8C4 18.39 5.61 20 7.6 20h8.8a3.6 3.6 0 003.6-3.6V7.6C20 5.61 18.39 4 16.4 4H7.6zm9.65 1.5a1.25 1.25 0 110 2.5 1.25 1.25 0 010-2.5zM12 7a5 5 0 110 10A5 5 0 0112 7zm0 2a3 3 0 100 6 3 3 0 000-6z" /></svg>,
            color: "#e1306c", bg: "linear-gradient(135deg,rgba(240,148,51,.1),rgba(188,24,136,.1))", border: "rgba(225,48,108,0.2)", onClick: handleStories, loading: storiesLoading,
        },
        {
            key: "copy",
            label: copied ? "コピーしました ✓" : "URLをコピー", sub: "プロフィールURLをコピー",
            icon: <svg width={14} height={14} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M13.19 8.688a4.5 4.5 0 011.242 7.244l-4.5 4.5a4.5 4.5 0 01-6.364-6.364l1.757-1.757m13.35-.622l1.757-1.757a4.5 4.5 0 00-6.364-6.364l-4.5 4.5a4.5 4.5 0 001.242 7.244" /></svg>,
            color: copied ? "#32D278" : "rgba(255,255,255,0.55)", bg: copied ? "rgba(50,210,120,0.08)" : "rgba(255,255,255,0.04)", border: copied ? "rgba(50,210,120,0.25)" : "rgba(255,255,255,0.08)", onClick: handleCopyUrl, loading: false,
        },
        {
            key: "native",
            label: "その他のアプリでシェア", sub: "Web Share API / LINEなど",
            icon: <svg width={14} height={14} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M7.217 10.907a2.25 2.25 0 100 2.186m0-2.186c.18.324.283.696.283 1.093s-.103.77-.283 1.093m0-2.186l9.566-5.314m-9.566 7.5l9.566 5.314m0 0a2.25 2.25 0 103.935 2.186 2.25 2.25 0 00-3.935-2.186zm0-12.814a2.25 2.25 0 103.933-2.185 2.25 2.25 0 00-3.933 2.185z" /></svg>,
            color: "rgba(255,255,255,0.4)", bg: "rgba(255,255,255,0.03)", border: "rgba(255,255,255,0.07)", onClick: handleNativeShare, loading: false,
        },
    ];

    return (
        <div className="relative" style={{ marginTop: compact ? 12 : 14 }}>
            <div className="flex items-center justify-end gap-2">
                <button
                    onClick={() => setOpen(v => !v)}
                    className="flex cursor-pointer items-center gap-[6px] rounded-[10px] px-[12px] py-[var(--share-btn-y)] text-[var(--share-btn-size)] font-bold transition-all duration-200"
                    style={{ ["--share-btn-y" as string]: compact ? "7px" : "6px", ["--share-btn-size" as string]: `${compact ? 12 : 11}px`, background: open ? `${rl}18` : "rgba(255,255,255,0.06)", border: `1px solid ${open ? rl + "40" : "rgba(255,255,255,0.1)"}`, color: open ? rl : "rgba(255,255,255,0.6)" }}
                >
                    <svg width={12} height={12} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M7.217 10.907a2.25 2.25 0 100 2.186m0-2.186c.18.324.283.696.283 1.093s-.103.77-.283 1.093m0-2.186l9.566-5.314m-9.566 7.5l9.566 5.314m0 0a2.25 2.25 0 103.935 2.186 2.25 2.25 0 00-3.935-2.186zm0-12.814a2.25 2.25 0 103.933-2.185 2.25 2.25 0 00-3.933 2.185z" /></svg>
                    シェア
                    <svg width={10} height={10} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5} className="transition-transform duration-200" style={{ transform: open ? "rotate(180deg)" : "rotate(0deg)" }}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                    </svg>
                </button>
            </div>

            {open && (
                <>
                    <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
                    <div className="absolute bottom-[calc(100%+8px)] right-0 z-50 w-[260px] overflow-hidden rounded-[14px]" style={{ background: "#0f0f1c", border: `1px solid ${rl}30`, boxShadow: `0 8px 40px rgba(0,0,0,0.7), 0 0 0 1px ${rl}15`, animation: "shareMenuIn 0.18s cubic-bezier(0.16,1,0.3,1)" }}>
                        <style>{`@keyframes shareMenuIn { from{opacity:0;transform:translateY(8px) scale(0.97)} to{opacity:1;transform:translateY(0) scale(1)} }`}</style>
                        <div className="border-b px-[14px] pb-[9px] pt-[11px]" style={{ borderBottomColor: `${rl}18` }}>
                            <p className="m-0 font-mono text-[9px] font-extrabold uppercase tracking-[0.2em]" style={{ color: "rgba(255,255,255,0.25)" }}>Share Card</p>
                        </div>
                        <div className="p-[6px]">
                            {menuItems.map((item) => (
                                <div key={item.key}>
                                    <button onClick={item.onClick} disabled={item.loading}
                                        className="mb-1 flex w-full items-center gap-[10px] rounded-[9px] px-3 py-[10px] text-left transition-[filter] duration-150"
                                        style={{ background: item.bg, border: `1px solid ${item.border}`, color: item.color, cursor: item.loading ? "wait" : "pointer" }}
                                    >
                                        <span className="flex w-5 shrink-0 justify-center">
                                            {item.loading
                                                ? <svg width={14} height={14} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} style={{ animation: "spin .8s linear infinite" }}><path strokeLinecap="round" strokeLinejoin="round" d="M4 12a8 8 0 018-8v8H4z" /></svg>
                                                : item.icon}
                                        </span>
                                        <span className="flex-1">
                                            <span className="block text-[12px] font-bold leading-[1.3]">{item.label}</span>
                                            <span className="mt-px block text-[10px] opacity-45">{item.sub}</span>
                                        </span>
                                    </button>

                                    {item.key === "stories" && storiesDownloaded && (
                                        <button
                                            onClick={() => window.open("instagram://", "_blank")}
                                            className="mb-1 flex w-full items-center justify-center gap-[8px] rounded-[9px] px-3 py-[10px] text-[12px] font-bold"
                                            style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", color: "rgba(255,255,255,0.75)" }}
                                        >
                                            Instagramを開く
                                        </button>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                </>
            )}
            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
    );
}
