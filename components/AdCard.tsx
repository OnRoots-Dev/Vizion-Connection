"use client";

import { useEffect, useRef } from "react";
import type { AdItem } from "@/lib/ads-shared";

export type AdSize = "small" | "medium" | "large" | "hero";

export const AD_SIZE_MAP: Record<string, AdSize> = {
    local: "small",
    local_premium: "medium",
    entry: "small",
    starter: "medium",
    impact: "medium",
    prime: "large",
    champion: "large",
    executive: "hero",
    title: "hero",
};

function resolveSize(plan: string, size?: AdSize): AdSize {
    if (size) return size;
    return AD_SIZE_MAP[plan] ?? "medium";
}

interface AdCardProps {
    ad: AdItem;
    size?: AdSize;
    plan?: string;
}

function recordAdEvent(body: { adId: string; eventType: "impression" | "click"; source: string }) {
    const payload = JSON.stringify(body);
    if (typeof navigator !== "undefined" && typeof navigator.sendBeacon === "function") {
        navigator.sendBeacon("/api/ads/events", new Blob([payload], { type: "application/json" }));
        return;
    }

    fetch("/api/ads/events", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: payload,
        keepalive: true,
    }).catch(() => undefined);
}

export default function AdCard({ ad, size, plan }: AdCardProps) {
    const resolvedPlan = plan ?? ad.plan;
    const resolvedSize = size ?? ad.adSize ?? resolveSize(resolvedPlan, size);
    const rootRef = useRef<HTMLElement | null>(null);
    const impressionTrackedRef = useRef(false);

    useEffect(() => {
        const node = rootRef.current;
        if (!node || impressionTrackedRef.current) return;

        const observer = new IntersectionObserver(
            (entries) => {
                const entry = entries[0];
                if (!entry?.isIntersecting || impressionTrackedRef.current) return;
                impressionTrackedRef.current = true;
                recordAdEvent({ adId: ad.id, eventType: "impression", source: "ad_card" });
                observer.disconnect();
            },
            { threshold: 0.45 },
        );

        observer.observe(node);
        return () => observer.disconnect();
    }, [ad.id]);

    const rootClass = (() => {
        if (resolvedSize === "small") return "overflow-hidden rounded-xl border border-amber-300/20 bg-black/40";
        if (resolvedSize === "hero") return "overflow-hidden rounded-2xl border border-amber-300/25 bg-gradient-to-r from-[#18130a] to-[#0b0b10]";
        if (resolvedSize === "large") return "overflow-hidden rounded-2xl border border-amber-300/20 bg-gradient-to-b from-amber-200/8 to-white/[0.02]";
        return "overflow-hidden rounded-2xl border border-amber-300/20 bg-gradient-to-b from-amber-200/10 to-white/[0.02]";
    })();

    const bodyClamp = resolvedSize === "large" ? "line-clamp-3" : "line-clamp-2";

    return (
        <article ref={rootRef} className={rootClass}>
            <div className="flex items-center justify-between border-b border-amber-300/15 px-4 py-2">
                <p className="text-xs font-bold tracking-[0.18em] text-amber-200">SPONSORED</p>
                <span className="rounded-full border border-amber-300/30 bg-amber-300/15 px-2 py-0.5 text-[10px] font-black text-amber-200">
                    PR
                </span>
            </div>

            {resolvedSize === "hero" ? (
                <div className="relative min-h-[180px]">
                    {ad.imageUrl && (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={ad.imageUrl} alt={ad.headline} className="absolute inset-0 h-full w-full object-cover opacity-45" />
                    )}
                    <div className="absolute inset-0 bg-gradient-to-r from-black/80 to-black/30" />
                    <div className="relative z-10 p-5">
                        <h3 className="text-2xl font-black text-white">{ad.headline}</h3>
                        {ad.bodyText && <p className="mt-2 max-w-2xl text-sm leading-7 text-white/85">{ad.bodyText}</p>}
                        {ad.linkUrl && (
                            <a
                                href={ad.linkUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                onClick={() => recordAdEvent({ adId: ad.id, eventType: "click", source: "ad_card" })}
                                className="mt-4 inline-flex rounded-lg border border-amber-300/40 bg-amber-300/20 px-4 py-2 text-sm font-bold text-amber-100"
                            >
                                スポンサー詳細
                            </a>
                        )}
                    </div>
                </div>
            ) : (
                <>
                    {ad.imageUrl && resolvedSize !== "small" && (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={ad.imageUrl} alt={ad.headline} className={resolvedSize === "large" ? "h-52 w-full object-cover" : "h-40 w-full object-cover"} />
                    )}
                    <div className="p-4">
                        <h3 className={resolvedSize === "small" ? "text-sm font-extrabold text-white" : "text-base font-extrabold text-white"}>{ad.headline}</h3>
                        {ad.bodyText && resolvedSize !== "small" && (
                            <p className={`mt-2 text-sm leading-7 text-white/70 ${bodyClamp}`}>{ad.bodyText}</p>
                        )}
                        {ad.linkUrl && (
                            <a
                                href={ad.linkUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                onClick={() => recordAdEvent({ adId: ad.id, eventType: "click", source: "ad_card" })}
                                className="mt-4 inline-flex rounded-lg border border-amber-300/35 bg-amber-300/15 px-3 py-2 text-xs font-bold text-amber-100"
                            >
                                詳細を見る
                            </a>
                        )}
                    </div>
                </>
            )}
        </article>
    );
}
