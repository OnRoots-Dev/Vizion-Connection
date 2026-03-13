// components/CheerButton.tsx
"use client";

import { useState } from "react";

export default function CheerButton({ toSlug }: { toSlug: string }) {
    const [loading, setLoading] = useState(false);
    const [done, setDone] = useState(false);
    const [error, setError] = useState("");

    const handle = async () => {
        setLoading(true);
        setError("");

        try {
            const res = await fetch("/api/cheer", {
                method: "POST",
                body: JSON.stringify({ toSlug }),
                headers: { "Content-Type": "application/json" },
            });

            if (!res.ok) throw new Error("Cheer failed");

            setDone(true);
        } catch (e: any) {
            setError(e.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex flex-col gap-1">
            <button
                disabled={loading || done}
                onClick={handle}
                className="rounded-full bg-emerald-400 px-4 py-2 text-sm font-semibold text-slate-900 shadow-md transition hover:bg-emerald-300 disabled:opacity-60 active:translate-y-[1px]"
            >
                {done ? "Cheered!" : loading ? "Cheering…" : "Cheer！(+1)"}
            </button>
            {error && <p className="text-xs text-red-400">{error}</p>}
        </div>
    );
}
