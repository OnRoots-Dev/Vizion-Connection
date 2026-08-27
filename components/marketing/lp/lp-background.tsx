"use client";

import { useReducedMotion } from "framer-motion";

/**
 * LP背景の浮遊アニメーション。
 * 小さなドットがゆっくり浮き沈みし、マップ上の活動を連想させる。
 * CSSアニメーションのみ（JS負荷ゼロ）。prefers-reduced-motion では非表示。
 */

interface Dot {
  x: number;
  y: number;
  size: number;
  delay: number;
  duration: number;
  color: string;
}

const DOTS: Dot[] = [
  { x: 8, y: 15, size: 3, delay: 0, duration: 7, color: "rgba(200,232,0,0.12)" },
  { x: 15, y: 45, size: 2, delay: 1.2, duration: 9, color: "rgba(200,232,0,0.08)" },
  { x: 25, y: 70, size: 4, delay: 3, duration: 8, color: "rgba(60,140,255,0.10)" },
  { x: 35, y: 20, size: 2, delay: 0.5, duration: 10, color: "rgba(200,232,0,0.06)" },
  { x: 42, y: 55, size: 3, delay: 2, duration: 7.5, color: "rgba(60,140,255,0.08)" },
  { x: 55, y: 80, size: 2, delay: 4, duration: 9, color: "rgba(200,232,0,0.10)" },
  { x: 62, y: 12, size: 3, delay: 1.8, duration: 8.5, color: "rgba(60,140,255,0.06)" },
  { x: 70, y: 40, size: 2, delay: 0.8, duration: 11, color: "rgba(200,232,0,0.07)" },
  { x: 78, y: 65, size: 4, delay: 2.5, duration: 7, color: "rgba(60,140,255,0.09)" },
  { x: 88, y: 30, size: 2, delay: 3.5, duration: 9.5, color: "rgba(200,232,0,0.08)" },
  { x: 92, y: 75, size: 3, delay: 1, duration: 8, color: "rgba(60,140,255,0.07)" },
  { x: 50, y: 35, size: 2, delay: 4.5, duration: 10, color: "rgba(200,232,0,0.05)" },
];

export function LpBackground() {
  const reduce = useReducedMotion();
  if (reduce) return null;

  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
      {DOTS.map((dot, i) => (
        <span
          key={i}
          className="absolute rounded-full"
          style={{
            left: `${dot.x}%`,
            top: `${dot.y}%`,
            width: dot.size,
            height: dot.size,
            background: dot.color,
            animation: `lpFloat ${dot.duration}s ease-in-out ${dot.delay}s infinite alternate`,
          }}
        />
      ))}
      {/* subtle gradient sweep */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          background:
            "radial-gradient(ellipse 60% 40% at 30% 50%, rgba(200,232,0,0.15), transparent)," +
            "radial-gradient(ellipse 50% 35% at 70% 60%, rgba(60,140,255,0.12), transparent)",
          animation: "lpSweep 20s ease-in-out infinite alternate",
        }}
      />
    </div>
  );
}
