// lib/motion/apple-springs.ts
// Apple Design Skill 準拠の spring プリセット（Framer Motion / Motion）

import type { Transition } from "framer-motion";

/** 既定 UI: critically damped（バウンスなし） */
export const springDefault: Transition = {
  type: "spring",
  stiffness: 380,
  damping: 34,
  mass: 0.9,
};

/** シート / ドロワー: やや速い・フリック時のみ軽いバウンスを velocity で表現 */
export const springSheet: Transition = {
  type: "spring",
  stiffness: 420,
  damping: 36,
  mass: 0.85,
};

/** 数値・小さな要素のスナップ */
export const springSnap: Transition = {
  type: "spring",
  stiffness: 520,
  damping: 40,
  mass: 0.7,
};

/** reduced-motion 時: 短いクロスフェード */
export const fadeReduced: Transition = {
  type: "tween",
  duration: 0.2,
  ease: "easeOut",
};

export function projectMomentum(
  initialVelocityPxPerSec: number,
  decelerationRate = 0.998,
): number {
  return ((initialVelocityPxPerSec / 1000) * decelerationRate) / (1 - decelerationRate);
}
