"use client";

import { useRef, useState } from "react";
import { motion, useInView, AnimatePresence } from "framer-motion";
import { FAQ_ITEMS } from "../constants";

function FAQItem({ q, a, delay }: { q: string; a: string; delay: number }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-40px" });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 20 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6, delay, ease: [0.16, 1, 0.3, 1] }}
      className="border-b border-white/10"
    >
      <button
        onClick={() => setOpen(o => !o)}
        className="flex w-full items-center justify-between gap-4 py-5 text-left"
      >
        <span className="font-body text-[clamp(13px,1.3vw,16px)] font-semibold leading-snug text-white/85">
          {q}
        </span>
        <motion.span
          animate={{ rotate: open ? 45 : 0 }}
          transition={{ duration: 0.25 }}
          className="flex-shrink-0 text-[#FFD600] text-xl leading-none"
        >
          +
        </motion.span>
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <p className="pb-5 font-body text-[clamp(12px,1.2vw,15px)] leading-relaxed text-white/55">
              {a}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export function FAQSection() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <section ref={ref} className="px-5 py-20 md:px-10 lg:px-16 xl:px-20">
      <div className="mx-auto max-w-215">
        <motion.p
          initial={{ opacity: 0, y: 14 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7 }}
          className="mb-3 font-display text-[11px] uppercase tracking-[0.45em] text-white/30"
        >
          FAQ
        </motion.p>
        <motion.h2
          initial={{ opacity: 0, y: 14 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 0.1, duration: 0.7 }}
          className="mb-10 font-display text-[clamp(28px,3.5vw,44px)] font-black uppercase tracking-tight text-white"
        >
          よくある質問
        </motion.h2>
        <div>
          {FAQ_ITEMS.map((item, i) => (
            <FAQItem key={i} {...item} delay={i * 0.06} />
          ))}
        </div>
        <p className="mt-8 font-body text-[clamp(12px,1.1vw,14px)] text-white/30">
          その他のご質問は{" "}
          <a href="mailto:support@vizion.co" className="text-[#FFD600] underline-offset-2 hover:underline">
            Contact
          </a>{" "}
          ページからお問い合わせください。。
        </p>
      </div>
    </section>
  );
}
