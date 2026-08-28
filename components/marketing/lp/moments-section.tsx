"use client";

import { motion, useReducedMotion } from "framer-motion";
import { CheerCard } from "./cheer-card";
import { TextScramble } from "./text-scramble";

export function MomentsSection() {
  const reduce = useReducedMotion();

  return (
    <section id="moments" className="relative overflow-hidden py-20 md:py-28">
      {/* Ambient glow */}
      <div aria-hidden className="pointer-events-none absolute bottom-0 left-1/4 h-[400px] w-[600px] -translate-x-1/2 rounded-full bg-[var(--vc-accent)]/[0.03] blur-[130px]" />

      <div className="relative mx-auto max-w-5xl px-4">
        <motion.div
          initial={reduce ? undefined : { opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.5 }}
          className="mb-12 text-center"
        >
          <p className="font-mono text-[11px] uppercase tracking-[0.3em] text-[var(--vc-accent)]">
            <TextScramble text="CONNECTION" delay={100} duration={400} />
          </p>
          <h2 className="mt-3 text-balance font-[family-name:var(--font-bebas)] text-4xl font-normal tracking-wide text-white md:text-5xl">
            人と人が、つながる。
          </h2>
          <p className="mx-auto mt-4 max-w-lg text-[13px] leading-relaxed text-white/55">
            応援はその場の反応ではなく、活動への参加と信頼のきっかけとして残る。
            その声が、次の関わりや発信につながる。
          </p>
        </motion.div>

        <div className="flex flex-col items-center gap-4 sm:flex-row sm:items-start sm:justify-center sm:gap-6">
          <CheerCard
            name="SATO YUKI"
            role="Athlete"
            message="今週の練習の内容が伝わってくる。良い変化を感じる。"
            timeAgo="30min"
            delay={0.1}
          />
          <CheerCard
            name="WATANABE AKI"
            role="Trainer"
            message="次のセッションに向けて、計画がしっかり見えてる。"
            timeAgo="2h"
            delay={0.2}
          />
          <CheerCard
            name="KATO RYO"
            role="Crew"
            message="プロフィール更新の意図が伝わってきて、応援しやすい。"
            timeAgo="5h"
            delay={0.3}
          />
        </div>
      </div>
    </section>
  );
}
