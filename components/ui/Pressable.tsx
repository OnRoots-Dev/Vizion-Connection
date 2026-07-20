"use client";

import { motion, useReducedMotion, type HTMLMotionProps } from "framer-motion";
import { forwardRef } from "react";
import { cn } from "@/lib/utils";

const PRESS_SCALE = 0.97;

type Props = HTMLMotionProps<"button"> & {
  asChild?: boolean;
};

/**
 * 押下時 scale(0.97) の即時フィードバック。
 * pointer-down 相当の whileTap で latency を殺す（Apple Design §1 Response）。
 */
export const Pressable = forwardRef<HTMLButtonElement, Props>(
  function Pressable({ className, disabled, children, ...props }, ref) {
    const reduce = useReducedMotion();
    return (
      <motion.button
        ref={ref}
        type="button"
        disabled={disabled}
        whileTap={disabled || reduce ? undefined : { scale: PRESS_SCALE }}
        transition={{ type: "spring", stiffness: 600, damping: 32, mass: 0.5 }}
        className={cn(
          "select-none outline-none",
          "disabled:pointer-events-none disabled:opacity-50",
          className,
        )}
        {...props}
      >
        {children}
      </motion.button>
    );
  },
);

export { PRESS_SCALE };
