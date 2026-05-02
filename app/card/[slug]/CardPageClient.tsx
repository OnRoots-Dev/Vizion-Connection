"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ProfileCardSection } from "@/app/(app)/dashboard/components/ProfileCard";
import ShareButton from "./ShareButton";
import type { PublicProfileData } from "@/features/profile/types";
import type { ProfileData } from "@/features/profile/types";
import Image from "next/image";

const ROLE_COLOR: Record<string, string> = {
    Athlete: "#C1272D", Trainer: "#1A7A4A", Members: "#B8860B", Business: "#1B3A8C",
};

const theme = {
    bg: "#07070e", surface: "#0d0d1a",
    border: "rgba(255,255,255,0.07)", text: "#ffffff", sub: "rgba(255,255,255,0.45)",
};

export default function CardPageClient({
    profile,
    referralUrl,
}: {
    profile: PublicProfileData;
    referralUrl: string;
}) {
    const [copied, setCopied] = useState(false);
    const [shareOpen, setShareOpen] = useState(false);
    const rl = ROLE_COLOR[profile.role] ?? "#a78bfa";
    const profileUrl = `https://vizion-connection.jp/u/${profile.slug}`;

    const roleGlowClass =
        profile.role === "Athlete"
            ? "bg-[radial-gradient(ellipse_60%_40%_at_50%_0%,rgba(193,39,45,0.12)_0%,transparent_70%)]"
            : profile.role === "Trainer"
                ? "bg-[radial-gradient(ellipse_60%_40%_at_50%_0%,rgba(26,122,74,0.12)_0%,transparent_70%)]"
                : profile.role === "Members"
                    ? "bg-[radial-gradient(ellipse_60%_40%_at_50%_0%,rgba(184,134,11,0.12)_0%,transparent_70%)]"
                    : profile.role === "Business"
                        ? "bg-[radial-gradient(ellipse_60%_40%_at_50%_0%,rgba(27,58,140,0.12)_0%,transparent_70%)]"
                        : "bg-[radial-gradient(ellipse_60%_40%_at_50%_0%,rgba(167,139,250,0.12)_0%,transparent_70%)]";

    const roleSolidBgClass =
        profile.role === "Athlete"
            ? "bg-[#c1272d]"
            : profile.role === "Trainer"
                ? "bg-[#1a7a4a]"
                : profile.role === "Members"
                    ? "bg-[#b8860b]"
                    : profile.role === "Business"
                        ? "bg-[#1b3a8c]"
                        : "bg-[#a78bfa]";

    const roleSolidTextClass =
        profile.role === "Athlete"
            ? "text-[#c1272d]"
            : profile.role === "Trainer"
                ? "text-[#1a7a4a]"
                : profile.role === "Members"
                    ? "text-[#b8860b]"
                    : profile.role === "Business"
                        ? "text-[#1b3a8c]"
                        : "text-[#a78bfa]";

    const roleBorderClass =
        profile.role === "Athlete"
            ? "border-[rgba(193,39,45,0.4)]"
            : profile.role === "Trainer"
                ? "border-[rgba(26,122,74,0.4)]"
                : profile.role === "Members"
                    ? "border-[rgba(184,134,11,0.4)]"
                    : profile.role === "Business"
                        ? "border-[rgba(27,58,140,0.4)]"
                        : "border-[rgba(167,139,250,0.4)]";

    const roleSurfaceBorderClass =
        profile.role === "Athlete"
            ? "border-[rgba(193,39,45,0.3)]"
            : profile.role === "Trainer"
                ? "border-[rgba(26,122,74,0.3)]"
                : profile.role === "Members"
                    ? "border-[rgba(184,134,11,0.3)]"
                    : profile.role === "Business"
                        ? "border-[rgba(27,58,140,0.3)]"
                        : "border-[rgba(167,139,250,0.3)]";

    const roleSurfaceShadowClass =
        profile.role === "Athlete"
            ? "shadow-[0_0_48px_rgba(193,39,45,0.15),0_24px_60px_rgba(0,0,0,0.8)]"
            : profile.role === "Trainer"
                ? "shadow-[0_0_48px_rgba(26,122,74,0.15),0_24px_60px_rgba(0,0,0,0.8)]"
                : profile.role === "Members"
                    ? "shadow-[0_0_48px_rgba(184,134,11,0.15),0_24px_60px_rgba(0,0,0,0.8)]"
                    : profile.role === "Business"
                        ? "shadow-[0_0_48px_rgba(27,58,140,0.15),0_24px_60px_rgba(0,0,0,0.8)]"
                        : "shadow-[0_0_48px_rgba(167,139,250,0.15),0_24px_60px_rgba(0,0,0,0.8)]";

    async function handleCopy() {
        try { await navigator.clipboard.writeText(profileUrl); } catch { }
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    }

    return (
        <div className="relative min-h-screen bg-[#07070e] text-white">
            <div className={`fixed inset-0 z-0 pointer-events-none ${roleGlowClass}`} />

            {/* ── シェアモーダル ── */}
            <AnimatePresence>
                {shareOpen && (
                    <>
                        {/* オーバーレイ */}
                        <motion.div
                            key="overlay"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setShareOpen(false)}
                            className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm"
                        />
                        {/* モーダル本体 */}
                        <motion.div
                            key="modal"
                            initial={{ opacity: 0, y: 40, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: 20, scale: 0.97 }}
                            transition={{ type: "spring", damping: 24, stiffness: 300 }}
                            className="fixed bottom-0 left-0 right-0 z-[51] mx-auto max-w-[560px] px-4 pb-8"
                        >
                            <div className={`rounded-[20px] border bg-[#0d0d1a] px-[18px] py-5 ${roleSurfaceBorderClass} ${roleSurfaceShadowClass}`}>
                                {/* モーダルヘッダー */}
                                <div className="mb-4 flex items-center justify-between">
                                    <div>
                                        <p className="m-0 font-mono text-[9px] font-extrabold uppercase tracking-[0.2em] text-white/30">
                                            Share Card
                                        </p>
                                        <p className="mt-1 text-[14px] font-bold text-white">
                                            {profile.displayName}
                                        </p>
                                    </div>
                                    <button
                                        onClick={() => setShareOpen(false)}
                                        className="flex h-8 w-8 items-center justify-center rounded-full border border-white/10 bg-white/5 text-white/50 transition-colors hover:bg-white/10 hover:text-white"
                                        aria-label="閉じる"
                                    >
                                        <svg width={14} height={14} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                                        </svg>
                                    </button>
                                </div>

                                {/* カード見本プレビュー */}
                                <div className={`mb-3.5 overflow-hidden rounded-xl border bg-black/30 ${roleSurfaceBorderClass}`}>
                                    {/* OG画像プレビュー（/api/og/slug から取得） */}
                                    <Image
                                        src={`/api/og/${profile.slug}?format=og`}
                                        alt="カードプレビュー"
                                        width={1200}
                                        height={630}
                                        unoptimized
                                        className="block h-auto w-full rounded-xl"
                                        onError={(e) => {
                                            (e.target as HTMLImageElement).style.display = "none";
                                        }}
                                    />
                                </div>

                                {/* ShareButton（3つのボタン） */}
                                <ShareButton
                                    slug={profile.slug}
                                    displayName={profile.displayName}
                                    roleColor={rl}
                                    profileUrl={profileUrl}
                                />
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>

            <main className="relative z-10 mx-auto max-w-[560px] px-5 pb-20 pt-8">

                {/* ── プロフィールカード ── */}
                <div id="profile-card-share">
                    <ProfileCardSection profile={profile as unknown as ProfileData} t={theme} />
                </div>

                {/* ── Share URL ── */}
                <motion.div
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="mt-4 mb-3 rounded-2xl border border-white/10 bg-[#0d0d1a] px-[18px] py-4"
                >
                    <p className="m-0 font-mono text-[9px] font-extrabold uppercase tracking-[0.2em] text-white/30">
                        Share Card
                    </p>
                    <div className="mt-2 flex gap-2">
                        {/* URL表示 */}
                        <div className="flex flex-1 items-center overflow-hidden rounded-[10px] border border-white/10 bg-white/5 px-3 py-[9px]">
                            <span className="overflow-hidden text-ellipsis whitespace-nowrap font-mono text-[11px] text-white/40">
                                {profileUrl}
                            </span>
                        </div>

                        {/* コピーボタン */}
                        <button
                            onClick={handleCopy}
                            className={
                                copied
                                    ? "flex-shrink-0 rounded-[10px] bg-emerald-500/10 px-4 py-[9px] text-[12px] font-bold text-emerald-400 transition-colors"
                                    : `${roleSolidBgClass} flex-shrink-0 rounded-[10px] px-4 py-[9px] text-[12px] font-bold text-black transition-colors hover:brightness-110`
                            }
                        >
                            {copied ? "✓ コピー" : "コピー"}
                        </button>

                        {/* ── シェアボタン（モーダルを開く） ── */}
                        <button
                            onClick={() => setShareOpen(true)}
                            title="カードをシェア"
                            className={`flex h-[42px] w-[42px] flex-shrink-0 items-center justify-center rounded-[10px] border bg-white/5 transition-colors hover:bg-white/10 ${roleBorderClass} ${roleSolidTextClass}`}
                        >
                            <svg width={16} height={16} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M7.217 10.907a2.25 2.25 0 100 2.186m0-2.186c.18.324.283.696.283 1.093s-.103.77-.283 1.093m0-2.186l9.566-5.314m-9.566 7.5l9.566 5.314m0 0a2.25 2.25 0 103.935 2.186 2.25 2.25 0 00-3.935-2.186zm0-12.814a2.25 2.25 0 103.933-2.185 2.25 2.25 0 00-3.933 2.185z" />
                            </svg>
                        </button>
                    </div>
                </motion.div>

                {/* ── Referral CTA ── */}
                <motion.div
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className={
                        profile.role === "Athlete"
                            ? "rounded-2xl border border-[rgba(193,39,45,0.2)] bg-[rgba(193,39,45,0.08)] px-5 py-[22px] text-center"
                            : profile.role === "Trainer"
                                ? "rounded-2xl border border-[rgba(26,122,74,0.2)] bg-[rgba(26,122,74,0.08)] px-5 py-[22px] text-center"
                                : profile.role === "Members"
                                    ? "rounded-2xl border border-[rgba(184,134,11,0.2)] bg-[rgba(184,134,11,0.08)] px-5 py-[22px] text-center"
                                    : profile.role === "Business"
                                        ? "rounded-2xl border border-[rgba(27,58,140,0.2)] bg-[rgba(27,58,140,0.08)] px-5 py-[22px] text-center"
                                        : "rounded-2xl border border-[rgba(167,139,250,0.2)] bg-[rgba(167,139,250,0.08)] px-5 py-[22px] text-center"
                    }
                >
                    <p className="m-0 mb-4 text-[13px] leading-[1.7] text-white/50">
                        <span className="font-bold text-white">{profile.displayName}</span> の紹介で<br />
                        Vizion Connection に参加しませんか？
                    </p>
                    <a href={referralUrl} className={`${roleSolidBgClass} inline-flex items-center gap-[7px] rounded-xl px-7 py-3 text-[13px] font-extrabold text-black transition-colors hover:brightness-110`}>
                        先行登録する（無料）
                        <svg width={14} height={14} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                        </svg>
                    </a>
                </motion.div>
            </main>
        </div>
    );
}