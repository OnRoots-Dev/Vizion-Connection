"use client";

import Link from "next/link";
import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { HeroLottie } from "./HeroLottie";

export function HeroSection() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  });

  const scale = useTransform(scrollYProgress, [0, 0.3], [1, 1.06]);
  const opacity = useTransform(scrollYProgress, [0, 0.35], [1, 0]);

  return (
    <section ref={ref} className="relative flex min-h-svh w-full flex-col items-center justify-center overflow-hidden px-5">
      <motion.div
        style={{ scale, opacity }}
        className="relative z-10 flex w-full max-w-[680px] flex-col items-center text-center"
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.92 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
          className="pointer-events-none -mb-4 w-[200px] sm:w-[240px] md:w-[280px]"
        >
          <HeroLottie className="h-auto w-full" />
        </motion.div>

        <h1 className="flex flex-col font-display font-black leading-[1.1] tracking-tight text-white">
          <span className="overflow-hidden">
            <motion.span
              initial={{ y: "100%", opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
              className="block text-[clamp(34px,9vw,64px)]"
            >
              本物の努力に、
            </motion.span>
          </span>
          <span className="overflow-hidden">
            <motion.span
              initial={{ y: "100%", opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.38, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
              className="block bg-clip-text text-[clamp(34px,9vw,64px)] text-transparent"
              style={{ backgroundImage: "linear-gradient(100deg, var(--electric) 10%, var(--flame) 90%)" }}
            >
              居場所を。
            </motion.span>
          </span>
        </h1>

        <motion.p
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7, duration: 0.8 }}
          className="mt-5 font-body text-[clamp(13px,3.6vw,16px)] leading-relaxed text-white/55"
        >
          アスリートの継続と成長を可視化する、
          <br className="sm:hidden" />
          スポーツ信頼プラットフォーム
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.95, duration: 0.7 }}
          className="mt-9 flex w-full flex-col items-center gap-3"
        >
          <Link
            href="/register"
            className="w-full max-w-[320px] rounded-xl px-8 py-4 text-center font-display text-[15px] font-black tracking-[0.12em] text-white transition-all hover:opacity-90 active:scale-[0.98]"
            style={{ background: "var(--electric)", boxShadow: "0 0 32px var(--electric-glow)" }}
          >
            無料で始める
          </Link>
          <p className="text-[11px] tracking-wide text-white/30">登録は1分で完了します</p>
        </motion.div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.3, duration: 1 }}
        className="absolute bottom-8 left-1/2 flex -translate-x-1/2 flex-col items-center gap-3"
      >
        <span className="font-display text-[10px] uppercase tracking-[0.4em] text-white/30">Scroll</span>
        <div className="h-14 w-px overflow-hidden bg-white/10">
          <motion.div
            animate={{ y: [-56, 56] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            className="h-full w-full"
            style={{ background: "var(--electric)" }}
          />
        </div>
      </motion.div>
    </section>
  );
}
