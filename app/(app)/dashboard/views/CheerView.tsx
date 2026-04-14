"use client";

// dashboard/views/CheerView.tsx
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import type { ProfileData } from "@/features/profile/types";
import type { DashboardView, ThemeColors } from "@/app/(app)/dashboard/types";
import { SectionCard, SLabel, ViewHeader } from "@/app/(app)/dashboard/components/ui";
import { ProfilePreviewModal } from "@/app/(app)/dashboard/components/ProfilePreviewModal";
import AdCard from "@/app/(app)/news-rooms/components/AdCard";

type InlineAd = {
    id: string;
    headline: string;
    image_url?: string;
    link_url: string;
    sponsor?: string;
    business_id?: number;
};

const ROLE_COLOR_MAP: Record<string, string> = {
    Athlete: "#FF5050", Trainer: "#32D278", Members: "#FFC81E", Business: "#3C8CFF",
};
const ROLE_LABEL_MAP: Record<string, string> = {
    Athlete: "ATHLETE", Trainer: "TRAINER", Members: "MEMBERS", Business: "BUSINESS",
};

function formatLocationLabel(value?: string | null) {
    if (!value) return "-";
    return value.trim() || "-";
}

function getCardBackground(user: any, color: string) {
    const overlays = [
        `linear-gradient(180deg, rgba(5,10,20,0.18) 0%, rgba(5,10,20,0.72) 55%, rgba(5,10,20,0.94) 100%)`,
        `linear-gradient(135deg, ${color}55 0%, rgba(8,12,22,0.18) 40%, rgba(8,12,22,0.88) 100%)`,
    ];

    if (user.profile_image_url) {
        return `${overlays.join(",")}, url(${user.profile_image_url})`;
    }

    return `linear-gradient(145deg, ${color}40, rgba(13,17,27,0.96) 60%, rgba(7,10,18,1) 100%)`;
}

function ProfileAvatar({ user, color, size }: { user: any; color: string; size: number }) {
    const initials = user.display_name?.[0]?.toUpperCase() ?? "?";
    return (
        <div style={{ width: size, height: size, borderRadius: "50%", overflow: "hidden", background: `${color}25`, border: `1px solid ${color}55`, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 900, color: color, flexShrink: 0, boxShadow: `0 10px 24px ${color}30` }}>
            {user.avatar_url ? <img src={user.avatar_url} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : initials}
        </div>
    );
}

