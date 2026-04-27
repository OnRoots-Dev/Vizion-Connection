// app/(app)/dashboard/ranking/page.tsx

import { supabaseServer } from "@/lib/supabase/server";
import Link from "next/link";
import type { Metadata } from "next";
import { getWeeklyCheerCounts } from "@/lib/supabase/cheers";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
    title: "Cheerランキング | Vizion Connection",
    description: "Vizion Connectionのアスリート・トレーナー・メンバーCheerランキング",
};

const ROLE_COLOR: Record<string, string> = {
    Athlete: "#C1272D", Trainer: "#1A7A4A", Members: "#B8860B", Business: "#1B3A8C",
};
const ROLE_LABEL: Record<string, string> = {
    Athlete: "ATHLETE", Trainer: "TRAINER", Members: "MEMBERS", Business: "BUSINESS",
};

async function getRanking(role?: string) {
    let query = supabaseServer
        .from("users")
        .select("slug, display_name, role, avatar_url, profile_image_url, cheer_count, is_founding_member, serial_id, sport, region")
        .eq("is_deleted", false)
        .eq("is_public", true)
        .limit(200);
    if (role) query = query.eq("role", role);
    const { data } = await query;
    const users = data ?? [];
    const weeklyMap = await getWeeklyCheerCounts(users.map((user) => String(user.slug)));
    return users
        .map((user) => ({ ...user, weekly_cheer_count: weeklyMap.get(String(user.slug)) ?? 0 }))
        .sort((a, b) => {
            if (b.weekly_cheer_count !== a.weekly_cheer_count) return b.weekly_cheer_count - a.weekly_cheer_count;
            return Number(b.cheer_count ?? 0) - Number(a.cheer_count ?? 0);
        })
        .slice(0, 50);
}

