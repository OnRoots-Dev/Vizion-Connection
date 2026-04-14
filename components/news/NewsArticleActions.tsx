"use client";

import { useState } from "react";

export function NewsArticleActions({
    postId,
    initialCheerCount,
    title,
}: {
    postId: string;
    initialCheerCount: number;
    title: string;
}) {
    const [cheerCount, setCheerCount] = useState(initialCheerCount);
    const [cheering, setCheering] = useState(false);
    const [copied, setCopied] = useState(false);

    async function handleCheer() {
        if (cheering) return;
        setCheering(true);
        setCheerCount((prev) => prev + 1);

        try {
            const res = await fetch("/api/news/cheer", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ postId }),
            });
            const data = await res.json().catch(() => ({}));
            if (!res.ok || typeof data.cheerCount !== "number") {
                setCheerCount((prev) => Math.max(0, prev - 1));
                return;
            }
            setCheerCount(data.cheerCount);
        } catch {
            setCheerCount((prev) => Math.max(0, prev - 1));
        } finally {
            setCheering(false);
        }
    }

    async function handleShare() {
        const url = window.location.href;
        const text = `${title} | News Rooms`;
        try {
            if (navigator.share) {
                await navigator.share({ title: text, url });
            } else {
                await navigator.clipboard.writeText(url);
                setCopied(true);
                window.setTimeout(() => setCopied(false), 1800);
            }
        } catch {
            // noop
        }
    }

    return (
        <div className="flex flex-wrap items-center gap-3">
            <button
                type="button"
                onClick={handleCheer}
                className="inline-flex items-center gap-2 rounded-full bg-rose-600 px-4 py-2 text-sm font-bold text-white transition hover:bg-rose-700 disabled:cursor-not-allowed disabled:opacity-70"
                disabled={cheering}
            >
                <span>Cheer</span>
                <span>{cheerCount.toLocaleString()}</span>
            </button>
            <button
                type="button"
                onClick={handleShare}
                className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-bold text-slate-700 transition hover:bg-slate-50"
            >
                <span>{copied ? "Copied" : "Share"}</span>
            </button>
        </div>
    );
}
