"use client";

// components/marketing/lp/hero.tsx — Map-first ヒーロー + Product Visual
// framer-motion + reduced-motion対応。

import Link from "next/link";
import { ArrowRight, Building2 } from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { VizMapPreview } from "./viz-map-preview";
import { TextScramble } from "./text-scramble";
import { ActivityCard } from "./activity-card";

const fadeUp = (delay: number) => ({
  initial: { opacity: 0, y: 18 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6, delay, ease: [0.25, 1, 0.5, 1] as const },
});

export function Hero() {
  const reduce = useReducedMotion();
  const anim = reduce ? { initial: { opacity: 1 }, animate: { opacity: 1 }, transition: { duration: 0 } } : undefined;

  return (
    <section id="hero" className="relative isolate overflow-hidden pt-28 pb-16 md:pt-36 md:pb-24">
      {/* 環境光 */}
      <div aria-hidden className="pointer-events-none absolute inset-0">
        <div className="absolute -top-32 left-1/2 h-[420px] w-[720px] -translate-x-1/2 rounded-full blur-[140px]" style={{ background: "rgba(200,232,0,0.07)" }} />
        <div className="absolute bottom-0 right-[10%] h-[380px] w-[380px] rounded-full blur-[150px]" style={{ background: "rgba(60,140,255,0.06)" }} />
      </div>

      <div className="relative mx-auto max-w-6xl px-4 text-center">
        <motion.p
          {...(anim ?? fadeUp(0))}
          className="mx-auto w-fit rounded-full border border-lime/35 bg-lime/[0.07] px-4 py-1.5 font-mono text-[11px] uppercase tracking-[0.22em] text-lime"
        >
          <TextScramble text="SPORTS ACTIVITY, VISIBLE" delay={200} duration={500} />
        </motion.p>

        <motion.h1
          {...(anim ?? fadeUp(0.12))}
          className="mx-auto mt-6 max-w-3xl text-balance font-[family-name:var(--font-bebas)] text-white leading-[1.05] tracking-wide"
          style={{ fontSize: "clamp(2.8rem, 7vw, 5rem)" }}
        >
          積み重ねが、<span className="text-lime">見える</span>。
          <br />
          応援が、<span className="text-lime">届く</span>。
        </motion.h1>

        <motion.p
          {...(anim ?? fadeUp(0.24))}
          className="mx-auto mt-6 max-w-xl text-pretty leading-[1.9] text-white/75"
          style={{ fontSize: "var(--text-body)" }}
        >
          アスリート・トレーナー・ファン・ビジネス。
          スポーツに関わるすべての活動をひとつのマップに。
          <span className="text-white">日々の記録が、あなたの証明になる。</span>
        </motion.p>

        <motion.div
          {...(anim ?? fadeUp(0.36))}
          className="mt-9 flex flex-col items-stretch justify-center gap-3 sm:flex-row sm:items-center"
        >
          <Link
            href="/register"
            className={cn(
              buttonVariants({ size: "lg" }),
              "h-14 w-full px-8 text-base font-black tracking-wide sm:w-auto",
            )}
          >
            Vcに参加する（無料）
            <ArrowRight className="h-5 w-5" />
          </Link>
          <Link
            href="/business"
            className={cn(
              buttonVariants({ size: "lg", variant: "outline" }),
              "h-14 w-full border-white/20 px-8 text-base font-bold text-white hover:border-lime/50 sm:w-auto",
            )}
          >
            <Building2 className="h-5 w-5" />
            企業・スポンサーの方へ
          </Link>
        </motion.div>

        {/* Product Visual: Map + Activity Card */}
        <div className="relative mt-12 md:mt-16">
          {/* Map */}
          <motion.div
            initial={reduce ? { opacity: 1 } : { opacity: 0, y: 28 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: reduce ? 0 : 0.55, ease: [0.25, 1, 0.5, 1] }}
          >
            <VizMapPreview />
          </motion.div>

          {/* Floating Activity Card — desktop only */}
          <motion.div
            initial={reduce ? { opacity: 1 } : { opacity: 0, x: 40, y: -20 }}
            animate={{ opacity: 1, x: 0, y: 0 }}
            transition={{ duration: 0.8, delay: reduce ? 0 : 0.9, ease: [0.25, 1, 0.5, 1] }}
            className="pointer-events-none absolute -right-4 bottom-8 hidden w-[320px] lg:block xl:-right-8 xl:w-[360px]"
          >
            <ActivityCard
              athlete="YUKI TANAKA"
              sport="RUNNING"
              location="YOKOHAMA"
              distance="5.82"
              time="32:41"
              pace="5:37"
              cheers={24}
              comments={12}
              delay={0}
            />
          </motion.div>
        </div>
      </div>
    </section>
  );
}
