"use client";

import { motion, useReducedMotion } from "framer-motion";
import { ActivityCard } from "./activity-card";
import { CheerCard } from "./cheer-card";
import { ProfileCard } from "./profile-card";
import { TextScramble } from "./text-scramble";

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

        {/* Product showcase grid */}
        <div className="grid items-start gap-6 md:grid-cols-[1fr_auto_1fr] md:gap-8 lg:gap-12">
          {/* Left: Activity + Cheer */}
          <div className="flex flex-col items-center gap-5">
            <ActivityCard delay={0.1} />
            <CheerCard delay={0.25} />
          </div>

          {/* Center: Flow arrows (hidden on mobile) */}
          <div className="hidden items-center md:flex">
            <div className="flex flex-col items-center gap-3">
              <motion.div
                initial={reduce ? undefined : { opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.4 }}
                className="flex flex-col items-center gap-1 text-white/20"
              >
                <span className="text-[9px] font-mono uppercase tracking-wider">Record</span>
                <svg width="16" height="40" viewBox="0 0 16 40" fill="none">
                  <path d="M8 0V36M8 36L2 30M8 36L14 30" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </motion.div>
              <motion.div
                initial={reduce ? undefined : { opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.5 }}
                className="flex flex-col items-center gap-1 text-white/20"
              >
                <span className="text-[9px] font-mono uppercase tracking-wider">Connect</span>
                <svg width="16" height="40" viewBox="0 0 16 40" fill="none">
                  <path d="M8 0V36M8 36L2 30M8 36L14 30" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </motion.div>
              <motion.div
                initial={reduce ? undefined : { opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.6 }}
                className="flex flex-col items-center gap-1 text-white/20"
              >
                <span className="text-[9px] font-mono uppercase tracking-wider">Discover</span>
                <svg width="16" height="40" viewBox="0 0 16 40" fill="none">
                  <path d="M8 0V36M8 36L2 30M8 36L14 30" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </motion.div>
            </div>
          </div>

          {/* Right: Profile */}
          <div className="flex flex-col items-center gap-5">
            <ProfileCard delay={0.2} />

            {/* Stats callout */}
            <motion.div
              initial={reduce ? undefined : { opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ duration: 0.5, delay: 0.35 }}
              className="w-full max-w-[300px] rounded-xl border border-white/10 bg-white/[0.02] p-4"
            >
              <div className="grid grid-cols-3 gap-3 text-center">
                <div>
                  <p className="font-[family-name:var(--font-bebas)] text-2xl leading-none text-[var(--vc-accent)]">12</p>
                  <p className="mt-1 text-[8px] uppercase tracking-wider text-white/30">ACTIVITY</p>
                </div>
                <div>
                  <p className="font-[family-name:var(--font-bebas)] text-2xl leading-none text-white">3</p>
                  <p className="mt-1 text-[8px] uppercase tracking-wider text-white/30">SCHEDULE</p>
                </div>
                <div>
                  <p className="font-[family-name:var(--font-bebas)] text-2xl leading-none text-[var(--vc-accent)]">24</p>
                  <p className="mt-1 text-[8px] uppercase tracking-wider text-white/30">CHEERS</p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}
