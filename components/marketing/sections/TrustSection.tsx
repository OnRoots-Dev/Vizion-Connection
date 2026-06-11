"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useInView, animate } from "framer-motion";

export interface TrustStats {
  athleteCount: number;
  totalContinuedDays: number;
  cheerCount: number;
}

// 仮数値。後でサーバー側（Supabase集計）から props で実数を渡す。
const DEFAULT_STATS: TrustStats = {
  athleteCount: 320,
  totalContinuedDays: 12800,
  cheerCount: 4600,
};

function CountUp({ to, active, suffix = "" }: { to: number; active: boolean; suffix?: string }) {
  const [value, setValue] = useState(0);

  useEffect(() => {
    if (!active) return;
    const controls = animate(0, to, {
      duration: 1.8,
      ease: [0.16, 1, 0.3, 1],
      onUpdate: (v) => setValue(Math.round(v)),
    });
    return () => controls.stop();
  }, [active, to]);

  return (
    <span>
      {value.toLocaleString("ja-JP")}
      {suffix}
    </span>
  );
}

export function TrustSection({ stats = DEFAULT_STATS }: { stats?: TrustStats }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });

  const items = [
    { label: "登録アスリート", value: stats.athleteCount, suffix: "+" },
    { label: "積み上げられた継続日数", value: stats.totalContinuedDays, suffix: "日" },
    { label: "送られたチアー", value: stats.cheerCount, suffix: "+" },
  ];

  return (
    <section ref={ref} className="border-y border-white/5 bg-[#0B0B0F] px-5 py-16 md:px-10 md:py-24 lg:px-16">
      <div className="mx-auto max-w-[1200px]">
        <motion.p
          initial={{ opacity: 0, y: 14 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7 }}
          className="mb-3 text-center font-display text-[11px] uppercase tracking-[0.45em]"
          style={{ color: "var(--electric)" }}
        >
          Trust
        </motion.p>
        <motion.h2
          initial={{ opacity: 0, y: 14 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 0.1, duration: 0.7 }}
          className="text-center font-display text-[clamp(26px,6vw,44px)] font-black tracking-tight text-white"
        >
          本物が集まる場所。
        </motion.h2>
        <motion.p
          initial={{ opacity: 0, y: 12 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 0.2, duration: 0.7 }}
          className="mx-auto mt-4 max-w-[42ch] text-center font-body text-[clamp(13px,3.4vw,15px)] leading-relaxed text-white/50"
        >
          フォロワー数でも、肩書きでもない。
          続けてきた事実だけが、ここでの信頼になる。
        </motion.p>

        <div className="mt-12 grid grid-cols-1 gap-4 sm:grid-cols-3">
          {items.map((item, i) => (
            <motion.div
              key={item.label}
              initial={{ opacity: 0, y: 24 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: 0.25 + i * 0.12, duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
              className="rounded-2xl border border-white/10 bg-white/[0.03] px-6 py-8 text-center"
            >
              <p
                className="font-display text-[clamp(36px,8vw,52px)] font-black leading-none"
                style={{ color: "var(--electric)", textShadow: "0 0 24px var(--electric-glow)" }}
              >
                <CountUp to={item.value} active={inView} suffix={item.suffix} />
              </p>
              <p className="mt-3 font-body text-[12px] tracking-wide text-white/45">{item.label}</p>
            </motion.div>
          ))}
        </div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={inView ? { opacity: 1 } : {}}
          transition={{ delay: 0.7, duration: 0.8 }}
          className="mt-6 text-center font-mono text-[10px] tracking-[0.2em] text-white/20"
        >
          ※ 数値は集計タイミングにより変動します
        </motion.p>
      </div>
    </section>
  );
}
