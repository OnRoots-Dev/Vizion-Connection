// app/u/[slug]/components/NeonCountUp.tsx
// ゲームのステータス画面のようなカウントアップ数値。
// ビューポート進入時に 0 → value をスプリングで駆け上がり、
// value の更新（リアルタイムCheer等）にも同じスプリングで追従する。
// 目標値に到達した瞬間、一拍だけスケールが「ポン」と跳ねて達成感を出す。
// prefers-reduced-motion 時はアニメーションせず即値表示。
"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useInView, useMotionValue, useReducedMotion, useSpring } from "framer-motion";
import { MOTION } from "@/lib/design/tokens";

export default function NeonCountUp({ value }: { value: number }) {
    const ref = useRef<HTMLSpanElement>(null);
    const inView = useInView(ref, { once: true, margin: "-40px" });
    const reduceMotion = useReducedMotion();
    const motionValue = useMotionValue(0);
    const spring = useSpring(motionValue, { stiffness: 90, damping: 24 });
    const [display, setDisplay] = useState(reduceMotion ? value : 0);
    const [settledPulse, setSettledPulse] = useState(0);
    const startedRef = useRef(false);

    useEffect(() => {
        if (reduceMotion) {
            setDisplay(value);
            return;
        }
        if (inView) {
            startedRef.current = true;
            motionValue.set(value);
        }
    }, [inView, value, motionValue, reduceMotion]);

    useEffect(() => {
        if (reduceMotion) return;
        return spring.on("change", (v) => {
            const rounded = Math.round(v);
            setDisplay(rounded);
            // 到達判定 — 値がターゲットに噛み合った瞬間に1回だけパルス
            if (startedRef.current && rounded === value && Math.abs(v - value) < 0.5) {
                startedRef.current = false;
                setSettledPulse((n) => n + 1);
            }
        });
    }, [spring, value, reduceMotion]);

    // 外部更新（リアルタイムCheer等）でも再パルスさせる
    useEffect(() => {
        if (!reduceMotion && inView) startedRef.current = true;
    }, [value, inView, reduceMotion]);

    return (
        <motion.span
            ref={ref}
            animate={settledPulse && !reduceMotion ? { scale: [1, 1.08, 1] } : undefined}
            transition={MOTION.pop}
            style={{ display: "inline-block", fontVariantNumeric: "tabular-nums", willChange: "transform" }}
        >
            {display.toLocaleString()}
        </motion.span>
    );
}
