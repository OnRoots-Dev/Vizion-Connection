"use client";

import { motion, useReducedMotion } from "framer-motion";
import { Heart, MessageCircle, Share2 } from "lucide-react";

interface CheerCardProps {
  name?: string;
  role?: string;
  message?: string;
  timeAgo?: string;
  delay?: number;
}

export function CheerCard({
  name = "SATO YUKI",
  role = "Athlete",
  message = "いい走りだった！次のレースも期待してる",
  timeAgo = "30min",
  delay = 0,
}: CheerCardProps) {
  const reduce = useReducedMotion();

  return (
    <motion.div
      initial={reduce ? undefined : { opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.5, delay, ease: [0.25, 1, 0.5, 1] as const }}
      className="w-full max-w-[320px] rounded-xl border border-white/10 bg-white/[0.03] p-4"
    >
      <div className="flex items-center gap-2.5">
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[var(--vc-accent)]/10 text-[10px] font-bold text-[var(--vc-accent)]">
          {name.charAt(0)}
        </div>
        <div>
          <p className="text-[11px] font-bold text-white/90">{name}</p>
          <p className="text-[9px] uppercase tracking-wider text-[var(--vc-accent)]">{role}</p>
        </div>
        <span className="ml-auto text-[9px] text-white/30">{timeAgo}</span>
      </div>
      <p className="mt-2.5 text-[12px] leading-relaxed text-white/60">{message}</p>
      <div className="mt-3 flex items-center gap-3 border-t border-white/[0.06] pt-2.5">
        <button type="button" className="flex items-center gap-1 text-[10px] text-white/40 transition-colors hover:text-[var(--vc-accent)]">
          <Heart className="h-3 w-3" /> 18
        </button>
        <button type="button" className="flex items-center gap-1 text-[10px] text-white/40 transition-colors hover:text-white/70">
          <MessageCircle className="h-3 w-3" /> Reply
        </button>
        <button type="button" className="ml-auto text-[10px] text-white/40 transition-colors hover:text-white/70">
          <Share2 className="h-3 w-3" />
        </button>
      </div>
    </motion.div>
  );
}
