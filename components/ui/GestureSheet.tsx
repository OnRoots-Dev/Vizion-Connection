"use client";

import { useCallback } from "react";
import {
  AnimatePresence,
  motion,
  useDragControls,
  useReducedMotion,
  type PanInfo,
} from "framer-motion";
import { projectMomentum, springSheet, fadeReduced } from "@/lib/motion/apple-springs";

type Props = {
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
  /** bottom sheet（既定） or right drawer */
  side?: "bottom" | "right";
  className?: string;
  dismissOffset?: number;
};

/**
 * スプリング物理ベースのジェスチャー駆動シート（Apple Design §3–6）。
 * - ドラッグ 1:1（handle から開始、grab offset 維持）
 * - リリース時 velocity を引き継ぎ momentum projection で開/閉
 * - spring は interruptible（途中で掴み直し可）
 * - enter/exit は同じ軸（空間的一貫性）
 */
export function GestureSheet({
  open,
  onClose,
  children,
  side = "bottom",
  className,
  dismissOffset = 120,
}: Props) {
  const reduce = useReducedMotion();
  const dragControls = useDragControls();
  const isBottom = side === "bottom";

  const handleDragEnd = useCallback(
    (_: unknown, info: PanInfo) => {
      if (isBottom) {
        const v = info.velocity.y;
        const projected = info.offset.y + projectMomentum(Math.max(0, v));
        if (v > 500 || projected > dismissOffset || info.offset.y > dismissOffset) {
          onClose();
        }
        return;
      }
      const v = info.velocity.x;
      const projected = info.offset.x + projectMomentum(Math.max(0, v));
      if (v > 500 || projected > dismissOffset || info.offset.x > dismissOffset) {
        onClose();
      }
    },
    [dismissOffset, isBottom, onClose],
  );

  return (
    <AnimatePresence>
      {open ? (
        <>
          <motion.button
            type="button"
            aria-label="閉じる"
            className="fixed inset-0 z-[80] border-none bg-black/55"
            style={{
              backdropFilter: reduce ? "none" : "blur(10px) saturate(150%)",
              WebkitBackdropFilter: reduce ? "none" : "blur(10px) saturate(150%)",
            }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={reduce ? fadeReduced : { duration: 0.22 }}
            onClick={onClose}
          />
          <motion.div
            role="dialog"
            aria-modal="true"
            className={[
              "fixed z-[81] flex flex-col overflow-hidden border border-white/10",
              "bg-[rgba(10,10,10,0.88)] shadow-[0_28px_90px_rgba(0,0,0,0.55)]",
              isBottom
                ? "inset-x-0 bottom-0 max-h-[min(92dvh,920px)] rounded-t-[24px] sm:inset-x-auto sm:left-1/2 sm:bottom-6 sm:w-full sm:max-w-[760px] sm:-translate-x-1/2 sm:rounded-[24px]"
                : "inset-y-0 right-0 h-full w-full max-w-[min(100vw,480px)] border-l",
              className ?? "",
            ].join(" ")}
            style={{
              backdropFilter: reduce ? "none" : "blur(28px) saturate(170%)",
              WebkitBackdropFilter: reduce ? "none" : "blur(28px) saturate(170%)",
              willChange: "transform",
            }}
            initial={
              reduce
                ? { opacity: 0 }
                : isBottom
                  ? { y: "105%", opacity: 1 }
                  : { x: "105%", opacity: 1 }
            }
            animate={
              reduce
                ? { opacity: 1 }
                : isBottom
                  ? { y: 0, opacity: 1 }
                  : { x: 0, opacity: 1 }
            }
            exit={
              reduce
                ? { opacity: 0 }
                : isBottom
                  ? { y: "110%", opacity: 1 }
                  : { x: "110%", opacity: 1 }
            }
            transition={reduce ? fadeReduced : springSheet}
            drag={reduce ? false : isBottom ? "y" : "x"}
            dragControls={dragControls}
            dragListener={false}
            dragConstraints={isBottom ? { top: 0, bottom: 0 } : { left: 0, right: 0 }}
            dragElastic={isBottom ? { top: 0.06, bottom: 0.62 } : { left: 0.06, right: 0.62 }}
            dragMomentum={false}
            onDragEnd={handleDragEnd}
          >
            <div
              className="flex shrink-0 cursor-grab flex-col items-center pb-1 pt-2 active:cursor-grabbing"
              onPointerDown={(e) => {
                e.preventDefault();
                dragControls.start(e);
              }}
              style={{ touchAction: "none" }}
            >
              <div className="h-1 w-10 rounded-full bg-white/28" aria-hidden />
            </div>
            <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain">
              {children}
            </div>
          </motion.div>
        </>
      ) : null}
    </AnimatePresence>
  );
}
