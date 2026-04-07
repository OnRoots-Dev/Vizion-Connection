"use client";

import Link from "next/link";
import { useRef, useState, useEffect } from "react";
import { motion, useInView, AnimatePresence } from "framer-motion";

// ─── CTA Section ──────────────────────────────────────────────────────────────
export function CTASection() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <section
      ref={ref}
      className="flex min-h-[80vh] flex-col items-center justify-center gap-7 px-6 py-24 text-center"
    >
      <motion.p
        initial={{ opacity: 0, y: 20 }}
        animate={inView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.7 }}
        className="font-display text-[clamp(12px,1.1vw,14px)] uppercase tracking-[0.4em] text-white/30"
      >
        登録受付中
      </motion.p>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={inView ? { opacity: 1, y: 0 } : {}}
        transition={{ delay: 0.15, duration: 0.7 }}
        whileHover={{ scale: 1.03 }}
        whileTap={{ scale: 0.98 }}
      >
        <Link
          href="/register"
          className="group relative block overflow-hidden bg-[#FFD600] px-10 py-5 font-display text-[clamp(22px,2.2vw,32px)] font-black uppercase tracking-tight text-[#0B0B0F]"
        >
          <motion.span
            className="pointer-events-none absolute inset-0 bg-white"
            initial={{ opacity: 0, scale: 0.5 }}
            whileHover={{ opacity: 0.15, scale: 2 }}
            transition={{ duration: 0.4 }}
          />
          <span className="relative">今すぐ登録する</span>
        </Link>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={inView ? { opacity: 1, y: 0 } : {}}
        transition={{ delay: 0.28, duration: 0.7 }}
        whileHover={{ scale: 1.02 }}
      >
        <Link
          href="/business"
          className="group relative flex items-center gap-3 overflow-hidden border border-white/20 bg-white/[0.04] px-8 py-4 font-display text-[clamp(14px,1.3vw,18px)] font-black uppercase tracking-widest text-white/70 transition-all hover:border-[#3282FF]/70 hover:bg-[#3282FF]/10 hover:text-white"
          style={{ borderRadius: "2px" }}
        >
          <motion.span
            className="pointer-events-none absolute inset-0"
            style={{ background: "linear-gradient(105deg, transparent 40%, rgba(50,130,255,0.08) 100%)" }}
          />
          <svg viewBox="0 0 24 24" className="h-4 w-4 fill-current text-[#3282FF] transition-transform group-hover:scale-110">
            <path d="M20 6h-2.18c.07-.44.18-.86.18-1a3 3 0 00-6 0c0 .14.11.56.18 1H10C8.9 6 8 6.9 8 8v12c0 1.1.9 2 2 2h10c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2zm-6-2a1 1 0 011 1c0 .28-.06.54-.13.79L14 6h-.54l-.33-.21c-.07-.25-.13-.51-.13-.79a1 1 0 011-1zm6 16H10V8h2v2h4V8h2v12z" />
          </svg>
          <span className="relative">Businessアカウントとしてポジションを確保する</span>
          <svg viewBox="0 0 24 24" className="h-3.5 w-3.5 fill-current transition-transform group-hover:translate-x-1 text-white/40">
            <path d="M13.22 19.03a.75.75 0 010-1.06L18.19 13H3.75a.75.75 0 010-1.5h14.44l-4.97-4.97a.75.75 0 011.06-1.06l6.25 6.25a.75.75 0 010 1.06l-6.25 6.25a.75.75 0 01-1.06 0z" />
          </svg>
          <span className="pointer-events-none absolute bottom-0 left-0 h-[1px] w-0 bg-[#3282FF] transition-all duration-300 group-hover:w-full" />
        </Link>
      </motion.div>

      <motion.p
        initial={{ opacity: 0 }}
        animate={inView ? { opacity: 1 } : {}}
        transition={{ delay: 0.38, duration: 0.7 }}
        className="mt-1 font-mono text-[10px] uppercase tracking-[0.3em] text-white/30"
      >
        ↑ 企業・チーム・スポンサーの方はこちら ↑
      </motion.p>

      <div className="max-w-[680px] border border-[#FFD600]/20 bg-white/[0.02] px-8 py-6">
        <p className="font-body text-[16px] font-bold uppercase tracking-[0.2em] text-[#FFD600]">
          Founding Member 残り100名
        </p>
        <p className="mt-2 font-display text-[24px] font-bold text-white/80">
          登録は無料。今すぐ参加できます。
        </p>
        <p className="mt-3 text-[12px] leading-relaxed text-white/35">
          登録後すぐにプロフィール作成・公開、Discovery、Cheer、ミッション、Business Hub など現在稼働中の機能をご利用いただけます。
        </p>
      </div>
    </section>
  );
}

// ─── Floating CTA ─────────────────────────────────────────────────────────────
export function FloatingCTA() {
  const [visible, setVisible] = useState(false);
  const [isFooterInView, setIsFooterInView] = useState(false);

  useEffect(() => {
    const onScroll = () => {
      const show = window.scrollY > 500 && !isFooterInView;
      setVisible(show);
    };

    const observer = new IntersectionObserver(
      ([entry]) => { setIsFooterInView(entry.isIntersecting); },
      { threshold: 0.1 }
    );

    const footer = document.querySelector("footer");
    if (footer) observer.observe(footer);

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      if (footer) observer.unobserve(footer);
    };
  }, [isFooterInView]);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ y: 80, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 80, opacity: 0 }}
          transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
          style={{ position: "fixed", bottom: 20, left: 16, right: 16, zIndex: 50, display: "flex", justifyContent: "center" }}
        >
          <Link
            href="/register"
            className="group flex items-center justify-center gap-3 overflow-hidden bg-[#FFD600] px-7 py-3.5 font-display text-[13px] font-black uppercase tracking-[0.18em] text-[#0B0B0F] shadow-[0_8px_40px_rgba(255,214,0,0.35)] transition-all hover:bg-white w-full"
            style={{ borderRadius: "2px", maxWidth: 360 }}
          >
            <span>今すぐ登録する</span>
            <svg viewBox="0 0 24 24" className="h-3.5 w-3.5 fill-current transition-transform group-hover:translate-x-1">
              <path d="M13.22 19.03a.75.75 0 010-1.06L18.19 13H3.75a.75.75 0 010-1.5h14.44l-4.97-4.97a.75.75 0 011.06-1.06l6.25 6.25a.75.75 0 010 1.06l-6.25 6.25a.75.75 0 01-1.06 0z" />
            </svg>
          </Link>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
