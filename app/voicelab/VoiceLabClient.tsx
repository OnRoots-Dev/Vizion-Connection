"use client";

import { useMemo, useState, type FormEvent } from "react";
import type { VoiceLabCategory, VoiceLabPost, VoiceLabStatus } from "@/lib/voicelab-shared";
import { VOICELAB_CATEGORY_LABEL, VOICELAB_STATUS_LABEL } from "@/lib/voicelab-shared";
import type { AdItem } from "@/lib/ads-shared";
import { isLocalPlan } from "@/lib/ads-shared";
import AdCard from "@/components/AdCard";

const STATUS_CLASS: Record<VoiceLabStatus, string> = {
    open: "border-rose-300/35 bg-rose-200/10 text-rose-100",
    reviewing: "border-sky-300/35 bg-sky-200/10 text-sky-100",
    planned: "border-amber-300/35 bg-amber-200/10 text-amber-100",
    done: "border-emerald-300/35 bg-emerald-200/10 text-emerald-100",
};
const BODY_MAX_LENGTH = 300;
const BODY_PREVIEW_LENGTH = 80;
const STATUS_OPTIONS: VoiceLabStatus[] = ["open", "reviewing", "planned", "done"];

function truncateBody(text: string) {
    if (text.length <= BODY_PREVIEW_LENGTH) {
        return text;
    }

    return `${text.slice(0, BODY_PREVIEW_LENGTH).trimEnd()}...`;
}

