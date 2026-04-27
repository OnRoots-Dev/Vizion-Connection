"use client";

import { useEffect, useMemo, useState, type Dispatch, type FormEvent, type SetStateAction } from "react";
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
    const [isMobile, setIsMobile] = useState(false);
    const [mobileStatus, setMobileStatus] = useState<VoiceLabStatus>("open");

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
        void loadPosts();
    }, []);

    useEffect(() => {
        const media = window.matchMedia("(max-width: 860px)");
        const sync = () => setIsMobile(media.matches);
        sync();
        media.addEventListener("change", sync);
        return () => media.removeEventListener("change", sync);
    }, []);

    const filtered = useMemo(() => (
        category === "all" ? posts : posts.filter((post) => post.category === category)
    ), [category, posts]);

    const groupedByStatus = useMemo(() => ({
        open: filtered.filter((post) => post.status === "open"),
        reviewing: filtered.filter((post) => post.status === "reviewing"),
        planned: filtered.filter((post) => post.status === "planned"),
        done: filtered.filter((post) => post.status === "done"),
    }), [filtered]);

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
                            onChange={(e) => setForm((prev) => ({ ...prev, category: e.target.value as VoiceLabCategory }))}
                            style={{ background: "rgba(0,0,0,0.18)", border: `1px solid ${t.border}`, color: t.text, borderRadius: 16, padding: "12px 14px", fontSize: 12, fontWeight: 800 }}
                        >
                            {(Object.keys(VOICELAB_CATEGORY_LABEL) as VoiceLabCategory[]).map((entry) => (
                                <option key={entry} value={entry}>{VOICELAB_CATEGORY_LABEL[entry]}</option>
                            ))}
                        </select>
                        <input
                            value={form.title}
                            onChange={(e) => setForm((prev) => ({ ...prev, title: e.target.value }))}
                            placeholder="タイトル"
                            style={{ background: "rgba(0,0,0,0.18)", border: `1px solid ${t.border}`, color: t.text, borderRadius: 16, padding: "12px 14px", fontSize: 12, fontWeight: 800 }}
                        />
                    </div>
                    <textarea
                        value={form.body}
                        onChange={(e) => setForm((prev) => ({ ...prev, body: e.target.value.slice(0, BODY_MAX_LENGTH) }))}
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
                <div style={{ marginBottom: 12, padding: "12px 14px", borderRadius: 14, border: `1px solid ${t.border}`, background: "rgba(255,255,255,0.03)" }}>
                    <p style={{ margin: "0 0 6px", fontSize: 12, fontWeight: 800, color: t.text }}>いただいた声を大切に確認しています</p>
                    <p style={{ margin: 0, fontSize: 11, lineHeight: 1.8, color: t.sub }}>
                        すべてのご要望や不具合報告に個別で即時対応することは難しいため、内容を確認したうえで未対応・対応中・検討中・対応済みに整理して公開しています。優先度や影響範囲に応じて順次対応しているため、すべての声にすぐお応えできない場合がある点をご理解ください。
                    </p>
                </div>

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
                    {(["all", "feature", "bug", "idea", "other"] as const).map((entry) => {
                        const active = category === entry;
                        return (
                            <button
                                key={entry}
                                type="button"
                                onClick={() => setCategory(entry)}
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
                                {entry === "all" ? "すべて" : VOICELAB_CATEGORY_LABEL[entry]}
                            </button>
                        );
                    })}
                </div>

                {loading ? (
                    <p style={{ margin: 0, fontSize: 12, color: t.sub }}>読み込み中...</p>
                ) : filtered.length === 0 ? (
                    <p style={{ margin: 0, fontSize: 12, color: t.sub }}>投稿がありません。</p>
                ) : isMobile ? (
                    <div style={{ display: "grid", gap: 10 }}>
                        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, minmax(0, 1fr))", gap: 6 }}>
                            {STATUS_OPTIONS.map((statusOption) => {
                                const active = mobileStatus === statusOption;
                                return (
                                    <button
                                        key={statusOption}
                                        type="button"
                                        onClick={() => setMobileStatus(statusOption)}
                                        style={{
                                            minHeight: 40,
                                            padding: "0 8px",
                                            borderRadius: 12,
                                            border: `1px solid ${active ? `${roleColor}24` : t.border}`,
                                            background: active ? `${roleColor}14` : "rgba(255,255,255,0.03)",
                                            color: active ? roleColor : t.sub,
                                            fontSize: 10,
                                            fontWeight: 900,
                                            cursor: "pointer",
                                        }}
                                    >
                                        {VOICELAB_STATUS_LABEL[statusOption]}
                                    </button>
                                );
                            })}
                        </div>

                        <VoiceStatusColumn
                            status={mobileStatus}
                            posts={groupedByStatus[mobileStatus]}
                            t={t}
                            roleColor={roleColor}
                            canManageVoiceLab={canManageVoiceLab}
                            statusSavingId={statusSavingId}
                            expandedIds={expandedIds}
                            setExpandedIds={setExpandedIds}
                            onStatusChange={onStatusChange}
                        />
                    </div>
                ) : (
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(4, minmax(0, 1fr))", gap: 12, alignItems: "start" }}>
                        {STATUS_OPTIONS.map((statusOption) => (
                            <VoiceStatusColumn
                                key={statusOption}
                                status={statusOption}
                                posts={groupedByStatus[statusOption]}
                                t={t}
                                roleColor={roleColor}
                                canManageVoiceLab={canManageVoiceLab}
                                statusSavingId={statusSavingId}
                                expandedIds={expandedIds}
                                setExpandedIds={setExpandedIds}
                                onStatusChange={onStatusChange}
                            />
                        ))}
                    </div>
                )}
            </SectionCard>
        </div>
    );
}

