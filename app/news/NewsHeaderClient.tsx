"use client";

import { useNewsNotification } from "@/lib/news-client";

export default function NewsHeaderClient() {
    const { hasNew, clearNew } = useNewsNotification();

    return (
        <div className="mb-6 flex items-center justify-between rounded-2xl border border-white/10 bg-white/[0.03] p-4">
            <div>
                <p className="text-[11px] uppercase tracking-[0.2em] text-white/45">News Rooms</p>
                <h1 className="mt-1 text-2xl font-black text-white">最新ニュース</h1>
            </div>
            <button
                type="button"
                onClick={clearNew}
                className="inline-flex items-center gap-2 rounded-full border border-amber-300/30 bg-amber-300/10 px-3 py-1 text-xs font-bold text-amber-300"
            >
                <span className={`h-2 w-2 rounded-full ${hasNew ? "bg-emerald-400" : "bg-white/30"}`} />
                {hasNew ? "新着あり" : "新着なし"}
            </button>
        </div>
    );
}
