// lib/motion/apple-springs.ts
// Apple Design 準拠 spring プリセット（Framer Motion / Motion）
// 正本は lib/design/tokens.ts の INTERACTION / SPRING_* 。ここは re-export + シート専用。

import type { Transition } from "framer-motion";
import {
  INTERACTION,
  SPRING_CARD_ENTER,
  SPRING_PAGE,
  SPRING_PRESS,
} from "@/lib/design/tokens";

/** 既定 UI: critically damped（バウンスなし）= 画面遷移・レイアウト */
export const springDefault: Transition = { ...SPRING_PAGE };

/** シート / ドロワー: やや速い */
export const springSheet: Transition = {
  type: "spring",
  stiffness: 420,
  damping: 36,
  mass: 0.85,
};

/** 数値・小さな要素のスナップ = カード入場 */
export const springSnap: Transition = { ...SPRING_CARD_ENTER };

/** 押下（whileTap）= INTERACTION.press.transition */
export const springPress: Transition = { ...SPRING_PRESS };

/** reduced-motion 時: 短いクロスフェード */
export const fadeReduced: Transition = { ...INTERACTION.transition.reduced };

export function projectMomentum(
  initialVelocityPxPerSec: number,
  decelerationRate = 0.998,
): number {
  return ((initialVelocityPxPerSec / 1000) * decelerationRate) / (1 - decelerationRate);
}
