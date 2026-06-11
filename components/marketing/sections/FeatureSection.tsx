"use client";

import { useRef, type ReactNode } from "react";
import { motion, useInView } from "framer-motion";

// ─── マイクロアニメーション ────────────────────────────────────────────────

function Day0Visual() {
  return (
    <div className="relative flex h-24 items-center justify-center">
      <motion.div
        animate={{ scale: [1, 1.8], opacity: [0.5, 0] }}
        transition={{ duration: 2, repeat: Infinity, ease: "easeOut" }}
        className="absolute h-14 w-14 rounded-full border"
        style={{ borderColor: "var(--flame)" }}
      />
      <motion.div
        animate={{ scale: [1, 1.8], opacity: [0.5, 0] }}
        transition={{ duration: 2, repeat: Infinity, ease: "easeOut", delay: 1 }}
        className="absolute h-14 w-14 rounded-full border"
        style={{ borderColor: "var(--flame)" }}
      />
      <div
        className="flex h-14 w-14 items-center justify-center rounded-full font-display text-[13px] font-black text-white"
        style={{ background: "rgba(255,107,0,0.15)", border: "1.5px solid var(--flame)", boxShadow: "0 0 20px var(--flame-glow)" }}
      >
        DAY 0
      </div>
    </div>
  );
}

function TimelineVisual({ active }: { active: boolean }) {
  return (
    <div className="flex h-24 items-center justify-center">
      <div className="relative h-px w-full max-w-[220px] bg-white/10">
        <motion.div
          initial={{ width: "0%" }}
          animate={active ? { width: "100%" } : {}}
          transition={{ duration: 1.6, ease: "easeInOut" }}
          className="absolute left-0 top-0 h-px"
          style={{ background: "var(--electric)" }}
        />
        {[0, 33, 66, 100].map((left, i) => (
          <motion.span
            key={left}
            initial={{ scale: 0, opacity: 0 }}
            animate={active ? { scale: 1, opacity: 1 } : {}}
            transition={{ delay: 0.3 + i * 0.4, duration: 0.35, ease: "backOut" }}
            className="absolute top-1/2 h-2.5 w-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full"
            style={{ left: `${left}%`, background: "var(--electric)", boxShadow: "0 0 10px var(--electric-glow)" }}
          />
        ))}
      </div>
    </div>
  );
}

function ScoreVisual({ active }: { active: boolean }) {
  return (
    <div className="flex h-24 flex-col items-center justify-center gap-2">
      <div className="flex items-end gap-1.5">
        {[34, 52, 44, 68, 88].map((h, i) => (
          <motion.div
            key={i}
            initial={{ height: 4, opacity: 0.3 }}
            animate={active ? { height: h * 0.6, opacity: 1 } : {}}
            transition={{ delay: 0.2 + i * 0.12, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="w-5 rounded-t-sm"
            style={{
              background: i === 4 ? "var(--electric)" : "rgba(0,194,255,0.25)",
              boxShadow: i === 4 ? "0 0 14px var(--electric-glow)" : "none",
            }}
          />
        ))}
      </div>
    </div>
  );
}

function WarVisual({ active }: { active: boolean }) {
  return (
    <div className="flex h-24 flex-col justify-center gap-3 px-2">
      <div className="flex items-center gap-2">
        <span className="w-8 font-mono text-[9px] text-white/40">YOU</span>
        <div className="h-2 flex-1 overflow-hidden rounded-full bg-white/8">
          <motion.div
            initial={{ width: "0%" }}
            animate={active ? { width: "78%" } : {}}
            transition={{ delay: 0.2, duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
            className="h-full rounded-full"
            style={{ background: "var(--electric)", boxShadow: "0 0 10px var(--electric-glow)" }}
          />
        </div>
      </div>
      <div className="flex items-center gap-2">
        <span className="w-8 font-mono text-[9px] text-white/40">RIVAL</span>
        <div className="h-2 flex-1 overflow-hidden rounded-full bg-white/8">
          <motion.div
            initial={{ width: "0%" }}
            animate={active ? { width: "64%" } : {}}
            transition={{ delay: 0.35, duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
            className="h-full rounded-full"
            style={{ background: "var(--flame)", boxShadow: "0 0 10px var(--flame-glow)" }}
          />
        </div>
      </div>
    </div>
  );
}

// ─── セクション本体 ──────────────────────────────────────────────────────────

const FEATURES: {
  label: string;
  title: string;
  desc: string;
  visual: (active: boolean) => ReactNode;
}[] = [
  {
    label: "Day 0",
    title: "DAY 0宣言",
    desc: "挑戦のはじまりを宣言する。あなたの努力は、その日から記録になる。",
    visual: () => <Day0Visual />,
  },
  {
    label: "Timeline",
    title: "タイムライン",
    desc: "日々の活動が時系列で積み上がる。続けてきた事実が、そのまま証明になる。",
    visual: (active) => <TimelineVisual active={active} />,
  },
  {
    label: "Vizion Score",
    title: "VIZION SCORE",
    desc: "継続・成長・応援をひとつの指標に。あなたの本気度が数字で伝わる。",
    visual: (active) => <ScoreVisual active={active} />,
  },
  {
    label: "War",
    title: "WAR",
    desc: "ライバルと継続を競い合う。負けたくない相手が、続ける理由になる。",
    visual: (active) => <WarVisual active={active} />,
  },
];

export function FeatureSection() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <section ref={ref} className="bg-[#0D0D12] px-5 py-16 md:px-10 md:py-24 lg:px-16">
      <div className="mx-auto max-w-[1200px]">
        <motion.p
          initial={{ opacity: 0, y: 14 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7 }}
          className="mb-3 font-display text-[11px] uppercase tracking-[0.45em]"
          style={{ color: "var(--flame)" }}
        >
          Features
        </motion.p>
        <motion.h2
          initial={{ opacity: 0, y: 14 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 0.1, duration: 0.7 }}
          className="mb-10 font-display text-[clamp(26px,6vw,44px)] font-black tracking-tight text-white"
        >
          続ける力を、武器にする機能。
        </motion.h2>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {FEATURES.map((feature, i) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 24 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: 0.15 + i * 0.1, duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
              className="rounded-2xl border border-white/10 bg-white/[0.03] p-6 md:p-8"
            >
              {feature.visual(inView)}
              <p className="mt-2 font-mono text-[10px] uppercase tracking-[0.3em] text-white/30">{feature.label}</p>
              <h3 className="mt-1.5 font-display text-[22px] font-black text-white">{feature.title}</h3>
              <p className="mt-3 font-body text-[13px] leading-relaxed text-white/50">{feature.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
