"use client";

// components/ui/SheetReveal.tsx
// シート/ドロワー内コンテンツの「カードが拡大して定着する」ような軽量トランジション。
// 呼び出し側で key をアイテムIDにして切替時に再演出させる。reduced-motion時は短いフェードのみ。

import { motion, useReducedMotion } from "framer-motion";

export function SheetReveal({ children }: { children: React.ReactNode }) {
  const reduce = useReducedMotion();
  return (
    <motion.div
      initial={reduce ? { opacity: 0 } : { opacity: 0, y: 8, scale: 0.985 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={
        reduce
          ? { duration: 0.15 }
          : { type: "spring", stiffness: 380, damping: 34, mass: 0.9 }
      }
    >
      {children}
    </motion.div>
  );
}