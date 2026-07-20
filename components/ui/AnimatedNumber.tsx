"use client";

import { useEffect, useRef } from "react";
import {
  motion,
  useMotionValue,
  useSpring,
  useReducedMotion,
  useTransform,
} from "framer-motion";

type Props = {
  value: number;
  /** フォーマット（既定: 桁区切り） */
  format?: (n: number) => string;
  className?: string;
  style?: React.CSSProperties;
};

/**
 * 数値変化を spring で補間。
 * - 常に「今の表示値」から次の target へ（presentation 起点・中断可能）
 * - 質量をやや持たせ、慣性が伝わる critically damped 系
 */
export function AnimatedNumber({
  value,
  format = (n) => Math.round(n).toLocaleString("en-US"),
  className,
  style,
}: Props) {
  const reduce = useReducedMotion();
  const mv = useMotionValue(value);
  // 慣性: mass 高め + damping で critically damped 付近（オーバーシュートほぼなし）
  const spring = useSpring(mv, {
    stiffness: 140,
    damping: 24,
    mass: 1.15,
    restDelta: 0.001,
  });
  const display = useTransform(spring, (v) => format(v));
  const first = useRef(true);

  useEffect(() => {
    if (reduce || first.current) {
      mv.jump(value);
      first.current = false;
      return;
    }
    mv.set(value);
  }, [value, mv, reduce]);

  return (
    <motion.span className={className} style={style}>
      {display}
    </motion.span>
  );
}