export default function VoiceLabClient({
    initialPosts,
    initialUpvotedIds,
    canPost,
    ads,
    canManageVoiceLab,
}: {
    initialPosts: VoiceLabPost[];
    initialUpvotedIds: string[];
    canPost: boolean;
    ads: AdItem[];
    canManageVoiceLab: boolean;
}) {
    const [posts, setPosts] = useState(initialPosts);
    const [selectedCategory, setSelectedCategory] = useState<VoiceLabCategory | "all">("all");
    const [upvotedIds, setUpvotedIds] = useState<Set<string>>(new Set(initialUpvotedIds));
    const [submitting, setSubmitting] = useState(false);
    const [creating, setCreating] = useState(false);
    const [statusPostId, setStatusPostId] = useState<string | null>(null);
    const [expandedIds, setExpandedIds] = useState<Record<string, boolean>>({});
    const [form, setForm] = useState({
        category: "feature" as VoiceLabCategory,
        title: "",
        body: "",
    });

    const filteredPosts = useMemo(() => (
        selectedCategory === "all"
            ? posts
            : posts.filter((p) => p.category === selectedCategory)
    ), [posts, selectedCategory]);
    const topAd = ads.find((ad) => !isLocalPlan(ad.plan)) ?? null;
    const localAd = ads.find((ad) => isLocalPlan(ad.plan)) ?? null;

    async function refreshPosts() {
        const res = await fetch("/api/voicelab/posts", { cache: "no-store" });
        if (!res.ok) return;
        const json = await res.json() as { posts: VoiceLabPost[] };
        setPosts(json.posts ?? []);
    }

    async function onToggleUpvote(postId: string) {
        if (submitting) return;
        setSubmitting(true);
        const prev = new Set(upvotedIds);
        const next = new Set(upvotedIds);
        if (next.has(postId)) next.delete(postId);
        else next.add(postId);
        setUpvotedIds(next);

        const res = await fetch("/api/voicelab/upvote", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ postId }),
        });
        if (!res.ok) {
            setUpvotedIds(prev);
        } else {
            await refreshPosts();
        }
        setSubmitting(false);
    }

    async function onCreatePost(e: FormEvent<HTMLFormElement>) {
        e.preventDefault();
        if (creating) return;
        setCreating(true);
        const res = await fetch("/api/voicelab/posts", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(form),
        });
        if (res.ok) {
            setForm({ category: "feature", title: "", body: "" });
            await refreshPosts();
        }
        setCreating(false);
    }

    async function onStatusChange(postId: string, status: VoiceLabStatus) {
        if (statusPostId) return;
        setStatusPostId(postId);
        try {
            const res = await fetch("/api/voicelab/posts", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ postId, status }),
            });

            if (res.ok) {
                await refreshPosts();
            }
        } finally {
            setStatusPostId(null);
        }
    }

    return (
        <main className="min-h-screen bg-gradient-to-b from-[#07070c] via-[#0b0906] to-[#07070c] px-4 py-10 text-white sm:px-6">
            <div className="mx-auto w-full max-w-5xl">
                <div className="mb-6 rounded-3xl border border-[#f5efe3]/15 bg-[#f5efe3]/[0.05] p-5">
                    <p className="text-[11px] font-black uppercase tracking-[0.22em] text-[#f5efe3]/65">Voice Lab</p>
                    <h1 className="mt-2 text-2xl font-black tracking-tight sm:text-3xl">ご意見ボックス</h1>
                    <p className="mt-2 text-sm leading-7 text-[#f5efe3]/70">ご意見・バグ報告・アイデアを投書してください。</p>
                </div>

                <div className="mb-6 rounded-3xl border border-amber-200/20 bg-amber-200/10 p-4">
                    {canPost ? (
                        <form onSubmit={onCreatePost} className="grid gap-3">
                            <div className="grid gap-3 sm:grid-cols-3">
                                <select
                                    value={form.category}
                                    onChange={(e) => setForm((p) => ({ ...p, category: e.target.value as VoiceLabCategory }))}
                                    className="rounded-2xl border border-amber-200/25 bg-black/25 px-4 py-3 text-sm font-bold"
                                >
                                    {(Object.keys(VOICELAB_CATEGORY_LABEL) as VoiceLabCategory[]).map((cat) => (
                                        <option key={cat} value={cat}>{VOICELAB_CATEGORY_LABEL[cat]}</option>
                                    ))}
                                </select>
                                <input
                                    value={form.title}
                                    onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))}
                                    placeholder="タイトル"
                                    className="rounded-2xl border border-amber-200/25 bg-black/25 px-4 py-3 text-sm font-bold placeholder:text-white/40 sm:col-span-2"
                                />
                            </div>
                            <textarea
                                value={form.body}
                                onChange={(e) => setForm((p) => ({ ...p, body: e.target.value.slice(0, BODY_MAX_LENGTH) }))}
                                placeholder="内容"
                                rows={5}
                                maxLength={BODY_MAX_LENGTH}
                                className="w-full rounded-2xl border border-amber-200/25 bg-black/25 px-4 py-3 text-sm placeholder:text-white/40"
                            />
                            <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-white/60">
                                <span>本文は最大{BODY_MAX_LENGTH}文字まで投稿できます</span>
                                <span className="font-mono">{form.body.length}/{BODY_MAX_LENGTH}</span>
                            </div>
                            <button
                                type="submit"
                                disabled={creating}
                                className="w-fit rounded-2xl border border-amber-200/40 bg-amber-200/15 px-5 py-3 text-sm font-black text-amber-100 disabled:opacity-50"
                            >
                                {creating ? "投書中..." : "投書する"}
                            </button>
                        </form>
                    ) : (
                        <div className="rounded-2xl border border-amber-200/20 bg-black/20 px-4 py-4 text-sm text-white/70">
                            ログインすると投書フォームが表示されます。
                        </div>
                    )}
                </div>

                <div className="mb-5 flex flex-wrap gap-2">
                    {(["all", "feature", "bug", "idea", "other"] as const).map((c) => {
                        const active = selectedCategory === c;
                        const label = c === "all" ? "すべて" : VOICELAB_CATEGORY_LABEL[c];
                        return (
                            <button
                                key={c}
                                type="button"
                                onClick={() => setSelectedCategory(c)}
                                className={`rounded-full border px-3 py-1.5 text-xs font-bold transition ${
                                    active
                                        ? "border-cyan-300/45 bg-cyan-300/15 text-cyan-100"
                                        : "border-white/15 bg-white/[0.03] text-white/60 hover:bg-white/[0.08]"
                                }`}
                            >
                                {label}
                            </button>
                        );
                    })}
                </div>
                {topAd && (
                    <div className="mb-5">
                        <AdCard ad={topAd} size="medium" />
                    </div>
                )}
                {localAd && (
                    <div className="mb-6">
                        <AdCard ad={localAd} size="small" />
                    </div>
                )}

                <div className="space-y-3">
                    {filteredPosts.map((post) => {
                        const isUpvoted = upvotedIds.has(post.id);
                        return (
                            <article
                                key={post.id}
                                className="rounded-2xl border border-white/10 bg-gradient-to-b from-white/[0.05] to-white/[0.02] p-4"
                            >
                                <div className="mb-2 flex flex-wrap items-center gap-2">
                                    <span className="rounded-full border border-white/15 bg-white/[0.04] px-3 py-1 text-[11px] font-bold text-white/75">
                                        {VOICELAB_CATEGORY_LABEL[post.category]}
                                    </span>
                                    <span className={`rounded-full border px-3 py-1 text-[11px] font-bold ${STATUS_CLASS[post.status]}`}>
                                        {VOICELAB_STATUS_LABEL[post.status]}
                                    </span>
                                    {canManageVoiceLab ? (
                                        <select
                                            value={post.status}
                                            disabled={statusPostId === post.id}
                                            onChange={(e) => onStatusChange(post.id, e.target.value as VoiceLabStatus)}
                                            className="rounded-full border border-white/15 bg-black/30 px-3 py-1 text-[11px] font-bold text-white/70 disabled:opacity-50"
                                        >
                                            {STATUS_OPTIONS.map((st) => (
                                                <option key={st} value={st}>{VOICELAB_STATUS_LABEL[st]}</option>
                                            ))}
                                        </select>
                                    ) : null}
                                    <span className="ml-auto text-xs text-white/40">
                                        {new Date(post.createdAt).toLocaleDateString("ja-JP")}
                                    </span>
                                </div>
                                <h3 className="text-base font-extrabold">{post.title}</h3>
                                <p className="mt-2 whitespace-pre-wrap text-sm leading-7 text-white/75">
                                    {expandedIds[post.id] ? post.body : truncateBody(post.body)}
                                </p>
                                {post.body.length > BODY_PREVIEW_LENGTH && (
                                    <button
                                        type="button"
                                        onClick={() => setExpandedIds((prev) => ({ ...prev, [post.id]: !prev[post.id] }))}
                                        className="mt-2 text-xs font-bold text-cyan-200"
                                    >
                                        {expandedIds[post.id] ? "閉じる" : "もっと見る"}
                                    </button>
                                )}
                                <div className="mt-4 flex items-center justify-between">
                                    <p className="text-xs text-white/45">
                                        {post.user ? `@${post.user.slug} (${post.user.displayName})` : "匿名"}
                                    </p>
                                    <div className="flex flex-wrap items-center justify-end gap-2">
                                        <button
                                            type="button"
                                            onClick={() => onToggleUpvote(post.id)}
                                            className={`rounded-full border px-3 py-1 text-xs font-bold transition ${
                                                isUpvoted
                                                    ? "border-amber-300/40 bg-amber-300/15 text-amber-200"
                                                    : "border-white/15 bg-white/[0.03] text-white/65 hover:bg-white/[0.08]"
                                            }`}
                                        >
                                            ▲ {post.upvotes}
                                        </button>
                                    </div>
                                </div>
                            </article>
                        );
                    })}
                </div>
            </div>
        </main>
    );
}
