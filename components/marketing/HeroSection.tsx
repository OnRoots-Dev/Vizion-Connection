"use client";

import Link from "next/link";
import { useRef } from "react";
import {
  motion,
  useScroll,
  useTransform,
} from "framer-motion";
import { DynamicBackground } from "./DynamicBackground";
import { ProfileCard3DDemo } from "./ProfileCard3DDemo";
import { ViralLoopSection } from "./sections/ViralLoopSection";
import { ChampionPartnerBanner } from "./ChampionPartnerBanner";
import { CTASection } from "./sections/CTASection";

export function HeroSection() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  });

  const scale = useTransform(scrollYProgress, [0, 0.3], [1, 1.1]);
  const opacity = useTransform(scrollYProgress, [0, 0.35], [1, 0]);

  return (
    <section ref={ref} className="relative overflow-hidden">
      <div className="relative flex h-svh w-full flex-col items-center justify-center px-6">
        <DynamicBackground />

        <motion.div
          style={{ scale, opacity }}
          className="relative z-10 flex flex-col items-center text-center"
        >
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="mb-5 inline-flex items-center gap-2 rounded-full px-4 py-1.5"
            style={{ background: "rgba(255,214,0,0.08)", border: "1px solid rgba(255,214,0,0.25)" }}
          >
            <motion.span
              animate={{ opacity: [1, 0.3, 1] }}
              transition={{ duration: 1.5, repeat: Infinity }}
              className="w-1.5 h-1.5 rounded-full flex-shrink-0"
              style={{ background: "#FFD600" }}
            />
            <span className="text-[10px] font-bold tracking-widest uppercase" style={{ color: "#FFD600" }}>
              Founding Member 残り100名 - 登録受付中
            </span>
          </motion.div>

          <div className="mb-6 overflow-hidden">
            <motion.p
              initial={{ y: 30, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
              className="font-display text-[3vw] md:text-[1.2vw] uppercase tracking-[0.6em] text-[#FFD600]"
            >
              スポーツの価値を、自らの手に
            </motion.p>
          </div>

          <h1 className="flex flex-col font-display font-black leading-[0.88] tracking-tighter text-white">
            <motion.span
              initial={{ x: -30, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.8 }}
              className="text-[14vw] md:text-[9vw] text-[#FFD600] uppercase z-[1]"
            >
              活動が、信頼になる。
            </motion.span>
            <motion.span
              initial={{ x: 30, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.4, duration: 0.8 }}
              className="text-[12vw] md:text-[8vw] uppercase"
            >
              信頼が、機会になる。
            </motion.span>
          </h1>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8, duration: 1 }}
            className="mt-4 font-display text-[2.5vw] md:text-[1.3vw] uppercase tracking-[0.2em] text-white/40"
          >
            挑戦するすべての人のPulseを観測・共鳴・支援するネットワーク
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.0, duration: 0.7 }}
            className="mt-8 flex flex-col items-center gap-3 sm:flex-row"
          >
            <Link
              href="/register"
              className="group relative overflow-hidden px-8 py-4 font-display text-[13px] font-black uppercase tracking-[0.18em] text-[#0a0a0a] transition-all hover:opacity-90"
              style={{ background: "var(--electric)", boxShadow: "0 0 28px rgba(0,194,255,0.35)", borderRadius: 2 }}
            >
              今すぐ登録する（無料）
            </Link>
            <Link
              href="/#business"
              className="group flex items-center gap-2 border border-white/20 px-8 py-4 font-display text-[13px] font-black uppercase tracking-[0.18em] text-white/70 transition-all hover:border-white/40 hover:text-white"
              style={{ borderRadius: 2 }}
            >
              Businessプランを見る
              <svg viewBox="0 0 24 24" className="h-3 w-3 fill-current transition-transform group-hover:translate-y-0.5">
                <path d="M7 10l5 5 5-5z" />
              </svg>
            </Link>
          </motion.div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2, duration: 1 }}
          className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-4"
        >
          <span className="font-display text-[10px] uppercase tracking-[0.4em] text-white/30">Scroll Down</span>
          <div className="h-20 w-px overflow-hidden bg-white/10">
            <motion.div
              animate={{ y: [-80, 80] }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
              className="h-full w-full bg-[#FFD600]"
            />
          </div>
        </motion.div>
      </div>

      {/* Champion Partner Banner */}
      <div className="border-t border-white/5 bg-[#0B0B0F] px-5 py-10 md:px-10 lg:px-16 xl:px-20">
        <ChampionPartnerBanner />
      </div>

      <div className="mx-auto w-full max-w-180 px-6 py-32">
        <div className="mb-24">
          <ProfileCard3DDemo />
        </div>

        <ViralLoopSection />
        <CTASection />
      </div>
    </section>
  );
}
