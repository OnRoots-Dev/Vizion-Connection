// app/u/[slug]/CareerSection.tsx
"use client";

import { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import type { CareerProfileRow } from "@/lib/supabase/career-profiles";

interface CareerSectionProps {
    roleColor: string;
    bio?: string | null;
    sport?: string | null;
    region?: string | null;
    prefecture?: string | null;
    joinedAt: string;
    roleLabel: string;
    cheerCount: number;
    isPublic?: boolean;
    slug: string;
    careerProfile?: CareerProfileRow | null;
}

type Role = "ATHLETE" | "TRAINER" | "MEMBERS" | "BUSINESS";

function normalizeSocialUrl(value?: string | null, base?: string) {
    if (!value) return null;
    const trimmed = value.trim();
    if (!trimmed) return null;
    if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) return trimmed;
    if (trimmed.startsWith("@")) return base ? `${base}${trimmed.slice(1)}` : trimmed;
    return base ? `${base}${trimmed}` : trimmed;
}

export default function CareerSection({
    roleColor: rl,
    bio,
    sport,
    region,
    prefecture,
    joinedAt,
    roleLabel,
    cheerCount,
    slug,
    careerProfile,
}: CareerSectionProps) {
    const role = roleLabel as Role;
    const [tab, setTab] = useState<"info" | "career">("info");

    const tabLabel: Record<Role, string> = {
        ATHLETE: "競技歴・実績",
        TRAINER: "資格・経歴",
        MEMBERS: "応援ページ",
        BUSINESS: "企業情報",
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            style={{
                borderRadius: 20,
                overflow: "hidden",
                border: "1px solid rgba(255,255,255,0.08)",
                background: "rgba(255,255,255,0.02)",
                backdropFilter: "blur(12px)",
            }}
        >
            <div style={{
                display: "flex",
                borderBottom: "1px solid rgba(255,255,255,0.07)",
                background: "rgba(0,0,0,0.2)",
                padding: "0 4px",
            }}>
                {([
                    { id: "info" as const, label: "プロフィール", icon: "M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0" },
                    { id: "career" as const, label: tabLabel[role] ?? "詳細", icon: "M20.25 14.15v4.25c0 1.094-.787 2.036-1.872 2.18-2.087.277-4.216.42-6.378.42s-4.291-.143-6.378-.42c-1.085-.144-1.872-1.086-1.872-2.18v-4.25m16.5 0a2.18 2.18 0 00.75-1.661V8.706c0-1.081-.768-2.015-1.837-2.175a48.114 48.114 0 00-3.413-.387m4.5 8.006c-.194.165-.42.295-.673.38A23.978 23.978 0 0112 15.75c-2.648 0-5.195-.429-7.577-1.22a2.016 2.016 0 01-.673-.38m0 0A2.18 2.18 0 013 12.489V8.706c0-1.081.768-2.015 1.837-2.175a48.111 48.111 0 013.413-.387m7.5 0V5.25A2.25 2.25 0 0013.5 3h-3a2.25 2.25 0 00-2.25 2.25v.894m7.5 0a48.667 48.667 0 00-7.5 0M12 12.75h.008v.008H12v-.008z" },
                ] as const).map(t => (
                    <button
                        key={t.id}
                        onClick={() => setTab(t.id)}
                        style={{
                            flex: 1,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            gap: 7,
                            padding: "14px 0",
                            fontSize: 12,
                            fontWeight: 700,
                            background: "none",
                            border: "none",
                            cursor: "pointer",
                            color: tab === t.id ? rl : "rgba(255,255,255,0.3)",
                            borderBottom: `2px solid ${tab === t.id ? rl : "transparent"}`,
                            marginBottom: -1,
                            transition: "all 0.2s ease",
                            letterSpacing: "0.03em",
                            position: "relative",
                        }}
                    >
                        <svg width={13} height={13} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d={t.icon} />
                        </svg>
                        {t.label}
                        {tab === t.id && (
                            <motion.div
                                layoutId="career-tab-indicator"
                                style={{
                                    position: "absolute",
                                    bottom: -1, left: 0, right: 0,
                                    height: 2,
                                    background: rl,
                                    borderRadius: 99,
                                    boxShadow: `0 0 8px ${rl}80`,
                                }}
                            />
                        )}
                    </button>
                ))}
            </div>

            <AnimatePresence mode="wait">
                <motion.div
                    key={tab}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
                    style={{ padding: "22px 20px" }}
                >
                    {tab === "info" && (
                        <InfoTab
                            rl={rl} bio={bio} sport={sport}
                            region={region} prefecture={prefecture}
                            joinedAt={joinedAt} roleLabel={roleLabel}
                            cheerCount={cheerCount}
                        />
                    )}
                    {tab === "career" && (
                        <CareerTab
                            role={role} rl={rl} slug={slug}
                            careerProfile={careerProfile ?? null}
                        />
                    )}
                </motion.div>
            </AnimatePresence>
        </motion.div>
    );
}

