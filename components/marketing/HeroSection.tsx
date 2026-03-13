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

          <h1 className="flex flex-col font-display font-black leading-[0.82] tracking-tighter text-white">
            <motion.span
              initial={{ x: -30, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.8 }}
              className="text-[16vw] md:text-[11vw] text-[#FFD600] uppercase z-[1]"
            >
              Beyond the Limit,
            </motion.span>
            <motion.span
              initial={{ x: 30, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.4, duration: 0.8 }}
              className="text-[14vw] md:text-[10vw] uppercase"
            >
              Connect the Trust.
            </motion.span>
          </h1>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8, duration: 1 }}
            className="mt-2 font-display text-[2.5vw] md:text-[1.3vw] uppercase tracking-[0.3em] text-white/40"
          >
            スポーツの「信頼」を、新しい時代の資産に変える。
          </motion.p>
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