function VoiceStatusColumn({
    status,
    posts,
    t,
    roleColor,
    canManageVoiceLab,
    statusSavingId,
    expandedIds,
    setExpandedIds,
    onStatusChange,
}: {
    status: VoiceLabStatus;
    posts: VoiceLabPost[];
    t: ThemeColors;
    roleColor: string;
    canManageVoiceLab: boolean;
    statusSavingId: string | null;
    expandedIds: Record<string, boolean>;
    setExpandedIds: Dispatch<SetStateAction<Record<string, boolean>>>;
    onStatusChange: (postId: string, status: VoiceLabStatus) => Promise<void>;
}) {
    return (
        <div style={{ display: "flex", flexDirection: "column", gap: 8, minWidth: 0 }}>
            <div style={{ padding: "10px 12px", borderRadius: 14, border: `1px solid ${t.border}`, background: "rgba(255,255,255,0.03)" }}>
                <p style={{ margin: 0, fontSize: 10, fontWeight: 900, color: roleColor }}>{VOICELAB_STATUS_LABEL[status]}</p>
                <p style={{ margin: "4px 0 0", fontSize: 10, color: t.sub }}>{posts.length}件</p>
            </div>

            {posts.length === 0 ? (
                <div style={{ padding: "14px 12px", borderRadius: 14, border: `1px dashed ${t.border}`, color: t.sub, fontSize: 11 }}>
                    該当する投稿はまだありません。
                </div>
            ) : (
                posts.map((post) => (
                    <div
                        key={post.id}
                        style={{
                            borderRadius: 16,
                            border: `1px solid ${t.border}`,
                            background: "linear-gradient(180deg, rgba(255,255,255,0.05), rgba(255,255,255,0.015))",
                            padding: "12px 12px 10px",
                        }}
                    >
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8, marginBottom: 8, flexWrap: "wrap" }}>
                            <span
                                style={{
                                    fontSize: 10,
                                    fontWeight: 900,
                                    borderRadius: 999,
                                    padding: "4px 9px",
                                    border: `1px solid ${t.border}`,
                                    background: "rgba(255,255,255,0.03)",
                                    color: t.sub,
                                }}
                            >
                                {VOICELAB_CATEGORY_LABEL[post.category]}
                            </span>
                            <span style={{ fontSize: 10, color: t.sub, opacity: 0.7 }}>
                                {new Date(post.createdAt).toLocaleDateString("ja-JP")}
                            </span>
                        </div>

                        <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: 8 }}>
                            <p style={{ margin: 0, fontSize: 13, fontWeight: 900, color: t.text, letterSpacing: "-0.01em" }}>{post.title}</p>
                            {statusSavingId === post.id ? <span style={{ fontSize: 10, color: t.sub }}>更新中...</span> : null}
                        </div>

                        <p style={{ margin: "6px 0 6px", fontSize: 11, color: t.sub, lineHeight: 1.7, whiteSpace: "pre-wrap" }}>
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

                        {canManageVoiceLab ? (
                            <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 8 }}>
                                {STATUS_OPTIONS.map((statusOption) => {
                                    const active = post.status === statusOption;
                                    return (
                                        <button
                                            key={statusOption}
                                            type="button"
                                            disabled={statusSavingId === post.id}
                                            onClick={() => void onStatusChange(post.id, statusOption)}
                                            style={{
                                                border: `1px solid ${active ? roleColor : t.border}`,
                                                background: active ? `${roleColor}16` : "rgba(255,255,255,0.03)",
                                                color: active ? roleColor : t.sub,
                                                borderRadius: 999,
                                                padding: "5px 9px",
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

                        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8, flexWrap: "wrap" }}>
                            <p style={{ margin: 0, fontSize: 10, color: t.sub, opacity: 0.7 }}>
                                {post.user ? `@${post.user.slug} (${post.user.displayName})` : "匿名"}
                            </p>
                            <p style={{ margin: 0, fontSize: 10, color: t.sub, opacity: 0.7 }}>▲ {post.upvotes}</p>
                        </div>
                    </div>
                ))
            )}
        </div>
    );
}