export default async function RankingPage({
    searchParams,
}: {
    searchParams: Promise<{ role?: string }>;
}) {
    const { role } = await searchParams ;
    const users = await getRanking(role);

    const tabs = [
        { label: "全体", value: undefined, color: "#FFD600" },
        { label: "Athlete", value: "Athlete", color: "#C1272D" },
        { label: "Trainer", value: "Trainer", color: "#1A7A4A" },
        { label: "Members", value: "Members", color: "#B8860B" },
        { label: "Business", value: "Business", color: "#1B3A8C" },
    ];

    return (
        <div style={{ minHeight: "100vh", background: "#0B0B0F", color: "#fff" }}>
            {/* ヘッダー */}
            <div style={{ borderBottom: "1px solid rgba(255,255,255,0.06)", padding: "20px 24px" }}>
                <div style={{ maxWidth: 760, margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <div>
                        <p style={{ fontSize: 9, fontFamily: "monospace", fontWeight: 800, letterSpacing: "0.25em", textTransform: "uppercase", color: "rgba(255,255,255,0.3)", margin: "0 0 4px" }}>
                            VIZION CONNECTION
                        </p>
                        <h1 style={{ fontSize: 28, fontWeight: 900, margin: 0, letterSpacing: "-0.02em" }}>
                            ⭐ Weekly Cheer Ranking
                        </h1>
                    </div>
                    <Link href="/dashboard" style={{ fontSize: 12, color: "rgba(255,255,255,0.4)", textDecoration: "none", display: "flex", alignItems: "center", gap: 6 }}>
                        <svg width={14} height={14} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" /></svg>
                        ダッシュボード
                    </Link>
                </div>
            </div>

            {/* ロールタブ */}
            <div style={{ maxWidth: 760, margin: "0 auto", padding: "16px 24px 0" }}>
                <div style={{ display: "flex", gap: 8 }}>
                    {tabs.map((tab) => {
                        const active = role === tab.value;
                        return (
                            <Link
                                key={tab.label}
                                href={tab.value ? `/ranking?role=${tab.value}` : "/ranking"}
                                style={{
                                    padding: "7px 16px", borderRadius: 99,
                                    fontSize: 11, fontWeight: 700,
                                    textDecoration: "none",
                                    background: active ? `${tab.color}18` : "rgba(255,255,255,0.04)",
                                    border: `1px solid ${active ? tab.color + "40" : "rgba(255,255,255,0.08)"}`,
                                    color: active ? tab.color : "rgba(255,255,255,0.45)",
                                    transition: "all 0.15s",
                                }}
                            >
                                {tab.label}
                            </Link>
                        );
                    })}
                </div>
            </div>

            {/* ランキングリスト */}
            <div style={{ maxWidth: 760, margin: "0 auto", padding: "20px 24px 60px" }}>
                {/* トップ3 */}
                {users.slice(0, 3).length > 0 && (
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12, marginBottom: 24 }}>
                        {[users[1], users[0], users[2]].map((user, i) => {
                            if (!user) return <div key={i} />;
                            const rank = i === 1 ? 1 : i === 0 ? 2 : 3;
                            const rl = ROLE_COLOR[user.role] ?? "#aaa";
                            const podiumH = rank === 1 ? 80 : rank === 2 ? 60 : 44;
                            return (
                                <Link key={user.slug} href={`/u/${user.slug}`} style={{ textDecoration: "none" }}>
                                    <div style={{
                                        display: "flex", flexDirection: "column", alignItems: "center",
                                        padding: "20px 12px 16px",
                                        borderRadius: 16,
                                        background: rank === 1 ? `${rl}10` : "rgba(255,255,255,0.025)",
                                        border: `1px solid ${rank === 1 ? rl + "30" : "rgba(255,255,255,0.07)"}`,
                                        boxShadow: rank === 1 ? `0 0 40px ${rl}15` : "none",
                                    }}>
                                        {/* 王冠 */}
                                        <div style={{ fontSize: rank === 1 ? 22 : 16, marginBottom: 8 }}>
                                            {rank === 1 ? "👑" : rank === 2 ? "🥈" : "🥉"}
                                        </div>
                                        {/* アバター */}
                                        <div style={{ width: rank === 1 ? 60 : 48, height: rank === 1 ? 60 : 48, borderRadius: "50%", overflow: "hidden", background: `${rl}20`, border: `2px solid ${rl}50`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: rank === 1 ? 22 : 18, fontWeight: 900, color: rl, marginBottom: 8, flexShrink: 0 }}>
                                            {user.avatar_url
                                                ? <img src={user.avatar_url} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                                                : user.display_name[0]?.toUpperCase()}
                                        </div>
                                        <p style={{ fontSize: 12, fontWeight: 800, color: "#fff", margin: "0 0 2px", textAlign: "center", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: "100%" }}>{user.display_name}</p>
                                        <p style={{ fontSize: 9, fontFamily: "monospace", color: rl, margin: "0 0 6px", textTransform: "uppercase", letterSpacing: "0.1em" }}>{ROLE_LABEL[user.role]}</p>
                                        <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                                            <span style={{ fontSize: 10, color: "#FFD600" }}>★</span>
                                            <span style={{ fontSize: 18, fontWeight: 900, color: "#FFD600", fontFamily: "monospace", lineHeight: 1 }}>{user.weekly_cheer_count}</span>
                                        </div>
                                        {/* 台座 */}
                                        <div style={{ width: "100%", height: podiumH, background: `${rl}10`, border: `1px solid ${rl}20`, borderRadius: 8, marginTop: 12, display: "flex", alignItems: "center", justifyContent: "center" }}>
                                            <span style={{ fontSize: 24, fontWeight: 900, fontFamily: "monospace", color: `${rl}60` }}>{rank}</span>
                                        </div>
                                    </div>
                                </Link>
                            );
                        })}
                    </div>
                )}

                {/* 4位以下 */}
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                    {users.slice(3).map((user, i) => {
                        const rank = i + 4;
                        const rl = ROLE_COLOR[user.role] ?? "#aaa";
                        return (
                            <Link key={user.slug} href={`/u/${user.slug}`} style={{ textDecoration: "none" }}>
                                <div style={{
                                    display: "flex", alignItems: "center", gap: 14,
                                    padding: "14px 16px", borderRadius: 14,
                                    background: "rgba(255,255,255,0.025)",
                                    border: "1px solid rgba(255,255,255,0.07)",
                                    transition: "border-color 0.15s",
                                }}>
                                    {/* 順位 */}
                                    <div style={{ width: 36, flexShrink: 0, textAlign: "center" }}>
                                        <span style={{ fontSize: 14, fontWeight: 900, fontFamily: "monospace", color: "rgba(255,255,255,0.25)" }}>{rank}</span>
                                    </div>
                                    {/* アバター */}
                                    <div style={{ width: 40, height: 40, borderRadius: "50%", overflow: "hidden", background: `${rl}20`, border: `1.5px solid ${rl}40`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 15, fontWeight: 900, color: rl, flexShrink: 0 }}>
                                        {user.avatar_url
                                            ? <img src={user.avatar_url} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                                            : user.display_name[0]?.toUpperCase()}
                                    </div>
                                    {/* 情報 */}
                                    <div style={{ flex: 1, minWidth: 0 }}>
                                        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 2 }}>
                                            <p style={{ fontSize: 13, fontWeight: 700, color: "#fff", margin: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{user.display_name}</p>
                                            <span style={{ fontSize: 8, fontWeight: 800, padding: "2px 6px", borderRadius: 4, background: `${rl}20`, color: rl, fontFamily: "monospace", letterSpacing: "0.08em", flexShrink: 0 }}>{ROLE_LABEL[user.role]}</span>
                                            {user.is_founding_member && (
                                                <span style={{ fontSize: 8, padding: "2px 6px", borderRadius: 4, background: "rgba(255,214,0,0.1)", color: "#FFD600", fontFamily: "monospace", flexShrink: 0 }}>FOUNDING</span>
                                            )}
                                        </div>
                                        <p style={{ fontSize: 10, fontFamily: "monospace", color: "rgba(255,255,255,0.3)", margin: 0 }}>
                                            @{user.slug}{user.region ? ` · ${user.region}` : ""}{user.sport ? ` · ${user.sport}` : ""}
                                        </p>
                                    </div>
                                    {/* Cheer数 */}
                                    <div style={{ textAlign: "right", flexShrink: 0 }}>
                                        <div style={{ display: "flex", alignItems: "center", gap: 4, justifyContent: "flex-end" }}>
                                            <span style={{ fontSize: 9, color: "#FFD600" }}>★</span>
                                            <span style={{ fontSize: 16, fontWeight: 900, fontFamily: "monospace", color: "#FFD600" }}>{user.weekly_cheer_count}</span>
                                        </div>
                                        <p style={{ fontSize: 9, color: "rgba(255,255,255,0.2)", margin: 0, fontFamily: "monospace" }}>THIS WEEK</p>
                                    </div>
                                </div>
                            </Link>
                        );
                    })}
                </div>

                {users.length === 0 && (
                    <div style={{ textAlign: "center", padding: "60px 0", color: "rgba(255,255,255,0.3)" }}>
                        <p style={{ fontSize: 14 }}>まだユーザーがいません</p>
                    </div>
                )}
            </div>
        </div>
    );
}
