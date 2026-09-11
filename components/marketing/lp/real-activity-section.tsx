"use client";

import { motion, useReducedMotion } from "framer-motion";
import { TextScramble } from "./text-scramble";
import { ShowcaseCarousel } from "./showcase-carousel";

export function RealActivitySection() {
  const reduce = useReducedMotion();

  return (
    <section id="activity" className="relative overflow-hidden py-20 md:py-28">
      {/* Ambient glow */}
      <div aria-hidden className="pointer-events-none absolute -top-40 left-1/2 h-[500px] w-[800px] -translate-x-1/2 rounded-full bg-[var(--vc-accent)]/[0.04] blur-[150px]" />

      <div className="relative mx-auto max-w-6xl px-4">
        {/* Section header */}
        <motion.div
          initial={reduce ? undefined : { opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.5 }}
          className="mb-12 text-center"
        >
          <p className="font-mono text-[11px] uppercase tracking-[0.3em] text-[var(--vc-accent)]">
            <TextScramble text="REAL ACTIVITY" delay={100} duration={400} />
          </p>
          <h2 className="mt-3 text-balance font-[family-name:var(--font-bebas)] text-4xl font-normal tracking-wide text-white md:text-5xl">
            実際に使うと、こうなる。
          </h2>
          <p className="mx-auto mt-4 max-w-lg text-[13px] leading-relaxed text-white/55">
            活動の記録がプロフィールに残り、参加者と支援者、企業が自然に関わり始める。
            その関わりが、信頼と発信のきっかけになります。
          </p>
        </motion.div>

        {/* Marriott Pattern D: large showcase carousel with pagination dots */}
        <ShowcaseCarousel />
      </div>
    </section>
  );
}
