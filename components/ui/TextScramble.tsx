"use client";

// components/ui/TextScramble.tsx
// 数値・見出し用の軽量Text Scramble。1秒未満で収束し、prefers-reduced-motion時は
// スクランブルせず最終テキストを即時表示する。見出しの親フォントをそのまま継承する。

import { useEffect, useRef, useState } from "react";
import { useReducedMotion } from "framer-motion";

const SCRAMBLE_CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

interface TextScrambleProps {
  text: string;
  delay?: number;
  /** 収束まで（ms）。既定 420ms・上限扱い（長い文字列はそれ以下に自動調整）。 */
  duration?: number;
  className?: string;
}

export function TextScramble({ text, delay = 0, duration = 420, className }: TextScrambleProps) {
  const reduce = useReducedMotion();
  const [display, setDisplay] = useState(reduce ? text : "");
  const frameRef = useRef(0);
  const timerRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  useEffect(() => {
    if (reduce) {
      setDisplay(text);
      return;
    }

    const start = () => {
      const len = text.length;
      const stepMs = Math.max(duration / Math.max(len, 10), 24);
      const total = Math.max(Math.ceil(duration / stepMs), 10);
      let frame = 0;

      const tick = () => {
        frame++;
        const progress = Math.min(frame / total, 1);
        const revealed = Math.floor(progress * len);
        let out = "";
        for (let i = 0; i < len; i++) {
          const ch = text[i];
          if (i < revealed) {
            out += ch;
          } else if (ch === " " || ch === "\u3000") {
            out += ch;
          } else {
            out += SCRAMBLE_CHARS[Math.floor(Math.random() * SCRAMBLE_CHARS.length)];
          }
        }
        setDisplay(out);
        if (frame < total) {
          frameRef.current = requestAnimationFrame(tick);
        } else {
          setDisplay(text);
        }
      };

      frameRef.current = requestAnimationFrame(tick);
    };

    timerRef.current = setTimeout(start, delay);
    return () => {
      clearTimeout(timerRef.current);
      cancelAnimationFrame(frameRef.current);
    };
  }, [text, delay, duration, reduce]);

  return (
    <span className={className} style={{ display: "inline-block", fontVariantNumeric: "tabular-nums" }}>
      {reduce ? text : display}
    </span>
  );
}