// components/auth/AuthAmbientBg.tsx
// 登録・thanks 等の auth 画面向け。控えめな Pulse 発光 + グリッド。

"use client";

import { useReducedMotion } from "framer-motion";

/**
 * 背景専用。pointer-events: none。
 * reduced-motion 時は静止したグローのみ。
 */
export function AuthAmbientBg() {
  const reduce = useReducedMotion();

  return (
    <div
      className="pointer-events-none absolute inset-0 overflow-hidden"
      aria-hidden
    >
      {/* base depth */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 80% 60% at 50% -10%, rgba(200,232,0,0.07) 0%, transparent 55%), radial-gradient(ellipse 70% 50% at 50% 110%, rgba(200,232,0,0.04) 0%, transparent 50%), #07070e",
        }}
      />

      {/* soft grid */}
      <div
        className="absolute inset-0 opacity-[0.35]"
        style={{
          backgroundImage: `
            linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)
          `,
          backgroundSize: "48px 48px",
          maskImage: "radial-gradient(ellipse 70% 60% at 50% 40%, black 20%, transparent 75%)",
          WebkitMaskImage:
            "radial-gradient(ellipse 70% 60% at 50% 40%, black 20%, transparent 75%)",
        }}
      />

      {/* electric orbs — slow, low-amplitude (not near 0.2Hz) */}
      <div
        className={`vc-auth-orb vc-auth-orb-a ${reduce ? "vc-auth-orb--static" : ""}`}
        style={{
          width: 420,
          height: 420,
          top: "8%",
          left: "50%",
          marginLeft: -210,
          background:
            "radial-gradient(circle, rgba(200,232,0,0.16) 0%, rgba(200,232,0,0.04) 40%, transparent 70%)",
        }}
      />
      <div
        className={`vc-auth-orb vc-auth-orb-b ${reduce ? "vc-auth-orb--static" : ""}`}
        style={{
          width: 280,
          height: 280,
          bottom: "12%",
          right: "8%",
          background:
            "radial-gradient(circle, rgba(200,232,0,0.10) 0%, transparent 68%)",
        }}
      />
      <div
        className={`vc-auth-orb vc-auth-orb-c ${reduce ? "vc-auth-orb--static" : ""}`}
        style={{
          width: 220,
          height: 220,
          top: "42%",
          left: "6%",
          background:
            "radial-gradient(circle, rgba(255,107,0,0.06) 0%, transparent 70%)",
        }}
      />

      {/* vignette */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 90% 80% at 50% 50%, transparent 40%, rgba(0,0,0,0.55) 100%)",
        }}
      />
    </div>
  );
}
