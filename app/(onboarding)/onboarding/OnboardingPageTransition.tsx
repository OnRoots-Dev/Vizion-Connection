"use client";

import { motion, useReducedMotion } from "framer-motion";
import { springDefault, fadeReduced } from "@/lib/motion/apple-springs";

/**
 * オンボーディング各ステップのページ遷移。
 * opacity + わずかな y を spring で。CSS keyframes ではなく interruptible な spring。
 * reduced-motion 時は短いクロスフェードのみ。
 */
export function OnboardingPageTransition({
  stepKey,
  children,
}: {
  stepKey: string | number;
  children: React.ReactNode;
}) {
  const reduce = useReducedMotion();

  return (
    <motion.div
      key={stepKey}
      initial={reduce ? { opacity: 0 } : { opacity: 0, y: 14 }}
      animate={reduce ? { opacity: 1 } : { opacity: 1, y: 0 }}
      exit={reduce ? { opacity: 0 } : { opacity: 0, y: -10 }}
      transition={reduce ? fadeReduced : springDefault}
      style={{ flex: 1, minHeight: 0, display: "flex", flexDirection: "column" }}
    >
      {children}
    </motion.div>
  );
}