function InfoTab({ rl, bio, sport, region, prefecture, joinedAt, roleLabel, cheerCount }: {
    rl: string; bio?: string | null; sport?: string | null;
    region?: string | null; prefecture?: string | null;
    joinedAt: string; roleLabel: string; cheerCount: number;
}) {
    const items = [
        { label: "Role", value: roleLabel, color: rl },
        sport ? { label: "競技 / 職種", value: sport } : null,
        region ? { label: "エリア", value: `${region}${prefecture ? ` / ${prefecture}` : ""}` } : null,
        { label: "Cheer", value: cheerCount.toLocaleString(), color: "#FFD600" },
        { label: "参加日", value: joinedAt },
    ].filter(Boolean) as { label: string; value: string; color?: string }[];

    return (
        <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
            {bio && (
                <div style={{
                    position: "relative", padding: "14px 16px", borderRadius: 12,
                    background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)",
                    marginBottom: 14, overflow: "hidden",
                }}>
                    <div style={{ position: "absolute", left: 0, top: "15%", bottom: "15%", width: 2, borderRadius: "0 2px 2px 0", background: `linear-gradient(to bottom, transparent, ${rl}aa, transparent)` }} />
                    <p style={{ fontSize: 13, color: "rgba(255,255,255,0.72)", lineHeight: 1.8, margin: 0, paddingLeft: 6 }}>{bio}</p>
                </div>
            )}
            {items.map((item, i) => (
                <motion.div key={item.label} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.04 }}
                    style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "11px 6px", borderBottom: i < items.length - 1 ? "1px solid rgba(255,255,255,0.05)" : "none" }}>
                    <span style={{ fontSize: 10, fontFamily: "monospace", letterSpacing: "0.16em", textTransform: "uppercase", color: "rgba(255,255,255,0.25)" }}>{item.label}</span>
                    <span style={{ fontSize: 13, fontWeight: 700, color: item.color ?? "rgba(255,255,255,0.78)", fontFamily: item.color ? "monospace" : "inherit" }}>{item.value}</span>
                </motion.div>
            ))}
        </div>
    );
}

