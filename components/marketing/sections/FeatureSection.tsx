"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";

const features = [
  {
    label: "Profile",
    title: "プロフィールで役割を示す",
    desc: "競技・活動・実績をひとつにまとめ、あなたの現在地を伝えられます。",
  },
  {
    label: "Card",
    title: "カードで共有する",
    desc: "プロフィールURLを共有するだけで、SNSや外部導線から見つけてもらいやすくなります。",
  },
  {
    label: "Discovery",
    title: "つながりに見つかる",
    desc: "ロールや活動情報をもとに、必要な人・チーム・企業との接点を作ります。",
  },
];

export function FeatureSection() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <section ref={ref} className="border-y border-white/5 bg-[#0B0B0F] px-5 py-20 md:px-10 lg:px-16 xl:px-20">
      <div className="mx-auto max-w-[1200px]">
        <motion.p
          initial={{ opacity: 0, y: 14 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7 }}
          className="mb-3 font-display text-[11px] uppercase tracking-[0.45em] text-[#FFD600]"
        >
          Features
        </motion.p>
        <motion.h2
          initial={{ opacity: 0, y: 14 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 0.1, duration: 0.7 }}
          className="mb-10 font-display text-[clamp(28px,3.5vw,48px)] font-black tracking-tight text-white"
        >
          毎日の活動を、未来につなげる3つの機能
        </motion.h2>
        <div className="grid grid-cols-1 gap-px bg-white/10 md:grid-cols-3">
          {features.map((feature, i) => (
            <motion.div
              key={feature.label}
              initial={{ opacity: 0, y: 20 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: 0.15 + i * 0.1, duration: 0.7 }}
              className="bg-[#0B0B0F] p-7 md:p-9"
            >
              <p className="mb-4 font-mono text-[10px] uppercase tracking-[0.35em] text-[#FFD600]">{feature.label}</p>
              <h3 className="mb-4 font-display text-[clamp(22px,2.4vw,30px)] font-black leading-tight text-white">{feature.title}</h3>
              <p className="font-body text-[clamp(13px,1.2vw,15px)] leading-relaxed text-white/50">{feature.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}