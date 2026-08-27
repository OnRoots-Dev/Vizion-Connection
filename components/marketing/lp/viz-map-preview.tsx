"use client";

// components/marketing/lp/viz-map-preview.tsx
// LP ヒーロー用の Viz Map イメージパネル。実APIを使わず SVG/CSS で
// 「活動が地図上に可視化されていく」状態を表現する（コストゼロ・高速）。

import { motion, useReducedMotion } from "framer-motion";

interface Pin {
  x: number;
  y: number;
  label: string;
  kind: string;
  delay: number;
}

const PINS: Pin[] = [
  { x: 18, y: 30, label: "Practice", kind: "練習", delay: 0.9 },
  { x: 46, y: 62, label: "Match", kind: "試合", delay: 1.15 },
  { x: 70, y: 24, label: "Training", kind: "トレーニング", delay: 1.4 },
  { x: 84, y: 58, label: "Event", kind: "イベント", delay: 1.65 },
];

/** 街路グリッド + 光る活動ピン + クラスタ */
export function VizMapPreview() {
  const reduce = useReducedMotion();

  return (
    <div
      className="relative mx-auto aspect-[16/10] w-full max-w-4xl overflow-hidden rounded-3xl border border-white/10"
      style={{ background: "#0a0a12" }}
      role="img"
      aria-label="暗い地図の上に活動のピンが灯っていくイメージ"
    >
      {/* 街路グリッド */}
      <div
        aria-hidden
        className="absolute inset-0 opacity-60"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.05) 1px, transparent 1px)," +
            "linear-gradient(90deg, rgba(255,255,255,0.05) 1px, transparent 1px)," +
            "linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px)," +
            "linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)",
          backgroundSize: "120px 120px, 120px 120px, 24px 24px, 24px 24px",
        }}
      />
      {/* 主要道 */}
      <div aria-hidden className="absolute left-0 right-0 top-[38%] h-px bg-white/10" />
      <div aria-hidden className="absolute bottom-[28%] left-0 right-0 h-[2px] -rotate-1 bg-white/[0.07]" />
      <div aria-hidden className="absolute bottom-0 left-[32%] top-0 w-px bg-white/10" />
      <div aria-hidden className="absolute bottom-0 right-[22%] top-0 w-[2px] rotate-2 bg-white/[0.06]" />
      {/* 河川風の曲線 */}
      <svg aria-hidden className="absolute inset-0 h-full w-full" viewBox="0 0 800 500" preserveAspectRatio="none">
        <path d="M-20 420 C 180 380, 260 460, 430 400 S 720 340, 820 380" fill="none" stroke="#123d42" strokeWidth="26" strokeLinecap="round" opacity="0.85" />
      </svg>

      {/* クラスタ（集合ピン） */}
      <motion.div
        initial={reduce ? { opacity: 0 } : { opacity: 0, scale: 0.6 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: reduce ? 0 : 0.7, duration: 0.5 }}
        className="absolute left-[52%] top-[38%] z-10 -translate-x-1/2 -translate-y-1/2"
      >
        <span className="relative grid h-14 w-14 place-items-center rounded-full font-display text-lg text-black" style={{ background: "var(--vc-accent)", boxShadow: "var(--vc-glow-strong)" }}>
          12
          {!reduce && (
            <span aria-hidden className="absolute inset-0 rounded-full border border-lime/60" style={{ animation: "vcRing 2.4s ease-out infinite" }} />
          )}
        </span>
      </motion.div>

      {/* 活動ピン */}
      {PINS.map((pin) => (
        <motion.div
          key={pin.label}
          initial={reduce ? { opacity: 0 } : { opacity: 0, scale: 0, y: -8 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={reduce ? { duration: 0.3, delay: pin.delay } : { type: "spring", stiffness: 320, damping: 20, delay: pin.delay }}
          className="absolute z-10 flex -translate-x-1/2 -translate-y-full flex-col items-center"
          style={{ left: `${pin.x}%`, top: `${pin.y}%` }}
        >
          <span
            className="whitespace-nowrap rounded-md px-2 py-0.5 font-mono text-[10px] tracking-wide"
            style={{ background: "rgba(10,10,18,0.85)", color: "var(--vc-text-secondary)", border: "1px solid rgba(255,255,255,0.12)" }}
          >
            {pin.kind}
          </span>
          <span aria-hidden className="my-1 block h-3 w-px bg-white/25" />
          <span
            className="block h-3.5 w-3.5 rounded-full border-2 border-white"
            style={{ background: "var(--vc-accent)", boxShadow: "0 0 12px rgba(200,232,0,0.55)" }}
          />
        </motion.div>
      ))}

      {/* 左上のHUDラベル */}
      <motion.div
        initial={reduce ? { opacity: 0 } : { opacity: 0, y: -6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.35 }}
        className="absolute left-4 top-4 z-10 rounded-full border border-lime/40 bg-black/60 px-3 py-1 font-mono text-[10px] tracking-[0.18em] text-lime backdrop-blur"
      >
        VIZ MAP · LIVE
      </motion.div>
      {/* 右下の凡例 */}
      <div className="absolute bottom-3 right-4 z-10 flex gap-3 font-mono text-[9px] uppercase tracking-[0.14em] text-white/45">
        <span>● Activity</span>
        <span className="text-lime">◉ Cluster</span>
      </div>
    </div>
  );
}