function CareerTab({ role, rl, slug, careerProfile }: {
    role: Role; rl: string; slug: string;
    careerProfile: CareerProfileRow | null;
}) {
    const snsLinks = [
        { label: "X", href: normalizeSocialUrl(careerProfile?.sns_x, "https://x.com/") },
        { label: "Instagram", href: normalizeSocialUrl(careerProfile?.sns_instagram, "https://instagram.com/") },
        { label: "TikTok", href: normalizeSocialUrl(careerProfile?.sns_tiktok, "https://tiktok.com/@") },
    ].filter((item) => item.href);

    if (careerProfile && (
        careerProfile.tagline ||
        careerProfile.bio_career ||
        careerProfile.stats?.length > 0 ||
        careerProfile.episodes?.length > 0 ||
        careerProfile.skills?.length > 0
    )) {
        return (
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                {careerProfile.tagline && (
                    <div style={{ padding: "14px 16px", borderRadius: 12, background: `${rl}08`, border: `1px solid ${rl}20` }}>
                        <p style={{ fontSize: 14, fontWeight: 700, color: rl, margin: 0, lineHeight: 1.6 }}>
                            &quot;{careerProfile.tagline}&quot;
                        </p>
                    </div>
                )}

                {careerProfile.bio_career && (
                    <div style={{ position: "relative", padding: "14px 16px", borderRadius: 12, background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)", overflow: "hidden" }}>
                        <div style={{ position: "absolute", left: 0, top: "15%", bottom: "15%", width: 2, borderRadius: "0 2px 2px 0", background: `linear-gradient(to bottom, transparent, ${rl}aa, transparent)` }} />
                        <p style={{ fontSize: 13, color: "rgba(255,255,255,0.72)", lineHeight: 1.9, margin: 0, paddingLeft: 6, whiteSpace: "pre-wrap" }}>{careerProfile.bio_career}</p>
                    </div>
                )}

                {careerProfile.stats?.length > 0 && (
                    <div>
                        <p style={{ fontSize: 9, fontFamily: "monospace", fontWeight: 800, letterSpacing: "0.22em", textTransform: "uppercase", color: "rgba(255,255,255,0.2)", margin: "0 0 10px" }}>
                            PERFORMANCE SNAPSHOT
                        </p>
                        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: 10 }}>
                            {careerProfile.stats.filter((stat) => stat?.label || stat?.value).map((stat, index) => {
                                const statColor = stat.color === "gold" ? "#FFD600" : stat.color === "role" ? rl : "rgba(255,255,255,0.88)";
                                return (
                                    <div key={`${stat.label}-${index}`} style={{ padding: "14px 16px", borderRadius: 14, background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}>
                                        <div style={{ fontSize: 9, fontFamily: "monospace", letterSpacing: "0.16em", textTransform: "uppercase", color: "rgba(255,255,255,0.26)", marginBottom: 6 }}>{stat.label}</div>
                                        <div style={{ fontSize: 24, fontWeight: 900, lineHeight: 1, color: statColor }}>{stat.value || "-"}</div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}

                {careerProfile.episodes?.length > 0 && (
                    <div>
                        <p style={{ fontSize: 9, fontFamily: "monospace", fontWeight: 800, letterSpacing: "0.22em", textTransform: "uppercase", color: "rgba(255,255,255,0.2)", margin: "0 0 10px" }}>
                            CAREER HISTORY
                        </p>
                        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                            {careerProfile.episodes.map((ep, i) => (
                                <motion.div key={ep.id ?? i} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}
                                    style={{ display: "flex", gap: 12, padding: "12px 14px", borderRadius: 12, background: "rgba(255,255,255,0.025)", border: "1px solid rgba(255,255,255,0.06)" }}>
                                    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4, flexShrink: 0 }}>
                                        <div style={{ width: 20, height: 20, borderRadius: "50%", background: `${rl}18`, border: `1px solid ${rl}30`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 9, fontWeight: 900, color: rl, fontFamily: "monospace" }}>{i + 1}</div>
                                        {i < careerProfile.episodes.length - 1 && <div style={{ width: 1, flex: 1, background: "rgba(255,255,255,0.06)" }} />}
                                    </div>
                                    <div style={{ flex: 1, minWidth: 0 }}>
                                        <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 3 }}>
                                            <p style={{ fontSize: 13, fontWeight: 700, color: "rgba(255,255,255,0.8)", margin: 0 }}>{ep.role}</p>
                                            {ep.isCurrent && <span style={{ fontSize: 8, fontFamily: "monospace", padding: "1px 6px", borderRadius: 4, background: `${rl}18`, color: rl, letterSpacing: "0.1em" }}>NOW</span>}
                                        </div>
                                        {ep.org && <p style={{ fontSize: 11, color: "rgba(255,255,255,0.44)", margin: "0 0 4px" }}>{ep.org}</p>}
                                        <p style={{ fontSize: 10, fontFamily: "monospace", color: "rgba(255,255,255,0.25)", margin: 0 }}>{ep.period}</p>
                                        {ep.desc ? <p style={{ fontSize: 11.5, color: "rgba(255,255,255,0.62)", margin: "8px 0 0", lineHeight: 1.75, whiteSpace: "pre-wrap" }}>{ep.desc}</p> : null}
                                        {ep.tags?.length ? (
                                            <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginTop: 8 }}>
                                                {ep.tags.map((tag) => (
                                                    <span key={tag} style={{ padding: "4px 8px", borderRadius: 999, background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", fontSize: 10, color: "rgba(255,255,255,0.55)" }}>
                                                        {tag}
                                                    </span>
                                                ))}
                                            </div>
                                        ) : null}
                                        {ep.milestone && (
                                            <p style={{ fontSize: 11, color: rl, margin: "6px 0 0", padding: "4px 8px", borderRadius: 6, background: `${rl}08`, border: `1px solid ${rl}18`, display: "inline-block" }}>⭐ {ep.milestone}</p>
                                        )}
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                )}

                {careerProfile.skills?.length > 0 && (
                    <div>
                        <p style={{ fontSize: 9, fontFamily: "monospace", fontWeight: 800, letterSpacing: "0.22em", textTransform: "uppercase", color: "rgba(255,255,255,0.2)", margin: "0 0 10px" }}>
                            SKILLS
                        </p>
                        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                            {careerProfile.skills.map((sk) => (
                                <div key={sk.name}>
                                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                                        <span style={{ fontSize: 12, color: sk.isHighlight ? rl : "rgba(255,255,255,0.55)", fontWeight: sk.isHighlight ? 700 : 400 }}>
                                            {sk.isHighlight && <span style={{ color: "#FFD600", marginRight: 4 }}>★</span>}{sk.name}
                                        </span>
                                        <span style={{ fontSize: 11, fontFamily: "monospace", color: "rgba(255,255,255,0.25)" }}>{sk.level}</span>
                                    </div>
                                    <div style={{ height: 3, borderRadius: 99, background: "rgba(255,255,255,0.07)", overflow: "hidden" }}>
                                        <motion.div initial={{ width: 0 }} animate={{ width: `${sk.level}%` }} transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                                            style={{ height: "100%", borderRadius: 99, background: sk.isHighlight ? `linear-gradient(90deg, #FFD600, rgba(255,214,0,0.35))` : `linear-gradient(90deg, ${rl}, ${rl}40)` }} />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {(careerProfile.cta_title || careerProfile.cta_sub || careerProfile.cta_btn || snsLinks.length > 0) && (
                    <div style={{ padding: "16px", borderRadius: 14, background: `${rl}08`, border: `1px solid ${rl}22`, display: "flex", flexDirection: "column", gap: 12 }}>
                        <div>
                            {careerProfile.cta_title ? <p style={{ margin: "0 0 4px", fontSize: 15, fontWeight: 800, color: "rgba(255,255,255,0.92)" }}>{careerProfile.cta_title}</p> : null}
                            {careerProfile.cta_sub ? <p style={{ margin: 0, fontSize: 12, lineHeight: 1.8, color: "rgba(255,255,255,0.66)" }}>{careerProfile.cta_sub}</p> : null}
                        </div>
                        <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                            <Link href={`/r/${slug}`} style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 8, padding: "12px 16px", borderRadius: 12, background: rl, color: "#050508", fontSize: 12, fontWeight: 800 }}>
                                {careerProfile.cta_btn || "つながる"}
                            </Link>
                            {snsLinks.map((item) => (
                                <a key={item.label} href={item.href!} target="_blank" rel="noopener noreferrer" style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "10px 12px", borderRadius: 12, background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", color: "rgba(255,255,255,0.78)", fontSize: 11, fontWeight: 700 }}>
                                    {item.label}
                                </a>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        );
    }

    const comingSoonItems: Record<Role, string[]> = {
        ATHLETE: ["競技歴（年月・実績・大会結果）", "所属チーム・クラブ", "現在の目標・ビジョン", "受賞歴・メディア掲載", "サポートしてほしいこと"],
        TRAINER: ["保有資格（NSCA-CPT / NESTA など）", "専門分野・対応競技", "指導経歴・実績", "対応エリア / オンライン可否", "料金目安・コンタクト"],
        BUSINESS: ["会社・ブランド概要", "スポーツへの関わり・想い", "求めるアスリート像・案件種別", "過去の支援実績", "コンタクト方法"],
        MEMBERS: [],
    };

    if (role === "MEMBERS") return (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <div style={{ padding: "16px", borderRadius: 14, background: `${rl}08`, border: `1px solid ${rl}20` }}>
                <p style={{ fontSize: 12, fontWeight: 800, color: rl, margin: "0 0 6px" }}>応援ページ</p>
                <p style={{ fontSize: 12, color: "rgba(255,255,255,0.45)", margin: 0, lineHeight: 1.7 }}>
                    推し選手のカードコレクションは β版（4/1〜）で表示されます。<br />先にランキングでアスリートを見つけてコレクトしておこう！
                </p>
            </div>
            <Link href="/ranking" style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, padding: "13px 0", borderRadius: 12, background: `${rl}12`, border: `1px solid ${rl}28`, color: rl, textDecoration: "none", fontSize: 13, fontWeight: 700 }}>
                ⭐ ランキングでアスリートを探す →
            </Link>
        </div>
    );

    return (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "14px 16px", borderRadius: 14, background: `${rl}08`, border: `1px solid ${rl}20` }}>
                <div style={{ width: 36, height: 36, borderRadius: 10, background: `${rl}15`, border: `1px solid ${rl}25`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    <svg width={16} height={16} fill="none" viewBox="0 0 24 24" stroke={rl} strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                </div>
                <div>
                    <p style={{ fontSize: 12, fontWeight: 800, color: rl, margin: "0 0 2px" }}>準備中</p>
                    <p style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", margin: 0, lineHeight: 1.5 }}>β版（4/1〜）でプロフィール編集から追加できます</p>
                </div>
            </div>
            <div style={{ borderRadius: 14, border: "1px solid rgba(255,255,255,0.06)", overflow: "hidden" }}>
                <div style={{ padding: "10px 14px 8px", background: "rgba(255,255,255,0.03)", borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                    <span style={{ fontSize: 9, fontFamily: "monospace", fontWeight: 800, letterSpacing: "0.2em", textTransform: "uppercase", color: "rgba(255,255,255,0.2)" }}>追加予定の項目</span>
                </div>
                {comingSoonItems[role]?.map((item, i, arr) => (
                    <motion.div key={item} initial={{ opacity: 0, x: -6 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.05 + i * 0.04 }}
                        style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 14px", borderBottom: i < arr.length - 1 ? "1px solid rgba(255,255,255,0.04)" : "none" }}>
                        <div style={{ width: 20, height: 20, borderRadius: 6, background: `${rl}10`, border: `1px solid ${rl}20`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                            <svg width={9} height={9} fill="none" viewBox="0 0 24 24" stroke={rl} strokeWidth={2.5} opacity={0.6}><path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" /></svg>
                        </div>
                        <span style={{ fontSize: 12, color: "rgba(255,255,255,0.45)" }}>{item}</span>
                        <span style={{ marginLeft: "auto", fontSize: 8, fontFamily: "monospace", letterSpacing: "0.12em", color: "rgba(255,255,255,0.15)", textTransform: "uppercase" }}>SOON</span>
                    </motion.div>
                ))}
            </div>
        </div>
    );
}
