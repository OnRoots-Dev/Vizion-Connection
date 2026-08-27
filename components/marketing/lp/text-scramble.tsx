"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";

const CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%&*";

interface TextScrambleProps {
  text: string;
  delay?: number;
  duration?: number;
  className?: string;
  as?: "span" | "p" | "h1" | "h2" | "h3" | "div";
}

export function TextScramble({
  text,
  delay = 0,
  duration = 500,
  className,
  as: Tag = "span",
}: TextScrambleProps) {
  const reduce = useReducedMotion();
  const [display, setDisplay] = useState(reduce ? text : "");
  const frameRef = useRef(0);
  const started = useRef(false);

  useEffect(() => {
    if (reduce) {
      setDisplay(text);
      return;
    }

    const start = () => {
      if (started.current) return;
      started.current = true;

      const len = text.length;
      const step = Math.max(duration / len, 20);
      let frame = 0;

      const tick = () => {
        const progress = frame / (duration / step);
        const revealed = Math.floor(progress * len);
        let result = "";

        for (let i = 0; i < len; i++) {
          if (i < revealed) {
            result += text[i];
          } else if (text[i] === " ") {
            result += " ";
          } else {
            result += CHARS[Math.floor(Math.random() * CHARS.length)];
          }
        }

        setDisplay(result);
        frame++;

        if (frame <= duration / step) {
          frameRef.current = requestAnimationFrame(tick);
        } else {
          setDisplay(text);
        }
      };

      frameRef.current = requestAnimationFrame(tick);
    };

    const timer = setTimeout(start, delay);
    return () => {
      clearTimeout(timer);
      cancelAnimationFrame(frameRef.current);
    };
  }, [text, delay, duration, reduce]);

  return (
    <motion.span
      initial={reduce ? undefined : { opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.2, delay: delay / 1000 }}
      className={className}
      style={{ display: "inline-block" }}
    >
      <Tag className={className}>{display}</Tag>
    </motion.span>
  );
}
