"use client";

import Link from "next/link";
import { useRef, useState, useEffect } from "react";
import { motion, useInView, AnimatePresence } from "framer-motion";

const ROLE_LINKS = [
  { role: "Athlete", label: "アスリート", color: "#FF5050" },
  { role: "Trainer", label: "トレーナー", color: "#32D278" },
  { role: "Crew", label: "サポーター", color: "#FFC81E" },
  { role: "Business", label: "ビジネス", color: "#3C8CFF" },
];

// ─── CTA Section ──────────────────────────────────────────────────────────────
export function CTASection() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <section
      ref={ref}
      className="flex flex-col items-center justify-center gap-8 px-5 py-24 text-center md:py-32"
    >
      <motion.p
        initial={{ opacity: 0, y: 20 }}
        animate={inView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.7 }}
        className="font-display text-[11px] uppercase tracking-[0.4em] text-white/30"
      >
        Join Vizion Connection
      </motion.p>

      <motion.h2
        initial={{ opacity: 0, y: 20 }}
        animate={inView ? { opacity: 1, y: 0 } : {}}
        transition={{ delay: 0.1, duration: 0.7 }}
        className="font-display text-[clamp(28px,7vw,52px)] font-black tracking-tight text-white"
      >
        あなたの挑戦を、
        <br className="sm:hidden" />
        ここから。
      </motion.h2>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={inView ? { opacity: 1, y: 0 } : {}}
        transition={{ delay: 0.2, duration: 0.7 }}
        whileHover={{ scale: 1.03 }}
        whileTap={{ scale: 0.98 }}
      >
        <Link
          href="/register"
          className="block rounded-xl px-12 py-5 font-display text-[clamp(18px,4.5vw,24px)] font-black tracking-[0.08em] text-white"
          style={{ background: "var(--electric)", boxShadow: "0 0 40px var(--electric-glow)" }}
        >
          今すぐ始める
        </Link>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={inView ? { opacity: 1, y: 0 } : {}}
        transition={{ delay: 0.35, duration: 0.7 }}
        className="w-full max-w-[560px]"
      >
        <p className="mb-3 font-mono text-[10px] uppercase tracking-[0.3em] text-white/30">
          ロールを選んで登録
        </p>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          {ROLE_LINKS.map((r) => (
            <Link
              key={r.role}
              href={`/register?role=${r.role}`}
              className="rounded-xl border px-3 py-3.5 font-display text-[12px] font-bold tracking-wide transition-all hover:scale-[1.03]"
              style={{
                borderColor: `${r.color}45`,
                background: `${r.color}10`,
                color: r.color,
              }}
            >
              {r.label}
            </Link>
          ))}
        </div>
      </motion.div>

      <motion.p
        initial={{ opacity: 0 }}
        animate={inView ? { opacity: 1 } : {}}
        transition={{ delay: 0.5, duration: 0.7 }}
        className="text-[11px] tracking-wide text-white/30"
      >
        登録は無料。1分で完了します。
      </motion.p>
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
            className="group flex w-full items-center justify-center gap-3 rounded-xl px-7 py-3.5 font-display text-[13px] font-black uppercase tracking-[0.18em] text-white transition-all hover:opacity-90"
            style={{ maxWidth: 360, background: "var(--electric)", boxShadow: "0 8px 40px var(--electric-glow)" }}
          >
            <span>無料で始める</span>
            <svg viewBox="0 0 24 24" className="h-3.5 w-3.5 fill-current transition-transform group-hover:translate-x-1">
              <path d="M13.22 19.03a.75.75 0 010-1.06L18.19 13H3.75a.75.75 0 010-1.5h14.44l-4.97-4.97a.75.75 0 011.06-1.06l6.25 6.25a.75.75 0 010 1.06l-6.25 6.25a.75.75 0 01-1.06 0z" />
          </svg>
          </Link>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
