"use client";

import { useReducedMotion } from "framer-motion";

/**
 * LP背景の浮遊アニメーション。
 * ドットがゆっくり浮き沈みし、マップ上の活動拠点を連想させる。
 * CSSアニメーションのみ。prefers-reduced-motion では非表示。
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
  { x: 8,  y: 15, size: 5,  delay: 0,   duration: 7,   color: "rgba(200,232,0,0.35)" },
  { x: 15, y: 45, size: 4,  delay: 1.2, duration: 9,   color: "rgba(200,232,0,0.25)" },
  { x: 25, y: 70, size: 7,  delay: 3,   duration: 8,   color: "rgba(60,140,255,0.30)" },
  { x: 35, y: 20, size: 4,  delay: 0.5, duration: 10,  color: "rgba(200,232,0,0.22)" },
  { x: 42, y: 55, size: 5,  delay: 2,   duration: 7.5, color: "rgba(60,140,255,0.28)" },
  { x: 55, y: 80, size: 4,  delay: 4,   duration: 9,   color: "rgba(200,232,0,0.30)" },
  { x: 62, y: 12, size: 5,  delay: 1.8, duration: 8.5, color: "rgba(60,140,255,0.22)" },
  { x: 70, y: 40, size: 4,  delay: 0.8, duration: 11,  color: "rgba(200,232,0,0.24)" },
  { x: 78, y: 65, size: 7,  delay: 2.5, duration: 7,   color: "rgba(60,140,255,0.30)" },
  { x: 88, y: 30, size: 4,  delay: 3.5, duration: 9.5, color: "rgba(200,232,0,0.26)" },
  { x: 92, y: 75, size: 5,  delay: 1,   duration: 8,   color: "rgba(60,140,255,0.24)" },
  { x: 50, y: 35, size: 4,  delay: 4.5, duration: 10,  color: "rgba(200,232,0,0.20)" },
  { x: 3,  y: 85, size: 6,  delay: 2.2, duration: 8,   color: "rgba(60,140,255,0.25)" },
  { x: 95, y: 10, size: 5,  delay: 0.3, duration: 9,   color: "rgba(200,232,0,0.28)" },
  { x: 45, y: 90, size: 6,  delay: 3.8, duration: 7.5, color: "rgba(60,140,255,0.22)" },
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
            boxShadow: `0 0 ${dot.size * 3}px ${dot.color}`,
            animation: `lpFloat ${dot.duration}s ease-in-out ${dot.delay}s infinite alternate`,
          }}
        />
      ))}
      {/* gradient sweep */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 50% 35% at 25% 45%, rgba(200,232,0,0.08), transparent)," +
            "radial-gradient(ellipse 45% 30% at 75% 55%, rgba(60,140,255,0.06), transparent)",
          animation: "lpSweep 16s ease-in-out infinite alternate",
        }}
      />
    </div>
  );
}
