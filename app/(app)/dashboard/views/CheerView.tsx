"use client";

// dashboard/views/CheerView.tsx
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import type { ProfileData } from "@/features/profile/types";
import type { DashboardView, ThemeColors } from "@/app/(app)/dashboard/types";
import { SectionCard, SLabel, ViewHeader } from "@/app/(app)/dashboard/components/ui";

const ROLE_COLOR_MAP: Record<string, string> = {
    Athlete: "#FF5050", Trainer: "#32D278", Members: "#FFC81E", Business: "#3C8CFF",
};
const ROLE_LABEL_MAP: Record<string, string> = {
    Athlete: "ATHLETE", Trainer: "TRAINER", Members: "MEMBERS", Business: "BUSINESS",
};

export function CheerView({ profile, t, roleColor, setView }: {
    profile: ProfileData; t: ThemeColors; roleColor: string; setView: (v: DashboardView) => void;
}) {
    const cheerCount = profile.cheerCount ?? 0;
    const [rankingTab, setRankingTab] = useState("all");
    const [ranking, setRanking] = useState<any[]>([]);
    const [rankingLoading, setRankingLoading] = useState(true);
    const [myRank, setMyRank] = useState<number | null>(null);

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
    ];

    return (
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
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
                                    const rl = ROLE_COLOR_MAP[user.role] ?? "#aaa";
                                    const isMe = user.slug === profile.slug;
                                    return (
                                        <a key={user.slug} href={`/u/${user.slug}`} target="_blank" rel="noopener noreferrer" style={{ textDecoration: "none" }}>
                                            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "flex-start", minHeight: 170, padding: "12px 8px 10px", borderRadius: 14, background: isMe ? `${roleColor}12` : rank === 1 ? `${rl}10` : "rgba(255,255,255,0.02)", border: `1px solid ${isMe ? roleColor + "40" : rank === 1 ? rl + "25" : "rgba(255,255,255,0.06)"}` }}>
                                                <div style={{ fontSize: rank === 1 ? 16 : 14, marginBottom: 5 }}>
                                                    {rank === 1 ? "👑" : rank === 2 ? "🥈" : "🥉"}
                                                </div>
                                                <div style={{ width: rank === 1 ? 42 : 36, height: rank === 1 ? 42 : 36, borderRadius: "50%", overflow: "hidden", background: `${rl}20`, border: `2px solid ${rl}50`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, fontWeight: 900, color: rl, marginBottom: 6, flexShrink: 0 }}>
                                                    {user.avatar_url ? <img src={user.avatar_url} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : user.display_name?.[0]?.toUpperCase()}
                                                </div>
                                                <p style={{ fontSize: 10, fontWeight: 800, color: t.text, margin: "0 0 3px", textAlign: "center", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: "100%", width: "100%" }}>{user.display_name}</p>
                                                <div style={{ display: "flex", alignItems: "center", gap: 3 }}>
                                                    <span style={{ fontSize: 9, color: "#FFD600" }}>★</span>
                                                    <span style={{ fontSize: 13, fontWeight: 900, color: "#FFD600", fontFamily: "monospace" }}>{user.cheer_count}</span>
                                                </div>
                                                <span style={{ marginTop: 5, fontSize: 8, color: rl, fontWeight: 800 }}>プロフィールを見る →</span>
                                                {isMe && <span style={{ fontSize: 7, fontFamily: "monospace", color: roleColor, marginTop: 4, letterSpacing: "0.1em" }}>YOU</span>}
                                            </div>
                                        </a>
                                    );
                                })}
                            </div>
                        )}
                        {/* 4位以下 */}
                        {ranking.slice(3).map((user, i) => {
                            const rank = i + 4;
                            const rl = ROLE_COLOR_MAP[user.role] ?? "#aaa";
                            const isMe = user.slug === profile.slug;
                            return (
                                <a key={user.slug} href={`/u/${user.slug}`} target="_blank" rel="noopener noreferrer" style={{ textDecoration: "none" }}>
                                    <div style={{ display: "flex", alignItems: "center", gap: 10, minHeight: 54, padding: "9px 11px", borderRadius: 12, background: isMe ? `${roleColor}08` : "rgba(255,255,255,0.02)", border: `1px solid ${isMe ? roleColor + "35" : "rgba(255,255,255,0.05)"}`, transition: "border-color 0.15s" }}>
                                        <span style={{ width: 28, fontSize: 12, fontWeight: 900, fontFamily: "monospace", color: "rgba(255,255,255,0.2)", textAlign: "center", flexShrink: 0 }}>{rank}</span>
                                        <div style={{ width: 30, height: 30, borderRadius: "50%", overflow: "hidden", background: `${rl}20`, border: `1.5px solid ${rl}40`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 900, color: rl, flexShrink: 0 }}>
                                            {user.avatar_url ? <img src={user.avatar_url} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : user.display_name?.[0]?.toUpperCase()}
                                        </div>
                                        <div style={{ flex: 1, minWidth: 0 }}>
                                            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                                                <p style={{ fontSize: 12, fontWeight: 700, color: t.text, margin: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{user.display_name}</p>
                                                <span style={{ fontSize: 7, fontWeight: 800, padding: "1px 5px", borderRadius: 3, background: `${rl}18`, color: rl, fontFamily: "monospace", flexShrink: 0 }}>{ROLE_LABEL_MAP[user.role]}</span>
                                                {isMe && <span style={{ fontSize: 7, fontFamily: "monospace", color: roleColor, flexShrink: 0 }}>YOU</span>}
                                            </div>
                                            <p style={{ fontSize: 9, fontFamily: "monospace", color: t.sub, margin: 0, opacity: 0.5 }}>@{user.slug}</p>
                                        </div>
                                        <div style={{ display: "flex", alignItems: "center", gap: 3, flexShrink: 0 }}>
                                            <span style={{ fontSize: 9, color: "#FFD600" }}>★</span>
                                            <span style={{ fontSize: 14, fontWeight: 900, color: "#FFD600", fontFamily: "monospace" }}>{user.cheer_count}</span>
                                        </div>
                                        <span style={{ fontSize: 9, color: rl, fontWeight: 800, flexShrink: 0 }}>見る →</span>
                                    </div>
                                </a>
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
