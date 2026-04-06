"use client";

import Image from "next/image";
import { useRef, type ReactNode } from "react";
import { motion, useInView } from "framer-motion";
import { MockupPlaceholder } from "../ui";

// ─── Animated line with optional yellow underline ─────────────────────────────
export function RevealLine({
  children,
  delay = 0,
  accent = false,
}: {
  children: ReactNode;
  delay?: number;
  accent?: boolean;
}) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <div ref={ref} className="overflow-hidden">
      <motion.div
        initial={{ y: "100%", opacity: 0 }}
        animate={inView ? { y: 0, opacity: 1 } : {}}
        transition={{ duration: 0.75, delay, ease: [0.16, 1, 0.3, 1] }}
      >
        <span className="relative inline-block">
          {children}
          {accent && (
            <motion.span
              className="absolute -bottom-1 left-0 h-[2px] bg-[#FFD600]"
              initial={{ width: "0%" }}
              animate={inView ? { width: "100%" } : {}}
              transition={{ duration: 0.6, delay: delay + 0.4, ease: "easeOut" }}
            />
          )}
        </span>
      </motion.div>
    </div>
  );
}

// ─── Feature Card ─────────────────────────────────────────────────────────────
export function FeatureCard({
  label,
  title,
  desc,
  image,
  delay,
}: {
  label: string;
  title: string;
  desc: string;
  image?: string;
  delay: number;
}) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 40 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.7, delay, ease: [0.16, 1, 0.3, 1] }}
      whileHover={{ y: -6, boxShadow: "0 0 32px 4px rgba(255,214,0,0.12)" }}
      className="flex flex-col border border-[#FFD600]/40 p-8 transition-colors hover:border-[#FFD600]/80 md:p-10 xl:p-14"
    >
      <span className="mb-6 font-display text-[11px] uppercase tracking-[0.35em] text-[#FFD600]">
        {label}
      </span>
      <h3 className="mb-6 font-display text-[12vw] font-black uppercase leading-none tracking-tighter text-white md:text-[6vw] lg:text-[4vw]">
        {title}
      </h3>
      {image && (
        <div className="relative mb-6 h-56 w-full overflow-hidden rounded-lg lg:h-60">
          <Image src={image} alt={label} fill sizes="(max-width: 1024px) 100vw, 50vw" className="object-cover" />
        </div>
      )}
      <p className="mt-auto font-body text-[3.5vw] leading-relaxed text-white/50 md:text-[1.8vw] lg:text-[1.05vw]">
        {desc}
      </p>
    </motion.div>
  );
}
