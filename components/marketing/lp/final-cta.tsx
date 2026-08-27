"use client";

// components/marketing/lp/final-cta.tsx — 最終CTA（/register直結）

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { TextScramble } from "./text-scramble";

export function FinalCta() {
  const reduce = useReducedMotion();

  return (
    <section id="join" className="relative scroll-mt-24 overflow-hidden px-4 py-20 md:py-28">
      {/* アクセントの環境光 */}
      <div aria-hidden className="pointer-events-none absolute inset-x-0 bottom-0 mx-auto h-[300px] max-w-3xl rounded-full blur-[130px]" style={{ background: "rgba(200,232,0,0.09)" }} />

      <motion.div
        initial={reduce ? undefined : { opacity: 0, y: 18 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-80px" }}
        transition={{ duration: 0.5 }}
        className="relative mx-auto max-w-2xl text-center"
      >
        <p className="font-mono text-[11px] uppercase tracking-[0.3em] text-lime">
          <TextScramble text="JOIN THE MAP" delay={100} duration={400} />
        </p>
        <h2 className="mt-4 text-balance font-[family-name:var(--font-bebas)] text-4xl font-normal tracking-wide text-white md:text-5xl">
          あなたの一歩を、地図に灯そう。
        </h2>
        <p className="mx-auto mt-5 max-w-md leading-[1.9] text-white/65">
          登録は無料。まずは自分の活動をひとつ、記録してみることから始まります。
        </p>
        <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Link
            href="/register"
            className={cn(buttonVariants({ size: "lg" }), "h-14 w-full px-10 text-base font-black tracking-wide sm:w-auto")}
          >
            無料で登録する
            <ArrowRight className="h-5 w-5" />
          </Link>
          <Link
            href="/business"
            className={cn(
              buttonVariants({ size: "lg", variant: "outline" }),
              "h-14 w-full border-white/20 px-8 font-bold hover:border-lime/50 sm:w-auto",
            )}
          >
            企業の方はこちら
          </Link>
        </div>
      </motion.div>
    </section>
  );
}
