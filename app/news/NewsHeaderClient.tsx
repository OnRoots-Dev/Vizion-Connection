"use client";

import { useNewsNotification } from "@/lib/news-client";

export default function NewsHeaderClient() {
    const { hasNew, clearNew } = useNewsNotification();

    return (
        <div className="mb-6 flex items-center justify-between rounded-[24px] border border-slate-200 bg-white p-5 shadow-[0_14px_40px_rgba(15,23,42,0.06)]">
            <div>
                <p className="text-[11px] uppercase tracking-[0.2em] text-slate-500">News Rooms</p>
                <h1 className="mt-1 text-2xl font-black text-slate-950">最新ニュース</h1>
            </div>
            <button
                type="button"
                onClick={clearNew}
                className="inline-flex items-center gap-2 rounded-full border border-red-200 bg-red-50 px-3 py-1 text-xs font-bold text-red-600"
            >
                <span className={`h-2 w-2 rounded-full ${hasNew ? "bg-emerald-500" : "bg-slate-300"}`} />
                {hasNew ? "新着あり" : "新着なし"}
            </button>
        </div>
    );
}
