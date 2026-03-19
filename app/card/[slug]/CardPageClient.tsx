"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ProfileCardSection } from "@/app/(app)/dashboard/components/ProfileCard";
import ShareButton from "./ShareButton";
import type { PublicProfileData } from "@/features/profile/types";
import type { ProfileData } from "@/features/profile/types";

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

    async function handleCopy() {
        try { await navigator.clipboard.writeText(profileUrl); } catch { }
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    }

    return (
        <div style={{ minHeight: "100vh", background: "#07070e", color: "#fff" }}>
            <style>{`
                * { box-sizing: border-box; scrollbar-width: none; }
                *::-webkit-scrollbar { display: none; }
                a { text-decoration: none; }
            `}</style>

            <div style={{
                position: "fixed", inset: 0, pointerEvents: "none", zIndex: 0,
                background: `radial-gradient(ellipse 60% 40% at 50% 0%, ${rl}12 0%, transparent 70%)`,
            }} />

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
                            style={{
                                position: "fixed", inset: 0, zIndex: 50,
                                background: "rgba(0,0,0,0.75)", backdropFilter: "blur(6px)",
                            }}
                        />
                        {/* モーダル本体 */}
                        <motion.div
                            key="modal"
                            initial={{ opacity: 0, y: 40, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: 20, scale: 0.97 }}
                            transition={{ type: "spring", damping: 24, stiffness: 300 }}
                            style={{
                                position: "fixed", bottom: 0, left: 0, right: 0,
                                zIndex: 51, padding: "0 16px 32px",
                                maxWidth: "560px", margin: "0 auto",
                            }}
                        >
                            <div style={{
                                borderRadius: 20, padding: "20px 18px",
                                background: "#0d0d1a",
                                border: `1px solid ${rl}30`,
                                boxShadow: `0 0 48px ${rl}15, 0 24px 60px rgba(0,0,0,0.8)`,
                            }}>
                                {/* モーダルヘッダー */}
                                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
                                    <div>
                                        <p style={{ margin: 0, fontSize: 9, fontWeight: 800, letterSpacing: "0.2em", textTransform: "uppercase", color: "rgba(255,255,255,0.3)", fontFamily: "monospace" }}>
                                            Share Card
                                        </p>
                                        <p style={{ margin: "4px 0 0", fontSize: 14, fontWeight: 700, color: "#fff" }}>
                                            {profile.displayName}
                                        </p>
                                    </div>
                                    <button
                                        onClick={() => setShareOpen(false)}
                                        style={{
                                            width: 32, height: 32, borderRadius: "50%",
                                            background: "rgba(255,255,255,0.06)",
                                            border: "1px solid rgba(255,255,255,0.1)",
                                            color: "rgba(255,255,255,0.5)",
                                            cursor: "pointer", display: "flex",
                                            alignItems: "center", justifyContent: "center",
                                        }}
                                    >
                                        <svg width={14} height={14} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                                        </svg>
                                    </button>
                                </div>

                                {/* カード見本プレビュー */}
                                <div style={{
                                    borderRadius: 12, overflow: "hidden",
                                    marginBottom: 14,
                                    border: `1px solid ${rl}20`,
                                    background: "rgba(0,0,0,0.3)",
                                }}>
                                    {/* OG画像プレビュー（/api/og/slug から取得） */}
                                    {/* eslint-disable-next-line @next/next/no-img-element */}
                                    <img
                                        src={`/api/og/${profile.slug}?format=og`}
                                        alt="カードプレビュー"
                                        style={{
                                            width: "100%",
                                            height: "auto",
                                            display: "block",
                                            borderRadius: 12,
                                        }}
                                        onError={(e) => {
                                            // 画像読み込み失敗時は非表示
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

            <main style={{
                maxWidth: "560px", margin: "0 auto",
                padding: "32px 20px 80px",
                position: "relative", zIndex: 1,
            }}>

                {/* ── プロフィールカード ── */}
                <div id="profile-card-share">
                    <ProfileCardSection profile={profile as unknown as ProfileData} t={theme} />
                </div>

                {/* ── Share URL ── */}
                <motion.div
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    style={{
                        borderRadius: 16, padding: "16px 18px",
                        background: "#0d0d1a", border: "1px solid rgba(255,255,255,0.07)",
                        marginTop: 16, marginBottom: 12,
                    }}
                >
                    <p style={{
                        fontSize: 9, fontWeight: 800, letterSpacing: "0.2em",
                        textTransform: "uppercase", color: "rgba(255,255,255,0.3)",
                        margin: "0 0 10px", fontFamily: "monospace",
                    }}>
                        Share Card
                    </p>
                    <div style={{ display: "flex", gap: 8 }}>
                        {/* URL表示 */}
                        <div style={{
                            flex: 1, display: "flex", alignItems: "center",
                            padding: "9px 12px", borderRadius: 10,
                            background: "rgba(255,255,255,0.04)",
                            border: "1px solid rgba(255,255,255,0.07)",
                            overflow: "hidden",
                        }}>
                            <span style={{
                                fontFamily: "monospace", fontSize: 11,
                                color: "rgba(255,255,255,0.35)",
                                overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                            }}>
                                {profileUrl}
                            </span>
                        </div>

                        {/* コピーボタン */}
                        <button onClick={handleCopy} style={{
                            flexShrink: 0, padding: "9px 16px", borderRadius: 10,
                            background: copied ? "rgba(50,210,120,0.12)" : rl,
                            border: "none",
                            color: copied ? "#32D278" : "#000",
                            fontSize: 12, fontWeight: 700,
                            cursor: "pointer", transition: "all 0.2s",
                        }}>
                            {copied ? "✓ コピー" : "コピー"}
                        </button>

                        {/* ── シェアボタン（モーダルを開く） ── */}
                        <button
                            onClick={() => setShareOpen(true)}
                            title="カードをシェア"
                            style={{
                                flexShrink: 0, width: "42px", height: "42px",
                                borderRadius: 10, border: `1px solid ${rl}40`,
                                background: `${rl}15`, color: rl,
                                cursor: "pointer", display: "flex",
                                alignItems: "center", justifyContent: "center",
                                transition: "all 0.2s",
                            }}
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
                    style={{
                        borderRadius: 16, padding: "22px 20px",
                        background: `${rl}08`, border: `1px solid ${rl}20`,
                        textAlign: "center",
                    }}
                >
                    <p style={{ fontSize: 13, color: "rgba(255,255,255,0.5)", margin: "0 0 16px", lineHeight: 1.7 }}>
                        <span style={{ color: "#fff", fontWeight: 700 }}>{profile.displayName}</span> の紹介で<br />
                        Vizion Connection に参加しませんか？
                    </p>
                    <a href={referralUrl} style={{
                        display: "inline-flex", alignItems: "center", gap: 7,
                        padding: "12px 28px", borderRadius: 12,
                        background: rl, color: "#000",
                        fontSize: 13, fontWeight: 800,
                    }}>
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