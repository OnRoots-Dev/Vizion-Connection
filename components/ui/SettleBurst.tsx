"use client";

// components/ui/SettleBurst.tsx
// 「静かに成立した」ことを伝えるワンショット演出（CheerBurstより控えめ）。
// 単一の薄いリングと "✓" のみ。パーティクル・回転・大きい光量は使わない。
// reduced-motion時は何も描画しない（状態ラベルだけで成立を伝える）。
// 親要素は position:relative にすること。pointer-eventsは無効。

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";

export function SettleBurst({
  trigger,
  color = "#32D278",
}: {
  /** 増加するたびに一度だけ再生（0の場合は非表示） */
  trigger: number;
  color?: string;
}) {
  const reduce = useReducedMotion();
  if (reduce || !trigger) return null;
  return (
    <AnimatePresence>
      {trigger ? (
        <motion.span
          key={`settle-${trigger}`}
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          aria-hidden
          style={{ position: "absolute", inset: 0, pointerEvents: "none", zIndex: 10 }}
        >
          <motion.span
            initial={{ opacity: 0.55, scale: 0.85 }}
            animate={{ opacity: 0, scale: 1.85 }}
            transition={{ duration: 0.72, ease: "easeOut" }}
            style={{
              position: "absolute",
              inset: 0,
              borderRadius: 999,
              border: `1.5px solid ${color}`,
              boxShadow: `0 0 14px ${color}44`,
            }}
          />
          <motion.span
            initial={{ opacity: 0, scale: 0.4 }}
            animate={{ opacity: [0, 1, 1, 0], scale: 1 }}
            transition={{ duration: 0.72, delay: 0.04, times: [0, 0.28, 0.68, 1], ease: "easeOut" }}
            style={{
              position: "absolute",
              left: "50%",
              top: "50%",
              width: 14,
              height: 14,
              marginLeft: -7,
              marginTop: -7,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 11,
              fontWeight: 900,
              color,
              textShadow: `0 0 10px ${color}66`,
            }}
          >
            ✓
          </motion.span>
        </motion.span>
      ) : null}
    </AnimatePresence>
  );
}