"use client";

import { useRef, useState } from "react";
import { motion, useInView, AnimatePresence } from "framer-motion";

const roles = [
  {
    label: "Athlete",
    color: "#FF5050",
    title: "活動の積み重ねを、見つかる力に。",
    desc: "競技歴や日々の記録をプロフィールに集約し、応援・発見・次の機会につなげます。",
  },
  {
    label: "Trainer",
    color: "#32D278",
    title: "指導とサポートの価値を伝える。",
    desc: "専門性やサポート実績を整理し、選手・チーム・関係者との信頼形成を後押しします。",
  },
  {
    label: "Crew",
    color: "#FFC81E",
    title: "応援が、信頼の記録になる。",
    desc: "ファン、家族、友人、関係者の応援を可視化し、活動を支えるつながりを残します。",
  },
  {
    label: "Business",
    color: "#3C8CFF",
    title: "スポーツ界との接点をつくる。",
    desc: "地域・競技・ロールをもとに、広告・協賛・応援の候補となる人や活動を見つけやすくします。",
  },
];

export function RoleBenefitSection() {
  const [activeIndex, setActiveIndex] = useState(0);
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });
  const activeRole = roles[activeIndex];

  return (
    <section ref={ref} className="border-b border-white/5 bg-[#0D0D12] px-5 py-20 md:px-10 lg:px-16 xl:px-20">
      <div className="mx-auto max-w-[1200px]">
        <motion.p
          initial={{ opacity: 0, y: 14 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7 }}
          className="mb-3 font-display text-[11px] uppercase tracking-[0.45em] text-white/30"
        >
          Role Benefits
        </motion.p>
        <motion.h2
          initial={{ opacity: 0, y: 14 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 0.1, duration: 0.7 }}
          className="mb-10 font-display text-[clamp(28px,3.5vw,48px)] font-black tracking-tight text-white"
        >
          役割ごとに、つながり方が変わる。
        </motion.h2>

        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          {roles.map((role, i) => {
            const active = activeIndex === i;
            return (
              <button
                key={role.label}
                type="button"
                onClick={() => setActiveIndex(i)}
                className="rounded-[3px] border px-4 py-3 font-display text-[11px] font-black uppercase tracking-[0.24em] transition-all"
                style={{
                  borderColor: active ? role.color : "rgba(255,255,255,0.08)",
                  background: active ? `${role.color}16` : "rgba(255,255,255,0.02)",
                  color: active ? role.color : "rgba(255,255,255,0.35)",
                }}
              >
                {role.label}
              </button>
            );
          })}
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={activeRole.label}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.3 }}
            className="mt-6 rounded-[4px] border p-7 md:p-10"
            style={{
              borderColor: `${activeRole.color}35`,
              background: `linear-gradient(135deg, ${activeRole.color}10 0%, rgba(255,255,255,0.02) 60%)`,
            }}
          >
            <p className="mb-2 font-mono text-[10px] uppercase tracking-[0.35em]" style={{ color: activeRole.color }}>
              {activeRole.label}
            </p>
            <h3 className="font-display text-[clamp(24px,3vw,40px)] font-black leading-tight text-white">
              {activeRole.title}
            </h3>
            <p className="mt-4 max-w-[72ch] font-body text-[clamp(13px,1.3vw,16px)] leading-relaxed text-white/55">
              {activeRole.desc}
            </p>
          </motion.div>
        </AnimatePresence>
      </div>
    </section>
  );
}
