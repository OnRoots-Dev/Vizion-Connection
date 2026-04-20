"use client";

import { useEffect, useMemo, useState, type FormEvent } from "react";
import type { DashboardView, ThemeColors } from "@/app/(app)/dashboard/types";
import { SectionCard, SLabel, ViewHeader } from "@/app/(app)/dashboard/components/ui";
import type { VoiceLabCategory, VoiceLabStatus } from "@/lib/voicelab-shared";
import { VOICELAB_CATEGORY_LABEL, VOICELAB_STATUS_LABEL, type VoiceLabPost } from "@/lib/voicelab-shared";
import type { AdItem } from "@/lib/ads-shared";
import { isLocalPlan } from "@/lib/ads-shared";
import AdCard from "@/components/AdCard";

const BODY_MAX_LENGTH = 300;
const BODY_PREVIEW_LENGTH = 80;
const STATUS_OPTIONS: VoiceLabStatus[] = ["open", "reviewing", "planned", "done"];

function truncateBody(text: string) {
    if (text.length <= BODY_PREVIEW_LENGTH) {
        return text;
    }

    return `${text.slice(0, BODY_PREVIEW_LENGTH).trimEnd()}...`;
}

export function VoiceLabView({
    t,
    roleColor,
    setView,
    ads,
    canManageVoiceLab,
}: {
    t: ThemeColors;
    roleColor: string;
    setView: (v: DashboardView) => void;
    ads: AdItem[];
    canManageVoiceLab: boolean;
}) {
    const [posts, setPosts] = useState<VoiceLabPost[]>([]);
    const [category, setCategory] = useState<VoiceLabCategory | "all">("all");
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [statusSavingId, setStatusSavingId] = useState<string | null>(null);
    const [expandedIds, setExpandedIds] = useState<Record<string, boolean>>({});
    const [form, setForm] = useState({ category: "feature" as VoiceLabCategory, title: "", body: "" });

    const nationalAd = ads.find((ad) => !isLocalPlan(ad.plan)) ?? null;
    const localAd = ads.find((ad) => isLocalPlan(ad.plan)) ?? null;

    async function loadPosts() {
        setLoading(true);
        try {
            const res = await fetch("/api/voicelab/posts");
            const json = await res.json();
            setPosts(json.posts ?? []);
        } catch {
            setPosts([]);
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        loadPosts();
    }, []);

    const filtered = useMemo(() => (
        category === "all" ? posts : posts.filter((p) => p.category === category)
    ), [category, posts]);

    async function onSubmit(e: FormEvent<HTMLFormElement>) {
        e.preventDefault();
        if (saving) return;
        setSaving(true);
        try {
            const res = await fetch("/api/voicelab/posts", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(form),
            });
            if (res.ok) {
                setForm({ category: "feature", title: "", body: "" });
                await loadPosts();
            }
        } finally {
            setSaving(false);
        }
    }

    async function onStatusChange(postId: string, status: VoiceLabStatus) {
        if (statusSavingId) return;
        setStatusSavingId(postId);
        try {
            const res = await fetch("/api/voicelab/posts", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ postId, status }),
            });

            if (res.ok) {
                await loadPosts();
            }
        } finally {
            setStatusSavingId(null);
        }
    }

    return (
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                <p className="font-mono text-[10px] font-black uppercase tracking-[0.22em] opacity-60" style={{ margin: 0, color: t.sub }}>
                    ユーザーの声
                </p>
                <ViewHeader title="VOICE LAB" sub="あなたの声でプロダクトを育てる" onBack={() => setView("home")} t={t} roleColor={roleColor} />
            </div>

            {nationalAd ? (
                <AdCard ad={nationalAd} size="medium" />
            ) : (
                <SectionCard t={t}>
                    <SLabel text="AD SLOT" color="#FFD600" />
                    <p style={{ margin: 0, fontSize: 11, color: t.sub, opacity: 0.5 }}>全国スポンサー広告枠（準備中）</p>
                </SectionCard>
            )}

            <SectionCard t={t} accentColor={roleColor}>
                <SLabel text="New Voice" color={roleColor} />
                <form onSubmit={onSubmit} style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                    <div style={{ display: "grid", gridTemplateColumns: "160px 1fr", gap: 8 }}>
                        <select
                            value={form.category}
                            onChange={(e) => setForm((p) => ({ ...p, category: e.target.value as VoiceLabCategory }))}
                            style={{ background: "rgba(0,0,0,0.18)", border: `1px solid ${t.border}`, color: t.text, borderRadius: 16, padding: "12px 14px", fontSize: 12, fontWeight: 800 }}
                        >
                            {(Object.keys(VOICELAB_CATEGORY_LABEL) as VoiceLabCategory[]).map((c) => (
                                <option key={c} value={c}>{VOICELAB_CATEGORY_LABEL[c]}</option>
                            ))}
                        </select>
                        <input
                            value={form.title}
                            onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))}
                            placeholder="タイトル"
                            style={{ background: "rgba(0,0,0,0.18)", border: `1px solid ${t.border}`, color: t.text, borderRadius: 16, padding: "12px 14px", fontSize: 12, fontWeight: 800 }}
                        />
                    </div>
                    <textarea
                        value={form.body}
                        onChange={(e) => setForm((p) => ({ ...p, body: e.target.value.slice(0, BODY_MAX_LENGTH) }))}
                        placeholder="内容"
                        rows={4}
                        maxLength={BODY_MAX_LENGTH}
                        style={{ background: "rgba(0,0,0,0.18)", border: `1px solid ${t.border}`, color: t.text, borderRadius: 16, padding: "12px 14px", fontSize: 12 }}
                    />
                    <div style={{ display: "flex", justifyContent: "space-between", gap: 8, flexWrap: "wrap", fontSize: 10, color: t.sub }}>
                        <span>本文は最大{BODY_MAX_LENGTH}文字まで投稿できます</span>
                        <span>{form.body.length}/{BODY_MAX_LENGTH}</span>
                    </div>
                    <button type="submit" disabled={saving} style={{ alignSelf: "flex-start", borderRadius: 16, border: `1px solid ${roleColor}50`, background: `${roleColor}1f`, color: roleColor, fontWeight: 900, fontSize: 12, padding: "10px 14px", cursor: "pointer" }}>
                        {saving ? "投稿中..." : "投稿する"}
                    </button>
                </form>
            </SectionCard>

            {localAd ? (
                <AdCard ad={localAd} size="small" />
            ) : (
                <SectionCard t={t}>
                    <SLabel text="LOCAL AD SLOT" color="#FFD600" />
                    <p style={{ margin: 0, fontSize: 11, color: t.sub, opacity: 0.5 }}>地域スポンサー広告枠（準備中）</p>
                </SectionCard>
            )}

            <SectionCard t={t} accentColor={roleColor}>
                <SLabel text="Voices" color={roleColor} />
                <div
                    style={{
                        display: "grid",
                        gridTemplateColumns: "repeat(5, minmax(0, 1fr))",
                        gap: 0,
                        padding: 6,
                        border: `1px solid ${t.border}`,
                        borderRadius: 14,
                        background: "rgba(255,255,255,0.03)",
                        marginBottom: 10,
                    }}
                >
                    {(["all", "feature", "bug", "idea", "other"] as const).map((c) => {
                        const active = category === c;
                        return (
                            <button
                                key={c}
                                type="button"
                                onClick={() => setCategory(c)}
                                style={{
                                    minHeight: 40,
                                    padding: "0 10px",
                                    borderRadius: 12,
                                    border: "none",
                                    background: active ? `${roleColor}16` : "transparent",
                                    color: active ? roleColor : t.sub,
                                    fontSize: 10,
                                    fontWeight: 900,
                                    letterSpacing: "0.08em",
                                    cursor: "pointer",
                                    transition: "all 0.18s ease",
                                    boxShadow: active ? `inset 0 0 0 1px ${roleColor}24` : "none",
                                    whiteSpace: "nowrap",
                                }}
                            >
                                {c === "all" ? "すべて" : VOICELAB_CATEGORY_LABEL[c]}
                            </button>
                        );
                    })}
                </div>
                {loading ? (
                    <p style={{ margin: 0, fontSize: 12, color: t.sub }}>読み込み中...</p>
                ) : filtered.length === 0 ? (
                    <p style={{ margin: 0, fontSize: 12, color: t.sub }}>投稿がありません。</p>
                ) : (
                    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                        {filtered.map((post) => (
                            <div
                                key={post.id}
                                style={{
                                    borderRadius: 18,
                                    border: `1px solid ${t.border}`,
                                    background: "linear-gradient(180deg, rgba(255,255,255,0.05), rgba(255,255,255,0.015))",
                                    padding: "12px 14px",
                                }}
                            >
                                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10, marginBottom: 10, flexWrap: "wrap" }}>
                                    <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                                        <span
                                            style={{
                                                fontSize: 10,
                                                fontWeight: 900,
                                                borderRadius: 999,
                                                padding: "4px 10px",
                                                border: `1px solid ${t.border}`,
                                                background: "rgba(255,255,255,0.03)",
                                                color: t.sub,
                                            }}
                                        >
                                            {VOICELAB_CATEGORY_LABEL[post.category]}
                                        </span>

                                        <span
                                            style={{
                                                fontSize: 10,
                                                fontWeight: 900,
                                                borderRadius: 999,
                                                padding: "4px 10px",
                                                border: `1px solid ${roleColor}30`,
                                                background: `${roleColor}14`,
                                                color: roleColor,
                                            }}
                                        >
                                            {VOICELAB_STATUS_LABEL[post.status]}
                                        </span>
                                    </div>

                                    <span style={{ fontSize: 10, color: t.sub, opacity: 0.7 }}>
                                        {new Date(post.createdAt).toLocaleDateString("ja-JP")}
                                    </span>

                                    {canManageVoiceLab ? (
                                        <div style={{ display: "flex", gap: 6, flexWrap: "wrap", justifyContent: "flex-end" }}>
                                            {STATUS_OPTIONS.map((statusOption) => {
                                                const active = post.status === statusOption;
                                                return (
                                                    <button
                                                        key={statusOption}
                                                        type="button"
                                                        disabled={statusSavingId === post.id}
                                                        onClick={() => onStatusChange(post.id, statusOption)}
                                                        style={{
                                                            border: `1px solid ${active ? roleColor : t.border}`,
                                                            background: active ? `${roleColor}16` : "rgba(255,255,255,0.03)",
                                                            color: active ? roleColor : t.sub,
                                                            borderRadius: 999,
                                                            padding: "5px 10px",
                                                            fontSize: 10,
                                                            fontWeight: 900,
                                                            cursor: statusSavingId === post.id ? "wait" : "pointer",
                                                        }}
                                                    >
                                                        {VOICELAB_STATUS_LABEL[statusOption]}
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    ) : null}
                                </div>

                                <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: 10 }}>
                                    <p style={{ margin: 0, fontSize: 14, fontWeight: 900, color: t.text, letterSpacing: "-0.01em" }}>{post.title}</p>
                                    {statusSavingId === post.id ? <span style={{ fontSize: 10, color: t.sub }}>更新中...</span> : null}
                                </div>
                                <p style={{ margin: "0 0 6px", fontSize: 12, color: t.sub, lineHeight: 1.65, whiteSpace: "pre-wrap" }}>
                                    {expandedIds[post.id] ? post.body : truncateBody(post.body)}
                                </p>
                                {post.body.length > BODY_PREVIEW_LENGTH ? (
                                    <button
                                        type="button"
                                        onClick={() => setExpandedIds((prev) => ({ ...prev, [post.id]: !prev[post.id] }))}
                                        style={{
                                            marginBottom: 8,
                                            border: "none",
                                            background: "transparent",
                                            color: roleColor,
                                            fontSize: 10,
                                            fontWeight: 900,
                                            padding: 0,
                                            cursor: "pointer",
                                        }}
                                    >
                                        {expandedIds[post.id] ? "閉じる" : "もっと見る"}
                                    </button>
                                ) : null}

                                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10, flexWrap: "wrap" }}>
                                    <p style={{ margin: 0, fontSize: 10, color: t.sub, opacity: 0.7 }}>
                                        {post.user ? `@${post.user.slug} (${post.user.displayName})` : "匿名"}
                                    </p>
                                    <p style={{ margin: 0, fontSize: 10, color: t.sub, opacity: 0.7 }}>▲ {post.upvotes}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </SectionCard>
        </div>
    );
}
