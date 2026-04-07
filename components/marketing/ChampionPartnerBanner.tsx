"use client";

import Link from "next/link";
import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { CHAMPION_SLOTS } from "./constants";

export function ChampionPartnerBanner() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-40px" });

  return (
    <div ref={ref} className="mx-auto max-w-[1200px]">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={inView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.6 }}
        className="mb-4 flex items-center justify-between"
      >
        <div className="flex items-center gap-2">
          <div className="h-[2px] w-5 bg-[#FF4646]/60" />
          <p className="font-mono text-[9px] uppercase tracking-[0.45em] text-white/25">
            Legacy Partner <span className="text-[#FF4646]/60">- Top Sponsor</span>
          </p>
        </div>
        <span className="rounded-[2px] border border-[#FF4646]/25 px-2 py-0.5 font-mono text-[8px] uppercase tracking-wider text-[#FF4646]/50">
          最上位枠 · 全5枠
        </span>
      </motion.div>

      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-5">
        {CHAMPION_SLOTS.map((slot, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 14 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: i * 0.07, duration: 0.55 }}
          >
            {slot.filled ? (
              <div className="relative flex h-[72px] items-center justify-center overflow-hidden rounded-[3px] border border-[#FF4646]/30 bg-gradient-to-br from-[#FF4646]/[0.08] to-transparent">
                <div className="pointer-events-none absolute left-0 top-0 h-3 w-3 border-l-[2px] border-t-[2px] border-[#FF4646]/50" />
                <div className="pointer-events-none absolute right-0 top-0 h-3 w-3 border-r-[2px] border-t-[2px] border-[#FF4646]/50" />
                <div className="pointer-events-none absolute bottom-0 left-0 h-3 w-3 border-b-[2px] border-l-[2px] border-[#FF4646]/50" />
                <div className="pointer-events-none absolute bottom-0 right-0 h-3 w-3 border-b-[2px] border-r-[2px] border-[#FF4646]/50" />
                {slot.logo ? (
                  <img src={slot.logo} alt={slot.name} className="max-h-[36px] max-w-[80%] object-contain opacity-80" />
                ) : (
                  <p className="font-display text-[11px] uppercase tracking-wider text-white/60">{slot.name}</p>
                )}
              </div>
            ) : (
              <Link
                href="/business"
                className="group relative flex h-[72px] flex-col items-center justify-center gap-1 overflow-hidden rounded-[3px] border border-dashed border-white/10 bg-white/[0.015] transition-all duration-300 hover:border-[#FF4646]/40 hover:bg-[#FF4646]/[0.04]"
              >
                <div className="pointer-events-none absolute left-0 top-0 h-3 w-3 border-l-[1px] border-t-[1px] border-white/10 transition-colors group-hover:border-[#FF4646]/50" />
                <div className="pointer-events-none absolute right-0 top-0 h-3 w-3 border-r-[1px] border-t-[1px] border-white/10 transition-colors group-hover:border-[#FF4646]/50" />
                <div className="pointer-events-none absolute bottom-0 left-0 h-3 w-3 border-b-[1px] border-l-[1px] border-white/10 transition-colors group-hover:border-[#FF4646]/50" />
                <div className="pointer-events-none absolute bottom-0 right-0 h-3 w-3 border-b-[1px] border-r-[1px] border-white/10 transition-colors group-hover:border-[#FF4646]/50" />
                <span className="font-display text-[9px] uppercase tracking-[0.35em] text-white/15 transition-colors group-hover:text-[#FF4646]/50">
                  Slot {i + 1}
                </span>
                <span className="flex items-center gap-1 font-mono text-[8px] uppercase tracking-wider text-white/10 transition-colors group-hover:text-[#FF4646]/60">
                  <svg viewBox="0 0 24 24" className="h-2.5 w-2.5 fill-current">
                    <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z" />
                  </svg>
                  Legacy枠を確認する
                </span>
              </Link>
            )}
          </motion.div>
        ))}
      </div>

      {CHAMPION_SLOTS.some(s => !s.filled) && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={inView ? { opacity: 1 } : {}}
          transition={{ delay: 0.5, duration: 0.6 }}
          className="mt-3 text-right font-mono text-[9px] uppercase tracking-wider text-white/15"
        >
          残り {CHAMPION_SLOTS.filter(s => !s.filled).length} 枠 · <Link href="/business" className="text-[#FF4646]/40 hover:text-[#FF4646]/70 transition-colors">詳細を見る →</Link>
        </motion.p>
      )}
    </div>
  );
}
