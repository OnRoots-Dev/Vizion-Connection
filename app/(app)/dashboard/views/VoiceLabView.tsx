"use client";

import { useEffect, useMemo, useState, type FormEvent } from "react";
import type { DashboardView, ThemeColors } from "@/app/(app)/dashboard/types";
import { SectionCard, SLabel, ViewHeader } from "@/app/(app)/dashboard/components/ui";
import type { OpenlabCategory, OpenlabStatus } from "@/lib/openlab-shared";
import { OPENLAB_CATEGORY_LABEL, OPENLAB_STATUS_LABEL, type OpenlabPost } from "@/lib/openlab-shared";
import type { AdItem } from "@/lib/ads-shared";
import { isLocalPlan } from "@/lib/ads-shared";
import AdCard from "@/components/AdCard";

const BODY_MAX_LENGTH = 300;
const BODY_PREVIEW_LENGTH = 80;
const STATUS_OPTIONS: OpenlabStatus[] = ["open", "reviewing", "done"];

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
    canManageOpenlab,
}: {
    t: ThemeColors;
    roleColor: string;
    setView: (v: DashboardView) => void;
    ads: AdItem[];
    canManageOpenlab: boolean;
}) {
    const [posts, setPosts] = useState<OpenlabPost[]>([]);
    const [category, setCategory] = useState<OpenlabCategory | "all">("all");
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [statusSavingId, setStatusSavingId] = useState<string | null>(null);
    const [expandedIds, setExpandedIds] = useState<Record<string, boolean>>({});
    const [form, setForm] = useState({ category: "feature" as OpenlabCategory, title: "", body: "" });

    const nationalAd = ads.find((ad) => !isLocalPlan(ad.plan)) ?? null;
    const localAd = ads.find((ad) => isLocalPlan(ad.plan)) ?? null;

    async function loadPosts() {
        setLoading(true);
        try {
            const res = await fetch("/api/openlab/posts");
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
            const res = await fetch("/api/openlab/posts", {
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

    async function onStatusChange(postId: string, status: OpenlabStatus) {
        if (statusSavingId) return;
        setStatusSavingId(postId);
        try {
            const res = await fetch("/api/openlab/posts", {
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
            <ViewHeader title="Voice Lab" sub="みんなの声でプロダクトを育てる" onBack={() => setView("home")} t={t} roleColor={roleColor} />

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
                            onChange={(e) => setForm((p) => ({ ...p, category: e.target.value as OpenlabCategory }))}
                            style={{ background: "rgba(255,255,255,0.03)", border: `1px solid ${t.border}`, color: t.text, borderRadius: 10, padding: "9px 10px", fontSize: 12 }}
                        >
                            {(Object.keys(OPENLAB_CATEGORY_LABEL) as OpenlabCategory[]).map((c) => (
                                <option key={c} value={c}>{OPENLAB_CATEGORY_LABEL[c]}</option>
                            ))}
                        </select>
                        <input
                            value={form.title}
                            onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))}
                            placeholder="タイトル"
                            style={{ background: "rgba(255,255,255,0.03)", border: `1px solid ${t.border}`, color: t.text, borderRadius: 10, padding: "9px 10px", fontSize: 12 }}
                        />
                    </div>
                    <textarea
                        value={form.body}
                        onChange={(e) => setForm((p) => ({ ...p, body: e.target.value.slice(0, BODY_MAX_LENGTH) }))}
                        placeholder="内容"
                        rows={4}
                        maxLength={BODY_MAX_LENGTH}
                        style={{ background: "rgba(255,255,255,0.03)", border: `1px solid ${t.border}`, color: t.text, borderRadius: 10, padding: "9px 10px", fontSize: 12 }}
                    />
                    <div style={{ display: "flex", justifyContent: "space-between", gap: 8, flexWrap: "wrap", fontSize: 10, color: t.sub }}>
                        <span>本文は最大{BODY_MAX_LENGTH}文字まで投稿できます</span>
                        <span>{form.body.length}/{BODY_MAX_LENGTH}</span>
                    </div>
                    <button type="submit" disabled={saving} style={{ alignSelf: "flex-start", borderRadius: 10, border: `1px solid ${roleColor}50`, background: `${roleColor}22`, color: roleColor, fontWeight: 800, fontSize: 12, padding: "8px 12px", cursor: "pointer" }}>
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
                <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 10 }}>
                    {(["all", "feature", "bug", "idea", "other"] as const).map((c) => (
                        <button key={c} onClick={() => setCategory(c)} style={{ border: "none", borderRadius: 99, padding: "5px 10px", background: category === c ? `${roleColor}20` : "rgba(255,255,255,0.04)", color: category === c ? roleColor : t.sub, fontSize: 10, cursor: "pointer" }}>
                            {c === "all" ? "すべて" : OPENLAB_CATEGORY_LABEL[c]}
                        </button>
                    ))}
                </div>
                {loading ? (
                    <p style={{ margin: 0, fontSize: 12, color: t.sub }}>読み込み中...</p>
                ) : filtered.length === 0 ? (
                    <p style={{ margin: 0, fontSize: 12, color: t.sub }}>投稿がありません。</p>
                ) : (
                    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                        {filtered.map((post) => (
                            <div key={post.id} style={{ borderRadius: 12, border: `1px solid ${t.border}`, background: "rgba(255,255,255,0.02)", padding: "10px 12px" }}>
                                <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 8, marginBottom: 5, flexWrap: "wrap" }}>
                                    <span style={{ fontSize: 10, color: roleColor }}>{OPENLAB_CATEGORY_LABEL[post.category]}</span>
                                    {canManageOpenlab ? (
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
                                                            background: active ? `${roleColor}20` : "rgba(255,255,255,0.04)",
                                                            color: active ? roleColor : t.sub,
                                                            borderRadius: 999,
                                                            padding: "4px 8px",
                                                            fontSize: 10,
                                                            fontWeight: 800,
                                                            cursor: statusSavingId === post.id ? "wait" : "pointer",
                                                        }}
                                                    >
                                                        {OPENLAB_STATUS_LABEL[statusOption]}
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    ) : (
                                        <span style={{ fontSize: 10, color: t.sub }}>{OPENLAB_STATUS_LABEL[post.status]}</span>
                                    )}
                                </div>
                                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8, marginBottom: 5 }}>
                                    <p style={{ margin: "0 0 4px", fontSize: 13, fontWeight: 800, color: t.text }}>{post.title}</p>
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
                                            fontWeight: 800,
                                            padding: 0,
                                            cursor: "pointer",
                                        }}
                                    >
                                        {expandedIds[post.id] ? "閉じる" : "もっと見る"}
                                    </button>
                                ) : null}
                                <p style={{ margin: 0, fontSize: 10, color: t.sub, opacity: 0.7 }}>▲ {post.upvotes}</p>
                            </div>
                        ))}
                    </div>
                )}
            </SectionCard>
        </div>
    );
}
