"use client";

// components/marketing/lp/viz-map-preview.tsx
// LP ヒーロー用の Viz Map イメージパネル。
// ダークモード街地図 + 活動ピン + クラスタ。reduce-motion対応。

import { motion, useReducedMotion } from "framer-motion";

interface Pin {
  x: number;
  y: number;
  label: string;
  kind: string;
  delay: number;
}

const PINS: Pin[] = [
  { x: 22, y: 35, label: "Practice", kind: "練習", delay: 0.9 },
  { x: 48, y: 58, label: "Match", kind: "試合", delay: 1.15 },
  { x: 72, y: 28, label: "Training", kind: "トレーニング", delay: 1.4 },
  { x: 85, y: 52, label: "Event", kind: "イベント", delay: 1.65 },
];

export function VizMapPreview() {
  const reduce = useReducedMotion();

  return (
    <div
      className="relative mx-auto aspect-[16/10] w-full max-w-4xl overflow-hidden rounded-3xl border border-white/10"
      style={{ background: "#0b0e14" }}
      role="img"
      aria-label="暗い地図の上に活動のピンが灯っていくイメージ"
    >
      {/* 街区グリッド — 本格的な都市レイアウト */}
      <svg
        aria-hidden
        className="absolute inset-0 h-full w-full"
        viewBox="0 0 800 500"
        preserveAspectRatio="none"
      >
        {/* 水平の主要道路 */}
        <line x1="0" y1="120" x2="800" y2="120" stroke="rgba(255,255,255,0.06)" strokeWidth="3" />
        <line x1="0" y1="250" x2="800" y2="250" stroke="rgba(255,255,255,0.08)" strokeWidth="4" />
        <line x1="0" y1="380" x2="800" y2="380" stroke="rgba(255,255,255,0.06)" strokeWidth="3" />

        {/* 垂直の主要道路 */}
        <line x1="200" y1="0" x2="200" y2="500" stroke="rgba(255,255,255,0.06)" strokeWidth="3" />
        <line x1="400" y1="0" x2="400" y2="500" stroke="rgba(255,255,255,0.08)" strokeWidth="4" />
        <line x1="600" y1="0" x2="600" y2="500" stroke="rgba(255,255,255,0.06)" strokeWidth="3" />

        {/* 街区ブロック */}
        {[
          { x: 30, y: 30, w: 150, h: 70 },
          { x: 220, y: 30, w: 160, h: 70 },
          { x: 420, y: 30, w: 160, h: 70 },
          { x: 620, y: 30, w: 150, h: 70 },
          { x: 30, y: 140, w: 150, h: 90 },
          { x: 220, y: 140, w: 160, h: 90 },
          { x: 420, y: 140, w: 160, h: 90 },
          { x: 620, y: 140, w: 150, h: 90 },
          { x: 30, y: 270, w: 150, h: 90 },
          { x: 220, y: 270, w: 160, h: 90 },
          { x: 420, y: 270, w: 160, h: 90 },
          { x: 620, y: 270, w: 150, h: 90 },
          { x: 30, y: 400, w: 150, h: 70 },
          { x: 220, y: 400, w: 160, h: 70 },
          { x: 420, y: 400, w: 160, h: 70 },
          { x: 620, y: 400, w: 150, h: 70 },
        ].map((b, i) => (
          <rect
            key={i}
            x={b.x}
            y={b.y}
            width={b.w}
            height={b.h}
            rx={4}
            fill="rgba(255,255,255,0.018)"
            stroke="rgba(255,255,255,0.04)"
            strokeWidth="1"
          />
        ))}

        {/* 細い路地 */}
        {[
          "M80 0V500",
          "M320 0V500",
          "M520 0V500",
          "M720 0V500",
          "M0 70H800",
          "M0 190H800",
          "M0 320H800",
          "M0 440H800",
        ].map((d, i) => (
          <path key={i} d={d} stroke="rgba(255,255,255,0.025)" strokeWidth="1" />
        ))}

        {/* 河川 — 自然な曲線 */}
        <path
          d="M-10 430 C 120 400, 200 460, 350 420 S 580 370, 810 400"
          fill="none"
          stroke="rgba(20,80,90,0.55)"
          strokeWidth="22"
          strokeLinecap="round"
        />
        <path
          d="M-10 430 C 120 400, 200 460, 350 420 S 580 370, 810 400"
          fill="none"
          stroke="rgba(30,120,130,0.20)"
          strokeWidth="40"
          strokeLinecap="round"
        />
      </svg>

      {/* クラスタ（集合ピン） */}
      <motion.div
        initial={reduce ? { opacity: 0 } : { opacity: 0, scale: 0.6 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: reduce ? 0 : 0.7, duration: 0.5 }}
        className="absolute left-[50%] top-[30%] z-10 -translate-x-1/2 -translate-y-1/2"
      >
        <span
          className="relative grid h-14 w-14 place-items-center rounded-full font-display text-lg text-black"
          style={{ background: "var(--vc-accent)", boxShadow: "var(--vc-glow-strong)" }}
        >
          12
          {!reduce && (
            <span
              aria-hidden
              className="absolute inset-0 rounded-full border border-lime/60"
              style={{ animation: "vcRing 2.4s ease-out infinite" }}
            />
          )}
        </span>
      </motion.div>

      {/* 活動ピン */}
      {PINS.map((pin) => (
        <motion.div
          key={pin.label}
          initial={reduce ? { opacity: 0 } : { opacity: 0, scale: 0, y: -8 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={
            reduce
              ? { duration: 0.3, delay: pin.delay }
              : { type: "spring", stiffness: 320, damping: 20, delay: pin.delay }
          }
          className="absolute z-10 flex -translate-x-1/2 -translate-y-full flex-col items-center"
          style={{ left: `${pin.x}%`, top: `${pin.y}%` }}
        >
          <span
            className="whitespace-nowrap rounded-md px-2 py-0.5 font-mono text-[10px] tracking-wide"
            style={{
              background: "rgba(11,14,20,0.9)",
              color: "var(--vc-text-secondary)",
              border: "1px solid rgba(255,255,255,0.12)",
            }}
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
