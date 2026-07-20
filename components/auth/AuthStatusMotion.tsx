// components/auth/AuthStatusMotion.tsx
// 登録中 / 完了 / メール確認 などのブランド統一ステータスモーション

"use client";

import { motion, useReducedMotion } from "framer-motion";
import { springDefault, springSnap, fadeReduced } from "@/lib/motion/apple-springs";

/** 登録中: 中心の Pulse と同心円の広がり */
export function AuthPulseLoader({ label = "登録しています..." }: { label?: string }) {
  const reduce = useReducedMotion();

  return (
    <div className="flex flex-col items-center gap-5 py-10">
      <div className="relative flex h-28 w-28 items-center justify-center">
        {!reduce &&
          [0, 1, 2].map((i) => (
            <motion.span
              key={i}
              className="absolute inset-0 rounded-full border border-[var(--electric)]"
              style={{ opacity: 0 }}
              animate={{
                scale: [0.55, 1.35],
                opacity: [0.45, 0],
              }}
              transition={{
                duration: 1.8,
                repeat: Infinity,
                ease: "easeOut",
                delay: i * 0.45,
              }}
            />
          ))}
        <motion.div
          className="relative z-10 flex h-14 w-14 items-center justify-center rounded-full"
          style={{
            background: "rgba(200,232,0,0.12)",
            border: "1.5px solid rgba(200,232,0,0.45)",
            boxShadow: "0 0 28px var(--electric-glow)",
          }}
          animate={
            reduce
              ? { opacity: [0.7, 1, 0.7] }
              : { scale: [1, 1.06, 1] }
          }
          transition={
            reduce
              ? { duration: 1.4, repeat: Infinity, ease: "easeInOut" }
              : { duration: 1.4, repeat: Infinity, ease: "easeInOut" }
          }
        >
          <span
            className="font-display text-[15px] font-black tracking-[0.12em] text-[var(--electric)]"
            style={{ letterSpacing: "0.14em" }}
          >
            VZ
          </span>
        </motion.div>
      </div>
      <motion.p
        className="text-sm font-bold text-white/55"
        initial={reduce ? { opacity: 0 } : { opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={reduce ? fadeReduced : springDefault}
      >
        {label}
      </motion.p>
    </div>
  );
}

/** 登録受付完了: スプリングでチェックが着地 */
export function AuthSuccessMark({
  title = "登録を受け付けました",
  subtitle = "認証メールをご確認ください。移動します…",
}: {
  title?: string;
  subtitle?: string;
}) {
  const reduce = useReducedMotion();

  return (
    <div className="flex flex-col items-center gap-4 py-10">
      <motion.div
        className="relative flex h-24 w-24 items-center justify-center"
        initial={reduce ? { opacity: 0 } : { opacity: 0, scale: 0.72 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={reduce ? fadeReduced : { type: "spring", stiffness: 380, damping: 22, mass: 0.8 }}
      >
        {!reduce && (
          <motion.span
            className="absolute inset-0 rounded-full"
            style={{
              background: "radial-gradient(circle, rgba(200,232,0,0.28) 0%, transparent 70%)",
            }}
            initial={{ scale: 0.6, opacity: 0.8 }}
            animate={{ scale: 1.6, opacity: 0 }}
            transition={{ duration: 0.9, ease: "easeOut" }}
          />
        )}
        <div
          className="relative flex h-20 w-20 items-center justify-center rounded-full"
          style={{
            background: "linear-gradient(145deg, rgba(200,232,0,0.2), rgba(200,232,0,0.06))",
            border: "1.5px solid rgba(200,232,0,0.4)",
            boxShadow: "0 0 36px var(--electric-glow)",
          }}
        >
          <svg width="36" height="36" viewBox="0 0 24 24" fill="none" aria-hidden>
            <motion.path
              d="M6.5 12.5 10 16l7.5-8"
              stroke="var(--electric)"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
              initial={reduce ? { pathLength: 1 } : { pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={
                reduce
                  ? { duration: 0.2 }
                  : { type: "spring", stiffness: 120, damping: 18, delay: 0.12 }
              }
            />
          </svg>
        </div>
      </motion.div>
      <motion.div
        className="space-y-1.5 text-center"
        initial={reduce ? { opacity: 0 } : { opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={reduce ? fadeReduced : { ...springDefault, delay: 0.08 }}
      >
        <p className="text-lg font-black tracking-[-0.02em] text-white">{title}</p>
        <p className="text-sm text-white/45">{subtitle}</p>
      </motion.div>
    </div>
  );
}

/** thanks / メール確認用のアイコンバッジ */
export function AuthIconBadge({
  kind,
}: {
  kind: "verify" | "verified" | "business";
}) {
  const reduce = useReducedMotion();

  return (
    <motion.div
      className="relative mx-auto flex h-24 w-24 items-center justify-center"
      initial={reduce ? { opacity: 0 } : { opacity: 0, scale: 0.82, y: 12 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={reduce ? fadeReduced : springSnap}
    >
      {!reduce && (
        <motion.span
          className="absolute inset-[-8px] rounded-[32px]"
          style={{
            background: "radial-gradient(circle, rgba(200,232,0,0.18) 0%, transparent 70%)",
          }}
          animate={{ opacity: [0.45, 0.75, 0.45], scale: [1, 1.04, 1] }}
          transition={{ duration: 3.6, repeat: Infinity, ease: "easeInOut" }}
        />
      )}
      <div
        className="relative flex h-24 w-24 items-center justify-center rounded-[28px] text-[var(--electric)]"
        style={{
          background: "linear-gradient(145deg, rgba(200,232,0,0.16), rgba(255,255,255,0.03))",
          border: "1.5px solid rgba(200,232,0,0.32)",
          boxShadow: "0 0 36px var(--electric-glow)",
          backdropFilter: reduce ? "none" : "blur(12px)",
        }}
      >
        {kind === "verify" && (
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" aria-hidden>
            <rect x="3.5" y="5.5" width="17" height="13" rx="2.5" stroke="currentColor" strokeWidth="1.7" />
            <path
              d="M5.5 7.5 12 12.5l6.5-5"
              stroke="currentColor"
              strokeWidth="1.7"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        )}
        {kind === "verified" && (
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" aria-hidden>
            <circle cx="12" cy="12" r="8.5" stroke="currentColor" strokeWidth="1.7" />
            <path
              d="m8.5 12 2.3 2.3 4.7-5.1"
              stroke="currentColor"
              strokeWidth="1.7"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        )}
        {kind === "business" && (
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" aria-hidden>
            <path
              d="M12 3.5 19 7.5v5.2c0 3.7-2.5 6.4-7 7.8-4.5-1.4-7-4.1-7-7.8V7.5l7-4Z"
              stroke="currentColor"
              strokeWidth="1.7"
              strokeLinejoin="round"
            />
            <path d="M9 12h6M12 9v6" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
          </svg>
        )}
      </div>
    </motion.div>
  );
}
