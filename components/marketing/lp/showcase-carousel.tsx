"use client";

import { useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { ActivityCard } from "./activity-card";
import { CheerCard } from "./cheer-card";
import { ProfileCard } from "./profile-card";

type SlideKey = "record" | "connect" | "discover";

const SLIDES: { key: SlideKey; kicker: string; title: string; caption: string }[] = [
    {
        key: "record",
        kicker: "RECORD",
        title: "活動を記録する",
        caption: "練習・試合・走る時間を記録すると、プロフィールに「積み重ね」として残ります。",
    },
    {
        key: "connect",
        kicker: "CONNECT",
        title: "応援が、きちんと届く",
        caption: "Cheerとコメントが選手へ届きます。応援も活動として記録に残ります。",
    },
    {
        key: "discover",
        kicker: "DISCOVER",
        title: "存在感が、見える化される",
        caption: "活動と経歴が地図・プロフィールへ反映され、支援者や企業との出会いにつながります。",
    },
];

export function ShowcaseCarousel() {
    const reduce = useReducedMotion();
    const [active, setActive] = useState(0);
    const slide = SLIDES[active];

    function go(next: number) {
        setActive((next + SLIDES.length) % SLIDES.length);
    }

    return (
        <div className="relative mx-auto max-w-4xl">
            {/* Large showcase panel */}
            <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-white/[0.02]">
                <div
                    aria-hidden
                    className="pointer-events-none absolute -top-24 left-1/2 h-[320px] w-[560px] -translate-x-1/2 rounded-full bg-[var(--vc-accent)]/[0.05] blur-[120px]"
                />

                <AnimatePresence mode="wait" initial={false}>
                    <motion.div
                        key={slide.key}
                        initial={reduce ? { opacity: 0 } : { opacity: 0, y: 16 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={reduce ? { opacity: 0 } : { opacity: 0, y: -12 }}
                        transition={{ duration: 0.4, ease: [0.25, 1, 0.5, 1] }}
                        className="relative px-6 py-10 sm:px-10 sm:py-12"
                    >
                        <div className="text-center">
                            <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-[var(--vc-accent)]">
                                {slide.kicker}
                            </p>
                            <h3 className="mt-2 font-[family-name:var(--font-bebas)] text-3xl tracking-wide text-white md:text-4xl">
                                {slide.title}
                            </h3>
                        </div>

                        <div className="mt-8 flex justify-center">
                            {slide.key === "record" && <ActivityCard />}
                            {slide.key === "connect" && <CheerCard />}
                            {slide.key === "discover" && <ProfileCard />}
                        </div>

                        <p className="mx-auto mt-8 max-w-md text-center text-[13px] leading-relaxed text-white/50">
                            {slide.caption}
                        </p>
                    </motion.div>
                </AnimatePresence>
            </div>

            {/* Controls: prev/next + pagination dots */}
            <div className="mt-5 flex items-center justify-center gap-4">
                <button
                    type="button"
                    onClick={() => go(active - 1)}
                    aria-label="前のスライド"
                    className="grid h-9 w-9 place-items-center rounded-full border border-white/10 text-white/50 transition-colors hover:border-white/25 hover:text-white"
                >
                    <ChevronLeft className="h-4 w-4" />
                </button>

                <div className="flex items-center gap-2" role="tablist" aria-label="表示中のスライド">
                    {SLIDES.map((s, i) => {
                        const isActive = i === active;
                        return (
                            <button
                                key={s.key}
                                type="button"
                                role="tab"
                                aria-selected={isActive}
                                aria-label={`${s.title}を見る`}
                                onClick={() => setActive(i)}
                                className="rounded-full transition-all duration-300"
                                style={{
                                    width: isActive ? 26 : 8,
                                    height: 8,
                                    background: isActive ? "var(--vc-accent)" : "rgba(255,255,255,0.22)",
                                    boxShadow: isActive ? "0 0 12px rgba(200,232,0,0.5)" : "none",
                                }}
                            />
                        );
                    })}
                </div>

                <button
                    type="button"
                    onClick={() => go(active + 1)}
                    aria-label="次のスライド"
                    className="grid h-9 w-9 place-items-center rounded-full border border-white/10 text-white/50 transition-colors hover:border-white/25 hover:text-white"
                >
                    <ChevronRight className="h-4 w-4" />
                </button>
            </div>

            <p className="mt-4 text-center font-mono text-[10px] uppercase tracking-[0.2em] text-white/25">
                {String(active + 1).padStart(2, "0")} / {String(SLIDES.length).padStart(2, "0")}
            </p>
        </div>
    );
}