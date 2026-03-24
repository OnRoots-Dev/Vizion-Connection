// app/(app)/u/[slug]/CareerSection.tsx
"use client";

import { useState } from "react";
import Link from "next/link";

interface CareerSectionProps {
    roleColor: string;
    bio?: string | null;        // ← 修正: undefined 許容
    sport?: string | null;      // ← 修正
    region?: string | null;     // ← 修正
    prefecture?: string | null; // ← 修正
    joinedAt: string;
    roleLabel: string;
    cheerCount: number;
    isPublic?: boolean;         // ← 修正
    slug: string;
}

type Role = "ATHLETE" | "TRAINER" | "MEMBERS" | "BUSINESS";

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
        <div style={{ borderRadius: 18, overflow: "hidden", border: "1px solid rgba(255,255,255,0.07)", background: "rgba(255,255,255,0.02)" }}>

            {/* タブヘッダー */}
            <div style={{ display: "flex", borderBottom: "1px solid rgba(255,255,255,0.07)" }}>
                {([
                    { id: "info" as const, label: "プロフィール" },
                    { id: "career" as const, label: tabLabel[role] ?? "詳細" },
                ] as const).map(t => (
                    <button
                        key={t.id}
                        onClick={() => setTab(t.id)}
                        style={{
                            flex: 1, padding: "13px 0",
                            fontSize: 12, fontWeight: 700,
                            background: "none", border: "none", cursor: "pointer",
                            color: tab === t.id ? rl : "rgba(255,255,255,0.35)",
                            borderBottom: `2px solid ${tab === t.id ? rl : "transparent"}`,
                            marginBottom: -1,
                            transition: "all 0.15s",
                            letterSpacing: "0.03em",
                        }}
                    >
                        {t.label}
                    </button>
                ))}
            </div>

            {/* タブコンテンツ */}
            <div style={{ padding: "20px" }}>
                {tab === "info" && <InfoTab rl={rl} bio={bio} sport={sport} region={region} prefecture={prefecture} joinedAt={joinedAt} roleLabel={roleLabel} cheerCount={cheerCount} />}
                {tab === "career" && <CareerTab role={role} rl={rl} slug={slug} />}
            </div>
        </div>
    );
}

// ── プロフィールタブ ───────────────────────────────────────────────────────────
function InfoTab({ rl, bio, sport, region, prefecture, joinedAt, roleLabel, cheerCount }: {
    rl: string; bio?: string | null; sport?: string | null;
    region?: string | null; prefecture?: string | null;
    joinedAt: string; roleLabel: string; cheerCount: number;
}) {
    const items = [
        { label: "ロール", value: roleLabel, color: rl },
        sport ? { label: "競技 / 職種", value: sport } : null,
        region ? { label: "エリア", value: `${region}${prefecture ? ` / ${prefecture}` : ""}` } : null,
        { label: "Cheer", value: cheerCount.toLocaleString(), color: "#FFD600" },
        { label: "参加日", value: joinedAt },
    ].filter(Boolean) as { label: string; value: string; color?: string }[];

    return (
        <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
            {items.map((item, i) => (
                <div key={item.label} style={{
                    display: "flex", justifyContent: "space-between", alignItems: "center",
                    padding: "10px 4px",
                    borderBottom: i < items.length - 1 ? "1px solid rgba(255,255,255,0.05)" : "none",
                }}>
                    <span style={{ fontSize: 10, fontFamily: "monospace", letterSpacing: "0.14em", textTransform: "uppercase", color: "rgba(255,255,255,0.28)" }}>
                        {item.label}
                    </span>
                    <span style={{ fontSize: 13, fontWeight: 700, color: item.color ?? "rgba(255,255,255,0.65)" }}>
                        {item.value}
                    </span>
                </div>
            ))}
        </div>
    );
}

// ── キャリアタブ（ロール別）────────────────────────────────────────────────────
function CareerTab({ role, rl, slug }: { role: Role; rl: string; slug: string }) {

    const ComingSoon = ({ items }: { items: string[] }) => (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <div style={{
                padding: "14px 16px", borderRadius: 12,
                background: `${rl}08`, border: `1px solid ${rl}20`,
                marginBottom: 4,
            }}>
                <p style={{ fontSize: 11, fontFamily: "monospace", fontWeight: 800, letterSpacing: "0.15em", textTransform: "uppercase", color: rl, margin: "0 0 6px" }}>β版（4/1〜）で解放</p>
                <p style={{ fontSize: 12, color: "rgba(255,255,255,0.45)", margin: 0, lineHeight: 1.65 }}>
                    詳細情報はβ版リリース後にプロフィール編集から追加できます。
                </p>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
                {items.map((item, i) => (
                    <div key={item} style={{
                        display: "flex", alignItems: "center", gap: 10,
                        padding: "8px 4px",
                        borderBottom: i < items.length - 1 ? "1px solid rgba(255,255,255,0.04)" : "none",
                    }}>
                        <span style={{ width: 5, height: 5, borderRadius: "50%", background: `${rl}50`, flexShrink: 0 }} />
                        <span style={{ fontSize: 12, color: "rgba(255,255,255,0.38)" }}>{item}</span>
                    </div>
                ))}
            </div>
        </div>
    );

    if (role === "ATHLETE") return (
        <ComingSoon items={[
            "競技歴（年月・実績・大会結果）",
            "所属チーム・クラブ",
            "現在の目標・ビジョン",
            "受賞歴・メディア掲載",
            "サポートしてほしいこと",
        ]} />
    );

    if (role === "TRAINER") return (
        <ComingSoon items={[
            "保有資格（NSCA-CPT / NESTA など）",
            "専門分野・対応競技",
            "指導経歴・実績",
            "対応エリア / オンライン可否",
            "料金目安・コンタクト",
        ]} />
    );

    if (role === "MEMBERS") return (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <div style={{ padding: "14px 16px", borderRadius: 12, background: `${rl}08`, border: `1px solid ${rl}20` }}>
                <p style={{ fontSize: 11, fontFamily: "monospace", fontWeight: 800, letterSpacing: "0.15em", textTransform: "uppercase", color: rl, margin: "0 0 6px" }}>応援ページ</p>
                <p style={{ fontSize: 12, color: "rgba(255,255,255,0.45)", margin: 0, lineHeight: 1.65 }}>
                    推し選手のカードコレクションはβ版（4/1〜）で表示されます。<br />
                    先にランキングからカードをコレクトしておこう！
                </p>
            </div>
            <Link href="/ranking" style={{
                display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                padding: "12px 0", borderRadius: 12,
                background: `${rl}12`, border: `1px solid ${rl}28`,
                color: rl, textDecoration: "none", fontSize: 12, fontWeight: 700,
            }}>
                ⭐ ランキングでアスリートを探す →
            </Link>
        </div>
    );

    if (role === "BUSINESS") return (
        <ComingSoon items={[
            "会社・ブランド概要",
            "スポーツへの関わり・想い",
            "求めるアスリート像・案件種別",
            "過去の支援実績",
            "コンタクト方法",
        ]} />
    );

    return null;
}