export function CheerView({ profile, t, roleColor, setView }: {
    profile: ProfileData; t: ThemeColors; roleColor: string; setView: (v: DashboardView) => void;
}) {
    const cheerCount = profile.cheerCount ?? 0;
    const [rankingTab, setRankingTab] = useState("all");
    const [ranking, setRanking] = useState<any[]>([]);
    const [rankingLoading, setRankingLoading] = useState(true);
    const [myRank, setMyRank] = useState<number | null>(null);
    const [selectedProfileSlug, setSelectedProfileSlug] = useState<string | null>(null);
    const [ads, setAds] = useState<InlineAd[]>([]);

    useEffect(() => {
        fetch("/api/ads", { cache: "no-store" })
            .then((r) => r.json())
            .then((data) => setAds(Array.isArray(data?.ads) ? data.ads : []))
            .catch(() => setAds([]));
    }, []);

    useEffect(() => {
        setRankingLoading(true);
        const url = rankingTab === "all" ? "/api/cheer/ranking" : `/api/cheer/ranking?role=${rankingTab}`;
        fetch(url)
            .then(r => r.json())
            .then(d => {
                const users = d.users ?? [];
                setRanking(users);
                const idx = users.findIndex((u: any) => u.slug === profile.slug);
                setMyRank(idx >= 0 ? idx + 1 : null);
            })
            .catch(() => setRanking([]))
            .finally(() => setRankingLoading(false));
    }, [rankingTab]);

    const tabs = [
        { label: "全体", value: "all" },
        { label: "Athlete", value: "Athlete" },
        { label: "Trainer", value: "Trainer" },
        { label: "Members", value: "Members" },
        { label: "Business", value: "Business" },
    ];

    const renderMiniCard = (user: any, rank: number, compact = false) => {
        const rl = ROLE_COLOR_MAP[user.role] ?? "#aaa";
        const isMe = user.slug === profile.slug;
        const locationLabel = formatLocationLabel(user.region);

        if (compact) {
            return (
                <button
                    type="button"
                    onClick={() => setSelectedProfileSlug(user.slug)}
                    style={{
                        position: "relative",
                        overflow: "hidden",
                        width: "100%",
                        borderRadius: 18,
                        border: `1px solid ${isMe ? roleColor + "55" : rl + "40"}`,
                        backgroundImage: getCardBackground(user, rl),
                        backgroundSize: "cover",
                        backgroundPosition: "center",
                        padding: 12,
                        cursor: "pointer",
                        textAlign: "left",
                        boxShadow: `0 18px 38px ${rl}18`,
                    }}
                >
                    <div style={{ position: "absolute", inset: 0, background: "linear-gradient(90deg, rgba(0,0,0,0.88) 0%, rgba(0,0,0,0.58) 100%)", pointerEvents: "none" }} />
                    <div style={{ position: "absolute", top: -24, right: -24, width: 92, height: 92, borderRadius: "50%", background: `radial-gradient(circle, ${rl}35, transparent 70%)`, pointerEvents: "none" }} />
                    <div style={{ position: "relative", zIndex: 1, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 12, minWidth: 0 }}>
                            <span style={{ minWidth: 34, textAlign: "center", padding: "5px 8px", borderRadius: 999, background: "rgba(6,10,18,0.62)", border: `1px solid ${rl}55`, color: rl, fontSize: 10, fontFamily: "monospace", fontWeight: 900, flexShrink: 0 }}>
                                #{String(rank).padStart(2, "0")}
                            </span>
                            <ProfileAvatar user={user} color={rl} size={44} />
                            <div style={{ minWidth: 0, flex: 1 }}>
                                <div style={{ display: "flex", alignItems: "center", gap: 6, minWidth: 0 }}>
                                    <p style={{ fontSize: 13, fontWeight: 900, color: "#fff", margin: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{user.display_name}</p>
                                    <span style={{ fontSize: 8, fontWeight: 900, padding: "3px 7px", borderRadius: 999, background: "rgba(6,10,18,0.56)", color: rl, border: `1px solid ${rl}40`, fontFamily: "monospace", flexShrink: 0 }}>{ROLE_LABEL_MAP[user.role] ?? user.role}</span>
                                    {isMe ? <span style={{ fontSize: 8, fontFamily: "monospace", color: roleColor, flexShrink: 0 }}>YOU</span> : null}
                                </div>
                                <p style={{ fontSize: 10, fontFamily: "monospace", color: "rgba(255,255,255,0.55)", margin: "2px 0 0", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>@{user.slug}{locationLabel && locationLabel !== "-" ? ` · ${locationLabel}` : ""}</p>
                            </div>
                        </div>
                        <div style={{ flexShrink: 0, textAlign: "right" }}>
                            <div style={{ display: "flex", alignItems: "center", gap: 4, justifyContent: "flex-end" }}>
                                <span style={{ fontSize: 10, color: "#FFD600" }}>★</span>
                                <span style={{ fontSize: 16, fontWeight: 900, color: "#FFD600", fontFamily: "monospace" }}>{user.cheer_count}</span>
                            </div>
                            <span style={{ fontSize: 10, color: rl, fontWeight: 900 }}>Open →</span>
                        </div>
                    </div>
                </button>
            );
        }

        return (
            <button
                type="button"
                onClick={() => setSelectedProfileSlug(user.slug)}
                style={{
                    position: "relative",
                    overflow: "hidden",
                    width: "100%",
                    minHeight: 170,
                    borderRadius: 20,
                    border: `1px solid ${isMe ? roleColor + "55" : rl + "40"}`,
                    backgroundImage: getCardBackground(user, rl),
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                    padding: 14,
                    cursor: "pointer",
                    textAlign: "left",
                    boxShadow: `0 22px 50px ${rl}18`,
                }}
            >
                <div style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg, rgba(255,255,255,0.10) 0%, rgba(255,255,255,0.02) 18%, rgba(8,12,22,0.18) 42%, rgba(7,10,18,0.96) 100%)", pointerEvents: "none" }} />
                <div style={{ position: "absolute", right: -36, top: -36, width: 136, height: 136, borderRadius: "50%", background: `radial-gradient(circle, ${rl}50, transparent 68%)`, filter: "blur(2px)", pointerEvents: "none" }} />

                <div style={{ position: "relative", zIndex: 1, display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12 }}>
                    <div style={{ display: "inline-flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                        <span style={{ minWidth: 34, textAlign: "center", padding: "5px 8px", borderRadius: 999, background: "rgba(6,10,18,0.62)", border: `1px solid ${rl}55`, color: rl, fontSize: 10, fontFamily: "monospace", fontWeight: 900 }}>
                            #{String(rank).padStart(2, "0")}
                        </span>
                        <span style={{ padding: "5px 9px", borderRadius: 999, background: "rgba(6,10,18,0.56)", border: `1px solid ${rl}44`, color: "#F7FAFC", fontSize: 10, fontWeight: 700 }}>
                            Cheer Ranking
                        </span>
                    </div>
                    {isMe ? <span style={{ fontSize: 9, fontFamily: "monospace", color: roleColor, letterSpacing: "0.1em" }}>YOU</span> : null}
                </div>

                <div style={{ position: "relative", zIndex: 1, display: "flex", alignItems: "flex-end", gap: 12, marginTop: 14 }}>
                    <ProfileAvatar user={user} color={rl} size={58} />
                    <div style={{ minWidth: 0, flex: 1 }}>
                        <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 6 }}>
                            <span style={{ fontSize: 9, padding: "3px 8px", borderRadius: 999, background: "rgba(6,10,18,0.56)", color: rl, border: `1px solid ${rl}40` }}>{user.role}</span>
                            {locationLabel && locationLabel !== "-" ? <span style={{ fontSize: 9, padding: "3px 8px", borderRadius: 999, background: "rgba(6,10,18,0.56)", color: "rgba(255,255,255,0.76)" }}>{locationLabel}</span> : null}
                        </div>
                        <p style={{ margin: "0 0 2px", fontSize: 15, fontWeight: 900, color: "#FFFFFF", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", textShadow: "0 2px 12px rgba(0,0,0,0.35)" }}>{user.display_name}</p>
                        <p style={{ margin: 0, fontSize: 10, color: "rgba(255,255,255,0.72)", fontFamily: "monospace", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>ID: {user.slug}</p>
                    </div>
                    <div style={{ textAlign: "right", flexShrink: 0 }}>
                        <div style={{ fontSize: 9, color: "rgba(255,255,255,0.6)", marginBottom: 3 }}>Cheer</div>
                        <div style={{ fontSize: 18, fontWeight: 900, color: "#FFD600", textShadow: "0 2px 16px rgba(0,0,0,0.4)" }}>★ {user.cheer_count}</div>
                    </div>
                </div>

                <div style={{ position: "relative", zIndex: 1, marginTop: 14, display: "flex", alignItems: "center", justifyContent: "flex-end" }}>
                    <div style={{ display: "inline-flex", alignItems: "center", gap: 5, padding: "6px 10px", borderRadius: 999, background: `${rl}24`, border: `1px solid ${rl}45`, color: "#FFFFFF", fontSize: 10, fontWeight: 800, boxShadow: `0 10px 24px ${rl}18` }}>
                        Open Profile →
                    </div>
                </div>
            </button>
        );
    };

    return (
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <ProfilePreviewModal slug={selectedProfileSlug} onClose={() => setSelectedProfileSlug(null)} />
            <ViewHeader title="Cheer" sub="あなたへの応援 & ランキング" onBack={() => setView("home")} t={t} roleColor={roleColor} />

            {/* 自分のCheer数 + 順位 */}
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.5 }}
                style={{ padding: "28px 20px", textAlign: "center", borderRadius: 16, background: "rgba(255,214,0,0.04)", border: "1px solid rgba(255,214,0,0.12)", position: "relative" }}>
                <div style={{ fontSize: 9, fontWeight: 900, letterSpacing: "0.4em", textTransform: "uppercase", color: "#FFD600", opacity: 0.6, fontFamily: "monospace", marginBottom: 6 }}>TOTAL CHEER</div>
                <motion.div animate={{ scale: [1, 1.03, 1] }} transition={{ duration: 3, repeat: Infinity }}>
                    <div style={{ fontSize: 72, fontWeight: 900, color: "#FFD600", lineHeight: 1, fontFamily: "monospace", textShadow: "0 0 40px rgba(255,214,0,0.4)" }}>
                        {cheerCount}
                    </div>
                </motion.div>
                {myRank && (
                    <div style={{ marginTop: 10, display: "inline-flex", alignItems: "center", gap: 6, padding: "5px 14px", borderRadius: 99, background: "rgba(255,214,0,0.1)", border: "1px solid rgba(255,214,0,0.25)" }}>
                        <span style={{ fontSize: 13 }}>{myRank <= 3 ? ["👑", "🥈", "🥉"][myRank - 1] : "🏅"}</span>
                        <span style={{ fontSize: 11, fontWeight: 800, color: "#FFD600", fontFamily: "monospace" }}>全体 {myRank}位</span>
                    </div>
                )}
            </motion.div>

            {ads.length > 0 ? (
                <AdCard ad={ads[0]!} />
            ) : (
                <SectionCard t={t}>
                    <SLabel text="AD SLOT" color="#FFD600" />
                    <p style={{ margin: 0, fontSize: 11, color: t.sub, opacity: 0.5 }}>全国スポンサー広告枠（空き枠）</p>
                </SectionCard>
            )}

            {/* ランキング */}
            <SectionCard t={t}>
                <SLabel text="Cheer Ranking" />

                <div style={{ display: "flex", gap: 6, marginBottom: 14, flexWrap: "wrap" }}>
                    {tabs.map(tab => (
                        <button key={tab.value} onClick={() => setRankingTab(tab.value)}
                            style={{ padding: "5px 13px", borderRadius: 99, fontSize: 10, fontWeight: 700, cursor: "pointer", border: "none", background: rankingTab === tab.value ? `${roleColor}20` : "rgba(255,255,255,0.05)", color: rankingTab === tab.value ? roleColor : t.sub, outline: rankingTab === tab.value ? `1px solid ${roleColor}40` : "none", transition: "all 0.15s" }}>
                            {tab.label}
                        </button>
                    ))}
                </div>

                {rankingLoading ? (
                    <div style={{ textAlign: "center", padding: "32px 0", color: t.sub, fontSize: 12 }}>読み込み中...</div>
                ) : ranking.length === 0 ? (
                    <div style={{ textAlign: "center", padding: "32px 0", color: t.sub, fontSize: 12 }}>データがありません</div>
                ) : (
                    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                        {/* トップ3 */}
                        {ranking.slice(0, 3).length > 0 && (
                            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8, marginBottom: 10 }}>
                                {[ranking[1], ranking[0], ranking[2]].map((user, i) => {
                                    if (!user) return <div key={i} />;
                                    const rank = i === 1 ? 1 : i === 0 ? 2 : 3;
                                    return <div key={user.slug}>{renderMiniCard(user, rank)}</div>;
                                })}
                            </div>
                        )}
                        {/* 4位以下 */}
                        {ranking.slice(3).map((user, i) => {
                            const rank = i + 4;
                            return (
                                <div key={user.slug}>{renderMiniCard(user, rank, true)}</div>
                            );
                        })}
                    </div>
                )}
            </SectionCard>

            <SectionCard accentColor={roleColor} t={t}>
                <SLabel text="Cheerを増やす" color={roleColor} />
                <p style={{ fontSize: 12, color: t.sub, margin: "0 0 14px", opacity: 0.65 }}>公開プロフィールを広めてCheerを集めましょう。</p>
                <a href={`/u/${profile.slug}`} target="_blank" rel="noopener noreferrer"
                    style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "9px 18px", borderRadius: 10, background: `${roleColor}18`, border: `1px solid ${roleColor}35`, color: roleColor, fontSize: 12, fontWeight: 700, textDecoration: "none" }}>
                    <svg width={13} height={13} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" /></svg>
                    公開プロフィールを開く
                </a>
            </SectionCard>
        </div>
    );
}
