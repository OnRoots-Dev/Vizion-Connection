"use client";

import { motion, useReducedMotion } from "framer-motion";
import { springDefault, springSnap, fadeReduced } from "@/lib/motion/apple-springs";

// Journey ステップは MVP スコープ外(Journey機能封印)のため省略: プロフィール→DAY 0→招待
const STEPS = [
  { num: 1, label: "プロフィール" },
  { num: 2, label: "DAY 0" },
  { num: 3, label: "招待" },
];

/**
 * ステップ間は spring で「現在の見た目」から次へ。
 * layout アニメーションにより中断可能な遷移を保つ。
 */
export function OnboardingStepBar({ current }: { current: number }) {
  const reduce = useReducedMotion();

  return (
    <div style={{ display: "flex", alignItems: "flex-start", width: "100%", padding: "8px 0 0" }}>
      {STEPS.map((step, i) => {
        const done = step.num < current;
        const active = step.num === current;
        return (
          <div key={step.num} style={{ display: "flex", alignItems: "center", flex: 1, minWidth: 0 }}>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4, flexShrink: 0 }}>
              <motion.div
                layout
                animate={{
                  scale: active ? 1.06 : 1,
                  backgroundColor: done || active ? "var(--electric, #00c2ff)" : "rgba(255,255,255,0.08)",
                  borderColor: active ? "var(--electric, #00c2ff)" : done ? "transparent" : "rgba(255,255,255,0.15)",
                }}
                transition={reduce ? fadeReduced : springSnap}
                style={{
                  width: 26,
                  height: 26,
                  borderRadius: "50%",
                  borderWidth: active ? 2 : done ? 0 : 1,
                  borderStyle: "solid",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 10,
                  fontWeight: 900,
                  color: done || active ? "#000" : "rgba(255,255,255,0.35)",
                  boxShadow: active ? "0 0 14px var(--electric-glow, rgba(0,194,255,0.45))" : "none",
                }}
              >
                {done ? "✓" : step.num}
              </motion.div>
              <motion.span
                animate={{
                  color: active
                    ? "var(--electric, #00c2ff)"
                    : done
                      ? "rgba(0,194,255,0.6)"
                      : "rgba(255,255,255,0.28)",
                  fontWeight: active ? 900 : 500,
                }}
                transition={reduce ? fadeReduced : springDefault}
                style={{
                  fontSize: 8,
                  letterSpacing: "0.04em",
                  whiteSpace: "nowrap",
                }}
              >
                {step.label}
              </motion.span>
            </div>
            {i < STEPS.length - 1 && (
              <motion.div
                animate={{
                  backgroundColor: done ? "rgba(0,194,255,0.5)" : "rgba(255,255,255,0.10)",
                  scaleX: done ? 1 : 0.96,
                }}
                transition={reduce ? fadeReduced : springDefault}
                style={{
                  flex: 1,
                  minWidth: 8,
                  height: 1,
                  margin: "0 4px",
                  marginBottom: 16,
                  originX: 0,
                }}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}
