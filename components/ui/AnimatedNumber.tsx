"use client";

import { useEffect, useRef } from "react";
import {
  motion,
  useMotionValue,
  useSpring,
  useReducedMotion,
  useTransform,
} from "framer-motion";
import { springSnap } from "@/lib/motion/apple-springs";

type Props = {
  value: number;
  /** フォーマット（既定: 桁区切り） */
  format?: (n: number) => string;
  className?: string;
  style?: React.CSSProperties;
};

/**
 * 数値変化を spring で補間。常に「今の表示値」から次の target へ向かい、
 * 途中で value が変わっても中断可能（presentation value から再ターゲット）。
 */
export function AnimatedNumber({
  value,
  format = (n) => Math.round(n).toLocaleString("en-US"),
  className,
  style,
}: Props) {
  const reduce = useReducedMotion();
  const mv = useMotionValue(value);
  const spring = useSpring(mv, {
    stiffness: springSnap.stiffness as number,
    damping: springSnap.damping as number,
    mass: springSnap.mass as number,
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
