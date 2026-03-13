// components/CountdownBanner.tsx

"use client";

import { useEffect, useState } from "react";

interface Props {
    targetTime: string; // "2026-03-11T12:00:00+09:00"
    label: string;      // "先行登録まで"
    expiredMessage: string; // "登録受付中"
}

export function CountdownBanner({ targetTime, label, expiredMessage }: Props) {
    const [timeLeft, setTimeLeft] = useState<{
        hours: number;
        minutes: number;
        seconds: number;
    } | null>(null);
    const [expired, setExpired] = useState(false);

    useEffect(() => {
        const target = new Date(targetTime).getTime();

        function update() {
            const diff = target - Date.now();
            if (diff <= 0) {
                setExpired(true);
                setTimeLeft(null);
                return;
            }
            const hours = Math.floor(diff / (1000 * 60 * 60));
            const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
            const seconds = Math.floor((diff % (1000 * 60)) / 1000);
            setTimeLeft({ hours, minutes, seconds });
        }

        update();
        const id = setInterval(update, 1000);
        return () => clearInterval(id);
    }, [targetTime]);

    if (expired) {
        return (
            <div className="w-full bg-violet-600/20 border-b border-violet-500/30 px-4 py-2 text-center">
                <p className="text-sm font-semibold text-violet-400">{expiredMessage}</p>
            </div>
        );
    }

    if (!timeLeft) return null;

    const pad = (n: number) => String(n).padStart(2, "0");

    return (
        <div className="w-full bg-[#0d0d0d] border-b border-[#1e1e1e] px-4 py-2">
            <div className="max-w-3xl mx-auto flex items-center justify-center gap-3">
                <span className="text-xs text-gray-500">{label}</span>
                <div className="flex items-center gap-1 font-mono">
                    <span className="bg-[#1a1a1a] border border-[#2a2a2a] text-white text-sm font-bold px-2 py-0.5 rounded">
                        {pad(timeLeft.hours)}
                    </span>
                    <span className="text-gray-600 text-sm">:</span>
                    <span className="bg-[#1a1a1a] border border-[#2a2a2a] text-white text-sm font-bold px-2 py-0.5 rounded">
                        {pad(timeLeft.minutes)}
                    </span>
                    <span className="text-gray-600 text-sm">:</span>
                    <span className="bg-[#1a1a1a] border border-[#2a2a2a] text-white text-sm font-bold px-2 py-0.5 rounded">
                        {pad(timeLeft.seconds)}
                    </span>
                </div>
                <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
            </div>
        </div>
    );
}