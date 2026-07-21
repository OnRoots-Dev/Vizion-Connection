"use client";

import { motion, useReducedMotion, type HTMLMotionProps } from "framer-motion";
import { forwardRef } from "react";
import { INTERACTION } from "@/lib/design/tokens";
import { cn } from "@/lib/utils";

/** 押下 scale — INTERACTION.press.scale のエイリアス（既存 import 互換） */
const PRESS_SCALE = INTERACTION.press.scale;

type Props = HTMLMotionProps<"button"> & {
  asChild?: boolean;
};

/**
 * 押下時 scale(INTERACTION.press.scale) の即時フィードバック。
 * pointer-down 相当の whileTap で latency を殺す（Apple Design §1 Response）。
 * scale / spring / hover / 角丸は lib/design/tokens.ts の INTERACTION が正。
 */
export const Pressable = forwardRef<HTMLButtonElement, Props>(
  function Pressable({ className, disabled, children, style, ...props }, ref) {
    const reduce = useReducedMotion();
    return (
      <motion.button
        ref={ref}
        type="button"
        disabled={disabled}
        whileTap={disabled || reduce ? undefined : { scale: INTERACTION.press.scale }}
        whileHover={
          disabled || reduce
            ? undefined
            : {
                y: INTERACTION.hover.y,
                scale: INTERACTION.hover.scale,
              }
        }
        transition={INTERACTION.press.transition}
        className={cn(
          "select-none outline-none",
          "disabled:pointer-events-none disabled:opacity-50",
          className,
        )}
        style={{
          borderRadius: INTERACTION.radius.button,
          ...style,
        }}
        {...props}
      >
        {children}
      </motion.button>
    );
  },
);

export { PRESS_SCALE };
