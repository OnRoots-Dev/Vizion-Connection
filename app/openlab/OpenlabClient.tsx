"use client";

import { useMemo, useState, type FormEvent } from "react";
import type { OpenlabCategory, OpenlabPost, OpenlabStatus } from "@/lib/openlab-shared";
import { OPENLAB_CATEGORY_LABEL, OPENLAB_STATUS_LABEL } from "@/lib/openlab-shared";
import type { AdItem } from "@/lib/ads-shared";
import { isLocalPlan } from "@/lib/ads-shared";
import AdCard from "@/components/AdCard";

const STATUS_CLASS: Record<OpenlabStatus, string> = {
    open: "border-emerald-300/30 bg-emerald-300/10 text-emerald-200",
    reviewing: "border-sky-300/30 bg-sky-300/10 text-sky-200",
    planned: "border-amber-300/30 bg-amber-300/10 text-amber-200",
    done: "border-fuchsia-300/30 bg-fuchsia-300/10 text-fuchsia-200",
};

export default function OpenlabClient({
    initialPosts,
    initialUpvotedIds,
    canPost,
    ads,
}: {
    initialPosts: OpenlabPost[];
    initialUpvotedIds: string[];
    canPost: boolean;
    ads: AdItem[];
}) {
    const [posts, setPosts] = useState(initialPosts);
    const [selectedCategory, setSelectedCategory] = useState<OpenlabCategory | "all">("all");
    const [upvotedIds, setUpvotedIds] = useState<Set<string>>(new Set(initialUpvotedIds));
    const [submitting, setSubmitting] = useState(false);
    const [creating, setCreating] = useState(false);
    const [form, setForm] = useState({
        category: "feature" as OpenlabCategory,
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
        const res = await fetch("/api/openlab/posts", { cache: "no-store" });
        if (!res.ok) return;
        const json = await res.json() as { posts: OpenlabPost[] };
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

        const res = await fetch("/api/openlab/upvote", {
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
        const res = await fetch("/api/openlab/posts", {
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

    return (
        <main className="min-h-screen bg-[#07070c] px-4 py-10 text-white sm:px-6">
            <div className="mx-auto w-full max-w-5xl">
                <div className="mb-6 rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                    <p className="text-[11px] uppercase tracking-[0.2em] text-white/45">Openlab</p>
                    <h1 className="mt-1 text-2xl font-black">改善提案・要望ボード</h1>
                </div>

                <div className="mb-5 flex flex-wrap gap-2">
                    {(["all", "feature", "bug", "idea", "other"] as const).map((c) => {
                        const active = selectedCategory === c;
                        const label = c === "all" ? "すべて" : OPENLAB_CATEGORY_LABEL[c];
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

                {canPost && (
                    <form onSubmit={onCreatePost} className="mb-6 rounded-2xl border border-white/10 bg-white/[0.02] p-4">
                        <h2 className="mb-3 text-sm font-extrabold">新規投稿</h2>
                        <div className="grid gap-3 sm:grid-cols-3">
                            <select
                                value={form.category}
                                onChange={(e) => setForm((p) => ({ ...p, category: e.target.value as OpenlabCategory }))}
                                className="rounded-lg border border-white/15 bg-black/30 px-3 py-2 text-sm"
                            >
                                {(Object.keys(OPENLAB_CATEGORY_LABEL) as OpenlabCategory[]).map((cat) => (
                                    <option key={cat} value={cat}>{OPENLAB_CATEGORY_LABEL[cat]}</option>
                                ))}
                            </select>
                            <input
                                value={form.title}
                                onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))}
                                placeholder="タイトル"
                                className="rounded-lg border border-white/15 bg-black/30 px-3 py-2 text-sm sm:col-span-2"
                            />
                        </div>
                        <textarea
                            value={form.body}
                            onChange={(e) => setForm((p) => ({ ...p, body: e.target.value }))}
                            placeholder="内容"
                            rows={4}
                            className="mt-3 w-full rounded-lg border border-white/15 bg-black/30 px-3 py-2 text-sm"
                        />
                        <button
                            type="submit"
                            disabled={creating}
                            className="mt-3 rounded-lg border border-cyan-300/35 bg-cyan-300/15 px-4 py-2 text-sm font-bold text-cyan-100 disabled:opacity-50"
                        >
                            {creating ? "投稿中..." : "投稿する"}
                        </button>
                    </form>
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
                                        {OPENLAB_CATEGORY_LABEL[post.category]}
                                    </span>
                                    <span className={`rounded-full border px-3 py-1 text-[11px] font-bold ${STATUS_CLASS[post.status]}`}>
                                        {OPENLAB_STATUS_LABEL[post.status]}
                                    </span>
                                    <span className="ml-auto text-xs text-white/40">
                                        {new Date(post.createdAt).toLocaleDateString("ja-JP")}
                                    </span>
                                </div>
                                <h3 className="text-base font-extrabold">{post.title}</h3>
                                <p className="mt-2 whitespace-pre-wrap text-sm leading-7 text-white/75">{post.body}</p>
                                <div className="mt-4 flex items-center justify-between">
                                    <p className="text-xs text-white/45">
                                        {post.user ? `@${post.user.slug} (${post.user.displayName})` : "匿名"}
                                    </p>
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
                            </article>
                        );
                    })}
                </div>
            </div>
        </main>
    );
}
